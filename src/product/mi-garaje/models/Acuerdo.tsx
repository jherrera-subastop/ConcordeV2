"use client";

/**
 * Acuerdo (29/10): lo que pasa con la publicación y el detalle después de que se acepta una propuesta.
 * 1) Mis publicaciones: En revisión → Publicada → En negociación (con propuestas, cian) → SubasChat (aceptada, magenta): la venta
 *    sigue en SubasChat.
 *    Dos semanas después ambas partes confirman en el chat si se dio la transferencia y el recojo: «Vendido» o «No concretada».
 * 2) Panel de la negociación: la tarjeta del auto lleva al detalle de la oferta (/producto/mi-garaje/m/oferta), donde el chat reemplaza al
 *    DetailCard. Solo para el comprador y el vendedor del acuerdo, y solo con el chat abierto.
 * El panel «Acuerdo» compara los textos de cada badge (?acpub=…); ?acuerdo=chat abre el chat.
 * Ir al detalle (02/11, Julio): queda «Tarjeta + enlace»: se ve «Ir a detalle» y toda la cabecera es clicable con su hover.
 */
import { useEffect, useSyncExternalStore } from "react";
import type { JSX } from "react";
import { LabPanel } from "./LabPanel";
import "./acuerdo.css";

export type Deal = "aceptada" | "vendida" | "no";
export type DealSim = "flujo" | Deal;
export type DetailGo = "tarjeta" | "enlace" | "ambos";
type Opt<T extends string> = { id: T; label: string; hint: string };

export const ACCEPTED: Opt<string>[] = [
  { id: "subaschat", label: "SubasChat", hint: "Dice dónde sigue la venta: se coordina en el chat. En magenta, para distinguirlo de «En negociación» (cian)." },
  { id: "aceptada", label: "Negociación aceptada", hint: "Dice qué pasó. Es el texto más largo: ocupa casi el doble que «Publicada»." },
  { id: "acuerdo", label: "Con acuerdo", hint: "Corto y neutro: hay precio pactado, falta concretar." },
  { id: "coordinando", label: "Coordinando", hint: "Dice qué hacen ahora comprador y vendedor: la visita, la transferencia y el recojo." },
];
export const SOLD: Opt<string>[] = [
  { id: "vendido", label: "Vendido", hint: "Ambas partes confirmaron en SubasChat la transferencia y el recojo." },
  { id: "concretada", label: "Venta concretada", hint: "Mismo caso; empareja con «No concretada»." },
];
export const LOST: Opt<string>[] = [
  { id: "noconcretada", label: "No concretada", hint: "Una de las partes indicó que no se dio la transferencia o el recojo." },
  { id: "sinventa", label: "Sin venta", hint: "Más corto; no dice por qué." },
  { id: "cancelada", label: "Venta cancelada", hint: "Suena a que alguien la canceló; úsalo solo si VMC registra quién." },
];
export const SIMS: Opt<DealSim>[] = [
  { id: "flujo", label: "Según el flujo", hint: "La publicación cambia cuando aceptas una propuesta del Volkswagen Nivus (o el comprador acepta la tuya)." },
  { id: "aceptada", label: "Aceptada", hint: "Propuesta aceptada: la venta sigue en SubasChat." },
  { id: "vendida", label: "Vendida", hint: "A las 2 semanas, ambas partes confirmaron la venta en SubasChat." },
  { id: "no", label: "No concretada", hint: "A las 2 semanas, una de las partes indicó que no se concretó." },
];

let state = { sim: "flujo" as DealSim, accepted: "subaschat", sold: "vendido", lost: "noconcretada", go: "ambos" as DetailGo };
const subs = new Set<() => void>();
const set = (x: Partial<typeof state>) => { state = { ...state, ...x }; subs.forEach((f) => f()); };
export const useAcuerdo = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state, () => state);

