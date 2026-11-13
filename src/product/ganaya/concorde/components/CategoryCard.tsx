"use client";

/**
 * CategoryCard — Generado por Concorde
 * Fuente: https://voyager-ds.vercel.app/preview/components/button-primary
 * Generado: 2026-05-28
 * EDITAR LIBREMENTE después de generar
 */

import { useId } from "react";
import type { JSX } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryCardCategory =
  | "vehicular"
  | "maquinaria"
  | "equipos-diversos"
  | "articulos-diversos";

export interface CategoryCardProps {
  /** Categoría — determina ícono y label por defecto */
  category: CategoryCardCategory;
  /** Override del label (default: nombre de categoría) */
  label?: string;
  /** Handler de click */
  onClick?: () => void;
  /** Aria label accesible */
  "aria-label"?: string;
  className?: string;
}

// ─── Label defaults ───────────────────────────────────────────────────────────

const LABEL_DEFAULTS: Record<CategoryCardCategory, string> = {
  "vehicular":         "VEHICULAR",
  "maquinaria":        "MAQUINARIA",
  "equipos-diversos":  "EQUIPOS\nDIVERSOS",
  "articulos-diversos":"ARTÍCULOS\nDIVERSOS",
};

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-pcatcard-styles";

const PCATCARD_STYLES = `
/* Card — sync EXACTO SVG (1807:15166 / 15183 / 1230:3327 / 3616):
   bg blanco→#F4F5F9 · borde gradiente lila · sombra morada #200068 */
.pcatcard {
  width: 92px;
  height: 95px;
  border-radius: var(--vmc-radius-md, 8px);
  border: 1px solid transparent;
  background-image:
    linear-gradient(160deg, #ffffff 0%, #f4f5f9 100%),
    linear-gradient(135deg, #9c96f8 0%, rgba(255,255,255,0.65) 38%, #7364de 70%, #9c96f8 100%);
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  gap: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow:
    rgba(32, 0, 104, 0.08) 0px 2px 10px,
    rgba(32, 0, 104, 0.05) 0px 1px 3px;
  transition:
    transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.22s,
    background-image 0.22s;
  transform: translateZ(0);
  outline: none;
  background-color: transparent;
  border-style: solid;
  text-align: center;
}

/* Glass highlight */
.pcatcard::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(160deg, rgba(255,255,255,0.55) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

/* Radial glow below card */
.pcatcard::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  background: radial-gradient(at 50% 60%, oklch(0.4 0.2 285 / 0.22) 0%, transparent 70%);
  filter: blur(8px);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.28s;
}

/* Icon wrapper */
.pcatcard-icon-wrap {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--vmc-color-vault, oklch(0.22 0.18 285));
  position: relative;
  z-index: 2;
}

/* Label */
.pcatcard-label {
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #3b1782;
  text-align: center;
  line-height: 1.35;
  position: relative;
  z-index: 2;
  white-space: pre-line;
}

/* Hover */
.pcatcard:hover {
  transform: translateY(-4px);
  box-shadow:
    oklch(0.22 0.18 285 / 0.14) 0px 12px 20px,
    oklch(0.22 0.18 285 / 0.1) 0px 4px 8px,
    oklch(0.22 0.18 285 / 0.06) 0px 1px 2px;
  background-image:
    linear-gradient(160deg, oklch(0.97 0.01 285) 0%, oklch(0.99 0.004 285) 100%),
    linear-gradient(135deg,
      oklch(0.52 0.22 285) 0%,
      oklch(1 0 0 / 0.8) 38%,
      oklch(0.4 0.24 285) 72%,
      oklch(0.52 0.22 285) 100%
    );
}

.pcatcard:hover::after {
  opacity: 0.3;
}

/* Focus / pressed */
.pcatcard:active {
  opacity: 0.58;
  transform: scale(0.96) !important;
  background-image:
    linear-gradient(160deg, oklch(0.94 0.012 285) 0%, oklch(0.9 0.018 285) 100%),
    linear-gradient(135deg,
      oklch(0.72 0.14 285) 0%,
      oklch(1 0 0 / 0.65) 38%,
      oklch(0.58 0.18 285) 70%,
      oklch(0.72 0.14 285) 100%
    ) !important;
  box-shadow:
    oklch(0.22 0.18 285 / 0.12) 0px 1px 5px,
    oklch(0.22 0.18 285 / 0.08) 0px 1px 3px inset !important;
}

/* Keyboard focus ring */
.pcatcard:focus-visible {
  outline: 2px solid var(--vmc-color-vault-400, oklch(0.62 0.20 285));
  outline-offset: 3px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .pcatcard,
  .pcatcard::after { transition: none; }
}
`;

