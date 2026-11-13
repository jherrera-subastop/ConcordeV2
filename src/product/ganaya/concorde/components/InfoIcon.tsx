"use client";

/**
 * InfoIcon — Generado por Concorde
 * Fuente: Figma VOYAGER · "InfoIcon Outline" (nodo 2035:16600)
 *
 * Ícono de información ⓘ 16×16: círculo + «i» con trazo gradiente naranja→lila
 * (#ED8936 → #8460E5, vector 2,3.36 → 14,12.64). Tamaño personalizable.
 * El id del gradiente se aísla con useId para no colisionar entre instancias.
 */

import { useId } from "react";
import type { JSX } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InfoIconProps {
  /** Ancho y alto en px (default 16). */
  size?: number;
  /** Texto accesible — si se omite, el ícono es decorativo (aria-hidden). */
  title?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InfoIcon({ size = 16, title, className = "" }: InfoIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M7.5 7.5L7.52733 7.48667C7.61282 7.44396 7.70875 7.42664 7.80378 7.43677C7.8988 7.4469 7.98893 7.48404 8.0635 7.54381C8.13806 7.60357 8.19394 7.68345 8.22451 7.77399C8.25508 7.86453 8.25907 7.96193 8.236 8.05467L7.764 9.94533C7.74076 10.0381 7.74463 10.1356 7.77513 10.2263C7.80563 10.3169 7.86149 10.3969 7.93609 10.4568C8.01069 10.5166 8.10089 10.5538 8.196 10.564C8.2911 10.5741 8.38712 10.5568 8.47267 10.514L8.5 10.5M14 8C14 8.78793 13.8448 9.56815 13.5433 10.2961C13.2417 11.0241 12.7998 11.6855 12.2426 12.2426C11.6855 12.7998 11.0241 13.2417 10.2961 13.5433C9.56815 13.8448 8.78793 14 8 14C7.21207 14 6.43185 13.8448 5.7039 13.5433C4.97595 13.2417 4.31451 12.7998 3.75736 12.2426C3.20021 11.6855 2.75825 11.0241 2.45672 10.2961C2.15519 9.56815 2 8.78793 2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.5913 2 11.1174 2.63214 12.2426 3.75736C13.3679 4.88258 14 6.4087 14 8ZM8 5.5H8.00533V5.50533H8V5.5Z"
        stroke={`url(#${uid}-g)`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={`${uid}-g`} x1="2" y1="3.35944" x2="14" y2="12.6406" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ED8936" />
          <stop offset="0.4" stopColor="#ED8936" />
          <stop offset="1" stopColor="#8460E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
