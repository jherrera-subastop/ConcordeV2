/**
 * Detalle — Bloque de Concorde (Voyager DS)
 *
 * Página de detalle. Por ahora es solo el lienzo base: un fondo blanco de
 * 799 × 1483. Iremos montando las secciones encima.
 */

import { useState } from "react";
import type { ComponentProps, JSX, ReactNode } from "react";
import AuctionStatus from "@/src/product/ganaya/ganaya-concorde/components/AuctionStatus";
import CardViewer from "@/src/product/ganaya/ganaya-concorde/components/CardViewer";
import Accordion from "@/src/product/ganaya/ganaya-concorde/components/Accordion";
import DetailCard from "./DetailCard";
import ConditionPill from "@/src/product/ganaya/ganaya-concorde/components/ConditionPill";
import Button, { CalendarIcon } from "@/src/product/ganaya/ganaya-concorde/components/Button";
import CardTitle from "@/src/product/ganaya/ganaya-concorde/components/CardTitle";
import OfferCard from "@/src/product/ganaya/ganaya-concorde/components/OfferCard";
import InfoIcon from "@/src/product/ganaya/ganaya-concorde/components/InfoIcon";
import { DETALLE_PILLS, type DetalleVariant } from "./pills";

// Título del accordion VISITAS · dot verde + texto (CardTitle acepta nodos)
const VISITAS_TITLE = (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2DBE64", flexShrink: 0 }} />
    VISITAS
  </span>
);

