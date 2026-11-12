/* ─────────────────────────────────────────────────────────────────────────────
   PORTADO desde el repo Concorde-Email (github.com/Jarbram/Concorde-Email),
   archivo `lib/email-templates.ts`.

   Es el renderer real de los correos de producción: generateEmail(sections,
   subject) devuelve el HTML email-safe completo. Lo consume prodEmails.ts.
   No editar a mano — si Concorde-Email cambia, volver a copiar.

   Únicas desviaciones respecto al original (reaplicar al resincronizar):
    · `renderSection` lleva `export` — sectionPreviews.ts renderiza sección por
      sección para el catálogo /correos/secciones.
    · `list` acepta un cuarto item `i4` (el original solo pintaba i1..i3). Lo pide
      el correo de bienvenida, que lista Correo · Celular · DNI · RUC.
    · `list` acepta `bulletTone: 'ink'`. La viñeta es naranja de acento SIEMPRE;
      antes su color estaba atado a `align: 'center'`, así que una lista alineada
      a la izquierda perdía el naranja de Figma sin razón. `'ink'` recupera el
      comportamiento viejo (viñeta del color del texto) si algún correo lo quiere.
    · `list` acepta `indent` (px): tabula la lista bajo su rótulo, sangrándola como
      una sub-lista en vez de dejarla al mismo margen que el texto que la titula.
    · `action-card` acepta `svgLeft` (+`svgLeftW`): un icono en su propia columna a
      la IZQUIERDA del copy. El original solo admitía `svg`, que va a la derecha;
      la card «Más transparencia» de Figma lleva escudo a la izquierda Y celular a
      la derecha, así que necesitaba ambos lados.
    · `action-card` acepta `svgGap` (px): la separación entre el copy y el icono
      derecho, antes fija en 16px.
    · `columns` acepta `icon1`/`icon2`: una burbuja morada que asoma por la esquina
      superior izquierda de cada card (los iconos BCP de Figma). La card gana
      padding-top para dejarle el hueco.
    · `action-card` acepta `svgW` y `svgAlign: 'bottom'` para el icono derecho. Con
      `bottom` la imagen se ancla al canto inferior de la card y, con un margen
      superior negativo, ASOMA por arriba — el mockup de celular de Figma, que
      parece salirse de la tarjeta en vez de flotar centrado.
    · Sección nueva `grid`: dos columnas donde CADA UNA apila sus propias cards,
      con alto independiente. Distinta de `columns`, que solo admite una card por
      lado y las obliga a igualar alto. La usa el correo de bienvenida para el
      bloque «Agrega fondos» (SubasCoins + fee | recarga BCP + sin fee). Cada card
      admite icono en burbuja que asoma por la esquina (default) o en columna
      propia a la izquierda (`iconLeft`), CTA primary en cualquiera de las dos,
      `l2Center` para centrar la segunda card de la izquierda, `rTitlePurple` para
      los títulos en morado en vez del naranja de acento, y `r2Indent` para tabular
      una lista de bullets bajo su título. Las cards oscuras van en COLOR PLANO
      (CARD_DARK_END) y radio 8px: así la burbuja de la esquina se funde con la card
      sin canto —dos gradientes en cajas distintas nunca calzan— igual que Figma.
      Registrarla exige tocar 4 sitios: el tipo `Section`, SECTION_LABELS, los
      `defaults` de createSection y SECTION_DESCRIPTIONS (en sectionPreviews.ts).
   ───────────────────────────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════════════════
   Secciones de correo VMC Subastas — layout original + estilo Concorde
   Tokens y distancias según patrones.md. Acento naranja solo en palabras clave.
   Marcadores de resaltado: **acento 800** · [[número morado 800]]
   Los merge tags {{variable}} pasan LITERALES (no se tocan) para tu plataforma de envío.
   ═══════════════════════════════════════════════════════════════════════════ */

const FONT_BODY = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const FONT_HEADING = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const FONT_NUMBER = "'Poppins', 'Plus Jakarta Sans', Arial, Helvetica, sans-serif"; // números
const C = {
  purple: '#3b1782', dark: '#0E016C', body: '#5a4d75',
  lavender: '#f5f3fe', accent: '#ed8936', divider: '#d5cfe8',
  navy: '#22005c', footerLink: '#A298B3', white: '#FFFFFF', bg: '#FAFAFA', // navy = vault-900 — concorde/components/Button.tsx (--vmc-color-vault-900)
  border: '#e7e1f7',
};
const G_VAULT = 'linear-gradient(135deg,#8460e5 0%,#3b1782 100%)';   // badges (vault)
const G_PRIMARY = 'linear-gradient(135deg,#ed8936 0%,#8460e5 100%)'; // botón Concorde (orange→vault) — flujo "En vivo"
const G_NEGOTIABLE = 'linear-gradient(125deg,#00aeb1 0%,#00aeb1 40%,#8460e5 100%)'; // botón teal — flujo "Negociable"
const G_PANEL = 'linear-gradient(135deg,#f6f3fe 0%,#efe9fb 100%)';
const GLOSS = 'inset 0 1px 0 rgba(255,255,255,0.35)';
const CONTAINER_W = '600';
const TEAL = '#00aeb1';
const SLATE = '#99a1af'; // neutral-700 — concorde/components/BidPosition.tsx (borde fila vault)
const G_ROW_VAULT = 'linear-gradient(90deg,#19004A 0%,#3B1782 50%,#2E0F70 100%)'; // fila "vault" — concorde/components/BidPosition.tsx (.pbidpos__row--vault)
const G_TEAL_BAR = 'linear-gradient(90deg,#00edee 0%,#00d2d3 50%,#009597 100%)'; // OfferCard variant="negotiable" — concorde/components/OfferCard.tsx
const G_LIVE = 'linear-gradient(180deg,#FF9639 0%,#EF852E 40%,#BE3D00 100%)'; // fila "1ª posición" — concorde/components/BidPosition.tsx (.pbidpos__row--live)
const WBC_SHADOW = '0 0 8px 4px rgba(0,0,0,0.08)'; // sombra de card — concorde/components/WalletBalanceCard.tsx (.wbc)
// bordes gradiente Concorde (capa border-box) — se emulan email-safe con tabla wrapper de padding 2px
const B_PRIMARY = 'linear-gradient(135deg,#ffffff 0%,#fbc47d 25%,#ae8eff 75%,#ffffff 100%)';    // Button.tsx .pvbtn
const B_NEGOTIABLE = 'linear-gradient(135deg,#ffffff 0%,#4ddcdc 25%,#6445df 75%,#ffffff 100%)'; // Button.tsx .pneg
const B_NEG_EDGE = 'linear-gradient(135deg,#ffffff 0%,#4DDCDC 25%,#6445DF 75%,#ffffff 100%)'; // borde negociable — CardViewer.tsx (.pcardv--negotiable)
const B_STAT = 'linear-gradient(125deg,#ffffff 0%,#F4AC59 22%,#8460E5 74.5%,#ffffff 100%)';     // StatPill.tsx borde glass
const TXT_SHADOW = 'rgba(0,0,0,0.25) 0 1px 3px';        // Button.tsx text-shadow
const GLOW_PRIMARY = 'rgba(237,137,54,0.3) 0 2px 6px';  // Button.tsx .pvbtn box-shadow glow
const GLOW_NEGOTIABLE = 'rgba(0,174,177,0.35) 0 2px 6px'; // Button.tsx .pneg box-shadow glow
const GLASS_SHEEN = 'linear-gradient(180deg,rgba(255,255,255,0.24) 0%,rgba(255,255,255,0.12) 45%,rgba(255,255,255,0.06) 100%)'; // StatPill.tsx glass base
const G_CONSOLE = 'linear-gradient(157deg,#5F3ED8 0%,#340091 50%,#140046 100%)';      // DetailCard.tsx .pdetail__head
/** Morado plano de las cards oscuras (el #391383 que usa el export de Figma). */
const CARD_DARK_END = '#391383';
const G_CONSOLE_NAVY = 'linear-gradient(157deg,#22005c 0%,#00005E 55%,#000042 100%)'; // variante navy, mismo ángulo
const B_GLASS_EDGE = 'linear-gradient(135deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.10) 45%,rgba(255,255,255,0.40) 100%)'; // canto de vidrio iluminado (::before glass de Concorde)
const G_STRIPE = 'linear-gradient(90deg,#ed8936 0%,#8460e5 55%,#3b1782 100%)'; // franja firma orange→vault (barra inferior de OfferCard)
const G_GREEN = 'linear-gradient(180deg,#4ED397 0%,#32BA7C 50%,#1E9E63 100%)'; // caja «De tu expectativa»
const GREEN = '#32BA7C'; // verde éxito ya usado en quote/won-vehicle
const WBC_VALUE = '#3B1782'; // label/value morado — concorde/components/WalletBalanceCard.tsx (.wbc__row-label/value)
const PCARD_NAME = '#4c1ebc';  // OfferCard .pcard__name
const PCARD_YEAR = '#191c1c';  // OfferCard .pcard__year
const HEART_PATH = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'; // LikeButton.tsx

// corazón de OfferCard/LikeButton — círculo blanco, borde lila, heart outline vault-600
function likeBadge(): string {
  return `<table border="0" cellpadding="0" cellspacing="0" width="22" height="22" bgcolor="#ffffff" style="border-radius:50%;border:1.5px solid #cfbaff;"><tr><td align="center" valign="middle" width="22" height="22"><svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff" stroke="#5a35c2" stroke-width="2"><path d="${HEART_PATH}"/></svg></td></tr></table>`;
}

export interface Section {
  id: string;
  type: 'title' | 'text' | 'panel' | 'features' | 'icon-text' | 'stats' | 'cta' | 'image' | 'spacer' | 'table' | 'details' | 'divider' | 'note' | 'amount' | 'offers' | 'vehicle' | 'negotiation' | 'quote' | 'won-vehicle' | 'costs' | 'list' | 'success' | 'columns' | 'action-card' | 'grid' | 'zoom-card' | 'video' | 'steps';
  content: Record<string, string>;
}

export const SECTION_LABELS: Record<Section['type'], string> = {
  title: 'Título',
  text: 'Párrafo',
  panel: 'Panel card',
  features: 'Fila de 3 features',
  'icon-text': 'Icono + texto',
  stats: 'Estadísticas',
  cta: 'Botón CTA',
  image: 'Imagen',
  spacer: 'Espaciador',
  table: 'Tabla datos',
  details: 'Lista de datos',
  divider: 'Divisor',
  note: 'Nota / aviso',
  amount: 'Monto destacado',
  offers: 'Grilla de ofertas (4)',
  vehicle: 'Foto de vehículo + miniaturas',
  negotiation: 'Barra de ronda de negociación',
  quote: 'Propuesta + garantía',
  'won-vehicle': 'Vehículo ganado (banner + conteo)',
  costs: 'Desglose de costos (3 cajas)',
  list: 'Lista con viñetas',
  success: 'Confirmación con check',
  columns: 'Dos columnas de texto',
  'action-card': 'Card de acción (copy + botón + icono)',
  grid: 'Grilla 2 columnas (cards apiladas)',
  'zoom-card': 'Card zoom (cabecera + cuerpo + CTA + callouts)',
  video: 'Video (poster con play → enlace)',
  steps: 'Pasos numerados (card oscura)',
};

