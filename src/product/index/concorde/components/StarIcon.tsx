"use client";

/**
 * StarIcon — Generado por Concorde
 * Fuente: Figma VOYAGER · "StarIcons" (nodo 2035:16598)
 *
 * Insignia de estrella 28×28: círculo con relleno gradiente naranja→lila
 * (#ED8936 → #8460E5), borde gradiente (white → #FBC47D → #AE8EFF → white) y
 * estrella blanca. Drop shadow naranja + inner shadow blanco (del filtro Figma).
 * Tamaño personalizable: "sm" (20px) · "md" (28px) · o número de px.
 */

import { useId } from "react";
import type { JSX } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StarIconSize = "sm" | "md";

export interface StarIconProps {
  /** Tamaño: "sm"=20px · "md"=28px · o número de px (default "md") */
  size?: StarIconSize | number;
  /** Texto accesible — si se omite, el ícono es decorativo (aria-hidden) */
  title?: string;
  className?: string;
}

const SIZE_PX: Record<StarIconSize, number> = { sm: 20, md: 28 };

// ─── Component ────────────────────────────────────────────────────────────────

export default function StarIcon({ size = "md", title, className = "" }: StarIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const px = typeof size === "number" ? size : SIZE_PX[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <g filter={`url(#${uid}-f)`}>
        <path
          d="M6 12C6 7.58172 9.58172 4 14 4V4C18.4183 4 22 7.58172 22 12V12C22 16.4183 18.4183 20 14 20V20C9.58172 20 6 16.4183 6 12V12Z"
          fill={`url(#${uid}-bg)`}
          shapeRendering="crispEdges"
        />
        <path
          d="M14 4.59961C18.0869 4.59961 21.4004 7.91309 21.4004 12C21.4004 16.0869 18.0869 19.4004 14 19.4004C9.91309 19.4004 6.59961 16.0869 6.59961 12C6.59961 7.91309 9.91309 4.59961 14 4.59961Z"
          stroke={`url(#${uid}-bd)`}
          strokeWidth="1.2"
          shapeRendering="crispEdges"
        />
        <path
          d="M14 7L15.236 9.63302L18 10.0578L16 12.1062L16.472 15L14 13.633L11.528 15L12 12.1062L10 10.0578L12.764 9.63302L14 7Z"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter id={`${uid}-f`} x="0" y="0" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.929412 0 0 0 0 0.537255 0 0 0 0 0.211765 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect2_innerShadow" />
          <feOffset dy="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.28 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
        </filter>
        <linearGradient id={`${uid}-bg`} x1="6" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ED8936" />
          <stop offset="0.4" stopColor="#ED8936" />
          <stop offset="1" stopColor="#8460E5" />
        </linearGradient>
        <linearGradient id={`${uid}-bd`} x1="6" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="0.25" stopColor="#FBC47D" />
          <stop offset="0.75" stopColor="#AE8EFF" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
      </defs>
    </svg>
  );
}