// Cada ConditionPill mide 136×46 fijo (hug del Figma), no se estira. Padding
// lateral 10px y texto 12px/14px para que las etiquetas largas (p.ej. «Cuota
// mínima de 2 participantes») entren en ese ancho. `.pcondpill.dt-pill` gana en
// especificidad al `.pcondpill` base.
const DETALLE_PILL_STYLES = `
.pcondpill.dt-pill { width: 136px; box-sizing: border-box; padding-left: 10px; padding-right: 10px; font-size: 12px; line-height: 14px; }
/* Pill solitaria en fila impar (3 pills) → centrada */
.pcondpill.dt-pill.dt-pill-c { grid-column: 1 / -1; justify-self: center; }

/* Aviso contextual: conserva el lenguaje cyan/vault de la oferta negociable.
   Vive entre la información y las condiciones: presente y reconocible, pero
   más compacto que una card de contenido. */
.dt-safety {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #56D9DF;
  border-radius: 11px;
  background: linear-gradient(135deg, rgba(224,250,251,.94), rgba(244,238,255,.96) 58%, rgba(238,231,255,.94));
  box-shadow: 0 8px 20px rgba(91,72,185,.14), inset 0 1px rgba(255,255,255,.9);
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
.dt-safety__body { position: relative; display: flex; align-items: flex-start; gap: 8px; }
.dt-safety__icon { display: grid; place-items: center; flex: 0 0 22px; width: 22px; height: 22px; margin-top: 1px; border-radius: 50%; color: #008F94; background: rgba(255,255,255,.72); box-shadow: inset 0 0 0 1px rgba(0,168,171,.22); }
.dt-safety__text { display: grid; gap: 6px; min-width: 0; padding-right: 20px; }
.dt-safety__title { margin: 0; color: #32206E; font-size: 12px; font-weight: 800; line-height: 15px; }
.dt-safety__copy { margin: 0; color: #191C1C; font-size: 12px; font-weight: 400; line-height: 16px; letter-spacing: 0; }
.dt-safety__copy strong { color: #32206E; font-weight: 800; }
.dt-safety--rail { padding: 12px; }
.dt-safety--rail .dt-safety__icon { flex-basis: 20px; width: 20px; height: 20px; }
.dt-safety--rail .dt-safety__copy { font-size: 12px; line-height: 16px; }

/* Variante 4: pista compacta antes del accordion. Su única promesa visible es
   que la ficha fue creada por un usuario; el detalle aparece solo al pedirlo. */
.dt-safety--teaser { padding: 0; overflow: hidden; border-radius: 10px; background: linear-gradient(135deg, rgba(224,250,251,.98), rgba(245,240,255,.98)); transition: box-shadow .32s cubic-bezier(.16,1,.3,1), transform .32s cubic-bezier(.16,1,.3,1); }
.dt-safety--teaser:not(.is-open) { height: 34px; box-sizing: border-box; }
.dt-safety--teaser.is-open { box-shadow: 0 8px 20px rgba(91,72,185,.14), inset 0 1px rgba(255,255,255,.9); transform: translateY(-1px); }
.dt-safety__teaser-toggle { display: flex; align-items: center; gap: 7px; width: 100%; height: 32px; min-height: 32px; padding: 0 10px; box-sizing: border-box; border: 0; color: #32206E; background: transparent; font: inherit; text-align: left; cursor: pointer; user-select: none; }
.dt-safety__teaser-toggle > svg { display: grid; flex: 0 0 auto; width: 20px; height: 20px; padding: 2px; box-sizing: border-box; border-radius: 50%; color: #008F94; background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 1px rgba(0,168,171,.22); }
.dt-safety__teaser-toggle span { min-width: 0; font-size: 12px; font-weight: 700; line-height: 16px; }
.dt-safety__teaser-toggle i { flex: 0 0 auto; width: 7px; height: 7px; margin-left: auto; border-right: 1.5px solid #008F94; border-bottom: 1.5px solid #008F94; transform: rotate(45deg) translateY(-2px); transition: transform .32s cubic-bezier(.16,1,.3,1); }
.dt-safety--teaser.is-open .dt-safety__teaser-toggle i { transform: rotate(225deg) translate(-2px,-2px); }
.dt-safety__teaser-expand { display: grid; grid-template-rows: 0fr; overflow: hidden; transition: grid-template-rows .42s cubic-bezier(.16,1,.3,1); }
.dt-safety--teaser.is-open .dt-safety__teaser-expand { grid-template-rows: 1fr; }
.dt-safety__teaser-content { min-height: 0; margin: 0 12px; padding: 10px 20px 12px 28px; border-top: 1px solid rgba(0,168,171,.24); opacity: 0; transform: translateY(-7px); transition: opacity .22s ease .08s, transform .42s cubic-bezier(.16,1,.3,1); }
.dt-safety--teaser.is-open .dt-safety__teaser-content { opacity: 1; transform: translateY(0); }
.dt-safety__teaser-content .dt-safety__copy { color: #5F5B6B; }

`;

const DETALLE_IMAGES = Array.from({ length: 8 }, function img() { return "/producto-assets/ganaya/demo/bronco.jpg"; });

// Lab VMC: datos de la oferta. Sin `offer` el bloque se ve tal cual Concorde.
export type DetalleRelated = { name: string; year: number; price?: string; imageSrc: string; variant: DetalleVariant };
export type DetalleOffer = {
  title: string; subtitle?: string; images: string[];
  detailCard?: Partial<ComponentProps<typeof DetailCard>>;
  /** Reemplaza al DetailCard completo (p.ej. la ventana de SubasChat de un acuerdo aceptado). */
  detailSlot?: ReactNode;
  related?: DetalleRelated[];
  /** Alto extra del lienzo cuando la columna derecha crece (p.ej. SubasChat, más alto que el DetailCard). */
  extraHeight?: number;
  /** false oculta el accordion VISITAS (23/10: la ficha de la propuesta Negociable no lo lleva). */
  visits?: boolean;
  information?: ReactNode;
  conditionsContent?: ReactNode;
  conditionPills?: {label:string;tone?:"filled"|"outline"}[];
  onBack?:()=>void;
  relatedContent?: ReactNode;
};

