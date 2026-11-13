/**
 * feedPlan — reglas de «VMC ahora»: qué entra al feed en un día y en qué orden. Es una PROPUESTA en revisión con Julio
 * (ver escenarios.pdf en la raíz del repo); lo confirmado va marcado como tal.
 * Módulo puro (sin React ni imports): lo usan el feed (VmcAhora) y scripts/escenarios-pdf.mjs, así el PDF y la demo
 * salen de la misma fórmula.
 *
 * Ventana del día: 9:00–24:00 (W = 900 min). V = ofertas en vivo, N = negociables, T = V + N (inventario total).
 * La demo reproduce el plan del día en orden, con 45 s entre entradas (confirmado); no son las horas reales.
 */

export type Mode = "vivo" | "negociable";
export type Offer = {
  id: number; mode: Mode; who: string; lot: string; price?: string; city: string; imageSrc: string;
  /** Publicada hoy: sale como «nueva» y no entra a la rotación del día. */
  isNew: boolean;
  /** Hasta cuántas visitas llega (120–500; las muy buenas, 600–800) y qué parte de ellas da me gusta o participa. */
  viewsCap: number; likeRate: number; partRate: number;
  /** Negociaciones que ya tenía al empezar el día (solo negociables publicadas antes de hoy). */
  base: number;
};
export type Kind = "nueva" | "nueva-subascars" | "registro" | "valorizacion" | "ad-valoriza" | "ad-publica" | "propuesta" | "blog" | "rotacion";
export type PlanEntry = {
  key: string; min: number; kind: Kind; offerId?: number;
  /** Negociaciones de la oferta en ese momento (las propuestas reales del día van sumando). */
  count?: number; blog?: number;
  /** Mockup: hoy no hay un hecho real detrás (propuestas y registros, hasta conectarlos). */
  mock?: boolean;
  /** Propuesta simulada: código de oferta aleatorio (no tiene que existir). No lleva foto. */
  code?: number;
  /** Valorización simulada: el auto del aviso. */
  lot?: string;
};
/** Entradas que por ahora son mockups. Las demás muestran datos reales: ofertas publicadas, publicidad y blog de VMC. */
export const MOCK_KINDS: readonly Kind[] = ["propuesta", "registro", "valorizacion"];

export const DAY_START = 9 * 60;
export const DAY_MIN = 15 * 60;
/** Separación entre entradas simuladas (confirmado). Una acción real reinicia la cuenta. */
export const GAP_S = 45;

// ─── Fórmulas ────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Veces que una misma oferta puede rotar en el día: 3 con 1–5 ofertas (≥ 5 h entre una y otra), 1 desde 6 (Julio). */
export const rotationCap = (T: number): number => (T <= 5 ? 3 : 1);
/** Rotaciones por día R(T): 1–5 → 3·T (con 5 ofertas, una por hora) · 6–30 → T (cada una una vez) · > 30 → 30 (por prioridad). */
export function rotationPerDay(T: number): number {
  if (T <= 0) return 0;
  return T <= 5 ? 3 * T : Math.min(T, 30);
}
/** Tope de avisos de propuesta simulados por día según N: 5 (1–4, propuesto) · 8 (5–11, uno cada ~2 h) · 12 (12+). */
export const proposalMax = (N: number): number => (N <= 4 ? 5 : N <= 11 ? 8 : 12);
/** Avisos de propuesta simulados por día P(N) = mín(2·N, tope). Con N = 0 no hay (confirmado). Máx. 2 por oferta al día. */
export const proposalsPerDay = (N: number): number => (N <= 0 ? 0 : Math.min(2 * N, proposalMax(N)));
/** Ofertas publicadas hoy en la demo: con T ≥ 6, una en vivo y una negociable (en producción, solo las reales). Con
 *  menos inventario no se marca ninguna, para que todas roten. */
