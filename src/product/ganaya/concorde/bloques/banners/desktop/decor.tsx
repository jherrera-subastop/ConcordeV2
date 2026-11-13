/**
 * decor — piezas decorativas estáticas de los banners 766×272 (sin efectos).
 * Recrean los elementos de los banners de producción: monedas SubasCoin
 * (>S<), sparkles de 4 puntas, rombos y el chevrón "V" gigante del fondo.
 */

import type { CSSProperties, JSX } from "react";

const ABS = (style?: CSSProperties): CSSProperties => ({ position: "absolute", pointerEvents: "none", ...style });

// ─── Moneda SubasCoin ─────────────────────────────────────────────────────────

export interface CoinProps {
  size?: number;
  /** filled = blanca con glifo morado · outline = solo contorno blanco */
  variant?: "filled" | "outline";
  style?: CSSProperties;
}

export function Coin({ size = 44, variant = "filled", style }: CoinProps): JSX.Element {
  const filled = variant === "filled";
  const ink = filled ? "#3B1782" : "#FFFFFF";
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" style={ABS(style)}>
      <circle cx="22" cy="22" r="20" fill={filled ? "#FFFFFF" : "none"} stroke={ink} strokeWidth="2.5" />
      <circle cx="22" cy="22" r="15" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
      <text x="22" y="28.5" textAnchor="middle" fontSize="17" fontWeight="800" fill={ink} fontFamily="'Plus Jakarta Sans', Arial, sans-serif">S</text>
      <path d="M12.5 17.5 L9.5 22 L12.5 26.5" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31.5 17.5 L34.5 22 L31.5 26.5" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sparkle de 4 puntas ──────────────────────────────────────────────────────

export interface SparkleProps {
  size?: number;
  color?: string;
  /** true = solo contorno */
  outline?: boolean;
  style?: CSSProperties;
}

export function Sparkle({ size = 16, color = "#E8503A", outline = false, style }: SparkleProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={ABS(style)}>
      <path
        d="M12 1 C13.2 8 16 10.8 23 12 C16 13.2 13.2 16 12 23 C10.8 16 8 13.2 1 12 C8 10.8 10.8 8 12 1 Z"
        fill={outline ? "none" : color}
        stroke={outline ? color : "none"}
        strokeWidth={outline ? 2 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Rombo pequeño ────────────────────────────────────────────────────────────

export function Diamond({ size = 10, color = "#3B1782", style }: { size?: number; color?: string; style?: CSSProperties }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true" style={ABS(style)}>
      <rect x="1.8" y="1.8" width="6.4" height="6.4" transform="rotate(45 5 5)" fill={color} />
    </svg>
  );
}

// ─── Chevrón "V" gigante del fondo (doble trazo, como el logo) ───────────────

export interface ChevronVProps {
  width?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

export function ChevronV({ width = 240, color = "rgba(59,23,130,0.55)", strokeWidth = 3, style }: ChevronVProps): JSX.Element {
  const height = width * 0.75;
  return (
    <svg width={width} height={height} viewBox="0 0 100 75" aria-hidden="true" style={ABS(style)}>
      <path d="M8 6 L50 44 L92 6" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <path d="M8 32 L50 70 L92 32" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </svg>
  );
}

// ─── SubasCoin grande (gema del OfferCard, escalable) ─────────────────────────
// IDs de gradiente fijos: si hay varias instancias, los defs colisionan pero son
// idénticos, así que el render es el mismo.

export function BigGem({ size = 96, style }: { size?: number; style?: CSSProperties }): JSX.Element {
  const h = (size * 30) / 28;
  return (
    <svg width={size} height={h} viewBox="30 199 28 30" fill="none" aria-hidden="true" style={ABS(style)}>
      <defs>
        <linearGradient id="bgem-d" gradientUnits="userSpaceOnUse" x1="32" y1="215.5" x2="55.12" y2="228.11">
          <stop stopColor="#00A7A8" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#300089" />
        </linearGradient>
        <linearGradient id="bgem-ds" gradientUnits="userSpaceOnUse" x1="32" y1="215.5" x2="55.12" y2="228.11">
          <stop stopColor="#73DFDF" /><stop offset="0.28" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="0.875" stopColor="#452AA2" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="bgem-c" gradientUnits="userSpaceOnUse" x1="36.01" y1="199.59" x2="51.99" y2="222.41">
          <stop stopColor="#00ABAD" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#31008A" />
        </linearGradient>
        <linearGradient id="bgem-cg" gradientUnits="userSpaceOnUse" x1="44" y1="203" x2="44" y2="219">
          <stop stopColor="#ffffff" stopOpacity="0.45" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bgem-cb" gradientUnits="userSpaceOnUse" x1="36.01" y1="199.59" x2="51.99" y2="222.41">
          <stop stopColor="#44D6D6" /><stop offset="0.207" stopColor="#E4EEFF" stopOpacity="0.5" /><stop offset="0.495" stopColor="#567CD3" /><stop offset="1" stopColor="#3D0D9E" />
        </linearGradient>
      </defs>
      <path d="M44 215.5L56 221L44 226.5L32 221L44 215.5Z" fill="url(#bgem-d)" />
      <path d="M44 215.5L56 221L44 226.5L32 221L44 215.5" stroke="url(#bgem-ds)" strokeWidth="2" strokeLinejoin="round" />
      <rect x="34" y="201" width="20" height="20" rx="10" fill="url(#bgem-c)" />
      <rect x="36" y="203" width="16" height="16" rx="8" fill="url(#bgem-cg)" />
      <rect x="35" y="202" width="18" height="18" rx="9" stroke="url(#bgem-cb)" strokeWidth="2" />
      <path d="M44 206.417V215.583" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46.0833 208.083H42.9583C42.1535 208.083 41.5 208.737 41.5 209.542C41.5 210.347 42.1535 211 42.9583 211H45.0417C45.8465 211 46.5 211.653 46.5 212.458C46.5 213.263 45.8465 213.917 45.0417 213.917H41.5" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Ribbons — curvas de luz iridiscentes (estilo voyager-slides, estáticas) ──
// Trazos bezier con el trío del sistema "ganador" (#F4AC59 → #8460E5 → #ffffff),
// desenfocados y en mix-blend screen sobre fondos oscuros.

export interface RibbonsProps {
  /** Color medio de las cintas (default lila #8460E5) */
  mid?: string;
  /** Color cálido/acento (default ámbar #F4AC59) */
  warm?: string;
  style?: CSSProperties;
}

export function Ribbons({ mid = "#8460E5", warm = "#F4AC59", style }: RibbonsProps): JSX.Element {
  const gid = `rib-${warm.slice(1)}-${mid.slice(1)}`;
  return (
    <div aria-hidden="true" style={ABS({ inset: 0, mixBlendMode: "screen", ...style })}>
      {/* capa difusa (luz) */}
      <svg width="100%" height="100%" viewBox="0 0 766 192" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, filter: "blur(10px) saturate(1.6) brightness(1.25)" }}>
        <defs>
          <linearGradient id={`${gid}-a`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={warm} /><stop offset="0.52" stopColor={mid} /><stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id={`${gid}-b`} x1="1" y1="0" x2="0" y2="1">
            <stop stopColor="#ffffff" stopOpacity="0.9" /><stop offset="0.5" stopColor={mid} /><stop offset="1" stopColor={warm} />
          </linearGradient>
        </defs>
        <path d="M-60 170 C 140 30, 330 235, 520 95 S 760 40, 830 110" fill="none" stroke={`url(#${gid}-a)`} strokeWidth="46" strokeLinecap="round" opacity="0.5" />
        <path d="M-40 60 C 180 190, 420 -40, 620 120 S 790 150, 830 90" fill="none" stroke={`url(#${gid}-b)`} strokeWidth="30" strokeLinecap="round" opacity="0.38" />
      </svg>
      {/* capa nítida (filo de la cinta) */}
      <svg width="100%" height="100%" viewBox="0 0 766 192" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, filter: "blur(1.2px)" }}>
        <path d="M-60 170 C 140 30, 330 235, 520 95 S 760 40, 830 110" fill="none" stroke={`url(#${gid}-a)`} strokeWidth="7" strokeLinecap="round" opacity="0.75" />
        <path d="M-40 60 C 180 190, 420 -40, 620 120 S 790 150, 830 90" fill="none" stroke={`url(#${gid}-b)`} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      </svg>
    </div>
  );
}

// ─── GlassWaves — ondas de vidrio en capas (superficies onduladas translúcidas) ──
// No son luces radiales: son pliegues de "vidrio" que refractan el fondo del tono.
// Bandas onduladas con relleno blanco translúcido + blur, borde claro fino (filo del
// vidrio) y un tinte del color medio. Sin morado vault de fondo.

export interface GlassWavesProps {
  /** Color de tinte de las ondas (medio del tono) */
  tint?: string;
  style?: CSSProperties;
}

export function GlassWaves({ tint = "#ffffff", style }: GlassWavesProps): JSX.Element {
  return (
    <div aria-hidden="true" style={ABS({ inset: 0, overflow: "hidden", ...style })}>
      {/* Onda 1 — banda ancha diagonal, vidrio esmerilado */}
      <svg width="100%" height="100%" viewBox="0 0 766 192" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, filter: "blur(6px)" }}>
        <path d="M-40 118 C 150 40, 300 168, 480 96 C 620 42, 720 96, 810 66 L 810 220 L -40 220 Z" fill="rgba(255,255,255,0.16)" />
        <path d="M-40 150 C 160 78, 330 196, 520 120 C 660 66, 740 116, 810 94 L 810 240 L -40 240 Z" fill={`${tint}`} fillOpacity="0.10" />
      </svg>
      {/* Onda 2 — pliegue superior fino con filo brillante */}
      <svg width="100%" height="100%" viewBox="0 0 766 192" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, filter: "blur(1.5px)" }}>
        <path d="M-40 78 C 170 8, 360 128, 560 52 C 690 4, 760 52, 810 34" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M-40 92 C 170 22, 360 142, 560 66 C 690 18, 760 66, 810 48" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="10" strokeLinecap="round" />
      </svg>
      {/* Onda 3 — pliegue inferior, sombra suave del vidrio */}
      <svg width="100%" height="100%" viewBox="0 0 766 192" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, filter: "blur(3px)" }}>
        <path d="M-40 200 C 180 130, 380 218, 600 150 C 720 112, 780 150, 810 138" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
        <path d="M120 214 C 320 150, 520 224, 720 168" fill="none" stroke="rgba(20,0,70,0.14)" strokeWidth="14" strokeLinecap="round" />
      </svg>
      {/* Highlight especular puntual (brillo del vidrio) */}
      <div style={{ position: "absolute", top: -30, left: 90, width: 260, height: 150, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,0.35), transparent)", filter: "blur(14px)" }} />
    </div>
  );
}

