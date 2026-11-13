"use client";

/**
 * Flujo de una publicación (04/11): qué badge tiene en cada momento, qué acciones da el menú ⋯ y a qué badge lleva cada una.
 * Una sola columna (04/11, Julio): cada badge con lo que significa, cuándo llega y qué hace el menú ⋯.
 */
import { useRef, useState } from "react";
import type { JSX } from "react";
import { DropModal } from "./lib/DropModal";
import { PUBLICATION_LABEL, PublicationBadge, PublicationPin, type PublicationStatus } from "./lib/PublicationBadge";

type Kind = "subasta" | "negociable";
type State = { status: PublicationStatus; note: string };
export type Ask = { title: string; options: { label: string; to: PublicationStatus; note?: string }[] };
/** `drop`: confirma en DropModal y la publicación sale de la lista. `icon`: puede ir como botón en la fila. */
export type Action = { label: string; to?: PublicationStatus; note?: string; ask?: Ask; drop?: boolean; danger?: boolean; icon?: ActionIconName };
export type ActionIconName = "trash" | "reload";
export type PubActions = "menu" | "botones";

// 05/11 (Julio): la dada de baja no tiene badge: se confirma en un modal y sale de la lista con animación.
/** Lo que dice la fila en el instante en que se va. */
export const DROPPED_NOTE = "Publicación dada de baja";

// 05/11 (Julio): No concretada es haber estado en SubasChat sin llegar a nada. La fila dice una de estas dos; el motivo se pregunta pero no se muestra.
export const NO_DEAL_NOTE = "No llegaron a un acuerdo";
export const TIME_OUT_NOTE = "El tiempo de negociación expiró";
const NOT_DONE: Ask = { title: "¿Por qué no se concretó?", options: ["El comprador no se presentó", "No nos pusimos de acuerdo en la inspección", "Problemas con los documentos", "El comprador se arrepintió", "Otro motivo"]
  .map((label) => ({ label, to: "no-concretada" as const, note: NO_DEAL_NOTE })) };

// 05/11 (Julio): Dar de baja solo en Publicada, Desierta y No concretada.
const DROP_ACTION: Action = { label: "Dar de baja", drop: true, danger: true, icon: "trash" };
const REPUBLISH: Action = { label: "Republicar", to: "publicada", note: "Republicada hoy", icon: "reload" };

/** Republicar (05/11, Julio): sin confirmar. Carga, se va el texto de antes y entran el texto y el badge nuevos. En `swap` se cambia el estado. */
export function republishSteps(step: (s: "out" | "swap" | "done") => void): void {
  setTimeout(() => step("out"), 900); setTimeout(() => step("swap"), 1250); setTimeout(() => step("done"), 2000);
}

/** Acciones del menú ⋯ según el estado. */
export function menu(s: PublicationStatus): Action[] {
  switch (s) {
    case "revision": case "negociacion": case "subaschat": return []; // sin menú: VMC la revisa, recibe propuestas o se resuelve en el chat
    case "publicada": return [DROP_ACTION];
    case "desierta": case "no-concretada": return [REPUBLISH, DROP_ACTION];
    case "vendido": return [{ label: "Ver detalle de la venta" }];
  }
}

/** Lo que pasa sin que el vendedor toque nada (VMC o el comprador). */
export function events(s: PublicationStatus, kind: Kind): Action[] {
  switch (s) {
    case "revision": return [{ label: "VMC la aprueba", to: kind === "subasta" ? "publicada" : "negociacion", note: kind === "subasta" ? "Subasta programada" : "Recibiendo propuestas" }];
    case "publicada": return [{ label: "Cierra con ganador", to: "vendido", note: "Vendido en subasta" }, { label: "Cierra sin ofertas", to: "desierta", note: "No se recibió ninguna oferta" }];
    case "negociacion": return [{ label: "Acepta una propuesta", to: "subaschat", note: "Acuerdo por US$ 12,500" }, { label: "Vence sin ofertas", to: "desierta", note: "No se recibió ninguna oferta" }];
    case "subaschat": return [{ label: "Confirman la venta", to: "vendido", note: "Vendido en VMC" }, { label: "No se concreta", ask: NOT_DONE }, { label: "Vence el tiempo de negociación", to: "no-concretada", note: TIME_OUT_NOTE }];
    default: return [];
  }
}

