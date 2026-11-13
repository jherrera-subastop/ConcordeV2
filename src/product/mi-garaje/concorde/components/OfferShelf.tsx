"use client";

/**
 * OfferShelf — Generado por Concorde
 * Fuente: Figma VOYAGER · estante de ofertas (Recomendados / Me interesa)
 *
 * Sección 766×352: CardTitle (título + nº de ofertas, con brackets) sobre una
 * fila de 4 OfferCards. Igual que el subastador de la Homepage pero sin el
 * acceso «Ir al Perfil». Compone CardTitle · OfferCard · BadgeStatus.
 */

import type { JSX } from "react";
import OfferCard, { type OfferCardVariant } from "./OfferCard";
import BadgeStatus from "./BadgeStatus";
import CardTitle from "./CardTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OfferShelfBadge = "none" | "live" | "proxima";

export interface OfferShelfItem {
  name: string;
  year: string | number;
  /** Precio formateado. Omitido en `negotiable` (solo like). */
  price?: string;
  /** Variante de la card (barra naranja/teal). Default "live". */
  variant?: OfferCardVariant;
  imageSrc?: string;
  /** Pill de estado sobre la imagen. */
  badge?: OfferShelfBadge;
}

export interface OfferShelfProps {
  /** Título de la sección (default "RECOMENDADOS"). */
  title?: string;
  /** Etiqueta de ofertas (default "4 Ofertas"). */
  offersLabel?: string;
  /** Las 4 ofertas (cards). */
  offers?: OfferShelfItem[];
  className?: string;
}

export const OFFER_SHELF_WIDTH = 766;
export const OFFER_SHELF_HEIGHT = 352;

const IMG = "/demo/bronco.jpg";

const DEFAULT_OFFERS: OfferShelfItem[] = [
  { name: "Audi Q3", year: 2026, price: "US$ 9,999", variant: "live", imageSrc: IMG },
  { name: "Audi Q3", year: 2026, price: "US$ 9,999", variant: "live", imageSrc: IMG, badge: "live" },
  { name: "Audi Q3", year: 2026, variant: "negotiable", imageSrc: IMG },
  { name: "Audi Q3", year: 2026, price: "US$ 9,999", variant: "live", imageSrc: IMG, badge: "proxima" },
];

function badgeFor(badge: OfferShelfBadge | undefined): JSX.Element | undefined {
  if (badge === "live") return <BadgeStatus variant="live" />;
  if (badge === "proxima") return <BadgeStatus variant="proxima" />;
  return undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OfferShelf({
  title = "RECOMENDADOS",
  offersLabel = "4 Ofertas",
  offers = DEFAULT_OFFERS,
  className = "",
}: OfferShelfProps): JSX.Element {
  return (
    <section
      className={className}
      data-component="offer-shelf"
      style={{
        boxSizing: "border-box",
        width: OFFER_SHELF_WIDTH,
        height: OFFER_SHELF_HEIGHT,
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "rgba(0,0,0,0.07) 0px 0px 16px 4px",
        padding: "20px 16px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)",
      }}
    >
      {/* Cabecera: título + nº de ofertas (brackets naranjas) */}
      <header style={{ padding: "0 8px" }}>
        <CardTitle title={title} subtitle={offersLabel} titleSize={16} subtitleSize={14} />
      </header>

      {/* Fila de 4 OfferCards */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 8px" }}>
        {offers.map(function renderOffer(o, i) {
          return (
            <OfferCard
              key={i}
              variant={o.variant ?? "live"}
              name={o.name}
              year={o.year}
              price={o.price}
              imageSrc={o.imageSrc}
              badge={badgeFor(o.badge)}
              elevated
            />
          );
        })}
      </div>
    </section>
  );
}
