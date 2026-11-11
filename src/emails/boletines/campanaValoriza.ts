/**
 * Campaña «Valoriza y Vende» — 6 boletines, uno por tema:
 *   1. Antes de comprar, valoriza          4. ¿Sabes que puedes valorizar y luego publicar?
 *   2. Antes de vender, valoriza           5. ¡Un nuevo canal de venta para ti!
 *   3. ¿Por qué es bueno valorizar?        6. ¿Sabías que ahora puedes vender en VMC?
 *
 * DESIGN SYSTEM VMC (../vmc-index-lab): tokens de @vmc/concorde-adapter, Button
 * primario Concorde, tarjeta de campaña (HomeCampaignBanner / anuncio «Valoriza tu
 * auto en VMC»), filas del Index, cards tipo OfferCard e íconos de vidrio esmerilado
 * (Vidrio.tsx) exportados a PNG 3x — Gmail no muestra SVG.
 *
 * COPY: una idea por correo, CTA corto sin flecha, P.D. al cierre. Regla de Stage 1:
 * la valorización es un valor REFERENCIAL con fecha, nunca un precio fijo de venta.
 *
 * Técnica: footer/legal reusan la plantilla glass (glassNegociableEmail); el cuerpo
 * es HTML propio que entra por un marcador. Animación CSS solo en Apple Mail/iOS;
 * Gmail y Outlook ven el correo completo y estático.
 */

import type { Section } from '../prodEmailTemplates';
import type { EmailTemplate } from '../prodEmails';
import { glassNegociableEmail } from './glassNegociable';

// ponytail: placeholders hasta tener las URLs reales (ver PENDIENTES en revisionStatus.ts)
const VALORIZA_URL = 'https://www.vmcsubastas.com/';
const PUBLICAR_URL = 'https://www.vmcsubastas.com/login?redirect_after_to=/zona';

const CATEGORIA = 'Campaña Valoriza';

const CDN = 'https://concorde-v2-theta.vercel.app';
const IMG = `${CDN}/correos/campana-valoriza`;
const LOGO = `${CDN}/logo-vmc@3x.png`; // blanco

const F = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const DS = {
  ink: '#191c1c', muted: '#667085', v500: '#8460e5', v700: '#3b1782',
  v900: '#22005c', orange: '#ed8936', divider: '#e8ddff', lav: '#f5f0ff',
};
const DS_SHADOW = '0 0 16px 4px rgba(32,0,104,0.10)';

// ─── primitivas ──────────────────────────────────────────────────────────────
const T = (attrs = '') => `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" ${attrs}>`;
const row = (inner: string, pad = '0 16px') => `<tr><td style="padding:${pad};">${inner}</td></tr>`;
const gap = (h: number) => `<tr><td height="${h}" style="height:${h}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
const logo = (w: number) => `<img src="${LOGO}" width="${w}" alt="vmc Subastas" border="0" style="display:block;width:${w}px;height:auto;">`;

type Icono = 'compras' | 'vender' | 'billetera' | 'auto' | 'valorizaciones' | 'docs' | 'km' | 'verificado' | 'fecha' | 'publicar' | 'precio' | 'negociaciones' | 'crecimiento';
const icon = (s: Icono, px = 44) => `<img src="${IMG}/iconos/${s}.png" width="${px}" height="${px}" alt="" border="0" style="display:block;width:${px}px;height:${px}px;">`;

// ─── piezas del design system ────────────────────────────────────────────────

/** Botón primario Concorde: naranja→violeta, borde degradado y brillo que lo recorre (Apple Mail). */
function button(text: string, url: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius:9999px;box-shadow:0 2px 6px rgba(237,137,54,0.30),0 12px 28px rgba(132,96,229,0.26);"><tr>
<td bgcolor="#fbc47d" style="padding:2px;border-radius:9999px;background-image:linear-gradient(135deg,#ffffff 0%,#fbc47d 25%,#ae8eff 75%,#ffffff 100%);">
<a class="ds-btn" href="${url}" target="_blank" style="display:inline-block;padding:16px 52px;border-radius:9999px;background-color:${DS.orange};background-image:linear-gradient(110deg,rgba(255,255,255,0) 35%,rgba(255,255,255,0.38) 50%,rgba(255,255,255,0) 65%),linear-gradient(rgba(255,255,255,0.17) 0%,rgba(255,255,255,0) 55%),linear-gradient(135deg,#ed8936 0%,#ed8936 40%,#8460e5 100%);background-size:250% 100%,100% 100%,100% 100%;background-position:150% 0,0 0,0 0;background-repeat:no-repeat;font-family:${F};font-size:17px;line-height:22px;font-weight:700;letter-spacing:-0.01em;color:#ffffff;text-decoration:none;text-shadow:0 1px 3px rgba(0,0,0,0.25);">${text}</a>
</td></tr></table>`;
}

