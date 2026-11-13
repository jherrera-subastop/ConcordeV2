"use client";

/**
 * Mis publicaciones con casuísticas (04/11, Julio): cada fila con su badge y su menú ⋯ (Marcar como vendida, Marcar como no
 * concretada, Dar de baja…). Una sola columna (04/11, Julio): todas en la misma lista, la más reciente arriba; sin pestañas
 * ni publicaciones ocultas.
 * Badges y menú: los mismos de /components (PublicationBadge y el flujo de PublicationFlow).
 * Dar de baja (05/11, Julio): sin badge; la fila sale de la lista con la misma animación de cuando expira una negociación.
 * Desiertas (05/11): fijadas arriba de la lista, con chincheta y en negrita, hasta que se republican o se dan de baja.
 * Dar de baja se confirma en un modal (DropModal). Republicar no pregunta: la fila hace la transición al nuevo estado (republishSteps).
 * Acciones (05/11, Julio): el lab elige entre dejarlas en el menú ⋯ o mostrar Dar de baja y Republicar como botones en la fila,
 * y el color y el estilo de esos botones.
 */
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal, flushSync } from "react-dom";
import type { CSSProperties, JSX } from "react";
import { PagList } from "./Paginado";
import { PHOTO } from "./kit";
import { PUBLICATION_LABEL, PublicationBadge, PublicationPin, type PublicationStatus } from "../app/components/lib/PublicationBadge";
import { DropModal } from "../app/components/lib/DropModal";
import { REPUBLISH_DAYS, RepublishModal } from "../app/components/lib/RepublishModal";
import Button from "../concorde/components/Button";
import ProfileButton from "../concorde/components/ProfileButton";
import { ActionIcon, DROPPED_NOTE, menu, republishSteps, type Action, type PubActions } from "../app/components/PublicationFlow";
import { LabPanel } from "./LabPanel";
import "./mis-publicaciones.css";

export type PubRow = { id: string; name: string; year: number; photo: string; status: PublicationStatus; note: string; proposals?: number; leaving?: boolean; phase?: RepublishPhase; hold?: boolean };
/** Paso de la transición de Republicar. `hold`: la desierta sigue arriba hasta que termine. */
type RepublishPhase = "spin" | "out" | "in";

// Cambios hechos con el menú ⋯ (se borran al recargar).
/** Colores de los íconos en el lab. `danger`: color propio del tacho. */
const ICON_COLORS = [
  { id: "morado", label: "Morado", color: "#3B1782", hint: "Combina con el título y la marca." },
  { id: "lila", label: "Lila", color: "#7A5AD8", hint: "Morado más suave: pesa menos que el badge." },
  { id: "gris", label: "Gris", color: "#6B6878", hint: "El más discreto: resalta el badge." },
  { id: "negro", label: "Negro", color: "#191C1C", hint: "Como el texto de la fila." },
  { id: "naranja", label: "Naranja", color: "#C8620F", hint: "El acento de VMC." },
  { id: "rojo", label: "Tacho rojo", color: "#3B1782", danger: "#B42318", hint: "Tacho rojo y lo demás morado: como estaba." },
] as const;
type IconColor = (typeof ICON_COLORS)[number]["id"];
const ICON_STYLES = [
  { id: "solo", label: "Solos", hint: "Solo el ícono. Lo más limpio, pero se nota menos que se puede tocar." },
  { id: "fondo", label: "Fondo", hint: "Círculo de color suave: se ve como botón sin competir con el badge." },
  { id: "contorno", label: "Contorno", hint: "Círculo con borde: más ligero que el fondo." },
  { id: "texto", label: "Con texto", hint: "Ícono y nombre de la acción. En mobile queda solo el ícono, porque no entra." },
] as const;
type IconStyle = (typeof ICON_STYLES)[number]["id"];
/** Estilo de las acciones que abre el ⋯ dentro de la fila (11/11, propuesta para Julio: elegir en el lab). */
const ACT_STYLES = [
  // Siguiente paso (11/11): la franja «Republicar · Gratis, por 7 días →» sin abrir nada, y el tacho de Dar de baja a la vista en cuatro variantes.
  { id: "sugerencia", label: "Paso + tacho al lado", hint: "La franja de Republicar y, a su derecha, un botón cuadrado con el tacho rojo." },
  { id: "sugerencia-dentro", label: "Paso + tacho dentro", hint: "Una sola franja partida: Republicar a la izquierda y el tacho al final, separado por una línea." },
  { id: "sugerencia-esquina", label: "Paso + tacho arriba", hint: "El tacho reemplaza al ⋯ en la esquina de la fila; la franja queda solo para Republicar." },
  { id: "sugerencia-texto", label: "Paso + texto", hint: "Debajo de la franja, «Dar de baja» con su tacho como texto rojo pequeño a la derecha." },
  { id: "conectado", label: "Conectado", hint: "Tendencia 2026 (botón dividido de Material 3 Expressive): Republicar y el tacho en una sola pieza; solo la acción principal lleva color." },
  { id: "chips", label: "Píldoras", hint: "Dos píldoras chicas bajo el texto: Republicar en lila y Dar de baja en rojo suave. Lo más liviano." },
  { id: "enlaces", label: "Enlaces", hint: "Republicar como ProfileButton de Concorde (texto violeta y flecha naranja) y Dar de baja como texto rojo." },
  { id: "lista", label: "Lista", hint: "Cada acción en su renglón con ícono y flecha, como una lista de ajustes dentro de la fila." },
  { id: "violeta", label: "Botón violeta", hint: "Button secondary-sm de Concorde a todo el ancho; Dar de baja como texto rojo." },
  { id: "naranja", label: "Botón naranja", hint: "Button sm-guest de Concorde (familia de Publicar) a todo el ancho; Dar de baja como texto rojo." },
] as const;
type ActStyle = (typeof ACT_STYLES)[number]["id"];