const START: Record<PublicationStatus, string> = {
  revision: "Enviada a revisión",
  publicada: "Subasta programada", negociacion: "Recibiendo propuestas", subaschat: "Acuerdo por US$ 12,500", vendido: "Vendido en VMC",
  "no-concretada": NO_DEAL_NOTE, desierta: "No se recibió ninguna oferta",
};

/** Tacho para dar de baja (sale de la lista) y flecha circular para republicar. */
export const ActionIcon = ({ icon }: { icon: ActionIconName }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
  <path d={icon === "trash" ? "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" : "M20 12a8 8 0 1 1-2.6-5.9M20 3v5h-5"} /></svg>;

const Dots = () => <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden><circle cx="4" cy="10" r="1.8" fill="currentColor" /><circle cx="10" cy="10" r="1.8" fill="currentColor" /><circle cx="16" cy="10" r="1.8" fill="currentColor" /></svg>;
const Arrow = () => <svg className="pf-arrow" width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/** Estados en una columna: qué significa, cuándo llega y qué hace el menú ⋯. */
const STATES: [PublicationStatus, string, string][] = [
  ["revision", "VMC revisa la publicación antes de publicarla. Los compradores todavía no la ven.", "Al publicar o republicar"],
  ["publicada", "Subasta publicada, a la espera de su fecha.", "VMC aprueba una subasta o se republica"],
  ["negociacion", "Negociable publicada, recibiendo propuestas. Debajo se ve cuántas tiene.", "VMC aprueba una negociable"],
  ["subaschat", "Se aceptó una propuesta. Comprador y vendedor coordinan en el chat.", "El vendedor acepta una propuesta"],
  ["vendido", "Venta hecha.", "Subasta con ganador o venta confirmada en el chat"],
  ["no-concretada", "Estuvieron en SubasChat pero no llegaron a nada. Debajo dice si no hubo acuerdo o si expiró el tiempo.", "Se marca desde el SubasChat o vence el tiempo de negociación"],
  ["desierta", "No se recibió ninguna oferta. Queda fijada arriba de la lista, con chincheta y en negrita, hasta que el vendedor la republique o la dé de baja.", "Cierra sin recibir ninguna oferta"],
];
function StateList(): JSX.Element {
  return <ol className="pf-states">{STATES.map(([st, what, when]) => {
    const acts = menu(st).filter((a) => a.to || a.ask || a.drop);
    const end = (to: PublicationStatus | null | undefined) => (to ? <PublicationBadge status={to} /> : <em>Sale de la lista</em>);
    return <li key={st}>
      <PublicationBadge status={st} />
      <p>{what}</p>
      <dl>
        <div><dt>Llega cuando</dt><dd>{when}</dd></div>
        <div><dt>Menú ⋯</dt><dd>{acts.length ? acts.map((a) => <span key={a.label} className="pf-act">{a.label}<Arrow />{a.drop ? <><em>Confirma en un modal</em><Arrow />{end(null)}</> : a.ask ? <><em>{a.ask.title}</em><Arrow />{end(a.ask.options[0].to)}</> : end(a.to)}</span>) : "Sin acciones"}</dd></div>
      </dl>
    </li>;
  })}</ol>;
}

/** Fila de Mis publicaciones con el menú ⋯ para probar cada acción. */
function Simulator(): JSX.Element {
  const [kind, setKind] = useState<Kind>("negociable");
  const [state, setState] = useState<State>({ status: "negociacion", note: START.negociacion });
  const [open, setOpen] = useState(false);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [asking, setAsking] = useState(""); // acción que abrió la pregunta (Marcar como vendida, Dar de baja…)
  const [log, setLog] = useState<string[]>([]);
  const [actions, setActions] = useState<PubActions>("menu");
  const [exit, setExit] = useState<"" | "leaving" | "gone">(""); // Dar de baja: la fila se va y sale de la lista
  const [drop, setDrop] = useState(false);
  const [phase, setPhase] = useState<"" | "spin" | "out" | "in">(""); // Republicar
  const repub = useRef(0); // al reiniciar, descarta la transición que siga en curso
  const go = (label: string, to: PublicationStatus | null | undefined, note?: string) => {
    setOpen(false); setAsk(null);
    if (to === undefined) { setLog((l) => [`${label}: sin cambio de badge`, ...l].slice(0, 6)); return; }
    const from = PUBLICATION_LABEL[state.status], step = to === null ? `Dar de baja: ${label}` : asking ? `${asking}: ${label}` : label;
    setLog((l) => [`${from} → ${step} → ${to ? PUBLICATION_LABEL[to] : "Sale de la lista"}`, ...l].slice(0, 6)); setAsking("");
    if (to) setState({ status: to, note: note ?? START[to] });
    else { setState((s) => ({ ...s, note: DROPPED_NOTE })); setExit("leaving"); }
  };
  const republish = (a: Action) => {
    const id = ++repub.current; setOpen(false); setPhase("spin");
    setLog((l) => [`${PUBLICATION_LABEL[state.status]} → ${a.label} → ${PUBLICATION_LABEL[a.to!]}`, ...l].slice(0, 6));
    republishSteps((s) => { if (id !== repub.current) return; if (s === "swap") { setState({ status: a.to!, note: a.note! }); setPhase("in"); } else setPhase(s === "out" ? "out" : ""); });
  };
  const run = (a: Action) => (a.drop ? (setDrop(true), setOpen(false)) : a.icon === "reload" ? republish(a) : a.ask ? (setAsk(a.ask), setAsking(a.label), setOpen(false)) : go(a.label, a.to, a.note));
  const reset = (s: PublicationStatus) => { repub.current++; setPhase(""); setDrop(false); setState({ status: s, note: START[s] }); setOpen(false); setAsk(null); setAsking(""); setLog([]); setExit(""); };
  const starts: PublicationStatus[] = kind === "subasta"
    ? ["revision", "publicada", "desierta", "vendido"]
    : ["revision", "negociacion", "subaschat", "desierta", "no-concretada", "vendido"];
  const ev = exit ? [] : events(state.status, kind);
  const leaving = exit === "leaving", busy = phase === "spin" || phase === "out";
  const acts = menu(state.status), quick = actions === "botones" ? acts.filter((a) => a.icon) : [], rest = acts.filter((a) => !quick.includes(a));
  const runEvent = (a: Action) => (a.ask ? (setAsk(a.ask), setAsking(a.label), setOpen(false)) : go(a.label, a.to, a.note));
  return <div className="pf-sim">
    <div className="pf-sim__controls">
      <div className="pf-seg" role="group" aria-label="Tipo de publicación"><span>Tipo</span>
        {(["negociable", "subasta"] as Kind[]).map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); reset(k === "subasta" ? "publicada" : "negociacion"); }}>{k === "subasta" ? "Subasta" : "Negociable"}</button>)}</div>
      <div className="pf-seg" role="group" aria-label="Empezar en"><span>Empezar en</span>
        {starts.map((s) => <button key={s} type="button" aria-pressed={state.status === s} onClick={() => reset(s)}><PublicationBadge status={s} /></button>)}</div>
      <div className="pf-seg" role="group" aria-label="Acciones"><span>Acciones</span>
        {([["menu", "Menú ⋯"], ["botones", "Botones"]] as const).map(([id, l]) => <button key={id} type="button" aria-pressed={actions === id} onClick={() => { setActions(id); setOpen(false); setAsk(null); }}>{l}</button>)}</div>
    </div>
    <div className="pf-sim__stage">
      {exit === "gone" ? <p className="pf-gone">La publicación salió de la lista.<button type="button" onClick={() => reset(kind === "subasta" ? "publicada" : "negociacion")}>Volver a empezar</button></p> : <div className={`pf-row${leaving ? " pf-row--leaving" : ""}`} data-repub={phase || undefined} onAnimationEnd={(e) => { if (leaving && e.target === e.currentTarget) setExit("gone"); }}>
        <img src="/producto-assets/mi-garaje/garage-photos/picanto/1.jpg" alt="" />
        <span className="pf-row__main"><b>{state.status === "desierta" ? <PublicationPin /> : null}Kia Picanto 2021</b><small className={`vpb-note${["revision", "publicada", "negociacion"].includes(state.status) && !leaving ? "" : " pf-row__note"}`}>{state.note}</small></span>
        {leaving ? null : <span className="pf-row__side"><PublicationBadge status={state.status} />{state.status === "negociacion" ? <small>Propuestas <b>3</b></small> : null}</span>}
        {busy ? <span className="pf-more"><span className="pf-more__btn vpb-spin" role="status" aria-label="Republicando"><ActionIcon icon="reload" /></span></span> : leaving ? null : <span className="pf-more vpb-actions">
          {quick.map((a) => <button key={a.label} type="button" className={`pf-more__btn${a.danger ? " is-danger" : ""}`} aria-label={a.label} title={a.label} onClick={() => run(a)}><ActionIcon icon={a.icon!} /></button>)}
          {rest.length ? <button type="button" className="pf-more__btn" aria-label="Más acciones" aria-expanded={open} onClick={() => { setOpen((v) => !v); setAsk(null); }}><Dots /></button> : null}
          {open ? <div className="pf-menu" role="menu">{rest.map((a) => <button key={a.label} type="button" role="menuitem" className={a.danger ? "is-danger" : undefined} onClick={() => run(a)}>{a.label}</button>)}</div> : null}
          {ask ? <div className="pf-menu pf-menu--ask" role="dialog" aria-label={ask.title}><b>{ask.title}</b>
            {ask.options.map((o) => <button key={o.label} type="button" onClick={() => go(o.label, o.to, o.note)}>{o.label}</button>)}
            <button type="button" className="pf-menu__cancel" onClick={() => setAsk(null)}>Cancelar</button></div> : null}
        </span>}
      </div>}
      {drop ? <DropModal name="Kia Picanto 2021" photo="/producto-assets/mi-garaje/garage-photos/picanto/1.jpg" note={state.note} onClose={() => setDrop(false)} onConfirm={(reason) => { setDrop(false); go(reason, null); }} /> : null}
      {ev.length ? <div className="pf-events"><span>Lo que pasa sin que el vendedor haga nada</span>
        {ev.map((a) => <button key={a.label} type="button" onClick={() => runEvent(a)}>{a.label}</button>)}</div> : null}
      <p className="pf-hint">El texto bajo el nombre es lo que verá el vendedor en Mis publicaciones. Si la das de baja, la fila sale de la lista.</p>
      {log.length ? <div className="pf-log"><b>Lo que hiciste en esta prueba</b><ol>{log.map((l, i) => <li key={i}>{l}</li>)}</ol></div> : null}
    </div>
  </div>;
}

