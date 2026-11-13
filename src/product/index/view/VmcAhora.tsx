"use client";

/**
 * VmcAhora — feed «VMC ahora» (Secondary Banner, 236 × 388). Las entradas salen del plan del día de feedPlan.ts
 * (rotación del inventario, propuestas enviadas, nuevas ofertas, registros, valorizaciones, publicidad y blog, según V y N) y la demo
 * lo reproduce en orden con 45 s entre entradas simuladas; una acción real entra al instante y reinicia los 45 s.
 * Un solo reloj para toda la página (todas las vistas muestran el mismo feed); se pausa con el puntero encima.
 * Contenido de ejemplo. Vistas:
 *  · timeline  estilo X/Twitter: avatar, verificado, texto, foto en la primera, acciones por tipo de oferta.
 *  · normal    listado: foto, insignia, lote, precio y una línea gris con autor · tiempo.
 * Acciones: solo las publicaciones de ofertas llevan los datos de la detail card (me gusta · participantes o negociaciones ·
 * visitas) más compartir; el resto de entradas (propuestas, registros, publicidad, blog) solo compartir.
 * Los avisos de propuesta y de registro los firma VMC y no son clicables.
 */
import { useSyncExternalStore, useState } from "react";
import type { CSSProperties, JSX } from "react";
import {
  buildInventory, COLORS, counts, DEFAULT_SCENARIO, describe, GAP_S, planDay, SCENARIOS, valLot,
  type EntryText, type Offer, type PlanEntry,
} from "./feedPlan";

export type FeedView = "normal" | "timeline";
/** Diseño (QA): cómo se ve la publicidad, su badge y las visualizaciones. No cambia cuándo aparece cada entrada. */
export type AdStyle = "banner" | "tarjeta" | "post";
export type AdBadge = "foto" | "pill" | "texto" | "sin";
export type ViewsStyle = "ojo" | "completo" | "ojo-palabra" | "texto";
export type ShareIcon = "nodos" | "caja" | "avion";
/** Fila de visitas y compartir: en los extremos, todo a la izquierda, todo a la derecha, o con la palabra completa
 *  («1,234 visualizaciones») para llenar el ancho. */
export type ActsAlign = "palabra" | "extremos" | "izquierda" | "derecha";
/** Insignia del tipo de entrada (EN VIVO, NEGOCIABLE, BLOG…): con o sin. */
export type TagsMode = "con" | "sin";
/** Barra de scroll del feed: gris claro, vidrio (blanco translúcido) o el morado de antes. */
export type ScrollStyle = "gris" | "vidrio" | "morado";
/** Tono del naranja (en vivo) y el cian (negociable): el del design system, uno medio o el oscuro de la card de Tipo de oferta. */
export type ColorTone = "ds" | "medio" | "oscuro";
export type FeedDesign = {
  ad: AdStyle; badge: AdBadge; views: ViewsStyle; share: ShareIcon; acts: ActsAlign; tags: TagsMode; scroll: ScrollStyle; tone: ColorTone;
};
export const DEFAULT_DESIGN: FeedDesign = { ad: "tarjeta", badge: "sin", views: "ojo", share: "caja", acts: "palabra", tags: "sin", scroll: "gris", tone: "oscuro" };
// Naranja y cian del design system (BadgeStatus en vivo #FF9639 → #EF852E; cian #00D2D3 / #00AEB1 de Concorde).
const TONES: Record<ColorTone, Record<string, string>> = {
  ds: { [COLORS.vivo]: "#FF9639", [COLORS.negociable]: "#00D2D3" },
  medio: { [COLORS.vivo]: "#EF852E", [COLORS.negociable]: "#00AEB1" },
  oscuro: {},
};
const toned = (t: EntryText, d: FeedDesign): EntryText => ({ ...t, color: TONES[d.tone][t.color] ?? t.color });

const LOGO: Record<string, string | undefined> = {
  "VMC": "/producto/index/assets/brand/logo-voyager.svg", "Blog VMC": "/producto/index/assets/brand/logo-voyager.svg", "Pacífico": "/producto/index/demo/empresas/pacifico.png",
  "Autoplan": "/producto/index/demo/empresas/autoplan.png", "Trupal S.A.": "/producto/index/demo/empresas/trupal.svg", "Mapfre": "/producto/index/demo/empresas/mapfre.png",
};

// ─── Reloj de la demo ────────────────────────────────────────────────────────────────────────────────────────────────
// El tiempo es simulado: a ×10 avanza diez veces más rápido (los 45 s se cumplen en 4,5 s y los «hace X min» también).
type Shown = PlanEntry & { uid: string; at: number; real?: boolean };
// `skip`: mockups que se descuentan porque ya entró un hecho real del mismo tipo (mockups = objetivo − reales).
type FeedState = {
  scenario: string; speed: number; day: number; inv: Offer[]; plan: PlanEntry[]; items: Shown[]; next: number; now: number; lastAt: number; seq: number;
  skip: Partial<Record<PlanEntry["kind"], number>>; real: number; skipped: number; design: FeedDesign;
};
const GAP_MS = GAP_S * 1000;
const TICK_MS = 500;
const BACKLOG = 8; // entradas que ya están al abrir la página
const MAX_ITEMS = 24;