/** Palabra clave del título en naranja de marca. */
const acc = (t: string) => `<span style="color:#fbc47d;">${t}</span>`;

/**
 * Hero oscuro de marca (como los banners «Publica en VMC»): logo dentro, imagen a
 * sangre, título blanco con acento naranja, CTA y una tira de beneficios abajo.
 */
function hero(o: { img: string; alt: string; eyebrow: string; title: string; text: string; cta: string; url: string; perks: [string, string, string] }): string {
  const perk = (t: string, i: number) => `<td class="ds-in" width="33%" align="center" style="padding:14px 6px;${i ? 'border-left:1px solid rgba(255,255,255,0.14);' : ''}font-family:${F};font-size:13px;line-height:17px;font-weight:700;color:#ffffff;animation-delay:${0.6 + i * 0.1}s;"><span style="color:${DS.orange};">&#9679;</span>&nbsp; ${t}</td>`;
  return `${T(`bgcolor="${DS.v900}" class="ds-in" style="border-radius:24px;background-image:radial-gradient(120% 70% at 85% 100%,rgba(237,137,54,0.28) 0%,rgba(237,137,54,0) 60%),linear-gradient(180deg,#22005c 0%,#3b1782 100%);box-shadow:0 18px 40px rgba(34,0,92,0.28);"`)}
<tr><td style="padding:22px 28px 18px;">${logo(84)}</td></tr>
<tr><td style="font-size:0;line-height:0;overflow:hidden;"><img class="ds-zoom" src="${IMG}/${o.img}" alt="${o.alt}" width="600" border="0" style="display:block;width:100%;max-width:100%;height:auto;"></td></tr>
<tr><td style="padding:28px 28px 30px;font-family:${F};">
<p class="ds-in" style="margin:0;font-size:12px;line-height:16px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${DS.orange};animation-delay:.15s;">${o.eyebrow}</p>
<h1 class="ds-h1 ds-in" style="margin:10px 0 0;font-family:${F};font-size:38px;line-height:42px;font-weight:800;letter-spacing:-0.04em;color:#ffffff;animation-delay:.25s;">${o.title}</h1>
<p class="ds-in" style="margin:14px 0 26px;font-size:17px;line-height:26px;color:#e8ddff;animation-delay:.35s;">${o.text}</p>
<div class="ds-in" style="animation-delay:.45s;">${button(o.cta, o.url)}</div>
</td></tr>
<tr><td style="padding:0 16px 16px;">${T(`style="border-radius:16px;background-color:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);"`)}<tr>${o.perks.map(perk).join('')}</tr></table></td></tr>
</table>`;
}

