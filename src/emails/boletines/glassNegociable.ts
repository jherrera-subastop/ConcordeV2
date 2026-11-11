/**
 * Banner + footer GLASS CLARO propios de «oferta-publicada-vendedor»: lavanda
 * esmerilado con halos teal y violeta muy suaves, láminas de vidrio blanco con
 * brillo arriba y borde luminoso. Todo el correo va en modo claro.
 *
 * ponytail: es de UN correo, así que no entra al sistema de tonos/tipologías
 * (headerSwap). Los tabs Banner/Fondo del detalle no lo cambian: sus
 * marcadores no están aquí y el swap no hace nada. Si otro correo lo quiere,
 * ahí sí se sube como tono «Glass».
 *
 * Sin backdrop-filter (ningún cliente de correo lo aplica): el vidrio se
 * finge con capas de gradiente translúcido. bgcolor plano para Outlook.
 */

import { generateEmail, type Section } from "../prodEmailTemplates";
import { swapEmailFooter, swapEmailHeader, stripBodyTitle } from "../headerSwap";

const FONT = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
/** Logo oficial (public/logo-vmc.svg exportado a PNG 3x con sharp: Gmail y Outlook no muestran SVG). Blanco: va sobre la franja morada, ver BRAND_SKY. */
const LOGO = "https://concorde-v2-theta.vercel.app/logo-vmc@3x.png";
const AYUDA = "https://www.vmcsubastas.com/centro-de-ayuda";

/** Fondo lavanda con halos. */
const MIST = "radial-gradient(circle at 92% 0%,rgba(0,174,177,0.26) 0%,rgba(0,174,177,0) 44%),radial-gradient(circle at 0% 100%,rgba(132,96,229,0.30) 0%,rgba(132,96,229,0) 52%),linear-gradient(160deg,#faf8ff 0%,#ebe4ff 100%)";
/**
 * Cielo de marca del banner: arriba morado (donde vive el logo BLANCO, con
 * contraste real) que se disuelve en lavanda hacia abajo, donde se apoya la
 * lámina de vidrio del título. Así el correo sigue claro y el logo no necesita
 * caja. Outlook ve el bgcolor morado plano: el panel blanco igual se lee.
 */
const BRAND_SKY = "radial-gradient(circle at 90% 0%,rgba(0,174,177,0.55) 0%,rgba(0,174,177,0) 40%),radial-gradient(circle at 8% 10%,rgba(132,96,229,0.55) 0%,rgba(132,96,229,0) 38%),linear-gradient(180deg,#3b1782 0%,#5a35c2 34%,#a48ef0 58%,#ece6ff 80%,#f5f2ff 100%)";
/** Lámina de vidrio blanco: brillo arriba que se apaga hacia abajo. */
const PANE = "background-color:rgba(255,255,255,0.62);background-image:linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0.45) 100%);border:1px solid #ffffff;box-shadow:inset 0 1px 0 #ffffff,0 12px 30px rgba(59,23,130,0.16);";
const SHELL = `bgcolor="#f3efff" style="border-radius:24px;background-image:${MIST};border:1px solid rgba(132,96,229,0.18);"`;

const logo = (w: number) => `<img src="${LOGO}" width="${w}" alt="vmc Subastas" border="0" style="display:block;width:${w}px;height:auto;">`;

/** Textos del banner. Por defecto, los de «oferta-publicada-vendedor». */
export interface GlassHero { badge: string; title: string; accent: string }
const HERO_OFERTA: GlassHero = {
  badge: "", // sin pastilla: el banner de «Oferta publicada» ya no la lleva
  title: "¡Tu vehículo ya está publicado! &#128663;",
  accent: "Prepárate para recibir ofertas",
};

