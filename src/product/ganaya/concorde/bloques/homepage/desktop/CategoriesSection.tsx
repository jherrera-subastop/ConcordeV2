"use client";

/**
 * CategoriesSection — Bloque/sección de Concorde (Voyager DS)
 *
 * Card de 2 columnas (766 × 184):
 *   · Izquierda  "TIPO DE OFERTA"  → 2 OfferType (NEGOCIABLE · EN VIVO)
 *   · Derecha    "CATEGORÍAS"      → 4 CategoryCard
 * Separadas por un divisor vertical. Compuesta 100% con componentes Concorde:
 * CardTitle · OfferType · CategoryCard.
 */

import type { JSX } from "react";
import CardTitle from "../../../components/CardTitle";
import OfferType from "../../../components/OfferType";
import CategoryCard from "../../../components/CategoryCard";

export const CATEGORIES_WIDTH = 766;
export const CATEGORIES_HEIGHT = 184;

export interface CategoriesSectionProps {
  onNegotiable?: () => void;
  onLive?: () => void;
  onCategory?: (category: string) => void;
  className?: string;
}

const colStyle = { display: "flex", flexDirection: "column" as const, alignItems: "flex-start" as const, justifyContent: "space-between" as const, height: 143, gap: 8 };

export default function CategoriesSection({
  onNegotiable,
  onLive,
  onCategory,
  className = "",
}: CategoriesSectionProps): JSX.Element {
  return (
    <section
      className={className}
      style={{
        boxSizing: "border-box",
        width: CATEGORIES_WIDTH,
        height: CATEGORIES_HEIGHT,
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "rgba(0,0,0,0.07) 0px 0px 16px 4px",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)",
      }}
    >
      {/* Columna izquierda: TIPO DE OFERTA */}
      <div style={{ ...colStyle, paddingRight: 24 }}>
        <CardTitle title="TIPO DE OFERTA" subtitle="" />
        <div style={{ display: "flex", gap: 12 }}>
          <OfferType variant="negotiable" onClick={onNegotiable} />
          <OfferType variant="live" onClick={onLive} />
        </div>
      </div>

      {/* Divisor vertical */}
      <div style={{ width: 1, height: 143, background: "#E5E7EB" }} />

      {/* Columna derecha: CATEGORÍAS */}
      <div style={{ ...colStyle, flex: 1, paddingLeft: 24 }}>
        <CardTitle title="CATEGORÍAS" subtitle="" />
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", width: "100%" }}>
          <CategoryCard category="vehicular" onClick={onCategory ? function h() { onCategory("vehicular"); } : undefined} />
          <CategoryCard category="maquinaria" onClick={onCategory ? function h() { onCategory("maquinaria"); } : undefined} />
          <CategoryCard category="equipos-diversos" onClick={onCategory ? function h() { onCategory("equipos-diversos"); } : undefined} />
          <CategoryCard category="articulos-diversos" onClick={onCategory ? function h() { onCategory("articulos-diversos"); } : undefined} />
        </div>
      </div>
    </section>
  );
}
