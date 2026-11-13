"use client";

/**
 * /publicaciones (11/11, propuesta para Julio): Mis publicaciones en vivo, en una sola pantalla sin scroll.
 * Izquierda: el widget real de /producto/mi-garaje/m/vmc (PubList, con su ícono de vidrio, pin, modal de baja, republicar y paginado).
 * Derecha: los controles de la publicación elegida (recorrido, lo que hacen VMC o el comprador) y el historial.
 * Widget y panel usan el mismo estado (usePubStore de MisPublicaciones); las transiciones son las de PublicationFlow.
 */
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { PUBLICATION_LABEL as LABEL, type PublicationStatus } from "../components/lib/PublicationBadge";
import { events, type Action, type Ask } from "../components/PublicationFlow";
import { PubActionsLab, PubList, setPubStore, usePubStore, type PubRow } from "@/src/product/mi-garaje/models/MisPublicaciones";
import { PagLab } from "@/src/product/mi-garaje/models/Paginado";
import { Chevron } from "@/src/product/mi-garaje/models/Garaje";
import { Vidrio } from "@/src/product/mi-garaje/app/iconos/Vidrio";
import "./publicaciones.css";

type Kind = "subasta" | "negociable";
type Over = ReturnType<typeof usePubStore>["over"];

const DONE = new Set<PublicationStatus>(["vendido", "no-concretada", "desierta"]);

/** Texto bajo el nombre al llegar a un estado (mismo tono que /producto/mi-garaje/m/vmc). */
const note = (s: PublicationStatus, k: Kind): string => ({
  revision: "Enviada a revisión",
  publicada: "Subasta el 12/11 · 3:00 pm",
  negociacion: "Publicado: 11/11/2026",
  subaschat: "Acuerdo por US$ 12,500",
  vendido: k === "subasta" ? "Vendido en subasta" : "Vendido en VMC",
  "no-concretada": "No llegaron a un acuerdo",
  desierta: "No se recibió ninguna oferta",
})[s];

const KIND: Record<string, Kind> = {};
const pub = (id: string, name: string, year: number, kind: Kind, status: PublicationStatus, detail?: string, proposals?: number): PubRow =>
  ((KIND[id] = kind), { id, name, year, photo: id, status, note: detail ?? note(status, kind), proposals });

// Las mismas filas de /producto/mi-garaje/m/vmc; con 7 pagina igual que allá.
const ROWS: PubRow[] = [
  pub("swift", "Suzuki Swift", 2020, "subasta", "desierta"),
  pub("rio", "Kia Rio", 2021, "negociable", "subaschat"),
  pub("etios", "Toyota Etios", 2020, "subasta", "publicada"),
  pub("sail", "Chevrolet Sail", 2019, "negociable", "no-concretada"),
  pub("mazda3", "Mazda 3", 2018, "negociable", "no-concretada", "El tiempo de negociación expiró"),
  pub("picanto", "Kia Picanto", 2021, "negociable", "negociacion", "Publicado: 27/10/2026", 3),
  pub("accent", "Hyundai Accent", 2018, "negociable", "revision"),
];

type Step = { st: PublicationStatus; how: string; end?: { st: PublicationStatus; how: string } };
const PATH: Record<Kind, Step[]> = {
  negociable: [
    { st: "revision", how: "Tú la publicas" },
    { st: "negociacion", how: "VMC la aprueba", end: { st: "desierta", how: "Vence sin ofertas" } },
    { st: "subaschat", how: "Aceptas una propuesta", end: { st: "no-concretada", how: "No se concreta" } },
    { st: "vendido", how: "Confirman la venta" },
  ],
  subasta: [
    { st: "revision", how: "Tú la publicas" },
    { st: "publicada", how: "VMC la aprueba", end: { st: "desierta", how: "Cierra sin ofertas" } },
    { st: "vendido", how: "Cierra con ganador" },
  ],
};