function initState(scenario: string, speed: number, design = DEFAULT_DESIGN): FeedState {
  const s = SCENARIOS.find((x) => x.id === scenario) ?? SCENARIOS.find((x) => x.id === DEFAULT_SCENARIO)!;
  const plan = planDay(s.V, s.N);
  const k = Math.min(BACKLOG, plan.length);
  const items = plan.slice(0, k).map((e, i): Shown => ({ ...e, uid: `${e.key}#0`, at: -(k - 1 - i) * GAP_MS })).reverse();
  // Al abrir la página, la primera entrada es siempre una publicidad: la que ya estaba entre las últimas o, si no hay, la
  // próxima del plan. Entra como «Ahora» (sin aviso de nuevo) y no cuenta para los 45 s.
  const isAd = (e: PlanEntry) => e.kind === "ad-valoriza" || e.kind === "ad-publica";
  const inBacklog = items.findIndex(isAd);
  const nextAd = plan.find((e, i) => i >= k && isAd(e)) ?? plan.find(isAd);
  if (inBacklog > 0) items.unshift(...items.splice(inBacklog, 1));
  else if (inBacklog < 0 && nextAd) items.unshift({ ...nextAd, uid: `${nextAd.key}#open` } as Shown);
  items.forEach((e, i) => { e.at = -i * GAP_MS; });
  return { scenario: s.id, speed, day: 0, inv: buildInventory(s.V, s.N), plan, items, next: plan.length ? k % plan.length : 0, now: 0, lastAt: 0, seq: 1,
    skip: {}, real: 0, skipped: 0, design };
}
const INITIAL = initState(DEFAULT_SCENARIO, 1);
let state = INITIAL;
let paused = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const push = (s: FeedState, e: PlanEntry, real = false): FeedState => ({
  ...s, items: [{ ...e, uid: `${e.key}#${s.seq}`, at: s.now, real }, ...s.items].slice(0, MAX_ITEMS), lastAt: s.now, seq: s.seq + 1,
});
function step() {
  if (paused > 0) return;
  let s: FeedState = { ...state, now: state.now + TICK_MS * state.speed };
  if (s.plan.length && s.now - s.lastAt >= GAP_MS) {
    // El próximo mockup se salta si un hecho real del mismo tipo ya ocupó su lugar.
    let next = s.next;
    const skip = { ...s.skip };
    let skipped = s.skipped;
    for (let n = 0; n < s.plan.length; n++) {
      const e = s.plan[next];
      if (!e.mock || !skip[e.kind]) break;
      skip[e.kind]! -= 1;
      skipped += 1;
      next = (next + 1) % s.plan.length;
    }
    s = { ...push({ ...s, skip, skipped }, s.plan[next]), next: (next + 1) % s.plan.length };
    // Al terminar el plan empieza el del día siguiente: otras horas y otros autos en las valorizaciones.
    if (s.next === 0) {
      const sc = SCENARIOS.find((x) => x.id === s.scenario)!;
      s = { ...s, day: s.day + 1, plan: planDay(sc.V, sc.N, s.day + 1) };
    }
  }
  state = s;
  emit();
}
function subscribe(l: () => void): () => void {
  listeners.add(l);
  timer ??= setInterval(step, TICK_MS);
  return () => {
    listeners.delete(l);
    if (!listeners.size && timer) { clearInterval(timer); timer = undefined; }
  };
}
const useFeed = (): FeedState => useSyncExternalStore(subscribe, () => state, () => INITIAL);
const hover = { onMouseEnter: () => { paused++; }, onMouseLeave: () => { paused = Math.max(0, paused - 1); } };

/** Control de QA: escenario de inventario y velocidad (×1 = 45 s reales, ×10 = 4,5 s). */
export function setFeedConfig(scenario: string, speed: number): void {
  if (scenario === state.scenario && speed === state.speed) return;
  state = scenario === state.scenario ? { ...state, speed } : initState(scenario, speed, state.design);
  emit();
}
/** Control de QA: diseño de la publicidad, su badge y las visualizaciones. */
export function setFeedDesign(design: FeedDesign): void {
  const d = state.design;
  if ((Object.keys(design) as (keyof FeedDesign)[]).every((k) => d[k] === design[k])) return;
  state = { ...state, design };
  emit();
}
/** Control de QA: una acción real (propuesta si hay negociables, si no un registro) entra ya y reinicia los 45 s. */
export function simulateRealAction(): void {
  const negs = state.inv.filter((o) => o.mode === "negociable");
  const o = negs[state.seq % Math.max(1, negs.length)];
  const e: PlanEntry = o
    ? { key: `real-p${o.id}`, min: 0, kind: "propuesta", offerId: o.id }
    : { key: "real-u", min: 0, kind: "registro" };
  state = { ...push(state, e, true), skip: { ...state.skip, [e.kind]: (state.skip[e.kind] ?? 0) + 1 }, real: state.real + 1 };
  emit();
}

/** Control de QA: pone arriba una valorización con el siguiente auto del catálogo. Vista previa: no descuenta ningún mockup. */
export function previewValorizacion(): void {
  const val = state.plan.find((e) => e.kind === "valorizacion");
  if (!val) return;
  state = push(state, { ...val, lot: valLot(state.seq) });
  emit();
}

const ago = (ms: number) => (ms < 60_000 ? "Ahora" : ms < 3_600_000 ? `hace ${Math.floor(ms / 60_000)} min` : `hace ${Math.floor(ms / 3_600_000)} h`);
const agoShort = (ms: number) => (ms < 60_000 ? "ahora" : ago(ms).replace("hace ", ""));
const handle = (who: string) => "@" + who.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "").toLowerCase();