export function createSection(type: Section['type']): Section {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const defaults: Record<Section['type'], Record<string, string>> = {
    title: { eyebrow: '', text: 'Título de la sección' },
    text: { text: 'Escribe tu contenido aquí. Usa **palabra** para acento o [[123]] para número.' },
    panel: { title: 'Título del panel', body: 'Contenido del panel.', iconUrl: '', badge: '', imageUrl: '', imageW: '85', imageH: '57' },
    features: { heading: '¿Qué debes tener en cuenta?', i1: '', t1: 'Texto 1', i2: '', t2: 'Texto 2', i3: '', t3: 'Texto 3' },
    'icon-text': { icon: '📌', title: 'Título del item', text: 'Descripción del item.' },
    stats: { s1v: '99', s1l: 'Etiqueta 1', s2v: '99', s2l: 'Etiqueta 2', s3v: '99', s3l: 'Etiqueta 3' },
    cta: { text: 'Click aquí', url: 'https://', variant: '' },
    image: { url: 'https://', alt: 'Imagen' },
    spacer: { height: '20' },
    table: { r1k: 'Concepto 1', r1v: 'Valor 1', r2k: 'Concepto 2', r2v: 'Valor 2', r3k: 'Concepto 3', r3v: 'Valor 3' },
    details: { l1: 'Etiqueta 1:', v1: 'Valor 1', l2: 'Etiqueta 2:', v2: 'Valor 2', l3: '', v3: '' },
    divider: {},
    note: { title: 'Recuerda:', body: 'Texto del aviso importante para el usuario.' },
    amount: { label: 'Monto:', value: 'US$ 0' },
    offers: {
      heading: '¡Tenemos más oportunidades negociables!', sub: 'Estas son algunas ofertas especiales para ti:',
      c1img: '', c1name: 'Vehículo', c1year: '2020',
      c2img: '', c2name: 'Vehículo', c2year: '2020',
      c3img: '', c3name: 'Vehículo', c3year: '2020',
      c4img: '', c4name: 'Vehículo', c4year: '2020',
    },
    vehicle: { img: '', tag: 'Vehículo', caption: 'Vendedor', thumb1: '', thumb2: '', thumb3: '' },
    negotiation: {
      round: '1°', roundLabel: 'Ronda de negociación.',
      yourLabel: 'Tu propuesta:', yourValue: 'US$ 0',
      sellerLabel: 'Vendedor propone:', sellerValue: 'US$ 0',
      expiresLabel: 'Vence', expiresValue: '',
    },
    quote: {
      proposalLabel: 'Tu propuesta:', proposalValue: 'US$ 0', expiresLabel: 'Vence', expiresValue: '',
      guaranteeLabel: 'En garantía:', guaranteeValue: '0', pctLabel: '', pctValue: '',
    },
    'won-vehicle': {
      img: '', tag: 'Vehículo', statLabel: 'Propuestas', statValue: '0',
      winLabel: 'Tu propuesta ganadora:', winValue: 'US$ 0', pctLabel: '', pctValue: '',
    },
    costs: { l1: 'Comisión:', v1: 'US$ 0', l2: 'En garantía:', v2: 'US$ 0', l3: 'Deuda:', v3: 'US$ 0' },
    list: { title: '', i1: 'Item 1', i2: '', i3: '' },
    success: { title: '¡Listo!', value: '', caption: '' },
    columns: { h1: 'Columna 1', body1: 'Texto 1', h2: 'Columna 2', body2: 'Texto 2' },
    'action-card': { text: 'Descripción de la acción.', btnText: 'VAMOS', url: 'https://', svg: '', bare: '' },
    grid: { l1Title: 'Card izquierda 1', l1Body: 'Contenido.', l1Svg: '', l1Btn: '', l1Url: '', dark1: '',
      l2Title: 'Card izquierda 2', l2Body: 'Contenido.',
      r1Title: 'Card derecha 1', r1Body: 'Contenido.', r1Svg: '',
      r2Title: 'Card derecha 2', r2Body: 'Contenido.', r2Svg: '' },
    'zoom-card': {
      headTitle: 'Cierre de inscripciones', headValue: 'Martes, 08 de Marzo 00:00 Hrs',
      amountLabel: 'Valor de restos', amountValue: 'US$ 0',
      note1: '', body: 'Texto del cuerpo.', btnText: 'Me interesa', url: 'https://',
      note2: '', variant: '',
    },
    video: { url: 'https://', poster: '', width: '270', caption: '', alt: '' },
    steps: { title: 'Tus pasos', s1: 'Paso uno|Detalle', s2: 'Paso dos|Detalle', s3: '', s4: '', s5: '', s6: '', s7: '', s8: '' },
  };
  return { id, type, content: { ...defaults[type] } };
}

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/** Destino de los ((enlaces)) mientras la maquetación no define la URL real.
    Es un merge tag, así que la plataforma de envío puede sustituirlo. */
const LINK_PLACEHOLDER = '{{url}}';

/**
 * Un enlace `<a>` con el color que pida el correo. `inner` es «texto» o
 * «texto|href»; sin href explícito se usa el merge tag {{url}}.
 */
function linkTag(inner: string, color: string): string {
  // `esc` ya corrió, así que el separador se busca sobre el texto escapado.
  const i = inner.lastIndexOf('|');
  const label = i === -1 ? inner : inner.slice(0, i);
  const href = i === -1 ? LINK_PLACEHOLDER : inner.slice(i + 1);
  return `<a href="${href}" target="_blank" style="font-weight:700;color:${color};text-decoration:underline;word-break:break-word;overflow-wrap:break-word;">${label}</a>`;
}

/** Escapa y aplica resaltado: **acento naranja 800** · __negrita oscura 700__ · %%negrita del color base%%
    · [[número Poppins 800]] · ((enlace subrayado)). Los merge tags {{variable}} quedan intactos.

    Las tres negritas son las tres que usa Figma, y se distinguen SOLO por color:
    naranja de acento, navy oscuro y %% —que no fija color, así que hereda el del
    cuerpo: negro en los correos con `ink: 'black'` y navy en el resto—. Sin %%
    no había forma de escribir esa tercera y caía en __ (navy), que es lo que
    descuadraba la comparación con Figma.

    Los ((enlaces)) salen como <a> real y subrayado. Dos formas:
      ((texto))      → href = {{url}} (placeholder: la maquetación aún no define
                       el destino, pero el HTML copiado ya es clicable).
      ((texto|href)) → href explícito, para los enlaces cuyo destino ya se conoce. */
