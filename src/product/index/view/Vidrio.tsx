"use client";

import { useId, type JSX, type ReactNode } from "react";
import "./vidrio.css";

/** «Vidrio esmerilado» (15/10): dos formas por ícono, una sólida detrás y una de vidrio delante que la desenfoca donde
 *  se cruzan, con el detalle en blanco. Referencia: sets de íconos glassmorphism de Dribbble/Figma (p. ej. Glazicons).
 *  ponytail: el vidrio es SVG puro (copia desenfocada de la forma de atrás, recortada por la de adelante), no backdrop-filter:
 *  se ve igual en todos los navegadores y se exporta tal cual a Figma. Retícula de 48 px. */
export type Sec = "negociaciones" | "participaciones" | "compras" | "publicaciones" | "valorizaciones" | "billetera" | "auto" | "alertas" | "publicar" | "km" | "caja" | "combustible" | "fecha" | "ubicacion" | "equipo" | "docs" | "texto" | "precio" | "vehicular" | "equipos" | "maquinaria" | "materiales" | "articulos" | "mobiliario" | "empresa" | "verificado" | "crecimiento" | "vender";

type Parts = { back: ReactNode; front: ReactNode; detail: ReactNode };
const W = { fill: "none", stroke: "#fff", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const T = { fill: "#fff", fontSize: 10, fontWeight: 800, textAnchor: "middle", fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;

const PARTS: Record<Sec, Parts> = {
  // Dos globos: el de la contraparte (sólido) y el tuyo (vidrio).
  negociaciones: {
    back: <path d="M24 6h12a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6v5l-6-5h-6a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z" />,
    front: <path d="M12 15h14a7 7 0 0 1 7 7v7a7 7 0 0 1-7 7h-8l-7 6v-6.3A7 7 0 0 1 5 29v-7a7 7 0 0 1 7-7z" />,
    detail: <g fill="#fff"><circle className="vd-dot" cx="13" cy="25.5" r="2" /><circle className="vd-dot" cx="19" cy="25.5" r="2" /><circle className="vd-dot" cx="25" cy="25.5" r="2" /></g>,
  },
  // Martillo de subasta compacto: base como bloque y mango sólidos, cabeza de vidrio sobre el mango.
  participaciones: {
    back: <><path d="M21 18l15 15" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" /><rect x="6" y="36" width="22" height="7" rx="3.5" /></>,
    front: <rect x="7" y="9.5" width="26" height="14" rx="5" transform="rotate(-40 20 16.5)" />,
    detail: <path d="M22.4 8.3l6.2 7.4M11.4 17.3l6.2 7.4" {...W} strokeWidth={2} />,
  },
  // Asa sólida detrás, bolsa de vidrio con check.
  compras: {
    back: <path className="vd-asa" d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" />,
    front: <path d="M11.4 16h25.2a3 3 0 0 1 3 2.8l1.3 19.4a4 4 0 0 1-4 4.3H11.1a4 4 0 0 1-4-4.3l1.3-19.4a3 3 0 0 1 3-2.8z" />,
    detail: <><circle cx="15" cy="22" r="2" fill="#fff" /><circle cx="33" cy="22" r="2" fill="#fff" /><path className="vd-ck" d="M18.5 30.5l4 4 7.5-7.5" pathLength={1} {...W} /></>,
  },
  // Etiqueta de vidrio (con S/) sobre una tarjeta sólida girada, como la etiqueta «%» de la referencia.
  publicaciones: {
    back: <rect x="22" y="7" width="20" height="20" rx="5" transform="rotate(18 32 17)" />,
    front: <path d="M17.5 9.4a2.5 2.5 0 0 1 3 0l7.6 6.4a3 3 0 0 1 1 2.3V39a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V18.1a3 3 0 0 1 1-2.3z" transform="rotate(-12 19 26)" />,
    detail: <g transform="rotate(-12 19 26)"><circle cx="19" cy="18" r="2.2" fill="#fff" /><text x="19" y="34" {...T}>S/</text></g>,
  },
  // Aguja sólida que asoma detrás del dial de vidrio, como el check de la referencia.
  valorizaciones: {
    back: <path className="vd-nd" d="M24 33L37 12" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" />,
    front: <path d="M7 34a17 17 0 0 1 34 0v1a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4z" />,
    detail: <><circle cx="24" cy="33" r="3" fill="#fff" /><path d="M13 31.5h1.5M17 23.5l1 1M34.5 31.5H33" {...W} strokeWidth={2.5} /></>,
  },
  // Billetera de vidrio con S/ y una tarjeta sólida asomando, como la billetera de la referencia.
  billetera: {
    back: <g className="vd-card"><rect x="12" y="6" width="24" height="17" rx="4" transform="rotate(-10 24 14)" /></g>,
    front: <rect x="6" y="15" width="36" height="27" rx="7" />,
    detail: <text x="24" y="33.5" {...T} fontSize={12}>S/</text>,
  },
  // Auto de frente: cabina y ruedas sólidas, carrocería de vidrio con faros.
  auto: {
    back: <><path d="M12.5 23l3.6-8.4a4 4 0 0 1 3.7-2.6h8.4a4 4 0 0 1 3.7 2.6l3.6 8.4z" /><rect x="9" y="32" width="7" height="9" rx="2.5" /><rect x="32" y="32" width="7" height="9" rx="2.5" /></>,
    front: <rect x="6" y="21" width="36" height="15" rx="6" />,
    detail: <><circle cx="13" cy="28.5" r="2.3" fill="#fff" /><circle cx="35" cy="28.5" r="2.3" fill="#fff" /><path d="M20.5 28.5h7" {...W} strokeWidth={2.5} /></>,
  },
  // Campana de vidrio; badajo y punto de aviso sólidos detrás.
  alertas: {
    back: <><circle className="vd-pt" cx="35" cy="11" r="7" /><circle className="vd-bd" cx="24" cy="38" r="4.5" /></>,
    front: <path d="M24 7a11 11 0 0 1 11 11v8l3.5 5a1.5 1.5 0 0 1-1.2 2.5H10.7A1.5 1.5 0 0 1 9.5 31l3.5-5v-8A11 11 0 0 1 24 7z" />,
    detail: <path d="M18 20a6 6 0 0 1 4-5.5" {...W} strokeWidth={2.5} />,
  },
  // Ficha del vehículo (16/10, vista rápida de la negociación): kilometraje, transmisión, combustible y fecha de publicación.
  // Kilometraje: odómetro de vidrio sobre una ruta sólida.
  km: {
    back: <path d="M16 42l5-30h6l5 30z" />,
    front: <rect x="5" y="9" width="38" height="18" rx="6" />,
    detail: <text x="24" y="22.5" {...T} fontSize={11}>km</text>,
  },
  // Transmisión: patrón en H sólido, pomo de vidrio arriba.
  caja: {
    back: <path d="M12 22v18M24 22v18M36 22v18M12 31h24" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" />,
    front: <circle cx="24" cy="13" r="9" />,
    detail: <circle cx="24" cy="13" r="2.5" fill="#fff" />,
  },
  // Combustible: manguera sólida, surtidor de vidrio con visor.
  combustible: {
    back: <path d="M30 14h4l5 6v15a3 3 0 0 1-6 0v-7h-3" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />,
    front: <rect x="8" y="7" width="22" height="35" rx="5" />,
    detail: <rect x="12.5" y="12" width="13" height="9" rx="2.5" fill="#fff" />,
  },
  // Fecha: anillas sólidas, hoja de vidrio con días.
  fecha: {
    back: <><rect x="13" y="4" width="6" height="12" rx="3" /><rect x="29" y="4" width="6" height="12" rx="3" /></>,
    front: <rect x="6" y="10" width="36" height="32" rx="7" />,
    detail: <g fill="#fff"><circle cx="16" cy="25" r="2.2" /><circle cx="24" cy="25" r="2.2" /><circle cx="32" cy="25" r="2.2" /><circle cx="16" cy="33" r="2.2" /><circle cx="24" cy="33" r="2.2" /></g>,
  },
  // Publicar VMC (16/10): ubicación, equipamiento, documentos y descripción con la misma receta (sólido detrás, vidrio delante).
  // Ubicación: sombra en el suelo sólida, pin de vidrio con su punto.
  ubicacion: {
    back: <><ellipse cx="24" cy="41" rx="13" ry="4" /><circle cx="35" cy="12" r="6" /></>,
    front: <path d="M24 5a13 13 0 0 1 13 13c0 9.5-13 23-13 23S11 27.5 11 18A13 13 0 0 1 24 5z" />,
    detail: <circle cx="24" cy="18" r="4.5" fill="#fff" />,
  },
  // Equipamiento: círculo sólido detrás, estrella de vidrio con check.
  equipo: {
    back: <circle cx="34" cy="13" r="9" />,
    front: <path d="M24 6l5.3 11.3 12.3 1.5-9.1 8.4 2.4 12.2L24 33.3 13.1 39.4l2.4-12.2-9.1-8.4 12.3-1.5z" />,
    detail: <path d="M19.5 24.5l3 3 6-6" {...W} strokeWidth={2.5} />,
  },
  // Documentos: hoja sólida detrás, hoja de vidrio delante con renglones.
  docs: {
    back: <rect x="17" y="4" width="24" height="30" rx="5" />,
    front: <rect x="7" y="11" width="27" height="32" rx="6" />,
    detail: <path d="M13.5 21h14M13.5 27.5h14M13.5 34h9" {...W} strokeWidth={2.5} />,
  },
  // Descripción: renglón sólido, lápiz de vidrio encima.
  texto: {
    back: <rect x="6" y="37" width="36" height="5" rx="2.5" />,
    front: <path d="M30.5 5.5a4 4 0 0 1 5.7 0l3.3 3.3a4 4 0 0 1 0 5.7L17 37H8.5v-8.5z" />,
    detail: <path d="M26.5 10l8.5 8.5" {...W} strokeWidth={2.5} />,
  },
  // Categorías de oferta (20/10): Vehicular, Equipos diversos, Maquinaria, Materiales y Artículos diversos.
  // Vehicular (v2): auto de perfil; cabina y ruedas sólidas (el rasgo que lo identifica), carrocería de vidrio con faro.
  vehicular: {
    back: <><path d="M12.5 24l4.6-8.6a4 4 0 0 1 3.5-2.1h8.9a4 4 0 0 1 3.2 1.6L39 24z" /><circle cx="14" cy="35" r="5.5" /><circle cx="34" cy="35" r="5.5" /></>,
    front: <rect x="4" y="20" width="40" height="14" rx="6" />,
    detail: <><circle cx="39" cy="25.5" r="2" fill="#fff" /><path d="M21 26.5h5" {...W} strokeWidth={2.5} /><circle cx="14" cy="35" r="2" fill="#fff" /><circle cx="34" cy="35" r="2" fill="#fff" /></>,
  },
  // Equipos diversos (v2): sierra circular; disco dentado sólido detrás, cuerpo de vidrio con mango de pistola.
  equipos: {
    back: <path d="M31.0 17.5 L34.6 21.1 L36.2 22.0 L38.3 19.9 L39.2 25.0 L40.0 26.6 L42.9 26.1 L40.6 30.7 L40.3 32.5 L42.9 33.9 L38.3 36.2 L37.0 37.5 L38.3 40.1 L33.3 39.3 L31.5 39.6 L31.0 42.5 L27.4 38.9 L25.8 38.0 L23.7 40.1 L22.8 35.0 L22.0 33.4 L19.1 33.9 L21.4 29.3 L21.7 27.5 L19.1 26.1 L23.7 23.8 L25.0 22.5 L23.7 19.9 L28.7 20.7 L30.5 20.4Z" />,
    front: <path d="M9 8h16a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6h-5.5l-3.6 12.4A3 3 0 0 1 13 38.6h-2.6a2.5 2.5 0 0 1-2.4-3.2L11.3 24H9a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5z" />,
    detail: <><circle cx="31" cy="30" r="3" fill="#fff" /><path d="M10 14.5h9" {...W} strokeWidth={2.5} /></>,
  },
  // Maquinaria (v2): excavadora como la foto de la categoría; brazo, cucharón y orugas sólidos, cabina de vidrio.
  maquinaria: {
    back: <><path d="M27 23L35 11l7 8" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" /><path d="M38.5 19.5h7l-1.6 6.5a2 2 0 0 1-1.9 1.5h-3.5z" /><rect x="3" y="36" width="30" height="8" rx="4" /></>,
    front: <path d="M17 10h9a3 3 0 0 1 3 3v24H6v-11a4 4 0 0 1 4-4h4v-9a3 3 0 0 1 3-3z" />,
    detail: <><rect x="19.5" y="13" width="6.5" height="6" rx="1.5" fill="#fff" /><g fill="#fff"><circle cx="10" cy="40" r="1.8" /><circle cx="18" cy="40" r="1.8" /><circle cx="26" cy="40" r="1.8" /></g></>,
  },
  // Materiales: dos capas apiladas; la de abajo sólida, la de arriba de vidrio.
  materiales: {
    back: <path d="M21.6 21.2a5 5 0 0 1 4.8 0l16.4 8.4a1.6 1.6 0 0 1 0 2.8l-16.4 8.4a5 5 0 0 1-4.8 0L5.2 32.4a1.6 1.6 0 0 1 0-2.8z" />,
    front: <path d="M21.6 8.2a5 5 0 0 1 4.8 0l16.4 8.4a1.6 1.6 0 0 1 0 2.8l-16.4 8.4a5 5 0 0 1-4.8 0L5.2 19.4a1.6 1.6 0 0 1 0-2.8z" />,
    detail: <path d="M17 18l7-3.5 7 3.5" {...W} strokeWidth={2.5} />,
  },
  // Artículos diversos (v2): caja de vidrio con objetos sólidos que asoman (pelota y un equipo), cinta en blanco.
  articulos: {
    back: <><circle cx="15" cy="11" r="7" /><rect x="26" y="3" width="11" height="17" rx="3" transform="rotate(14 31.5 11.5)" /></>,
    front: <><rect x="5" y="15" width="38" height="8" rx="3" /><path d="M8 25h32v13a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" /></>,
    detail: <path d="M24 15v8M19 32h10" {...W} strokeWidth={2.5} />,
  },
  // Mobiliario (29/10): sofá; respaldo y patas sólidos (la silueta que lo identifica), brazos y asiento de vidrio con la costura.
  mobiliario: {
    back: <><rect x="9" y="9" width="30" height="21" rx="6" /><rect x="9" y="36" width="5" height="7" rx="2" /><rect x="34" y="36" width="5" height="7" rx="2" /></>,
    front: <path d="M9 19a5 5 0 0 1 5 5v2h20v-2a5 5 0 0 1 10 0v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V24a5 5 0 0 1 5-5z" />,
    detail: <path d="M24 30v5" {...W} strokeWidth={2.5} />,
  },
  // Banner de maquinaria de la home (vmc-index-lab, 21/10): empresa, verificado y crecimiento.
  // Empresa: ala sólida a la derecha, edificio de vidrio delante con ventanas y puerta.
  empresa: {
    back: <rect x="25" y="17" width="18" height="25" rx="4" />,
    front: <rect x="6" y="6" width="26" height="36" rx="6" />,
    detail: <><g fill="#fff"><circle cx="14" cy="15" r="2.2" /><circle cx="24" cy="15" r="2.2" /><circle cx="14" cy="23.5" r="2.2" /><circle cx="24" cy="23.5" r="2.2" /></g><path d="M16 41v-6h6v6" {...W} strokeWidth={2.5} /></>,
  },
  // Verificado: sello sólido arriba a la derecha, escudo de vidrio con check.
  verificado: {
    back: <circle className="vd-pt" cx="35" cy="13" r="8" />,
    front: <path d="M24 6l15 5.5v10.5c0 9.5-6.3 16.6-15 20-8.7-3.4-15-10.5-15-20V11.5z" />,
    detail: <path className="vd-ck" d="M17.5 24.5l4.5 4.5 8.5-8.5" pathLength={1} {...W} />,
  },
  // Crecimiento: flecha sólida que sube por detrás, tablero de vidrio con barras.
  crecimiento: {
    back: <path className="vd-nd" d="M9 27l9-9 6 6L39 9M30 9h9v9" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />,
    front: <rect x="6" y="20" width="28" height="22" rx="6" />,
    detail: <path d="M13 36v-3M20 36v-6M27 36v-9" {...W} strokeWidth={2.5} />,
  },
  // Vender (pill «Para vendedores» del banner, 21/10): etiqueta de precio (la de «precio», a la mitad) y ruedas sólidas, auto de vidrio delante.
  vender: {
    back: <><path transform="translate(21 2) scale(.5)" d="M22 7h15a4 4 0 0 1 4 4v15a4 4 0 0 1-1.2 2.8L26.6 42a4 4 0 0 1-5.6 0L8 29a4 4 0 0 1 0-5.6L19.2 8.2A4 4 0 0 1 22 7z" /><circle cx="14" cy="38" r="4.5" /><circle cx="33" cy="38" r="4.5" /></>,
    front: <path d="M13.5 22l3.4-6.4a4 4 0 0 1 3.5-2.1h6.4a4 4 0 0 1 3.5 2.1l3.4 6.4h3.3a4 4 0 0 1 4 4v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a4 4 0 0 1 4-4z" />,
    detail: <><circle cx="37.2" cy="9.8" r="1.8" fill="#fff" /><path d="M10 28h4M34.5 28h3.5" {...W} strokeWidth={2.5} /></>,
  },
  // Publicar (15/10): un + de vidrio sobre un círculo sólido que asoma arriba a la derecha.
  // Precio de lista (19/10): moneda sólida detrás, etiqueta de precio de vidrio con «$» (el MSRP de AVT es en US$).
  precio: {
    back: <circle cx="34" cy="14" r="9" />,
    front: <path d="M22 7h15a4 4 0 0 1 4 4v15a4 4 0 0 1-1.2 2.8L26.6 42a4 4 0 0 1-5.6 0L8 29a4 4 0 0 1 0-5.6L19.2 8.2A4 4 0 0 1 22 7z" />,
    detail: <><circle cx="32.5" cy="15.5" r="2.6" fill="#fff" /><text x="22.5" y="31" {...T} fontSize={13}>$</text></>,
  },
  publicar: {
    back: <circle cx="31" cy="17" r="12" />,
    front: <path d="M20 10a4 4 0 0 1 8 0v10h10a4 4 0 0 1 0 8H28v10a4 4 0 0 1-8 0V28H10a4 4 0 0 1 0-8h10z" />,
    detail: null,
  },
};

export function Vidrio({ s, size = 24 }: { s: Sec; size?: number }): JSX.Element {
  const id = useId().replace(/:/g, "");
  const p = PARTS[s];
  // Capas: vd-bk (sólido) y vd-gl (vidrio + detalle) se separan al pasar (parallax); vd-gx lleva el gesto propio del ícono.
  // ponytail: la forma de atrás se pinta dos veces (nítida y desenfocada) en vez de <use>, para que el CSS de hover la alcance.
  return <svg className={`vd vd--${s}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden>
    <defs>
      <clipPath id={`${id}c`}>{p.front}</clipPath>
      <filter id={`${id}f`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" /></filter>
    </defs>
    <g className="vd-bk">{p.back}</g>
    <g className="vd-gl"><g className="vd-gx">
      <g clipPath={`url(#${id}c)`}>
        <g className="vd-bl" filter={`url(#${id}f)`}>{p.back}</g>
        <g className="vd-glass">{p.front}</g>
        <g className="vd-edge">{p.front}</g>
      </g>
      {p.detail}
    </g></g>
  </svg>;
}
