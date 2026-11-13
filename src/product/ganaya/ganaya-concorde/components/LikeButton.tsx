"use client";

/**
 * LikeButton — Generado por Concorde
 * Fuente: Figma VOYAGER Design System · node 1119:11379
 * Preview: https://voyager-ds.vercel.app/preview/components/pase1
 * Generado: 2026-05-28 (revisado con Figma)
 * EDITAR LIBREMENTE después de generar
 */

import { forwardRef, useState, useCallback } from "react";
import type { ButtonHTMLAttributes, JSX, MouseEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LikeButtonSize = "sm" | "md" | "lg";

/**
 * Hereda los atributos nativos de <button> (type, name, aria-*, data-*, style…)
 * salvo onChange, que aquí entrega el booleano de estado activo.
 */
export interface LikeButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Tamaño: sm=24px · md=32px · lg=40px */
  size?: LikeButtonSize;
  /** Estado activo controlado externamente */
  active?: boolean;
  /** Estado activo inicial (modo no controlado) */
  defaultActive?: boolean;
  /** Muestra skeleton de carga */
  skeleton?: boolean;
  /** Callback al alternar el like */
  onChange?: (active: boolean) => void;
}

// ─── Tokens de tamaño — fuente: Figma node 1119:11379 ─────────────────────────

// icon/strokeW exactos de los SVG exports (Size=Small/Medium/Large, State=Default)
const SIZE_MAP: Record<LikeButtonSize, { btn: number; icon: number; strokeW: number; border: string; padding: string }> = {
  sm: { btn: 24, icon: 13, strokeW: 1,   border: "2px",    padding: "2px" },
  md: { btn: 32, icon: 14, strokeW: 1.2, border: "1.44px", padding: "1.44px" },
  lg: { btn: 40, icon: 21, strokeW: 1.4, border: "2px",    padding: "2px" },
};

// ─── SVG heart path ───────────────────────────────────────────────────────────

const HEART_PATH =
  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-plike-styles";

