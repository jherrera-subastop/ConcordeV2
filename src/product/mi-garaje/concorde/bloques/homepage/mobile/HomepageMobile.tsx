/**
 * HomepageMobile — Bloque de Concorde (Voyager DS)
 *
 * Página de inicio · mobile (420 de ancho). Por ahora:
 *   · Header 420×64 (logo de la marca a la izquierda + «Ingresa»)
 *   · Banner 388×598 (placeholder, a 16px de margen)
 * Iremos montando las demás secciones encima.
 */

"use client";

import { useState } from "react";
import type { JSX } from "react";
import AppHeader from "../../header/desktop/Header";
import CardTitle from "../../../components/CardTitle";
import OfferType from "../../../components/OfferType";
import CategoryCard from "../../../components/CategoryCard";
import OfferCard from "../../../components/OfferCard";
import BadgeStatus from "../../../components/BadgeStatus";
import ProfileButton from "../../../components/ProfileButton";
import SidebarMobile, { SidebarMenuButton } from "../../sidebar/mobile/SidebarMobile";

import { HOMEPAGE_MOBILE_WIDTH, HOMEPAGE_MOBILE_HEIGHT } from "./dimensions";
export { HOMEPAGE_MOBILE_WIDTH, HOMEPAGE_MOBILE_HEIGHT } from "./dimensions";

// Card blanca de sección (388 de ancho, sombra estándar del homepage)
const SECTION_CARD = {
  width: 388,
  boxSizing: "border-box" as const,
  background: "#ffffff",
  borderRadius: 8,
  boxShadow: "rgba(0,0,0,0.1) 0px 0px 16px 4px",
  padding: 16,
};

// Overrides: OfferType llena su columna (2-up) y CategoryCard a 86 para que
// las 4 entren en la fila.
const HM_STYLES = `
.poftype.hm-oftype { width: 100%; box-sizing: border-box; }
.pcatcard.hm-cat { width: 86px; }
`;

export interface HomepageMobileProps {
  className?: string;
  /** Alto del marco para previsualizaciones (px). En producción se omite. Ver `SidebarMobile`. */
  frameHeight?: number;
}

export default function HomepageMobile({ className = "", frameHeight }: HomepageMobileProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  const page = (
    <div
      className={className}
      data-block="homepage-mobile"
      style={{
        position: "relative",
        width: HOMEPAGE_MOBILE_WIDTH,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)",
      }}
    >
      {/* Header 420×64 · hamburguesa + logo de la marca a la izquierda */}
      <AppHeader
        width={HOMEPAGE_MOBILE_WIDTH}
        logo={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SidebarMenuButton onClick={() => setMenuOpen(true)} expanded={menuOpen} />
            <img src="/logo-preview.png" alt="VMC Subastas" style={{ height: 26, width: "auto", display: "block" }} />
          </div>
        }
      />

      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: HM_STYLES }} />

      {/* Contenido a 16px de margen */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
        {/* Banner · placeholder 388×598 */}
        <div
          data-slot="banner"
          style={{
            width: 388,
            height: 598,
            boxSizing: "border-box",
            borderRadius: 8,
            background: "#E9EAEC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontSize: 12,
            letterSpacing: "0.08em",
            color: "#9AA1AC",
          }}
        >
          BANNER
        </div>

        {/* TIPO DE OFERTA · card 388×176 (CardTitle + 2 OfferType: EN VIVO / NEGOCIABLE) */}
        <div style={SECTION_CARD}>
          <CardTitle title="TIPO DE OFERTA" subtitle="" titleSize={14} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
            <OfferType variant="live" className="hm-oftype" />
            <OfferType variant="negotiable" className="hm-oftype" />
          </div>
        </div>

        {/* CATEGORÍAS · card 388×160 (CardTitle + 4 CategoryCard) */}
        <div style={SECTION_CARD}>
          <CardTitle title="CATEGORÍAS" subtitle="" titleSize={14} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <CategoryCard category="vehicular" className="hm-cat" />
            <CategoryCard category="maquinaria" className="hm-cat" />
            <CategoryCard category="equipos-diversos" className="hm-cat" />
            <CategoryCard category="articulos-diversos" className="hm-cat" />
          </div>
        </div>

        {/* SUBASTADOR · card 388×596 (SANTANDER CONSUMER + grid 2×2 de OfferCards) */}
        <div style={SECTION_CARD}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle title="SANTANDER CONSUMER" subtitle="10 Ofertas" titleSize={16} subtitleSize={14} />
            <ProfileButton>Ir al Perfil</ProfileButton>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "170px 170px", justifyContent: "space-between", rowGap: 12, marginTop: 16 }}>
            <OfferCard variant="live" name="Audi Q3" year={2026} price="US$ 9,999" imageSrc="/demo/bronco.jpg" elevated />
            <OfferCard variant="live" name="Audi Q3" year={2026} price="US$ 9,999" imageSrc="/demo/bronco.jpg" badge={<BadgeStatus variant="live" />} elevated />
            <OfferCard variant="live" name="Audi Q3" year={2026} price="US$ 9,999" imageSrc="/demo/bronco.jpg" elevated />
            <OfferCard variant="live" name="Audi Q3" year={2026} price="US$ 9,999" imageSrc="/demo/bronco.jpg" badge={<BadgeStatus variant="proxima" />} elevated />
          </div>
        </div>

        {/* Secondary Banner · placeholder 388×116 */}
        <div
          data-slot="secondary-banner"
          style={{
            width: 388,
            height: 116,
            boxSizing: "border-box",
            borderRadius: 8,
            background: "#E9EAEC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontSize: 12,
            letterSpacing: "0.08em",
            color: "#9AA1AC",
          }}
        >
          SECONDARY BANNER
        </div>
      </div>
    </div>
  );

  return (
    <SidebarMobile open={menuOpen} onOpenChange={setMenuOpen} frameHeight={frameHeight}>
      {page}
    </SidebarMobile>
  );
}