export default function PublicationFlow(): JSX.Element {
  return <section id="flujo-publicacion" className="cx-sec" aria-labelledby="flujo-publicacion-t">
    <style>{CSS}</style>
    <header className="cx-sec__head"><h2 id="flujo-publicacion-t">Flujo de una publicación</h2><code>⋯</code></header>
    <p className="cx-sum">Qué badge tiene la publicación en cada momento y qué pasa con las acciones del menú ⋯.</p>
    <StateList />
    <h3>Pruébalo</h3>
    <Simulator />
  </section>;
}

const CSS = `
.pf-arrow { flex: none; color: #B3A8DA; }
.pf-states { margin: 0; padding: 0; list-style: none; display: grid; max-width: 720px; border: 1px solid #ECE8F7; border-radius: 14px; background: #fff; }
.pf-states li { display: grid; gap: 6px; padding: 14px 18px; }
.pf-states li + li { border-top: 1px solid #F0EDF8; }
.pf-states li > .vpb { justify-self: start; }
.pf-states p { margin: 0; font-size: 14px; line-height: 1.5; color: #1B1340; }
.pf-states dl { margin: 0; display: grid; gap: 4px; }
.pf-states dl div { display: grid; grid-template-columns: 110px 1fr; gap: 10px; align-items: baseline; }
.pf-states dt { font-size: 12px; font-weight: 700; color: #6B6492; }
.pf-states dd { margin: 0; display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; color: #3F3866; }
.pf-act { display: inline-flex; align-items: center; gap: 6px; }
.pf-act em { font-style: normal; color: #6B6492; }

.pf-sim { display: grid; gap: 14px; }
.pf-sim__controls { display: grid; gap: 10px; }
.pf-seg { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.pf-seg > span { width: 84px; font-size: 13px; font-weight: 700; }
.pf-seg button { display: inline-flex; padding: 4px; border: 1px solid #DCD5F3; border-radius: 999px; background: #fff; color: #3D2299; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.pf-seg button:not(:has(.vpb)) { padding: 6px 12px; }
.pf-seg button[aria-pressed="true"] { border-color: #3D2299; box-shadow: 0 0 0 2px #3D2299; }
.pf-seg button[aria-pressed="true"]:not(:has(.vpb)) { background: #3D2299; color: #fff; box-shadow: none; }
.pf-sim__stage { display: grid; align-content: start; gap: 12px; min-height: 420px; padding: 20px; border: 1px solid #ECE8F7; border-radius: 16px; background: #fff; }
.pf-row { display: grid; background-color: #fff; grid-template-columns: 48px minmax(0, 1fr) auto; grid-template-areas: "img main more" "img main side"; align-items: center; gap: 2px 12px; max-width: 480px; padding: 12px; border: 1px solid #F0EDF8; border-radius: 12px; }
.pf-row img { grid-area: img; width: 48px; height: 36px; border-radius: 6px; object-fit: cover; }
.pf-row__main { grid-area: main; display: grid; gap: 4px; min-width: 0; }
.pf-row__main b { font-size: 14px; font-weight: 300; color: #191C1C; }
.pf-row__main small { font-size: 12px; color: #6B6878; }
.pf-row__side { grid-area: side; align-self: end; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.pf-row__side:has(small) { grid-row: 1 / span 2; grid-column: 3; flex-direction: column-reverse; }
.pf-row__side small { font-size: 12px; color: #6B6878; } .pf-row__side small b { margin-left: 4px; font-weight: 400; }
.pf-more { grid-area: more; justify-self: end; margin-right: -6px; position: relative; display: inline-flex; align-items: center; gap: 2px; }
.pf-more__btn { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: #3B1782; cursor: pointer; }
.pf-more__btn:hover, .pf-more__btn[aria-expanded="true"] { background: #F3EFFD; }
.pf-menu { position: absolute; top: 36px; right: 0; z-index: 5; display: grid; min-width: 220px; padding: 6px; border: 1px solid #E6E1F5; border-radius: 12px; background: #fff; box-shadow: 0 12px 28px -8px rgba(32,0,104,.25); }
.pf-menu button { padding: 9px 12px; border: 0; border-radius: 8px; background: none; color: #1B1340; font: inherit; font-size: 13.5px; text-align: left; cursor: pointer; }
.pf-menu button:hover { background: #F5F2FD; }
.pf-menu button.is-danger { color: #B42318; }
.pf-menu--ask b { padding: 8px 12px 4px; font-size: 13px; }
.pf-menu__cancel { color: #6B6492 !important; }
.pf-events { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.pf-events span { margin-right: 4px; font-size: 12px; font-weight: 700; color: #6B6492; }
.pf-events button { padding: 6px 12px; border: 1px dashed #B9B0D9; border-radius: 999px; background: #FAF9FE; color: #3D2299; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.pf-row__note { font-weight: 700; color: #191C1C !important; }
/* Dar de baja: la misma salida de cuando expira una negociación en Mi Garaje (fr-salida-crece) */
.pf-row--leaving { position: relative; z-index: 2; pointer-events: none; background: #fff; animation: pf-leave 1.2s ease-in-out .5s forwards; }
.pf-row--leaving, .pf-row--leaving * { font-weight: 700 !important; color: #191C1C !important; }
@keyframes pf-leave { 35% { opacity: 1; transform: scale(1.05); box-shadow: 0 14px 34px rgba(59,23,130,.24); } 100% { opacity: 0; transform: translateX(64px) scale(.86); box-shadow: none; } }
.pf-gone { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; max-width: 480px; margin: 0; padding: 12px; border: 1px dashed #DCD5F3; border-radius: 12px; font-size: 13.5px; color: #6B6492; }
.pf-gone button { padding: 6px 12px; border: 1px solid #DCD5F3; border-radius: 999px; background: #fff; color: #3D2299; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.pf-hint { margin: 0; font-size: 12.5px; color: #6B6492; }
.pf-log { display: grid; gap: 4px; padding: 10px 14px; border-radius: 10px; background: #FAF9FE; }
.pf-log b { font-size: 12px; color: #3D2299; }
.pf-log ol { margin: 0; padding-left: 18px; font-size: 12.5px; color: #6B6492; }

@media (max-width: 900px) { .pf-states dl div { grid-template-columns: 1fr; gap: 2px; } .pf-seg > span { width: 100%; } }
`;