let _stylesInjected = false;

// ─── Icon components (gradient stroke, unique IDs per instance) ───────────────

interface IconProps { gradId: string; }

// Íconos RELLENOS — paths exactos del SVG export de Figma (gradiente morado #653DE9→#0F003B).
// Mapeo (confirmar con diseño): car→vehicular · grúa→maquinaria · medidor→equipos · monitor→artículos.

function IconVehicular({ gradId }: IconProps): JSX.Element {
  // SVG 1230:3327 — carro (cabina + 2 ruedas)
  return (
    <svg width="34" height="34" viewBox="41 29 31 27" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="42.5" y1="30" x2="64.06" y2="55.16">
          <stop stopColor="#5F3ED8" />
          <stop offset="0.5" stopColor="#340091" />
          <stop offset="1" stopColor="#140046" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradId})`} d="M49.8053 30.4693C48.7705 30.7374 47.8575 31.8771 47.0662 33.7542C45.9705 36.3017 45.7271 36.5698 44.2053 36.1676C42.7445 35.8324 42.501 36.0335 42.501 37.2402C42.501 37.9777 42.8662 38.7821 43.2314 38.9162C43.8401 39.1844 43.9618 41.1955 43.8401 46.6257L43.5966 54H45.4836C46.9445 54 47.4314 53.6648 47.7358 52.324L48.101 50.648H56.501H64.901L65.2662 52.324C65.5705 53.6648 66.0575 54 67.5184 54H69.4053L69.1618 46.6257C69.0401 41.1955 69.1618 39.1844 69.7705 38.9162C70.1358 38.7821 70.501 37.9777 70.501 37.2402C70.501 36.0335 70.2575 35.8324 68.7966 36.1676C67.2749 36.5698 67.0314 36.3017 65.9358 33.7542C64.4749 30.3352 63.6227 30 56.501 30C53.6401 30 50.6575 30.2011 49.8053 30.4693ZM61.4923 32.2793C63.4401 32.6816 63.8053 33.0838 64.7184 35.6983C65.2662 37.3073 65.5705 38.8492 65.3271 39.1173C64.7792 39.7207 48.2227 39.7207 47.6749 39.1173C47.4314 38.8492 47.7358 37.3073 48.2836 35.6313C49.1358 33.2849 49.6836 32.5475 50.9618 32.3464C53.6401 31.8771 59.1184 31.8771 61.4923 32.2793ZM49.7445 42.5363C50.901 43.3408 50.0488 44.6145 48.2836 44.6145C47.4314 44.6145 46.5184 44.0112 46.1532 43.2737C45.5445 42.067 45.6662 41.933 47.1879 41.933C48.101 41.933 49.2575 42.2011 49.7445 42.5363ZM66.8488 43.2737C66.1184 44.7486 63.5618 45.0838 62.8314 43.8771C62.2836 42.8715 63.6836 41.933 65.814 41.933C67.3358 41.933 67.4575 42.067 66.8488 43.2737ZM60.9445 47.2961C60.6401 48.5028 60.0923 48.6369 56.501 48.6369C52.9097 48.6369 52.3618 48.5028 52.0575 47.2961C51.7532 46.0223 52.0575 45.9553 56.501 45.9553C60.9445 45.9553 61.2488 46.0223 60.9445 47.2961Z" />
    </svg>
  );
}

function IconMaquinaria({ gradId }: IconProps): JSX.Element {
  // SVG 1230:3616 — grúa / estructura
  return (
    <svg width="34" height="34" viewBox="41 27 30 30" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="42" y1="27.84" x2="42" y2="55.84">
          <stop stopColor="#653DE9" />
          <stop offset="0.55" stopColor="#300089" />
          <stop offset="1" stopColor="#0F003B" />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" clipRule="evenodd" fill={`url(#${gradId})`} d="M70 32.5046V30.949C70 30.0905 69.303 29.3934 68.4444 29.3934H52.8889V27.8379H48.2222V29.3934H46.6667V32.5046H48.2222V46.5046H46.6667V43.3934H43.5556V46.5046H42V49.6157H43.5556V55.8379H46.6667V49.6157H54.4444V55.8379H57.5556V54.1579V49.6157H59.1111V46.5046H57.5556V43.3934H54.4444V46.5046H52.8889V32.5046H65.3333V39.6912C64.6022 39.9557 64.0733 40.6401 64.0733 41.4646C64.0733 42.149 64.4467 42.7712 65.0222 43.1134V44.949H65.9867C66.5156 44.949 66.9356 45.3846 66.9356 45.9134C66.9356 46.4423 66.5156 46.8779 65.9867 46.8779C65.6444 46.8779 65.3333 46.6912 65.1622 46.3957C64.8822 45.9446 64.3067 45.789 63.8556 46.0534C63.3889 46.3023 63.2333 46.8934 63.4978 47.3601C64.0111 48.2312 64.96 48.7912 65.9867 48.7912C67.5578 48.7912 68.8489 47.5001 68.8489 45.9134C68.8489 44.7001 68.0711 43.6112 66.9356 43.2068V43.1134C67.5267 42.7712 67.9 42.149 67.9 41.4646C67.9 40.749 67.48 40.1423 66.8889 39.8157V32.5046H70ZM51.3333 44.4201L49.7778 45.9757V43.7668L51.3333 42.2112V44.4201ZM51.3333 39.8312L49.7778 41.3868V39.1779L51.3333 37.6223V39.8312ZM49.7778 36.7201V34.5112L51.3333 32.9557V35.1646L49.7778 36.7201Z" />
    </svg>
  );
}

