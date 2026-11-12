/* ─────────────────────────────────────────────────────────────────────────────
   PORTADO desde el repo Concorde-Email (github.com/Jarbram/Concorde-Email),
   archivo `lib/emails.ts`. Es la FUENTE DE VERDAD de los correos que existen
   hoy en producción (concorde-email.vercel.app) — no editar a mano aquí salvo
   para resincronizar contra el original.

   Cambios respecto al original (los ÚNICOS; conservarlos al resincronizar):
     · la ruta del import de `Section` (./email-templates → ./prodEmailTemplates)
     · los `name` están en ESPAÑOL — el catálogo lo revisan personas de negocio,
       no ingeniería, así que los nombres se leen en su idioma
     · se quitó el campo `desc` (la descripción en inglés de cada card): en el
       catálogo de revisión el preview del correo ya dice de qué trata

   Si Concorde-Email cambia, este archivo y prodEmailTemplates.ts hay que
   volver a copiarlos. Ver src/emails/registry.ts, que los consume.
   ───────────────────────────────────────────────────────────────────────────── */

/* Catálogo de correos ya armados. Sumar uno = agregar un objeto a EMAILS.
   Cada correo respeta el layout y distancias del original; el estilo (glass,
   gradientes, coral) lo aplica el render de secciones según patrones.md. */

import { Section } from './prodEmailTemplates';
import { BOLETIN_MAF_PERU_HTML } from './boletines/mafPeru';
import { glassNegociableEmail } from './boletines/glassNegociable';
import { CAMPANA_VALORIZA } from './boletines/campanaValoriza';

export interface EmailTemplate {
  id: string;        // slug para la URL
  name: string;      // nombre visible
  subject: string;   // asunto del correo
  category?: string; // agrupa la card en el catálogo (ej. "En vivo")
  stage?: string;     // paso dentro del flujo de la categoría (ej. "Negociación"), pinta el stepper
  leadsTo?: string[]; // ids de correos a los que puede derivar (dibuja las líneas del diagrama de flujo)
  sections: Section[];
  /** HTML crudo del correo. Si va, se usa TAL CUAL y se ignoran `sections`
   *  (registry.toReal / VariantesCatalog). Para maquetas que no encajan en el
   *  renderer de secciones — hero con foto de fondo, cards con CTA propia, etc. */
  html?: string;
}

/**
 * Gema de subasta (SubasCoins) — SVG copiado de src/components/PriceIcon.tsx
 * (variante md `default`). Va inline en el HTML para que el correo copiado no
 * dependa del CDN. Se le quitaron los <filter> de sombra: ningún cliente de
 * correo los aplica y solo doblaban el peso del markup.
 */
const SVG_SUBASCOINS = `<svg width="116" height="122" viewBox="0 0 36 38" fill="none" aria-hidden="true"> <g> <path d="M18 21.5L30 27L18 32.5L6 27L18 21.5Z" fill="url(#pi-d)" /> <path d="M18 21.5L30 27L18 32.5L6 27L18 21.5" stroke="url(#pi-ds)" stroke-width="2" stroke-linejoin="round" /> <g> <g clip-path="url(#pi-c0)"> <rect x="8" y="7" width="20" height="20" rx="10" fill="url(#pi-c)" /> <g clip-path="url(#pi-c1)"> <path d="M18 12.4165V21.5832" stroke="white" stroke-opacity="0.92" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" /> <path d="M20.0833 14.0835H16.9583C16.1535 14.0835 15.5 14.737 15.5 15.5418C15.5 16.3467 16.1535 17.0002 16.9583 17.0002H19.0417C19.8465 17.0002 20.5 17.6536 20.5 18.4585C20.5 19.2634 19.8465 19.9168 19.0417 19.9168H15.5" stroke="white" stroke-opacity="0.92" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" /> </g> <rect x="10" y="9" width="16" height="16" rx="8" fill="url(#pi-cg)" /> </g> <rect x="9" y="8" width="18" height="18" rx="9" stroke="url(#pi-cb)" stroke-width="2" /> </g> </g> <defs> <linearGradient id="pi-d" x1="6" y1="21.5" x2="29.121" y2="34.1115" gradientUnits="userSpaceOnUse"> <stop stop-color="#00A7A8" /><stop offset="0.4" stop-color="#86A4E4" /><stop offset="0.75" stop-color="#4C1EBC" /><stop offset="1" stop-color="#300089" /> </linearGradient> <linearGradient id="pi-ds" x1="6" y1="21.5" x2="29.121" y2="34.1115" gradientUnits="userSpaceOnUse"> <stop stop-color="#73DFDF" /><stop offset="0.0001" stop-color="#5C82DA" /><stop offset="0.283654" stop-color="white" stop-opacity="0.9" /><stop offset="0.875" stop-color="#452AA2" stop-opacity="0.6" /> </linearGradient> <linearGradient id="pi-c" x1="10.0116" y1="5.59144" x2="25.9884" y2="28.4086" gradientUnits="userSpaceOnUse"> <stop stop-color="#00ABAD" /><stop offset="0.4" stop-color="#86A4E4" /><stop offset="0.75" stop-color="#4C1EBC" /><stop offset="1" stop-color="#31008A" /> </linearGradient> <linearGradient id="pi-cg" x1="18" y1="9" x2="18" y2="25" gradientUnits="userSpaceOnUse"> <stop stop-color="white" stop-opacity="0.45" /><stop offset="0.5" stop-color="white" stop-opacity="0" /> </linearGradient> <linearGradient id="pi-cb" x1="10.0116" y1="5.59144" x2="25.9884" y2="28.4086" gradientUnits="userSpaceOnUse"> <stop stop-color="#44D6D6" /><stop offset="0.206731" stop-color="#E4EEFF" stop-opacity="0.5" /><stop offset="0.495192" stop-color="#567CD3" /><stop offset="1" stop-color="#3D0D9E" /> </linearGradient> <clipPath id="pi-c0"><rect x="8" y="7" width="20" height="20" rx="10" fill="white" /></clipPath> <clipPath id="pi-c1"><rect width="10" height="10" fill="white" transform="translate(13 12)" /></clipPath> </defs> </svg>`;

/**
 * La gema de SubasCoins en TAMAÑO CHICO, para el icono de una card (la grande es
 * de 116px y ahí no cabe). Los `id` de <defs> son globales en el documento, así
 * que se les pone el prefijo `ps-` para que no colisionen con la versión grande
 * cuando ambas viven en el mismo correo.
 */
/**
 * Iconos del bloque «Agrega fondos» del correo de bienvenida. Son los MISMOS
 * assets del CDN que usa el export de Figma (public/figma/correos/
 * bienvenida-registro.html), no equivalentes dibujados a mano: así el maquetado y
 * la referencia comparan pixel a pixel.
 */
const img = (file: string, w: number, h: number): string =>
  `<img src="https://cdn.vmcsubastas.com/services/boletin/assets/${file}" width="${w}" height="${h}" alt="" border="0" style="display:block;" />`;

/**
 * La gema de SubasCoins en tamaño de icono. Va en la burbuja de la card «Adquiere
 * SubasCoins» — el Figma pone ahí una billetera, pero la gema es la marca del
 * producto que la card vende, así que manda esa.
 *
 * Los `id` de <defs> son globales en el documento: se les cambia el prefijo a
 * `ps-` para no colisionar con la versión grande si ambas coinciden en un correo.
 */
const SVG_SUBASCOINS_ICON = SVG_SUBASCOINS
  .replace('width="116" height="122"', 'width="40" height="42"')
  .replace(/pi-/g, 'ps-');

/** Los dos iconos de «¿Cómo recargar vía BCP?», en su burbuja morada (ver Figma). */
const IMG_BCP_ONLINE = img('icon-bcp-online.png', 22, 22);
const IMG_BCP_VENTANILLA = img('icon-bcp-ventanilla.png', 22, 22);

const IMG_BANK = img('bank-building.png', 46, 46);

/**
 * Check y escudo como SVG inline en vez de los PNG del CDN, para poder darles el
 * DEGRADADO de marca: el `shield.png` original es morado plano y el `check-icon.png`
 * trae su propio degradado quemado, así que ninguno se podía re-tintar desde el
 * HTML. En SVG el gradiente es parte del icono y ambos quedan coherentes entre sí.
 *
 * Cada uno usa ids de <defs> propios (`gc-`, `gs-`): son globales en el documento y
 * dos iconos con el mismo id se pisarían.
 */
const G_ICON_STOPS = `<stop stop-color="#5F3ED8" /><stop offset="0.55" stop-color="#3B1782" /><stop offset="1" stop-color="#2A0F60" />`;

const IMG_CHECK = `<svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden="true" style="display:block;">
<circle cx="20" cy="20" r="20" fill="url(#gc-a)" />
<path d="M12.5 20.5l5 5 10-11" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />
<defs><linearGradient id="gc-a" x1="4" y1="2" x2="34" y2="38" gradientUnits="userSpaceOnUse">${G_ICON_STOPS}</linearGradient></defs>
</svg>`;

const IMG_SHIELD = `<svg width="60" height="66" viewBox="0 0 60 66" fill="none" aria-hidden="true" style="display:block;">
<path d="M30 2l24 9v20c0 15-10 27-24 33C16 58 6 46 6 31V11l24-9z" fill="url(#gs-a)" />
<circle cx="30" cy="31" r="12.5" stroke="#ffffff" stroke-width="3.2" fill="none" />
<path d="M24.5 31l4 4 7.5-8" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
<defs><linearGradient id="gs-a" x1="6" y1="2" x2="52" y2="62" gradientUnits="userSpaceOnUse">${G_ICON_STOPS}</linearGradient></defs>
</svg>`;

/**
 * El mockup del celular RECONSTRUIDO EN HTML (antes era phone-mockup.png).
 *
 * Se rehízo porque el PNG traía el botón «CONFIRMAR» rasterizado, así que no podía
 * llevar el estilo primary del sistema (gradiente naranja→vault con glow y borde).
 * En HTML sí: el botón de abajo es el mismo tratamiento que «¡Vamos!» y el resto de
 * CTAs del correo. De paso el texto es texto —se puede leer, seleccionar y
 * traducir— y no se pixela en pantallas retina.
 *
 * Es email-safe: tablas anidadas y estilos inline, sin flex ni position. El marco
 * del teléfono son dos tablas concéntricas con `border-radius`; los clientes que no
 * lo soportan (Outlook viejo) lo ven con esquinas rectas, que es una degradación
 * aceptable para un adorno.
 */
const PHONE_W = 104;

const PHONE_FONT = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";

/** Una fila «etiqueta … valor» del resumen de compra dentro del mockup. */
function phoneRow(label: string, value: string, muted: boolean): string {
  return `<tr><td style="font-size:5.5px;line-height:10px;color:${muted ? '#8b7fa8' : '#5a4d75'};font-family:${PHONE_FONT};padding:1.5px 0;">${label}</td>
<td align="right" style="font-size:5.5px;line-height:10px;color:#3b1782;font-weight:700;white-space:nowrap;font-family:${PHONE_FONT};padding:1.5px 0;">${value}</td></tr>`;
}