export const hasNew = (T: number, n: number): boolean => T >= 6 && n > 0;
export const newPerDay = (V: number, N: number): number => Number(hasNew(V + N, V)) + Number(hasNew(V + N, N));
/** Registros mockup por día Rm(T): sin inventario no hay (para que no parezca fake); 1 + ⌊T / 4⌋, hasta 6. */
export const REGISTROS_MAX = 6;
export const registrosPerDay = (T: number): number => (T <= 0 ? 0 : Math.min(REGISTROS_MAX, 1 + Math.floor(T / 4)));
/** Los mockups solo completan lo que falta: mockups del día = máx(0, objetivo − reales del día). */
export const mockupsLeft = (target: number, real: number): number => Math.max(0, target - real);
/** Límites de la publicidad + blog por día. */
export const PROMO_MIN = 6;
export const PROMO_MAX = 15;
/** Publicidad + blog Pr(C) = acotar(⌈C / 2⌉, 6, 15), con C = rotación + propuestas + nuevas + registros: ~1 de cada 3
 *  entradas. Depende de la actividad (no del inventario directo): con poco inventario el feed tiene menos entradas, no más
 *  publicidad. De Pr, 1/3 es blog y el resto alterna las dos publicidades. */
export const promoPerDay = (C: number): number => Math.max(PROMO_MIN, Math.min(PROMO_MAX, Math.ceil(C / 2)));
/** Con N = 0 no hay avisos de propuesta (confirmado) y esos espacios pasan al blog: +2 entradas. */
export const BLOG_SIN_NEGOCIABLES = 2;

export type Counts = {
  V: number; N: number; T: number; nuevas: number; rot: number; rotEvery: number; rotRepeat: number;
  prop: number; propEvery: number; reg: number; val: number; ads: number; blog: number; promo: number; total: number; promoShare: number;
};
export function counts(V: number, N: number, day = 0): Counts {
  const T = V + N;
  const nuevas = newPerDay(V, N);
  const rot = Math.min(rotationPerDay(T), rotationCap(T) * (T - nuevas));
  const prop = proposalsPerDay(N);
  const reg = registrosPerDay(T);
  const base = promoPerDay(rot + prop + nuevas + reg);
  const extra = N === 0 ? BLOG_SIN_NEGOCIABLES : 0;
  const promo = base + extra;
  const blog = Math.round(base / 3) + extra;
  const val = valorizaciones(V, N, day).length; // no entra en la actividad: sumarla movería la publicidad ya definida
  const total = rot + prop + nuevas + reg + val + promo;
  return {
    V, N, T, nuevas, rot, rotEvery: rot ? DAY_MIN / rot : 0, rotRepeat: rot && T - nuevas ? rot / Math.min(T - nuevas, 30) : 0,
    prop, propEvery: prop ? DAY_MIN / prop : 0, reg, val, ads: promo - blog, blog, promo, total, promoShare: promo / total,
  };
}

// ─── Inventario de ejemplo ───────────────────────────────────────────────────────────────────────────────────────────
const POOL: { lot: string; price: string; city: string; imageSrc: string }[] = [
  { lot: "Toyota Yaris 2022", price: "US$ 2,799", city: "Lima", imageSrc: "/producto/index/demo/vehicles/autoplan-yaris.png" },
  { lot: "Kia Rio 2020", price: "US$ 6,300", city: "Lima", imageSrc: "/producto/index/demo/vehicles/mapfre-rio.png" },
  { lot: "Hyundai Tucson 2021", price: "US$ 11,400", city: "Lima", imageSrc: "/producto/index/demo/vehicles/mapfre-tucson.png" },
  { lot: "Toyota Agya 2023", price: "US$ 5,900", city: "Arequipa", imageSrc: "/producto/index/demo/vehicles/autoplan-agya.png" },
  { lot: "Hyundai Grand i10 2021", price: "US$ 2,199", city: "Lima", imageSrc: "/producto/index/demo/vehicles/autoplan-grand-i10.png" },
  { lot: "Toyota Hilux 2019", price: "US$ 14,200", city: "Arequipa", imageSrc: "/producto/index/demo/vehicles/mapfre-pickup.png" },
  { lot: "Jac Refine 2022", price: "US$ 7,900", city: "Lima", imageSrc: "/producto/index/demo/vehicles/autoplan-refine.png" },
  { lot: "Kia Sportage 2020", price: "US$ 8,450", city: "Trujillo", imageSrc: "/producto/index/demo/vehicles/autoplan-suv.png" },
  { lot: "Nissan Sentra 2021", price: "US$ 6,950", city: "Lima", imageSrc: "/producto/index/demo/vehicles/autoplan-sedan.png" },
  { lot: "Toyota Hilux 2020", price: "US$ 18,900", city: "Piura", imageSrc: "/producto/index/demo/vehicles/autoplan-pickup.png" },
  { lot: "Caterpillar 320 2019", price: "US$ 45,000", city: "Lima", imageSrc: "/producto/index/demo/inventory-excavator-v1.png" },
  { lot: "Montacargas Toyota 2018", price: "US$ 8,600", city: "Callao", imageSrc: "/producto/index/demo/inventory-forklift-v1.png" },
];
const EMPRESAS = ["Autoplan", "Mapfre", "Pacífico", "Trupal S.A."];