/** Pregunta con opciones para los eventos que la piden (No se concreta). Ventana nativa: foco atrapado y Esc para cerrar. */
function AskDialog({ ask, onPick, onClose }: { ask: Ask; onPick: (o: Ask["options"][number]) => void; onClose: () => void }): JSX.Element {
  const ref = useRef<HTMLDialogElement>(null);
  const [pick, setPick] = useState(0);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="pb-dialog" onClose={onClose} aria-labelledby="pb-dialog-t">
    <form method="dialog" onSubmit={(e) => { e.preventDefault(); onPick(ask.options[pick]); }}>
      <h3 id="pb-dialog-t">{ask.title}</h3>
      <fieldset>{ask.options.map((o, i) => <label key={o.label}>
        <input type="radio" name="pb-ask" checked={pick === i} onChange={() => setPick(i)} />{o.label}</label>)}</fieldset>
      <div className="pb-dialog__actions">
        <button type="button" className="pb-btn pb-btn--ghost" onClick={() => ref.current?.close()}>Cancelar</button>
        <button type="submit" className="pb-btn">Confirmar</button>
      </div>
    </form>
  </dialog>;
}

type Log = { id: number; text: string; by: string };
const rowsOf = (over: Over) => ROWS.flatMap((r) => { const o = over[r.id]; return o === null ? [] : [o ? { ...r, ...o } : r]; });