const CSS = `
@keyframes va-in { from { opacity: 0; transform: translateY(-10px); } }
@keyframes va-flash { from { background: #F3EFFD; } to { background: transparent; } }
@keyframes va-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
@keyframes va-pill { 0% { opacity: 0; transform: translate(-50%, -6px); } 15%, 75% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -6px); } }
@keyframes va-ring { to { transform: rotate(360deg); } }
.va { position: relative; box-sizing: border-box; width: 100%; height: 100%; flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); }
.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1); }
.va-av { box-sizing: border-box; display: inline-grid; flex: none; border-radius: 50%; }
.va-av__in { display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(59,23,130,0.1); }
.va-av__in img { max-width: 72%; max-height: 72%; object-fit: contain; }
.va-av__in b { font-size: 12px; font-weight: 800; color: #3B1782; }
.va-verified { flex: none; }
/* Cabecera de la referencia: 68 de alto, padding 0 24, título 20 + bajada 14, «En vivo» a la derecha. */
.va-head { box-sizing: border-box; flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 60px; padding: 0 20px; border-bottom: 1px solid #E8DDFF; }
.va-head h3 { margin: 0; font-size: 16px; line-height: 20px; font-weight: 700; letter-spacing: -0.01em; color: #3B1782; white-space: nowrap; }
.va-head p { margin: 0; font-size: 12px; line-height: 16.8px; color: #6B6878; white-space: nowrap; }
.va-live { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #E2531A; }
.va-live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; animation: va-pulse 1.4s ease-in-out infinite; }
/* Scroll integrado al sistema visual: discreto, redondeado y consistente entre vistas. */
.va-scroll { scrollbar-gutter: stable; }
/* scrollbar-color solo donde no hay ::-webkit-scrollbar (Firefox): en Edge y Chrome, si está definido, anula los estilos de abajo. */
@supports not selector(::-webkit-scrollbar) {
  .va-scroll { scrollbar-width: thin; scrollbar-color: #8460E5 transparent; }
  .va-scroll--gris { scrollbar-color: #D9D6E2 transparent; }
  .va-scroll--vidrio { scrollbar-color: rgba(214,210,228,0.8) transparent; }
}
.va-scroll::-webkit-scrollbar { width: 8px; }
.va-scroll::-webkit-scrollbar-track { margin: 8px 0; background: transparent; }
.va-scroll::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 999px; background: linear-gradient(180deg, #CDBBFF, #7B5CE6) padding-box; box-shadow: 0 2px 7px rgba(59,23,130,0.18); }
.va-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #B295FF, #5A36C9) padding-box; }
/* Gris claro: fino y sin sombra, apenas se nota hasta pasar el puntero. */
.va-scroll--gris::-webkit-scrollbar { width: 7px; }
.va-scroll--gris::-webkit-scrollbar-thumb { background: #DEDBE6 padding-box; box-shadow: none; }
.va-scroll--gris::-webkit-scrollbar-thumb:hover { background: #C4C0D0 padding-box; }
/* Vidrio: blanco translúcido con un filete fino, como los botones de vidrio. */
.va-scroll--vidrio::-webkit-scrollbar { width: 9px; }
.va-scroll--vidrio::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(236,233,245,0.9)) padding-box;
  box-shadow: inset 0 0 0 1px rgba(59,23,130,0.12), 0 1px 4px rgba(16,0,48,0.12); }
.va-scroll--vidrio::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #fff, rgba(226,222,240,0.95)) padding-box; }

/* Normal */
.va--normal { padding: 0 0 8px; background: #fff; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; }
.va-list { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-around; overflow-y: auto; overscroll-behavior: contain; margin: 4px 16px 0; padding: 0; list-style: none; }
.va-row { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 10px; align-items: center; padding: 8px 0; }
.va-row + .va-row { border-top: 1px solid #E1E3E2; }
.va-row > img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; }
.va-row__txt { display: grid; gap: 3px; min-width: 0; }
.va-row__txt strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #3b1782; }
.va-row__detail { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: #5b5b66; }

/* Timeline (X / Twitter) */
.va--timeline { background: #fff; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; }
.va-live { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #E2531A; }
.va-live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; animation: va-pulse 1.4s ease-in-out infinite; }
.va-newpill { position: absolute; top: 60px; left: 50%; z-index: 3; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #8460E5, #3B1782); box-shadow: rgba(59,23,130,0.35) 0 6px 14px;
  opacity: 0; pointer-events: none; animation: va-pill 2.2s ease forwards; }
.va-posts { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0; padding: 0; list-style: none; }
.va-post { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 10px; padding: 12px 20px 2px; }
.va-post.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1), va-flash 2.4s ease; }
/* Hilo: el avatar y una línea fina que lo une con la publicación siguiente (como Threads). */
.va-post__rail { display: flex; flex-direction: column; align-items: center; }
.va-post__line { flex: 1; width: 2px; min-height: 12px; margin-top: 8px; border-radius: 2px; background: #E4E0F0; }
.va-post:last-child .va-post__line { display: none; }
.va-post__main { min-width: 0; padding-bottom: 12px; }
.va-post__head { display: flex; align-items: center; gap: 5px; min-width: 0; font-size: 13px; line-height: 18px; }
.va-post__head b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; color: #14112B; }
.va-post__head span { flex: none; color: #8A879C; font-size: 12px; font-weight: 400; }
.va-post__text { margin: 2px 0 0; font-size: 13px; line-height: 18px; color: #24203D; }
.va-post__text em { font-style: normal; font-weight: 700; color: #14112B; }
.va-post__media { position: relative; display: block; margin-top: 10px; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 14px; background: #F3EFFD; }
.va-post__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.va-post__media b { position: absolute; left: 10px; bottom: 10px; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; color: #fff; background: rgba(16,0,48,0.62); }
/* Timeline · fila tipo listado de eBay (escala de las cards chicas) */
.va-item { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 12px; align-items: center; padding: 12px 18px 12px 20px; }
.va-item + .va-item { border-top: 1px solid #EFEDF5; }
.va-item.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1), va-flash 2.4s ease; }
.va-item__thumb { display: block; width: 72px; height: 72px; overflow: hidden; border-radius: 12px; background: #F3EFFD; }
.va-item__thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
.va-item__main { display: grid; gap: 3px; min-width: 0; }
.va-item__pill { justify-self: start; display: inline-flex; align-items: center; height: 18px; padding: 0 8px; border-radius: 999px; border: 1.5px solid var(--k);
  font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--k); background: color-mix(in srgb, var(--k) 10%, #fff); }
.va-item__title { margin: 1px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; line-height: 1.2; font-weight: 800; color: #14112B; }
.va-item__value { font-size: 14px; line-height: 1.2; font-weight: 800; letter-spacing: -0.01em; color: #4C1EBC; }
.va-item__meta { display: flex; align-items: center; gap: 3px; min-width: 0; font-size: 11px; color: #6B6880; white-space: nowrap; }
.va-item__meta > span:last-child { overflow: hidden; text-overflow: ellipsis; }
.va-item__who { flex: none; max-width: 84px; overflow: hidden; text-overflow: ellipsis; }
.va-item__meta .va-verified { width: 10px; height: 10px; }


/* Estilo X (feed a pantalla completa en móvil): la anatomía del post de X. Grises y separadores de X
   (#0F1419 texto, #536471 secundario, #EFF3F4 filete); el acento es el morado de VMC en vez del azul de X. */
.va--x { border-radius: 0; box-shadow: none; color: #0F1419; }
.va--x .va-posts { padding: 0; }
.va--x.va--page { height: auto; flex: none; overflow: visible; }
.va--x.va--page .va-posts { flex: none; overflow: visible; }
.va-x { position: relative; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 8px; padding: 12px 16px 4px; border-bottom: 1px solid #EFF3F4; cursor: pointer; transition: background 0.2s; }
.va-x:hover { background: #F7F9F9; }
.va-x.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1), va-flash 2.4s ease; }
.va-x .va-av { margin-top: 2px; }
.va-x__head { display: flex; align-items: center; gap: 4px; min-width: 0; padding-right: 26px; font-size: 15px; line-height: 20px; }
.va-x__head b { flex: none; max-width: 52%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; color: #0F1419; }
.va-x__head .va-verified { width: 16px; height: 16px; }
.va-x__head span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #536471; font-weight: 400; }
.va-x__more { position: absolute; top: 8px; right: 8px; display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%;
  background: none; color: #536471; cursor: pointer; }
.va-x__more:hover { background: rgba(59,23,130,0.1); color: #3B1782; }
.va-x__text { margin: 0; font-size: 15px; line-height: 20px; color: #0F1419; overflow-wrap: anywhere; }
.va-x__text em { font-style: normal; font-weight: 700; color: #0F1419; }
.va-hl { font-weight: 700; color: inherit; }
.va-x .va-post__media { margin-top: 12px; border: 1px solid #CFD9DE; border-radius: 16px; }
.va-x__acts { display: flex; align-items: center; justify-content: space-between; margin: 4px 0 0 -8px; max-width: 425px; }
.va-x__acts > span { display: flex; gap: 2px; }
.va-x__acts button { display: inline-flex; align-items: center; gap: 2px; height: 34px; padding: 0 8px 0 0; border: 0; background: none; cursor: pointer;
  font: 400 13px/1 var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif); color: #536471; font-variant-numeric: tabular-nums; white-space: nowrap; }
.va-x__acts button i { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; transition: background 0.2s, color 0.2s; }
.va-x__acts button:hover { color: var(--k); }
.va-x__acts button:hover i { background: color-mix(in srgb, var(--k) 12%, transparent); }
.va-x__acts button[aria-pressed="true"] { color: var(--k); }
.va-x__acts button[aria-pressed="true"] i svg path { fill: currentColor; }
.va-x__acts button[aria-pressed="true"] i { animation: va-pop 0.35s cubic-bezier(0.3,1.6,0.5,1); }
.va-x__acts button:focus-visible { outline: 2px solid #8460E5; outline-offset: 1px; border-radius: 999px; }
@keyframes va-pop { 40% { transform: scale(1.25); } }
/* Aviso de novedades estilo X: píldora con mini avatares que aparece arriba. */
.va--x .va-newpill { position: sticky; top: 10px; display: flex; width: max-content; margin: 0 auto -32px; gap: 6px; padding: 4px 12px 4px 6px; font-size: 13px; background: #3B1782; }
.va-newpill .va-av { margin-left: -6px; box-shadow: 0 0 0 2px #3B1782; }
.va-newpill .va-av:first-of-type { margin-left: 0; }
@media (prefers-reduced-motion: reduce) { .va-x__acts button i { animation: none !important; } }

/* «Ver más» (móvil, sin scroll): la card crece con su contenido y un botón va sumando publicaciones. */
.va--auto { height: auto; flex: none; }
.va--auto .va-posts { flex: none; overflow: visible; }
.va-reveal { animation: va-in 0.45s cubic-bezier(0.3,0,0,1) both; }
.va-more { display: flex; align-items: center; justify-content: center; gap: 6px; width: calc(100% - 32px); height: 40px; margin: 6px 16px 14px; border: 1px solid #ECE8F6;
  border-radius: 999px; background: #fff; color: #3B1782; cursor: pointer; font: 700 13px/1 var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif); transition: background 0.2s, border-color 0.2s; }
.va-more:hover { background: #F8F6FF; border-color: #CDBEFF; }
.va-more:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
.va-more svg { transition: transform 0.25s; }
.va-more[data-less] svg { transform: rotate(180deg); }

/* Insignia del tipo de entrada (nueva / disponible / propuesta / publicidad…), para no hacer pasar la rotación por nueva. */
.va-tag { display: inline-flex; align-items: center; height: 18px; margin: 3px 0 3px; padding: 0 7px; border-radius: 999px; font-size: 9.5px; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--k); background: color-mix(in srgb, var(--k) 11%, #fff); }
.va-x .va-tag { margin-top: 4px; }
/* Propuesta enviada: texto + foto pequeña de la oferta, sin enlace. */
.va-prop { display: grid; grid-template-columns: minmax(0, 1fr) 44px; gap: 10px; align-items: start; }
.va-prop > img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; background: #F3EFFD; }
/* Acciones de oferta en el timeline: me gusta · participantes o negociaciones · compartir. */
.va-acts { display: flex; align-items: center; gap: 2px; margin: 6px 0 0 -6px; font-size: 12px; color: #6B6880; }
.va-acts button, .va-acts__count { display: inline-flex; align-items: center; gap: 5px; min-width: 0; height: 28px; padding: 0 6px; border: 0; border-radius: 999px;
  background: none; font: inherit; color: inherit; white-space: nowrap; }
.va-acts button { flex: none; cursor: pointer; transition: background 0.2s, color 0.2s; }
.va-acts button:hover { background: #F3EFFD; color: var(--k); }
.va-acts button[aria-pressed="true"] { color: var(--k); }
.va-acts button[aria-pressed="true"] svg path { fill: currentColor; }
.va-acts button:focus-visible { outline: 2px solid #8460E5; outline-offset: 1px; }
.va-acts button:last-child { margin-left: auto; }
.va-acts svg { flex: none; width: 16px; height: 16px; }
.va-acts__count { overflow: hidden; text-overflow: ellipsis; }
.va-acts__views { flex: none; }
/* Timeline (columna angosta): fila más compacta para que «38 participantes» / «4 negociaciones» entren completos. */
.va-post .va-acts { gap: 0; margin-left: -3px; font-size: 10.5px; letter-spacing: -0.015em; }
.va-post .va-acts button, .va-post .va-acts__count { gap: 2px; padding: 0 2px; }
.va-post .va-acts svg { width: 13px; height: 13px; }
/* Solo compartir (propuestas, registros, publicidad, blog): el botón queda a la derecha, como en las ofertas. */
.va-acts--share { justify-content: flex-end; margin-top: 2px; }
.va-x__acts.va-acts--share { justify-content: flex-end; }
.va-acts__count svg { color: var(--k); }
.va-x__acts > .va-acts__count { display: inline-flex; align-items: center; gap: 2px; min-width: 0; height: 34px; padding-right: 8px; overflow: hidden; text-overflow: ellipsis;
  font: 400 13px/1 var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif); color: #536471; white-space: nowrap; }
.va-x__acts > .va-acts__count i { display: grid; place-items: center; flex: none; width: 34px; height: 34px; color: var(--k); }
/* Listado: títulos de hasta dos líneas (las propuestas y la publicidad no tienen lote) y avatar cuando no hay foto. */
.va-item__title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: normal; }
.va-item__thumb--av { display: grid; place-items: center; background: #F8F6FF; }
/* Publicidad: la foto del banner y su botón, para que se lea como anuncio. */
.va-ad { position: relative; display: block; margin-top: 8px; overflow: hidden; border-radius: 14px; }
.va-ad--banner { aspect-ratio: 1 / 1; color: #fff; background: #2A0E6E; }
.va-x .va-ad--banner { aspect-ratio: 4 / 3; }
.va-ad--banner > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.va-ad__veil { position: absolute; z-index: 1; left: 0; right: 0; bottom: 0; display: grid; gap: 3px; justify-items: start; padding: 48px 12px 12px;
  background: linear-gradient(180deg, rgba(42,14,110,0) 0%, rgba(42,14,110,0.78) 48%, #2A0E6E 100%); }
.va-ad--banner b { font-size: 15px; line-height: 1.2; font-weight: 800; text-wrap: balance; }
.va-ad__veil span { font-size: 12px; line-height: 1.3; color: rgba(255,255,255,0.88); }
.va-ad--banner .va-glass { margin-top: 8px; }
.va-ad--card { border: 1px solid #E6E1F5; background: #fff; }
.va-ad__media { position: relative; display: block; aspect-ratio: 16 / 9; background: #F3EFFD; }
.va-ad__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.va-ad__body { display: grid; gap: 3px; justify-items: start; padding: 10px 12px 12px; }
.va-ad--card b { font-size: 14px; line-height: 1.25; font-weight: 800; color: #14112B; }
.va-ad__body span { font-size: 12px; line-height: 1.3; color: #5B5870; }
/* Botón de vidrio del banner principal (hib-glass del design system), en chico: blanco translúcido, blur y borde VYStrokes1.
   Va siempre sobre la foto, donde se lee. */
.va-glass { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 18px; border: 0;
  border-radius: 100px; font: 600 13px/1 var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); color: #fff; white-space: nowrap; cursor: pointer;
  background-color: transparent;
  background-image: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.03) 100%);
  -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
  box-shadow: rgba(0,0,0,0.1) 0 8px 24px, inset 0 1px 6px rgba(255,255,255,0.45); text-shadow: rgba(0,0,0,0.25) 0 1px 3px;
  transition: background-color 0.25s, box-shadow 0.25s, transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); }
.va-glass::before { content: ""; position: absolute; inset: 0; padding: 1.5px; border-radius: inherit; pointer-events: none;
  background: linear-gradient(94deg, #FFFFFF 0%, #F4AC59 22.1%, #8460E5 74.5%, #FFFFFF 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.va-glass:hover { transform: translateY(-1px); background-color: rgba(255,255,255,0.1); box-shadow: rgba(0,0,0,0.16) 0 12px 28px, inset 0 1px 8px rgba(255,255,255,0.6); }
.va-glass:active { transform: translateY(1px) scale(0.97); background-color: rgba(32,0,104,0.22); }
.va-glass:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.va-ad__media .va-glass { position: absolute; left: 10px; bottom: 10px; z-index: 2; }
/* Sin foto debajo (valorización): el mismo botón sobre violeta, porque su texto blanco no se lee sobre la card blanca. */
.va-glass.va-glass--solid { display: flex; width: fit-content; margin-top: 8px; background-color: #3B1782; }
.va-ad__badge { position: absolute; top: 8px; left: 8px; z-index: 3; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700;
  letter-spacing: 0.03em; color: #3B1782; background: rgba(255,255,255,0.92); box-shadow: rgba(16,0,48,0.18) 0 2px 6px; }
.va-ad__when { font-weight: 600; color: #8A879C; }
/* Visualizaciones en su propia línea (estilos «ojo-palabra» y «texto»). */
.va-views { display: flex; align-items: center; gap: 4px; margin: 8px 0 0; font-size: 12px; color: #6B6880; }
.va-views b { font-weight: 700; color: #14112B; }
.va-views svg { width: 14px; height: 14px; }
.va-acts--views { justify-content: space-between; }
/* Alineación de la fila (control «fila de acciones»): todo a la izquierda o todo a la derecha, sin hueco en el medio. */
.va-acts.va-acts--izquierda, .va-x__acts.va-acts--izquierda { justify-content: flex-start; gap: 10px; }
.va-acts--izquierda button:last-child { margin-left: 0; }
.va-acts.va-acts--derecha, .va-x__acts.va-acts--derecha { justify-content: flex-end; gap: 10px; }
.va-item__thumb--av .va-av__in img { width: auto; height: auto; max-width: 72%; max-height: 72%; object-fit: contain; }
`;

