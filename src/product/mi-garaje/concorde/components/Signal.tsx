/**
 * Signal — Generado por Concorde
 * Fuente: Figma VOYAGER · "hdr-signal1" (3143:13306)
 *
 * Indicador de señal: 5 barras crecientes (rx1). Las activas con gradiente
 * naranja (#F4AC59 → #ED8936 → #B25614), las inactivas en blanco 20%.
 * `level` (0-5) controla cuántas están activas (default 4). Copia exacta de los
 * paths del SVG. useId para id único.
 */

import { useId } from "react";
import type { JSX } from "react";

export type SignalVariant = "orange" | "white";

export interface SignalProps {
  /** Barras activas (0-5) — default 4 */
  level?: number;
  /** Ancho en px (alto = width × 16/28 si no se pasa `height`) — default 28 */
  width?: number;
  /** Alto en px (override; si se omite, se calcula desde width) */
  height?: number;
  /** Color de las barras activas: "orange" (gradiente) o "white" (sólido). Default "orange". */
  variant?: SignalVariant;
  /** Texto accesible. Si se omite, es decorativo (aria-hidden). */
  title?: string;
  className?: string;
}

const BARS = [
  "M3 12H1C0.447715 12 0 12.4477 0 13V15C0 15.5523 0.447715 16 1 16H3C3.55228 16 4 15.5523 4 15V13C4 12.4477 3.55228 12 3 12Z",
  "M9 9H7C6.44772 9 6 9.44772 6 10V15C6 15.5523 6.44772 16 7 16H9C9.55228 16 10 15.5523 10 15V10C10 9.44772 9.55228 9 9 9Z",
  "M15 6H13C12.4477 6 12 6.44772 12 7V15C12 15.5523 12.4477 16 13 16H15C15.5523 16 16 15.5523 16 15V7C16 6.44772 15.5523 6 15 6Z",
  "M21 3H19C18.4477 3 18 3.44772 18 4V15C18 15.5523 18.4477 16 19 16H21C21.5523 16 22 15.5523 22 15V4C22 3.44772 21.5523 3 21 3Z",
  "M27 0H25C24.4477 0 24 0.447715 24 1V15C24 15.5523 24.4477 16 25 16H27C27.5523 16 28 15.5523 28 15V1C28 0.447715 27.5523 0 27 0Z",
];

export default function Signal({ level = 4, width = 28, height: heightProp, variant = "orange", title, className = "" }: SignalProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const gid = `signal-grad-${uid}`;
  const height = heightProp ?? (width * 16) / 28;
  const activeFill = variant === "white" ? "#ffffff" : `url(#${gid})`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 28 16"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {BARS.map(function renderBar(d, i) {
        const active = i < level;
        return <path key={i} d={d} fill={active ? activeFill : "rgba(255,255,255,0.2)"} />;
      })}
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F4AC59" />
          <stop offset="0.4" stopColor="#ED8936" />
          <stop offset="1" stopColor="#B25614" />
        </linearGradient>
      </defs>
    </svg>
  );
}
