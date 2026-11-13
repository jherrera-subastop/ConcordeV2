"use client";

/**
 * Paginado de las secciones de Tu actividad (29/10, bug de la app real: con 5 publicaciones solo salían 3 y la recién publicada
 * no aparecía). Quedó «Páginas»: 5 filas por página con ‹ 1 2 3 › al pie. El panel «Paginado» compara su estilo (sólido o
 * vidrio) y su tamaño (mediano o chico) (?pag=…&pagt=…). La lista va de la más reciente a la más antigua.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import type { JSX, ReactNode } from "react";
import { LabPanel } from "./LabPanel";
import "./paginado.css";

export type PagMode = "paginas" | "glass";
export const PAG_MODES: { id: PagMode; label: string; hint: string }[] = [
  { id: "paginas", label: "Páginas", hint: "La página actual en un círculo violeta sólido; las demás, número gris sin fondo." },
  { id: "glass", label: "Páginas glass", hint: "Vidrio: la página actual en violeta translúcido con brillo y borde lila; las demás, en una píldora de vidrio." },
];
export type PagSize = "m" | "s";
export const PAG_SIZES: { id: PagSize; label: string; hint: string }[] = [
  { id: "m", label: "Mediano", hint: "Botones de 22 px." },
  { id: "s", label: "Chico", hint: "Botones de 18 px." },
];

// Estado compartido del lab (forma, tamaño y filas de ejemplo de más), para que FSection lo lea sin pasar props por todo Garaje.
// 29/10: por defecto, Páginas glass en tamaño chico.
let state: { mode: PagMode; size: PagSize; extra: boolean } = { mode: "glass", size: "s", extra: true };
const subs = new Set<() => void>();
const set = (x: Partial<typeof state>) => { state = { ...state, ...x }; subs.forEach((f) => f()); };
export const usePag = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state, () => state);

const PER = 5; // 29/10: 5 por página
const Chev = ({ dir }: { dir: 1 | -1 }) => <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d={dir > 0 ? "M8 5l5 5-5 5" : "M12 5l-5 5 5 5"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/** Envuelve la lista de una sección: 5 filas por página y la numeración al pie (solo si hay más de 5). */
export function PagList<T extends { id: string }>({ rows, title, render, reset }: { rows: T[]; title: string; render: (r: T, i: number) => ReactNode; reset?: unknown }): JSX.Element {
  const { mode, size } = usePag();
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [reset]);
  const n = rows.length, pages = Math.max(1, Math.ceil(n / PER));
  if (n <= PER) return <>{rows.map(render)}</>;
  const p = Math.min(page, pages - 1), go = (x: number) => setPage(Math.max(0, Math.min(pages - 1, x)));
  return <>{rows.slice(p * PER, p * PER + PER).map((r, i) => render(r, p * PER + i))}
    <nav className={`pg-foot pg-nums pg-nums--${mode} pg-nums--${size}`} aria-label={`Páginas de ${title}`}>
      <button type="button" className="pg-arrow" aria-label="Página anterior" disabled={p === 0} onClick={() => go(p - 1)}><Chev dir={-1} /></button>
      <span className="pg-nums__set">{Array.from({ length: pages }, (_, i) => <button key={i} type="button" className="pg-num" aria-current={i === p ? "page" : undefined} onClick={() => go(i)}>{i + 1}</button>)}</span>
      <button type="button" className="pg-arrow" aria-label="Página siguiente" disabled={p === pages - 1} onClick={() => go(p + 1)}><Chev dir={1} /></button></nav></>;
}

/** Panel del lab. */
export function PagLab(): JSX.Element {
  const { mode, size, extra } = usePag();
  // Al elegir (o llegar con ?pag=…) se abre «Mis publicaciones» y la página baja hasta ella: es donde se ve el cambio.
  const show = () => { const sec = document.getElementById("sec-publicaciones"); if (!sec) return;
    if (!sec.classList.contains("is-open")) sec.querySelector<HTMLButtonElement>(".fs__toggle")?.click();
    setTimeout(() => scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 16, behavior: "smooth" }), 300); };
  const toUrl = (k: string, v: string) => { const u = new URL(location.href); u.searchParams.set(k, v); history.replaceState(null, "", u); };
  useEffect(() => { const q = new URLSearchParams(location.search), m = q.get("pag"), t = q.get("pagt");
    if (PAG_MODES.some((x) => x.id === m)) set({ mode: m as PagMode }); if (PAG_SIZES.some((x) => x.id === t)) set({ size: t as PagSize });
    if (m || t) setTimeout(show, 600); }, []);
  return <LabPanel title="Paginado" store="mg-paginado" className="f-sw--pag" side="right" defaultOpen>
    <div className="f-sw__g" role="group" aria-label="Estilo del paginado"><span className="f-sw__k"><b>Estilo</b> · secciones de Tu actividad</span>
      {PAG_MODES.map((o) => <button key={o.id} type="button" aria-pressed={mode === o.id} title={o.hint} onClick={() => { set({ mode: o.id }); toUrl("pag", o.id); show(); }}>{o.label}</button>)}
      <small className="f-sw__hint">{PAG_MODES.find((o) => o.id === mode)?.hint}</small></div>
    <div className="f-sw__g" role="group" aria-label="Tamaño del paginado"><span className="f-sw__k"><b>Tamaño</b></span>
      {PAG_SIZES.map((o) => <button key={o.id} type="button" aria-pressed={size === o.id} title={o.hint} onClick={() => { set({ size: o.id }); toUrl("pagt", o.id); show(); }}>{o.label}</button>)}
      <small className="f-sw__hint">{PAG_SIZES.find((o) => o.id === size)?.hint}</small></div>
    <div className="f-sw__g"><label className="pg-chk"><input type="checkbox" checked={extra} onChange={(e) => set({ extra: e.target.checked })} />8 publicaciones de ejemplo (en vez de 2)</label></div>
  </LabPanel>;
}