// ─── Valorizaciones simuladas: juego de números primos ───────────────────────────────────────────────────────────────
/** Minutos posibles entre un aviso y el siguiente. Con estos primos salen siempre entre 3 y 6 avisos al día. */
export const VAL_GAPS = [131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293];
/** Catálogo de los avisos: 8 marcas × 3 modelos, ninguno del inventario de ejemplo (para no parecer un auto en venta del feed). */
export const VAL_CATALOG: readonly [brand: string, models: readonly string[]][] = [
  ["Toyota", ["Corolla", "RAV4", "Fortuner"]], ["Hyundai", ["Accent", "Creta", "Santa Fe"]], ["Kia", ["Picanto", "Cerato", "Sorento"]],
  ["Nissan", ["Versa", "Frontier", "Qashqai"]], ["Suzuki", ["Swift", "Vitara", "Baleno"]], ["Chevrolet", ["Onix", "Tracker", "Captiva"]],
  ["Mazda", ["3", "CX-5", "CX-3"]], ["Volkswagen", ["Virtus", "Jetta", "Tiguan"]],
];
/** Puestos del catálogo que tiene cada día: el máximo de avisos posible (900 / 131 → 6). */
export const VAL_SLOTS = 6;
/** Auto del puesto `i`. No se sortea: el azar no garantiza variedad. Marca cada 8 puestos, modelo cada 24, año cada 7 (2018–2024).
 *  Así un día no repite marca, modelo ni año; un modelo no vuelve en 4 días y la combinación exacta, en 28. */
export function valLot(i: number): string {
  const [brand, models] = VAL_CATALOG[i % VAL_CATALOG.length];
  return `${brand} ${models[Math.floor(i / VAL_CATALOG.length) % models.length]} ${2018 + ((i * 3) % 7)}`;
}
/** Cada turno mezcla el estado con primos y elige el siguiente primo; termina cuando se pasa de las 24:00. La cantidad del
 *  día sale de esa secuencia, no de una fórmula. Pseudoaleatorio a propósito: el mismo día y V, N dan el mismo plan, así el
 *  servidor y el navegador coinciden. `day` cambia la secuencia y los autos; en producción, el número del día. */
export function valorizaciones(V: number, N: number, day = 0): { min: number; lot: string }[] {
  if (V + N <= 0) return [];
  const out: { min: number; lot: string }[] = [];
  let s = (V * 31 + N * 37 + day * 41 + 7) % 100003;
  for (let min = DAY_START; ;) {
    s = (s * 7919 + 104729) % 100003;
    min += VAL_GAPS[s % VAL_GAPS.length];
    if (min >= DAY_START + DAY_MIN) return out;
    out.push({ min, lot: valLot(day * VAL_SLOTS + out.length) });
  }
}
// Artículos del blog, con una portada de los banners de VMC (fondo morado, para que el botón de vidrio se lea encima).
// Regla (27/10): cada banner muestra una foto distinta; ni el blog ni los anuncios repiten las del hero ni las del banner secundario.
export const BLOG = [
  { title: "Cómo funciona una subasta en VMC, paso a paso", detail: "Guía", imageSrc: "/producto/index/banners/vmc/hero-whatsapp-c.jpg", imagePos: "78% 30%" },
  { title: "¿Qué es «Recibe ofertas» y cómo se envía una propuesta?", detail: "Guía", imageSrc: "/producto/index/banners/vmc/hero-negociable-a.jpg", imagePos: "75% 30%" },
  { title: "5 cosas que revisar antes de ofertar por un auto usado", detail: "Consejos", imageSrc: "/producto/index/banners/vmc/publica-moto.jpg", imagePos: "72% 22%" },
  { title: "Documentos para transferir un vehículo en Perú", detail: "Trámites", imageSrc: "/producto/index/banners/vmc/subastop-flota.jpg", imagePos: "62% 40%" },
  { title: "Cómo se fija el precio base de una subasta", detail: "Guía", imageSrc: "/producto/index/banners/vmc/hero-publica-c.jpg", imagePos: "30% 30%" },
];