const HTML_PHONE = `<table border="0" cellpadding="0" cellspacing="0" width="${PHONE_W}" align="center" style="margin:-58px auto 0;">
<tr><td bgcolor="#3b1782" style="background-color:#3b1782;border-radius:10px;padding:4px;">
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td>
<table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f5f3fe" style="background-color:#f5f3fe;border-radius:8px;">
<!-- Isla del notch: pastilla oscura centrada que se MONTA sobre la pantalla, como
     la Dynamic Island del iPhone. Va dentro de la pantalla (no en el marco) y con
     margen negativo, asi el borde superior queda partido por ella en vez de
     mostrar una barra suelta debajo del canto. -->
<tr><td align="center" style="padding:0;line-height:0;"><table border="0" cellpadding="0" cellspacing="0" width="34" style="margin:-1px auto 0;"><tr><td height="7" bgcolor="#2a0f60" style="background-color:#2a0f60;border-radius:0 0 9999px 9999px;font-size:0;line-height:7px;">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding:8px 7px 7px;">
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="center" style="font-size:8px;line-height:12px;font-weight:800;color:#ed8936;font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">Resumen de compra</td></tr>
<tr><td height="3" style="font-size:0;line-height:3px;">&nbsp;</td></tr>
<tr><td align="center" style="font-size:13px;line-height:17px;font-weight:800;color:#3b1782;font-family:'Poppins', 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">&gt;S&lt; 30</td></tr>
<tr><td align="center" style="font-size:5.5px;line-height:8px;color:#8b7fa8;font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">SubasCoins seleccionadas</td></tr>
<tr><td height="5" style="font-size:0;line-height:5px;">&nbsp;</td></tr>
<tr><td>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
${phoneRow('Monto de compra', 'US$ 30.00', false)}
${phoneRow('Comisi&oacute;n pasarela', 'US$ 1.17', true)}
<tr><td colspan="2" height="1" bgcolor="#e7e1f7" style="background-color:#e7e1f7;font-size:0;line-height:1px;">&nbsp;</td></tr>
<tr><td style="font-size:6.5px;line-height:11px;font-weight:800;color:#3b1782;padding-top:3px;font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">Total a pagar</td>
<td align="right" style="font-size:7.5px;line-height:11px;font-weight:800;color:#ed8936;white-space:nowrap;padding-top:3px;font-family:'Poppins', 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">US$ 31.17</td></tr>
</table>
</td></tr>
<tr><td height="6" style="font-size:0;line-height:6px;">&nbsp;</td></tr>
<tr><td>
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius:9999px;background-image:linear-gradient(135deg,#ffffff 0%,#fbc47d 25%,#ae8eff 75%,#ffffff 100%);box-shadow:rgba(237,137,54,0.3) 0 2px 6px;">
<tr><td style="padding:2px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#8460e5" style="border-radius:9999px;background-color:#8460e5;background-image:linear-gradient(135deg,#ed8936 0%,#8460e5 100%);">
<tr><td align="center" style="padding:4px 0;font-size:6.5px;line-height:9px;font-weight:700;color:#ffffff;letter-spacing:0.05em;font-family:'Plus Jakarta Sans', Arial, Helvetica, sans-serif;text-shadow:rgba(0,0,0,0.25) 0 1px 3px;">CONFIRMAR</td></tr>
</table></td></tr></table>
</td></tr>
</table>
</td></tr></table>
</td></tr></table>
</td></tr></table>`;


// orden real del flujo de negocio por categoría — no depende del orden de inserción en EMAILS
export const STAGE_ORDER: Record<string, string[]> = {
  'En vivo': ['Inicio', 'Resultado', 'Negociación', 'Habilitación', 'Cierre'],
  'Negociable': ['Inicio', 'Negociación', 'Alertas', 'Resultado'],
  'Proceso Interno Mapfre': ['Invitación', 'Participación', 'Cierre', 'Resultado'],
  'Calificación de Compra': ['Invitación', 'Recordatorio', 'Último día'],
  'Campaña Valoriza': ['Valoriza', 'Vende'],
};

// mismos gradientes que ya usan los CTA de email-templates.ts (G_PRIMARY / G_NEGOTIABLE),
// que a su vez vienen de concorde/components/OfferCard.tsx (barras live/negotiable)
export const CATEGORY_GRADIENT: Record<string, string> = {
  'En vivo': 'linear-gradient(135deg,#ed8936 0%,#8460e5 100%)',
  'Negociable': 'linear-gradient(125deg,#00aeb1 0%,#00aeb1 40%,#8460e5 100%)',
  'Adquisición de SubasCoins': 'linear-gradient(135deg,#8460e5 0%,#3b1782 100%)',
  'Recarga': 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)',
  'Proceso Compra y Venta': 'linear-gradient(135deg,#f97316 0%,#dc2626 100%)',
  'Registro': 'linear-gradient(135deg,#22c55e 0%,#15803d 100%)',
  'Canje de Puntos': 'linear-gradient(135deg,#f59e0b 0%,#b45309 100%)',
  'Contraseña': 'linear-gradient(135deg,#64748b 0%,#334155 100%)',
  'Visita Agendada': 'linear-gradient(135deg,#6366f1 0%,#4338ca 100%)',
  'Devolución de Saldo': 'linear-gradient(135deg,#d946ef 0%,#a21caf 100%)',
  'Actualizar Correo': 'linear-gradient(135deg,#06b6d4 0%,#0e7490 100%)',
  'Inhabilitación de Usuario': 'linear-gradient(135deg,#7f1d1d 0%,#450a0a 100%)',
  'Baja de Cuenta': 'linear-gradient(135deg,#78716c 0%,#44403c 100%)',
  'Usuarios Internos': 'linear-gradient(135deg,#ec4899 0%,#9d174d 100%)',
  'Proceso Interno Mapfre': 'linear-gradient(135deg,#ef4444 0%,#991b1b 100%)',
  SubasPass: 'linear-gradient(135deg,#8460e5 0%,#3b1782 100%)',
  'Calificación de Compra': 'linear-gradient(135deg,#fbbf24 0%,#d97706 100%)',
  'Campaña Valoriza': 'linear-gradient(125deg,#00aeb1 0%,#8460e5 100%)',
};

export const CATEGORY_SOLID: Record<string, string> = {
  'En vivo': '#ed8936',
  'Negociable': '#00aeb1',
  'Adquisición de SubasCoins': '#8460e5',
  'Recarga': '#3b82f6',
  'Proceso Compra y Venta': '#dc2626',
  'Registro': '#22c55e',
  'Canje de Puntos': '#f59e0b',
  'Contraseña': '#64748b',
  'Visita Agendada': '#6366f1',
  'Devolución de Saldo': '#d946ef',
  'Actualizar Correo': '#06b6d4',
  'Inhabilitación de Usuario': '#7f1d1d',
  'Baja de Cuenta': '#78716c',
  'Usuarios Internos': '#ec4899',
  'Proceso Interno Mapfre': '#ef4444',
  SubasPass: '#8460e5',
  'Calificación de Compra': '#d97706',
  'Campaña Valoriza': '#00aeb1',
};

// demo del design system Concorde (mismo asset que usan OfferCard/Detalle/Sala en concorde/bloques);
// swap por fotos reales del vehículo/ofertas cuando estén disponibles en el CDN
const DEMO_CAR = 'https://concorde-v2-theta.vercel.app/demo/bronco.jpg';
const PLACEHOLDER = { car: DEMO_CAR, thumb: DEMO_CAR, offer: DEMO_CAR };

// helper local: no repetir id/type a mano
const S = (type: Section['type'], content: Record<string, string>): Section => ({
  id: `${type}-${Math.random().toString(36).slice(2, 7)}`, type, content,
});
const SP = (height: string) => S('spacer', { height });

/** Cuerpo de «oferta-publicada-vendedor»; banner y footer glass van aparte (boletines/glassNegociable.ts). */
const OFERTA_PUBLICADA_SECTIONS: Section[] = [
  // Tutorial de negociación: anuncio → pasos → recordatorio → video → CTA.
  // Cuerpo a 16px y en navy, no negro puro: legible en móvil y sobrevive a la
  // inversión de modo oscuro de Gmail/Outlook.
  S('title', { eyebrow: '', text: '¡Tu vehículo ya está publicado! Prepárate para recibir ofertas' }),
  SP('24'),
  S('text', { size: 'lg', text: 'Hola {{Nombre usuario.Ejem: Gabriel Bruno}},' }),
  SP('8'),
  S('text', { size: 'lg', text: '¡Excelentes noticias! La publicación de tu auto ya está activa.' }),
  SP('8'),
  S('text', { size: 'lg', text: 'A partir de ahora, tendrás el control directo de tu proceso. Ingresa a la sección de **Negociaciones** dentro de **“Mi Garaje”** y negocia a tu manera.' }),
  SP('20'),
  S('steps', {
    s1: 'Toca tu perfil|Arriba a la derecha',
    s2: 'Baja a Mis negociaciones|En Tu actividad',
    s3: 'Toca «En venta»|Ahí llegan tus propuestas',
    s4: 'Toca tu auto|Ves tus propuestas y su plazo',
    s5: 'Acepta, contrapropón o rechaza|Tienes 24 horas',
    s6: 'Aceptas una propuesta|Las demás propuestas se cierran',
    s7: 'Coordina por el SubasChat|Directo con el comprador',
  }),
  SP('16'),
  S('note', {
    icon: '⏳',
    title: 'Dato clave:',
    size: 'lg',
    body: 'Tendrás **24 horas** para responder las propuestas de los compradores, antes de que expiren. ¡Mantente atento para mantener la negociación activa!',
  }),
  SP('28'),
  S('text', { size: 'lg', align: 'center', text: 'Mira este video para descubrir cómo dominar la negociación en VMC:' }),
  SP('24'),
  S('video', {
    url: 'https://concorde-v2-theta.vercel.app/correos/negociacion-tutorial/video.mp4',
    poster: 'https://concorde-v2-theta.vercel.app/correos/negociacion-tutorial/poster.jpg',
    width: '300',
    caption: 'Ver tutorial · 47 s',
    alt: 'Video tutorial: ¿Te llegó una propuesta? Así la respondes, paso a paso',
  }),
  SP('32'),
  S('cta', { text: 'Ir a Mi Garaje', url: 'https://www.vmcsubastas.com/zona', variant: 'glass' }),
  SP('32'),
];

