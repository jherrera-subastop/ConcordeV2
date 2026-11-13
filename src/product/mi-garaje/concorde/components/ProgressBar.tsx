"use client";

/**
 * ProgressBar — Generado por Concorde
 * Fuente: Figma VOYAGER · "Progressbar - Tiempo de bid" (3182:12947)
 *
 * Barra de progreso (track hundido): top recto, esquinas inferiores redondeadas
 * (radio 13), fondo negro 22% con inner-shadows. El relleno (`value` 0-100) usa
 * la gradiente primary (white → #F4AC59 → #8460E5 → white · VYStrokes1). Copia
 * del SVG. Solo `value` — sin estilos editables.
 */

import type { JSX } from "react";

export type ProgressBarVariant = "default" | "rainbow" | "white";

export interface ProgressBarProps {
  /** Progreso 0-100 (default 60) */
  value?: number;
  /** Relleno: "default" (gradiente primary), "rainbow" (white→magenta→rosa) o "white" (blanco sólido). Default "default". */
  variant?: ProgressBarVariant;
  /**
   * Duración (ms) de la transición de ancho al cambiar `value`. Si se omite usa
   * la del CSS (0.3s). Útil para animar un llenado continuo (p. ej. 3000ms lineal).
   */
  transitionMs?: number;
  "aria-label"?: string;
  className?: string;
}

const STYLE_ID = "concorde-progressbar-styles";

const PROGRESSBAR_STYLES = `
.pprogbar {
  position: relative;
  width: 100%;
  height: 22px;
  border-radius: 0 0 13px 13px;
  overflow: hidden;
  background: rgba(0,0,0,0.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), inset 0 2px 4px rgba(0,0,0,0.35);
}
.pprogbar__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(135deg, #FFFFFF 0%, #F4AC59 22%, #8460E5 74.5%, #FFFFFF 100%);
  transition: width 0.3s cubic-bezier(0.3,0,0,1);
}
/* Rainbow horizontal (no diagonal): white → lila → magenta → rosa */
.pprogbar__fill--rainbow {
  background: linear-gradient(90deg, #FFFFFF 0%, #F2CCFF 25%, #CC00FF 60%, #FF0066 100%);
  box-shadow: 0 0 6px rgba(255,255,255,0.8), 0 0 14px rgba(204,0,255,0.9), 0 0 30px rgba(255,0,102,0.5);
}
/* Blanco sólido (fases de carga: recibiendo participantes / inicio extendido) */
.pprogbar__fill--white {
  background: #ffffff;
  box-shadow: 0 0 6px rgba(255,255,255,0.7);
}
@media (prefers-reduced-motion: reduce) { .pprogbar__fill { transition: none; } }
`;

let _stylesInjected = false;

export default function ProgressBar({
  value = 60,
  variant = "default",
  transitionMs,
  "aria-label": ariaLabel,
  className = "",
}: ProgressBarProps): JSX.Element {
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = PROGRESSBAR_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const clamped = Math.max(0, Math.min(100, value));

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: PROGRESSBAR_STYLES }} />
      <div
        className={`pprogbar ${className}`.trim()}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? "Tiempo de bid"}
      >
        <div
          className={`pprogbar__fill ${variant !== "default" ? `pprogbar__fill--${variant}` : ""}`.trim()}
          style={{ width: `${clamped}%`, ...(transitionMs != null ? { transition: `width ${transitionMs}ms linear` } : {}) }}
        />
      </div>
    </>
  );
}
