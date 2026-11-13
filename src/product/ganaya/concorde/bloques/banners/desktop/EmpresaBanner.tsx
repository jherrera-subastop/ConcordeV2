/**
 * EmpresaBanner — 766×192 · banner de página de empresa/vendedor.
 * Usa el ASSET REAL de producción (public/banners/empresa.png, 1532×384 = 2×:
 * personaje + círculo del logo + cajas Ventas/Participantes vacías) y sobrepone
 * el texto en las coordenadas del asset. Estático, sin efectos.
 *
 * Nota: usa el alto NATURAL del asset (192, no 272) para que las coordenadas
 * del PNG coincidan sin recortar la parte derecha (cajas de stats).
 */

import type { JSX } from "react";
import { BANNER_WIDTH, BANNER_HEIGHT } from "./dimensions";

export const EMPRESA_WIDTH = BANNER_WIDTH;    // 766
export const EMPRESA_HEIGHT = BANNER_HEIGHT;  // 192 — alto natural del asset

export interface EmpresaBannerProps {
  nombre: string;
  /** Texto dentro del círculo morado del logo (default: nombre) */
  logoText?: string;
  rating: string;
  ratingLabel: string;
  opiniones: string;
  descripcion: string;
  ventas: string;
  participantes: string;
  className?: string;
}

function Star(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 1.8 L15.1 8.3 L22.2 9.2 L17 14.1 L18.3 21.2 L12 17.7 L5.7 21.2 L7 14.1 L1.8 9.2 L8.9 8.3 Z" fill="#F5B01E" />
    </svg>
  );
}

export default function EmpresaBanner({
  nombre,
  logoText,
  rating,
  ratingLabel,
  opiniones,
  descripcion,
  ventas,
  participantes,
  className = "",
}: EmpresaBannerProps): JSX.Element {
  return (
    <div
      data-slot="empresa-banner"
      className={className}
      style={{
        position: "relative",
        width: EMPRESA_WIDTH,
        height: EMPRESA_HEIGHT,
        overflow: "hidden",
        fontFamily: 'var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif)',
        flexShrink: 0,
      }}
    >
      {/* Asset real de producción como fondo (ancho completo, alto natural) */}
      <img
        src="/producto-assets/ganaya/banners/empresa.png"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />

      {/* Logo dentro del círculo morado (asset ø≈110 centrado en x≈182 / y≈60) */}
      <span
        style={{
          position: "absolute",
          left: 130,
          top: 8,
          width: 104,
          height: 104,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1.15,
        }}
      >
        {logoText ?? nombre}
      </span>

      {/* Nombre + rating + descripción (zona blanca central del asset) */}
      <div style={{ position: "absolute", left: 258, top: 0, bottom: 0, width: 330, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#241A3F", letterSpacing: "-0.01em" }}>{nombre}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#241A3F" }}>{rating}</span>
          <Star />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#241A3F" }}>{ratingLabel}</span>
          <span style={{ color: "#B9B0CC", fontWeight: 700 }}>·</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6180" }}>{opiniones}</span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 11.5, fontWeight: 500, lineHeight: 1.5, color: "#6B6180" }}>
          {descripcion}
        </p>
      </div>

      {/* Valores de stats — dentro de las cajas del asset
          (Ventas centro y≈65, Participantes centro y≈138 · x centro ≈ 680) */}
      <span style={{ position: "absolute", right: 40, top: 58, width: 148, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#3B1782" }}>
        {ventas}
      </span>
      <span style={{ position: "absolute", right: 40, top: 128, width: 148, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#3B1782" }}>
        {participantes}
      </span>
    </div>
  );
}