export interface DetalleProps {
  /** Variante de la oferta — controla AuctionStatus/CardViewer/DetailCard y los pills. */
  variant?: DetalleVariant;
  offer?: DetalleOffer;
  className?: string;
  /** Ubicación a comparar del disclaimer de seguridad en /m/vmc-propuesta. */
  safetyPlacement?: "none" | "gallery" | "teaser" | "info" | "conditions" | "banner" | "related";
}

import { DETALLE_WIDTH, DETALLE_HEIGHT } from "./dimensions";
export { DETALLE_WIDTH, DETALLE_HEIGHT } from "./dimensions";

const RELATED_DEFAULT: DetalleRelated[] = [
  { name: "Audi Q3", year: 2026, price: "US$ 14,999", imageSrc: "/producto-assets/ganaya/demo/bronco.jpg", variant: "live" },
  { name: "Audi Q3", year: 2026, price: "US$ 14,999", imageSrc: "/producto-assets/ganaya/demo/bronco.jpg", variant: "live" },
  { name: "Audi Q3", year: 2026, imageSrc: "/producto-assets/ganaya/demo/bronco.jpg", variant: "negotiable" },
  { name: "Audi Q3", year: 2026, imageSrc: "/producto-assets/ganaya/demo/bronco.jpg", variant: "negotiable" },
];

function SafetyDisclaimer({ rail = false }: { rail?: boolean }): JSX.Element {
  return <aside className={`dt-safety${rail ? " dt-safety--rail" : ""}`} aria-label="Información de seguridad de la publicación">
    <div className="dt-safety__body">
      <span className="dt-safety__icon"><InfoIcon size={16} /></span>
      <div className="dt-safety__text">
        <p className="dt-safety__title">Publicación basic</p>
        <p className="dt-safety__copy">Esta es una publicación basic, realizada y administrada directamente por un usuario de la plataforma que ofrece un vehículo de su propiedad. Te recomendamos verificar la información e inspeccionar el vehículo antes de realizar cualquier pago. Por tu seguridad, el pago debe realizarse directamente al vendedor mediante un cheque de gerencia.</p>
      </div>
    </div>
  </aside>;
}

function SafetyTeaser({ rail = false }: { rail?: boolean }): JSX.Element {
  const [open, setOpen] = useState(false);
  return <section className={`dt-safety dt-safety--teaser${rail ? " dt-safety--rail" : ""}${open ? " is-open" : ""}`} aria-label="Información de seguridad de la publicación">
    <button type="button" className="dt-safety__teaser-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}><InfoIcon size={18} /><span>Publicación basic</span><i aria-hidden /></button>
    <div className="dt-safety__teaser-expand"><div className="dt-safety__teaser-content"><p className="dt-safety__copy">Esta es una publicación basic, realizada y administrada directamente por un usuario de la plataforma que ofrece un vehículo de su propiedad. Te recomendamos verificar la información e inspeccionar el vehículo antes de realizar cualquier pago. Por tu seguridad, el pago debe realizarse directamente al vendedor mediante un cheque de gerencia.</p></div></div>
  </section>;
}

