"use client";

/**
 * Accordion — Generado por Concorde
 * Fuente: Figma VOYAGER · "DetailAccordions" (2007:16995)
 *
 * Card blanca (radio 4, sombra) con título (corchetes naranjas vía CardTitle,
 * editable) y un chevron en círculo naranja a la derecha. El chevron gira:
 *   · cerrado → apunta hacia abajo
 *   · abierto → apunta hacia arriba (rotate 180)
 * El contenido se expande/colapsa. Controlado o no controlado.
 * Paths/gradiente del chevron copiados tal cual del SVG.
 */

import { useId, useState } from "react";
import type { JSX, ReactNode } from "react";
import CardTitle from "./CardTitle";

export interface AccordionProps {
  /** Título (editable) — default "INFORMACIÓN GENERAL". Acepta texto o nodos (p.ej. un dot + texto). */
  title?: ReactNode;
  /** Contenido que se expande/colapsa */
  children?: ReactNode;
  /** Abierto (controlado) */
  open?: boolean;
  /** Abierto inicial (no controlado) — default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Tamaño del título en px (default 14) */
  titleSize?: number;
  className?: string;
}

const STYLE_ID = "concorde-accordion-styles";

const ACCORDION_STYLES = `
/* La card BLANCA + sombra + redondeo envuelven TODO (header + contenido), así el
   contenido abierto queda sobre fondo blanco dentro de la misma card. */
.pacc {
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,0.1) 0px 0px 16px 4px;
  overflow: hidden;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
.pacc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 66px;
  box-sizing: border-box;
  padding: 0 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}
/* Divisor entre header y contenido — solo visible cuando está abierto */
.pacc--open .pacc__header { box-shadow: inset 0 -1px 0 #ECECEE; }
.pacc__chevron {
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.3, 0, 0, 1);
}
.pacc--open .pacc__chevron { transform: rotate(180deg); }
.pacc__content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.pacc--open .pacc__content { grid-template-rows: 1fr; }
.pacc__content-inner { overflow: hidden; }
.pacc__content-pad {
  padding: 16px 18px 18px;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
@media (prefers-reduced-motion: reduce) {
  .pacc__chevron, .pacc__content { transition: none; }
}
`;

let _stylesInjected = false;

// ─── Chevron en círculo (gradiente naranja · copiado del SVG) ───────────────

function Chevron({ gradId }: { gradId: string }): JSX.Element {
  return (
    <svg className="pacc__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.25" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      <path d="M5 6.5L8 10.5L11 6.5" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id={gradId} x1="0.667" y1="-0.333" x2="18.94" y2="17.94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4AC59" />
          <stop offset="0.4" stopColor="#ED8936" />
          <stop offset="1" stopColor="#B25614" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Accordion({
  title = "INFORMACIÓN GENERAL",
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  titleSize = 14,
  className = "",
}: AccordionProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const controlled = open !== undefined;
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = controlled ? open : internal;

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = ACCORDION_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  function handleToggle(): void {
    const next = !isOpen;
    if (!controlled) setInternal(next);
    onOpenChange?.(next);
  }

  const cls = ["pacc", isOpen ? "pacc--open" : "", className].filter(Boolean).join(" ");

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ACCORDION_STYLES }} />
      <div className={cls}>
        <button
          type="button"
          className="pacc__header"
          aria-expanded={isOpen}
          aria-controls={`${uid}-panel`}
          onClick={handleToggle}
        >
          <CardTitle title={title} subtitle="" titleSize={titleSize} />
          <Chevron gradId={`pacc-grad-${uid}`} />
        </button>
        <div className="pacc__content" id={`${uid}-panel`} role="region">
          <div className="pacc__content-inner">
            <div className="pacc__content-pad">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