/** V ofertas en vivo (de las empresas) y N negociables (de SubasCars), con datos estables para un mismo V y N. */
export function buildInventory(V: number, N: number): Offer[] {
  const vivo = Array.from({ length: V }, (_, i): Offer => {
    const isNew = hasNew(V + N, V) && i === 0;
    return { ...POOL[i % POOL.length], id: 51015 + i * 97, mode: "vivo", who: EMPRESAS[i % EMPRESAS.length], isNew,
      viewsCap: i % 6 === 2 ? 600 + ((i * 53) % 200) : 120 + ((i * 137) % 380),
      likeRate: 0.04 + ((i * 7) % 5) / 100, partRate: 0.04 + ((i * 3) % 5) / 100, base: 0 };
  });
  const neg = Array.from({ length: N }, (_, j): Offer => {
    const p = POOL[(j + 5) % POOL.length];
    const isNew = hasNew(V + N, N) && j === 0;
    return { ...p, price: undefined, id: 67942 + j * 113, mode: "negociable", who: "SubasCars", isNew,
      viewsCap: j % 6 === 3 ? 600 + ((j * 71) % 200) : 100 + ((j * 151) % 360),
      likeRate: 0.04 + ((j * 3) % 5) / 100, partRate: 0, base: isNew ? 0 : (j * 3) % 4 };
  });
  return [...vivo, ...neg];
}

/** Intercala en vivo y negociables en proporción (para que la rotación no traiga cinco seguidas del mismo tipo). */
function interleave(offers: Offer[]): Offer[] {
  const a = offers.filter((o) => o.mode === "vivo");
  const b = offers.filter((o) => o.mode === "negociable");
  const out: Offer[] = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (j >= b.length || (i < a.length && i / a.length <= j / b.length)) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out;
}

const spread = (k: number, phase: number): number[] => Array.from({ length: k }, (_, i) => DAY_START + ((i + phase) * DAY_MIN) / k);
export const isPromo = (k: Kind): boolean => k === "ad-valoriza" || k === "ad-publica" || k === "blog";