let state = { actions: "menu" as PubActions, iconColor: "morado" as IconColor, iconStyle: "solo" as IconStyle, actStyle: "sugerencia" as ActStyle, over: {} as Record<string, { status: PublicationStatus; note: string; leaving?: boolean; phase?: RepublishPhase; hold?: boolean } | null> }; // over null: ya salió de la lista
const subs = new Set<() => void>();
const set = (x: Partial<typeof state>) => { state = { ...state, ...x }; subs.forEach((f) => f()); };
const remove = (id: string) => set({ over: { ...state.over, [id]: null } });
const patch = (id: string, x: Partial<NonNullable<(typeof state.over)[string]>>) => set({ over: { ...state.over, [id]: { ...state.over[id]!, ...x } } });
/** Al soltarse de arriba, la fila baja a su lugar deslizándose (View Transitions, donde exista). */
function slideRows(change: () => void): void {
  if (!document.startViewTransition) { change(); return; }
  const rows = [...document.querySelectorAll<HTMLElement>(".mp-row")], html = document.documentElement;
  rows.forEach((r) => { r.style.viewTransitionName = `mp-${r.dataset.pub}`; }); html.classList.add("mp-sliding");
  document.startViewTransition(() => flushSync(change)).finished.finally(() => { rows.forEach((r) => { r.style.viewTransitionName = ""; }); html.classList.remove("mp-sliding"); });
}
function republish(row: PubRow, to: PublicationStatus, note: string): void {
  set({ over: { ...state.over, [row.id]: { status: row.status, note: row.note, phase: "spin", hold: row.status === "desierta" } } });
  republishSteps((s) => {
    if (s === "out") patch(row.id, { phase: "out" });
    else if (s === "swap") patch(row.id, { status: to, note, phase: "in" });
    else { const end = () => patch(row.id, { phase: undefined, hold: false }); if (state.over[row.id]?.hold) slideRows(end); else end(); }
  });
}
const usePubs = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state, () => state);

const Chev = () => <svg className="mp-acts__chev" width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Dots = () => <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden><circle cx="4" cy="10" r="1.8" fill="currentColor" /><circle cx="10" cy="10" r="1.8" fill="currentColor" /><circle cx="16" cy="10" r="1.8" fill="currentColor" /></svg>;

