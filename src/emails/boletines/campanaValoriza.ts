/**
 * Campaña «Valoriza y Vende» — 12 correos en 3 secuencias de 4:
 *   A · Leads WhatsApp (~1,000 que quisieron valorizar)
 *   B · Compradores
 *   C · Vendedores (potenciales)
 *
 * DISEÑO (tendencias 2026: Really Good Emails, Beefree, MailBakery, Acumbamail):
 *  · Tipografía XXL y héroes inmersivos (oscuro tipo Netflix, editorial claro, foto).
 *  · Bento grid, sombras de color, esquinas redondeadas, «ilustración» con HTML+emoji.
 *  · Cada correo tiene UNA pieza visual protagonista distinta: ticket de valorización,
 *    versus con medidores, termómetro de precio, chat, ciclo, timeline, bento.
 *  · Movimiento con propósito (Apple Mail/iOS); Gmail/Outlook ven todo estático y completo.
 *
 * COPY (Copyhackers/Wiebe + guías 2026): regla del uno, PAS, asunto ~40 car.,
 * CTA «Quiero ___», P.D. al cierre (se lee siempre). Sin cifras inventadas.
 *
 * Técnica: el cuerpo es HTML propio; banner y footer/legal reusan la plantilla glass
 * (glassNegociableEmail) para no duplicar el pie legal. El cuerpo entra por un
 * marcador que se reemplaza tras renderizar.
 */

import type { Section } from '../prodEmailTemplates';
import type { EmailTemplate } from '../prodEmails';
import { glassNegociableEmail } from './glassNegociable';

// ponytail: placeholders hasta tener las URLs reales (ver PENDIENTES en revisionStatus.ts)
export const VALORIZA_URL = 'https://www.vmcsubastas.com/';
export const PUBLICAR_URL = 'https://www.vmcsubastas.com/login?redirect_after_to=/zona';
const OFERTAS_URL = 'https://www.vmcsubastas.com/';

export const CATEGORIA = 'Campaña Valoriza';
export const ETAPAS = ['Leads WhatsApp', 'Compradores', 'Vendedores'];

const CDN = 'https://concorde-v2-theta.vercel.app';
const LOGO = `${CDN}/logo-vmc@3x.png`; // blanco
const IMG_VENDEDOR = `${CDN}/correos/boletin-maf-peru/hero.jpg`;
const IMG_AUTO = `${CDN}/demo/bronco.jpg`;

const F = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const C = {
  ink: '#1b0f3b', purple: '#3b1782', violet: '#8460e5', teal: '#00aeb1', tealDeep: '#00797b',
  aqua: '#73dfdf', coral: '#ed8936', pink: '#e0559a', lav: '#f3efff', line: '#e4dcff', body: '#4a3f66',
};

// ─── primitivas ──────────────────────────────────────────────────────────────
const T = (attrs = '') => `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" ${attrs}>`;
const row = (inner: string, pad = '0 16px') => `<tr><td style="padding:${pad};">${inner}</td></tr>`;
const gap = (h: number) => `<tr><td height="${h}" style="height:${h}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
const logo = (w: number) => `<img src="${LOGO}" width="${w}" alt="vmc Subastas" border="0" style="display:block;width:${w}px;height:auto;">`;
const pill = (text: string, fg: string, bg: string, cls = '') =>
  `<span class="${cls}" style="display:inline-block;border-radius:9999px;padding:6px 14px;background-color:${bg};font-family:${F};font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${fg};">${text}</span>`;
/** Párrafo: el HTML (<b>, <span>) va tal cual; el copy es nuestro. */
const p = (html: string, o: { size?: number; align?: string; color?: string } = {}) =>
  row(`<p style="margin:0;font-family:${F};font-size:${o.size ?? 17}px;line-height:1.6;color:${o.color ?? C.body};text-align:${o.align ?? 'left'};">${html}</p>`, '0 24px');
const b = (t: string) => `<b style="color:${C.purple};">${t}</b>`;
const hi = (t: string) => `<b style="color:${C.tealDeep};">${t}</b>`;
const warn = (t: string) => `<b style="color:#c2410c;">${t}</b>`;
const HOLA = p('Hola {{Nombre usuario.Ejem: Gabriel Bruno}},');

// ─── HÉROES (el bloque que reemplaza al banner) ──────────────────────────────
type Tone = 'teal' | 'coral' | 'violet';
const GLOW: Record<Tone, string> = { teal: 'rgba(0,174,177,0.6)', coral: 'rgba(237,137,54,0.55)', violet: 'rgba(224,85,154,0.5)' };

/** Inmersivo oscuro, tipografía XXL. */
function heroDark(o: { kicker: string; big: string; accent: string; sub: string; tone?: Tone; emoji?: string }): string {
  const tone = o.tone ?? 'teal';
  return `${T(`bgcolor="#1d0b4a" style="border-radius:28px;background-color:#1d0b4a;background-image:radial-gradient(circle at 88% 8%,${GLOW[tone]} 0%,rgba(0,0,0,0) 42%),radial-gradient(circle at 6% 96%,rgba(132,96,229,0.7) 0%,rgba(0,0,0,0) 50%),linear-gradient(160deg,#2c1070 0%,#12062b 100%);"`)}
<tr><td style="padding:28px 28px 40px;font-family:${F};">
${T()}<tr><td>${logo(104)}</td>${o.emoji ? `<td align="right" style="font-size:44px;line-height:1;"><span class="vmc-float" style="display:inline-block;">${o.emoji}</span></td>` : ''}</tr></table>
<div class="vmc-rise" style="margin-top:40px;">${pill(o.kicker, '#0b2b2b', C.aqua)}</div>
<h1 class="vmc-big vmc-rise" style="margin:18px 0 0;font-family:${F};font-size:50px;line-height:1.02;font-weight:800;letter-spacing:-0.04em;color:#ffffff;animation-delay:.1s;">${o.big}<br><span style="color:${tone === 'coral' ? '#ffb27a' : C.aqua};">${o.accent}</span></h1>
<p class="vmc-rise" style="margin:18px 0 0;font-family:${F};font-size:17px;line-height:1.55;color:rgba(255,255,255,0.8);animation-delay:.2s;">${o.sub}</p>
</td></tr></table>`;
}

/** Editorial claro: una palabra gigante con sombra de color. */
function heroGiant(o: { kicker: string; word: string; line: string; sub: string }): string {
  return `${T(`bgcolor="#f3efff" style="border-radius:28px;background-color:#f3efff;background-image:radial-gradient(circle at 100% 0%,rgba(0,174,177,0.28) 0%,rgba(0,174,177,0) 45%),radial-gradient(circle at 0% 100%,rgba(237,137,54,0.22) 0%,rgba(237,137,54,0) 45%),linear-gradient(170deg,#ffffff 0%,#ebe4ff 100%);border:1px solid #e4dcff;"`)}
