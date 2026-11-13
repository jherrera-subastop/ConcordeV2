/**
 * Homepage — Bloque de Concorde (Voyager DS)
 *
 * Bloque = composición de varios componentes. Por ahora es solo el lienzo
 * base: un fondo blanco de 798 × 1104. Iremos montando las secciones encima.
 */

import type { JSX } from "react";
import AuctioneerSection from "./AuctioneerSection";
import CategoriesSection from "./CategoriesSection";

export interface HomepageProps {
  className?: string;
}

import { HOMEPAGE_WIDTH, HOMEPAGE_HEIGHT } from "./dimensions";
export { HOMEPAGE_WIDTH, HOMEPAGE_HEIGHT } from "./dimensions";

export default function Homepage({ className = "" }: HomepageProps): JSX.Element {
  return (
    <div
      className={className}
      data-block="homepage"
      style={{
        position: "relative",
        width: HOMEPAGE_WIDTH,
        height: HOMEPAGE_HEIGHT,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Principal Banner 766 × 272 · 16px arriba del Secondary, centrado */}
      <div
        data-slot="principal-banner"
        style={{
          position: "absolute", left: "50%", bottom: 816, transform: "translateX(-50%)",
          width: 766, height: 272, borderRadius: 8, background: "#E9EAEC",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)",
          fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", color: "#9AA1AC",
        }}
      >
        PRINCIPAL BANNER
      </div>

      {/* Secondary Banner 766 × 100 · 16px arriba de Categorías, centrado */}
      <div
        data-slot="secondary-banner"
        style={{
          position: "absolute", left: "50%", bottom: 700, transform: "translateX(-50%)",
          width: 766, height: 100, borderRadius: 8, background: "#E9EAEC",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)",
          fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", color: "#9AA1AC",
        }}
      >
        SECONDARY BANNER
      </div>

      {/* Sección Categorías 766 × 184 · 16px arriba del Subastador, centrada */}
      <div style={{ position: "absolute", left: "50%", bottom: 500, transform: "translateX(-50%)" }}>
        <CategoriesSection />
      </div>

      {/* Sección Subastador 766 × 352 · 16px arriba del banner, centrada */}
      <div style={{ position: "absolute", left: "50%", bottom: 132, transform: "translateX(-50%)" }}>
        <AuctioneerSection />
      </div>

      {/* Banner 768 × 100 · a 32px del bottom, centrado horizontalmente */}
      <div
        data-slot="banner"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          transform: "translateX(-50%)",
          width: 766,
          height: 100,
          borderRadius: 8,
          background: "#F2F4F3",
          border: "1px dashed #CBD5E1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: "0.08em",
          color: "#94A3B8",
        }}
      >
        BANNER · 766 × 100
      </div>
    </div>
  );
}