/** Menú ⋯ de una fila. Va en el body (portal) para no quedar debajo ni recortado por la sección. */
function RowMenu({ row }: { row: PubRow }): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const [repub, setRepub] = useState<Action | null>(null); // 11/11: Republicar se confirma en un modal que dice cuánto dura
  const wrap = useRef<HTMLSpanElement>(null);
  const { actions, actStyle } = usePubs();
  const items = menu(row.status).filter((a) => a.to || a.drop);
  const quick = actions === "botones" ? items.filter((a) => a.icon) : [];
  // Siguiente paso (11/11): Republicar sale del ⋯ y queda a la vista como franja; en el ⋯ queda lo demás (Dar de baja).
  const step = actions === "menu" && actStyle.startsWith("sugerencia");
  const next = step ? items.find((a) => a.icon === "reload") : undefined;
  const bin = next ? items.find((a) => a.drop) : undefined; // con la franja, Dar de baja también queda a la vista
  const rest = items.filter((a) => !quick.includes(a) && a !== next && a !== bin);
  const binBtn = (cls: string, text?: boolean) => bin ? <button type="button" className={cls} aria-label={text ? undefined : `${bin.label}: ${row.name} ${row.year}`} title={text ? undefined : bin.label} onClick={() => run(bin)}><ActionIcon icon="trash" />{text ? bin.label : null}</button> : null;
  // 11/11 (propuesta para Julio): sin menú flotante. El ⋯ abre las acciones dentro de la misma fila, a todo el ancho (no tapan nada).
  const [rowEl, setRowEl] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => { setRowEl(wrap.current?.closest<HTMLElement>(".mp-row") ?? null); }, []);
  useEffect(() => { rowEl?.classList.toggle("is-acting", open); }, [open, rowEl]);
  if (row.phase === "spin" || row.phase === "out") return <span className="mp-more"><span className="mp-more__btn vpb-spin" role="status" aria-label="Republicando"><ActionIcon icon="reload" /></span></span>;
  if (!items.length) return null;
  const leave = () => { setDrop(false); set({ over: { ...state.over, [row.id]: { status: row.status, note: DROPPED_NOTE, leaving: true } } }); };
  const run = (a: Action) => {
    setOpen(false);
    if (a.drop) setDrop(true);
    else if (a.icon === "reload") setRepub(a);
    else if (a.to) set({ over: { ...state.over, [row.id]: { status: a.to, note: a.note ?? PUBLICATION_LABEL[a.to] } } });
  };
  return <span ref={wrap} className="mp-more vpb-actions">
    {quick.map((a) => <button key={a.label} type="button" className={`mp-more__btn${a.danger ? " is-danger" : ""}`} aria-label={`${a.label}: ${row.name} ${row.year}`} title={a.label} onClick={() => run(a)}><ActionIcon icon={a.icon!} /><span className="mp-more__txt">{a.label}</span></button>)}
    {actStyle === "sugerencia-esquina" ? binBtn("mp-more__btn mp-bin-corner") : null}
    {rest.length ? <button type="button" className="mp-more__btn" aria-label={`Más acciones: ${row.name} ${row.year}`} aria-expanded={open} aria-controls={`mp-acts-${row.id}`} onClick={() => setOpen((v) => !v)}><Dots /></button> : null}
    {next && rowEl ? createPortal(<div className="mp-step" data-v={actStyle}><button type="button" className="mp-next" onClick={() => run(next)}>
      <span className="mp-next__ic"><ActionIcon icon="reload" /></span>
      <span className="mp-next__txt"><b>{next.label}</b><small>Gratis, por {REPUBLISH_DAYS} días</small></span>
      <svg className="mp-next__go" width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
      {actStyle === "sugerencia" ? binBtn("mp-bin") : actStyle === "sugerencia-dentro" ? binBtn("mp-bin mp-bin--in") : actStyle === "sugerencia-texto" ? binBtn("mp-bin-text", true) : null}
    </div>, rowEl) : null}
    {open && rowEl ? createPortal(<div id={`mp-acts-${row.id}`} className="mp-acts" data-style={actStyle.startsWith("sugerencia") ? "lista" : actStyle} role="group" aria-label={`Acciones: ${row.name} ${row.year}`}
      onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); wrap.current?.querySelector<HTMLElement>("[aria-expanded]")?.focus(); } }}>
      {actStyle === "conectado" && rest.some((a) => a.icon && !a.danger) ? <span className="mp-split">
        {rest.filter((a) => a.icon).map((a, i) => a.danger
          ? <button key={a.label} type="button" className="mp-split__drop" aria-label={`${a.label}: ${row.name} ${row.year}`} title={a.label} onClick={() => run(a)}><ActionIcon icon={a.icon!} /></button>
          : <button key={a.label} type="button" className="mp-split__main" autoFocus={i === 0} onClick={() => run(a)}><ActionIcon icon={a.icon!} />{a.label}</button>)}
      </span> : rest.map((a, i) => {
        const af = i === 0;
        // Sin ícono (Ver detalle de la venta): siempre ProfileButton de Concorde.
        if (!a.icon) return <ProfileButton key={a.label} onClick={() => run(a)}>{a.label}</ProfileButton>;
        if (a.danger) return <button key={a.label} type="button" className="mp-acts__danger" autoFocus={af} onClick={() => run(a)}><ActionIcon icon={a.icon} />{a.label}{actStyle === "lista" ? <Chev /> : null}</button>;
        if (actStyle === "violeta" || actStyle === "naranja") return <Button key={a.label} variant={actStyle === "violeta" ? "secondary-sm" : "sm-guest"} className="mp-acts__ds" icon={<ActionIcon icon={a.icon} />} autoFocus={af} onClick={() => run(a)}>{a.label}</Button>;
        if (actStyle === "enlaces") return <ProfileButton key={a.label} onClick={() => run(a)}>{a.label}</ProfileButton>;
        return <button key={a.label} type="button" className="mp-acts__go" autoFocus={af} onClick={() => run(a)}><ActionIcon icon={a.icon} />{a.label}{actStyle === "lista" ? <Chev /> : null}</button>;
      })}
    </div>, rowEl) : null}
    {drop || repub ? createPortal(<>
    {drop ? <DropModal name={`${row.name} ${row.year}`} photo={PHOTO[row.photo]} note={row.note} onClose={() => setDrop(false)} onConfirm={leave} /> : null}
    {repub ? <RepublishModal name={`${row.name} ${row.year}`} photo={PHOTO[row.photo]} note={row.note} onClose={() => setRepub(null)}
      onConfirm={() => { setRepub(null); republish(row, repub.to!, repub.note ?? PUBLICATION_LABEL[repub.to!]); }} /> : null}
    </>, document.body) : null}
  </span>;
}