/** Cierre: tarjeta lavanda centrada con ícono grande, título y CTA. */
function closing(ic: Icono, head: string, text: string, label: string, url: string): string {
  return row(`${T(`bgcolor="${DS.lav}" style="border-radius:24px;background-image:linear-gradient(180deg,#f5f0ff 0%,#ffffff 100%);border:1px solid ${DS.divider};"`)}<tr><td align="center" style="padding:30px 24px 32px;font-family:${F};">
<div class="ds-pop" style="display:inline-block;">${icon(ic, 64)}</div>
<h2 style="margin:14px 0 0;font-family:${F};font-size:24px;line-height:30px;font-weight:800;letter-spacing:-0.025em;color:${DS.v700};">${head}</h2>
<p style="margin:8px 0 22px;font-size:15px;line-height:22px;color:${DS.muted};">${text}</p>
${T()}<tr><td align="center">${button(label, url)}</td></tr></table>
</td></tr></table>`);
}

const p = (html: string, o: { size?: number; color?: string; align?: string } = {}) =>
  row(`<p style="margin:0;font-family:${F};font-size:${o.size ?? 16}px;line-height:${(o.size ?? 16) < 15 ? 21 : 25}px;color:${o.color ?? DS.ink};text-align:${o.align ?? 'left'};">${html}</p>`, '0 28px');
const b = (t: string) => `<b style="color:${DS.v700};">${t}</b>`;
const HOLA = p('Hola {{Nombre usuario.Ejem: Gabriel Bruno}},');

/** Título de sección: antetítulo naranja + título violeta (jerarquía del Index). */
const title = (kicker: string, text: string) => row(`<p style="margin:0;font-family:${F};font-size:12px;line-height:16px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${DS.orange};">${kicker}</p><h2 style="margin:6px 0 0;font-family:${F};font-size:22px;line-height:28px;font-weight:800;letter-spacing:-0.02em;color:${DS.v700};">${text}</h2>`, '0 28px');

/** Filas con ícono de vidrio (estilo «Empresas y vendedores»). `steps` antepone «Paso n». */
function rows(items: [Icono, string, string][], steps = false): string {
  const r = items.map(([ic, t, d], i) => `<tr><td class="ds-in" style="padding:16px 20px;${i ? `border-top:1px solid ${DS.divider};` : ''}animation-delay:${0.1 + i * 0.12}s;">${T()}<tr>
<td width="60" valign="middle"><div class="ds-pop" style="display:inline-block;padding:8px;border-radius:16px;background-color:${DS.lav};animation-delay:${0.25 + i * 0.12}s;">${icon(ic)}</div></td>
<td valign="middle" style="padding-left:16px;font-family:${F};">${steps ? `<div style="font-size:11px;line-height:14px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${DS.orange};">Paso ${i + 1}</div>` : ''}<div style="margin-top:${steps ? 3 : 0}px;font-size:16px;line-height:22px;font-weight:800;letter-spacing:-0.01em;color:${DS.v700};">${t}</div><div style="margin-top:3px;font-size:14px;line-height:20px;color:${DS.muted};">${d}</div></td>
</tr></table></td></tr>`).join('');
  return row(`${T(`bgcolor="#ffffff" style="border-radius:20px;border:1px solid ${DS.divider};box-shadow:${DS_SHADOW};"`)}${r}</table>`, '0 16px');
}

/** Nota referencial: ícono de fecha + texto, en lavanda. */
const note = (html: string) => row(`${T(`bgcolor="${DS.lav}" style="border-radius:14px;"`)}<tr><td width="52" valign="middle" style="padding:14px 0 14px 16px;">${icon('fecha', 36)}</td><td valign="middle" style="padding:14px 18px 14px 12px;font-family:${F};font-size:14px;line-height:21px;color:${DS.v700};">${html}</td></tr></table>`, '0 28px');
const REF = 'Tu valorización es un <b>valor referencial con fecha</b>: una guía para decidir, no un precio fijo de venta.';