function IconEquiposDiversos({ gradId }: IconProps): JSX.Element {
  // SVG 1807:15166 — medidor / herramienta
  return (
    <svg width="34" height="34" viewBox="40 25 30 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="41" y1="26" x2="41" y2="48">
          <stop stopColor="#653DE9" />
          <stop offset="0.55" stopColor="#300089" />
          <stop offset="1" stopColor="#0F003B" />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" clipRule="evenodd" fill={`url(#${gradId})`} d="M56.4 35.4479C57.1727 35.4479 57.8 36.0526 57.8 36.7975C57.8 37.5425 57.1727 38.1472 56.4 38.1472C55.6273 38.1472 55 37.5425 55 36.7975C55 36.0526 55.6273 35.4479 56.4 35.4479ZM49.204 29.0368C50.996 27.1742 53.558 26 56.4 26C61.3 26 65.416 29.5227 66.102 34.0982H69V36.7975H60.6C60.6 34.5628 58.718 32.7485 56.4 32.7485C54.082 32.7485 52.2 34.5628 52.2 36.7975H41V34.0982H41.07C41.35 31.0344 42.596 28.2405 44.5 26L49.204 29.0368ZM47.622 31.2503L45.284 29.7387C44.542 31.0613 44.052 32.5325 43.884 34.0982H46.698C46.852 33.0859 47.16 32.1276 47.622 31.2503ZM48.56 41.3865L46.6 39.4969H54.706C55.042 40.0638 55.7 40.4417 56.4 40.4417C57.1 40.4417 57.758 40.0638 58.094 39.4969H66.2V41.3865C63.946 40.0638 64.044 41.8589 64.044 41.8589V44.5043L61.3 47.1497C60.6 44.7877 59.34 46.1104 59.34 46.1104L57.38 48H53.46C54.832 45.827 52.97 45.9215 52.97 45.9215H50.226L47.482 43.2761C49.932 42.6147 48.56 41.3865 48.56 41.3865Z" />
    </svg>
  );
}

