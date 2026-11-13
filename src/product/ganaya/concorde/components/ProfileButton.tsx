"use client";

/**
 * ProfileButton — Generado por Concorde
 * Fuente: Figma VOYAGER · "ProfileButton" (Status=Default|Hover|Pressed)
 * Nodos: 1274:5029 (default) · 1274:3989 (hover) · 1287:5144 (pressed)
 * Sincronizado: 2026-06-12
 *
 * Botón de navegación a perfil: label morado + círculo con chevron.
 * Figma manda en lo visual (colores/dimensiones); Concorde manda en la interacción
 * (transición de relleno + lift en hover, reduced-motion).
 */

import type { JSX, MouseEventHandler, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileButtonProps {
  /** Label (default: "Ir al Perfil") */
  children?: ReactNode;
  /** Si se pasa, renderiza un <a> en vez de <button> */
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-profilebutton-styles";

const PROFILEBUTTON_STYLES = `
.pprofilebtn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

/* Label — default morado #3B1782 (Figma text fill) */
.pprofilebtn__label {
  color: #3b1782;
  transition: color 0.2s ease;
}

/* Círculo 16px con chevron. color = color del chevron (currentColor) */
.pprofilebtn__circle {
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #ef852e;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.25s ease,
    transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
/* Default: anillo gradiente naranja 1.5px (stroke #FF9C3B → #EF852E 40% → #BE3D00) — mask */
.pprofilebtn__circle::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(135deg, #ff9c3b 0%, #ef852e 40%, #be3d00 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.pprofilebtn__chevron {
  position: relative;
  z-index: 1;
  display: block;
}

/* ── Hover: círculo RELLENO naranja + sombra, chevron blanco, lift ── */
.pprofilebtn:hover:not(:disabled) .pprofilebtn__circle {
  background: linear-gradient(90deg, #ff9639 0%, #ef852e 40%, #be3d00 100%);
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
.pprofilebtn:hover:not(:disabled) .pprofilebtn__circle::before { opacity: 0; }

/* ── Pressed: texto + chevron gris #99A1AF, círculo naranja oscuro #B25614 → #93420A ── */
.pprofilebtn:active:not(:disabled) .pprofilebtn__label { color: #99a1af; }
.pprofilebtn:active:not(:disabled) .pprofilebtn__circle {
  background: linear-gradient(90deg, #b25614 0%, #93420a 100%);
  color: #99a1af;
  box-shadow: none;
  transform: translateY(0);
}
.pprofilebtn:active:not(:disabled) .pprofilebtn__circle::before { opacity: 0; }

/* ── Focus ── */
.pprofilebtn:focus-visible {
  outline: none;
  border-radius: 8px;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #8460e5;
}

/* ── Disabled ── */
.pprofilebtn:disabled {
  cursor: not-allowed;
}
.pprofilebtn:disabled .pprofilebtn__label { color: #99a1af; }
.pprofilebtn:disabled .pprofilebtn__circle {
  background: #e1e3e2;
  color: #ffffff;
}
.pprofilebtn:disabled .pprofilebtn__circle::before { opacity: 0; }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .pprofilebtn__label,
  .pprofilebtn__circle,
  .pprofilebtn__circle::before { transition: none; }
  .pprofilebtn:hover:not(:disabled) .pprofilebtn__circle { transform: none; }
}
`;

let _stylesInjected = false;

// ─── Chevron (M83 22 L87 19 L83 16 normalizado a viewBox 16×16, centro 8,8) ─────

function Chevron(): JSX.Element {
  return (
    <svg
      className="pprofilebtn__chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 11L10 8L6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileButton({
  children = "Ir al Perfil",
  href,
  onClick,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: ProfileButtonProps): JSX.Element {
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = PROFILEBUTTON_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const classes = ["pprofilebtn", className].filter(Boolean).join(" ");

  const inner = (
    <>
      <span className="pprofilebtn__label">{children}</span>
      <span className="pprofilebtn__circle" aria-hidden="true">
        <Chevron />
      </span>
    </>
  );

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: PROFILEBUTTON_STYLES }} />
      {href && !disabled ? (
        <a className={classes} href={href} onClick={onClick} aria-label={ariaLabel}>
          {inner}
        </a>
      ) : (
        <button type="button" className={classes} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
          {inner}
        </button>
      )}
    </>
  );
}
