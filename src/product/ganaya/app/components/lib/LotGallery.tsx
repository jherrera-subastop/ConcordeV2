"use client";

/** LotGallery: carta destacada a la izquierda y los lotes a la derecha, llenando columna por columna (3 filas por columna).
 *  Con pocos lotes el espacio queda reservado y no se ensancha. Bajo 700 px todo va en una columna.
 *  Usa FeaturedCard (pills, moneda y favorito).
 *  Solo depende de React, lot-gallery.css y FeaturedCard. */
import { useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import { ConditionPill, LikeButton, PillIcons, SubasCoin, type Condition } from "./FeaturedCard";
import "./lot-gallery.css";

export type LotRowItem = {
  image: string;
  title: string;
  /** live = subasta (precio); negotiable = Recibe propuestas. */
  tone: "live" | "negotiable";
  price?: string;
  offerText?: string;
  /** Condición del bien (pill extra junto al estado). «basic» = publicación de usuario: siempre va con «Recibe propuestas». */
  condition?: Condition;
  /** Oculta la pill «En vivo» de la fila (el precio de subasta se mantiene). */
  hideLive?: boolean;
  /** Línea de datos, p. ej. "38,200 km · Mecánica · Gasolina". */
  details?: string;
  location?: string;
  onClick?: () => void;
};

/** Fila de lote: foto de 84 px con favorito, pill de estado, nombre, precio y datos. */
export function LotRow({ item, offerStyle = "pill", conditionIn = "foto" }: { item: LotRowItem; offerStyle?: "pill" | "texto"; conditionIn?: "foto" | "texto" }): JSX.Element {
  const [liked, setLiked] = useState(false);
  // Publicación de usuario (basic): siempre «Recibe propuestas», nunca en vivo.
  const live = item.tone === "live" && item.condition !== "basic";
  const foot = item.location;
  // Condición en el texto (bajo el título, antes de los datos). Basic es tipo de publicación: va siempre con los badges de estado.
  const condInText = conditionIn === "texto" && item.condition && item.condition !== "basic" ? item.condition : null;
  // Basic va dentro de la foto como ícono de usuario (se extiende al pasar el mouse); el resto de condiciones, según conditionIn.
  const isBasic = item.condition === "basic";
  const condInPhoto = item.condition && !condInText && !isBasic ? item.condition : null;
  return (
    <article className={`vlg-row vlg-row--${item.tone}`} aria-label={item.title} onClick={item.onClick}>
      <span className="vlg-row__thumb"><img src={item.image} alt="" />{isBasic ? <span className="vlg-row__basic"><ConditionPill kind="basic" /></span> : null}</span>
      <span className="vlg-row__like"><LikeButton name={item.title} on={liked} onToggle={() => setLiked((v) => !v)} size={26} /></span>
      <div className="vlg-row__main">
        <span className="vlg-row__pill">{live
          ? (item.hideLive ? null : <span className="vfc-pill vfc-pill--live">{PillIcons.live}En vivo</span>)
          : offerStyle === "pill" ? <span className="vfc-pill vfc-pill--negotiable">{PillIcons.tag}Recibe propuestas</span> : null}{condInPhoto ? <ConditionPill kind={condInPhoto} /> : null}</span>
        <p className="vlg-row__title">{item.title}</p>
        {live ? <b className="vlg-row__price"><SubasCoin size={17} />{item.price ?? "Por definir"}</b> : <b className="vlg-row__offer">{item.offerText ?? (offerStyle === "texto" ? "Recibe propuestas" : "Haz tu oferta")}</b>}
        {condInText ? <span className="vlg-row__rest vlg-row__rest--cond"><ConditionPill kind={condInText} />{item.details ? <span>{item.details}</span> : null}</span>
          : item.details ? <span className="vlg-row__rest">{item.details}</span> : null}
        {foot ? <span className="vlg-row__foot">{foot}</span> : null}
      </div>
    </article>
  );
}

export type LotGalleryProps = {
  /** La carta grande de la izquierda (normalmente <FeaturedCard height="100%" fillMedia … />). */
  featured: ReactNode;
  items: LotRowItem[];
  /** Ancho de la carta destacada en px. */
  featuredWidth?: number;
  /** Alto mínimo de la galería en px (lo que mide la destacada). */
  height?: number;
  /** Columnas de filas a la derecha (se reservan aunque estén vacías). */
  columns?: number;
  className?: string;
  /** "pill" = badge «Recibe propuestas» (opción 1). "texto" = sin badge, el texto de la fila dice «Recibe propuestas» (opción 2). */
  offerStyle?: "pill" | "texto";
  /** Dónde va la condición del bien (seminuevo, operativo…): "foto" = junto al estado; "texto" = bajo el título, antes de los datos. */
  conditionIn?: "foto" | "texto";
};

export function LotGallery({ featured, items, featuredWidth = 292, height = 386, columns = 2, className = "", offerStyle = "pill", conditionIn = "foto" }: LotGalleryProps): JSX.Element {
  return (
    <div className={`vlg${className ? ` ${className}` : ""}`}
      style={{ "--vlg-feat": `${featuredWidth}px`, "--vlg-h": `${height}px`, "--vlg-cols": columns } as CSSProperties}>
      <div className="vlg__grid">
        <div className="vlg__feat">{featured}</div>
        <div className="vlg__list">{items.map((it) => <LotRow key={it.title} item={it} offerStyle={offerStyle} conditionIn={conditionIn} />)}</div>
      </div>
    </div>
  );
}

export default LotGallery;
