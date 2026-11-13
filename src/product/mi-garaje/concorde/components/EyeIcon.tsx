/**
 * EyeIcon — Generado por Concorde
 *
 * Ícono de mostrar/ocultar contraseña: ojo abierto (contraseña oculta) u ojo
 * tachado (contraseña visible). Usado por los campos de contraseña de Login
 * y PersonalDataCard — antes duplicado en ambos, ahora un solo componente.
 */

import type { JSX } from "react";

export interface EyeIconProps {
  /** true = ícono de "ojo tachado" (la contraseña está visible; click para ocultarla) */
  off?: boolean;
  size?: number;
  className?: string;
}

export default function EyeIcon({ off = false, size = 20, className = "" }: EyeIconProps): JSX.Element {
  if (off) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.83 2.83" />
        <path d="M9.4 5.5A9.7 9.7 0 0 1 12 5c5 0 8.7 3.5 10 7-0.6 1.5-1.6 3-2.9 4.2M6.3 6.9C4.2 8.2 2.7 10 2 12c1.3 3.5 5 7 10 7 1.1 0 2.1-0.16 3-0.46" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 12c1.3-3.5 5-7 10-7s8.7 3.5 10 7c-1.3 3.5-5 7-10 7s-8.7-3.5-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