// Franja de una línea (móvil, alternativa a la card): el último evento en vivo; al tocarla se abre el feed completo.
const TICKER_CSS = `
@keyframes va-tk-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes va-tk-pulse { 50% { opacity: 0.35; } }
.va-ticker { box-sizing: border-box; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; width: 100%; height: 44px;
  padding: 0 12px; border: 1px solid #ECE8F6; border-radius: 12px; background: #fff; color: #14112B; text-align: left; cursor: pointer;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); box-shadow: rgba(0,0,0,0.05) 0 2px 10px; }
.va-ticker:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
.va-ticker__live { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #E2531A; }
.va-ticker__live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; animation: va-tk-pulse 1.4s ease-in-out infinite; }
.va-ticker__txt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: #3F3F4A; animation: va-tk-in 0.4s cubic-bezier(0.3,0,0,1); }
.va-ticker__txt b { font-weight: 700; color: #14112B; }
.va-ticker__go { color: #3B1782; }
@media (prefers-reduced-motion: reduce) { .va-ticker__txt, .va-ticker__live i { animation: none; } }
`;

function Avatar({ who, size = 32 }: { who: string; size?: number }): JSX.Element {
  const logo = LOGO[who];
  const vmc = who === "VMC" || who === "Blog VMC";
  const initials = who === "SubasCars" ? "SC" : who.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="va-av" style={{ width: size, height: size }}>
      <span className="va-av__in" style={{ background: vmc ? "#3B1782" : logo ? "#fff" : "#EEE8FF" }}>
        {logo ? <img src={logo} alt="" /> : <b>{initials}</b>}
      </span>
    </span>
  );
}