const labelOf = (opts: Opt<string>[], id: string) => (opts.find((o) => o.id === id) ?? opts[0]).label;
/** Badge de la publicación según el acuerdo (mismo tamaño y forma que BadgeStatus). */
export function DealBadge({ deal }: { deal: Deal }): JSX.Element {
  const a = useAcuerdo();
  const label = deal === "aceptada" ? labelOf(ACCEPTED, a.accepted) : deal === "vendida" ? labelOf(SOLD, a.sold) : labelOf(LOST, a.lost);
  return <span className={`badgestatus ac-badge ac-badge--${deal}`} role="status" aria-label={label}>
    {deal === "vendida" ? <svg width="10" height="10" viewBox="0 0 20 20" aria-hidden><path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
    <span>{label}</span></span>;
}
/** 30/10 (Aaron): la publicación con propuestas y sin acuerdo. Ciclo: En revisión → Publicada → En negociación → SubasChat. */
export function NegotiatingBadge(): JSX.Element {
  return <span className="badgestatus ac-badge ac-badge--negociacion" role="status" aria-label="En negociación"><span>En negociación</span></span>;
}

/** Panel del lab. */
export function AcuerdoLab({ onTry }: { onTry?: () => void }): JSX.Element {
  const a = useAcuerdo();
  const toUrl = (k: string, v: string) => { const u = new URL(location.href); u.searchParams.set(k, v); history.replaceState(null, "", u); };
  // Al simular un estado se abre «Mis publicaciones» y la página baja hasta ella.
  const show = () => { const sec = document.getElementById("sec-publicaciones"); if (!sec) return;
    if (!sec.classList.contains("is-open")) sec.querySelector<HTMLButtonElement>(".fs__toggle")?.click();
    setTimeout(() => scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 16, behavior: "smooth" }), 300); };
  useEffect(() => { const q = new URLSearchParams(location.search), p = q.get("acpub");
    if (SIMS.some((x) => x.id === p)) { set({ sim: p as DealSim }); setTimeout(show, 600); }
    // ?acuerdo=chat: abre directo el chat del acuerdo (vendedor del Nivus) para probar «Ir a detalle».
    if (q.get("acuerdo") === "chat" && onTry) setTimeout(onTry, 800); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const group = <T extends string>(k: keyof typeof state, title: string, sub: string, opts: Opt<T>[], url?: string, after?: () => void) =>
    <div className="f-sw__g" role="group" aria-label={title}><span className="f-sw__k"><b>{title}</b>{sub ? ` · ${sub}` : ""}</span>
      {opts.map((o) => <button key={o.id} type="button" aria-pressed={a[k] === o.id} title={o.hint} onClick={() => { set({ [k]: o.id } as Partial<typeof state>); if (url) toUrl(url, o.id); after?.(); }}>{o.label}</button>)}
      <small className="f-sw__hint">{opts.find((o) => o.id === a[k])?.hint}</small></div>;
  return <LabPanel title="Acuerdo" store="mg-acuerdo" className="f-sw--acuerdo" side="right" defaultOpen>
    {onTry ? <div className="f-sw__g" role="group" aria-label="Probar ir al detalle" data-acts><span className="f-sw__k"><b>Probar</b> · ir al detalle</span>
      <button type="button" onClick={onTry}>Abrir el chat del acuerdo<small>vendedor · Nivus</small></button>
      <small className="f-sw__hint">Abre el panel con el chat ya habilitado. Ahí haz clic en la foto del auto o en «Ir a detalle».</small></div> : null}
    {group("sim", "Estado", "publicación del Volkswagen Nivus", SIMS, "acpub", show)}
    {group("accepted", "Badge", "propuesta aceptada", ACCEPTED, undefined, show)}
    {group("sold", "Badge", "venta confirmada", SOLD, undefined, show)}
    {group("lost", "Badge", "venta no concretada", LOST, undefined, show)}
  </LabPanel>;
}