<tr><td bgcolor="#3b1782" style="padding:18px 28px;border-radius:28px 28px 0 0;background-image:linear-gradient(90deg,#3b1782 0%,#5a35c2 100%);">${logo(92)}</td></tr>
<tr><td align="center" style="padding:36px 24px 40px;font-family:${F};">
${pill(o.kicker, C.tealDeep, 'rgba(0,174,177,0.12)', 'vmc-badge')}
<div class="vmc-huge vmc-rise" style="margin-top:14px;font-family:${F};font-size:92px;line-height:0.95;font-weight:800;letter-spacing:-0.05em;color:${C.violet};text-shadow:0 10px 30px rgba(132,96,229,0.35);">${o.word}</div>
<h1 class="vmc-big vmc-rise" style="margin:14px 0 0;font-family:${F};font-size:34px;line-height:1.1;font-weight:800;letter-spacing:-0.03em;color:${C.purple};animation-delay:.1s;">${o.line}</h1>
<p class="vmc-rise" style="margin:14px auto 0;max-width:440px;font-family:${F};font-size:17px;line-height:1.55;color:${C.body};animation-delay:.2s;">${o.sub}</p>
</td></tr></table>`;
}

/** Foto protagonista dentro de un marco oscuro. */
function heroPhoto(o: { img: string; alt: string; kicker: string; big: string; accent: string }): string {
  return `${T(`bgcolor="#1d0b4a" style="border-radius:28px;background-color:#1d0b4a;background-image:radial-gradient(circle at 100% 100%,rgba(0,174,177,0.55) 0%,rgba(0,0,0,0) 45%),linear-gradient(165deg,#2c1070 0%,#12062b 100%);"`)}
<tr><td style="padding:24px 24px 0;">${logo(96)}</td></tr>
<tr><td style="padding:20px 16px 0;"><img class="vmc-rise" src="${o.img}" alt="${o.alt}" width="536" border="0" style="display:block;width:100%;max-width:536px;height:auto;border-radius:20px;"></td></tr>
<tr><td style="padding:24px 28px 36px;font-family:${F};">
${pill(o.kicker, '#0b2b2b', C.aqua)}
<h1 class="vmc-big vmc-rise" style="margin:14px 0 0;font-family:${F};font-size:44px;line-height:1.04;font-weight:800;letter-spacing:-0.04em;color:#ffffff;">${o.big}<br><span style="color:${C.aqua};">${o.accent}</span></h1>
</td></tr></table>`;
}

// ─── PIEZAS PROTAGONISTAS ────────────────────────────────────────────────────
const TONE_GRAD: Record<Tone, [string, string, string]> = {
  teal: ['#00aeb1', 'linear-gradient(110deg,#00aeb1 0%,#5f7de0 50%,#8460e5 100%,#00aeb1 150%)', 'rgba(0,174,177,0.40)'],
  coral: ['#ed8936', 'linear-gradient(110deg,#ed8936 0%,#e0559a 50%,#8460e5 100%,#ed8936 150%)', 'rgba(237,137,54,0.40)'],
  violet: ['#8460e5', 'linear-gradient(110deg,#8460e5 0%,#3b1782 50%,#00aeb1 100%,#8460e5 150%)', 'rgba(132,96,229,0.45)'],
};

/** CTA grande; el gradiente se desliza (Apple Mail). */
function cta(text: string, url = VALORIZA_URL, tone: Tone = 'teal', sub = ''): string {
  const [solid, grad, shadow] = TONE_GRAD[tone];
  return row(`${T()}<tr><td align="center">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius:9999px;box-shadow:0 14px 34px ${shadow};"><tr><td bgcolor="${solid}" style="border-radius:9999px;">
<a class="vmc-cta" href="${url}" target="_blank" style="display:inline-block;padding:19px 40px;border-radius:9999px;background-color:${solid};background-image:${grad};background-size:200% 100%;font-family:${F};font-size:17px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;text-decoration:none;">${text}&nbsp;&rarr;</a>
</td></tr></table>
${sub ? `<p style="margin:12px 0 0;font-family:${F};font-size:13px;color:#7a6f96;">${sub}</p>` : ''}
</td></tr></table>`);
}

/** Ticket de valorización con el monto «oculto»: curiosidad. */
function ticket(o: { title: string; rows: [string, string][]; label: string; value: string; foot: string }): string {
  const rows = o.rows.map(([k, v]) => `<tr><td style="padding:9px 0;border-bottom:1px dotted #d9cffb;font-family:${F};font-size:14px;color:#7a6f96;">${k}</td><td align="right" style="padding:9px 0;border-bottom:1px dotted #d9cffb;font-family:${F};font-size:14px;font-weight:700;color:${C.purple};">${v}</td></tr>`).join('');
  return row(`${T(`bgcolor="#ffffff" class="vmc-rise" style="border-radius:24px;border:1px solid ${C.line};box-shadow:0 18px 40px rgba(132,96,229,0.18);"`)}
<tr><td style="padding:22px 24px 6px;font-family:${F};">${T()}<tr><td style="font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${C.violet};">${o.title}</td><td align="right" style="font-size:22px;">🧾</td></tr></table></td></tr>
<tr><td style="padding:0 24px;">${T()}${rows}</table></td></tr>
<tr><td style="padding:18px 24px 0;"><div style="border-top:2px dashed #d9cffb;font-size:0;line-height:0;">&nbsp;</div></td></tr>
<tr><td align="center" style="padding:16px 24px 24px;font-family:${F};">
<div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7a6f96;">${o.label}</div>
<div class="vmc-blink" style="margin-top:6px;font-size:40px;font-weight:800;letter-spacing:-0.03em;color:${C.purple};">${o.value}</div>
<div style="margin-top:8px;font-size:13px;color:${C.tealDeep};font-weight:700;">${o.foot}</div>
</td></tr></table>`);
}

/** Dos autos «iguales» con medidor de valor y VS al centro. */
function versus(o: { a: VsCard; b: VsCard }): string {
  const card = (c: VsCard, i: number) => `<td class="vmc-stack" width="46%" valign="top" bgcolor="#ffffff" style="border-radius:22px;border:1px solid ${C.line};box-shadow:0 14px 30px ${c.good ? 'rgba(0,174,177,0.20)' : 'rgba(237,137,54,0.20)'};">
<div class="vmc-rise" style="padding:18px 16px 20px;font-family:${F};animation-delay:${0.15 + i * 0.2}s;">
${pill(c.tag, c.good ? C.tealDeep : '#c2410c', c.good ? 'rgba(0,174,177,0.12)' : 'rgba(237,137,54,0.14)')}
<div style="margin-top:10px;font-size:16px;font-weight:800;color:${C.purple};letter-spacing:-0.01em;">${c.title}</div>
<div style="margin-top:10px;font-size:13px;line-height:1.9;color:${C.body};">${c.attrs.join('<br>')}</div>
<div style="margin-top:14px;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#7a6f96;">Valor</div>
<div style="margin-top:6px;height:10px;border-radius:9999px;background-color:${C.lav};font-size:0;line-height:0;"><div class="vmc-grow" style="width:${c.pct}%;height:10px;border-radius:9999px;background-color:${c.good ? C.teal : C.coral};background-image:linear-gradient(90deg,${c.good ? '#00aeb1,#8460e5' : '#ed8936,#e0559a'});animation-delay:${0.5 + i * 0.2}s;">&nbsp;</div></div>
<div style="margin-top:10px;font-size:18px;font-weight:800;color:${c.good ? C.tealDeep : '#c2410c'};">${c.verdict}</div>
</div></td>`;
  return row(`${T()}<tr>${card(o.a, 0)}
