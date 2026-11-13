/**
 * AssetBanner — 766×192 · banner que usa el ASSET REAL de producción como
 * fondo (personaje + decoración + pill + "Ofertas" ya vienen en el PNG) y solo
 * sobrepone lo dinámico: el número de ofertas y, en categoría, el chip de ruta.
 *
 * Assets en public/producto/index/banners/ (descargados de vmcsubastas.com, 1532×384 = 2×).
 * Usa el alto NATURAL del asset (192 a ancho 766) para no recortar la derecha
 * (donde vive «Ofertas»). Estático, sin efectos.
 */

import type { JSX } from "react";
import { CarIcon } from "./decor";
import { BANNER_WIDTH, BANNER_HEIGHT } from "./dimensions";

export const ASSET_WIDTH = BANNER_WIDTH;    // 766
export const ASSET_HEIGHT = BANNER_HEIGHT;  // 192 — alto natural del asset

export type AssetBannerKind = "en-vivo" | "negociable" | "categoria";

export interface AssetBannerProps {
  kind: AssetBannerKind;
  /** Número de ofertas — se sobrepone a la derecha de «Ofertas» del asset */
  count: number | string;
  /** Chip de ruta (solo categoría) */
  chip?: { label: string; icon?: "car" };
  className?: string;
}

const ASSET: Record<AssetBannerKind, string> = {
  "en-vivo": "/producto/index/banners/en_vivo.png",
  "negociable": "/producto/index/banners/negociable.png",
  "categoria": "/producto/index/banners/categoria.png",
};

export default function AssetBanner({ kind, count, chip, className = "" }: AssetBannerProps): JSX.Element {
  return (
    <div
      data-slot="asset-banner"
      className={className}
      style={{
        position: "relative",
        width: ASSET_WIDTH,
        height: ASSET_HEIGHT,
        overflow: "hidden",
        fontFamily: 'var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif)',
        flexShrink: 0,
      }}
    >
      {/* Asset real de producción como fondo (ancho completo, alto natural) */}
      <img
        src={ASSET[kind]}
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />

      {/* Número de ofertas — a la derecha de «Ofertas» del asset
          («Ofertas» termina ~x628; el número va desde ahí, centrado en y≈96) */}
      <span
        style={{
          position: "absolute",
          left: 636,
          top: 96,
          transform: "translateY(-50%)",
          fontSize: 46,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "#3B1782",
        }}
      >
        {count}
      </span>

      {/* Chip de ruta (solo categoría) — esquina inferior derecha */}
      {chip && (
        <span
          style={{
            position: "absolute",
            right: 20,
            bottom: 18,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "#4C1EBC",
            color: "#FFFFFF",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 14,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "rgba(46,15,112,0.2) 0 2px 8px",
          }}
        >
          {chip.label}
          {chip.icon === "car" && <CarIcon size={22} color="#FFFFFF" />}
        </span>
      )}
    </div>
  );
}