// ─── Gema SubasCoin en OUTLINE (solo bordes, sin relleno) ─────────────────────
// Misma geometría que la gema del OfferCard pero como forma decorativa grande
// de fondo: trazos blancos translúcidos, sin fill.

export function GemOutline({ size = 220, color = "rgba(255,255,255,0.30)", style }: { size?: number; color?: string; style?: CSSProperties }): JSX.Element {
  const h = (size * 30) / 28;
  // strokeWidth en unidades del viewBox (28 de ancho): 0.55 ≈ 4px a 200px
  return (
    <svg width={size} height={h} viewBox="30 199 28 30" fill="none" aria-hidden="true" style={ABS(style)}>
      <path d="M44 215.5L56 221L44 226.5L32 221L44 215.5Z" stroke={color} strokeWidth="0.55" strokeLinejoin="round" />
      <rect x="34" y="201" width="20" height="20" rx="10" stroke={color} strokeWidth="0.55" />
      <path d="M44 206.417V215.583" stroke={color} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46.0833 208.083H42.9583C42.1535 208.083 41.5 208.737 41.5 209.542C41.5 210.347 42.1535 211 42.9583 211H45.0417C45.8465 211 46.5 211.653 46.5 212.458C46.5 213.263 45.8465 213.917 45.0417 213.917H41.5" stroke={color} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Iconos de pill / chip ────────────────────────────────────────────────────

/** Apretón de manos (pill EN VIVO / NEGOCIABLE) — glifo limpio estilo Lucide */
export function HandshakeIcon({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </svg>
  );
}

/** Carro (chip de categoría Vehicular) — path del CategoryCard vehicular */
export function CarIcon({ size = 22, color = "#FFFFFF" }: { size?: number; color?: string }): JSX.Element {
  return (
    <svg width={size} height={size * 0.87} viewBox="41 29 31 27" fill="none" aria-hidden="true">
      <path
        fill={color}
        d="M49.8053 30.4693C48.7705 30.7374 47.8575 31.8771 47.0662 33.7542C45.9705 36.3017 45.7271 36.5698 44.2053 36.1676C42.7445 35.8324 42.501 36.0335 42.501 37.2402C42.501 37.9777 42.8662 38.7821 43.2314 38.9162C43.8401 39.1844 43.9618 41.1955 43.8401 46.6257L43.5966 54H45.4836C46.9445 54 47.4314 53.6648 47.7358 52.324L48.101 50.648H56.501H64.901L65.2662 52.324C65.5705 53.6648 66.0575 54 67.5184 54H69.4053L69.1618 46.6257C69.0401 41.1955 69.1618 39.1844 69.7705 38.9162C70.1358 38.7821 70.501 37.9777 70.501 37.2402C70.501 36.0335 70.2575 35.8324 68.7966 36.1676C67.2749 36.5698 67.0314 36.3017 65.9358 33.7542C64.4749 30.3352 63.6227 30 56.501 30C53.6401 30 50.6575 30.2011 49.8053 30.4693ZM61.4923 32.2793C63.4401 32.6816 63.8053 33.0838 64.7184 35.6983C65.2662 37.3073 65.5705 38.8492 65.3271 39.1173C64.7792 39.7207 48.2227 39.7207 47.6749 39.1173C47.4314 38.8492 47.7358 37.3073 48.2836 35.6313C49.1358 33.2849 49.6836 32.5475 50.9618 32.3464C53.6401 31.8771 59.1184 31.8771 61.4923 32.2793ZM49.7445 42.5363C50.901 43.3408 50.0488 44.6145 48.2836 44.6145C47.4314 44.6145 46.5184 44.0112 46.1532 43.2737C45.5445 42.067 45.6662 41.933 47.1879 41.933C48.101 41.933 49.2575 42.2011 49.7445 42.5363ZM66.8488 43.2737C66.1184 44.7486 63.5618 45.0838 62.8314 43.8771C62.2836 42.8715 63.6836 41.933 65.814 41.933C67.3358 41.933 67.4575 42.067 66.8488 43.2737ZM60.9445 47.2961C60.6401 48.5028 60.0923 48.6369 56.501 48.6369C52.9097 48.6369 52.3618 48.5028 52.0575 47.2961C51.7532 46.0223 52.0575 45.9553 56.501 45.9553C60.9445 46.0223 61.2488 46.0223 60.9445 47.2961Z"
      />
    </svg>
  );
}