function IconArticulosDiversos({ gradId }: IconProps): JSX.Element {
  // SVG 1807:15183 — monitor / pantalla
  return (
    <svg width="34" height="34" viewBox="40 22 32 31" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="41" y1="23.4" x2="41" y2="51.4">
          <stop stopColor="#653DE9" />
          <stop offset="0.55" stopColor="#300089" />
          <stop offset="1" stopColor="#0F003B" />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" clipRule="evenodd" fill={`url(#${gradId})`} d="M45.5652 23.3989H66.4348C67.5146 23.3989 68.3913 24.3542 68.3913 25.5309V39.4598C68.3913 40.2443 67.8068 40.8812 67.087 40.8812H44.913C44.1932 40.8812 43.6087 40.2443 43.6087 39.4598V25.5309C43.6087 24.3542 44.4854 23.3989 45.5652 23.3989ZM44.913 40.3126H67.087L71 50.404H41L44.913 40.3126ZM41 50.8304H71V51.3989H41V50.8304ZM44.913 24.8202H67.087V38.0385H44.913V24.8202ZM56 24.2517C55.712 24.2521 55.4787 24.5067 55.4789 24.8206C55.4791 25.1345 55.7126 25.3888 56.0007 25.3888C56.2887 25.3888 56.5222 25.1345 56.5224 24.8206C56.5226 24.5067 56.2893 24.2521 56.0013 24.2517H56ZM45.8261 41.0233H66.1739L68.3913 47.135H43.6087L45.8261 41.0233ZM52.7391 47.8456H59.2609L59.5217 49.2669H52.4783L52.7391 47.8456ZM45.5652 25.5309H66.4348V37.3279H45.5652V25.5309ZM46.2174 41.4497H65.7826L66.1739 42.4446H45.8261L46.2174 41.4497ZM45.5652 43.0131H66.4348L66.9565 44.0081H45.0435L45.5652 43.0131ZM44.7826 44.5766H67.2174L67.7391 45.5715H44.2609L44.7826 44.5766ZM51.4348 45.9979H60.5652L60.8261 46.9928H51.1739L51.4348 45.9979ZM46.8696 26.9522L53.3913 36.1908H54.1739L47.6522 26.9522H46.8696ZM48.8261 26.9522L52.087 31.5004H52.8696L49.6087 26.9522H48.8261ZM61.8696 31.2162L65.3913 36.1908H66.1739L62.6522 31.2162H61.8696Z" />
    </svg>
  );
}

const ICON_MAP: Record<CategoryCardCategory, (props: IconProps) => JSX.Element> = {
  "vehicular":          IconVehicular,
  "maquinaria":         IconMaquinaria,
  "equipos-diversos":   IconEquiposDiversos,
  "articulos-diversos": IconArticulosDiversos,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryCard({
  category,
  label,
  onClick,
  "aria-label": ariaLabel,
  className = "",
}: CategoryCardProps): JSX.Element {
  // Unique gradient ID per instance — avoids SVG defs collision
  const uid = useId().replace(/:/g, "-");
  const gradId = `vg-${category}-${uid}`;

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = PCATCARD_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const displayLabel = label ?? LABEL_DEFAULTS[category];
  const IconComponent = ICON_MAP[category];

  const classes = ["pcatcard", className].filter(Boolean).join(" ");

  return (
    <>
      <style
        id={`${STYLE_ID}-ssr`}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: PCATCARD_STYLES }}
      />
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel ?? displayLabel.replace(/\n/g, " ")}
      >
        <div className="pcatcard-icon-wrap">
          <IconComponent gradId={gradId} />
        </div>
        <span className="pcatcard-label">{displayLabel}</span>
      </button>
    </>
  );
}