/** Plan del día (9:00–24:00) ordenado por hora. */
export function planDay(V: number, N: number, day = 0): PlanEntry[] {
  const inv = buildInventory(V, N);
  const c = counts(V, N, day);
  const out: PlanEntry[] = [];
  const seen = new Map<number, number[]>(); // minutos en que salió cada oferta (nueva o rotación)
  const mark = (id: number, min: number) => seen.set(id, [...(seen.get(id) ?? []), min]);

  // Nuevas: la de la empresa a media mañana y la de SubasCars a media tarde.
  const nuevas = inv.filter((o) => o.isNew);
  nuevas.forEach((o, i) => {
    const min = DAY_START + (i === 0 && o.mode === "vivo" ? 100 : 380);
    out.push({ key: `n${o.id}`, min, kind: o.mode === "vivo" ? "nueva" : "nueva-subascars", offerId: o.id });
    mark(o.id, min);
  });
  // Rotación: ofertas que ya estaban publicadas, intercaladas por tipo; con > 30 se muestran las 30 primeras (prioridad).
  const order = interleave(inv.filter((o) => !o.isNew)).slice(0, 30);
  spread(c.rot, 0.02).forEach((min, i) => {
    const o = order[i % order.length];
    out.push({ key: `r${o.id}-${i}`, min, kind: "rotacion", offerId: o.id });
    mark(o.id, min);
  });
  // Propuestas mockup: nadie puede verificarlas, así que llevan un código de oferta aleatorio (que no choca con las reales)
  // y no llevan foto (su oferta no existe). No apuntan a ninguna oferta del feed ni tocan sus contadores. Solo hay si hay negociables (N > 0)
  // y su cantidad sigue a N: con 2 negociables, un código random pasa; sin ninguna, no se inventa de la nada.
  const ids = new Set(inv.map((o) => o.id));
  spread(c.prop, 0.5).forEach((min, i) => {
    let code = 62000 + ((i * 7919 + N * 104729 + V * 31) % 18000);
    while (ids.has(code)) code++;
    ids.add(code);
    out.push({ key: `p${code}`, min, kind: "propuesta", code, mock: true });
  });
  spread(c.reg, 0.3).forEach((min, i) => out.push({ key: `u${i}`, min, kind: "registro", mock: true }));
  valorizaciones(V, N, day).forEach(({ min, lot }, i) => out.push({ key: `z${i}`, min, kind: "valorizacion", lot, mock: true }));
  spread(c.ads, 0.18).forEach((min, i) => out.push({ key: `a${i}`, min, kind: i % 2 ? "ad-publica" : "ad-valoriza" }));
  spread(c.blog, 0.75).forEach((min, i) => out.push({ key: `b${i}`, min, kind: "blog", blog: i % BLOG.length }));
  out.sort((x, y) => x.min - y.min);

  // Sin dos promocionales seguidas: si hay una entrada de actividad en los 30 min siguientes, se adelanta entre ambas
  // (nunca una propuesta, ni una valorización, que perdería su minuto primo, ni una oferta si así queda a menos de 1 h de una propuesta suya).
  for (let i = 1; i < out.length; i++) {
    if (!isPromo(out[i].kind) || !isPromo(out[i - 1].kind)) continue;
    const at = (out[i - 1].min + out[i].min) / 2;
    const j = out.findIndex((e, k) => k > i && !isPromo(e.kind) && e.kind !== "propuesta" && e.kind !== "valorizacion" && e.min - out[i].min <= 30
      && !out.some((p) => p.kind === "propuesta" && p.offerId != null && p.offerId === e.offerId && Math.abs(p.min - at) < 60));
    if (j < 0) continue;
    const [e] = out.splice(j, 1);
    out.splice(i, 0, { ...e, min: at });
  }
  // Negociaciones al momento de cada entrada: solo las propuestas reales (con oferta) suman; las simuladas no tocan ningún
  // contador. Visitas, me gusta y participantes se calculan al mostrar la entrada (`describe`), según el tiempo que pasó.
  const byId = new Map(inv.map((o) => [o.id, o]));
  const extra = new Map<number, number>();
  for (const e of out) {
    const o = e.offerId != null ? byId.get(e.offerId) : undefined;
    if (!o) continue;
    if (e.kind === "propuesta") extra.set(o.id, (extra.get(o.id) ?? 0) + 1);
    if (o.mode === "negociable") e.count = o.base + (extra.get(o.id) ?? 0);
  }
  return out;
}

/** Comprobaciones del plan (para el PDF): promocionales seguidas y la menor distancia entre una propuesta y su oferta en el feed. */
export function checkPlan(plan: PlanEntry[]): { promoRun: number; propNear: number } {
  let run = 0, promoRun = 0, propNear = Infinity;
  for (const e of plan) { run = isPromo(e.kind) ? run + 1 : 0; promoRun = Math.max(promoRun, run); }
  for (const p of plan.filter((e) => e.kind === "propuesta" && e.offerId != null))
    for (const e of plan) if (e !== p && e.offerId === p.offerId && e.kind !== "propuesta") propNear = Math.min(propNear, Math.abs(e.min - p.min));
  return { promoRun, propNear };
}