function Row({ row }: { row: PubRow }): JSX.Element {
  const { id, leaving } = row;
  /** Terminada la salida, la fila cierra su espacio para que las de abajo suban sin saltar. */
  const collapse = (el: HTMLElement) => el.animate([{ height: `${el.offsetHeight}px` }, { height: "0px", marginTop: "0px", marginBottom: "0px", paddingTop: "0px", paddingBottom: "0px", borderWidth: "0px" }], { duration: 280, easing: "ease-in-out", fill: "forwards" }).finished.then(() => remove(id));
  return <div data-pub={id} data-repub={row.phase} className={`fr fr--publication is-regular mp-row mp-row--${row.status}${leaving ? " is-negotiation-leaving is-expiry-exit" : ""}`}
    style={leaving ? ({ "--salida-espera": "500ms" } as CSSProperties) : undefined} onAnimationEnd={(e) => { if (leaving && e.target === e.currentTarget) void collapse(e.currentTarget); }}>
    <span className="fr__img"><img src={PHOTO[row.photo]} alt="" width={64} height={48} /></span>
    <span className="fr__main"><span className="fr__name">{row.status === "desierta" ? <PublicationPin /> : null}{row.name} {row.year}</span><span className={`vpb-note fr__meta${row.status === "revision" || row.status === "publicada" || row.status === "negociacion" ? "" : " mp-note"}`}>{row.note}</span></span>
    {leaving ? null : <span className="fr__side"><PublicationBadge status={row.status} />{row.status === "negociacion" && row.proposals ? <span className="fr__proposals"><span>Propuestas</span><b>{row.proposals}</b></span> : null}</span>}
    {leaving ? null : <RowMenu row={row} />}
  </div>;
}