<td class="vmc-stack" width="8%" align="center" valign="middle"><div style="width:44px;height:44px;line-height:44px;margin:0 auto;border-radius:50%;background-color:${C.purple};background-image:linear-gradient(135deg,#8460e5,#3b1782);box-shadow:0 8px 18px rgba(59,23,130,0.35);font-family:${F};font-size:13px;font-weight:800;color:#ffffff;text-align:center;">VS</div></td>
${card(o.b, 1)}</tr></table>`, '0 12px');
}
interface VsCard { tag: string; title: string; attrs: string[]; pct: number; verdict: string; good: boolean }

/** Termómetro de precio en 3 tramos con un pin «tu auto». */
function gauge(o: { title: string; segs: [string, string, string][]; pin: number; pinLabel: string }): string {
  const cells = (fn: (s: [string, string, string], i: number) => string) => o.segs.map(fn).join('');
  const radius = (i: number) => (i === 0 ? '9999px 0 0 9999px' : i === o.segs.length - 1 ? '0 9999px 9999px 0' : '0');
  return row(`${T(`bgcolor="#ffffff" style="border-radius:24px;border:1px solid ${C.line};box-shadow:0 16px 36px rgba(59,23,130,0.12);"`)}
<tr><td style="padding:22px 20px 24px;font-family:${F};">
<div style="font-size:18px;font-weight:800;color:${C.purple};letter-spacing:-0.01em;">${o.title}</div>
${T('style="margin-top:18px;table-layout:fixed;"')}
<tr>${cells((_s, i) => `<td align="center" style="height:40px;vertical-align:bottom;">${i === o.pin ? `<div class="vmc-bounce" style="display:inline-block;font-family:${F};"><span style="display:inline-block;border-radius:9999px;padding:5px 11px;background-color:${C.purple};font-size:12px;font-weight:800;color:#ffffff;white-space:nowrap;">📍 ${o.pinLabel}</span><div style="font-size:12px;line-height:12px;color:${C.purple};">▼</div></div>` : '&nbsp;'}</td>`)}</tr>
<tr>${cells((s, i) => `<td bgcolor="${s[2]}" style="height:14px;font-size:0;line-height:0;background-color:${s[2]};border-radius:${radius(i)};${i ? 'border-left:2px solid #ffffff;' : ''}">&nbsp;</td>`)}</tr>
<tr>${cells((s) => `<td align="center" valign="top" style="padding:10px 4px 0;font-family:${F};"><div style="font-size:14px;font-weight:800;color:${C.purple};">${s[0]}</div><div style="margin-top:3px;font-size:12px;line-height:1.4;color:#7a6f96;">${s[1]}</div></td>`)}</tr>
</table></td></tr></table>`);
}

/** Bento: una celda oscura grande + dos claras apiladas. */
function bento(o: { big: Cell; a: Cell; b: Cell }): string {
  const light = (c: Cell, d: number) => `<td bgcolor="#ffffff" style="padding:18px;border-radius:20px;border:1px solid ${C.line};box-shadow:0 12px 26px rgba(132,96,229,0.14);font-family:${F};"><div class="vmc-rise" style="animation-delay:${d}s;"><div style="font-size:28px;line-height:1;">${c.emoji}</div><div style="margin-top:10px;font-size:16px;font-weight:800;color:${C.purple};">${c.title}</div><div style="margin-top:4px;font-size:13px;line-height:1.5;color:${C.body};">${c.text}</div></div></td>`;
  return row(`${T()}<tr>
<td class="vmc-stack" width="52%" valign="top" bgcolor="#2c1070" style="padding:24px 20px;border-radius:24px;background-image:radial-gradient(circle at 100% 0%,rgba(0,174,177,0.6) 0%,rgba(0,0,0,0) 50%),linear-gradient(160deg,#3b1782 0%,#14072f 100%);box-shadow:0 18px 36px rgba(59,23,130,0.35);font-family:${F};">
<div class="vmc-float" style="display:inline-block;font-size:52px;line-height:1;">${o.big.emoji}</div>
<div style="margin-top:40px;font-size:24px;line-height:1.1;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">${o.big.title}</div>
<div style="margin-top:8px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.78);">${o.big.text}</div>
</td>
<td class="vmc-stack" width="3%">&nbsp;</td>
<td class="vmc-stack" width="45%" valign="top">${T()}<tr>${light(o.a, 0.2)}</tr>${gap(12)}<tr>${light(o.b, 0.35)}</tr></table></td>
</tr></table>`);
}
interface Cell { emoji: string; title: string; text: string }

/** Banda oscura con números grandes. */
function bigStats(items: [string, string][]): string {
  const w = Math.floor(100 / items.length);
  return row(`${T(`bgcolor="#1d0b4a" style="border-radius:24px;background-image:radial-gradient(circle at 0% 0%,rgba(0,174,177,0.45) 0%,rgba(0,0,0,0) 45%),linear-gradient(135deg,#2c1070 0%,#14072f 100%);"`)}<tr>
${items.map(([v, l], i) => `<td width="${w}%" align="center" style="padding:26px 6px;font-family:${F};${i ? 'border-left:1px solid rgba(255,255,255,0.12);' : ''}"><div class="vmc-rise" style="font-size:34px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;animation-delay:${0.1 + i * 0.15}s;">${v}</div><div style="margin-top:6px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${C.aqua};">${l}</div></td>`).join('')}
</tr></table>`);
}

/** Chat comprador ↔ vendedor. */
function chat(o: { head: string; msgs: { me: boolean; name: string; text: string }[] }): string {
  const bubble = (m: { me: boolean; name: string; text: string }, i: number) => `<tr><td align="${m.me ? 'right' : 'left'}" style="padding:0 0 12px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="vmc-pop" style="max-width:80%;animation-delay:${0.3 + i * 0.45}s;"><tr><td bgcolor="${m.me ? C.teal : '#ffffff'}" style="padding:12px 16px;border-radius:${m.me ? '20px 20px 6px 20px' : '20px 20px 20px 6px'};background-color:${m.me ? C.teal : '#ffffff'};${m.me ? 'background-image:linear-gradient(135deg,#00aeb1,#5f7de0);' : `border:1px solid ${C.line};`}box-shadow:0 8px 18px rgba(59,23,130,0.10);font-family:${F};">
<div style="font-size:11px;font-weight:800;letter-spacing:0.04em;color:${m.me ? 'rgba(255,255,255,0.85)' : C.violet};">${m.name}</div>
<div style="margin-top:3px;font-size:15px;line-height:1.45;color:${m.me ? '#ffffff' : C.ink};">${m.text}</div>
</td></tr></table></td></tr>`;
  return row(`${T(`bgcolor="#f3efff" style="border-radius:26px;background-image:linear-gradient(180deg,#f7f4ff 0%,#ebe4ff 100%);border:1px solid ${C.line};"`)}
