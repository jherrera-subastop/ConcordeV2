"use client";

/**
 * AuctionStatus — Generado por Concorde
 * Fuente: Figma VOYAGER · "AuctionStatus" (nodo 2007:16992 / 2007:18454)
 *
 * Barra de cabecera de subasta: botón volver (‹) + título + subtítulo,
 * sobre gradiente. 2 variantes:
 *   · live       → gradiente naranja (#FF9639 → #EF852E → #BE3D00)
 *   · negotiable → gradiente teal   (#00DAE0 → #008688)
 * Sheen blanco superior (rgba 0.1 → 0). 443×60.
 */

import type { JSX, MouseEventHandler } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuctionStatusVariant = "live" | "negotiable";

export interface AuctionStatusProps {
  /** Variante de color (default "live") */
  variant?: AuctionStatusVariant;
  /** Título (default "Volkswagen Gol 2015") */
  title?: string;
  /** Subtítulo (default "Vendedor: SubasCars") */
  subtitle?: string;
  /** Callback del botón volver */
  onBack?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-auctionstatus-styles";

const AUCTIONSTATUS_STYLES = `
.pauction {
  position: relative;
  width: 443px;
  max-width: 100%;
  height: 60px;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 0 14px;
  box-sizing: border-box;
  box-shadow: rgba(0,0,0,0.1) 0px 0px 16px 4px;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
.pauction--live { background: linear-gradient(156deg, #FF9639 0%, #EF852E 50%, #BE3D00 100%); }
.pauction--negotiable { background: linear-gradient(90deg, #00DAE0 0%, #008688 100%); }
.pauction::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 18px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}
.pauction__back {
  appearance: none;
  border: none;
  background: transparent;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  position: relative;
  z-index: 1;
  color: #ffffff;
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  transition: background 0.18s, color 0.18s, transform 0.12s;
}
/* hover: círculo relleno (tono claro), chevron blanco */
.pauction--live .pauction__back:hover { background: #F99845; }
.pauction--negotiable .pauction__back:hover { background: #2BC4C7; }
/* pressed: círculo tono base, chevron gris #99A1AF */
.pauction--live .pauction__back:active { background: #ED8936; }
.pauction--negotiable .pauction__back:active { background: #00A8AB; }
.pauction__back:active { color: #99A1AF; transform: scale(0.96); }
.pauction__back:focus-visible { outline: 2px solid rgba(255,255,255,0.9); outline-offset: 2px; }
.pauction__back svg path { stroke: currentColor; }
.pauction__back svg { filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.25)); }
.pauction__text { position: relative; z-index: 1; min-width: 0; }
.pauction__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 1.5px rgba(0,0,0,0.25);
}
.pauction__subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  color: rgba(255,255,255,0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(120,40,0,0.25);
}
@media (prefers-reduced-motion: reduce) {
  .pauction__back { transition: none; }
}
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuctionStatus({
  variant = "live",
  title = "Volkswagen Gol 2015",
  subtitle = "Vendedor: SubasCars",
  onBack,
  className = "",
}: AuctionStatusProps): JSX.Element {
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = AUCTIONSTATUS_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: AUCTIONSTATUS_STYLES }} />
      <div className={["pauction", `pauction--${variant}`, className].filter(Boolean).join(" ")}>
        <button type="button" className="pauction__back" onClick={onBack} aria-label="Volver">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="pauction__text">
          <h3 className="pauction__title">{title}</h3>
          <p className="pauction__subtitle">{subtitle}</p>
        </div>
      </div>
    </>
  );
}