export default function Publicaciones(): JSX.Element {
  const { over } = usePubStore();
  const rows = rowsOf(over);
  const [sel, setSel] = useState("rio");
  const [asking, setAsking] = useState<{ ask: Ask; by: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; undo: Over } | null>(null);
  const [log, setLog] = useState<Log[]>([]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 5000); return () => clearTimeout(t); }, [toast]);
  const p = rows.find((x) => x.id === sel) ?? rows[0];
  const kind = KIND[p?.id] ?? "negociable";

  // El historial sale de comparar el estado antes y después, así registra también lo que se hace en el widget (menú ⋯, modal, republicar).
  const by = useRef<string | null>(null);
  const prev = useRef(over);
  useEffect(() => {
    const before = rowsOf(prev.current), undo = prev.current; prev.current = over;
    const who = by.current ?? "Tú"; by.current = null;
    for (const r of rowsOf(over)) {
      const b = before.find((x) => x.id === r.id);
      if (!b || (b.status === r.status && Boolean(b.leaving) === Boolean(r.leaving))) continue;
      const to = r.leaving ? "Dada de baja" : LABEL[r.status];
      setLog((l) => [{ id: Date.now() + Math.random(), text: `${r.name} ${r.year}: ${LABEL[b.status]} → ${to}`, by: who }, ...l].slice(0, 6));
      setToast({ msg: `${r.name} ${r.year}: ${to}`, undo });
      setSel(r.id);
    }
  }, [over]);

  const move = (to: PublicationStatus, who: string, detail?: string) => {
    if (!p || (p.status === to && !detail)) return;
    by.current = who;
    setPubStore({ over: { ...over, [p.id]: { status: to, note: detail ?? note(to, kind) } } });
  };
  const runEvent = (a: Action) => {
    const who = a.label.startsWith("VMC") ? "VMC" : "Automático";
    if (a.ask) setAsking({ ask: a.ask, by: who });
    else if (a.to) move(a.to, who, a.note && a.to === "no-concretada" ? a.note : undefined);
  };
  const reset = () => { by.current = "Reinicio"; prev.current = {}; setPubStore({ over: {} }); setLog([]); setToast(null); setSel("rio"); };
  const ev = p ? events(p.status, kind) : [];
  // Función, no componente: así el botón no se vuelve a montar y no pierde el foco al tocarlo.
  const node = (st: PublicationStatus, how: string, end?: boolean) =>
    <button key={st} type="button" className={`pb-node is-${st}${end ? " pb-node--end" : ""}`} aria-current={p?.status === st ? "step" : undefined}
      onClick={() => move(st, "Simulado")}><small>{how}</small><span><i aria-hidden />{LABEL[st]}</span></button>;

  return <div className="pb">
    <header className="pb-head">
      <div><p className="pb-k">Mi Garaje · Propuesta para Julio</p><h1>Mis publicaciones en vivo</h1></div>
      <nav>
        <a className="pb-link" href="/producto/mi-garaje/m/vmc">Mi Garaje</a>
        <a className="pb-link" href="/components#flujo-publicacion">Flujo en /components</a>
        <button type="button" className="pb-link" onClick={reset}>Reiniciar</button>
      </nav>
    </header>

    <div className="pb-stage">
      {/* El widget real: mismos contenedores que /producto/mi-garaje/m/vmc para heredar sus estilos. */}
      <div className="g-page g--fuente g--vmc pb-real" onClick={(e) => { const id = (e.target as HTMLElement).closest("[data-pub]")?.getAttribute("data-pub"); if (id) setSel(id); }}>
        {p ? <style>{`.pb-real [data-pub="${p.id}"] { outline: 2px solid #8460E5; outline-offset: -2px; }`}</style> : null}
        <div className="f-src"><div className="fa">
          <section className="fs fs--publicaciones is-open" aria-labelledby="pb-fs">
            <header className="fs__head"><h3 className="fs__h"><span className="fs__toggle vd-host" aria-expanded="true">
              <span className="fs__title"><span className="fs__icon fs__icon--glass" aria-hidden><Vidrio s="publicaciones" size={36} /></span><span id="pb-fs" className="fs__name">Mis publicaciones</span></span>
              <span className="fs__chev"><Chevron /></span></span></h3></header>
            <div className="fs__wrap"><div className="fs__body"><PubList rows={ROWS} title="Mis publicaciones" /></div></div>
          </section>
        </div></div>
      </div>

      <section className="pb-panel" aria-label="Controles">
        <div className="pb-box">
          <p className="pb-box__k">Publicación elegida · toca otra fila para cambiar</p>
          {p ? <>
            <h2 className="pb-box__t"><img src={`/producto-assets/mi-garaje/garage-photos/${p.photo}/1.jpg`} alt="" width={40} height={30} />{p.name} {p.year}<small>{kind === "subasta" ? "Subasta" : "Negociable"}</small></h2>
            <ol className="pb-path">{PATH[kind].map((s) => <li key={s.st}>
              {node(s.st, s.how)}
              {s.end ? <div className="pb-path__end">{node(s.end.st, s.end.how, true)}</div> : null}
            </li>)}</ol>
            <p className="pb-path__foot">Toca un paso para llevar la publicación ahí. <b>Republicar</b> y <b>Dar de baja</b> los hace el vendedor desde la fila (menú ⋯ o botones, según el panel Acciones).</p>
          </> : <p className="pb-empty">No quedan publicaciones. Usa Reiniciar.</p>}
        </div>

        <div className="pb-duo">
          <div className="pb-box">
            <p className="pb-box__k">Lo que pasa sin que el vendedor haga nada</p>
            {ev.length ? <div className="pb-events">{ev.map((a) => <button key={a.label} type="button" onClick={() => runEvent(a)}>{a.label}</button>)}</div>
              : <p className="pb-empty">{p && DONE.has(p.status) ? "Terminó. Ahora le toca al vendedor desde la fila." : "Nada por ahora."}</p>}
          </div>
          <div className="pb-box">
            <p className="pb-box__k">Historial</p>
            {log.length ? <ol className="pb-log">{log.map((l) => <li key={l.id}><span>{l.text}</span><small>{l.by}</small></li>)}</ol>
              : <p className="pb-empty">Usa la fila del widget, los pasos del recorrido o los botones de VMC y aquí verás cada cambio.</p>}
          </div>
        </div>
      </section>
    </div>

    <PagLab />
    <PubActionsLab />
    {asking ? <AskDialog key={asking.ask.title} ask={asking.ask} onClose={() => setAsking(null)}
      onPick={(o) => { move(o.to, asking.by, o.note); setAsking(null); }} /> : null}
    <div className="pb-toast" role="status" aria-live="polite" hidden={!toast}>{toast?.msg}
      {toast ? <button type="button" onClick={() => { by.current = "Deshacer"; setPubStore({ over: toast.undo }); setLog((l) => l.slice(1)); setToast(null); }}>Deshacer</button> : null}</div>
  </div>;
}