<tr><td style="padding:14px 18px;border-bottom:1px solid ${C.line};font-family:${F};font-size:13px;font-weight:800;color:${C.purple};">💬 ${o.head}<span style="float:right;color:${C.tealDeep};">● en línea</span></td></tr>
<tr><td style="padding:18px 16px 6px;">${T()}${o.msgs.map(bubble).join('')}</table></td></tr></table>`);
}

/** Timeline vertical numerado con línea que conecta. */
function timeline(items: [string, string][], title = ''): string {
  const rows = items.map(([t, d], i) => `<tr>
<td width="52" valign="top" align="center" style="padding:0;">
<div style="width:40px;height:40px;line-height:40px;border-radius:50%;background-color:${C.violet};background-image:linear-gradient(135deg,#00aeb1,#8460e5);box-shadow:0 8px 18px rgba(132,96,229,0.35);font-family:${F};font-size:16px;font-weight:800;color:#ffffff;text-align:center;">${i + 1}</div>
${i < items.length - 1 ? `<div style="width:2px;height:34px;margin:4px auto;background-color:#d9cffb;font-size:0;line-height:0;">&nbsp;</div>` : ''}
</td>
<td valign="top" style="padding:6px 0 0 12px;font-family:${F};"><div class="vmc-rise" style="animation-delay:${0.15 + i * 0.15}s;"><div style="font-size:17px;font-weight:800;color:${C.purple};">${t}</div><div style="margin-top:2px;font-size:14px;line-height:1.5;color:${C.body};">${d}</div></div></td>
</tr>`).join('');
  return row(`${title ? `<div style="margin:0 0 16px;font-family:${F};font-size:20px;font-weight:800;letter-spacing:-0.01em;color:${C.purple};">${title}</div>` : ''}${T()}${rows}</table>`, '0 24px');
}

/** Ciclo horizontal: círculos con flechas. */
function cycle(items: [string, string][]): string {
  const cells = items.map(([e, l], i) => `<td align="center" valign="top" width="${Math.floor(76 / items.length)}%" style="font-family:${F};"><div class="vmc-float" style="display:inline-block;width:76px;height:76px;line-height:76px;border-radius:50%;background-color:#ffffff;border:1px solid ${C.line};box-shadow:0 12px 26px rgba(132,96,229,0.22);font-size:34px;text-align:center;animation-delay:${i * 0.4}s;">${e}</div><div style="margin-top:10px;font-size:15px;font-weight:800;color:${C.purple};">${l}</div></td>`);
  const arrow = `<td align="center" valign="top" style="padding-top:26px;font-family:${F};font-size:22px;font-weight:800;color:${C.teal};">→</td>`;
  return row(`${T(`bgcolor="#f3efff" style="border-radius:24px;background-image:radial-gradient(circle at 50% 0%,rgba(0,174,177,0.22) 0%,rgba(0,0,0,0) 60%),linear-gradient(180deg,#f7f4ff,#ebe4ff);"`)}<tr><td style="padding:26px 10px 22px;">${T()}<tr>${cells.join(arrow)}</tr></table>
<p style="margin:16px 0 0;text-align:center;font-family:${F};font-size:13px;font-weight:700;color:${C.tealDeep};">↺ y vuelta a empezar</p></td></tr></table>`);
}

/** Checklist con checks grandes. */
function checks(items: string[]): string {
  return row(`${T()}${items.map((t, i) => `<tr><td style="padding:0 0 10px;">${T(`bgcolor="#ffffff" style="border-radius:16px;border:1px solid ${C.line};"`)}<tr>
<td width="44" style="padding:12px 0 12px 14px;"><div style="width:30px;height:30px;line-height:30px;border-radius:10px;background-color:${C.teal};background-image:linear-gradient(135deg,#00aeb1,#5f7de0);font-family:${F};font-size:16px;font-weight:800;color:#ffffff;text-align:center;">✓</div></td>
<td class="vmc-rise" style="padding:12px 14px;font-family:${F};font-size:16px;font-weight:700;color:${C.purple};animation-delay:${0.1 + i * 0.12}s;">${t}</td></tr></table></td></tr>`).join('')}</table>`, '0 24px');
}

/** Tip editorial con comillas grandes. */
function tip(text: string, label = 'Tip'): string {
  return row(`${T(`bgcolor="#effafa" style="border-radius:20px;background-image:linear-gradient(135deg,rgba(0,174,177,0.12) 0%,rgba(132,96,229,0.08) 100%);"`)}<tr><td style="padding:20px 22px;font-family:${F};">
