/**
 * TimerIcon — Generado por Concorde
 * Fuente: Figma VOYAGER · "timericon" (3201)
 *
 * Icono de temporizador/reloj (22×22), trazo redondeado 1.83. Copia exacta del
 * path del SVG. Tamaño y color personalizables (default currentColor).
 */

import type { JSX } from "react";

export interface TimerIconProps {
  /** Tamaño en px (default 22) */
  size?: number;
  /** Color del trazo (default "currentColor") */
  color?: string;
  /** Texto accesible. Si se omite, es decorativo (aria-hidden). */
  title?: string;
  className?: string;
}

export default function TimerIcon({ size = 22, color = "currentColor", title, className = "" }: TimerIconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M4.63973 10C5.09082 6.38255 8.17668 3.58333 11.9163 3.58333C15.9664 3.58333 19.2496 6.86658 19.2496 10.9167C19.2496 14.9668 15.9664 18.25 11.9163 18.25H7.33333M11.9167 10.9167V7.25M10.0833 1.75H13.75M2.75 12.75H7.33333M4.58333 15.5H9.16667"
        stroke={color}
        strokeWidth="1.83333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