const Verified = () => (
  <svg className="va-verified" width="12" height="12" viewBox="0 0 24 24" aria-label="Verificado"><path d="M12 1.8l2.6 1.9 3.2-.2 1 3 2.6 1.9-1 3.1 1 3-2.6 1.9-1 3.1-3.2-.2L12 22.2l-2.6-1.9-3.2.2-1-3.1L2.6 15.5l1-3-1-3.1 2.6-1.9 1-3 3.2.2z" fill="url(#va-vg)" /><defs><linearGradient id="va-vg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8460E5" /><stop offset="1" stopColor="#3B1782" /></linearGradient></defs><path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Ico = {
  heart: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.1-8 11-8 11z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  people: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M15.5 19v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.1a3.6 3.6 0 0 0-3.6 3.6V19M9.5 11a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8zM20.5 19v-1.3a3.3 3.3 0 0 0-2.5-3.2M15.3 4.4a3.4 3.4 0 0 1 0 6.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>,
  // Compartir: tres puntos unidos (el de siempre), flecha saliendo de una caja (iPhone) o el avión de papel.
  nodos: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><circle cx="18" cy="5.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="6" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="18" cy="18.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  caja: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M12 3.5v11M8 7.5l4-4 4 4M7 10.5H6a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  avion: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  more: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><circle cx="5" cy="12" r="1.7" fill="currentColor" /><circle cx="12" cy="12" r="1.7" fill="currentColor" /><circle cx="19" cy="12" r="1.7" fill="currentColor" /></svg>,
  arrowUp: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

/** «32 participantes» / «4 negociaciones»; en 0 no se muestra un contador vacío. */
function countLabel(t: EntryText): string {
  const n = t.count ?? 0;
  if (t.mode === "vivo") return n ? `${n} participante${n === 1 ? "" : "s"}` : "Sé el primero en participar";
  return n ? `${n} negociaci${n === 1 ? "ón" : "ones"}` : "Sin negociaciones aún";
}

// Visualizaciones: «1,2 mil» (abreviado) o «1,234» (completo).
const fmtViews = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "").replace(".", ",")} mil` : String(n));
const fmtFull = (n: number) => n.toLocaleString("es-PE");
const viewsWord = (n: number) => (n === 1 ? "visualización" : "visualizaciones");
/** Visualizaciones en su propia línea («ojo-palabra» y «texto»), como las de un post de X. */
const viewsLine = (t: EntryText, d: FeedDesign) => !t.views ? null : d.views === "ojo-palabra"
  ? <p className="va-views">{Ico.eye}{fmtViews(t.views)} {t.views === 1 ? "visita" : "visitas"}</p>
  : d.views === "texto" ? <p className="va-views"><b>{fmtViews(t.views)}</b> {viewsWord(t.views)}</p> : null;

/** Acciones. Publicación de una oferta: lo de la detail card (me gusta · participantes o negociaciones · visualizaciones) y
 *  compartir. Las demás entradas (propuestas, registros, publicidad, blog): visualizaciones y compartir. Con «ojo» y
 *  «completo» las visualizaciones van en la fila; con «ojo-palabra» y «texto», en una línea aparte (`viewsLine`). */
function Acts({ t, d, x = false }: { t: EntryText; d: FeedDesign; x?: boolean }): JSX.Element {
  const [liked, setLiked] = useState(false);
  const likes = (t.likes ?? 0) + (liked ? 1 : 0);
  const stop = (fn?: () => void) => (ev: { stopPropagation: () => void }) => { ev.stopPropagation(); fn?.(); };
  const wrap = (icon: JSX.Element) => (x ? <i>{icon}</i> : icon);
  const share = <button type="button" style={{ "--k": "#4A2CE0" } as CSSProperties} aria-label="Compartir" onClick={stop()}>{wrap(Ico[d.share])}</button>;
  const inRow = d.views === "ojo" || d.views === "completo";
  // Sin me gusta ni contador (propuestas, registros, publicidad, blog), con «palabra» las visitas van completas para llenar la fila.
  const word = !t.mode && d.acts === "palabra";
  const views = inRow ? (
    <span className="va-acts__count va-acts__views" style={{ "--k": "#6B6880" } as CSSProperties} aria-label={`${t.views} visualizaciones`}>
      {wrap(Ico.eye)}{!t.views ? null : word ? `${fmtFull(t.views)} ${viewsWord(t.views)}` : d.views === "completo" ? fmtFull(t.views) : fmtViews(t.views)}</span>
  ) : null;
  const align = ` va-acts--${d.acts}`;
  if (!t.mode) return <div className={`${x ? "va-x__acts" : "va-acts"} va-acts--share${views ? " va-acts--views" : ""}${align}`}>{views}{share}</div>;
  return (
    <div className={`${x ? "va-x__acts" : "va-acts"}${align}`}>
      <button type="button" style={{ "--k": "#F91880" } as CSSProperties} aria-pressed={liked} aria-label={`Me gusta · ${likes}`}
        onClick={stop(() => setLiked((v) => !v))}>{wrap(Ico.heart)}{likes || null}</button>
      <span className="va-acts__count" style={{ "--k": "#191C1C" } as CSSProperties} title={countLabel(t)}>{wrap(Ico.people)}{countLabel(t)}</span>
      {views}
      {share}
    </div>
  );
}

/** Publicidad con la foto de su banner (los de /producto/index/banners/vmc) y el botón de vidrio del banner principal, siempre sobre la
 *  foto. `tarjeta`: foto arriba y texto abajo, en una tarjeta con borde; `banner`: foto a lo ancho con el texto encima,
 *  sobre un velo violeta; `post`: como un post, con la foto debajo. */
function Ad({ t, d, x }: { t: EntryText; d: FeedDesign; x: boolean }): JSX.Element {
  const img = <img src={t.imageSrc} alt="" style={{ objectPosition: t.imagePos }} />;
  const badge = d.badge === "foto" ? <span className="va-ad__badge">Publicidad</span> : null;
  const cta = <button type="button" className="va-glass">{t.cta}</button>;
  if (d.ad === "banner") {
    return <div className="va-ad va-ad--banner">{img}{badge}<div className="va-ad__veil"><b>{t.title}</b><span>{t.detail}</span>{cta}</div></div>;
  }
  if (d.ad === "tarjeta") {
    return <div className="va-ad va-ad--card"><span className="va-ad__media">{img}{badge}{cta}</span><div className="va-ad__body"><b>{t.title}</b><span>{t.detail}</span></div></div>;
  }
  return (
    <>
      <p className={x ? "va-x__text" : "va-post__text"}>{t.title}. <em>{t.detail}</em></p>
      <span className="va-post__media va-ad__media">{img}{badge}{cta}</span>
    </>
  );
}

/** Texto de la entrada: insignia del tipo, título, detalle y, en las propuestas, la foto pequeña de la oferta (sin enlace). */
// En el título de ofertas y propuestas, el tipo («en vivo», «recibe ofertas») y el número de OFERTA van en
// negrita. El texto destacado va en negro; el color del tipo queda para íconos e insignias.
const HL = /(en vivo|recibe ofertas|OFERTA \d+)/;
const highlight = (title: string, on: boolean) => (on
  ? title.split(HL).map((part, i) => (i % 2 ? <strong key={i} className="va-hl">{part}</strong> : part))
  : title);

/** Fotos: las ofertas (nuevas y en rotación) llevan siempre la suya; la propuesta, solo si es real; el blog, su portada. */
function Body({ t, kind, d, x = false }: { t: EntryText; kind: PlanEntry["kind"]; d: FeedDesign; x?: boolean }): JSX.Element {
  // El detalle va en negrita y en negro (el color del tipo queda en los íconos y las insignias).
  const text = <p className={x ? "va-x__text" : "va-post__text"} style={{ "--k": t.color } as CSSProperties}>
    {highlight(t.title, Boolean(t.mode) || kind === "propuesta")}.{t.detail ? <> <em>{t.detail}</em></> : null}</p>;
  if (t.ad) {
    return (
      <>
        {d.badge === "pill" && d.tags === "con" ? <span className="va-tag" style={{ "--k": t.color } as CSSProperties}>{t.pill}</span> : null}
        <Ad t={t} d={d} x={x} />
        {viewsLine(t, d)}
        <Acts t={t} d={d} x={x} />
      </>
    );
  }
  return (
    <>
      {d.tags === "con" ? <span className="va-tag" style={{ "--k": t.color } as CSSProperties}>{t.pill}</span> : null}
      {kind === "propuesta" && t.imageSrc ? <div className="va-prop">{text}<img src={t.imageSrc} alt="" /></div> : text}
      {/* El blog lleva siempre su portada con el botón de vidrio encima, como la publicidad. */}
      {kind === "blog" && t.imageSrc
        ? <span className="va-post__media va-ad__media"><img src={t.imageSrc} alt="" style={{ objectPosition: t.imagePos }} /><button type="button" className="va-glass">{t.cta}</button></span>
        : t.mode && t.imageSrc ? <span className="va-post__media"><img src={t.imageSrc} alt="" /></span> : null}
      {kind === "valorizacion" ? <button type="button" className="va-glass va-glass--solid">{t.cta}</button> : null}
      {viewsLine(t, d)}
      <Acts t={t} d={d} x={x} />
    </>
  );
}
/** Badge «texto»: en la publicidad, «Publicidad» va donde va la hora, como el «Anuncio» de X. */
const when = (t: EntryText, d: FeedDesign, label: string) => (t.ad && d.badge === "texto" ? <span className="va-ad__when">Publicidad</span> : label);

export function VmcAhoraTicker({ onOpen }: { onOpen: () => void }): JSX.Element {
  const s = useFeed();
  const e = s.items[0];
  const t = toned(describe(e, s.inv, (s.now - e.at) / 60_000), s.design);
  return (
    <button type="button" className="va-ticker" onClick={onOpen} aria-label={`VMC ahora, en vivo: ${t.author}, ${t.title}. Abrir el feed`}>
      <span className="va-ticker__live"><i />En vivo</span>
      <span key={e.uid} className="va-ticker__txt"><b>{t.author}</b> · {t.title}</span>
      <svg className="va-ticker__go" width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M7.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <style>{TICKER_CSS}</style>
    </button>
  );
}

function Head({ live }: { live: boolean }): JSX.Element {
  return (
    <header className="va-head">
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}><h3>VMC ahora</h3><p>Actividad en tiempo real</p></div>
      {live ? <span className="va-live"><i />En vivo</span> : null}
    </header>
  );
}

/** `live={false}`: sin la etiqueta «En vivo» de la cabecera, cuando la pestaña que abre el feed ya lo dice (móvil). */
/** `more`: sin scroll interno; muestra 2 publicaciones y «Ver más» suma de a 3 (móvil).
 *  `x`: feed a pantalla completa estilo X (móvil); con `head={false}` sin cabecera, cuando las pestañas ya la reemplazan,
 *  y con `page` sin scroll propio (desplaza la página, como X, para que el header se esconda al bajar). */
export default function VmcAhora({ view, live = true, more = false, x = false, head = true, page = false }: {
  view: FeedView; live?: boolean; more?: boolean; x?: boolean; head?: boolean; page?: boolean;
}): JSX.Element {
  const s = useFeed();
  const [shown, setShown] = useState(2);
  const [revealFrom, setRevealFrom] = useState(Infinity);
  const all = more || x ? s.items : s.items.slice(0, 8);
  const items = more ? all.slice(0, shown) : all;
  const moreBtn = more ? (
    <button type="button" className="va-more" data-less={shown >= all.length || undefined}
      onClick={() => { if (shown >= all.length) { setShown(2); setRevealFrom(Infinity); } else { setRevealFrom(shown); setShown((n) => Math.min(all.length, n + 3)); } }}>
      {shown >= all.length ? "Ver menos" : "Ver más"}
      <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  ) : null;
  // La entrada de arriba entra animada (su key es nueva en cada avance; las demás conservan la suya).
  const enter = (i: number) => (i === 0 ? " va-enter" : i >= revealFrom ? " va-reveal" : "");
  const top = s.items[0];
  const fresh = top && top.at > 0;

  if (view === "timeline" && x) {
    return (
      <aside className={`va va--timeline va--x${page ? " va--page" : ""}`} aria-label="VMC ahora" {...hover}>
        {head ? <Head live={live} /> : null}
        {fresh ? (
          <span key={top.uid} className="va-newpill" aria-hidden>
            {Ico.arrowUp}{items.slice(0, 3).map((e) => <Avatar key={e.uid} who={describe(e, s.inv).author} size={20} />)}Ver nuevas
          </span>
        ) : null}
        <ol className={`va-posts${page ? "" : ` va-scroll va-scroll--${s.design.scroll}`}`} aria-live="polite">
          {items.map((e, i) => {
            const t = toned(describe(e, s.inv, (s.now - e.at) / 60_000), s.design);
            return (
              <li key={e.uid} className={`va-x${enter(i)}`}>
                <Avatar who={t.author} size={40} />
                <div style={{ minWidth: 0 }}>
                  <div className="va-x__head"><b>{t.author}</b><Verified /><span>{handle(t.author)} · {when(t, s.design, agoShort(s.now - e.at))}</span></div>
                  <button type="button" className="va-x__more" aria-label="Más opciones">{Ico.more}</button>
                  <Body t={t} kind={e.kind} d={s.design} x />
                </div>
              </li>
            );
          })}
        </ol>
        <style>{CSS}</style>
      </aside>
    );
  }

  if (view === "timeline") {
    return (
      <aside className={`va va--timeline${more ? " va--auto" : ""}`} aria-label="VMC ahora" {...hover}>
        <Head live={live} />
        {fresh ? <span key={top.uid} className="va-newpill" aria-hidden>{Ico.arrowUp}Nuevo</span> : null}
        <ol className={`va-posts${more ? "" : ` va-scroll va-scroll--${s.design.scroll}`}`} aria-live="polite">
          {items.map((e, i) => {
            const t = toned(describe(e, s.inv, (s.now - e.at) / 60_000), s.design);
            return (
              <li key={e.uid} className={`va-post${enter(i)}`}>
                <div className="va-post__rail"><Avatar who={t.author} size={32} /><span className="va-post__line" /></div>
                <div className="va-post__main">
                  <div className="va-post__head"><b>{t.author}</b><Verified /><span>{when(t, s.design, ago(s.now - e.at))}</span></div>
                  <Body t={t} kind={e.kind} d={s.design} />
                </div>
              </li>
            );
          })}
        </ol>
        {moreBtn}
        <style>{CSS}</style>
      </aside>
    );
  }

  return (
    <aside className={`va va--normal${more ? " va--auto" : ""}`} aria-label="VMC ahora" {...hover}>
      <Head live={live} />
      {fresh ? <span key={top.uid} className="va-newpill" aria-hidden>{Ico.arrowUp}Nuevo</span> : null}
      <ol className={`va-posts${more ? "" : ` va-scroll va-scroll--${s.design.scroll}`}`} aria-live="polite">
        {/* Fila tipo listado de eBay: la insignia cuenta el tipo de entrada, el título, un dato fuerte (el precio, si hay)
            y una línea gris con autor · tiempo · participantes o negociaciones. */}
        {items.map((e, i) => {
          const t = toned(describe(e, s.inv, (s.now - e.at) / 60_000), s.design);
          const o = s.inv.find((x) => x.id === e.offerId);
          return (
            <li key={e.uid} className={`va-item${enter(i)}`}>
              {t.imageSrc
                ? <span className="va-item__thumb"><img src={t.imageSrc} alt="" /></span>
                : <span className="va-item__thumb va-item__thumb--av"><Avatar who={t.author} size={40} /></span>}
              <div className="va-item__main">
                {s.design.tags === "con" ? <span className="va-item__pill" style={{ "--k": t.color } as CSSProperties}>{t.pill}</span> : null}
                <p className="va-item__title">{t.mode && o ? o.lot : t.title}</p>
                {t.mode && o?.price ? <b className="va-item__value">{o.price}</b> : null}
                <span className="va-item__meta"><span className="va-item__who">{t.author}</span><Verified />
                  <span>· {ago(s.now - e.at)}{t.mode ? ` · ${countLabel(t)}` : ""}{t.views ? ` · ${s.design.views === "completo" ? fmtFull(t.views) : fmtViews(t.views)} ${s.design.views === "texto" ? viewsWord(t.views) : t.views === 1 ? "visita" : "visitas"}` : ""}</span></span>
              </div>
            </li>
          );
        })}
      </ol>
      {moreBtn}
      <style>{CSS}</style>
    </aside>
  );
}

// Panel de QA del reloj: cuánto falta para la próxima entrada simulada, el plan del día y una acción real de prueba.
const QA_CSS = `
.va-qa p { margin: 0 2px 6px; font-size: 12px; line-height: 16px; color: #4A4560; }
.va-qa p b { color: #3B1782; font-variant-numeric: tabular-nums; }
.va-qa ul { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; margin: 0 2px 8px; padding: 0; list-style: none; font-size: 11.5px; color: #6B6880; }
.va-qa ul b { text-align: right; color: #191C1C; font-variant-numeric: tabular-nums; }
.va-qa small { display: block; margin: 6px 2px 0; font-size: 10.5px; color: #8a879c; }
`;
export function VmcAhoraQa(): JSX.Element {
  const s = useFeed();
  const left = Math.max(0, Math.ceil((GAP_MS - (s.now - s.lastAt)) / s.speed / 1000));
  const sc = SCENARIOS.find((x) => x.id === s.scenario);
  const c = counts(sc?.V ?? 0, sc?.N ?? 0);
  const n = (k: PlanEntry["kind"][]) => s.plan.filter((e) => k.includes(e.kind)).length;
  const rows: [string, number][] = [
    ["Rotación del inventario", n(["rotacion"])], ["Propuestas enviadas · mockup", n(["propuesta"])], ["Nuevas ofertas", n(["nueva", "nueva-subascars"])],
    ["Registros · mockup", n(["registro"])], ["Valorizaciones · mockup", n(["valorizacion"])], ["Publicidad", n(["ad-valoriza", "ad-publica"])], ["Blog", n(["blog"])],
  ];
  return (
    <div className="hib-switch va-qa" role="group" aria-label="VMC ahora · reloj">
      <span>VMC ahora · reloj</span>
      <p>{c.V} en vivo · {c.N} recibe ofertas · inventario {c.T}</p>
      <p>Próxima entrada simulada en <b>{left} s</b>{s.speed > 1 ? ` (×${s.speed})` : ""}</p>
      <ul aria-label={`Plan del día: ${s.plan.length} entradas`}>{rows.map(([k, v]) => <li key={k} style={{ display: "contents" }}><span>{k}</span><b>{v}</b></li>)}</ul>
      <button type="button" onClick={simulateRealAction}><b>Simular acción real</b><small style={{ margin: 0 }}>Entra ya, reinicia los {GAP_S} s y descuenta un mockup</small></button>
      <button type="button" onClick={previewValorizacion} disabled={!n(["valorizacion"])} style={{ marginTop: 6 }}><b>Ver valorización ahora</b><small style={{ margin: 0 }}>{n(["valorizacion"]) ? "Cada clic, otro auto arriba del feed; no descuenta nada del plan" : "Sin ofertas no hay valorizaciones"}</small></button>
      {s.real ? <small>Reales: {s.real} · mockups descontados: {s.skipped}{s.real > s.skipped ? ` (${s.real - s.skipped} por descontar)` : ""}</small> : null}
      <small>Plan del día: {s.plan.length} entradas de 9:00 a 24:00, reproducidas cada {GAP_S} s. Ver escenarios.pdf.</small>
      <style>{QA_CSS}</style>
    </div>
  );
}
