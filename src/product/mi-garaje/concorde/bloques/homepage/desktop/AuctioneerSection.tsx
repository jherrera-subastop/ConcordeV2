"use client";

/**
 * AuctioneerSection — Bloque/sección de Concorde (Voyager DS)
 *
 * Card de subastador (766 × 352): cabecera con nombre + nº de ofertas, logo
 * central (slot) y "Ir al Perfil", sobre una fila de 4 OfferCards.
 * Compuesta 100% con componentes Concorde: OfferCard · BadgeStatus · ProfileButton.
 */

import type { JSX, ReactNode } from "react";
import OfferCard from "../../../components/OfferCard";
import BadgeStatus from "../../../components/BadgeStatus";
import ProfileButton from "../../../components/ProfileButton";
import CardTitle from "../../../components/CardTitle";

export type AuctioneerBadge = "none" | "live" | "proxima";

export interface AuctioneerOffer {
  name: string;
  year: string | number;
  price: string;
  imageSrc?: string;
  badge?: AuctioneerBadge;
}

export interface AuctioneerSectionProps {
  /** Nombre del subastador */
  name?: string;
  /** Etiqueta de ofertas (p.ej. "10 Ofertas") */
  offersLabel?: string;
  /** Logo central (slot) — por defecto un placeholder */
  logo?: ReactNode;
  /** Las 4 ofertas (cards) */
  offers?: AuctioneerOffer[];
  onProfile?: () => void;
  className?: string;
}

export const AUCTIONEER_WIDTH = 766;
export const AUCTIONEER_HEIGHT = 352;

const DEFAULT_OFFERS: AuctioneerOffer[] = [
  { name: "Audi Q3", year: 2026, price: "US$ 9,999", imageSrc: "/demo/bronco.jpg" },
  { name: "Audi Q3", year: 2026, price: "US$ 9,999", imageSrc: "/demo/bronco.jpg", badge: "live" },
  { name: "Audi Q3", year: 2026, price: "US$ 9,999", imageSrc: "/demo/bronco.jpg" },
  { name: "Audi Q3", year: 2026, price: "US$ 9,999", imageSrc: "/demo/bronco.jpg", badge: "proxima" },
];

function badgeFor(badge: AuctioneerBadge | undefined): JSX.Element | undefined {
  if (badge === "live") return <BadgeStatus variant="live" />;
  if (badge === "proxima") return <BadgeStatus variant="proxima" />;
  return undefined;
}

export default function AuctioneerSection({
  name = "SANTANDER CONSUMER",
  offersLabel = "10 Ofertas",
  logo,
  offers = DEFAULT_OFFERS,
  onProfile,
  className = "",
}: AuctioneerSectionProps): JSX.Element {
  return (
    <section
      className={className}
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: AUCTIONEER_WIDTH,
        height: AUCTIONEER_HEIGHT,
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
      {/* Cabecera */}
      <header style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
        {/* Izquierda: CardTitle (nombre + ofertas + corchetes naranjas) */}
        <CardTitle title={name} subtitle={offersLabel} titleSize={16} subtitleSize={14} />

        {/* Centro: logo (slot opcional) */}
        {logo ? <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }}>{logo}</div> : null}

        {/* Derecha: Ir al Perfil */}
        <ProfileButton onClick={onProfile}>Ir al Perfil</ProfileButton>
      </header>

      {/* Fila de ofertas */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {offers.map(function renderOffer(o, i) {
          return (
            <OfferCard
              key={i}
              variant="live"
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