// ─── Textos ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export type EntryText = {
  author: string; title: string; detail: string; pill: string; color: string; imageSrc?: string;
  /** Publicación de una oferta (nueva o rotación), con los datos de la detail card: «vivo» → me gusta · participantes ·
   *  visitas · compartir; «negociable» → me gusta · negociaciones · visitas · compartir. Sin `mode`, solo compartir. */
  mode?: Mode; likes?: number; count?: number;
  /** Visualizaciones: en las ofertas, las de la detail card; en el resto, cuántas personas vieron la entrada. */
  views: number;
  /** Publicidad: se dibuja como anuncio (foto del banner y botón). `imagePos` encuadra la foto. */
  ad?: boolean; imagePos?: string;
  /** Botón de la publicidad, del blog o de la valorización. Las propuestas y los registros no son clicables. */
  cta?: string;
};
/** Colores de la card de Tipo de oferta: en vivo naranja, negociable cian (también las propuestas, que solo existen en las
 *  negociables). Todo lo demás, morado. */
export const COLORS = { vivo: "#C2410C", negociable: "#00777A", morado: "#7B5CE6", promo: "#3B1782", blog: "#4A2CE0" };

// ─── Contadores en el tiempo ─────────────────────────────────────────────────────────────────────────────────────────
// Los números cuadran con la hora de la entrada: cuentan desde que sale en el feed. Arrancan en un valor de inicio y crecen
// hacia su tope: visitas(t) = inicio + (tope − inicio) × (1 − e^(−t / τ)).
const grow = (cap: number, min: number, tau: number) => Math.floor(cap * (1 - Math.exp(-Math.max(0, min) / tau)));
const hash = (key: string) => ([...key].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100003, 7) * 7919) % 100003;
/** Inicio, tope y τ (minutos) de las visitas de cada tipo de entrada. */
function viewsModel(e: PlanEntry, o: Offer | undefined): [start: number, cap: number, tau: number] {
  const h = hash(e.key);
  if (e.kind === "rotacion" && o) return [30 + (h % 31), o.viewsCap, 360]; // la oferta ya era conocida: 30–60 al salir
  if ((e.kind === "nueva" || e.kind === "nueva-subascars") && o) return [0, o.viewsCap, 360]; // recién publicada: 0
  if (e.kind === "ad-valoriza" || e.kind === "ad-publica") return [8 + (h % 8), 120 + (h % 180), 240];
  if (e.kind === "blog") return [5 + (h % 8), 80 + (h % 120), 300];
  return [0, 40 + (h % 160), 180]; // propuestas, registros y valorizaciones
}
/** Visitas de una entrada que salió hace `sinceMin` minutos. */
export function entryViews(e: PlanEntry, o: Offer | undefined, sinceMin: number): number {
  const [start, cap, tau] = viewsModel(e, o);
  return start + grow(cap - start, sinceMin, tau);
}
/** Me gusta y participantes de una oferta: una parte (4–8 %) de sus visitas. */
export function offerStats(o: Offer, views: number): { likes: number; participants: number } {
  return { likes: Math.floor(views * o.likeRate), participants: Math.floor(views * o.partRate) };
}