function hl(s: string): string {
  // Los merge tags se apartan ANTES de resaltar y se reponen al final: su
  // contenido es dato, no marcado. Sin esto, una máscara de tarjeta como
  // {{Tarjeta.Ejem: 4444 **** **** 1235}} veía sus asteriscos como negrita y
  // salía con un <strong> naranja incrustado en medio del número.
  // El centinela usa  , que no puede aparecer en el texto ni casar con
  // ningún marcador, así que atraviesa los replace intacto.
  const tags: string[] = [];
  const guarded = esc(s).replace(/\{\{[\s\S]*?\}\}/g, function keep(m) {
    return ` ${tags.push(m) - 1} `;
  });

  return guarded
    .replace(/\*\*(.+?)\*\*/g, `<strong style="font-weight:800;color:${C.accent};">$1</strong>`)
    .replace(/%%(.+?)%%/g, `<strong style="font-weight:700;">$1</strong>`)
    .replace(/~~(.+?)~~/g, `<span style="font-weight:400;color:${C.purple};">$1</span>`)
    .replace(/\+\+(.+?)\+\+/g, `<span style="font-weight:400;color:#000000;">$1</span>`)
    // ^^…^^ — mismo texto de cuerpo, un punto más grande (16px). Sin color
    // propio: hereda el de la celda, así que sirve en cuerpos negros o navy.
    .replace(/\^\^(.+?)\^\^/g, `<span style="font-size:16px;">$1</span>`)
    // @@…@@ — un escalón más que ^^ (18px), mismo criterio: sin color propio.
    .replace(/@@(.+?)@@/g, `<span style="font-size:18px;">$1</span>`)
    // !!…!! — subtítulo de sección: acento naranja un punto más grande que el
    // cuerpo, para los «¿Qué es…?» que abren un bloque explicativo.
    // Greedy a propósito: un subtítulo que TERMINA en «!» («…activar tu
    // cuenta!!!») dejaría el signo fuera con `+?`, que cerraría en el primer
    // `!!` disponible. Al ser uno por línea, tomar hasta el último es correcto.
    .replace(/!!(.+)!!/g, `<span style="font-size:16px;font-weight:800;color:${C.accent};">$1</span>`)
    // ###…### y ##…## — subtítulo morado, dos escalones por encima del cuerpo.
    // El de 3 almohadillas va PRIMERO: con `##` delante, `###x###` casaría como
    // `#` + `#x#` + `#` y dejaría almohadillas sueltas en el texto.
    .replace(/####(.+)####/g, `<span style="font-size:26px;font-weight:800;color:${C.purple};">$1</span>`)
    .replace(/###(.+)###/g, `<span style="font-size:22px;font-weight:800;color:${C.purple};">$1</span>`)
    .replace(/##(.+)##/g, `<span style="font-size:19px;font-weight:800;color:${C.purple};">$1</span>`)
    .replace(/__(.+?)__/g, `<strong style="font-weight:700;color:${C.dark};">$1</strong>`)
    .replace(/\[\[(.+?)\]\]/g, `<strong style="font-weight:800;color:${C.purple};font-family:${FONT_NUMBER};">$1</strong>`)
    // ((texto)) enlace naranja · [[texto]] enlace morado — el color es del
    // correo, no del sistema: cada correo elige el suyo según su Figma.
    .replace(/\(\((.+?)\)\)/g, function link(_m, inner: string) {
      return linkTag(inner, C.accent);
    })
    .replace(/\{\[(.+?)\]\}/g, function purpleLink(_m, inner: string) {
      return linkTag(inner, C.dark);
    })
    .replace(/ (\d+) /g, function restore(_m, i: string) { return tags[Number(i)]; });
}

// panel lavanda Concorde (gradiente + borde + radio) — patrones: max-width 500
const panelOpen = `<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" bgcolor="${C.lavender}" style="border-radius:16px;border:1px solid ${C.border};background-image:${G_PANEL};max-width:500px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6), ${WBC_SHADOW};"><tr><td style="padding:16px 16px;">`;
const panelClose = `</td></tr></table>`;

function badgeCell(iconUrl: string, white: boolean): string {
  const box = white
    ? `bgcolor="#FFFFFF" style="border-radius:50%;border:1px solid ${C.border};box-shadow:inset 0 1px 0 rgba(255,255,255,0.6);"`
    : `bgcolor="${C.purple}" style="border-radius:50%;background-image:${G_VAULT};box-shadow:${GLOSS};"`;
  return `<td width="48" valign="middle"><table border="0" cellpadding="0" cellspacing="0" width="48" height="48" ${box}><tr><td align="center" valign="middle" width="48" height="48"><img src="${esc(iconUrl)}" width="30" height="30" alt="" border="0" style="display:block;"></td></tr></table></td>`;
}

function chipCell(iconUrl: string): string {
  return `<td width="32%" align="center" style="padding:0 6px;"><table border="0" cellpadding="0" cellspacing="0" width="58" height="58" align="center" bgcolor="${C.lavender}" style="border-radius:50%;border:1px solid ${C.border};box-shadow:inset 0 1px 0 rgba(255,255,255,0.6);"><tr><td align="center" valign="middle" width="58" height="58"><img src="${esc(iconUrl)}" width="34" height="34" alt="" border="0" style="display:block;margin:0 auto;"></td></tr></table></td>`;
}

const vDivider = `<table border="0" cellpadding="0" cellspacing="0" width="1" height="40" bgcolor="${C.divider}"><tr><td></td></tr></table>`;

export function renderSection(s: Section): string {
  const c = s.content;
  switch (s.type) {
    case 'title': {
      const eyebrow = c.eyebrow
        ? `<tr><td align="center" style="padding:0 16px 12px;font-family:${FONT_HEADING};"><table border="0" cellpadding="0" cellspacing="0" align="center"><tr><td bgcolor="#fff0e2" style="border-radius:9999px;padding:5px 13px;"><span style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.accent};font-family:${FONT_HEADING};">${esc(c.eyebrow)}</span></td></tr></table></td></tr>`
        : '';
      return `${eyebrow}<tr><td align="center" style="font-size:24px;font-weight:800;line-height:1.25;color:${C.purple};letter-spacing:-0.02em;font-family:${FONT_HEADING};padding:0 16px;"><b>${esc(c.text)}</b></td></tr>`;
    }
    case 'text':
      // `word-break` evita que una cadena larguísima sin espacios (una URL de
      // reset, un token) estire la celda y desborde la tabla de 600px.
      // `ink: 'black'` pinta el cuerpo en negro (los correos En vivo de Figma);
      // sin el flag se mantiene el navy de siempre.
      // `size: 'lg'` lo sube a 16px: lo usan los rótulos que encabezan un bloque
      // («Resumen de transacción:»), que en Figma pesan más que el cuerpo.
      // `narrow` estrecha la columna de texto (px) y la centra: para los avisos
      // que en Figma no ocupan todo el ancho del correo.
      return c.narrow
        ? `<tr><td align="center" style="padding:0 16px;"><table border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:${esc(c.narrow)}px;"><tr><td align="${c.align || 'left'}" style="font-size:${c.size === 'lg' ? '16px' : '14px'};font-family:${FONT_BODY};line-height:${c.size === 'lg' ? '24px' : '22px'};color:${c.ink === 'black' ? '#000000' : C.dark};word-break:break-word;overflow-wrap:break-word;">${hl(c.text)}</td></tr></table></td></tr>`
        : `<tr><td align="${c.align || 'left'}" style="font-size:${c.size === 'lg' ? '16px' : '14px'};font-family:${FONT_BODY};line-height:${c.size === 'lg' ? '24px' : '22px'};color:${c.ink === 'black' ? '#000000' : C.dark};padding:0 16px;word-break:break-word;overflow-wrap:break-word;">${hl(c.text)}</td></tr>`;
    case 'panel': {
      // `size: 'lg'` sube la tipografía del panel y `align: 'center'` centra su
      // contenido: el bloque de vehículo de los correos Mapfre, que en Figma
      // pesa más que un panel normal.
      const pLg = c.size === 'lg';
      const pAlign = c.align === 'center' ? 'text-align:center;' : '';
      const titleP = c.title ? `<p style="margin:0${(c.body || c.iconUrl || c.imageUrl) ? ' 0 6px' : ''};font-size:${pLg ? '20' : '14'}px;font-weight:${pLg ? '800' : '700'};line-height:1.35;color:${C.purple};font-family:${FONT_HEADING};${pAlign}">${hl(c.title)}</p>` : '';
      const bodyP = `<p style="margin:0;font-size:${pLg ? '20' : '14'}px;font-weight:${pLg ? '800' : '400'};line-height:1.45;color:${pLg ? C.purple : C.body};font-family:${FONT_HEADING};${pAlign}">${hl(c.body)}</p>`;
      const inner = (c.iconUrl || c.imageUrl)
        ? `${titleP}<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>${c.iconUrl ? badgeCell(c.iconUrl, c.badge === 'white') + '<td width="14"></td>' : ''}<td valign="middle">${bodyP}</td>${c.imageUrl ? `<td width="8"></td><td width="${esc(c.imageW || '85')}" valign="middle" align="right"><img src="${esc(c.imageUrl)}" width="${esc(c.imageW || '85')}" height="${esc(c.imageH || '57')}" alt="" border="0" style="display:block;"></td>` : ''}</tr></table>`
        : `${titleP}${bodyP}`;
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">${panelOpen}${inner}${panelClose}</td></tr>`;
    }
    case 'zoom-card': {
      // Card «con zoom» del Figma de Mapfre: cabecera morada + cuerpo crema con
      // el monto, el copy y el CTA, y hasta dos callouts naranjas anclados AL
      // ELEMENTO QUE EXPLICAN. En Figma los globos flotan a los lados con una
      // linea; en email no hay position:absolute fiable (Outlook) ni ancho para
      // una columna lateral en movil, asi que el globo va DEBAJO de su elemento
      // y la punta del SVG apunta hacia arriba. Misma lectura, layout email-safe.
      const zNeg = c.variant === 'negotiable';
      // Boton copiado de DetailCard.tsx (.pdetail__cta): 186x48, 16px/600 y el
      // inset blanco de 2px que le da el canto iluminado.
      const zBtn = c.btnText
        ? `<table border="0" cellpadding="0" cellspacing="0" align="center" style="border-radius:9999px;background-image:${zNeg ? B_NEGOTIABLE : B_PRIMARY};box-shadow:${zNeg ? GLOW_NEGOTIABLE : GLOW_PRIMARY};"><tr><td style="padding:2px;"><a href="${esc(c.url)}" target="_blank" style="display:inline-block;width:182px;background:${C.purple};background-image:${zNeg ? G_NEGOTIABLE : G_PRIMARY};color:${C.white};border-radius:9999px;padding:14px 0;font-family:${FONT_HEADING};font-size:16px;line-height:20px;font-weight:600;text-align:center;text-decoration:none;text-shadow:${TXT_SHADOW};box-shadow:inset 0 1px 0 2px rgba(255,255,255,0.28);">${esc(c.btnText)}</a></td></tr></table>`
        : '';
      // Globo naranja con la punta ABAJO (apunta al elemento que tiene debajo):
      // el del sorteo, que va fuera de la card. SVG inline, sin imagen externa.
      const callout = (txt: string) => txt
        ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="max-width:470px;">
<tr><td align="center" style="line-height:0;font-size:0;"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="11" viewBox="0 0 22 11" style="display:block;"><path d="M11 0 22 11H0z" fill="${C.accent}"/></svg></td></tr>
<tr><td style="border:1.5px solid ${C.accent};border-radius:12px;padding:11px 16px;background-color:#FFFFFF;"><p style="margin:0;font-size:13px;line-height:1.5;color:${C.accent};font-family:${FONT_HEADING};text-align:center;">${hl(txt)}</p></td></tr>
</table>`
        : '';
      // Globo LATERAL: caja naranja + punta a la IZQUIERDA, apuntando al monto
      // que queda a su lado. Va en la 3ª columna de la fila del monto, asi que
      // es una tabla de 2 celdas (punta | caja) alineada verticalmente al medio.
      const sideCallout = (txt: string) => txt
        ? `<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<td width="11" valign="middle" style="line-height:0;font-size:0;"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="22" viewBox="0 0 11 22" style="display:block;"><path d="M0 11 11 0v22z" fill="${C.accent}"/></svg></td>
<td valign="middle" align="center" style="border:1.5px solid ${C.accent};border-radius:10px;padding:9px 10px;background-color:#FFFFFF;"><p style="margin:0;font-size:11px;line-height:1.4;color:${C.accent};font-family:${FONT_HEADING};text-align:center;">${hl(txt)}</p></td>
</tr></table>`
        : '';
      const gap = (h: string) => `<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td height="${h}" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
      // Rejilla de 3 columnas: la card ocupa la CENTRAL y las laterales quedan
      // libres para los globos, que asi apuntan de lado —como en Figma— en vez
      // de apilarse debajo. La izquierda va vacia hoy: existe para equilibrar el
      // centrado de la card (sin ella, la derecha la empujaria fuera de eje).
      const COL_SIDE = 176;
      // 311 y el resto de medidas salen de DetailCard.tsx (.pdetail): mismo
      // ancho, mismo radio SOLO abajo (arriba va recto) y la misma sombra.
      const CARD_W = 311;
      // El globo lateral se alinea con «Valor de restos» empujandolo con un
      // spacer del alto de la cabecera. Es un numero calculado, no tanteado:
      // padding 26*2 + rotulo 15px*1.45 + margen 5 + fecha 15px*1.35 ≈ 99.
      // La fecha va en UNA linea (`white-space:nowrap`), asi que la cabecera
      // tiene alto fijo; si se cambia su tipografia, hay que recalcular esto.
      // OJO: 15px es el MAXIMO con el que una fecha larga («Miercoles, 12 de
      // Agosto 00:00 Hrs» = 277px) sigue cabiendo en los 287px utiles; subirla
      // mas la desborda, y con `nowrap` eso rompe el ancho de la card.
      const HEAD_H = 99;
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:${COL_SIDE * 2 + CARD_W}px;"><tr>
<td width="${COL_SIDE}" valign="middle"></td>
<td width="${CARD_W}" valign="top">
<table border="0" cellpadding="0" cellspacing="0" width="${CARD_W}" style="border-radius:0 0 8px 8px;box-shadow:rgba(0,0,0,0.1) 0 0 16px 4px;">
<tr><td bgcolor="#340091" align="center" style="background-image:${G_CONSOLE};padding:26px 12px;">
<p style="margin:0 0 5px;font-size:15px;font-weight:400;line-height:1.45;color:${C.white};font-family:${FONT_HEADING};">${esc(c.headTitle)}</p>
<p style="margin:0;font-size:15px;font-weight:700;line-height:1.35;letter-spacing:0.01em;color:${C.white};font-family:${FONT_HEADING};white-space:nowrap;">${esc(c.headValue)}</p>
</td></tr>
<tr><td bgcolor="#FFFFFF" align="center" style="border-radius:0 0 8px 8px;padding:24px 16px 48px;">
<p style="margin:0 0 4px;font-size:16px;font-weight:800;line-height:1.35;color:${C.accent};font-family:${FONT_HEADING};">${esc(c.amountLabel)}</p>
<p style="margin:0;font-size:26px;font-weight:800;line-height:1.3;color:${C.accent};font-family:${FONT_NUMBER};">${esc(c.amountValue)}</p>
${gap('18')}<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="max-width:240px;"><tr><td style="border-top:1px solid #E5E7EB;font-size:1px;line-height:1px;height:1px;">&nbsp;</td></tr></table>${gap('18')}
<table border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:216px;"><tr><td align="center" style="font-size:12px;line-height:16px;color:#191C1C;font-family:${FONT_HEADING};">${hl(c.body)}</td></tr></table>
${zBtn ? gap('28') + zBtn : ''}
</td></tr>
</table>
</td>
<td width="${COL_SIDE}" valign="top" style="padding-left:8px;">${c.note1 ? `${gap(String(HEAD_H))}${sideCallout(c.note1)}` : ''}</td>
</tr></table>
</td></tr>${c.note2 ? `
<tr><td align="center" style="padding:16px 16px 0;font-family:${FONT_HEADING};">${callout(c.note2)}</td></tr>` : ''}`;
    }
    case 'features':
      return `<tr><td align="center" style="padding:4px 16px 0;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
<tr><td align="center" style="padding-bottom:14px;"><span style="font-size:14px;font-weight:800;line-height:1.3;color:${C.purple};font-family:${FONT_HEADING};"><b>${esc(c.heading)}</b></span></td></tr>
<tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>${chipCell(c.i1)}<td width="2%"></td>${chipCell(c.i2)}<td width="2%"></td>${chipCell(c.i3)}</tr>
<tr><td height="12" colspan="5"></td></tr>
<tr>
<td width="32%" align="center" valign="top" style="padding:0 6px;font-size:12px;line-height:1.35;color:${C.body};font-family:${FONT_HEADING};">${hl(c.t1)}</td>
<td width="2%" align="center" valign="top">${vDivider}</td>
<td width="32%" align="center" valign="top" style="padding:0 6px;font-size:12px;line-height:1.35;color:${C.body};font-family:${FONT_HEADING};">${hl(c.t2)}</td>
<td width="2%" align="center" valign="top">${vDivider}</td>
<td width="32%" align="center" valign="top" style="padding:0 6px;font-size:12px;line-height:1.35;color:${C.body};font-family:${FONT_HEADING};">${hl(c.t3)}</td>
</tr></table></td></tr></table></td></tr>`;
    case 'action-card': {
      // Card con la acción a la IZQUIERDA (copy + botón) y el icono a la
      // derecha. `bare: 'true'` lo saca del panel lavanda y lo deja suelto en
      // el cuerpo, para el bloque que en Figma no va dentro de card.
      const bare = c.bare === 'true';
      const btn = c.btnText
        ? `<table border="0" cellpadding="0" cellspacing="0" align="left" style="border-radius:9999px;background-image:${B_PRIMARY};box-shadow:${GLOW_PRIMARY};"><tr><td style="padding:2px;"><a href="${esc(c.url)}" target="_blank" style="display:inline-block;background:${C.purple};background-image:${G_PRIMARY};color:${C.white};border-radius:9999px;padding:13px 44px;font-family:${FONT_HEADING};font-size:15px;font-weight:700;text-decoration:none;text-shadow:${TXT_SHADOW};box-shadow:inset 0 1px 0 rgba(255,255,255,0.30);">${esc(c.btnText)}</a></td></tr></table>`
        : '';
      // `sm` baja el cuerpo a 12px: para las cards donde el copy acompaña a un
      // grafico que ya manda (el mockup de celular) y no debe competir con el.
      const size = c.size === 'lg' ? { text: 17, icon: 116 }
        : c.size === 'sm' ? { text: 12, icon: 72 }
        : { text: 14, icon: 72 };
      // `items` (separados por |) pinta una fila de condiciones con punto naranja
      // debajo del copy, centrada — el bloque «Activación alternativa» de Figma.
      const items = c.items
        ? `<table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-top:10px;"><tr>${c.items.split('|').map(function cell(v) {
            return `<td valign="top" style="padding:0 10px;font-size:13px;line-height:1.6;color:${C.dark};font-family:${FONT_HEADING};white-space:nowrap;"><span style="color:${C.accent};">&bull;</span> ${hl(v.trim())}</td>`;
          }).join('')}</tr></table>`
        : '';
      const inner = `<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
${c.svgLeft ? `<td width="${esc(c.svgLeftW || '46')}" valign="middle" align="left" style="line-height:0;padding-right:10px;">${c.svgLeft}</td>` : ''}
<td valign="middle" align="${c.align === 'center' ? 'center' : 'left'}"><p style="margin:0;font-size:${size.text}px;line-height:1.45;color:${c.ink === 'black' ? '#000000' : C.body};font-family:${FONT_HEADING};">${hl(c.text).replace(/\n/g, '<br>')}</p>${btn ? `<table border="0" cellpadding="0" cellspacing="0"><tr><td height="14"></td></tr><tr><td>${btn}</td></tr></table>` : ''}${items}</td>
${c.svg ? `<td width="${c.svgGap || '16'}"></td><td width="${c.svgW || size.icon}" valign="${c.svgAlign === 'bottom' ? 'bottom' : 'middle'}" align="right" style="line-height:0;">${c.svg}</td>` : ''}
</tr></table>`;
      // `full: 'true'` deja el card a los 600px del correo (el panel de serie
      // se queda en 500 y aquí la fila copy+botón+icono necesita el ancho).
      let open = c.full === 'true' ? panelOpen.replace('max-width:500px;', '') : panelOpen;
      // `padY` (px) baja el alto de la card apretando su padding vertical: lo pide
      // la card cuyo icono ya ocupa todo el alto (el mockup de celular), donde el
      // padding de serie solo agregaba aire muerto arriba y abajo.
      if (c.padY) open = open.replace('padding:16px 16px;', `padding:${esc(c.padY)}px 16px;`);
      return bare
        ? `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">${inner}</td></tr>`
        : `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">${open}${inner}${panelClose}</td></tr>`;
    }
    case 'icon-text':
      // `svg` gana al emoji: se inyecta TAL CUAL (ya es markup de confianza,
      // copiado de un componente del sistema) y va sin el disco morado, porque
      // el icono trae su propia forma y color.
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">${panelOpen}
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>${c.svg
  ? `<td width="60" valign="middle" style="line-height:0;">${c.svg}</td>`
  : `<td width="48" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="48" height="48" bgcolor="${C.purple}" style="border-radius:50%;background-image:${G_VAULT};box-shadow:${GLOSS};"><tr><td align="center" valign="middle"><span style="font-size:22px;">${esc(c.icon)}</span></td></tr></table></td>`}
<td width="14"></td>
<td valign="middle"><p style="margin:0;font-size:14px;line-height:1.45;color:${c.ink === 'black' ? '#000000' : C.body};font-family:${FONT_HEADING};">${c.title ? `<b style="color:${C.purple};">${esc(c.title)}</b><br>` : ''}${hl(c.text).replace(/\n/g, '<br>')}</p></td>
</tr></table>${panelClose}</td></tr>`;
    case 'stats':
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">${panelOpen}
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="32%" align="center"><span style="display:block;font-size:20px;font-weight:800;color:${C.purple};font-family:${FONT_NUMBER};">${esc(c.s1v)}</span><span style="font-size:10px;color:${C.body};text-transform:uppercase;">${esc(c.s1l)}</span></td>
<td width="2%">${vDivider}</td>
<td width="32%" align="center"><span style="display:block;font-size:20px;font-weight:800;color:${C.purple};font-family:${FONT_NUMBER};">${esc(c.s2v)}</span><span style="font-size:10px;color:${C.body};text-transform:uppercase;">${esc(c.s2l)}</span></td>
<td width="2%">${vDivider}</td>
<td width="32%" align="center"><span style="display:block;font-size:20px;font-weight:800;color:${C.purple};font-family:${FONT_NUMBER};">${esc(c.s3v)}</span><span style="font-size:10px;color:${C.body};text-transform:uppercase;">${esc(c.s3l)}</span></td>
</tr></table>${panelClose}</td></tr>`;
    case 'cta': {
      // `variant: 'glass'`: pastilla de vidrio teal→violeta con brillo arriba,
      // borde blanco luminoso y flecha (correo oferta-publicada-vendedor).
      if (c.variant === 'glass') {
        return `<tr><td align="center"><table border="0" cellpadding="0" cellspacing="0" align="center" style="border-radius:9999px;background-image:linear-gradient(135deg,rgba(255,255,255,0.95) 0%,rgba(115,223,223,0.7) 45%,rgba(132,96,229,0.7) 100%);box-shadow:0 10px 28px rgba(0,174,177,0.32),0 4px 12px rgba(132,96,229,0.30);"><tr><td style="padding:2px;"><a href="${esc(c.url)}" target="_blank" style="display:inline-block;background:#3d8fd6;background-image:linear-gradient(180deg,rgba(255,255,255,0.30) 0%,rgba(255,255,255,0) 50%),linear-gradient(135deg,#00aeb1 0%,#5b6fe0 55%,#8460e5 100%);color:#ffffff;border-radius:9999px;padding:15px 48px;font-family:${FONT_HEADING};font-size:16px;font-weight:800;text-decoration:none;text-shadow:${TXT_SHADOW};box-shadow:inset 0 1px 0 rgba(255,255,255,0.55),inset 0 -6px 14px rgba(20,10,61,0.22);">${esc(c.text)} &rarr;</a></td></tr></table></td></tr>`;
      }
      const neg = c.variant === 'negotiable';
      const gradient = neg ? G_NEGOTIABLE : G_PRIMARY;
      const border = neg ? B_NEGOTIABLE : B_PRIMARY;
      const glow = neg ? GLOW_NEGOTIABLE : GLOW_PRIMARY;
      // borde gradiente de Button.tsx emulado con tabla wrapper (padding 2px = border-width)
      return `<tr><td align="center"><table border="0" cellpadding="0" cellspacing="0" align="center" style="border-radius:9999px;background-image:${border};box-shadow:${glow};"><tr><td style="padding:2px;"><a href="${esc(c.url)}" target="_blank" style="display:inline-block;background:${C.purple};background-image:${gradient};color:${C.white};border-radius:9999px;padding:13px 44px;font-family:${FONT_HEADING};font-size:15px;font-weight:700;text-decoration:none;text-shadow:${TXT_SHADOW};box-shadow:inset 0 1px 0 rgba(255,255,255,0.30);">${esc(c.text)}</a></td></tr></table></td></tr>`;
    }
    case 'image':
      // `width` fija el ancho en px (un logo, no una foto): además del atributo
      // —que es lo que respeta Outlook— se quita el radio, que en una marca
      // recortaría las esquinas.
      return c.width
        ? `<tr><td align="center" style="padding:0 16px;"><img src="${esc(c.url)}" alt="${esc(c.alt)}" width="${esc(c.width)}" style="display:block;margin:0 auto;width:${esc(c.width)}px;max-width:100%;height:auto;"></td></tr>`
        : `<tr><td align="center" style="padding:0 16px;"><img src="${esc(c.url)}" alt="${esc(c.alt)}" style="display:block;margin:0 auto;max-width:100%;height:auto;border-radius:12px;"></td></tr>`;
    case 'spacer':
      return `<tr><td height="${esc(c.height)}"></td></tr>`;
    case 'table':
      return `<tr><td align="center" style="padding:0 16px;">${panelOpen}
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="font-size:12px;color:${C.body};padding-bottom:8px;border-bottom:1px solid ${C.divider};font-family:${FONT_HEADING};">${esc(c.r1k)}</td><td style="font-size:12px;color:${C.purple};text-align:right;font-weight:700;padding-bottom:8px;border-bottom:1px solid ${C.divider};font-family:${FONT_NUMBER};">${esc(c.r1v)}</td></tr>
<tr><td style="font-size:12px;color:${C.body};padding:8px 0;border-bottom:1px solid ${C.divider};font-family:${FONT_HEADING};">${esc(c.r2k)}</td><td style="font-size:12px;color:${C.purple};text-align:right;font-weight:700;padding:8px 0;border-bottom:1px solid ${C.divider};font-family:${FONT_NUMBER};">${esc(c.r2v)}</td></tr>
<tr><td style="font-size:12px;color:${C.body};padding-top:8px;font-family:${FONT_HEADING};">${esc(c.r3k)}</td><td style="font-size:12px;color:${C.purple};text-align:right;font-weight:700;padding-top:8px;font-family:${FONT_NUMBER};">${esc(c.r3v)}</td></tr>
</table>${panelClose}</td></tr>`;
    case 'details': {
      const row = (l: string, v: string) => (l || v)
        // Figma: la ETIQUETA va en morado y en negrita; el VALOR en el mismo
        // morado pero con peso normal (antes iba la etiqueta naranja y el valor
        // en negrita, o sea justo al revés).
        // `boldValues` sube el VALOR a negrita (Figma lo pide en algunos
        // correos); sin el flag conserva el peso normal de siempre.
        ? `<tr><td valign="top" width="38%" style="font-size:14px;font-weight:700;color:${C.purple};font-family:${FONT_HEADING};padding:7px 12px 7px 0;line-height:1.4;">${hl(l)}</td><td valign="top" style="font-size:14px;font-weight:${c.boldValues === 'true' ? '700' : '500'};color:${C.purple};font-family:${FONT_HEADING};padding:7px 0;line-height:1.4;">${hl(v)}</td></tr>`
        : '';
      // `indent` mete la tabla hacia dentro (Figma la sangra respecto al
      // resto del cuerpo); sin el flag arranca en el margen de siempre.
      const pad = c.indent ? `0 16px 0 ${esc(c.indent)}px` : '0 16px';
      return `<tr><td align="center" style="padding:${pad};font-family:${FONT_HEADING};"><table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="max-width:500px;">${row(c.l1, c.v1)}${row(c.l2, c.v2)}${row(c.l3, c.v3)}</table></td></tr>`;
    }
    case 'divider':
      return `<tr><td align="center" style="padding:0 16px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="max-width:500px;"><tr><td style="border-top:1px solid ${C.border};font-size:1px;line-height:1px;height:1px;">&nbsp;</td></tr></table></td></tr>`;
    case 'note':
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" bgcolor="#FFFFFF" style="max-width:500px;border:1px solid ${C.border};border-radius:12px;box-shadow:${WBC_SHADOW};"><tr><td style="padding:14px 14px;">
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<td width="32" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="30" height="30" bgcolor="#fff0e2" style="border-radius:8px;"><tr><td align="center" valign="middle" width="30" height="30" style="font-size:17px;font-weight:800;color:${C.accent};font-family:${FONT_HEADING};line-height:1;">${c.icon || '!'}</td></tr></table></td>
<td width="10"></td>
<td valign="middle"><p style="margin:0;font-size:${c.size === 'lg' ? '16px' : '13px'};line-height:${c.size === 'lg' ? '24px' : '1.5'};color:${c.bodyTone === 'accent' ? C.accent : c.bodyTone === 'purple' ? C.purple : C.body};font-family:${FONT_HEADING};">${c.title ? `<b style="color:${C.accent};">${hl(c.title)}</b> ` : ''}${hl(c.body)}</p></td>
</tr></table></td></tr></table></td></tr>`;
    case 'amount':
      // borde gradiente de StatPill.tsx emulado con tabla wrapper (padding 1.5px ≈ 2px)
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" align="center" style="border-radius:16px;background-image:${c.edge === 'negotiable' ? B_NEG_EDGE : B_STAT};box-shadow:${WBC_SHADOW};"><tr><td style="padding:2px;">
<table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="${C.lavender}" style="border-radius:14px;background-image:${G_PANEL};"><tr><td align="center" style="padding:14px 26px;">
<p style="margin:0 0 4px;font-size:${c.labelTone ? '18' : '12'}px;${c.labelTone ? 'font-weight:800;' : ''}color:${c.labelTone === 'accent' ? C.accent : c.labelTone === 'purple' ? C.purple : C.body};font-family:${FONT_HEADING};">${esc(c.label)}</p>
<p style="margin:0;font-size:24px;font-weight:800;color:${C.purple};font-family:${FONT_NUMBER};">${esc(c.value)}</p>
</td></tr></table></td></tr></table></td></tr>`;
    case 'offers': {
      const card = (img: string, name: string, year: string) => `<td width="24%" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="border-radius:8px;box-shadow:0 0 16px 4px rgba(0,0,0,0.07);">
<tr><td>${img ? `<img src="${esc(img)}" width="100%" alt="" style="display:block;height:70px;object-fit:cover;border-radius:8px 8px 0 0;">` : `<div style="height:70px;background:${C.lavender};border-radius:8px 8px 0 0;"></div>`}</td></tr>
<tr><td style="padding:8px 8px 2px;"><span style="display:block;font-size:15px;font-weight:700;line-height:20px;color:${PCARD_NAME};font-family:${FONT_HEADING};">${esc(name)}</span><span style="display:block;margin-top:2px;font-size:11px;font-weight:500;line-height:16px;letter-spacing:0.06em;text-transform:uppercase;color:${PCARD_YEAR};font-family:${FONT_HEADING};">${esc(year)}</span></td></tr>
<tr><td align="right" style="padding:4px 8px 8px;">${likeBadge()}</td></tr>
<tr><td height="6" style="background-image:${G_TEAL_BAR};font-size:1px;line-height:1px;border-radius:0 0 8px 8px;">&nbsp;</td></tr>
</table></td>`;
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<span style="display:block;font-size:16px;font-weight:800;color:${C.purple};text-align:center;margin-bottom:14px;">${esc(c.heading)}</span>
<span style="display:block;font-size:14px;color:${C.body};text-align:center;margin-bottom:16px;">${esc(c.sub)}</span>
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
${card(c.c1img, c.c1name, c.c1year)}<td width="2%"></td>${card(c.c2img, c.c2name, c.c2year)}<td width="2%"></td>${card(c.c3img, c.c3name, c.c3year)}<td width="2%"></td>${card(c.c4img, c.c4name, c.c4year)}
</tr></table></td></tr>`;
    }
    case 'vehicle': {
      // 3 columnas (main + thumbs) comparten la misma altura total para que los bordes inferiores queden alineados
      const MAIN_H = 228;
      const thumbCount = c.thumb3 ? 3 : c.thumb2 ? 2 : 1;
      const thumbH = Math.round((MAIN_H - (thumbCount - 1) * 6) / thumbCount);
      const thumbRow = (src: string) => `<tr><td>${src ? `<img src="${esc(src)}" width="100%" alt="" style="display:block;height:${thumbH}px;object-fit:cover;border-radius:8px;">` : `<div style="width:100%;height:${thumbH}px;background:${C.lavender};border-radius:8px;"></div>`}</td></tr>`;
      const spacer = `<tr><td height="6"></td></tr>`;
      return `<tr><td style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<td width="70%" valign="top" style="position:relative;">
<div style="position:relative;border-radius:12px;overflow:hidden;line-height:0;">
${c.img ? `<img src="${esc(c.img)}" width="100%" alt="" style="display:block;height:${MAIN_H}px;object-fit:cover;border-radius:12px;">` : `<div style="width:100%;height:${MAIN_H}px;background:${C.lavender};border-radius:12px;"></div>`}
<span style="position:absolute;top:10px;left:10px;display:inline-block;white-space:nowrap;line-height:1;background:${TEAL};background-image:${G_TEAL_BAR};color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:9999px;font-family:${FONT_HEADING};">${esc(c.tag)}</span>
${c.caption ? `<span style="position:absolute;bottom:10px;left:10px;display:inline-block;white-space:nowrap;line-height:1;background:${c.tone === 'negotiable' ? TEAL : 'rgba(34,0,92,0.72)'};${c.tone === 'negotiable' ? `background-image:${G_TEAL_BAR};` : ''}color:#fff;font-size:11px;font-weight:600;padding:6px 12px;border-radius:9999px;font-family:${FONT_HEADING};">Ofrecido por ${esc(c.caption)}</span>` : ''}
</div>
</td>
<td width="4%"></td>
<td width="26%" valign="top">
<table border="0" cellpadding="0" cellspacing="0" width="100%">
${thumbRow(c.thumb1)}${spacer}${thumbRow(c.thumb2)}${c.thumb3 ? spacer + thumbRow(c.thumb3) : ''}
</table>
</td>
</tr></table></td></tr>`;
    }
    case 'negotiation': {
      // Colores 1:1 con concorde/components/BidPosition.tsx. `tone:
      // 'negotiable'` pinta la columna del vendedor con el teal del flujo
      // Negociable en vez del naranja de En vivo, y sube un escalón las
      // tipografías, que en Figma pesan más que las de la fila estándar.
      const nNeg = c.tone === 'negotiable';
      const sellerBg = nNeg ? TEAL : '#EF852E';
      const sellerGradient = nNeg ? G_TEAL_BAR : G_LIVE;
      // Con tono negociable las tipografías suben un escalón (Figma); sin el
      // flag se conservan las de la fila estándar.
      const nLbl = nNeg ? 14 : 11;
      const nVal = nNeg ? 23 : 16;
      const nRound = nNeg ? 13 : 12;
      const nRoundNum = nNeg ? 19 : 12;
      const nRoundBox = nNeg ? 34 : 26;
      const nExpH = nNeg ? 22 : 0;
      return `<tr><td style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:10px;overflow:hidden;"><tr>
<td width="30%" bgcolor="${TEAL}" valign="middle" style="background-image:${G_TEAL_BAR};padding:12px 10px;">
<table border="0" cellpadding="0" cellspacing="0" align="${nNeg ? 'center' : 'left'}"><tr>
<td width="${nRoundBox}" valign="middle"><table border="0" cellpadding="0" cellspacing="0" width="${nRoundBox}" height="${nRoundBox}" bgcolor="#ffffff" style="border-radius:50%;"><tr><td align="center" valign="middle" style="font-size:${nRoundNum}px;font-weight:800;color:${TEAL};font-family:${FONT_NUMBER};">${esc(c.round)}</td></tr></table></td>
<td width="8"></td>
<td style="font-size:${nRound}px;font-weight:700;color:#fff;line-height:1.3;font-family:${FONT_HEADING};">${esc(c.roundLabel)}</td>
</tr></table>
</td>
<td width="35%" bgcolor="${C.navy}" align="center" valign="middle" style="background-image:${G_ROW_VAULT};border-top:1px solid ${SLATE};border-bottom:1px solid ${SLATE};padding:12px 6px;">
<span style="display:block;font-size:${nLbl}px;color:#fff;font-family:${FONT_HEADING};white-space:nowrap;">${esc(c.yourLabel)}</span>
<span style="display:block;font-size:${nVal}px;font-weight:800;color:#fff;font-family:${FONT_NUMBER};white-space:nowrap;">${esc(c.yourValue)}</span>
</td>
<td width="35%" valign="top">
<table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%">
<tr><td bgcolor="${sellerBg}" align="center" style="background-image:${sellerGradient};padding:10px 6px 6px;">
<span style="display:block;font-size:${nLbl}px;color:#fff;font-family:${FONT_HEADING};white-space:nowrap;">${esc(c.sellerLabel)}</span>
<span style="display:block;font-size:${nVal}px;font-weight:800;color:#fff;font-family:${FONT_NUMBER};white-space:nowrap;">${esc(c.sellerValue)}</span>
</td></tr>
<tr><td bgcolor="${C.navy}" align="center" valign="middle"${nExpH ? ` height="${nExpH}"` : ''} style="padding:${nNeg ? '3px 6px' : '4px 6px'};"><span style="font-size:12px;font-weight:700;color:#fff;font-family:${FONT_HEADING};white-space:nowrap;">${esc(c.expiresLabel)} ${esc(c.expiresValue)}</span></td></tr>
</table>
</td>
</tr></table></td></tr>`;
    }
    case 'quote': {
      // altura fija (atributo height, no %) igual al alto natural del card de propuesta — más
      // confiable en clientes de email que depender del contenido; adentro, todo centrado verticalmente
      const QUOTE_SIDE_H = 92;
      const hasPct = !!c.pctValue;
      // Con bloque de porcentaje son TRES cajas en la fila (~150px cada una) y
      // el monto a 30px se parte en dos líneas; se baja un escalón para que
      // «US$ 20,000» entre de una sola pieza, como en Figma.
      const sideLabel = hasPct ? 13 : 15;
      const sideValue = hasPct ? 21 : 30;
      const quoteSideCard = (w: string, label: string, value: string) => `<td width="${w}" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="border-radius:16px;overflow:hidden;box-shadow:${WBC_SHADOW};"><tr>
<td height="${hasPct ? 78 : QUOTE_SIDE_H}" align="center" valign="middle" style="padding:10px 6px;">
<span style="display:block;font-size:${sideLabel}px;font-weight:600;letter-spacing:0.02em;color:${C.body};font-family:${FONT_HEADING};white-space:nowrap;">${esc(label)}</span>
<span style="display:block;margin-top:4px;font-size:${sideValue}px;font-weight:800;color:${WBC_VALUE};font-family:${FONT_NUMBER};white-space:nowrap;">${esc(value)}</span>
</td></tr></table></td>`;
      // Sin porcentaje, el card lateral («En garantía») no necesita la mitad del
      // ancho: su valor es corto y quedaba perdido en una caja enorme. Se le da
      // menos ancho y el de la propuesta se queda con el resto.
      const w = hasPct ? '32%' : '48%';
      const wMain = hasPct ? w : '56%';
      const wSide = hasPct ? w : '40%';
      // El tono «negotiable» pinta la propuesta con el teal del flujo Negociable
      // en vez del naranja de En vivo.
      const neg = c.tone === 'negotiable';
      const mainBg = neg ? TEAL : '#EF852E';
      const mainGradient = neg ? G_TEAL_BAR : G_LIVE;
      const pctBox = hasPct ? `<td width="4%"></td><td width="${w}" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" bgcolor="${neg ? TEAL : GREEN}" style="border-radius:14px;background-image:${neg ? G_TEAL_BAR : G_GREEN};box-shadow:${WBC_SHADOW};"><tr><td align="center" style="padding:14px 6px;">
<span style="display:block;font-size:11px;color:#fff;font-family:${FONT_HEADING};">${esc(c.pctLabel)}</span><span style="display:block;font-size:19px;font-weight:800;color:#fff;font-family:${FONT_NUMBER};">${esc(c.pctValue)}</span>
</td></tr></table></td>` : '';
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px;"><tr>
<td width="${wMain}" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:14px;overflow:hidden;box-shadow:${WBC_SHADOW};"><tr>
<td bgcolor="${mainBg}" align="center" style="padding:12px 8px 10px;background-image:${mainGradient};"><span style="display:block;font-size:${hasPct ? '13' : '15'}px;color:#fff;font-family:${FONT_HEADING};white-space:nowrap;">${esc(c.proposalLabel)}</span><span style="display:block;font-size:${hasPct ? '21' : '30'}px;font-weight:800;color:#fff;font-family:${FONT_NUMBER};white-space:nowrap;">${esc(c.proposalValue)}</span></td>
</tr><tr><td bgcolor="${C.purple}" align="center" style="padding:7px 10px;background-image:${G_ROW_VAULT};"><span style="font-size:13px;font-weight:700;color:#fff;font-family:${FONT_HEADING};">${esc(c.expiresLabel)} ${esc(c.expiresValue)}</span></td></tr>
</table></td>
<td width="4%"></td>
${quoteSideCard(wSide, c.guaranteeLabel, c.guaranteeValue)}
${pctBox}
</tr></table></td></tr>`;
    }
    case 'won-vehicle':
      return `<tr><td style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<td width="74%" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:12px;overflow:hidden;">
<tr><td style="position:relative;line-height:0;">
${c.img ? `<img src="${esc(c.img)}" width="100%" alt="" style="display:block;">` : `<div style="width:100%;height:150px;background:${C.lavender};"></div>`}
<span style="position:absolute;top:10px;left:10px;display:inline-block;white-space:nowrap;line-height:1;background:${TEAL};background-image:${G_TEAL_BAR};color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:9999px;font-family:${FONT_HEADING};">${esc(c.tag)}</span>
</td></tr>
<tr><td style="padding:8px 0 0;"><table border="0" cellpadding="0" cellspacing="0" width="70%" align="right" bgcolor="${C.navy}" style="border-radius:9999px;background-image:${G_ROW_VAULT};"><tr>
<td width="30" valign="middle" style="padding:8px 0 8px 12px;"><table border="0" cellpadding="0" cellspacing="0" width="26" height="26" bgcolor="#ffffff" style="border-radius:50%;"><tr><td align="center" valign="middle" width="26" height="26" style="font-size:13px;line-height:1;">🏆</td></tr></table></td>
<td width="8"></td>
<td valign="middle" align="left" style="padding:8px 0;"><span style="display:block;font-size:12px;line-height:1.25;color:#d8d2ec;font-family:${FONT_HEADING};">${esc(c.winLabel)}</span></td>
<td valign="middle" align="right" style="padding:8px 14px 8px 8px;"><span style="display:block;font-size:17px;font-weight:800;color:#fff;font-family:${FONT_NUMBER};white-space:nowrap;">${esc(c.winValue)}</span></td>
</tr></table></td></tr>
</table></td>
<td width="4%"></td>
<td width="22%" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td bgcolor="${c.tone === 'negotiable' ? TEAL : C.purple}" style="border-radius:12px;background-image:${c.tone === 'negotiable' ? G_TEAL_BAR : G_VAULT};box-shadow:${GLOSS};padding:12px 6px;" align="center">
<span style="display:block;font-size:12px;font-weight:600;color:#ffffff;font-family:${FONT_HEADING};">${esc(c.statLabel)}</span><span style="display:block;margin-top:2px;font-size:19px;font-weight:800;color:#fff;font-family:${FONT_NUMBER};">${esc(c.statValue)}</span>
</td></tr>${c.pctValue ? `<tr><td height="6"></td></tr><tr><td bgcolor="${c.tone === 'negotiable' ? TEAL : GREEN}" style="border-radius:12px;background-image:${c.tone === 'negotiable' ? G_TEAL_BAR : 'none'};box-shadow:${GLOSS};padding:12px 6px;" align="center">
<span style="display:block;font-size:12px;font-weight:600;color:#ffffff;font-family:${FONT_HEADING};">${esc(c.pctLabel)}</span><span style="display:block;margin-top:2px;font-size:19px;font-weight:800;color:#fff;font-family:${FONT_NUMBER};">${esc(c.pctValue)}</span>
</td></tr>` : ''}</table></td>
</tr></table></td></tr>`;
    case 'costs': {
      // `tone: 'negotiable'` pinta la caja de acento (la deuda) con el teal del
      // flujo Negociable en vez del naranja de En vivo.
      const cNeg = c.tone === 'negotiable';
      // El tamaño sube un escalón cuando el correo pide tono negociable
      // (Figma pesa más ahí); sin el flag conserva el tamaño de siempre.
      const cLbl = cNeg ? 13 : 11;
      const cVal = cNeg ? 22 : 16;
      const box = (l: string, v: string, accent?: boolean) => `<td width="32%" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${accent ? (cNeg ? TEAL : '#EF852E') : C.lavender}" style="border-radius:12px;${accent ? `background-image:${cNeg ? G_TEAL_BAR : G_LIVE};` : `border:1px solid ${C.border};`}"><tr><td align="center" style="padding:12px 6px;">
<span style="display:block;font-size:${cLbl}px;color:${accent ? '#fff' : C.body};font-family:${FONT_HEADING};white-space:nowrap;">${esc(l)}</span>
<span style="display:block;font-size:${cVal}px;font-weight:800;color:${accent ? '#fff' : C.purple};font-family:${FONT_NUMBER};white-space:nowrap;">${esc(v)}</span>
</td></tr></table></td>`;
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px;"><tr>${box(c.l1, c.v1)}<td width="2%"></td>${box(c.l2, c.v2)}<td width="2%"></td>${box(c.l3, c.v3, true)}</tr></table></td></tr>`;
    }
    case 'success': {
      // `wide: 'true'` estira el card a todo el ancho y sube un escalón las
      // tipografías; sin el flag, el card se ajusta a su contenido como siempre.
      const wide = c.wide === 'true';
      const sz = wide
        ? { title: 18, value: 38, caption: 17, extra: 17 }
        : { title: 13, value: 26, caption: 12, extra: 13 };
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" ${wide ? 'width="100%"' : 'align="center"'} bgcolor="${C.lavender}" style="border-radius:14px;border:1px solid ${C.border};"><tr><td align="center" style="padding:${wide ? '26px 30px' : '20px 26px'};">
<table border="0" cellpadding="0" cellspacing="0" width="46" height="46" bgcolor="${GREEN}" style="border-radius:50%;box-shadow:${GLOSS};"><tr><td align="center" valign="middle" width="46" height="46"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></td></tr></table>
<p style="margin:10px 0 0;font-size:${sz.title}px;font-weight:${c.lightTitle === 'true' ? '400' : '600'};color:${C.purple};font-family:${FONT_HEADING};">${hl(c.title)}</p>
<p style="margin:2px 0 0;font-size:${sz.value}px;font-weight:800;color:${C.purple};font-family:${FONT_NUMBER};">${esc(c.value)}</p>
<p style="margin:4px 0 0;font-size:${sz.caption}px;color:${c.lightTitle === 'true' ? C.purple : C.body};font-family:${FONT_HEADING};">${esc(c.caption)}</p>
${c.extra ? `<p style="margin:14px 0 0;font-size:${sz.extra}px;line-height:1.5;color:${C.purple};font-family:${FONT_HEADING};">${hl(c.extra).replace(/\n/g, '<br>')}</p>` : ''}
</td></tr></table></td></tr>`;
    }
    case 'columns':
      // `card: 'true'` mete cada columna en su propio panel lavanda, con el
      // título centrado y el cuerpo alineado a la izquierda (Figma).
      {
        const asCard = c.card === 'true';
        // Las dos cards igualan su alto SIN fijarlo: el fondo va en el <td> de
        // la columna, no en una tabla anidada dentro de él. Dos celdas hermanas
        // de la misma fila ya comparten alto por definición de tabla, así que
        // pintando ahí el panel, la card corta se estira sola hasta la larga.
        // (Con la tabla anidada esto no pasaba: la tabla conserva su alto
        // natural aunque su celda contenedora sea más alta.)
        // `icon1`/`icon2` ponen una burbuja que ASOMA por la esquina superior
        // izquierda de la card, como en Figma: circulo de 40px con margenes
        // negativos, y la card gana padding-top para dejarle el hueco.
        //
        // Lleva el GRADIENTE de consola (no un morado plano): aqui el circulo se
        // apoya sobre la card lavanda, asi que no hay canto que disimular y el
        // degradado le da el mismo volumen que a los demas iconos del correo. El
        // `bgcolor` plano queda de respaldo para los clientes sin gradientes.
        const bubble = (icon: string) => icon
          ? `<table border="0" cellpadding="0" cellspacing="0" align="left" style="margin:-40px 0 10px -4px;"><tr><td align="center" valign="middle" width="40" height="40" bgcolor="${CARD_DARK_END}" style="border-radius:50%;background-color:${CARD_DARK_END};background-image:${G_CONSOLE};">${icon}</td></tr></table>`
          : '';
        const col = (h: string, body: string, icon = '') => asCard
          ? `<td width="48%" valign="top" bgcolor="${C.lavender}" style="padding:${icon ? '28px 14px 16px' : '16px 14px'};border-radius:16px;border:1px solid ${C.border};background-image:${G_PANEL};box-shadow:inset 0 1px 0 rgba(255,255,255,0.6), ${WBC_SHADOW};">
${bubble(icon)}
<p style="margin:0 0 10px;font-size:15px;font-weight:800;color:${C.accent};font-family:${FONT_HEADING};text-align:center;">${esc(h)}</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:${C.purple};font-family:${FONT_HEADING};text-align:left;">${hl(body).replace(/\n/g, '<br>')}</p>
</td>`
          : `<td width="48%" valign="top" align="center" style="padding:0 6px;">
<p style="margin:0 0 8px;font-size:12px;font-weight:800;color:${C.accent};font-family:${FONT_HEADING};">${esc(h)}</p>
<p style="margin:0;font-size:11px;line-height:1.6;color:${C.body};font-family:${FONT_HEADING};">${hl(body).replace(/\n/g, '<br>')}</p>
</td>`;
        return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%"${asCard ? '' : ' style="max-width:500px;"'}><tr>
${col(c.h1, c.body1, c.icon1)}
<td width="4%"></td>
${col(c.h2, c.body2, c.icon2)}
</tr></table></td></tr>`;
      }
    case 'grid': {
      // Dos COLUMNAS, cada una con sus propias cards apiladas: la izquierda lleva
      // `l1..l2` y la derecha `r1..r2`. Distinto de `columns`, que solo admite una
      // card por lado y las obliga a igualar alto entre si.
      //
      // Cada card es una tabla dentro de su celda (no el fondo de la celda misma):
      // aqui SI se quiere que cada card conserve su alto natural, porque son piezas
      // independientes apiladas, no dos mitades de una fila.
      //
      // `dark1` pinta la primera card de la izquierda en morado con texto blanco
      // (la card destacada de Figma). `btnText`/`url` le agregan el boton primary.
      //
      // El ICONO admite dos colocaciones, ambas de Figma:
      //  · `iconLeft` — icono en una COLUMNA propia a la izquierda del copy (las
      //    cards de recarga BCP: banco y check).
      //  · por defecto — burbuja circular que ASOMA por la esquina superior
      //    izquierda, con el truco del original: un td redondo al que se le dan
      //    margenes negativos para que se salga de la card.
      interface GCard {
        title?: string; body?: string; dark?: boolean; icon?: string;
        iconLeft?: boolean; iconW?: string; btn?: string; url?: string; center?: boolean;
        /** Titulo en morado en vez del naranja de acento. */
        titlePurple?: boolean;
        /** Sangria (px) del cuerpo: tabula una lista de bullets bajo su titulo. */
        indent?: string;
      }
      const gcard = ({ title = '', body = '', dark = false, icon = '', iconLeft = false, iconW = '44', btn = '', url = '', center = false, titlePurple = false, indent = '' }: GCard): string => {
        if (!title && !body) return '';
        const fg = dark ? C.white : C.purple;
        // Con burbuja en la esquina la card gana padding ARRIBA (el hueco por donde
        // el circulo asoma), no a la izquierda: el copy debe arrancar al margen
        // normal, alineado con el resto de la card.
        const pad = !iconLeft && icon ? 'padding:22px 12px 12px 20px;' : 'padding:14px 12px;';
        // La card oscura lleva GRADIENTE. La burbuja de la esquina usa el color
        // donde ese gradiente empieza (arriba-izquierda, que es justo donde el
        // circulo la toca), asi el canto no se nota — ver `bubbleBg`.
        const bg = dark
          ? `bgcolor="${C.purple}" style="${pad}border-radius:16px;background-color:${C.purple};background-image:${G_CONSOLE};box-shadow:${WBC_SHADOW};"`
          : `bgcolor="${C.lavender}" style="${pad}border-radius:16px;border:1px solid ${C.border};background-image:${G_PANEL};box-shadow:inset 0 1px 0 rgba(255,255,255,0.6), ${WBC_SHADOW};"`;
        // Burbuja que asoma por la esquina (solo cuando el icono NO va en columna).
        //
        // Siempre en LAVANDA, tambien sobre las cards oscuras: al ser el fondo claro
        // del correo, el circulo se recorta contra el morado y el icono queda
        // enmarcado en vez de diluirse. Va en color plano —no en gradiente— porque
        // dos gradientes en cajas distintas nunca calzan y dejarian un canto visible.
        const bubbleBg = C.lavender;
        // Se sale por ARRIBA y por la IZQUIERDA a la vez: asi queda montada en la
        // esquina, como en el original, en vez de solo asomar por el borde superior.
        const bubble = icon && !iconLeft
          ? `<table border="0" cellpadding="0" cellspacing="0" align="left" style="margin:-34px 0 6px -26px;"><tr><td align="center" valign="middle" width="48" height="48" bgcolor="${bubbleBg}" style="border-radius:50%;background-color:${bubbleBg};">${icon}</td></tr></table>`
          : '';
        // Explicito siempre: el <td> de la columna hereda un `align="center"` del
        // contenedor, asi que sin esto el copy de la card saldria centrado.
        const ta = center ? 'text-align:center;' : 'text-align:left;';
        const headColor = dark ? C.white : titlePurple ? C.purple : C.accent;
        // El titulo respeta los saltos de linea (como el cuerpo): a veces se quiere
        // decidir donde corta en vez de dejarlo al ajuste automatico.
        const head = title ? `<p style="margin:0 0 6px;font-size:13px;font-weight:800;color:${headColor};font-family:${FONT_HEADING};${ta}">${hl(title).replace(/\n/g, '<br>')}</p>` : '';
        const ind = indent ? `padding-left:${esc(indent)}px;` : '';
        const copy = body ? `<p style="margin:0;font-size:11.5px;line-height:1.6;color:${fg};font-family:${FONT_HEADING};${ta}${ind}">${hl(body).replace(/\n/g, '<br>')}</p>` : '';
        // El CTA va en UNA linea: `white-space:nowrap` evita que el texto largo
        // («¡QUIERO ADQUIRIR SUBASCOINS!») se parta en dos dentro de la pastilla.
        const cta = btn
          ? `<table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-top:12px;border-radius:9999px;background-image:${B_PRIMARY};box-shadow:${GLOW_PRIMARY};"><tr><td style="padding:2px;"><a href="${esc(url)}" target="_blank" style="display:inline-block;background:${C.purple};background-image:${G_PRIMARY};color:${C.white};border-radius:9999px;padding:10px 18px;font-family:${FONT_HEADING};font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;text-shadow:${TXT_SHADOW};box-shadow:inset 0 1px 0 rgba(255,255,255,0.30);">${esc(btn)}</a></td></tr></table>`
          : '';
        // Con `iconLeft` la card se parte en dos columnas: icono | copy.
        const inner = iconLeft && icon
          ? `<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td width="${esc(iconW)}" valign="top" style="line-height:0;padding-right:10px;">${icon}</td><td valign="top">${head}${copy}${cta}</td></tr></table>`
          : `${bubble}${head}${copy}${cta}`;
        return `<table border="0" cellpadding="0" cellspacing="0" width="100%" ${bg}><tr><td>${inner}</td></tr></table>`;
      };
      // Separacion entre las dos cards apiladas de una columna. `gapY` la ajusta:
      // la burbuja de la card de abajo asoma por su borde superior, asi que un hueco
      // corto las deja pegadas visualmente aunque el margen exista.
      const gapY = c.gapY || '12';
      const stack = (a: string, b: string): string => a && b
        ? `${a}<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td height="${esc(gapY)}" style="font-size:0;line-height:${esc(gapY)}px;">&nbsp;</td></tr></table>${b}`
        : `${a}${b}`;
      const left = stack(
        gcard({ title: c.l1Title, body: c.l1Body, dark: c.dark1 === 'true', icon: c.l1Svg }),
        // El CTA vive en la SEGUNDA card de la izquierda (la del fee), no en la
        // morada: asi es en Figma, y de paso el boton queda centrado bajo su copy.
        gcard({ title: c.l2Title, body: c.l2Body, btn: c.l2Btn, url: c.l2Url, center: c.l2Center === 'true' }),
      );
      const right = stack(
        gcard({ title: c.r1Title, body: c.r1Body, icon: c.r1Svg, iconLeft: true, iconW: c.r1SvgW, titlePurple: c.rTitlePurple === 'true' }),
        gcard({ title: c.r2Title, body: c.r2Body, icon: c.r2Svg, iconLeft: true, iconW: c.r2SvgW, titlePurple: c.rTitlePurple === 'true', indent: c.r2Indent }),
      );
      return `<tr><td align="center" style="padding:0 16px;font-family:${FONT_HEADING};">
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<td width="48%" valign="top">${left}</td>
<td width="4%"></td>
<td width="48%" valign="top">${right}</td>
</tr></table></td></tr>`;
    }
    case 'list': {
      // `align: 'center'` NO centra cada línea: centra el BLOQUE y deja los
      // items alineados entre sí a la izquierda, que es como se leen en Figma.
      // La viñeta va en naranja de acento.
      const centered = c.align === 'center';
      // `ink: 'black'` pinta los items en negro (el cuerpo de algunos correos).
      const lInk = c.ink === 'black' ? '#000000' : C.dark;
      // La vinieta va en naranja de acento salvo que se pida `bulletTone: 'ink'`.
      // Antes su color estaba ligado a `centered`, asi que una lista alineada a la
      // izquierda perdia el naranja de Figma sin motivo.
      const bullet = c.bulletTone === 'ink' ? lInk : C.accent;
      const item = (v: string) => v
        ? `<tr><td width="14" valign="top" style="font-size:13px;line-height:1.9;color:${bullet};font-family:${FONT_HEADING};">•</td><td style="font-size:13px;line-height:${centered ? '1.9' : '1.6'};color:${lInk};font-family:${FONT_HEADING};">${hl(v)}</td></tr>`
        : '';
      // `layout: 'row'` pone los items en UNA fila —dos condiciones lado a lado,
      // como en Figma— en vez de apilarlos.
      if (c.layout === 'row') {
        const cell = (v: string) => v
          ? `<td valign="top" style="font-size:13px;line-height:1.6;color:${C.dark};font-family:${FONT_HEADING};"><span style="color:${C.accent};">&bull;</span> ${hl(v)}</td>`
          : '';
        return `<tr><td style="padding:0 16px;font-family:${FONT_HEADING};"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>${cell(c.i1)}${cell(c.i2)}${cell(c.i3)}${cell(c.i4)}</tr></table></td></tr>`;
      }
      const rows = `${item(c.i1)}${item(c.i2)}${item(c.i3)}${item(c.i4)}`;
      // `indent` (px) tabula la lista bajo su rotulo: se suma al padding del lado
      // por el que se lee, asi los items quedan sangrados como una sub-lista.
      const lPad = c.indent ? `padding:0 16px 0 ${16 + Number(c.indent)}px;` : 'padding:0 16px;';
      return `<tr><td align="${centered ? 'center' : 'left'}" style="${lPad}font-family:${FONT_HEADING};">
${c.title ? `<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${C.purple};font-family:${FONT_HEADING};">${esc(c.title)}</p>` : ''}
${centered
  ? `<table border="0" cellpadding="0" cellspacing="0" align="center">${rows}</table>`
  : `<table border="0" cellpadding="0" cellspacing="0" width="100%">${rows}</table>`}
</td></tr>`;
    }
    case 'video':
      // ponytail: Gmail y Outlook no reproducen <video>; el poster trae el play
      // horneado y enlaza al MP4 (Litmus usa el mismo patrón). Apple Mail sí
      // reproduce <video>: si pesa, se suma con este poster de fallback.
      // El pie es una pastilla clicable (área táctil ≥ 40px), no un link suelto.
      return `<tr><td align="center" style="padding:0 16px;"><a href="${esc(c.url)}" target="_blank" style="display:block;text-decoration:none;"><img src="${esc(c.poster)}" alt="${esc(c.alt || c.caption || 'Ver video')}" width="${esc(c.width || '270')}" border="0" style="display:block;margin:0 auto;width:${esc(c.width || '270')}px;max-width:100%;height:auto;border-radius:20px;box-shadow:0 16px 36px rgba(28,17,82,0.22);"></a>${c.caption ? `<table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-top:14px;"><tr><td style="border-radius:9999px;background-color:${C.lavender};border:1px solid rgba(132,96,229,0.30);"><a href="${esc(c.url)}" target="_blank" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:700;line-height:20px;color:${C.purple};font-family:${FONT_HEADING};text-decoration:none;">&#9654;&nbsp; ${esc(c.caption)}</a></td></tr></table>` : ''}</td></tr>`;
    case 'steps': {
      // Card de VIDRIO CLARO (esmerilado lavanda): sobre el cuerpo blanco, para
      // que los únicos bloques oscuros sean banner y footer y el CTA quede como
      // foco. Halos teal/violeta muy suaves, cada paso en su lámina translúcida
      // y el número en una «perla» con brillo. Sin backdrop-filter (ningún
      // cliente de correo lo aplica): el vidrio se finge con gradientes.
      // Cada paso es «Título|detalle»; hasta 8.
      const items = [c.s1, c.s2, c.s3, c.s4, c.s5, c.s6, c.s7, c.s8].filter(Boolean);
      const pearl = (n: number) => `<table border="0" cellpadding="0" cellspacing="0" width="32" height="32"><tr><td align="center" valign="middle" width="32" height="32" bgcolor="#6f86ee" style="border-radius:50%;background-image:radial-gradient(circle at 32% 28%,rgba(255,255,255,0.75) 0%,rgba(255,255,255,0) 42%),linear-gradient(135deg,#00aeb1 0%,#6f86ee 55%,#8460e5 100%);border:1px solid rgba(255,255,255,0.9);box-shadow:0 4px 10px rgba(91,111,224,0.35);font-size:14px;font-weight:800;color:#ffffff;font-family:${FONT_NUMBER};">${n}</td></tr></table>`;
      // `marks` («📲|⚖️|💸») cambia los números por un emoji en perla blanca: para
      // listas de beneficios, donde el orden no importa.
      const marks = c.marks ? c.marks.split('|') : null;
      const mark = (m: string) => `<table border="0" cellpadding="0" cellspacing="0" width="32" height="32"><tr><td align="center" valign="middle" width="32" height="32" bgcolor="#ffffff" style="border-radius:50%;border:1px solid rgba(132,96,229,0.25);box-shadow:0 4px 10px rgba(91,111,224,0.18);font-size:16px;line-height:1;">${m}</td></tr></table>`;
      const rows = items.map((v, i) => {
        const [t, d] = v.split('|');
        return `<tr><td style="padding:0 0 8px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="border-radius:14px;background-color:rgba(255,255,255,0.78);border:1px solid rgba(132,96,229,0.18);box-shadow:inset 0 1px 0 #ffffff,0 2px 8px rgba(59,23,130,0.06);"><tr><td width="32" valign="middle" style="padding:12px 0 12px 14px;">${marks ? mark(marks[i]) : pearl(i + 1)}</td><td valign="middle" style="padding:12px 16px 12px 14px;font-family:${FONT_HEADING};"><p style="margin:0;font-size:15px;font-weight:800;line-height:1.3;color:${C.dark};">${hl(t)}</p>${d ? `<p style="margin:2px 0 0;font-size:16px;line-height:24px;color:${C.body};">${hl(d)}</p>` : ''}</td></tr></table></td></tr>`;
      }).join('');
      const head = c.title
        ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 14px;"><tr><td><h2 style="margin:0;font-size:20px;font-weight:800;line-height:1.3;letter-spacing:-0.01em;color:${C.purple};font-family:${FONT_HEADING};">${esc(c.title)}</h2></td><td align="right" valign="middle"><span style="display:inline-block;border-radius:9999px;padding:4px 11px;background-color:rgba(0,174,177,0.10);border:1px solid rgba(0,174,177,0.35);font-size:12px;font-weight:800;color:#00797b;font-family:${FONT_HEADING};white-space:nowrap;">${items.length} pasos</span></td></tr></table>`
        : '';
      // Borde luminoso: wrapper de 1px con gradiente (mismo truco que el CTA).
      return `<tr><td align="center" style="padding:0 16px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:22px;background-image:linear-gradient(150deg,#ffffff 0%,rgba(0,174,177,0.35) 35%,rgba(132,96,229,0.40) 75%,#ffffff 100%);box-shadow:0 18px 40px rgba(59,23,130,0.14);"><tr><td style="padding:1px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f5f3fe" style="border-radius:21px;background-image:radial-gradient(circle at 95% 0%,rgba(0,174,177,0.16) 0%,rgba(0,174,177,0) 40%),radial-gradient(circle at 0% 100%,rgba(132,96,229,0.18) 0%,rgba(132,96,229,0) 50%),linear-gradient(180deg,#fbfaff 0%,#f0ebff 100%);"><tr><td style="padding:22px 20px 14px;">${head}<table border="0" cellpadding="0" cellspacing="0" width="100%">${rows}</table></td></tr></table></td></tr></table></td></tr>`;
    }
    default: return '';
  }
}

