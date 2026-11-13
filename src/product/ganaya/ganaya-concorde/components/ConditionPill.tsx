"use client";

/**
 * ConditionPill — Generado por Concorde
 * Fuente: Figma VOYAGER · "ConditionPill" (nodo 3023:1638)
 *
 * Píldora 136×46 (radio 23) con relleno gradiente lila (#AE8EFF → #5A35C2),
 * borde gradiente (#CFBAFF → white → #AE8EFF → #CFBAFF), sheen blanco superior,
 * sombra externa gris (0 4px 6px) e inner highlight blanco. Texto blanco
 * centrado y editable (children). El ancho se ajusta al contenido.
 */

import type { JSX, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConditionPillProps {
  /** Texto dentro de la píldora (editable) */
  children?: ReactNode;
  /** "filled" = lila (condición activa, p.ej. «Con…»). "outline" = blanca con
   *  texto gris (condición no incluida, p.ej. «Sin…»). Default "filled". */
  variant?: "filled" | "outline";
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-conditionpill-styles";

const CONDITIONPILL_STYLES = `
.pcondpill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 6px 28px;
  border-radius: 23px;
  border: 2px solid transparent;
  overflow: hidden;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  color: #ffffff;
  text-shadow: rgba(0,0,0,0.25) 0px 1px 3px;
  /* Relleno gradiente (#AE8EFF → #5A35C2) + borde gradiente (#CFBAFF → white → #AE8EFF → #CFBAFF) */
  background-image:
    linear-gradient(225deg, #AE8EFF 0%, #5A35C2 100%),
    linear-gradient(130deg, #CFBAFF 0%, #ffffff 35%, #AE8EFF 65%, #CFBAFF 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: rgba(153,161,175,0.3) 0px 4px 6px, inset 0px 1px 0px rgba(255,255,255,0.15);
}
/* Sheen blanco superior (paint2 del SVG: white 0.17 → 0) */
.pcondpill::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 23px;
  background: linear-gradient(180deg, rgba(255,255,255,0.17) 0%, rgba(255,255,255,0) 55%);
  pointer-events: none;
  z-index: 0;
}
.pcondpill__text {
  position: relative;
  z-index: 1;
}
/* Variante outline: blanca, texto gris, sombra suave (condición NO incluida) */
.pcondpill--outline {
  background-image: none;
  background-color: #ffffff;
  color: #9AA1AC;
  text-shadow: none;
  box-shadow: rgba(153,161,175,0.3) 0px 4px 8px;
}
.pcondpill--outline::before { display: none; }
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConditionPill({ children = "Etiqueta", variant = "filled", className = "" }: ConditionPillProps): JSX.Element {
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = CONDITIONPILL_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: CONDITIONPILL_STYLES }} />
      <span className={["pcondpill", variant === "outline" ? "pcondpill--outline" : "", className].filter(Boolean).join(" ")}>
        <span className="pcondpill__text">{children}</span>
      </span>
    </>
  );
}