/** Lab: Dar de baja y Republicar en el menú ⋯ o como botones en la fila. */
export function PubActionsLab(): JSX.Element {
  const { actions, iconColor, iconStyle, actStyle } = usePubs();
  useEffect(() => { const q = new URLSearchParams(location.search), a = q.get("pub-acciones"), c = q.get("pub-color"), e = q.get("pub-estilo");
    if (a === "menu" || a === "botones") set({ actions: a }); if (ICON_COLORS.some((o) => o.id === c)) set({ iconColor: c as IconColor }); if (ICON_STYLES.some((o) => o.id === e)) set({ iconStyle: e as IconStyle });
    const v = q.get("pub-acc"); if (ACT_STYLES.some((o) => o.id === v)) set({ actStyle: v as ActStyle }); }, []);
  const toUrl = (k: string, v: string) => { const u = new URL(location.href); u.searchParams.set(k, v); history.replaceState(null, "", u); };
  const pick = (a: PubActions) => { set({ actions: a }); toUrl("pub-acciones", a); };
  const pickColor = (c: IconColor) => { set({ iconColor: c }); toUrl("pub-color", c); };
  const pickStyle = (e: IconStyle) => { set({ iconStyle: e }); toUrl("pub-estilo", e); };
  const pickAct = (v: ActStyle) => { set({ actStyle: v }); toUrl("pub-acc", v); };
  const OPTS: { id: PubActions; label: string; hint: string }[] = [
    { id: "menu", label: "Menú ⋯", hint: "Dar de baja y Republicar van dentro de los tres puntos." },
    { id: "botones", label: "Botones", hint: "Tacho para dar de baja y flecha circular para republicar, a la vista en la fila." },
  ];
  return <LabPanel title="Acciones de publicaciones" store="mg-pub-acciones" className="f-sw--pills" side="right" closed>
    <div className="f-sw__g" role="group" aria-label="Dar de baja y republicar"><span className="f-sw__k"><b>Dar de baja y republicar</b></span>
      {OPTS.map((o) => <button key={o.id} type="button" title={o.hint} aria-pressed={actions === o.id} onClick={() => pick(o.id)}>{o.label}</button>)}
      <small className="f-sw__hint">{OPTS.find((o) => o.id === actions)?.hint}</small></div>
    {actions === "menu" ? <div className="f-sw__g" role="group" aria-label="Estilo de las acciones"><span className="f-sw__k"><b>Estilo de las acciones (⋯)</b></span>
      {ACT_STYLES.map((o) => <button key={o.id} type="button" title={o.hint} aria-pressed={actStyle === o.id} onClick={() => pickAct(o.id)}>{o.label}</button>)}
      <small className="f-sw__hint">{ACT_STYLES.find((o) => o.id === actStyle)?.hint}</small></div> : null}
    <div className="f-sw__g" role="group" aria-label="Color de los íconos"><span className="f-sw__k"><b>Color de los íconos</b></span>
      {ICON_COLORS.map((o) => <button key={o.id} type="button" title={o.hint} aria-pressed={iconColor === o.id} onClick={() => pickColor(o.id)}>{o.label}</button>)}
      <small className="f-sw__hint">{ICON_COLORS.find((o) => o.id === iconColor)?.hint}</small></div>
    <div className="f-sw__g" role="group" aria-label="Estilo de los íconos"><span className="f-sw__k"><b>Estilo de los íconos</b></span>
      {ICON_STYLES.map((o) => <button key={o.id} type="button" title={o.hint} aria-pressed={iconStyle === o.id} onClick={() => pickStyle(o.id)}>{o.label}</button>)}
      <small className="f-sw__hint">{ICON_STYLES.find((o) => o.id === iconStyle)?.hint}</small></div>
  </LabPanel>;
}

const List = ({ rows, title }: { rows: PubRow[]; title: string }) => rows.length
  ? <PagList rows={rows} title={title} render={(r) => <Row key={r.id} row={r} />} />
  : <p className="mp-empty">No hay publicaciones aquí.</p>;

/** Lista de Mis publicaciones: una sola columna, todas juntas (el orden lo da Mi Garaje: lo más reciente arriba). */
export function PubList({ rows, title }: { rows: PubRow[]; title: string }): JSX.Element {
  const st = usePubs();
  const all = rows.flatMap((r) => { const o = st.over[r.id]; return o === null ? [] : [o ? { ...r, ...o } : r]; });
  const pinned = (r: PubRow) => r.status === "desierta" || r.hold; // fijadas arriba de la lista
  const ic = ICON_COLORS.find((o) => o.id === st.iconColor)!;
  return <div className="mp" data-ic-style={st.iconStyle} style={{ "--mp-ic": ic.color, "--mp-ic-danger": "danger" in ic ? ic.danger : ic.color } as CSSProperties}><div className="fs__list"><List rows={[...all.filter(pinned), ...all.filter((r) => !pinned(r))]} title={title} /></div></div>;
}

/** Para /publicaciones: leer y mover el mismo estado de la lista desde el panel de control. */
export { usePubs as usePubStore, set as setPubStore };