// ─── Header glass (gradiente consola DetailCard + panel con canto de vidrio) ───
function glassHeader(): string {
  return `<tr><td align="center" valign="middle" bgcolor="${C.purple}" style="background-color:${C.purple};background-image:${G_CONSOLE};padding:30px 24px 26px;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:20px;background-image:${B_GLASS_EDGE};"><tr><td style="padding:1px;">
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" valign="middle" style="border-radius:19px;background-color:rgba(255,255,255,0.10);background-image:${GLASS_SHEEN};box-shadow:inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.10);padding:26px 22px;">
<img src="https://cdn.vmcsubastas.com/services/mailing/images/vmcsubastas-mail-header.png" style="display:block;margin:0 auto;max-width:100%;height:auto;" alt="VMC Subastas">
</td></tr></table>
</td></tr></table></td></tr>
<tr><td height="4" bgcolor="#ed8936" style="background-image:${G_STRIPE};font-size:1px;line-height:1px;">&nbsp;</td></tr>`;
}

// ─── Pre-footer glass + footer completo (layout original) ───────────────────
function glassFooter(): string {
  const miniRule = (align: string) => `<table border="0" cellpadding="0" cellspacing="0" width="36" align="${align}" style="border-radius:2px;background-image:${G_STRIPE};"><tr><td height="3" style="font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`;
  const vamosBtn = `<a href="https://ayuda.vmcsubastas.com/es/collections/3079940-centro-de-ayuda-comprador" target="_blank" style="text-decoration:none;"><table border="0" cellspacing="0" cellpadding="0" align="right" style="border-radius:9999px;background-image:${B_PRIMARY};box-shadow:${GLOW_PRIMARY};"><tr><td style="padding:2px;"><table border="0" width="140" cellspacing="0" cellpadding="0"><tr><td width="140" height="38" bgcolor="#3b1782" style="border-radius:9999px;background-image:${G_PRIMARY};box-shadow:inset 0 1px 0 rgba(255,255,255,0.30);font-family:${FONT_HEADING};font-size:14px;font-weight:700;color:#FFFFFF;text-shadow:${TXT_SHADOW};" align="center" valign="middle"><b>¡Vamos!</b></td></tr></table></td></tr></table></a>`;
  // consola única compacta (DetailCard): un solo card glass, marca | imagen arriba,
  // hairline interno (.pdetail__hline) y fila de acción con CTA abajo
  return `<tr><td height="4" bgcolor="#ed8936" style="background-image:${G_STRIPE};font-size:1px;line-height:1px;">&nbsp;</td></tr>
<tr><td align="center" width="600" bgcolor="${C.purple}" style="background-color:${C.purple};background-image:${G_CONSOLE};padding:16px 20px;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:18px;background-image:${B_GLASS_EDGE};"><tr><td style="padding:1px;">
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="border-radius:17px;background-color:rgba(255,255,255,0.10);background-image:${GLASS_SHEEN};box-shadow:inset 0 1px 0 rgba(255,255,255,0.30);padding:16px 20px;">
<table border="0" width="100%" cellspacing="0" cellpadding="0"><tr>
<td valign="middle">
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="left" style="font-family:${FONT_HEADING};font-size:20px;font-weight:800;letter-spacing:-0.01em;line-height:1.2;color:#FFFFFF;">VMC Subastas</td></tr>
<tr><td height="8" align="left" valign="bottom">${miniRule('left')}</td></tr>
<tr><td height="5"></td></tr>
<tr><td align="left" style="font-family:${FONT_HEADING};font-size:13px;font-weight:500;line-height:1.4;color:#d8d2ec;">¡Despierta al cazador de ofertas que hay en ti!</td></tr>
</table>
</td>
<td width="16"></td>
<td width="160" valign="middle" align="right"><img src="https://cdn.vmcsubastas.com/services/mailing/inhabilitacion-cuenta/con-todo-footer.png" width="160" height="59" alt="VMC Subastas" style="border:0;display:block;max-width:100%;height:auto;"></td>
</tr></table>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td height="12"></td></tr>
<tr><td height="1" style="background-color:rgba(255,255,255,0.28);font-size:1px;line-height:1px;">&nbsp;</td></tr>
<tr><td height="12"></td></tr>
</table>
<table border="0" width="100%" cellspacing="0" cellpadding="0"><tr>
<td valign="middle">
<span style="display:block;font-family:${FONT_HEADING};font-size:15px;font-weight:800;letter-spacing:-0.01em;line-height:1.3;color:#FFFFFF;">¿Quieres saber más?</span>
<span style="display:block;margin-top:2px;font-family:${FONT_HEADING};font-size:12px;font-weight:500;line-height:1.4;color:#d8d2ec;">¡Visita nuestro <b style="color:#FFFFFF;">Centro de Ayuda!</b></span>
</td>
<td width="14"></td>
<td width="146" valign="middle" align="right">${vamosBtn}</td>
</tr></table>
</td></tr></table>
</td></tr></table>
</td></tr>
<tr bgcolor="#FFFFFF"><td align="center" width="600">
<table border="0" cellpadding="0" cellspacing="0" width="600" align="center"><tr><td width="28"></td><td>
<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
<tr><td height="26"></td></tr>
<tr><td align="center"><a href="https://www.vmcsubastas.com/" target="_blank" style="font-size:24px;font-family:${FONT_BODY};line-height:28px;color:${C.footerLink};text-decoration:none;"><b>www.vmcsubastas.com</b></a></td></tr>
<tr><td height="20"></td></tr>
<tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top"><table cellpadding="0" cellspacing="0">
<tr><td><a href="https://www.subascars.com/quienes-somos" target="_blank" style="font-size:9px;font-family:${FONT_BODY};line-height:22px;color:${C.dark};text-decoration:none;font-weight:700;">Quienes somos</a></td></tr>
<tr><td><a href="https://www.subascars.com/" target="_blank" style="font-size:9px;font-family:${FONT_BODY};line-height:22px;color:${C.dark};text-decoration:none;font-weight:700;">SubasCars</a></td></tr>
<tr><td><a href="https://www.subascars.com/como-vender-mi-auto-en-peru" target="_blank" style="font-size:9px;font-family:${FONT_BODY};line-height:22px;color:${C.dark};text-decoration:none;font-weight:700;">¿Cómo vender?</a></td></tr>
<tr><td><a href="https://www.vmcsubastas.com/login?redirect_after_to=/zona" target="_blank" style="font-size:9px;font-family:${FONT_BODY};line-height:22px;color:${C.dark};text-decoration:none;font-weight:700;">¿Cómo obtener acceso ilimitado a las subastas?</a></td></tr>
<tr><td><a href="https://blog.subascars.com/" target="_blank" style="font-size:9px;font-family:${FONT_BODY};line-height:22px;color:${C.dark};text-decoration:none;font-weight:700;">SubasBlog: La guía definitiva de subastas y venta de autos</a></td></tr>
</table></td>
<td width="15%"></td>
<td valign="top"><table cellpadding="0" cellspacing="0">
<tr><td align="right"><a href="https://ayuda.vmcsubastas.com/es/collections/3079940-centro-de-ayuda-comprador" target="_blank" style="font-size:9px;font-family:${FONT_BODY};line-height:28px;color:${C.dark};text-decoration:none;font-weight:700;">Contáctanos</a></td></tr>
<tr><td align="right"><a href="https://www.vmcsubastas.com/condiciones-y-terminos" target="_blank" style="font-size:9px;font-family:${FONT_BODY};line-height:28px;color:${C.dark};text-decoration:none;font-weight:700;">Condiciones y Términos</a></td></tr>
<tr><td align="center" style="font-size:9px;font-family:${FONT_BODY};line-height:22px;color:${C.dark};font-weight:400;">Encuéntranos en:</td></tr>
<tr align="right"><td>
<a href="https://www.facebook.com/vmcsubastas" target="_blank"><img src="https://cdn.vmcsubastas.com/services/boletin/2025-09-08/assets/facebook.png" style="max-width:20px;height:auto;margin-right:5px;" alt="VMC"></a>
<a href="https://www.youtube.com/channel/UCedBvYb6zP27x2u-t-Wk-qQ" target="_blank"><img src="https://cdn.vmcsubastas.com/services/boletin/2025-09-08/assets/youtube.png" style="max-width:20px;height:auto;margin-right:5px;" alt="VMC"></a>
<a href="https://x.com/vmcsubastas" target="_blank"><img src="https://cdn.vmcsubastas.com/services/boletin/2025-09-08/assets/twitter.png" style="max-width:20px;height:auto;margin-right:5px;" alt="VMC"></a>
<a href="https://www.instagram.com/vmcsubastas/" target="_blank"><img src="https://cdn.vmcsubastas.com/services/boletin/2025-09-08/assets/instagram.png" style="max-width:20px;height:auto;" alt="VMC"></a>
</td></tr>
</table></td>
</tr></table></td></tr>

<tr><td height="8"></td></tr>
<tr><td align="center" style="font-size:8px;font-family:${FONT_BODY};line-height:22px;color:${C.dark};">2026 VMC Subastas. Todos los derechos reservados.</td></tr>
<tr><td height="24"></td></tr>
</table></td><td width="28"></td></tr></table></td></tr>`;
}

export function generateEmail(sections: Section[], title: string = 'VMC Subastas'): string {
  const body = sections.map(renderSection).join('\n');
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta property="og:title" content="${esc(title)}">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0" style="background-color:${C.bg}!important;margin:0;padding:0;">
<center>
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;width:100%;">
<tr><td align="center" valign="top">
<table border="0" width="${CONTAINER_W}" cellspacing="0" cellpadding="0" align="center" bgcolor="${C.white}" style="padding:20px;">
${glassHeader()}
<tr><td height="20"></td></tr>
${body}
${glassFooter()}
</table>
</td></tr>
</table>
</center>
</body>
</html>`;
}