/** Dos cards tipo OfferCard: mismo auto, distinto estado y recorrido. */
function compare(cards: { tag: string; chips: string[]; value: string; pct: number; high: boolean }[]): string {
  const card = (c: (typeof cards)[number], i: number) => `<td class="ds-stack ds-in" width="48%" valign="top" bgcolor="#ffffff" style="border-radius:20px;border:1px solid ${DS.divider};box-shadow:${DS_SHADOW};animation-delay:${0.1 + i * 0.2}s;">
<img src="${IMG}/yaris.jpg" alt="Mismo modelo, año 2018" width="260" border="0" style="display:block;width:100%;height:auto;border-radius:20px 20px 0 0;">
<div style="padding:16px 16px 20px;font-family:${F};">
<span style="display:inline-block;border-radius:9999px;padding:4px 12px;background-color:${c.high ? DS.v700 : DS.orange};font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;">${c.tag}</span>
<div style="margin-top:10px;font-size:17px;line-height:22px;font-weight:800;letter-spacing:-0.01em;color:${DS.v700};">2018 · Mismo modelo</div>
<div style="margin-top:8px;">${c.chips.map((x) => `<span style="display:inline-block;margin:0 4px 6px 0;border-radius:9999px;padding:3px 10px;background-color:#f2f4f7;font-size:12px;line-height:16px;color:${DS.muted};">${x}</span>`).join('')}</div>
<div style="margin-top:10px;font-size:11px;line-height:14px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${DS.muted};">Valor referencial</div>
<div style="margin-top:2px;font-size:24px;line-height:30px;font-weight:800;letter-spacing:-0.02em;color:${c.high ? DS.v700 : DS.orange};">${c.value}</div>
<div style="margin-top:10px;height:8px;border-radius:9999px;background-color:#eef0f3;font-size:0;line-height:0;"><div class="ds-bar" style="width:${c.pct}%;height:8px;border-radius:9999px;background-color:${DS.orange};background-image:linear-gradient(90deg,#ed8936 0%,#8460e5 100%);animation-delay:${0.6 + i * 0.2}s;">&nbsp;</div></div>
</div></td>`;
  return row(`${T()}<tr>${card(cards[0], 0)}<td class="ds-stack" width="4%" style="font-size:0;">&nbsp;</td>${card(cards[1], 1)}</tr></table>`, '0 16px');
}

const ps = (html: string) => p(`<b style="color:${DS.v500};">P.D.</b> ${html}`, { size: 14, color: DS.muted });
const link = (text: string, url: string) => p(`<a href="${url}" target="_blank" style="font-weight:700;color:${DS.v500};text-decoration:underline;">${text}</a>`, { size: 14, align: 'center', color: DS.muted });

// ─── movimiento + responsive (cada <style> aparte: si un cliente descarta uno, no se lleva el otro) ──
const MOTION = `<style>
@keyframes dsIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes dsZoom{from{transform:scale(1.08)}to{transform:scale(1)}}
@keyframes dsPop{0%{opacity:0;transform:scale(.6) translateY(6px)}60%{opacity:1;transform:scale(1.08)}100%{transform:none}}
@keyframes dsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes dsBar{from{width:0}}
@keyframes dsShine{0%,55%{background-position:150% 0,0 0,0 0}100%{background-position:-60% 0,0 0,0 0}}
.ds-in{animation:dsIn .7s cubic-bezier(.25,.8,.25,1) both}
.ds-zoom{animation:dsZoom 1.6s cubic-bezier(.25,.8,.25,1) both}
.ds-pop{animation:dsPop .6s cubic-bezier(.25,.8,.25,1) both,dsFloat 3.6s ease-in-out 1.2s infinite}
.ds-bar{animation:dsBar 1.3s cubic-bezier(.25,.8,.25,1) both}
.ds-btn{animation:dsShine 4s ease-in-out 1s infinite}
@media (prefers-reduced-motion:reduce){.ds-in,.ds-zoom,.ds-pop,.ds-bar,.ds-btn{animation:none!important}}
</style>`;
const RESPONSIVE = `<style>
@media only screen and (max-width:480px){
.ds-stack{display:block!important;width:100%!important;box-sizing:border-box}
td.ds-stack[width="4%"]{height:14px!important}
.ds-h1{font-size:30px!important;line-height:34px!important}
}
</style>`;