<div style="font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${C.tealDeep};">💡 ${label}</div>
<div style="margin-top:6px;font-size:18px;line-height:1.5;font-weight:700;color:${C.purple};letter-spacing:-0.01em;">${text}</div></td></tr></table>`, '0 24px');
}

/** P.D.: la línea que todos leen. */
const ps = (html: string) => p(`<b style="color:${C.violet};">P.D.</b> ${html}`, { size: 15, color: '#6b5f88' });

// ─── Animación + responsive (cada <style> por separado: si un cliente descarta uno, no se lleva el otro) ──
const MOTION = `<style>
@keyframes vmcRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes vmcShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes vmcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes vmcPop{0%{opacity:0;transform:scale(.85) translateY(10px)}100%{opacity:1;transform:none}}
@keyframes vmcGrow{from{width:0}}
@keyframes vmcBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes vmcBlink{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes vmcBadge{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
.vmc-rise{animation:vmcRise .8s cubic-bezier(.2,.8,.2,1) both}
.vmc-cta{animation:vmcShift 5s ease-in-out infinite}
.vmc-float{animation:vmcFloat 3.2s ease-in-out infinite}
.vmc-pop{animation:vmcPop .6s cubic-bezier(.2,.9,.3,1.3) both}
.vmc-grow{animation:vmcGrow 1.4s cubic-bezier(.2,.8,.2,1) both}
.vmc-bounce{animation:vmcBounce 1.6s ease-in-out infinite}
.vmc-blink{animation:vmcBlink 2.2s ease-in-out infinite}
.vmc-badge{display:inline-block;animation:vmcBadge 2.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;
const RESPONSIVE = `<style>
@media only screen and (max-width:480px){
.vmc-big{font-size:36px!important}
.vmc-huge{font-size:68px!important}
.ds-h1{font-size:26px!important;line-height:30px!important}
.vmc-stack{display:block!important;width:100%!important;box-sizing:border-box}
td.vmc-stack[width="8%"],td.vmc-stack[width="3%"]{padding:10px 0!important}
}
</style>`;

const MARK = 'VMCVALORIZABODYMARK';

interface Def {
  id: string; name: string; subject: string; preheader: string;
  stage: string; leadsTo?: string[]; hero: string; body: string[];
}

function build(d: Def): string {
  const marker: Section = { id: 'body', type: 'text', content: { text: MARK } };
  const body = [gap(28), ...d.body, gap(36)].join('\n');
  return glassNegociableEmail([marker], d.subject, d.preheader, d.hero)
    .replace('</head>', `${MOTION}\n${RESPONSIVE}\n</head>`)
    .replace(new RegExp(`<tr><td[^>]*>${MARK}</td></tr>`), body);
}

// ─── DESIGN SYSTEM VMC (vmc-index-lab · @vmc/concorde-adapter tokens) ────────
// Fuente: packages/concorde-adapter/src/tokens.css, Button primary (Concorde) y
// HomeCampaignBanner / anuncio «Valoriza tu auto en VMC» del feed VMC ahora.
// Lo usan los 4 boletines iniciales (A1–A4). B y C siguen como maqueta.
const DS = {
  ink: '#191c1c', muted: '#667085', v300: '#cfbaff', v500: '#8460e5', v700: '#3b1782',
  v900: '#22005c', orange: '#ed8936', divider: '#e8ddff', lav: '#f5f0ff',
};
const DS_SHADOW = '0 0 16px 4px rgba(32,0,104,0.10)';
const IMG = `${CDN}/correos/campana-valoriza`;

/** Botón primario Concorde: naranja→violeta, borde degradado y brillo arriba. */
function dsButton(text: string, url: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius:9999px;box-shadow:0 2px 6px rgba(237,137,54,0.30),0 10px 24px rgba(132,96,229,0.22);"><tr>
<td bgcolor="#fbc47d" style="padding:2px;border-radius:9999px;background-image:linear-gradient(135deg,#ffffff 0%,#fbc47d 25%,#ae8eff 75%,#ffffff 100%);">
<a class="vmc-cta" href="${url}" target="_blank" style="display:inline-block;padding:14px 44px;border-radius:9999px;background-color:${DS.orange};background-image:linear-gradient(rgba(255,255,255,0.17) 0%,rgba(255,255,255,0) 55%),linear-gradient(135deg,#ed8936 0%,#ed8936 40%,#8460e5 100%);font-family:${F};font-size:16px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;text-shadow:0 1px 3px rgba(0,0,0,0.25);">${text}&nbsp;&rarr;</a>
</td></tr></table>`;
}

/** Header compacto + tarjeta de campaña: imagen de marca arriba, copy y CTA abajo. */
function dsHero(o: { img: string; alt: string; eyebrow: string; title: string; text: string; cta: string; url: string }): string {
  return `${T()}<tr><td bgcolor="${DS.v900}" style="padding:16px 24px;border-radius:20px;background-image:linear-gradient(90deg,#22005c 0%,#3b1782 60%,#5a35c2 100%);">${logo(92)}</td></tr>
<tr><td height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td>${T(`bgcolor="#ffffff" class="vmc-rise" style="border-radius:20px;border:1px solid ${DS.divider};box-shadow:${DS_SHADOW};"`)}
<tr><td style="font-size:0;line-height:0;"><img src="${o.img}" alt="${o.alt}" width="566" border="0" style="display:block;width:100%;max-width:566px;height:auto;border-radius:20px 20px 0 0;"></td></tr>
<tr><td style="padding:24px 28px 28px;font-family:${F};">
<p style="margin:0;font-size:13px;line-height:18px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${DS.orange};">${o.eyebrow}</p>
<h1 class="ds-h1" style="margin:8px 0 0;font-family:${F};font-size:30px;line-height:34px;font-weight:800;letter-spacing:-0.03em;color:${DS.v700};">${o.title}</h1>
<p style="margin:12px 0 22px;font-size:15px;line-height:22px;color:${DS.ink};">${o.text}</p>
${dsButton(o.cta, o.url)}
</td></tr></table></td></tr></table>`;
}

const dsP = (html: string, o: { size?: number; color?: string; align?: string } = {}) =>
  row(`<p style="margin:0;font-family:${F};font-size:${o.size ?? 15}px;line-height:${o.size && o.size < 15 ? 20 : 22}px;color:${o.color ?? DS.ink};text-align:${o.align ?? 'left'};">${html}</p>`, '0 28px');
const dsB = (t: string) => `<b style="color:${DS.v700};">${t}</b>`;
const DS_HOLA = dsP('Hola {{Nombre usuario.Ejem: Gabriel Bruno}},');

/** Título de sección del Index («Lotes para explorar»). */
const dsTitle = (title: string, sub = '') => row(`<h2 style="margin:0;font-family:${F};font-size:22px;line-height:28px;font-weight:800;letter-spacing:-0.02em;color:${DS.v700};">${title}</h2>${sub ? `<p style="margin:4px 0 0;font-family:${F};font-size:13px;line-height:18px;color:${DS.muted};">${sub}</p>` : ''}`, '0 28px');

/** Filas tipo «Empresas y vendedores»: círculo lavanda, título, detalle y flecha. */
function dsRows(items: [string, string, string][]): string {
  const r = items.map(([mark, t, d], i) => `<tr><td style="padding:14px 18px;${i ? `border-top:1px solid ${DS.divider};` : ''}">${T()}<tr>
<td width="48" valign="middle"><div style="width:40px;height:40px;line-height:40px;border-radius:50%;background-color:${DS.lav};font-family:${F};font-size:${mark.length > 2 ? 18 : 16}px;font-weight:800;color:${DS.v700};text-align:center;">${mark}</div></td>
<td valign="middle" style="padding-left:12px;font-family:${F};"><div style="font-size:15px;line-height:20px;font-weight:700;color:${DS.ink};">${t}</div><div style="margin-top:2px;font-size:13px;line-height:18px;color:${DS.muted};">${d}</div></td>
</tr></table></td></tr>`).join('');
  return row(`${T(`bgcolor="#ffffff" style="border-radius:20px;border:1px solid ${DS.divider};box-shadow:${DS_SHADOW};"`)}${r}</table>`, '0 16px');
}

/** Puntos con check (columna derecha del HomeCampaignBanner). */
function dsPoints(items: string[]): string {
  return row(`${T()}${items.map((t) => `<tr><td width="34" valign="top" style="padding:0 0 12px;"><div style="width:24px;height:24px;line-height:24px;border-radius:50%;background-color:${DS.v700};font-family:${F};font-size:13px;font-weight:800;color:#ffffff;text-align:center;">✓</div></td><td valign="top" style="padding:2px 0 12px;font-family:${F};font-size:15px;line-height:20px;font-weight:500;color:${DS.v700};">${t}</td></tr>`).join('')}</table>`, '0 28px');
}

/** Nota referencial (lavanda, radio md). */
const dsNote = (html: string) => row(`${T(`bgcolor="${DS.lav}" style="border-radius:8px;"`)}<tr><td style="padding:14px 16px;font-family:${F};font-size:13px;line-height:19px;color:${DS.v700};">${html}</td></tr></table>`, '0 28px');

/** Dos cards tipo OfferCard: mismo auto, distinto estado y recorrido. */
function dsCompare(cards: { tag: string; chips: string[]; value: string; pct: number; high: boolean }[]): string {
  const card = (c: (typeof cards)[number]) => `<td class="vmc-stack" width="48%" valign="top" bgcolor="#ffffff" style="border-radius:20px;border:1px solid ${DS.divider};box-shadow:${DS_SHADOW};">
<div style="position:relative;"><img src="${IMG}/yaris.jpg" alt="Mismo modelo, año 2018" width="260" border="0" style="display:block;width:100%;height:auto;border-radius:20px 20px 0 0;"></div>
<div style="padding:14px 16px 18px;font-family:${F};">
<span style="display:inline-block;border-radius:9999px;padding:4px 12px;background-color:${c.high ? DS.v700 : DS.orange};font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#ffffff;">${c.tag}</span>
<div style="margin-top:10px;font-size:17px;line-height:22px;font-weight:800;color:${DS.ink};">2018 · Mismo modelo</div>
<div style="margin-top:8px;">${c.chips.map((x) => `<span style="display:inline-block;margin:0 4px 6px 0;border-radius:9999px;padding:3px 10px;background-color:#f2f4f7;font-size:12px;line-height:16px;color:${DS.muted};">${x}</span>`).join('')}</div>
<div style="margin-top:8px;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${DS.muted};">Valor referencial</div>
<div style="margin-top:2px;font-size:20px;line-height:26px;font-weight:800;color:${c.high ? DS.v700 : DS.orange};">${c.value}</div>
<div style="margin-top:10px;height:8px;border-radius:9999px;background-color:#eef0f3;font-size:0;line-height:0;"><div class="vmc-grow" style="width:${c.pct}%;height:8px;border-radius:9999px;background-color:${DS.orange};background-image:linear-gradient(90deg,#ed8936 0%,#8460e5 100%);">&nbsp;</div></div>
</div></td>`;
  return row(`${T()}<tr>${card(cards[0])}<td class="vmc-stack" width="4%" style="font-size:0;">&nbsp;</td>${card(cards[1])}</tr></table>`, '0 16px');
}

/** Cierre centrado con el CTA y P.D. */
const dsCta = (text: string, url: string) => row(`${T()}<tr><td align="center">${dsButton(text, url)}</td></tr></table>`);
const dsPs = (html: string) => dsP(`<b style="color:${DS.v500};">P.D.</b> ${html}`, { size: 14, color: DS.muted });
const DS_REF = 'Tu valorización es un <b>valor referencial con fecha</b>: una guía para decidir, no un precio fijo de venta.';

// ─── LOS 12 CORREOS ──────────────────────────────────────────────────────────
const DEFS: Def[] = [
  // ── A · LEADS WHATSAPP — los 4 INICIALES, con el design system VMC ───────
  // Cada uno toma una línea literal del audio del jefe.
  {
    id: 'valoriza-a1-leads-whatsapp',
    name: 'Valoriza A1 — antes de comprar o vender, valoriza',
    subject: 'Antes de comprar o vender, valoriza (gratis)',
    preheader: 'Nos escribiste por WhatsApp para valorizar. Ahora lo haces en minutos.',
    stage: 'Leads WhatsApp', leadsTo: ['valoriza-a2-leads-whatsapp'],
    hero: dsHero({ img: `${IMG}/whatsapp.jpg`, alt: 'Usuaria con su auto recibiendo un mensaje de WhatsApp', eyebrow: 'Valoriza tu auto en VMC', title: 'Antes de comprar o vender, valoriza', text: 'Hace un tiempo nos escribiste por WhatsApp para saber cuánto vale tu auto. Ahora lo descubres tú, en minutos y gratis.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      DS_HOLA, gap(8),
      dsP(`Valorizar es el primer paso de cualquier decisión con tu auto. ${dsB('Y en VMC es gratis, siempre.')}`),
      gap(28), dsTitle('¿Por qué valorizar?'), gap(14),
      dsRows([['🛒', 'Si vas a comprar', 'Sabes cuánto ofrecer y no pagas de más.'], ['🔑', 'Si vas a vender', 'Pides un precio con sustento y vendes con confianza.'], ['S/', 'Siempre gratis', 'Sin costo y sin compromiso de venta.']]),
      gap(24), dsNote(DS_REF),
      gap(28), dsCta('Valorizar mi auto', VALORIZA_URL),
      gap(24), dsPs('En el próximo correo te contamos cómo se valoriza, paso a paso.'),
    ],
  },
  {
    id: 'valoriza-a2-leads-whatsapp',
    name: 'Valoriza A2 — cómo se valoriza',
    subject: 'Así se valoriza tu auto en VMC, paso a paso',
    preheader: 'Tres pasos desde tu celular y tu valorización queda guardada.',
    stage: 'Leads WhatsApp', leadsTo: ['valoriza-a3-leads-whatsapp'],
    hero: dsHero({ img: `${IMG}/valoriza.jpg`, alt: 'Persona valorizando su auto desde el celular', eyebrow: 'Paso a paso', title: 'Así se valoriza tu auto', text: 'No tienes que llevarlo a ningún lado: lo haces desde tu celular, en minutos.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      DS_HOLA, gap(8),
      dsP(`Valorizar en ${dsB('VMC Subastas')} toma tres pasos:`),
      gap(18),
      dsRows([['1', 'Ingresa los datos de tu auto', 'Marca, modelo, año, recorrido y estado.'], ['2', 'Recibe tu valorización', 'Un valor referencial, con la fecha del día.'], ['3', 'Guárdala en Mi Garaje', 'Para consultarla cuando la necesites.']]),
      gap(24), dsNote(DS_REF),
      gap(28), dsCta('Valorizar mi auto', VALORIZA_URL),
      gap(24), dsPs('¿Por qué dos autos iguales pueden valer distinto? Te lo contamos en el próximo correo.'),
    ],
  },
  {
    id: 'valoriza-a3-leads-whatsapp',
    name: 'Valoriza A3 — mismo modelo, distinto estado y recorrido',
    subject: 'Mismo auto, dos valores distintos. ¿Por qué?',
    preheader: 'El estado y el recorrido cambian el valor de tu auto.',
    stage: 'Leads WhatsApp', leadsTo: ['valoriza-a4-leads-whatsapp'],
    hero: dsHero({ img: `${IMG}/recorrido.jpg`, alt: 'Persona revisando su auto junto a un velocímetro', eyebrow: 'Dato que vale', title: 'Misma marca, mismo modelo, distinto valor', text: 'El estado y el recorrido hacen la diferencia. Por eso conviene valorizar el tuyo.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      DS_HOLA, gap(8),
      dsP('Mira estos dos autos: misma marca, mismo modelo, mismo año. En papel son iguales. Su valor, no.'),
      gap(22),
      dsCompare([
        { tag: 'Auto A', chips: ['45,000 km', 'Mantenimiento al día', 'Sin choques'], value: 'Más alto', pct: 86, high: true },
        { tag: 'Auto B', chips: ['140,000 km', 'Sin historial', 'Golpes por reparar'], value: 'Más bajo', pct: 46, high: false },
      ]),
      gap(28), dsTitle('Lo que más mueve el valor'), gap(14),
      dsPoints(['El recorrido: cuántos kilómetros tiene.', 'El estado: carrocería, pintura y mecánica.', 'El mantenimiento: si está al día y documentado.']),
      gap(18), dsCta('Valorizar mi auto', VALORIZA_URL),
      gap(24), dsPs(`Ahora tu valorización no se queda en un número: ${dsB('puedes guardarla y publicar tu auto')}. Te lo contamos en el próximo correo.`),
    ],
  },
  {
    id: 'valoriza-a4-leads-whatsapp',
    name: 'Valoriza A4 — valoriza, guarda y publica',
    subject: 'Nuevo: valoriza, guarda y publica tu auto',
    preheader: 'Un nuevo canal de ventas para ti: publica en VMC y recibe ofertas.',
    stage: 'Leads WhatsApp',
    hero: dsHero({ img: `${IMG}/publica.jpg`, alt: 'Vendedor entregando las llaves de su auto', eyebrow: 'Nuevo en VMC', title: 'Ahora puedes valorizar, guardar y publicar', text: 'Con tu valorización lista, publica tu auto en VMC y recibe ofertas. Un nuevo canal de ventas para ti.', cta: 'Valorizar', url: VALORIZA_URL }),
    body: [
      DS_HOLA, gap(8),
      dsP(`Todo en un mismo lugar, ${dsB('desde Mi Garaje')}:`),
      gap(18),
      dsRows([['1', 'Valoriza', 'Gratis y en minutos.'], ['2', 'Guarda', 'Tu valorización queda en Mi Garaje.'], ['3', 'Publica', 'Cuando decidas vender, y recibe ofertas.']]),
      gap(28), dsTitle('Publica tu auto en VMC y recibe ofertas'), gap(14),
      dsPoints(['Los compradores te envían sus propuestas.', 'Tú decides: aceptar, contraproponer o rechazar.', 'Te pueden enviar preguntas antes de ofertar.']),
      gap(18), dsCta('Valorizar mi auto', VALORIZA_URL),
      gap(18), dsP(`¿Ya valorizaste? <a href="${PUBLICAR_URL}" target="_blank" style="font-weight:700;color:${DS.v500};text-decoration:underline;">Publica tu auto aquí</a>.`, { size: 14, align: 'center', color: DS.muted }),
    ],
  },

  // ── B · COMPRADORES ───────────────────────────────────────────────────────
  {
    id: 'valoriza-b1-compradores',
    name: 'Valoriza B1 — antes de comprar, valoriza',
    subject: 'Antes de comprar, valoriza',
    preheader: 'Sabe cuánto vale un auto antes de ofertar. Gratis.',
    stage: 'Compradores', leadsTo: ['valoriza-b2-compradores'],
    hero: heroDark({ kicker: 'Compra con datos', big: 'No pagues', accent: 'de más.', sub: 'Antes de ofertar, valoriza. Gratis y en minutos.', tone: 'coral', emoji: '🔍' }),
    body: [
      HOLA, gap(10),
      p(`Encontraste el auto. Te gusta. Pero, ¿cuánto vale de verdad? Ofertar a ciegas es la forma más rápida de ${warn('pagar de más')}.`),
      gap(28),
      gauge({ title: '¿El precio que ves es justo?', segs: [['Ganga', 'Bajo su valor', C.teal], ['Justo', 'En su valor', C.violet], ['Caro', 'Sobre su valor', C.coral]], pin: 1, pinLabel: 'Lo sabrás' }),
      gap(28),
      bento({
        big: { emoji: '🎯', title: 'Sabes cuánto ofrecer', text: 'Tu propuesta parte de un precio real, no de una corazonada.' },
        a: { emoji: '💎', title: 'Detectas gangas', text: 'Si está bajo su valor, lo sabrás.' },
        b: { emoji: '🤝', title: 'Negocias mejor', text: 'Con datos sobre la mesa.' },
      }),
      gap(32),
      cta('Quiero valorizar antes de comprar', VALORIZA_URL, 'coral', 'Gratis, siempre.'),
    ],
  },
  {
    id: 'valoriza-b2-compradores',
    name: 'Valoriza B2 — mismo modelo, distinto precio',
    subject: '¿Por qué dos autos iguales valen distinto?',
    preheader: 'Aprende a leer un precio antes de ofertar.',
    stage: 'Compradores', leadsTo: ['valoriza-b3-compradores'],
    hero: heroGiant({ kicker: 'Ojo comprador', word: '¿Ganga?', line: 'Mismo modelo, distinto precio.', sub: 'Aprende a leer un precio antes de ofertar.' }),
    body: [
      HOLA, gap(10),
      p('Dos autos con la misma ficha pueden tener precios muy distintos. Casi siempre hay una razón, y conviene saberla antes de ofertar:'),
      gap(24),
      versus({
        a: { tag: 'Opción A', title: 'Toyota Yaris 2018', attrs: ['🛣️ 45,000 km', '🔧 Mantenimientos al día', '✨ Pintura original'], pct: 88, verdict: 'Precio alto, justificado', good: true },
        b: { tag: 'Opción B', title: 'Toyota Yaris 2018', attrs: ['🛣️ 140,000 km', '🔧 Sin historial', '🎨 Golpes por reparar'], pct: 48, verdict: '¿Barato… o caro?', good: false },
      }),
      gap(28),
      p(`Antes de decidir, revisa esto:`, { size: 17 }),
      gap(14),
      checks(['Recorrido real', 'Historial de mantenimiento', 'Estado de carrocería y pintura']),
      gap(26),
      cta('Quiero valorizar un auto', VALORIZA_URL, 'violet'),
      gap(24),
      ps(`En minutos sabrás si el precio es ${hi('justo, alto o una oportunidad')}.`),
    ],
  },
  {
    id: 'valoriza-b3-compradores',
    name: 'Valoriza B3 — pregúntale al vendedor',
    subject: 'Nuevo: ahora puedes preguntarle al vendedor',
    preheader: 'Resuelve tus dudas antes de ofertar, directo con quien vende.',
    stage: 'Compradores', leadsTo: ['valoriza-b4-compradores'],
    hero: heroDark({ kicker: 'Nuevo en VMC', big: 'Pregúntale', accent: 'al vendedor.', sub: 'Resuelve tus dudas antes de ofertar. Sin adivinar.', emoji: '💬' }),
    body: [
      HOLA, gap(10),
      p(`¿Tiene los mantenimientos al día? ¿Cuántos dueños tuvo? Ahora puedes ${b('enviar tus preguntas y comentarios')} directamente al vendedor.`),
      gap(28),
      chat({ head: 'Toyota Yaris 2018', msgs: [
        { me: true, name: 'Tú', text: '¡Hola! ¿Tiene los mantenimientos al día?' },
        { me: false, name: 'Vendedor', text: 'Sí, todos en concesionario. Te comparto el historial 👍' },
        { me: true, name: 'Tú', text: '¡Perfecto! Entonces envío mi propuesta.' },
      ] }),
      gap(32),
      timeline([['Entra a la oferta', 'La que te interesa.'], ['Escribe tu pregunta', 'Estado, papeles, mantenimientos…'], ['Oferta con confianza', 'Ya sin dudas.']]),
      gap(28),
      cta('Quiero ver las ofertas', OFERTAS_URL, 'teal'),
      gap(24),
      ps(`La combinación ganadora: pregunta, ${b('valoriza')} y luego oferta.`),
    ],
  },
  {
    id: 'valoriza-b4-compradores',
    name: 'Valoriza B4 — ¿compras? sé revendedor',
    subject: '¿Compras autos? También puedes venderlos aquí',
    preheader: 'Un nuevo canal de ventas para ti, con miles de compradores.',
    stage: 'Compradores',
    hero: heroPhoto({ img: IMG_VENDEDOR, alt: 'Revendedor feliz en su auto', kicker: 'Nuevo canal de ventas', big: '¿Compras?', accent: 'Sé revendedor.' }),
    body: [
      HOLA, gap(10),
      p(`Ya sabes comprar en ${b('VMC Subastas')}. Ahora también puedes ${hi('vender aquí')}: publica tus autos y llega a miles de compradores que ya buscan en VMC.`),
      gap(28),
      cycle([['🛒', 'Compra'], ['🔍', 'Valoriza'], ['💸', 'Vende']]),
      gap(20),
      bigStats([['Gratis', 'Valorizar'], ['Miles', 'De compradores'], ['100%', 'Tú decides']]),
      gap(32),
      cta('Quiero empezar a vender', PUBLICAR_URL, 'coral'),
      gap(24),
      ps('Valoriza antes de publicar: el precio correcto vende más rápido.'),
    ],
  },

  // ── C · VENDEDORES ────────────────────────────────────────────────────────
  {
    id: 'valoriza-c1-vendedores',
    name: 'Valoriza C1 — antes de vender, valoriza',
    subject: 'Antes de vender, valoriza',
    preheader: 'Ni lo regales ni lo dejes sin vender. Gratis.',
    stage: 'Vendedores', leadsTo: ['valoriza-c2-vendedores'],
    hero: heroGiant({ kicker: 'Vende con datos', word: 'S/ ¿?', line: 'Ni regalado, ni estancado.', sub: 'El precio correcto está en el medio. Y no se adivina.' }),
    body: [
      HOLA, gap(10),
      p(`Si pides muy poco, ${warn('pierdes plata')}. Si pides demasiado, tu auto ${warn('se queda meses sin vender')}. El precio correcto está en el medio:`),
      gap(26),
      gauge({ title: '¿Dónde está tu precio?', segs: [['Muy bajo', 'Pierdes plata', C.coral], ['Justo', 'Vendes rápido', C.teal], ['Muy alto', 'No se vende', C.coral]], pin: 1, pinLabel: 'Aquí' }),
      gap(28),
      p(`Valoriza tu auto en ${b('VMC Subastas')}: es ${hi('gratis')} y te da su precio real según su estado y recorrido.`),
      gap(28),
      cta('Quiero valorizar mi auto', VALORIZA_URL, 'teal', 'Gratis, siempre.'),
    ],
  },
  {
    id: 'valoriza-c2-vendedores',
    name: 'Valoriza C2 — de la valorización a la venta',
    subject: 'Valoriza, guarda y publica en 3 pasos',
    preheader: 'Tu valorización ahora te lleva directo a vender.',
    stage: 'Vendedores', leadsTo: ['valoriza-c3-vendedores'],
    hero: heroPhoto({ img: IMG_AUTO, alt: 'Auto listo para vender', kicker: 'Nuevo en VMC', big: 'De la valorización', accent: 'a la venta.' }),
    body: [
      HOLA, gap(10),
      p(`Ahora tu valorización no se queda en un número: la guardas y, cuando quieras, ${b('publicas tu auto')} con ese precio como base.`),
      gap(28),
      timeline([['Valoriza', 'Gratis y en minutos.'], ['Guarda', 'Queda en Mi Garaje.'], ['Publica', 'Con un clic, y empieza a recibir propuestas.']], 'Así de simple'),
      gap(24),
      ticket({ title: 'Mi Garaje', rows: [['Valorización', 'Guardada ✓'], ['Precio base', 'Listo ✓'], ['Publicación', 'A un clic']], label: 'Estado', value: '¡Listo! 🚀', foot: 'Solo falta que lo publiques' }),
      gap(28),
      cta('Quiero publicar mi auto', PUBLICAR_URL, 'violet'),
    ],
  },
  {
    id: 'valoriza-c3-vendedores',
    name: 'Valoriza C3 — vende con nosotros',
    subject: 'Tu auto, frente a miles de compradores',
    preheader: 'Un nuevo canal de ventas: tú decides a quién y a cuánto.',
    stage: 'Vendedores', leadsTo: ['valoriza-c4-vendedores'],
    hero: heroDark({ kicker: 'Nuevo canal de ventas', big: 'Miles de', accent: 'compradores.', sub: 'Publica tu auto y deja que las propuestas lleguen a ti.', tone: 'violet', emoji: '📣' }),
    body: [
      HOLA, gap(10),
      p(`Olvídate de las llamadas a cualquier hora. Publica tu auto en ${b('VMC Subastas')} y deja que ${hi('miles de compradores')} te envíen sus propuestas.`),
      gap(26),
      bigStats([['Miles', 'De compradores'], ['24 h', 'Para responder'], ['100%', 'Es tuyo']]),
      gap(20),
      bento({
        big: { emoji: '📲', title: 'Recibe propuestas', text: 'Directo en Mi Garaje, sin llamadas ni intermediarios.' },
        a: { emoji: '⚖️', title: 'Tú decides', text: 'Acepta, contrapropón o rechaza.' },
        b: { emoji: '💸', title: 'El 100% es tuyo', text: 'Cierras directo con el comprador.' },
      }),
      gap(32),
      cta('Quiero publicar mi auto', PUBLICAR_URL, 'violet'),
      gap(24),
      ps(`¿No sabes a cuánto publicarlo? ${b('Valorízalo gratis')} primero.`),
    ],
  },
  {
    id: 'valoriza-c4-vendedores',
    name: 'Valoriza C4 — los compradores te escriben',
    subject: 'Los compradores ya pueden escribirte',
    preheader: 'Responde sus dudas y cierra la venta más rápido.',
    stage: 'Vendedores',
    hero: heroPhoto({ img: IMG_VENDEDOR, alt: 'Vendedor feliz con su auto', kicker: 'Nuevo en VMC', big: 'Los compradores', accent: 'te escriben.' }),
    body: [
      HOLA, gap(10),
      p(`Ahora los compradores pueden ${b('enviarte preguntas y comentarios')} sobre tu auto antes de ofertar. Un comprador sin dudas es un comprador que ${hi('oferta con confianza')}.`),
      gap(28),
      chat({ head: 'Pregunta sobre tu auto', msgs: [
        { me: false, name: 'Comprador', text: '¿Cuántos dueños tuvo? ¿Tiene SOAT vigente?' },
        { me: true, name: 'Tú', text: 'Un solo dueño y SOAT al día. ¡Te espero en la negociación!' },
        { me: false, name: 'Comprador', text: '¡Genial! Te envío mi propuesta 🙌' },
      ] }),
      gap(28),
      tip('Responde rápido y con detalle: mantenimientos, papeles y estado. Es lo que más preguntan.'),
      gap(28),
      cta('Quiero publicar mi auto', PUBLICAR_URL, 'teal'),
    ],
  },
];

export const CAMPANA_VALORIZA: EmailTemplate[] = DEFS.map((d) => ({
  id: d.id, name: /-a\d-/.test(d.id) ? d.name : `${d.name} (maqueta)`, subject: d.subject, category: CATEGORIA, stage: d.stage, leadsTo: d.leadsTo,
  sections: [],
  html: build(d),
}));
