"use client";

/**
 * OfferType — Generado por Concorde
 * Fuente: https://voyager-ds.vercel.app/preview/components/pase1
 * Generado: 2026-05-28
 * EDITAR LIBREMENTE después de generar
 */

import type { JSX } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OfferTypeVariant = "negotiable" | "live";

export interface OfferTypeProps {
  /** Variante: "negotiable" = teal NEGOCIABLE · "live" = orange EN VIVO */
  variant: OfferTypeVariant;
  /** Texto del header (por defecto: NEGOCIABLE / EN VIVO) */
  label?: string;
  /** Texto del CTA inferior (por defecto: VER TODAS) */
  ctaLabel?: string;
  /** Callback al hacer click */
  onClick?: () => void;
  /** Aria label accesible */
  "aria-label"?: string;
  className?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const LABEL_DEFAULTS: Record<OfferTypeVariant, string> = {
  negotiable: "RECIBE OFERTAS",
  live:       "EN VIVO",
};

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-poftype-styles";

const POFTYPE_STYLES = `
.poftype {
  width: 110px;
  border-radius: var(--vmc-radius-md, 8px);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  box-shadow:
    oklch(0 0 0 / 0.12) 0px 4px 16px,
    oklch(0 0 0 / 0.06) 0px 1px 4px;
  transition:
    transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.25s;
  transform: translateZ(0);
  outline: none;
  background: none;
  border: none;
  padding: 0;
  display: block;
  text-align: left;
}

/* ── Top (colored section) ── */
.poftype-top {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: background 0.22s;
}

/* Top glass highlight */
.poftype-top::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(oklch(1 0 0 / 0.07) 0%, transparent 60%);
  pointer-events: none;
  z-index: 1;
}

/* Top bottom edge shadow */
.poftype-top::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(transparent 0%, oklch(0 0 0 / 0.08) 100%);
  pointer-events: none;
  z-index: 1;
}

/* ── Label ── */
.poftype-label {
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", system-ui, sans-serif);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: oklch(1 0 0);
  text-shadow: oklch(0 0 0 / 0.25) 0px 1px 3px;
  position: relative;
  z-index: 2;
}

/* ── Bottom (white CTA section) ── */
.poftype-bottom {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(1 0 0);
}

/* ── CTA text ── */
.poftype-cta {
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", system-ui, sans-serif);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.22s;
}

/* ── NEGOTIABLE — sync EXACTO SVG (1159:5710 / 5740 / 5928) ──
   header teal horizontal · footer #FFFAFC · CTA #009699 · ring teal */
.poftype--negotiable {
  box-shadow:
    rgba(0, 210, 211, 0.4) 0px 0px 0px 1.5px,
    rgba(0, 0, 0, 0.1) 0px 4px 14px,
    rgba(0, 0, 0, 0.06) 0px 1px 4px;
}

.poftype--negotiable .poftype-top {
  background: linear-gradient(90deg, #00edee 0%, #00d2d3 50%, #009597 100%);
}

.poftype--negotiable .poftype-bottom {
  background: #fffafc;
}

.poftype--negotiable .poftype-cta {
  color: #009699;
}

.poftype--negotiable:hover {
  box-shadow:
    rgba(0, 210, 211, 0.55) 0px 0px 0px 1.5px,
    rgba(32, 0, 104, 0.11) 0px 10px 18px,
    rgba(32, 0, 104, 0.08) 0px 3px 7px,
    rgba(32, 0, 104, 0.05) 0px 1px 2px;
}

/* Pressed: header teal oscuro (SVG 1159:5928) */
.poftype--negotiable:active .poftype-top {
  background: linear-gradient(180deg, #00adaf 0%, #008c8e 100%);
}

/* ── LIVE / EN VIVO — sync EXACTO SVG (1159:5690 / 5884 / 1177:5972) ──
   header naranja diagonal · footer #FFF8FA · CTA #BE3E00 · ring naranja */
.poftype--live {
  box-shadow:
    rgba(239, 133, 46, 0.4) 0px 0px 0px 1.5px,
    rgba(0, 0, 0, 0.1) 0px 4px 14px,
    rgba(0, 0, 0, 0.06) 0px 1px 4px;
}

.poftype--live .poftype-top {
  background: linear-gradient(120deg, #ff9639 0%, #ef852e 50%, #be3d00 100%);
}

.poftype--live .poftype-bottom {
  background: #fff8fa;
}

.poftype--live .poftype-cta {
  color: #be3e00;
}

/* Live hover: el SVG mantiene el ring naranja 0.4 (sin drops extra); el lift lo da el transform */

/* Pressed: header naranja oscuro (SVG 1177:5972) */
.poftype--live:active .poftype-top {
  background: linear-gradient(180deg, #ce4900 0%, #ac3500 100%);
}

/* ── Hover (shared) ── */
.poftype:hover:not(.poftype--focus):not(:active) {
  transform: translateY(-4px) scale(1.015);
}

.poftype:hover .poftype-top::before {
  background: linear-gradient(oklch(1 0 0 / 0.26) 0%, transparent 50%);
}

/* ── Focus/pressed (shared) ── */
.poftype:active,
.poftype--focus {
  opacity: 0.58 !important;
  transform: scale(0.97) !important;
  box-shadow:
    oklch(0 0 0 / 0.1) 0px 2px 8px,
    oklch(0 0 0 / 0.12) 0px 2px 6px inset !important;
}

/* ── Keyboard focus ring (WCAG) ── */
.poftype:focus-visible {
  outline: 2px solid var(--vmc-color-vault-400, oklch(0.62 0.20 285));
  outline-offset: 3px;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .poftype,
  .poftype-top,
  .poftype-cta { transition: none; }
}
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OfferType({
  variant,
  label,
  ctaLabel = "VER TODAS",
  onClick,
  "aria-label": ariaLabel,
  className = "",
}: OfferTypeProps): JSX.Element {
  const displayLabel = label ?? LABEL_DEFAULTS[variant];

  // Inyectar estilos una vez (SSR + CSR)
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = POFTYPE_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const classes = [
    "poftype",
    `poftype--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <style
        id={`${STYLE_ID}-ssr`}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: POFTYPE_STYLES }}
      />
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel ?? `${displayLabel} — ${ctaLabel}`}
      >
        <div className="poftype-top">
          <span className="poftype-label">{displayLabel}</span>
        </div>
        <div className="poftype-bottom">
          <span className="poftype-cta">{ctaLabel}</span>
        </div>
      </button>
    </>
  );
}