// ─── armado ──────────────────────────────────────────────────────────────────
const MARK = 'VMCVALORIZABODYMARK';

interface Def {
  id: string; name: string; subject: string; preheader: string; stage: string;
  leadsTo?: string[]; hero: string; body: string[];
}

function build(d: Def): string {
  const marker: Section = { id: 'body', type: 'text', content: { text: MARK } };
  const body = [gap(28), ...d.body, gap(36)].join('\n');
  return glassNegociableEmail([marker], d.subject, d.preheader, d.hero)
    .replace('</head>', `${MOTION}\n${RESPONSIVE}\n</head>`)
    .replace(new RegExp(`<tr><td[^>]*>${MARK}</td></tr>`), body);
}

// ─── LOS 6 BOLETINES ─────────────────────────────────────────────────────────
const DEFS: Def[] = [
  {
    id: 'valoriza-1-antes-de-comprar',
    name: 'Valoriza 1 — antes de comprar, valoriza',
    subject: '¿Ese auto vale lo que piden?',
    preheader: 'Antes de enviar tu propuesta, valorízalo: gratis y en minutos.',
    stage: 'Valoriza', leadsTo: ['valoriza-2-antes-de-vender'],
    hero: hero({ img: 'comprar.jpg', alt: 'Pareja revisando en el celular el valor de un auto', eyebrow: 'Antes de comprar, valoriza', title: `Propón sabiendo ${acc('cuánto vale')}`, perks: ['Gratis', 'En minutos', 'Sin compromiso'], text: 'En una oferta negociable, tú haces la propuesta. Valoriza el auto antes y propón con sustento.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      HOLA, gap(8),
      p(`El vendedor publica un precio, pero tú puedes enviarle tu propuesta. Con una valorización, ${b('sabes cuánto proponer')}.`),
      gap(28), title('Antes de proponer', 'Tres ventajas de valorizar'), gap(14),
      rows([['precio', 'Sabes cuánto proponer', 'Tu propuesta parte de un valor de referencia.'], ['compras', 'Detectas oportunidades', 'Ves si el precio está por debajo de su valor.'], ['negociaciones', 'Negocias con argumentos', 'Si llega una contrapropuesta, sabes si te conviene.']]),
      gap(24), note(REF),
      gap(32), closing('valorizaciones', 'Antes de proponer, valoriza', 'Gratis, en minutos y desde tu celular.', 'Valorizar un auto', VALORIZA_URL),
      gap(24), ps('Valorizar en VMC es gratis, siempre.'),
    ],
  },
  {
    id: 'valoriza-2-antes-de-vender',
    name: 'Valoriza 2 — antes de vender, valoriza',
    subject: '¿Cuánto deberías pedir por tu auto?',
    preheader: 'Ni tan bajo que pierdas, ni tan alto que no se venda.',
    stage: 'Valoriza', leadsTo: ['valoriza-3-por-que-valorizar'],
    hero: hero({ img: 'vender.jpg', alt: 'Mujer con la llave de su auto, lista para vender', eyebrow: 'Antes de vender, valoriza', title: `El precio que pides ${acc('decide si vendes')}`, perks: ['Gratis', 'En minutos', 'Sin compromiso'], text: 'Si pides muy poco, pierdes plata. Si pides demasiado, tu auto no se vende. Valoriza y pide con sustento.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      HOLA, gap(8),
      p(`El precio correcto no se adivina. ${b('Una valorización te da un punto de partida')} para poner tu auto a la venta.`),
      gap(28), title('Antes de publicar', 'Tres ventajas de valorizar'), gap(14),
      rows([['valorizaciones', 'Un precio con sustento', 'Según el estado y el recorrido de tu auto.'], ['precio', 'Ni regalado ni estancado', 'Ni tan bajo que pierdas, ni tan alto que no se venda.'], ['vender', 'Negocias con confianza', 'Sabes si aceptar, rechazar o contraproponer.']]),
      gap(24), note(REF),
      gap(32), closing('vender', 'Pide con sustento', 'Conoce el valor de referencia de tu auto antes de publicarlo.', 'Valorizar mi auto', VALORIZA_URL),
      gap(24), ps('Valorizar es gratis y no te obliga a vender.'),
    ],
  },
  {
    id: 'valoriza-3-por-que-valorizar',
    name: 'Valoriza 3 — ¿por qué es bueno valorizar?',
    subject: 'Mismo modelo, mismo año… ¿distinto valor?',
    preheader: 'Dos autos iguales pueden valer muy distinto. Te mostramos por qué.',
    stage: 'Valoriza', leadsTo: ['valoriza-4-valorizar-y-publicar'],
    hero: hero({ img: 'recorrido.jpg', alt: 'Persona revisando su auto junto a un velocímetro', eyebrow: '¿Por qué valorizar?', title: `Dos autos iguales ${acc('no valen lo mismo')}`, perks: ['Estado', 'Recorrido', 'Mantenimiento'], text: 'Misma marca, mismo modelo, mismo año. Aun así, el estado y el recorrido pueden cambiar mucho su valor.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      HOLA, gap(8),
      p('Mira estos dos autos: misma marca, mismo modelo, mismo año. En papel son iguales. Su valor, no.'),
      gap(22),
      compare([
        { tag: 'Auto A', chips: ['45,000 km', 'Mantenimiento al día', 'Sin choques'], value: 'Más alto', pct: 86, high: true },
        { tag: 'Auto B', chips: ['140,000 km', 'Sin historial', 'Golpes por reparar'], value: 'Más bajo', pct: 46, high: false },
      ]),
      gap(28), title('La diferencia', 'Lo que más mueve el valor'), gap(14),
      rows([['km', 'El recorrido', 'Cuántos kilómetros tiene.'], ['verificado', 'El estado', 'Carrocería, pintura y mecánica.'], ['fecha', 'El mantenimiento', 'Si está al día y documentado.']]),
      gap(32), closing('km', '¿Cuánto vale el tuyo?', 'Tu estado y tu recorrido, no una tabla genérica.', 'Valorizar mi auto', VALORIZA_URL),
      gap(24), ps('Por eso una tabla genérica no te dice cuánto vale el tuyo. Una valorización, sí. Y es gratis.'),
    ],
  },
  {
    id: 'valoriza-4-valorizar-y-publicar',
    name: 'Valoriza 4 — valorizar y luego publicar',
    subject: 'Tu valorización ya no se queda en un número',
    preheader: 'Valoriza hoy, guárdala en Mi Garaje y publica cuando quieras.',
    stage: 'Valoriza', leadsTo: ['valoriza-5-nuevo-canal-de-venta'],
    hero: hero({ img: 'valoriza.jpg', alt: 'Persona valorizando su auto desde el celular', eyebrow: 'Nuevo en VMC', title: `Valorízalo hoy. ${acc('Véndelo cuando quieras.')}`, perks: ['Valoriza', 'Guarda', 'Publica'], text: 'Valoriza tu auto, guarda la valorización en Mi Garaje y publícalo cuando decidas vender.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      HOLA, gap(8),
      p(`Todo en un mismo lugar, ${b('desde Mi Garaje')}:`),
      gap(18),
      rows([['valorizaciones', 'Valoriza', 'Gratis y en minutos, desde tu celular.'], ['docs', 'Guarda', 'Tu valorización queda en Mi Garaje.'], ['publicar', 'Publica', 'Como oferta negociable, cuando decidas vender.']], true),
      gap(24), note(REF),
      gap(32), closing('docs', 'Empieza por valorizar', 'Queda guardada en Mi Garaje para cuando decidas publicar.', 'Valorizar mi auto', VALORIZA_URL),
      gap(16), link('¿Ya valorizaste? Publica tu auto aquí', PUBLICAR_URL),
    ],
  },
  {
    id: 'valoriza-5-nuevo-canal-de-venta',
    name: 'Vende 5 — un nuevo canal de venta para ti',
    subject: '¿Compras autos? Ahora también véndelos aquí',
    preheader: 'Un nuevo canal de venta: publica en VMC y recibe propuestas.',
    stage: 'Vende', leadsTo: ['valoriza-6-vender-en-vmc'],
    hero: hero({ img: 'canal.jpg', alt: 'Comprador y vendedor cerrando un trato junto a una camioneta', eyebrow: 'Un nuevo canal de venta', title: `¿Compras en VMC? ${acc('Sé revendedor.')}`, perks: ['Publica', 'Recibe propuestas', 'Tú decides'], text: 'Si compras autos en VMC, ahora también puedes venderlos aquí. Publica y recibe propuestas de compradores que ya buscan en VMC.', cta: 'Publicar', url: PUBLICAR_URL }),
    body: [
      HOLA, gap(8),
      p(`Ya conoces VMC como comprador. Ahora es también ${b('tu canal para vender')}: compra, valoriza y vuelve a vender en un mismo lugar.`),
      gap(28), title('Tu nuevo ciclo', 'Compra, valoriza y vende'), gap(14),
      rows([['compras', 'Compra', 'Encuentra la oportunidad en VMC.'], ['valorizaciones', 'Valoriza', 'Conoce su valor de referencia, gratis.'], ['crecimiento', 'Vende', 'Publícalo como oferta negociable.']], true),
      gap(32), closing('crecimiento', 'Tu auto, frente a compradores de VMC', 'Publica y deja que las propuestas lleguen a ti.', 'Publicar mi auto', PUBLICAR_URL),
      gap(24), ps('Antes de publicar, valoriza: un precio con sustento vende mejor.'),
    ],
  },
  {
    id: 'valoriza-6-vender-en-vmc',
    name: 'Vende 6 — ¿sabías que ahora puedes vender en VMC?',
    subject: 'Vende tu auto sin llamadas a toda hora',
    preheader: 'Publica tu auto, recibe propuestas y decide tú.',
    stage: 'Vende',
    hero: hero({ img: 'publica.jpg', alt: 'Vendedor entregando las llaves de su auto', eyebrow: 'Ahora puedes vender en VMC', title: `Publica tu auto y ${acc('recibe propuestas')}`, perks: ['Propuestas', 'Tú decides', 'Sin llamadas'], text: 'Publícalo como oferta negociable: los compradores te envían propuestas a Mi Garaje y tú decides. Sin llamadas a cualquier hora.', cta: 'Publicar', url: PUBLICAR_URL }),
    body: [
      HOLA, gap(8),
      p(`Sin anuncios en mil sitios ni llamadas a cualquier hora: ${b('todo pasa en Mi Garaje')}. Así funciona:`),
      gap(18),
      rows([['precio', 'Recibe propuestas', 'Los compradores te dicen cuánto pagarían.'], ['verificado', 'Tú decides', 'Acepta, rechaza o haz una contrapropuesta.'], ['negociaciones', 'Responde preguntas', 'Los compradores te pueden escribir antes de proponer.']]),
      gap(32), closing('publicar', 'Publica tu auto en VMC', 'Y recibe propuestas en Mi Garaje.', 'Publicar mi auto', PUBLICAR_URL),
      gap(16), link('¿No sabes a cuánto publicarlo? Valorízalo gratis', VALORIZA_URL),
    ],
  },
];

export const CAMPANA_VALORIZA: EmailTemplate[] = DEFS.map((d) => ({
  id: d.id, name: d.name, subject: d.subject, category: CATEGORIA, stage: d.stage, leadsTo: d.leadsTo,
  sections: [],
  html: build(d),
}));
