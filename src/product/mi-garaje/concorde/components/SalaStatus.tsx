"use client";

/**
 * SalaStatus — Generado por Concorde
 * Fuente: Figma VOYAGER · "Sala status" (443×90)
 *
 * Barra de cabecera de sala (443×90): gradiente naranja→morado, borde gradiente
 * y sombra. Izquierda: vehículo + año + placa. Derecha: label + TimerIcon +
 * countdown (mono). Usa el componente TimerIcon. Editable por props.
 */

import type { JSX } from "react";
import TimerIcon from "./TimerIcon";

export interface SalaStatusProps {
  /** Nombre del vehículo (default "Toyota Etios") */
  title?: string;
  /** Año (default "2021") */
  year?: string;
  /** Etiqueta de placa (default "Placa") */
  placaLabel?: string;
  /** Placa (default "P3U448") */
  placa?: string;
  /** Etiqueta del timer (default "INICIÓ HACE") */
  timerLabel?: string;
  /** Tiempo / countdown (default "00:00:10") */
  time?: string;
  className?: string;
}

const STYLE_ID = "concorde-salastatus-styles";

const SALASTATUS_STYLES = `
.psala {
  position: relative;
  box-sizing: border-box;
  width: 443px;
  max-width: 100%;
  height: 90px;
  background: linear-gradient(120deg, #F4AC59 0%, #ED8936 40%, #8460E5 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 20px;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
  overflow: hidden;
}
/* Sheen superior */
.psala::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 45%);
  pointer-events: none;
}
.psala__left { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.psala__title { font-size: 20px; font-weight: 800; line-height: 1.1; color: #ffffff; white-space: nowrap; }
.psala__title-year { font-weight: 600; color: rgba(255,255,255,0.72); margin-left: 6px; }
.psala__placa { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85); white-space: nowrap; }
.psala__placa-val { font-weight: 700; color: #ffffff; margin-left: 6px; }
.psala__right { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
.psala__timer-label {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: rgba(255,255,255,0.85);
}
.psala__time {
  font-family: var(--vmc-font-mono, "Roboto Mono", ui-monospace, monospace);
  font-size: 22px; font-weight: 700; line-height: 1; color: #ffffff;
  font-variant-numeric: tabular-nums; letter-spacing: 0.02em;
}
`;

let _stylesInjected = false;

export default function SalaStatus({
  title = "Toyota Etios",
  year = "2021",
  placaLabel = "Placa",
  placa = "P3U448",
  timerLabel = "INICIÓ HACE",
  time = "00:00:10",
  className = "",
}: SalaStatusProps): JSX.Element {
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = SALASTATUS_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SALASTATUS_STYLES }} />
      <div className={`psala ${className}`.trim()}>
        <div className="psala__left">
          <span className="psala__title">
            {title}
            {year ? <span className="psala__title-year">{year}</span> : null}
          </span>
          <span className="psala__placa">
            {placaLabel}
            {placa ? <span className="psala__placa-val">{placa}</span> : null}
          </span>
        </div>
        <div className="psala__right">
          <span className="psala__timer-label">
            <TimerIcon size={16} color="rgba(255,255,255,0.85)" />
            {timerLabel}
          </span>
          <span className="psala__time">{time}</span>
        </div>
      </div>
    </>
  );
}