const PLIKE_STYLES = `
@keyframes plike-heart-pop {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.4); }
  65%  { transform: scale(0.85); }
  85%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
@keyframes plike-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* Default sync EXACTO de los SVG exports de Figma (nodos 1136:11505 / 1126:11466 / 1126:11432):
   círculo blanco + BORDE GRADIENTE lila + sin drop shadow en default. */
.plike {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border-style: solid;
  border-color: transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, #e8ddff 0%, #ffffff 40%, #cfbaff 75%, #ae8eff 100%) border-box;
  box-shadow: none;
  transition:
    transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.25s,
    filter 0.25s,
    background 0.2s;
  transform: translateZ(0);
}

/* Glass highlight overlay — 0.18 (sm/lg) según SVG; md usa 0.55 */
.plike::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(
    rgba(255, 255, 255, 0.18) 0%,
    transparent 50%
  );
  pointer-events: none;
  z-index: 1;
}
.plike--md::before {
  background: linear-gradient(
    rgba(255, 255, 255, 0.55) 0%,
    transparent 50%
  );
}

/* El corazón siempre por encima del glass/glow */
.plike svg {
  position: relative;
  z-index: 2;
}

/* Hover — lift (interacción Concorde) + sombra morada #200068 exacta del SVG */
.plike:hover:not(.plike--disabled):not(.plike--skeleton) {
  transform: scale(1.08) translateY(-2px);
  box-shadow:
    rgba(32, 0, 104, 0.22) 0px 10px 18px,
    rgba(32, 0, 104, 0.12) 0px 3px 6px;
}
/* En hover el glass sube a 0.55 en TODOS los tamaños (SVG hover) */
.plike:hover:not(.plike--disabled):not(.plike--skeleton):not(.plike--active)::before {
  background: linear-gradient(rgba(255, 255, 255, 0.55) 0%, transparent 50%);
}

/* Press */
.plike:active:not(.plike--disabled):not(.plike--skeleton) {
  transform: scale(0.92);
}

/* Focus ring */
.plike:focus-visible {
  outline: 2px solid #8460e5;
  outline-offset: 3px;
}

/* ── Sizes (Figma) ── */
.plike--sm { width: 24px; height: 24px; border-width: 2px;    padding: 2px; }
.plike--md { width: 32px; height: 32px; border-width: 1.44px; padding: 1.44px; }
.plike--lg { width: 40px; height: 40px; border-width: 2px;    padding: 2px; }

/* En sm el gradiente del borde invierte los 2 últimos stops (SVG 1136:11505) */
.plike--sm:not(.plike--active):not(.plike--disabled):not(.plike--skeleton) {
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, #e8ddff 0%, #ffffff 40%, #ae8eff 75%, #cfbaff 100%) border-box;
}

/* ── Active / liked — sync EXACTO SVG (1126:11427 sm / 1119:11380 md / 1119:11378 lg):
   bg morado + BORDE GRADIENTE naranja→lila + glow radial #AE8EFF + corazón blanco 0.92 */
.plike--active {
  background:
    linear-gradient(135deg, #8460e5 0%, #3b1782 100%) padding-box,
    linear-gradient(135deg, #fbc47d 0%, #ffffff 40%, #ae8eff 75%, #cfbaff 100%) border-box;
  border-color: transparent;
  filter: drop-shadow(0px 3px 12px rgba(132, 96, 229, 0.35));
  box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.22);
}

.plike--active::before {
  background: linear-gradient(
    rgba(255, 255, 255, 0.18) 0%,
    transparent 50%
  );
}

/* Glow radial morado del SVG (radial #AE8EFF, opacidad 0.35, difuminado) */
.plike--active::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 52%, rgba(174, 142, 255, 0.5) 0%, rgba(174, 142, 255, 0) 70%);
  pointer-events: none;
  z-index: 1;
}

/* Heart pop animation on toggle-to-active */
.plike--pop svg {
  animation: plike-heart-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 1;
}

/* ── Disabled ── */
.plike--disabled {
  cursor: not-allowed;
  background: var(--component-button-like-bg, #ffffff);
  border-color: transparent;
  box-shadow: none;
  filter: drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.10));
  pointer-events: none;
}
.plike--disabled::before { display: none; }

/* ── Skeleton ── */
.plike--skeleton {
  background: var(--color-background-disabled, #e1e3e2);
  border-color: transparent;
  box-shadow: none;
  filter: none;
  cursor: default;
  pointer-events: none;
  padding: 0;
  animation: plike-pulse 1.6s ease-in-out infinite;
}
.plike--skeleton::before { display: none; }

/* ── Reduced motion — siempre ── */
@media (prefers-reduced-motion: reduce) {
  .plike,
  .plike::before { transition: none; }
  .plike--pop svg { animation: none; }
  .plike--skeleton { animation: none; opacity: 0.55; }
}
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

const LikeButton = forwardRef<HTMLButtonElement, LikeButtonProps>(function LikeButton({
  size = "md",
  active: controlledActive,
  defaultActive = false,
  disabled = false,
  skeleton = false,
  onChange,
  onClick,
  style,
  "aria-label": ariaLabel = "Me gusta",
  className = "",
  ...rest
}, ref): JSX.Element {
  // Soporte controlado / no controlado
  const isControlled = controlledActive !== undefined;
  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = isControlled ? controlledActive : internalActive;

  // Trigger animación heart-pop al activar
  const [popping, setPopping] = useState(false);

  // Inyectar estilos una vez (SSR + CSR)
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = PLIKE_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (disabled || skeleton) return;
    const next = !isActive;
    if (!isControlled) setInternalActive(next);
    onChange?.(next);
    if (next) {
      setPopping(true);
      setTimeout(() => { setPopping(false); }, 420);
    }
  }, [isActive, isControlled, disabled, skeleton, onChange, onClick]);

  const { btn: btnPx, icon: iconPx, strokeW } = SIZE_MAP[size];

  const classes = [
    "plike",
    `plike--${size}`,
    isActive  ? "plike--active"   : "",
    disabled  ? "plike--disabled" : "",
    skeleton  ? "plike--skeleton" : "",
    popping   ? "plike--pop"      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // SVG fill/stroke según estado — default EXACTO de los SVG exports de Figma:
  // corazón BLANCO RELLENO con stroke #5A35C2 (no solo contorno).
  const svgFill   = isActive ? "rgba(255, 255, 255, 0.92)" : "#ffffff";
  // disabled: corazón outline gris #E1E3E2 exacto del SVG; active: blanco relleno sin stroke
  const svgStroke = disabled   ? "#e1e3e2"
                  : isActive   ? "none"
                  : "var(--vmc-color-vault-600, #5a35c2)";

  return (
    <>
      <style
        id={`${STYLE_ID}-ssr`}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: PLIKE_STYLES }}
      />
      <button
        ref={ref}
        type="button"
        {...rest}
        className={classes}
        onClick={handleClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        style={{ width: btnPx, height: btnPx, ...style }}
      >
        {!skeleton && (
          <svg
            width={iconPx}
            height={iconPx}
            viewBox="0 0 24 24"
            fill={svgFill}
            stroke={svgStroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={HEART_PATH} />
          </svg>
        )}
      </button>
    </>
  );
});

export default LikeButton;
