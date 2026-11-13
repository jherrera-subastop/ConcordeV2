/** PublicationBadge: estado de una publicación en Mis publicaciones. Solo depende de React y publication-badge.css. */
import type { JSX } from "react";
import "./publication-badge.css";

export type PublicationStatus =
  | "revision" | "publicada" | "negociacion" | "subaschat"
  | "vendido" | "no-concretada" | "desierta";

export const PUBLICATION_LABEL: Record<PublicationStatus, string> = {
  revision: "En revisión",
  publicada: "Publicada",
  negociacion: "En negociación",
  subaschat: "SubasChat",
  vendido: "Venta exitosa",
  "no-concretada": "No concretada",
  desierta: "Desierta",
};

export function PublicationBadge({ status, label }: { status: PublicationStatus; label?: string }): JSX.Element {
  const text = label ?? PUBLICATION_LABEL[status];
  return <span className={`vpb vpb--${status}`} role="status" aria-label={text}><span>{text}</span></span>;
}

/** Chincheta de una publicación fijada arriba de la lista (las desiertas). Va antes del nombre. */
export function PublicationPin(): JSX.Element {
  return <svg className="vpb-pin" viewBox="0 0 24 24" role="img" aria-label="Fijada"><title>Fijada</title><path d="M16 9V4h1a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2h1v5a3 3 0 0 1-3 3v2h6v7l1 1 1-1v-7h6v-2a3 3 0 0 1-3-3z" fill="currentColor" /></svg>;
}

export default PublicationBadge;