export const EMAILS: EmailTemplate[] = [
  {
    id: 'listo-participar',
    name: 'Listo para participar',
    subject: '¡Listo para participar en la oferta {{Toyota Hilux 2018}}!',
    category: 'En vivo',
    stage: 'Inicio',
    leadsTo: ['mejor-postor', 'ganador-directo'],
    sections: [
      // {{...}} = merge tags (se reemplazan en tu plataforma); **...** = acento
      S('title', { eyebrow: '', text: '¡Listo para participar en la oferta {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario .Ejem: Gabriel Bruno}}, datos de tu participación:' }),
      SP('14'),
      S('details', {
        // «Fecha y hora» va en naranja (label y valor) como en Figma; las otras
        // dos filas llevan el morado normal del bloque, sin acento.
        boldValues: 'true',
        l1: '**Fecha y hora:**', v1: '**Miércoles, 11 de octubre - 2:00 p.m.**',
        l2: '~~Vendedor:~~', v2: 'Financiera Automotriz',
        l3: '~~Consignación:~~', v3: '>S< 50',
      }),
      SP('16'),
      S('divider', {}),
      SP('16'),
      S('note', {
        // En Figma el rótulo es naranja y el aviso entero va en negrita navy.
        title: '**Recuerda:**',
        body: '__Al consignar, eres responsable de asegurar tu conexión a sala "En Vivo" y de participar enviando, al menos, un bid válido durante el proceso, o serás sancionado.__',
      }),
      SP('30'),
    ],
  },
  {
    id: 'oportunidad-compra',
    name: 'Oportunidad de compra — 2.º/3.er puesto',
    subject: '¡Tienes oportunidad de compra en la oferta {{Toyota Hilux 2018}}!',
    category: 'En vivo',
    stage: 'Resultado',
    leadsTo: ['habilitado-comprar'],
    sections: [
      S('title', { eyebrow: '', text: '¡Tienes oportunidad de compra en la oferta {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('14'),
      S('text', { ink: 'black', text: '¡Felicidades estas entre los %%3 mejores postores%%! __Te notificaremos en caso se active tu oportunidad de compra.__' }),
      SP('16'),
      S('text', { ink: 'black', text: '**Recuerda:** Tu garantía se mantendrá consignada hasta que el proceso de venta de la oferta haya finalizado. __¡Aún hay una oportunidad de ganar con VMC Subastas!__' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('text', { ink: 'black', text: '!!¿Qué es la oportunidad de compra?!!' }),
      SP('12'),
      S('text', { ink: 'black', text: 'La oportunidad de compra es %%una condicional obtenida por el mejor postor%% en una oferta \'En Vivo\' con reserva y por el %%2do o 3er lugar en un proceso sin reserva%%.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'En caso de %%activarse la oportunidad de compra%% el participante adquirirá las **responsabilidades de ganador directo habilitado** siendo responsable de seguir con el proceso de compra, bajo pena de sanción en caso de incumplimiento.' }),
      SP('30'),
    ],
  },
  {
    id: 'ganador-directo',
    name: 'Eres ganador directo',
    subject: '¡Eres el Ganador Directo en la oferta {{Toyota Hilux 2018}}!',
    category: 'En vivo',
    stage: 'Resultado',
    leadsTo: ['habilitado-comprar'],
    sections: [
      S('title', { eyebrow: '', text: '¡Eres el Ganador Directo en la oferta {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario .Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Felicidades! Estás a un paso para cumplir tus metas. __Inicia el proceso de compra ingresando a tu zona de usuario.__' }),
      SP('20'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('text', { ink: 'black', text: '!!Recuerda:!!' }),
      SP('8'),
      S('text', { ink: 'black', text: 'En cualquier caso, cuando el ganador directo habilitado haya **incumplido con alguna de sus responsabilidades**, será sancionado con la pérdida de 75 Puntos.' }),
      SP('12'),
      S('text', { ink: 'black', text: '%%VMC SUBASTAS%% también procederá a exigir el **pago equivalente a la comisión** establecida como contraprestación por el uso del servicio brindado, detrayéndola si fuese posible de su Billetera automáticamente; cuando el usuario carezca de fondos suficientes para cubrir el total de la comisión, se procederá a amortizar de manera parcial la deuda correspondiente detrayendo el íntegro de los fondos en Billetera del ganador, por lo que el usuario mantendrá una deuda en plataforma y su cuenta permanecerá restringida.' }),
      SP('30'),
    ],
  },
  {
    id: 'mejor-postor',
    name: 'Eres el mejor postor',
    subject: '¡Eres el Mejor Postor en la oferta {{Toyota Hilux 2018}}!',
    category: 'En vivo',
    stage: 'Resultado',
    leadsTo: ['contrapropuesta', 'opcion-compra', 'habilitado-comprar', 'oferta-terminada'],
    sections: [
      S('title', { eyebrow: '', text: '¡Eres el Mejor Postor en la oferta {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Felicidades, estás a un paso para cumplir tus metas! Te notificaremos cuando tengas la respuesta del vendedor y __tu garantía se mantendrá consignada hasta ese momento.__' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('text', { ink: 'black', text: '!!¿Qué significa ser mejor postor?!!' }),
      SP('12'),
      S('text', { ink: 'black', text: '__Mejor postor:__ Es quien realiza la %%mejor propuesta%% en una oferta %%"En Vivo" con Precio reserva%%, por lo cual su propuesta pasa a evaluación con el vendedor y este tendrá hasta **10 días hábiles** dar una respuesta a dicho ganador.' }),
      SP('30'),
    ],
  },
  {
    id: 'opcion-compra',
    name: 'Tienes opción de compra',
    subject: '¡Tienes opción de compra en la oferta {{Toyota Hilux 2018}}!',
    category: 'En vivo',
    stage: 'Resultado',
    leadsTo: ['habilitado-comprar'],
    sections: [
      S('title', { eyebrow: '', text: '¡Tienes opción de compra en la oferta {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Felicidades el vendedor te dio la **opción de compra!** Ingresa a tu zona de usuario para **aceptarla.**' }),
      SP('20'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('text', { ink: 'black', text: '!!¿Qué es la opción de compra?!!' }),
      SP('12'),
      S('text', { ink: 'black', text: 'La opción de compra es una %%condicional que todo vendedor podrá activar%% cuando crea conveniente.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'El participante, a quien se le dé la opción de compra y acepte la misma asumirá todas las **responsabilidades de un ganador directo habilitado.**' }),
      SP('12'),
      S('text', { ink: 'black', text: 'El participante podrá rechazar dicha opción, libre de sanciones asociadas.' }),
      SP('30'),
    ],
  },
  {
    id: 'contrapropuesta',
    name: 'Recibiste una contrapropuesta',
    subject: '¡Recibiste una contrapropuesta en la oferta {{Toyota Hilux 2018}}!',
    category: 'En vivo',
    stage: 'Negociación',
    leadsTo: ['propuesta-rechazada', 'habilitado-comprar'],
    sections: [
      S('title', { eyebrow: '', text: '¡Recibiste una contrapropuesta en la oferta {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Ingresa a tu zona de usuario y __revisa la contrapropuesta del vendedor!__' }),
      SP('20'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('text', { ink: 'black', text: '!!¿Qué es una contrapropuesta?!!' }),
      SP('12'),
      S('text', { ink: 'black', text: 'El vendedor se reserva el derecho de declinar la propuesta del mejor postor y %%optar por hacerle una contrapropuesta sobre el monto ofrecido%%.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'En caso aceptes la contrapropuesta asumirás las **responsabilidades del ganador directo habilitado.**' }),
      SP('30'),
    ],
  },
  {
    id: 'propuesta-rechazada',
    name: 'Rechazaste la propuesta',
    subject: '¡Rechazaste la propuesta en la oferta {{Toyota Yaris 2018}}!',
    category: 'En vivo',
    stage: 'Negociación',
    leadsTo: ['oferta-terminada-postor'],
    sections: [
      S('title', { eyebrow: '', text: '¡Rechazaste la propuesta en la oferta {{Toyota Yaris 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Has rechazado la propuesta de __{{vendedor}}__ en la oferta **{{Toyota Yaris 2018}}**. Ahora te encuentras fuera del proceso de compra.' }),
      SP('16'),
      S('text', { ink: 'black', align: 'center', text: '**Tu consignación fue liberada a tu billetera.**' }),
      SP('30'),
    ],
  },
  {
    id: 'habilitado-comprar',
    name: 'Habilitado para comprar',
    subject: '¡Has sido habilitado en la oferta {{Toyota Hilux 2018}}!',
    category: 'En vivo',
    stage: 'Habilitación',
    sections: [
      S('title', { eyebrow: '', text: '¡Has sido habilitado en la oferta {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Felicidades estás **habilitado para comprar!** __Inicia el proceso de compra ingresando a tu zona de usuario.__' }),
      SP('20'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('text', { ink: 'black', text: '!!Recuerda:!!' }),
      SP('8'),
      S('text', { ink: 'black', text: 'En cualquier caso, cuando el ganador directo habilitado haya **incumplido con alguna de sus responsabilidades**, será sancionado con la pérdida de 75 Puntos.' }),
      SP('12'),
      S('text', { ink: 'black', text: '%%VMC SUBASTAS%% también procederá a exigir el **pago equivalente a la comisión** establecida como contraprestación por el uso del servicio brindado, detrayéndola si fuese posible de su Billetera automáticamente; cuando el usuario carezca de fondos suficientes para cubrir el total de la comisión, se procederá a amortizar de manera parcial la deuda correspondiente detrayendo el íntegro de los fondos en Billetera del ganador, por lo que el usuario mantendrá una deuda en plataforma y su cuenta permanecerá restringida.' }),
      SP('30'),
    ],
  },
  {
    id: 'oferta-terminada',
    name: 'Oferta terminada',
    subject: '¡Oferta terminada!',
    category: 'En vivo',
    stage: 'Cierre',
    sections: [
      S('title', { eyebrow: '', text: '¡Oferta terminada!' }),
      SP('24'),
      S('text', { ink: 'black', text: '__¡El__ **{{Vendedor}}** __rechazó la propuesta del__ **{{C.U.U}}** __en la oferta__ **{{Toyota Yaris 2018}}!**' }),
      SP('30'),
    ],
  },
  {
    id: 'oferta-terminada-postor',
    name: 'Oferta terminada — postor rechazó',
    subject: '¡Oferta terminada!',
    category: 'En vivo',
    stage: 'Cierre',
    sections: [
      S('title', { eyebrow: '', text: '¡Oferta terminada!' }),
      SP('24'),
      S('text', { ink: 'black', text: '__¡El__ **{{C.U.U}}** __rechazó la propuesta del__ **{{Vendedor}}** __en la oferta__ **{{Toyota Yaris 2018}}!**' }),
      SP('30'),
    ],
  },
  {
    id: 'negociacion-iniciada',
    name: 'Negociación iniciada',
    subject: '¡Negociación iniciada con éxito!',
    category: 'Negociable',
    stage: 'Inicio',
    leadsTo: ['contrapropuesta-negociable', 'ganaste-oferta-negociable', 'negociacion-finalizada', 'propuesta-expirara-hhmm'],
    sections: [
      S('title', { eyebrow: '', text: '¡Negociación iniciada con éxito!' }),
      SP('24'),
      S('text', { text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('14'),
      S('text', { text: 'Has iniciado una negociación con __{{Vendedor}}__ en __{{oferta.Ejem: Toyota Hilux 2018}}.__ Con una propuesta de **US$ {{XX,XXX}}.** Ahora solo debes esperar la respuesta del vendedor.' }),
      SP('20'),
      S('vehicle', { tone: 'negotiable', img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', caption: 'Río Magdalena', thumb1: PLACEHOLDER.thumb, thumb2: PLACEHOLDER.thumb, thumb3: PLACEHOLDER.thumb }),
      SP('20'),
      S('quote', {
        tone: 'negotiable',
        proposalLabel: 'Tu propuesta:', proposalValue: 'US$ 10,000', expiresLabel: 'Vence', expiresValue: '23/01 15:00',
        guaranteeLabel: 'En garantía:', guaranteeValue: '>S< 50',
      }),
      SP('20'),
      S('text', { ink: 'black', text: '¿Aún te quedan dudas? %%¡Subastin te ayuda a resolverlas!%%', align: 'center' }),
      SP('14'),
      S('cta', { text: '¡Aprende a negociar con Subastin!', url: 'https://ayuda.vmcsubastas.com/es/collections/3079940-centro-de-ayuda-comprador', variant: 'negotiable' }),
      SP('30'),
    ],
  },
  {
    id: 'oferta-publicada-vendedor',
    name: 'Oferta publicada — vendedor (tutorial)',
    subject: '¡Tu oferta ha sido publicada!',
    category: 'Negociable',
    stage: 'Inicio',
    leadsTo: ['nueva-negociacion-vendedor'],
    sections: OFERTA_PUBLICADA_SECTIONS,
    html: glassNegociableEmail(OFERTA_PUBLICADA_SECTIONS, '¡Tu oferta ha sido publicada!', 'Ingresa a “Mi Garaje” y administra las propuestas de los compradores'),
  },
  {
    id: 'nueva-negociacion-vendedor',
    name: 'Nueva negociación — vendedor',
    subject: '¡Nueva negociación iniciada!',
    category: 'Negociable',
    stage: 'Inicio',
    leadsTo: ['contrapropuesta-negociable', 'vendedor-acepta-propuesta', 'negociacion-finalizada', 'propuesta-expirara-hhmm'],
    sections: [
      S('title', { eyebrow: '', text: '¡Nueva negociación iniciada!' }),
      SP('24'),
      S('text', { text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { text: 'Tienes una nueva negociación en __{{oferta.Ejem: Toyota Hilux 2018}}__, con una propuesta de **US$ {{XX,XXX}}** enviada por __{{CUU.Ejem: B4GUSI}}__.' }),
      SP('20'),
      S('quote', {
        tone: 'negotiable',
        proposalLabel: 'Propuesta:', proposalValue: 'US$ 10,000', expiresLabel: 'Vence', expiresValue: '23/01 15:00',
        guaranteeLabel: 'Tu expectativa:', guaranteeValue: 'US$ 20,000',
        pctLabel: 'De tu expectativa:', pctValue: '50.00%',
      }),
      SP('20'),
      S('vehicle', { tone: 'negotiable', img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', caption: '', thumb1: PLACEHOLDER.thumb, thumb2: PLACEHOLDER.thumb }),
      SP('20'),
      S('text', { text: '__Acepta, rechaza o haz una contrapropuesta:__', align: 'center' }),
      SP('12'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona', variant: 'negotiable' }),
      SP('24'),
      S('text', { ink: 'black', text: '**Recuerda:** Envía tu respuesta lo antes posible al participante en un máximo de 24 horas {[aquí]}.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'Más información sobre la oferta negociable {[aquí]}.' }),
      SP('30'),
    ],
  },
  {
    id: 'contrapropuesta-negociable',
    name: 'Contrapropuesta recibida — negociable',
    subject: '¡Recibiste una contrapropuesta en {{Toyota Hilux 2018}}!',
    category: 'Negociable',
    stage: 'Negociación',
    leadsTo: ['contrapropuesta-hecha', 'contrapropuesta-aceptada-comprador', 'contrapropuesta-rechazada-comprador'],
    sections: [
      S('title', { eyebrow: '', text: '¡Recibiste una contrapropuesta en {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Recibiste una contrapropuesta de **US$ {{XX,XXX}}** en __{{oferta.Ejem: Toyota Hilux 2018}}__ por __{{Vendedor}}__ válida hasta **{{Fecha y hora. d/m/Y - hh:mm}}**. Acepta, rechaza o haz una contrapropuesta lo antes posible {[aquí]}.' }),
      SP('20'),
      S('vehicle', { tone: 'negotiable', img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', caption: 'Río Magdalena', thumb1: PLACEHOLDER.thumb, thumb2: PLACEHOLDER.thumb }),
      SP('20'),
      S('negotiation', {
        tone: 'negotiable',
        round: '1°', roundLabel: 'Ronda de negociación.',
        yourLabel: 'Tu propuesta:', yourValue: 'US$ 10,000',
        sellerLabel: 'Vendedor propone:', sellerValue: 'US$ 19,000',
        expiresLabel: 'Vence', expiresValue: '23/01 17:00',
      }),
      SP('20'),
      S('text', { text: '__Acepta, rechaza o haz una contrapropuesta:__', align: 'center' }),
      SP('12'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona', variant: 'negotiable' }),
      SP('24'),
      S('text', { ink: 'black', text: '**Recuerda:** Solo tienes un máximo de %%5 rondas%% por negociación.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'Más información sobre la oferta negociable {[aquí]}.' }),
      SP('30'),
    ],
  },
  {
    id: 'contrapropuesta-hecha',
    name: 'Hiciste una contrapropuesta',
    subject: '¡Hiciste una contrapropuesta en {{Toyota Hilux 2018}}!',
    category: 'Negociable',
    stage: 'Negociación',
    leadsTo: ['negociacion-finalizada', 'ganaste-oferta-negociable', 'contrapropuesta-negociable', 'propuesta-expirara-hhmm'],
    sections: [
      S('title', { eyebrow: '', text: '¡Hiciste una contrapropuesta en {{Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Hiciste una contrapropuesta de **US$ {{XX,XXX}}** en __{{oferta.Ejem: Toyota Hilux 2018}}__. Ahora solo debes esperar la respuesta de __{{CUU.Ejem: B4GUSI}}__ a más tardar el **{{Fecha y hora. d/m/Y - hh:mm}}**.' }),
      SP('20'),
      S('vehicle', { tone: 'negotiable', img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', caption: '', thumb1: PLACEHOLDER.thumb, thumb2: PLACEHOLDER.thumb }),
      SP('20'),
      S('negotiation', {
        tone: 'negotiable',
        round: '1°', roundLabel: 'Ronda de negociación.',
        yourLabel: 'Propuesta:', yourValue: 'US$ 10,000',
        sellerLabel: 'Tu propuesta:', sellerValue: 'US$ 19,000',
        expiresLabel: 'Vence', expiresValue: '23/01 17:00',
      }),
      SP('20'),
      S('text', { ink: 'black', text: '**Recuerda:** Solo tienes un máximo de %%5 rondas%% por negociación.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'Más información sobre la oferta negociable {[aquí]}.' }),
      SP('30'),
    ],
  },
  {
    id: 'propuesta-expirara-ultima-notificacion',
    name: 'Propuesta por expirar — última notificación',
    subject: '¡Última notificación! ¡La propuesta expirará!',
    category: 'Negociable',
    stage: 'Alertas',
    leadsTo: ['negociacion-expirada'],
    sections: [
      S('title', { eyebrow: '', text: '¡Última notificación! ¡La propuesta expirará!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno / Vendedor}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'La propuesta de **{{US$ XX,XX}}** enviada por __{{B4GUSI / vendedor}}__ en __{{oferta.Ejem: Toyota Hilux 2018}}__ expira a las **{{hh:mm}}**. Envía tu respuesta lo antes posible ((aquí)).' }),
      SP('20'),
      S('vehicle', { img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', caption: '', thumb1: PLACEHOLDER.thumb, thumb2: PLACEHOLDER.thumb, thumb3: PLACEHOLDER.thumb }),
      SP('16'),
      S('text', { ink: 'black', text: '**¡Última oportunidad!**', align: 'center' }),
      SP('4'),
      S('text', { ink: 'black', text: '__Envía tu respuesta:__', align: 'center' }),
      SP('12'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona', variant: 'negotiable' }),
      SP('24'),
      S('text', { ink: 'black', text: '**Recuerda:** Que la negociación se dará por concluida si es que una respuesta no es enviada antes de las __{{hh:mm}}__.' }),
      SP('30'),
    ],
  },
  {
    id: 'propuesta-expirara-hhmm',
    name: 'Propuesta por expirar — recordatorio',
    subject: '¡Propuesta expirará {{hh:mm}}!',
    category: 'Negociable',
    stage: 'Alertas',
    leadsTo: ['propuesta-expirara-ultima-notificacion'],
    sections: [
      S('title', { eyebrow: '', text: '¡Propuesta expirará {{hh:mm}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno / Vendedor}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'La propuesta de **{{US$ XX,XX}}** enviada por __{{B4GUSI / vendedor}}__ en __{{oferta.Ejem: Toyota Hilux 2018}}__ expira a las **{{hh:mm}}**. Envía tu respuesta lo antes posible {[aquí]}.' }),
      SP('20'),
      S('vehicle', { img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', caption: '', thumb1: PLACEHOLDER.thumb, thumb2: PLACEHOLDER.thumb, thumb3: PLACEHOLDER.thumb }),
      SP('16'),
      S('text', { ink: 'black', text: '**¡Acción requerida! ¡Tienes una propuesta esperando!**', align: 'center' }),
      SP('4'),
      S('text', { ink: 'black', text: '__Envía tu respuesta:__', align: 'center' }),
      SP('12'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona', variant: 'negotiable' }),
      SP('30'),
    ],
  },
  {
    id: 'propuesta-por-expirar-muy-importante',
    name: 'Propuesta por expirar — urgente',
    subject: '¡Muy importante! ¡Propuesta por expirar {{hh:mm}}!',
    category: 'Negociable',
    stage: 'Alertas',
    leadsTo: ['negociacion-expirada'],
    sections: [
      S('title', { eyebrow: '', text: '¡Muy importante! ¡Propuesta por expirar {{hh:mm}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno / Vendedor}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'La propuesta de **{{US$ XX,XX}}** enviada por __{{B4GUSI / vendedor}}__ en __{{oferta.Ejem: Toyota Hilux 2018}}__ expira a las **{{hh:mm}}**. Envía tu respuesta lo antes posible {[aquí]}.' }),
      SP('20'),
      S('vehicle', { img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', caption: '', thumb1: PLACEHOLDER.thumb, thumb2: PLACEHOLDER.thumb, thumb3: PLACEHOLDER.thumb }),
      SP('16'),
      S('text', { ink: 'black', text: '**¡Acción requerida! ¡Tienes una propuesta esperando!**', align: 'center' }),
      SP('4'),
      S('text', { ink: 'black', text: '__Envía tu respuesta:__', align: 'center' }),
      SP('12'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona', variant: 'negotiable' }),
      SP('30'),
    ],
  },
  {
    id: 'negociacion-finalizada',
    name: 'Negociación finalizada',
    subject: 'Negociación finalizada {{oferta: Toyota Hilux 2018}}',
    category: 'Negociable',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: 'Negociación finalizada {{oferta: Toyota Hilux 2018}}' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Lamentablemente __{{vendedor}}__ rechazó tu propuesta en __{{oferta: Toyota Hilux 2018}}__ y la negociación ha sido finalizada.' }),
      SP('4'),
      S('text', { ink: 'black', text: 'Al rechazar tu propuesta, **tu garantía ha sido liberada a tu billetera.**' }),
      SP('20'),
      S('amount', { edge: 'negotiable', label: 'Garantía liberada:', value: 'US$ 50' }),
      SP('24'),
      S('offers', {
        heading: '¡Tenemos más oportunidades negociables!',
        sub: 'Estas son algunas ofertas especiales para ti:',
        c1img: PLACEHOLDER.offer, c1name: 'Honda Pilot', c1year: '2017',
        c2img: PLACEHOLDER.offer, c2name: 'Honda Pilot', c2year: '2017',
        c3img: PLACEHOLDER.offer, c3name: 'Honda Pilot', c3year: '2017',
        c4img: PLACEHOLDER.offer, c4name: 'Honda Pilot', c4year: '2017',
      }),
      SP('30'),
    ],
  },
  {
    id: 'ganaste-oferta-negociable',
    name: 'Ganaste la oferta — negociable',
    subject: '¡Has ganado {{oferta.Ejem: Toyota Hilux 2018}}!',
    category: 'Negociable',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: '¡Has ganado {{oferta.Ejem: Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Felicidades! **aceptaron** tu propuesta y ganaste la __{{oferta.Ejem: Toyota Hilux 2018}}__ de __{{vendedor}}__ con tu propuesta de **US$ {{XX,XXX}}**.' }),
      SP('20'),
      S('won-vehicle', { tone: 'negotiable', img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', statLabel: 'Propuestas', statValue: '4', winLabel: 'Tu propuesta ganadora:', winValue: 'US$ XX,XXX' }),
      SP('20'),
      S('text', { ink: 'black', text: '¡Cancela la comisión para seguir con el proceso de compra!', align: 'center' }),
      SP('14'),
      S('costs', { tone: 'negotiable', l1: 'Comisión:', v1: 'US$ 500', l2: 'En garantía:', v2: 'US$ 50', l3: 'Deuda:', v3: 'US$ 450' }),
      SP('20'),
      S('list', { ink: 'black', title: 'Documentación solicitada:', i1: 'Documento N°1', i2: 'Documento N°2' }),
      SP('16'),
      S('text', { ink: 'black', text: 'En breve te estaremos enviando el acceso a las instrucciones de compra.' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Ingresa a tu {[historial de participación]} para seguir el proceso.' }),
      SP('30'),
    ],
  },
  {
    id: 'negociacion-expirada',
    name: 'Negociación expirada',
    subject: 'Negociación finalizada {{oferta: Toyota Hilux 2018}}',
    category: 'Negociable',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: 'Negociación finalizada {{oferta: Toyota Hilux 2018}}' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Tu propuesta __expiro__ **US$ {{XX,XXX}}** {{oferta: Toyota Hilux 2018}}. Esta negociación con __{{vendedor}}__ ha finalizado.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'Al expirar tu propuesta, **tu garantía ha sido liberada a tu billetera.**' }),
      SP('20'),
      S('amount', { edge: 'negotiable', label: 'Garantía liberada:', value: 'US$ 50' }),
      SP('24'),
      S('offers', {
        heading: '¡Tenemos más oportunidades negociables!',
        sub: 'Estas son algunas ofertas especiales para ti:',
        c1img: PLACEHOLDER.offer, c1name: 'Honda Pilot', c1year: '2017',
        c2img: PLACEHOLDER.offer, c2name: 'Honda Pilot', c2year: '2017',
        c3img: PLACEHOLDER.offer, c3name: 'Honda Pilot', c3year: '2017',
        c4img: PLACEHOLDER.offer, c4name: 'Honda Pilot', c4year: '2017',
      }),
      SP('30'),
    ],
  },
  {
    id: 'contrapropuesta-rechazada-comprador',
    name: 'Contrapropuesta rechazada — comprador',
    subject: 'Negociación finalizada {{oferta: Toyota Hilux 2018}}',
    category: 'Negociable',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: 'Negociación finalizada {{oferta: Toyota Hilux 2018}}' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '__Rechazaste__ la propuesta de **US$ {{XX,XXX}}** en __{{oferta: Toyota Hilux 2018}}__ de __{{vendedor}}__ y la negociación ha sido finalizada.' }),
      SP('12'),
      S('text', { ink: 'black', text: 'Al rechazar la propuesta, **tu garantía ha sido liberada a tu billetera.**' }),
      SP('20'),
      S('amount', { edge: 'negotiable', label: 'Garantía liberada:', value: 'US$ 50' }),
      SP('24'),
      S('offers', {
        heading: '¡Tenemos más oportunidades negociables!',
        sub: 'Estas son algunas ofertas especiales para ti:',
        c1img: PLACEHOLDER.offer, c1name: 'Honda Pilot', c1year: '2017',
        c2img: PLACEHOLDER.offer, c2name: 'Honda Pilot', c2year: '2017',
        c3img: PLACEHOLDER.offer, c3name: 'Honda Pilot', c3year: '2017',
        c4img: PLACEHOLDER.offer, c4name: 'Honda Pilot', c4year: '2017',
      }),
      SP('30'),
    ],
  },
  {
    id: 'contrapropuesta-aceptada-comprador',
    name: 'Contrapropuesta aceptada — comprador',
    subject: '¡Has ganado {{oferta.Ejem: Toyota Hilux 2018}}!',
    category: 'Negociable',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: '¡Has ganado {{oferta.Ejem: Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Felicidades! **aceptaste** la propuesta de __{{vendedor}}__ y ganaste en __{{oferta.Ejem: Toyota Hilux 2018}}__ con la propuesta de **US$ {{XX,XXX}}**.' }),
      SP('20'),
      S('won-vehicle', { tone: 'negotiable', img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', statLabel: 'Propuestas', statValue: '4', winLabel: 'Tu propuesta ganadora:', winValue: 'US$ XX,XXX' }),
      SP('20'),
      S('text', { ink: 'black', text: '¡Cancela la comisión para seguir con el proceso de compra!', align: 'center' }),
      SP('14'),
      S('costs', { tone: 'negotiable', l1: 'Comisión:', v1: 'US$ 500', l2: 'En garantía:', v2: 'US$ 50', l3: 'Deuda:', v3: 'US$ 450' }),
      SP('20'),
      S('list', { ink: 'black', title: 'Documentación solicitada:', i1: 'Documento N°1', i2: 'Documento N°2' }),
      SP('16'),
      S('text', { ink: 'black', text: 'En breve te estaremos enviando el acceso a las instrucciones de compra.' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Ingresa a tu {[historial de participación]} para seguir el proceso.' }),
      SP('30'),
    ],
  },
  {
    id: 'vendedor-acepta-propuesta',
    name: 'Aceptaste la propuesta — vendedor',
    subject: '¡Aceptaste la propuesta en {{oferta.Ejem: Toyota Hilux 2018}}!',
    category: 'Negociable',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: '¡Aceptaste la propuesta en {{oferta.Ejem: Toyota Hilux 2018}}!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡Felicidades! **aceptaste** la propuesta de **US$ {{XX,XXX}}** por __{{CUU.Ejem: B4GUSI}}__ en __{{oferta.Ejem: Toyota Hilux 2018}}__, el **{{Fecha y hora. d/m/Y - hh:mm}}**.' }),
      SP('20'),
      S('won-vehicle', {
        tone: 'negotiable',
        img: PLACEHOLDER.car, tag: 'Toyota Hilux 2018', statLabel: 'Propuestas', statValue: '4',
        winLabel: 'Propuesta ganadora:', winValue: 'US$ XX,XXX',
        pctLabel: 'De expectativa:', pctValue: '81.35%',
      }),
      SP('30'),
    ],
  },
  {
    id: 'adquisicion-subascoins-exitosa',
    name: 'Adquisición de SubasCoins exitosa',
    subject: '¡Adquisición de SubasCoins exitosa!',
    category: 'Adquisición de SubasCoins',
    stage: 'Confirmación',
    sections: [
      S('title', { eyebrow: '', text: '¡Adquisición de SubasCoins exitosa!' }),
      SP('24'),
      S('success', { lightTitle: 'true', title: '¡Adquiriste', value: '>S< {{XX}}', caption: 'SubasCoins con éxito!' }),
      SP('24'),
      S('text', { text: '**Resumen de transacción:**', size: 'lg' }),
      SP('10'),
      S('details', {
        l1: 'Número de pedido:', v1: '{{Nº de pedido.Ejem: 3361071000}}',
        l2: 'Tarjetahabiente:', v2: '{{Nombre en tarjeta.Ejem: Justo Subastin}}',
        l3: 'Tarjeta:', v3: '{{Tarjeta.Ejem: 4444 **** **** 1235 VISA}}',
      }),
      SP('4'),
      S('details', {
        l1: 'Fecha y hora:', v1: '{{Fecha y hora. d/m/Y hh:mm:ss}}',
        l2: 'Importe:', v2: '__US$__ {{XX}}',
        l3: 'Moneda:', v3: 'Dólares americanos',
      }),
      SP('4'),
      S('details', { l1: 'Descripción:', v1: 'Adquisición de SubasCoins', l2: '', v2: '', l3: '', v3: '' }),
      SP('20'),
      S('note', {
        title: '**Importante:**',
        bodyTone: 'accent',
        body: '**Toda adquisición de SubasCoins es final y definitiva.** Los SubasCoins jamás podrán ser reembolsados. Recuerda que podrás usar tus SubasCoins para consignar y cubrir comisiones.',
      }),
      SP('20'),
      // Cierre en NEGRO (Figma); el enlace sí va naranja, ver el marcador (( )).
      S('text', { text: 'Si desconoces esta actividad, por favor contáctanos inmediatamente a ((https://ayuda.vmcsubastas.com/es/|https://ayuda.vmcsubastas.com/es/))', ink: 'black' }),
      SP('16'),
      // %% = negrita que HEREDA el color del contenedor (aquí negro); __ lo
      // pintaría del morado oscuro de siempre.
      S('text', { text: '%%Equipo VMC Subastas.%%', ink: 'black' }),
      SP('4'),
      S('text', { text: 'Este es un mensaje automático, por favor evita responder este mail.', ink: 'black' }),
      SP('30'),
    ],
  },
  {
    id: 'recarga-exitosa',
    name: 'Recarga exitosa',
    subject: '¡Recarga exitosa!',
    category: 'Recarga',
    stage: 'Confirmación',
    sections: [
      S('title', { eyebrow: '', text: '¡Recarga exitosa!' }),
      SP('24'),
      S('success', { lightTitle: 'true', title: '¡Recargaste', value: 'US$ {{XX}}', caption: 'Dólares con éxito!' }),
      SP('24'),
      S('text', { ink: 'black', text: '%%Equipo VMC Subastas.%%' }),
      SP('4'),
      S('text', { ink: 'black', text: 'Este es un mensaje automático, por favor evita responder este mail.' }),
      SP('30'),
    ],
  },
  {
    id: 'completa-proceso-compra',
    name: 'Completa el proceso de compra',
    subject: '¡Muy urgente! Acción requerida en la oferta: {{Toyota Hilux 2018}}.',
    category: 'Proceso Compra y Venta',
    stage: 'Recordatorio',
    sections: [
      S('title', { eyebrow: '', text: '¡Muy urgente! Acción requerida en la oferta: {{Toyota Hilux 2018}}.' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('14'),
      S('text', { ink: 'black', text: '**¡Te queda poco tiempo!** __Completa proceso de compra ingresando a tu zona de usuario hasta__ **30/07/21 - 6:00 p.m!**' }),
      SP('20'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('text', { ink: 'black', text: '!!Recuerda:!!' }),
      SP('8'),
      S('text', { ink: 'black', text: 'En cualquier caso, cuando el ganador directo habilitado haya **incumplido con alguna de sus responsabilidades**, será sancionado con la pérdida de 75 Puntos.' }),
      SP('12'),
      S('text', { ink: 'black', text: '%%VMC SUBASTAS%% también procederá a exigir el **pago equivalente a la comisión** establecida como contraprestación por el uso del servicio brindado, detrayéndola si fuese posible de su Billetera automáticamente; cuando el usuario carezca de fondos suficientes para cubrir el total de la comisión, se procederá a amortizar de manera parcial la deuda correspondiente detrayendo el íntegro de los fondos en Billetera del ganador, por lo que el usuario mantendrá una deuda en plataforma y su cuenta permanecerá restringida.' }),
      SP('30'),
    ],
  },
  {
    id: 'bienvenida-registro',
    name: 'Bienvenida — registro confirmado',
    subject: '¡Bienvenido Cazador de ofertas!',
    category: 'Registro',
    stage: 'Bienvenida',
    sections: [
      S('title', { eyebrow: '', text: '¡Bienvenido Cazador de ofertas!' }),
      SP('24'),
      // Solo el nombre en negrita; el resto de la línea en negro normal.
      S('text', { ink: 'black', align: 'center', text: '¡%%{{Subastin}}%% queremos informarte que ya estás registrado!' }),
      SP('16'),
      // El C.U.U. abre el correo: es el dato que el usuario viene a buscar, así que
      // va en su card arriba y no enterrado en un párrafo a media página.
      S('amount', { labelTone: 'accent', label: 'Código Único de Usuario:', value: '{{C.U.U.Ejem: ZOOY6U}}' }),
      SP('16'),
      // Este bloque va a la IZQUIERDA: son párrafos de lectura y una lista de datos,
      // que centrados se leen peor que el resto de secciones (que sí van centradas).
      S('text', { ink: 'black', text: 'Tu Código Único de Usuario %%(C.U.U)%% te servirá en todos los procesos relacionados a participaciones, compras en nuestro Marketplace y también para proteger tu identidad.' }),
      SP('20'),
      S('text', { text: '**Estos son tus datos registrados:**' }),
      SP('8'),
      // `indent` empuja la lista a la derecha, como una tabulación bajo su rótulo.
      S('list', {
        indent: '24',
        i1: '~~Correo :~~ __{{email.Ejem: subastin@tucorreo.com}}__',
        i2: '~~Celular:~~ __{{celular.Ejem: 987159725}}__',
        i3: '~~DNI:~~ __{{dni.Ejem: 23581321}}__',
        i4: '~~RUC:~~ __{{ruc.Ejem: 15441022422}}__',
      }),
      SP('20'),
      S('divider', {}),
      SP('20'),
      S('text', { text: '####¡Agrega fondos y participa ahora!####', align: 'center' }),
      SP('8'),
      S('text', { ink: 'black', align: 'center', text: 'Consigna en las ofertas que más te gusten agregando fondos en tu billetera.' }),
      SP('16'),
      // Las dos vías de agregar fondos, en la grilla de Figma: a la IZQUIERDA la
      // card destacada de SubasCoins (morada, con el icono y el CTA primary) y
      // debajo el aviso del fee; a la DERECHA las dos cards de recarga BCP. Cada
      // columna apila lo suyo con alto independiente — eso es lo que `grid` aporta
      // sobre `columns`, que obliga a una sola card por lado.
      S('grid', {
        dark1: 'true', gapY: '22',
        l1Title: 'Adquiere SubasCoins',
        l1Body: 'Agrega SubasCoins a tu billetera con tu tarjeta de crédito o débito y participa al instante',
        l1Svg: SVG_SUBASCOINS_ICON,
        l2Body: 'Las compras realizadas mediante pasarelas de pago pueden incluir un **Fee por uso de pasarela**, el cual será detallado antes de confirmar la operación.',
        l2Center: 'true',
        l2Btn: '¡QUIERO ADQUIRIR SUBASCOINS!', l2Url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona',
        // Títulos en morado, no en el naranja de acento del resto de cards.
        rTitlePurple: 'true',
        r1Title: 'Recarga dólares',
        r1Body: 'Agrega saldo a tu billetera mediante tu app o ventanilla del BCP usando tu __C.U.U.__',
        r1Svg: IMG_BANK, r1SvgW: '42',
        // Los saltos son deliberados: «pasarela» y «hábiles» cierran su línea en vez
        // de quedar colgando solas al ajustarse el texto (ver Figma).
        r2Title: 'Sin Fee por uso de\npasarela',
        // `r2Indent` tabula estos bullets bajo el título, como una sub-lista.
        // Cada LÍNEA cierra su propio `~~`: los marcadores de formato no cruzan
        // saltos, así que un `~~` abierto en una línea y cerrado en la siguiente se
        // imprimiría crudo en vez de aplicar el estilo.
        r2Body: '~~• Validación en hasta 24h~~\n~~hábiles~~\n~~• Disponible a través de pago de servicios del BCP~~',
        r2Indent: '12',
        r2Svg: IMG_CHECK, r2SvgW: '42',
      }),
      SP('24'),
      S('text', { text: '####¿Cómo recargar vía BCP?####', align: 'center' }),
      SP('16'),
      S('columns', {
        card: 'true',
        icon1: IMG_BCP_ONLINE, icon2: IMG_BCP_VENTANILLA,
        h1: 'En línea', h2: 'En ventanilla',
        body1: 'Ingresa a tu banca por internet o a tu app del __banco BCP__.\n\nHaz clic en __"Pago de servicios"__.\n\nSelecciona __"Empresas Diversas"__ y busca __"VMC Subastas"__.\n\nEn __"Servicios"__, selecciona __"Recarga"__ y coloca tu __C.U.U.__ así como el monto que deseas recargar.',
        body2: 'Acércate a la ventanilla o agente del __banco BCP__.\n\nIndícale al cajero que deseas hacer un __depósito a la cuenta recaudadora de VMC Subastas__, servicio de recarga.\n\nIndícale tu __C.U.U.__ así como el monto que deseas recargar.',
      }),
      // Más aire antes de «Más transparencia»: cierra el bloque de las cards BCP y,
      // sobre todo, deja sitio al celular, que asoma bastante por encima de su card
      // y sin este hueco se acercaría demasiado a las cards de arriba.
      SP('64'),
      // Escudo a la izquierda y el mockup de celular a la derecha, los dos assets
      // del CDN que usa el export de Figma para esta card.
      S('action-card', {
        full: 'true', padY: '6', size: 'sm',
        svgLeft: IMG_SHIELD, svgLeftW: '64',
        text: '__Más transparencia en cada operación__\n~~Podrás visualizar de forma clara el detalle de cualquier Fee aplicable antes de confirmar una adquisición dentro de la plataforma.~~',
        // El celular se ancla ABAJO y asoma por arriba (margen negativo en el propio
        // mockup), como en Figma: parece salir de la card en vez de flotar centrado.
        // Va en HTML, no como PNG, para que su botón «CONFIRMAR» sea el primary real
        // del sistema y no un botón dibujado (ver HTML_PHONE).
        // `svgW` incluye el marco del telefono (PHONE_W + su padding lateral): si se
        // ajusta solo a PHONE_W, la celda recorta el borde morado del lado derecho.
        svg: HTML_PHONE, svgW: '116', svgAlign: 'bottom', svgGap: '6',
      }),
      SP('30'),
    ],
  },
  {
    id: 'canje-puntos-exitoso',
    name: 'Canje de puntos exitoso',
    subject: '¡Canje de Puntos VMC exitoso!',
    category: 'Canje de Puntos',
    stage: 'Confirmación',
    sections: [
      S('title', { eyebrow: '', text: '¡Canje de Puntos VMC exitoso!' }),
      SP('24'),
      S('success', {
        wide: 'true', lightTitle: 'true',
        title: '__{{Nombre usuario.Ejem: Gabriel Bruno}}__, canjeaste', value: '30', caption: 'Puntos VMC con éxito!',
        extra: 'Tu nueva categoría de __riesgo de usuario__ es:\n__{{Categoría.Ejem: Regular}}__ ⭐ __{{Puntos.Ejem: 15}}__',
      }),
      SP('24'),
      S('text', { text: '!!Resumen de transacción:!!' }),
      SP('10'),
      S('details', {
        indent: '54',
        l1: 'Fecha y hora:', v1: '{{Fecha y hora. d/m/Y hh:mm:ss}}',
        l2: 'Importe:', v2: '>S< {{XX}} SubasCoins',
        l3: 'Concepto:', v3: 'Canje de Puntos VMC',
      }),
      SP('20'),
      S('note', {
        title: '**Importante:**',
        bodyTone: 'accent',
        body: 'Canjear SubasCoins por Puntos VMC es una **operación final y definitiva.**',
      }),
      SP('20'),
      SP('30'),
    ],
  },
  {
    id: 'nueva-contrasena',
    name: 'Nueva contraseña',
    subject: 'Nueva contraseña',
    category: 'Contraseña',
    stage: 'Recuperación',
    sections: [
      S('title', { eyebrow: '', text: 'Nueva contraseña' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel}}, **cambia tu contraseña** haciendo click en el siguiente botón:' }),
      SP('20'),
      S('cta', { text: 'Nueva contraseña', url: 'https://vmcsubastas.com/es/activate12358132134demo' }),
      SP('24'),
      S('text', { ink: 'black', text: '^^También puedes copiar y pegar este enlace en tu navegador^^', align: 'center' }),
      SP('8'),
      S('text', { ink: 'black', text: '{[https://vmcsubastas.com/es/activate12358132134demo|https://vmcsubastas.com/es/activate12358132134demo]}', align: 'center' }),
      SP('46'),
      S('text', { ink: 'black', text: '%%Equipo VMC Subastas.%%' }),
      SP('4'),
      S('text', { ink: 'black', text: 'Este es un mensaje automático, por favor evita responder este mail.' }),
      SP('30'),
    ],
  },
  {
    id: 'visita-agendada',
    name: 'Visita agendada',
    subject: 'Visita agendada en la oferta {{Toyota Hilux 2018}}',
    category: 'Visita Agendada',
    stage: 'Confirmación',
    sections: [
      S('title', { eyebrow: '', text: 'Visita agendada en la oferta {{Toyota Hilux 2018}}' }),
      SP('24'),
      S('text', { ink: 'black', text: '%%{{Nombre usuario .Ejem: Gabriel Bruno}}%%, estos son los datos de tu visita:' }),
      SP('16'),
      S('details', {
        l1: 'Ubicación:', v1: '{{Ubicación.Ejem: SAN MARTIN DE PORRES}}',
        l2: 'Dirección:', v2: '{{Dirección.Ejem: Av. Tomás Valle 601.}}',
        l3: 'Referencia:', v3: '{{Referencia.Ejem: Cruce con panamericana Norte.}}',
      }),
      SP('4'),
      S('details', { l1: '**Fecha y hora:**', v1: '**{{Fecha y hora.Ejem: Miércoles, 11 de agosto - 2:00 p.m.}}**', l2: '', v2: '', l3: '', v3: '' }),
      SP('20'),
      S('divider', {}),
      SP('16'),
      S('note', {
        title: 'Recuerda:',
        bodyTone: 'purple',
        body: '__Llevar DNI, cubrebocas y protector facial__ como medidas preventivas ante el COVID-19.',
      }),
      SP('30'),
    ],
  },
  {
    id: 'devolucion-saldo-exitosa',
    name: 'Devolución de saldo exitosa',
    subject: '¡Tu devolución ha sido procesada!',
    category: 'Devolución de Saldo',
    stage: 'Confirmación',
    sections: [
      S('title', { eyebrow: '', text: '¡Tu devolución ha sido procesada!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel}},' }),
      SP('14'),
      S('text', { ink: 'black', text: '__Tu solicitud de devolución por__ **US$ {{XX,XXX}}** fue realizada correctamente el **{{Fecha y hora. d/m/Y - hh:mm}}.**' }),
      SP('20'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('30'),
    ],
  },
  {
    id: 'devolucion-saldo-error',
    name: 'Devolución de saldo — error en la solicitud',
    subject: '¡Hubo un problema con tu solicitud!',
    category: 'Devolución de Saldo',
    stage: 'Error',
    sections: [
      S('title', { eyebrow: '', text: '¡Hubo un problema con tu solicitud!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel}},' }),
      SP('14'),
      S('text', { ink: 'black', text: '__El proceso de solicitud de devolución ha sido cancelado.__' }),
      SP('20'),
      S('text', { ink: 'black', text: '**Recuerda:**' }),
      SP('8'),
      S('list', {
        i1: 'Si solicitaste __"devolución a terceros"__ debes llenar la información en la sección correspondiente.',
        i2: 'Verifica que tu número de cuenta bancaria sea correcto.',
        i3: 'Usa una cuenta en dólares americanos.',
      }),
      SP('4'),
      S('list', { i1: 'Si solicitaste la anulación del proceso, se descontarán __US$ 30__ por concepto de gastos administrativos.' }),
      SP('20'),
      S('text', { ink: 'black', narrow: '430', text: '**Por favor, verifica que la información sea correcta y procede nuevamente con la solicitud de congelamiento de cuenta.**', align: 'center' }),
      SP('20'),
      S('cta', { text: 'VAMOS', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('30'),
    ],
  },
  {
    id: 'actualizar-correo',
    name: 'Actualizar correo de contacto',
    subject: 'Nueva correo de contacto',
    category: 'Actualizar Correo',
    stage: 'Verificación',
    sections: [
      S('title', { eyebrow: '', text: 'Nueva correo de contacto' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Correo.Ejem: gfajardo@correo.com}}, **valida tu nuevo correo electrónico** haciendo click en el siguiente botón:' }),
      SP('20'),
      S('cta', { text: 'Valida', url: 'https://vmcsubastas.com/es/activate12358132134demo' }),
      SP('24'),
      S('text', { ink: 'black', text: '@@También puedes copiar y pegar este enlace en tu navegador@@', align: 'center' }),
      SP('8'),
      S('text', { ink: 'black', text: '^^{[https://vmcsubastas.com/es/activate12358132134demo|https://vmcsubastas.com/es/activate12358132134demo]}^^', align: 'center' }),
      SP('46'),
      S('text', { ink: 'black', text: '%%Equipo VMC Subastas.%%' }),
      SP('4'),
      S('text', { ink: 'black', text: 'Este es un mensaje automático, por favor evita responder este mail.' }),
      SP('30'),
    ],
  },
  {
    id: 'inhabilitacion-suplantacion-identidad',
    name: 'Inhabilitación — suplantación de identidad',
    subject: 'Inhabilitación de cuenta',
    category: 'Inhabilitación de Usuario',
    stage: 'Suplantación de Identidad',
    sections: [
      S('title', { eyebrow: '', text: 'Inhabilitación de cuenta' }),
      SP('24'),
      S('text', { ink: 'black', text: '%%{{Nombre usuario.Ejem: Hugo Rafael}}%%, te informamos que tu cuenta ha sido inhabilitada por incumplir con las Condiciones y Términos de uso de nuestro servicio, los mismos que declaraste haber leído y comprendido al registrarte y en cada inicio de sesión en Plataforma. Te recordamos que todo usuario reconoce y acepta que:' }),
      SP('20'),
      S('text', { ink: 'black', text: '!!Título VI. POLÍTICA DE PREVENCIÓN DE FRAUDE!!', align: 'center' }),
      SP('4'),
      S('text', { ink: 'black', text: '!!2. Respecto al uso del servicio!!', align: 'center' }),
      SP('20'),
      S('text', { ink: 'black', text: 'Su cuenta será inhabilitada permanentemente de verificarse que ha suplantado a otra persona o entidad, incluyendo un empleado, representante o agente de VMC SUBASTAS, o que implique una falsa declaración o de cualquier manera tergiverse la relación del Usuario con una persona o con una entidad.' }),
      SP('30'),
    ],
  },
  {
    id: 'inhabilitacion-conducta-inapropiada',
    name: 'Inhabilitación — conducta inapropiada',
    subject: 'Inhabilitación de cuenta',
    category: 'Inhabilitación de Usuario',
    stage: 'Conducta Inapropiada',
    sections: [
      S('title', { eyebrow: '', text: 'Inhabilitación de cuenta' }),
      SP('24'),
      S('text', { ink: 'black', text: '%%{{Nombre usuario / Razón social.Ejem: Real Horizonte E.I.R.L}}%%, te informamos que tu cuenta ha sido inhabilitada por incumplir con las Condiciones y Términos de uso de nuestro servicio, los mismos que declaraste haber leído y comprendido al registrarte y en cada inicio de sesión en Plataforma. Te recordamos que todo usuario reconoce y acepta que:' }),
      SP('20'),
      S('text', { ink: 'black', text: '!!Título V. INFRACCIONES Y MEDIDAS CORRECTIVAS;!!', align: 'center' }),
      SP('4'),
      S('text', { ink: 'black', text: '!!5. Respecto a su comportamiento en plataforma:!!', align: 'center' }),
      SP('20'),
      S('text', { ink: 'black', text: '%%Su cuenta será inhabilitada permanentemente de verificarse que el usuario ha utilizado lenguaje ofensivo, incurra en actos de violencia, atente contra la dignidad, honor o pudor y/o la reputación de VMC SUBASTAS o alguno de sus representantes legales en cualquier medio.%%' }),
      SP('30'),
    ],
  },
  {
    id: 'baja-cuenta-inactividad',
    name: 'Baja de cuenta',
    subject: 'Tu cuenta en VMC Subastas ha sido dada de baja',
    category: 'Baja de Cuenta',
    stage: 'Confirmación',
    sections: [
      S('title', { eyebrow: '', text: 'Tu cuenta en VMC Subastas ha sido dada de baja' }),
      SP('24'),
      S('text', { ink: 'black', text: 'Estimado(a) %%{{Nombre completo.Ejem: Pedro Cristian Rodriguez Medina}}%%,' }),
      SP('14'),
      S('text', { ink: 'black', text: 'Te informamos que tu cuenta en VMC Subastas ha sido dada de baja debido al siguiente motivo:' }),
      SP('14'),
      S('text', { ink: 'black', text: '**Motivo:** {{Motivo.Ejem: Inactividad}}' }),
      SP('30'),
    ],
  },
  {
    id: 'cambio-contrasena-4panel',
    name: 'Cambio de contraseña — 4Panel',
    subject: 'Cambio de contraseña',
    category: 'Usuarios Internos',
    stage: '4 Panel',
    sections: [
      S('title', { eyebrow: '', text: 'Cambio de contraseña' }),
      SP('24'),
      S('text', { ink: 'black', text: 'Hola usuario de 4Panel,' }),
      SP('14'),
      S('text', { ink: 'black', text: 'Hemos recibido una solicitud de cambio de contraseña para tu cuenta. Para continuar **debes hacer click en el siguiente botón**, recuerda que el enlace solo será válido por 30 minutos:' }),
      SP('20'),
      S('cta', { text: 'Cambiar contraseña', url: 'https://services.subastop.com/reset-password-4panel/wiTVnGmkdyfHjldX' }),
      SP('24'),
      S('text', { ink: 'black', text: 'También puedes copiar y pegar este enlace en tu navegador:' }),
      SP('26'),
      S('text', { ink: 'black', text: '{[https://services.subastop.com/reset-password-4panel/wiTVnGmkdyfHjldX|https://services.subastop.com/reset-password-4panel/wiTVnGmkdyfHjldX]}', align: 'center', narrow: '430' }),
      SP('30'),
    ],
  },
  {
    id: 'cambio-contrasena-console',
    name: 'Cambio de contraseña — Console',
    subject: 'Cambio de contraseña',
    category: 'Usuarios Internos',
    stage: 'Console',
    sections: [
      S('title', { eyebrow: '', text: 'Cambio de contraseña' }),
      SP('24'),
      S('text', { ink: 'black', text: 'Hola {{Nombre usuario.Ejem: Silvana Almandoz}},' }),
      SP('14'),
      S('text', { ink: 'black', text: 'Hemos recibido una solicitud de cambio de contraseña para tu cuenta de Console. Para continuar **debes hacer click en el siguiente botón**, recuerda que el enlace solo será válido por 30 minutos:' }),
      SP('20'),
      S('cta', { text: 'Cambiar contraseña', url: 'https://services.subastop.com/password/reset/fde337cd417db376550635ddb62e67485098b5090fdff2319b1857728a027fe5' }),
      SP('24'),
      S('text', { ink: 'black', text: 'También puedes copiar y pegar este enlace en tu navegador:' }),
      SP('26'),
      S('text', { ink: 'black', text: '{[https://services.subastop.com/password/reset/fde337cd417db376550635ddb62e67485098b5090fdff2319b1857728a027fe5|https://services.subastop.com/password/reset/fde337cd417db376550635ddb62e67485098b5090fdff2319b1857728a027fe5]}', align: 'center', narrow: '430' }),
      SP('30'),
    ],
  },
  {
    id: 'mapfre-invitacion-proceso',
    name: 'Mapfre — invitación al proceso',
    subject: 'Proceso interno de adquisición',
    category: 'Proceso Interno Mapfre',
    stage: 'Invitación',
    leadsTo: ['mapfre-ofertas-publicadas'],
    sections: [
      S('title', { eyebrow: '', text: 'Proceso interno de adquisición' }),
      SP('8'),
      S('image', { url: '/figma/correos/mapfre-logo.png', alt: 'MAPFRE', width: '150' }),
      SP('16'),
      S('divider', {}),
      SP('20'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('14'),
      S('text', { text: '__Como colaborador de MAPFRE, puedes realizar la compra de una oferta de tu interés sin necesidad de participar en el proceso En Vivo de VMC.__' }),
      SP('24'),
      S('zoom-card', {
        headTitle: 'Cierre de inscripciones',
        headValue: 'Martes, 08 de Marzo 00:00 Hrs',
        amountLabel: 'Valor de restos',
        amountValue: 'US$ {{X,XXX}}',
        note1: 'Este es el monto que deberás pagar de resultar ganador.',
        body: 'Para registrar tu propuesta de interés y participar del proceso interno, haz clic en el siguiente botón:',
        btnText: 'Me interesa',
        url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona',
        note2: 'Al registrar tu interés, participarás en un sorteo interno entre los colaboradores interesados. **El ganador podrá comprar la oferta al precio del "Valor de Restos".**',
      }),
      SP('24'),
      S('text', { text: 'Ya puedes ver las ofertas {[aquí|https://www.vmcsubastas.com/mapfre.html]}.' }),
      SP('14'),
      S('text', { ink: 'black', text: '%%Recuerda:%% Puedes indicar tu interés de compra hasta las %%23:59 del día anterior%% al día de inicio programado.' }),
      SP('14'),
      S('text', { ink: 'black', text: 'De resultar ganador **deberás pagar el Valor de Restos,** que es el precio especial que se te brinda por ser colaborador de MAPFRE.' }),
      SP('30'),
    ],
  },
  {
    id: 'mapfre-ofertas-publicadas',
    name: 'Mapfre — ofertas publicadas',
    subject: 'Proceso interno de adquisición',
    category: 'Proceso Interno Mapfre',
    stage: 'Invitación',
    leadsTo: ['mapfre-participacion-registrada'],
    sections: [
      S('title', { eyebrow: '', text: 'Proceso interno de adquisición' }),
      SP('8'),
      S('image', { url: '/figma/correos/mapfre-logo.png', alt: 'MAPFRE', width: '150' }),
      SP('16'),
      S('divider', {}),
      SP('20'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('14'),
      S('text', { text: '~~Ya puedes ver las ofertas~~ {[aquí|https://www.vmcsubastas.com/mapfre.html]}~~.~~' }),
      SP('14'),
      S('text', { ink: 'black', text: '**Recuerda:** Puedes indicar tu interés de compra hasta las 23:59 del día anterior al día de inicio programado.' }),
      SP('30'),
    ],
  },
  {
    id: 'mapfre-participacion-registrada',
    name: 'Mapfre — participación registrada',
    subject: 'Participación registrada',
    category: 'Proceso Interno Mapfre',
    stage: 'Participación',
    leadsTo: ['mapfre-cierre-proceso'],
    sections: [
      S('title', { eyebrow: '', text: 'Participación registrada' }),
      SP('8'),
      S('image', { url: '/figma/correos/mapfre-logo.png', alt: 'MAPFRE', width: '150' }),
      SP('16'),
      S('divider', {}),
      SP('20'),
      S('text', { ink: 'black', text: '¡Felicitaciones {{Nombre usuario.Ejem: Gabriel Bruno}}!' }),
      SP('14'),
      S('text', { text: '~~Estás participando del proceso interno de adquisición del vehículo.~~' }),
      SP('20'),
      S('panel', { size: 'lg', align: 'center', title: '{{Placa.Ejem: ABC-123}} {{Marca y modelo.Ejem: Toyota Yaris}}', body: '{{Año.Ejem: 2014}}' }),
      SP('30'),
    ],
  },
  {
    id: 'mapfre-resultados-sin-interesados',
    name: 'Mapfre — sin interesados',
    subject: 'Resultados proceso de adquisición',
    category: 'Proceso Interno Mapfre',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: 'Resultados proceso de adquisición' }),
      SP('8'),
      S('image', { url: '/figma/correos/mapfre-logo.png', alt: 'MAPFRE', width: '150' }),
      SP('16'),
      S('divider', {}),
      SP('20'),
      S('text', { text: 'Sin registros de interesados en el proceso interno de adquisición.' }),
      SP('30'),
    ],
  },
  {
    id: 'mapfre-cierre-proceso',
    name: 'Mapfre — cierre del proceso',
    subject: 'Cierre proceso de adquisición',
    category: 'Proceso Interno Mapfre',
    stage: 'Cierre',
    leadsTo: ['mapfre-resultados-finales'],
    sections: [
      S('title', { eyebrow: '', text: 'Cierre proceso de adquisición' }),
      SP('8'),
      S('image', { url: '/figma/correos/mapfre-logo.png', alt: 'MAPFRE', width: '150' }),
      SP('16'),
      S('divider', {}),
      SP('20'),
      S('text', { text: '~~El proceso interno de adquisición de vehículos ha terminado, en breve recibirás un correo electrónico con los resultados.~~' }),
      SP('30'),
    ],
  },
  {
    id: 'mapfre-resultados-finales',
    name: 'Mapfre — resultados finales',
    subject: 'Resultados proceso de adquisición',
    category: 'Proceso Interno Mapfre',
    stage: 'Resultado',
    sections: [
      S('title', { eyebrow: '', text: 'Resultados proceso de adquisición' }),
      SP('8'),
      S('image', { url: '/figma/correos/mapfre-logo.png', alt: 'MAPFRE', width: '150' }),
      SP('16'),
      S('divider', {}),
      SP('20'),
      S('text', { text: '~~Adjunto se encuentran los resultados del proceso interno de adquisición llevado a cabo el~~ __{{Fecha.Ejem: 15 de agosto de 2021}}__~~.~~' }),
      SP('30'),
    ],
  },
  {
    // Maqueta de boletín semanal: hero con foto + cards de unidad con CTA propia.
    // No encaja en el renderer de secciones → HTML crudo por el campo `html`.
    id: 'boletin-maf-peru',
    name: 'Boletín — MAF viene con todo',
    subject: 'Esta semana MAF viene con todo',
    category: 'Proceso Interno Mapfre',
    sections: [],
    html: BOLETIN_MAF_PERU_HTML,
  },
  {
    id: 'subaspass-adquirido',
    name: 'SubasPass adquirido',
    subject: '¡Adquiriste tu Subaspass de forma exitosa!',
    category: 'SubasPass',
    stage: 'Confirmación',
    sections: [
      S('title', { eyebrow: '', text: '¡Adquiriste tu Subaspass de forma exitosa!' }),
      SP('24'),
      S('text', { text: '¡Felicidades! Tu SubasPass se activó con éxito y ahora tienes acceso exclusivo a participar en todas las ofertas disponibles del marketplace.' }),
      SP('20'),
      S('text', { text: 'Tu Subaspass es tu pase directo para bidear sin límites, este estará activo desde el __{{Fecha inicio.Ejem: 30/07/2026}}__ hasta el __{{Fecha fin.Ejem: 30/10/2026}}__.' }),
      SP('20'),
      S('text', { text: 'Es hora de arrancar ¡Encuentra la oferta que haga match contigo y empieza a bidear!' }),
      SP('30'),
    ],
  },
  {
    id: 'calificacion-invitacion',
    name: 'Calificación — invitación',
    subject: '¿Qué tal tu experiencia en VMC Subastas? Tu opinión importa',
    category: 'Calificación de Compra',
    stage: 'Invitación',
    leadsTo: ['calificacion-recordatorio'],
    sections: [
      S('title', { eyebrow: '', text: '¡Qué buena decisión!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Nos alegra que hayas culminado tu proceso de compra por el __{{Toyota Hilux 2018}}__ de manera exitosa. En %%VMC Subastas%% queremos seguir mejorando para darte siempre la mejor experiencia. Por eso, nos encantaría conocer tu opinión sobre cómo fue tu proceso de compra con nosotros.' }),
      SP('14'),
      S('text', { ink: 'black', text: 'Tomará solo un par de minutos. Tienes **15 días calendario** para dejarnos tu calificación y reseña desde tu cuenta.' }),
      SP('20'),
      S('cta', { text: '¡Vamos!', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('30'),
    ],
  },
  {
    id: 'calificacion-recordatorio',
    name: 'Calificación — quedan 7 días',
    subject: 'Te quedan 7 días para contarnos tu experiencia ⭐',
    category: 'Calificación de Compra',
    stage: 'Recordatorio',
    leadsTo: ['calificacion-ultimo-dia'],
    sections: [
      S('title', { eyebrow: '', text: '¡Tu opinión es importante!' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: 'Esperamos que todo vaya genial con tu compra.' }),
      SP('14'),
      S('text', { ink: 'black', text: 'Te escribimos para recordarte que aún estás a tiempo de calificar tu experiencia de compra por el __{{Toyota Hilux 2018}}__ en %%VMC Subastas%%. Te quedan **7 días** para dejarnos tus estrellas y comentarios.' }),
      SP('14'),
      S('text', { ink: 'black', text: 'Tu feedback nos ayuda muchísimo a seguir creciendo y a orientar a otros usuarios de la comunidad.' }),
      SP('20'),
      S('cta', { text: '¡Vamos!', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('30'),
    ],
  },
  {
    id: 'calificacion-ultimo-dia',
    name: 'Calificación — último día',
    subject: '¡Último día! Déjanos tu opinión sobre tu compra',
    category: 'Calificación de Compra',
    stage: 'Último día',
    sections: [
      S('title', { eyebrow: '', text: 'Comparte tu experiencia con los demás' }),
      SP('24'),
      S('text', { ink: 'black', text: '{{Nombre usuario.Ejem: Gabriel Bruno}},' }),
      SP('10'),
      S('text', { ink: 'black', text: '¡El tiempo vuela! **Hoy es el último día** disponible para ingresar tu calificación y reseña sobre tu proceso de compra por el __{{Toyota Hilux 2018}}__ en %%VMC Subastas%%.' }),
      SP('14'),
      S('text', { ink: 'black', text: 'Nos encantaría cerrar tu proceso conociendo tu opinión sincera para asegurarnos de que todo haya salido genial.' }),
      SP('20'),
      S('cta', { text: '¡Vamos!', url: 'https://www.vmcsubastas.com/login?redirect_after_to=/zona' }),
      SP('30'),
    ],
  },
  ...CAMPANA_VALORIZA,
];

export const getEmail = (id: string) => EMAILS.find((e) => e.id === id);