/** Textos y contadores de una entrada que salió hace `sinceMin` minutos (en la demo, minutos simulados). */
export function describe(e: PlanEntry, inv: Offer[], sinceMin = 0): EntryText {
  const t = describeEntry(e, inv);
  const o = inv.find((x) => x.id === e.offerId);
  const views = entryViews(e, o, sinceMin);
  if (!t.mode || !o) return { ...t, views };
  const st = offerStats(o, views);
  return { ...t, views, likes: st.likes, count: o.mode === "vivo" ? st.participants : e.count ?? o.base };
}
function describeEntry(e: PlanEntry, inv: Offer[]): Omit<EntryText, "views"> {
  const o = inv.find((x) => x.id === e.offerId);
  const tag = (m: Mode) => (m === "vivo" ? "En vivo" : "Recibe ofertas");
  const offer = o ? { imageSrc: o.imageSrc, mode: o.mode } : {};
  switch (e.kind) {
    case "nueva":
    case "nueva-subascars":
      return { author: o!.who, title: `Publicó una nueva oferta ${o!.mode === "vivo" ? "en vivo" : "que recibe ofertas"}: ${o!.lot}`,
        detail: `OFERTA ${o!.id} · ${o!.city}${o!.price ? ` · Base ${o!.price}` : " · Recibe propuestas"}`, pill: `Nueva · ${tag(o!.mode)}`, color: COLORS[o!.mode], ...offer };
    case "rotacion":
      return { author: o!.who, title: `Disponible ${o!.mode === "vivo" ? "en vivo" : "y recibe ofertas"}: ${o!.lot}`,
        detail: `OFERTA ${o!.id} · ${o!.city}${o!.price ? ` · Base ${o!.price}` : ""}`, pill: tag(o!.mode), color: COLORS[o!.mode], ...offer };
    case "propuesta":
      // Por privacidad, sin el usuario que la envió. Foto solo si es real (apunta a una oferta que existe); la simulada no
      // lleva foto, porque su oferta no existe.
      return { author: "VMC", title: `Se ha enviado una propuesta a la OFERTA ${o?.id ?? e.code}`, detail: o ? `${o.lot} · Recibe ofertas` : "Recibe ofertas",
        pill: "Propuesta enviada", color: COLORS.negociable, imageSrc: o?.imageSrc };
    case "registro":
      return { author: "VMC", title: "Se registró un nuevo usuario en VMC", detail: "", pill: "Nuevo usuario", color: COLORS.morado };
    case "valorizacion":
      // Por privacidad, sin el usuario ni el monto. Sin foto, como la propuesta simulada: este auto no existe.
      return { author: "VMC", title: `Se valorizó un ${e.lot} en VMC`, detail: "¿Cuánto vale el tuyo?", pill: "Valorización", color: COLORS.morado, cta: "Valorizar" };
    case "ad-valoriza":
      return { author: "VMC", title: "Valoriza tu auto en VMC", detail: "Descubre cuánto vale tu auto en minutos, gratis.", pill: "Publicidad",
        color: COLORS.promo, imageSrc: "/producto/index/banners/vmc/valoriza-auto.jpg", imagePos: "75% 30%", cta: "Valorizar", ad: true };
    case "ad-publica":
      return { author: "VMC", title: "Publica tu auto en VMC y recibe ofertas", detail: "Empresas y compradores verificados.", pill: "Publicidad",
        color: COLORS.promo, imageSrc: "/producto/index/banners/vmc/hero-publica-d.jpg", imagePos: "22% 55%", cta: "Publicar", ad: true };
    case "blog":
      return { author: "Blog VMC", ...BLOG[e.blog ?? 0], pill: "Blog", color: COLORS.blog, cta: "Leer" };
  }
}

export const fmtMin = (min: number): string => `${Math.floor(min / 60) % 24}:${String(Math.floor(min % 60)).padStart(2, "0")}`;

// ─── Escenarios para el control de QA ────────────────────────────────────────────────────────────────────────────────
export const SCENARIOS: { id: string; V: number; N: number; label: string; hint: string }[] = [
  { id: "s0", V: 0, N: 0, label: "0 ofertas", hint: "Sin inventario" },
  { id: "n1", V: 0, N: 1, label: "1 Recibe ofertas", hint: "0 en vivo" },
  { id: "n5", V: 0, N: 5, label: "5 Recibe ofertas", hint: "Rotan cada hora" },
  { id: "v3n2", V: 3, N: 2, label: "3 + 2", hint: "En vivo + Recibe ofertas" },
  { id: "v8n2", V: 8, N: 2, label: "8 + 2", hint: "Ejemplo del documento" },
  { id: "n10", V: 0, N: 10, label: "10 Recibe ofertas", hint: "Solo Recibe ofertas" },
  { id: "v10", V: 10, N: 0, label: "10 en vivo", hint: "Sin Recibe ofertas" },
  { id: "v6n6", V: 6, N: 6, label: "6 + 6", hint: "12 ofertas" },
  { id: "v15n15", V: 15, N: 15, label: "15 + 15", hint: "30 ofertas" },
];
export const DEFAULT_SCENARIO = "v8n2";