function banner(h: GlassHero): string {
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#5a35c2" style="border-radius:24px;background-image:${BRAND_SKY};">
<tr><td align="center" style="padding:30px 24px 28px;font-family:${FONT};">
<table border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;"><tr><td>${logo(132)}</td></tr></table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;border-radius:20px;${PANE}"><tr><td align="center" style="padding:22px 24px 26px;">
${h.badge ? `<table border="0" cellpadding="0" cellspacing="0" align="center"><tr><td style="border-radius:9999px;padding:5px 14px;background-color:rgba(0,174,177,0.10);border:1px solid rgba(0,174,177,0.35);font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#00797b;">${h.badge}</td></tr></table>` : ""}
<h1 style="margin:${h.badge ? "14px 0 0" : "0"};font-size:26px;font-weight:800;line-height:1.25;letter-spacing:-0.02em;color:#3b1782;font-family:${FONT};">${h.title}<br><span style="color:#00898b;">${h.accent}</span></h1>
</td></tr></table>
</td></tr></table>`;
}

/** Footer partido: columna de marca en morado (logo blanco) + columna clara de ayuda. */
const FOOTER = `<table border="0" cellpadding="0" cellspacing="0" width="100%" ${SHELL.replace('24px', '20px')}>
<tr><td style="padding:14px;font-family:${FONT};">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:16px;${PANE}"><tr>
<td width="50%" valign="middle" bgcolor="#4a25a8" style="padding:22px 20px 22px 24px;border-radius:16px 0 0 16px;background-image:radial-gradient(circle at 100% 0%,rgba(0,174,177,0.45) 0%,rgba(0,174,177,0) 50%),linear-gradient(150deg,#3b1782 0%,#5a35c2 60%,#8460e5 100%);">
${logo(96)}
<p style="margin:10px 0 0;font-size:14px;line-height:1.4;font-weight:600;color:#ffffff;">¡Despierta al cazador de ofertas que hay en ti!</p>
</td>
<td width="50%" align="center" valign="middle" style="padding:20px 24px 20px 20px;">
<p style="margin:0;font-size:16px;font-weight:800;color:#3b1782;">¿Quieres saber más?</p>
<p style="margin:4px 0 12px;font-size:14px;line-height:1.4;color:#5a4d75;">Visita nuestro <b style="color:#00797b;">Centro de Ayuda</b></p>
<a href="${AYUDA}" target="_blank" style="display:inline-block;border-radius:9999px;padding:10px 26px;background-color:#ffffff;border:1px solid rgba(132,96,229,0.40);box-shadow:inset 0 1px 0 #ffffff,0 2px 8px rgba(59,23,130,0.10);font-size:14px;font-weight:700;color:#3b1782;text-decoration:none;">¡Vamos!</a>
</td>
</tr></table>
</td></tr></table>`;

/**
 * Forzado a modo CLARO: sin esto Apple Mail y Outlook pueden oscurecer el
 * correo por su cuenta. Gmail invierte igual (no hay forma de impedirlo), por
 * eso el texto va en navy y no en negro puro.
 */
const LIGHT_HEAD = `<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<style>:root{color-scheme:light only;supported-color-schemes:light;}</style>`;

/** El correo completo: cuerpo del renderer + banner/footer glass. */
/** `hero`: textos para el banner glass, o el HTML de un banner propio (campaña Valoriza). */
export function glassNegociableEmail(sections: Section[], subject: string, preheader: string, hero: GlassHero | string = HERO_OFERTA): string {
  const top = typeof hero === "string" ? hero : banner(hero);
  let html = swapEmailFooter(stripBodyTitle(swapEmailHeader(generateEmail(sections, subject), top)), FOOTER);
  // Preheader: el texto gris que la bandeja muestra junto al asunto. Va oculto
  // al inicio del body; los &zwnj; evitan que el cliente rellene con el cuerpo.
  const pre = `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">${preheader}${"&zwnj;&nbsp;".repeat(60)}</div>`;
  html = html
    .replace("</head>", `${LIGHT_HEAD}\n</head>`)
    .replace(/(<body[^>]*>)/, `$1\n${pre}`)
    // tablas de maquetación: los lectores de pantalla no las anuncian como datos
    .replace(/<table /g, '<table role="presentation" ');
  return html;
}