export default function Detalle({ variant = "live", offer, className = "", safetyPlacement = "gallery" }: DetalleProps): JSX.Element {
  const related = offer?.related ?? RELATED_DEFAULT;
  return (
    <div
      className={className}
      data-block="detalle"
      style={{
        position: "relative",
        width: DETALLE_WIDTH,
        height: DETALLE_HEIGHT + (offer?.extraHeight ?? 0),
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Fila de 2 columnas alineadas por arriba (top 16). El AuctionStatus (header
          del carro) va DENTRO de la columna izquierda, pegado al CardViewer, así su
          top coincide con el del DetailCard de la derecha (ambas columnas empiezan
          a la misma altura). */}
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: DETALLE_PILL_STYLES }} />
      <div data-slot="detail-layout"
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* Columna izquierda */}
        <div data-slot="detail-left" style={{ display: "flex", flexDirection: "column", gap: 16, width: 443 }}>
          {/* AuctionStatus pegado encima del CardViewer (sin gap) */}
          <div data-slot="detail-media" style={{ display: "flex", flexDirection: "column" }}>
            <AuctionStatus variant={variant} title={offer?.title} subtitle={offer?.subtitle} onBack={offer?.onBack} />
            <CardViewer images={offer?.images ?? DETALLE_IMAGES} imageAlt={offer?.title} variant={variant} />
          </div>
          {safetyPlacement === "gallery" ? <SafetyDisclaimer /> : null}
          {safetyPlacement === "teaser" ? <SafetyTeaser /> : null}
          <Accordion title="INFORMACIÓN GENERAL" defaultOpen>{offer?.information}</Accordion>
          {safetyPlacement === "info" ? <SafetyDisclaimer /> : null}
          <Accordion title="CONDICIONES DE OFRECIMIENTO">{offer?.conditionsContent}</Accordion>
          {safetyPlacement === "conditions" ? <SafetyDisclaimer /> : null}
        </div>

        {/* Columna derecha */}
        <div data-slot="detail-right" style={{ display: "flex", flexDirection: "column", gap: 16, width: 311 }}>
          {offer?.detailSlot ?? <DetailCard variant={variant} title={offer?.title} {...offer?.detailCard} />}

          {/* Card de fondo (311×132) con las ConditionPills (cambian según variante) */}
          <div data-slot="detail-conditions"
            style={{
              width: 311,
              boxSizing: "border-box",
              padding: 12,
              background: "#ffffff",
              borderRadius: 8,
              boxShadow: "rgba(0,0,0,0.1) 0px 0px 16px 4px",
              display: "grid",
              gridTemplateColumns: "136px 136px",
              justifyContent: "space-between",
              rowGap: 16,
            }}
          >
            {(offer?.conditionPills ?? DETALLE_PILLS[variant]).map(function renderPill(p, i, arr) {
              const lone = arr.length % 2 === 1 && i === arr.length - 1;
              return <ConditionPill key={i} className={`dt-pill${lone ? " dt-pill-c" : ""}`} variant={p.tone}>{p.label}</ConditionPill>;
            })}
          </div>

          {safetyPlacement === "banner" ? <SafetyTeaser rail /> : null}

          {/* Accordion VISITAS (abierto) · texto + Button «Agenda tu visita» (secondary-sm) */}
          {offer?.visits !== false && <Accordion title={VISITAS_TITLE} defaultOpen>
            <p style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: "#191C1C", textAlign: "left" }}>
              Las visitas son previa cita y se te proporcionará la ubicación exacta después de que agendes tu visita.
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Button variant="secondary-sm" icon={<CalendarIcon />}>Agenda tu visita</Button>
            </div>
          </Accordion>}

          {safetyPlacement === "related" ? <SafetyDisclaimer rail /> : null}

          {/* OFERTAS RELACIONADAS · card 311×436 con CardTitle (200×32) + grid 2×2
              de OfferCards short (el grid ocupa 279×348). */}
          <div data-slot="detail-related"
            style={{
              width: 311,
              boxSizing: "border-box",
              background: "#ffffff",
              borderRadius: 8,
              boxShadow: "rgba(0,0,0,0.1) 0px 0px 16px 4px",
              padding: 16,
            }}
          >
            <CardTitle title="OFERTAS RELACIONADAS" subtitle="" titleSize={14} />
            {offer?.relatedContent ?? (            <div
              style={{
                display: "grid",
                gridTemplateColumns: "134px 134px",
                justifyContent: "space-between",
                rowGap: 8,
                marginTop: 24,
              }}
            >
              {related.map(function renderRelated(o, k) {
                return <OfferCard key={k} size="short" variant={o.variant} name={o.name} year={o.year} price={o.price} imageSrc={o.imageSrc} elevated />;
              })}
            </div>)}

          </div>
        </div>
      </div>

    </div>
  );
}
