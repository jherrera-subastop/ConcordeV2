/**
 * CheckIcon — Generado por Concorde
 * Fuente: Figma VOYAGER · "Vector" (1435:12195)
 *
 * Círculo relleno con gradiente naranja (#FF9639 → #EF852E → #BE3D00) y un
 * check recortado (knockout) que se ve blanco sobre superficies claras.
 * Copia exacta del path del SVG. Tamaño personalizable como PriceIcon.
 */

import { useId } from "react";
import type { JSX } from "react";

export interface CheckIconProps {
  /** Tamaño en px o alias: "sm" (16) · "md" (20). Default 20. */
  size?: "sm" | "md" | number;
  /** Texto accesible. Si se omite, el icono es decorativo (aria-hidden). */
  title?: string;
  className?: string;
}

const SIZES: Record<"sm" | "md", number> = { sm: 16, md: 20 };

export default function CheckIcon({ size = 20, title, className = "" }: CheckIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const gradId = `checkicon-grad-${uid}`;
  const px = typeof size === "number" ? size : SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM8.7785 10.7609L6.73408 8.7093C6.34797 8.3249 5.68605 8.3249 5.29993 8.7093L4.50011 9.5057C4.114 9.8901 4.114 10.5492 4.50011 10.9336L8.0028 14.4485C8.2424 14.6871 8.5882 14.7776 8.9085 14.72C9.2105 14.7794 9.5356 14.6817 9.7613 14.427L15.5149 7.96363C15.881 7.55044 15.881 6.84213 15.5149 6.42895L14.7564 5.57307C14.3903 5.15989 13.7627 5.15989 13.3965 5.57307L8.7785 10.7609Z"
        fill={`url(#${gradId})`}
      />
      <defs>
        <linearGradient id={gradId} x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9639" />
          <stop offset="0.4" stopColor="#EF852E" />
          <stop offset="1" stopColor="#BE3D00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
