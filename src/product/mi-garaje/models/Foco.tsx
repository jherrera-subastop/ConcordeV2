"use client";

/**
 * Foco al llegar (22/10, rama focus-negociable): cómo Mi Garaje señala la fila de la propuesta recién enviada cuando el
 * comprador llega desde el detalle (/producto/mi-garaje/m/vmc?propuesta=…). Doce maneras para comparar desde el panel «Foco al llegar»,
 * salidas de la investigación de UI/UX (spotlights de Driver.js · Shepherd · Intro.js · Joyride · Chameleon; wayfinding de
 * Gmail · Airbnb · SAP Fiori; movimiento de Material 3; NN/g y WAI-ARIA APG).
 * - Con velo: el resto se oscurece (y se desenfoca) y la fila se ve por un hueco redondeado (clip-path evenodd sobre el velo:
 *   la fila no se mueve de capa, así que sigue siendo clicable). Cierran «Entendido», Esc, un clic en el velo o en la fila.
 * - Sin velo: no bloquean; el aviso vive junto a la fila.
 * Comunes: arranca 450 ms después de llegar (fila pintada, sin toques fantasma), foco en «Entendido» y de vuelta a la fila
 * al cerrar, «24 horas» escrito completo (lectores de pantalla), sin movimiento con prefers-reduced-motion.
 */
import { LabPanel } from "./LabPanel";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Vidrio } from "@/src/product/mi-garaje/app/iconos/Vidrio";
import Button from "@/src/product/mi-garaje/concorde/components/Button";
import "./foco.css";

export type FocoId = "nitido" | "esmerilado" | "precision" | "elevar" | "cajon" | "vuelo" | "aparece" | "popover" | "empuja" | "expande" | "chip" | "toast" | "actual";
export const FOCOS: { id: FocoId; name: string; veil: boolean; hint: string }[] = [
  { id: "nitido", name: "Nítido", veil: true, hint: "La principal. Spotlight clásico (Driver.js, Intro.js): fondo oscuro sin blur, la fila con el borde de Esmerilado y el aviso con flecha." },
  { id: "esmerilado", name: "Esmerilado", veil: true, hint: "Fondo oscuro con blur: la fila queda nítida con aro morado y el aviso debajo, con flecha." },
  { id: "precision", name: "Precisión", veil: true, hint: "El hueco solo en la línea de estado, que es la que cambia cuando el vendedor responde; el aro late tres veces." },
  { id: "elevar", name: "Elevar", veil: true, hint: "La fila crece y se separa del fondo con blur; el aviso sale pegado a ella, como una sola tarjeta." },
  { id: "cajon", name: "Cajón", veil: true, hint: "Con blur, un cartel se desliza desde debajo de la fila y vuelve a entrar al cerrar." },
  { id: "vuelo", name: "Vuelo", veil: true, hint: "La confirmación del modal («Propuesta enviada») vuela hasta su fila: une la página anterior con esta." },
  { id: "aparece", name: "Aparece", veil: false, hint: "Un cartel morado aparece bajo la fila con un fundido de arriba hacia abajo y se oculta solo a los 6 s (o con «Entendido»)." },
  { id: "popover", name: "Popover", veil: false, hint: "Aviso flotante con flecha, sin bloquear la página; al cerrar queda en la fila un chip con las 24 horas." },
  { id: "empuja", name: "Empuja", veil: false, hint: "Una tarjeta abre espacio bajo la fila (no tapa nada) y las otras filas se atenúan; al cerrar se recoge." },
  { id: "expande", name: "Expande", veil: false, hint: "La fila misma crece y muestra el aviso dentro (como la Dynamic Island); el aro late dos veces." },
  { id: "chip", name: "Chip", veil: false, hint: "Nada que cerrar: la fila queda marcada con las 24 horas del vendedor (patrón de Airbnb y SAP Fiori)." },
  { id: "toast", name: "Toast", veil: false, hint: "Aviso abajo al estilo Gmail («Mensaje enviado · Ver»); la fila brilla 1.5 s y el aviso se va solo a los 8 s." },
  { id: "actual", name: "Actual", veil: false, hint: "Lo que hay hoy: línea cian bajo la fila y brillo de 2.4 s." },
];
const VEIL = new Set(FOCOS.filter((f) => f.veil).map((f) => f.id));
// Salida de cada una (ms): lo que tarda en irse antes de devolver el foco a la fila.
const OUT: Partial<Record<FocoId, number>> = { aparece: 560, elevar: 300, cajon: 420, empuja: 260, expande: 260, popover: 200, toast: 200 };
const TITLE = "Aquí verás la respuesta del vendedor";
const BODY = "Tiene 24 horas para aceptar, contraproponer o rechazar.";
const ROW = "[data-foco-row]";
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "idle" | "wait" | "on" | "out" | "done";
export type Foco = { id: FocoId; n: number; phase: Phase; replay: (id: FocoId) => void; dismiss: (back?: boolean) => void; stop: () => void };

/** Fases de la llegada: wait (450 ms) → on → out (lo que tarda en irse) → done. replay() repite la llegada desde arriba. */
export function useFoco(arriving: boolean): Foco {
  const [id, setId] = useState<FocoId>("nitido"); // Nítido es la principal (Aaron, 22/10)
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<Phase>(arriving ? "wait" : "idle");
  // ?foco=… (el panel lo escribe en la URL, así sobrevive a recargar); llegando desde el detalle, siempre la principal.
  useEffect(() => { const s = new URLSearchParams(location.search).get("foco");
    if (s && FOCOS.some((f) => f.id === s)) setId(s as FocoId); }, []);
  const replay = useCallback((next: FocoId) => {
    setId(next); setN((x) => x + 1); setPhase("wait");
    const u = new URL(location.href); u.searchParams.set("foco", next); history.replaceState(null, "", u);
  }, []);
  const back = useRef(true);
  const dismiss = useCallback((b = true) => { back.current = b; setPhase((p) => (p === "on" ? "out" : p)); }, []);
  const stop = useCallback(() => setPhase("idle"), []);
  useEffect(() => { if (phase !== "wait") return;
    document.querySelector(ROW)?.scrollIntoView({ block: "center" });
    const t = setTimeout(() => setPhase("on"), 450); return () => clearTimeout(t); }, [phase, n]);
  useEffect(() => { if (phase !== "out") return;
    const t = setTimeout(() => { setPhase("done"); if (back.current) document.querySelector<HTMLElement>(`${ROW} > .fr`)?.focus({ preventScroll: true }); }, still() ? 0 : OUT[id] ?? 200);
    return () => clearTimeout(t); }, [phase, id]);
  // El estado vive en <html> (data-foco, data-foco-fase): el CSS de la fila y de la lista cuelga de ahí sin tocar FRow.
  useEffect(() => { const h = document.documentElement.dataset, live = phase === "on" || phase === "out";
    if (live) { h.foco = id; h.focoFase = phase; } else { delete h.foco; delete h.focoFase; }
    if (live && VEIL.has(id)) h.focoLock = ""; else delete h.focoLock;
    if (phase !== "idle") h.focoArrival = ""; else delete h.focoArrival; }, [id, phase]);
  useEffect(() => () => { const h = document.documentElement.dataset; delete h.foco; delete h.focoFase; delete h.focoLock; delete h.focoArrival; }, []);
  // Aparece: se oculta solo a los 6 s.
  useEffect(() => { if (phase !== "on" || id !== "aparece") return; const t = setTimeout(() => dismiss(false), 6000); return () => clearTimeout(t); }, [phase, id, dismiss]);
  // Esc cierra; tocar la fila también (y la fila abre su panel como siempre).
  useEffect(() => { if (phase !== "on") return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    const row = document.querySelector(ROW), tap = () => dismiss(false);
    addEventListener("keydown", key); row?.addEventListener("click", tap);
    return () => { removeEventListener("keydown", key); row?.removeEventListener("click", tap); }; }, [phase, dismiss]);
  return { id, n, phase, replay, dismiss, stop };
}

type Box = { x: number; y: number; w: number; h: number };
/** Rectángulo del objetivo en la ventana, al día con resize (con el scroll bloqueado no se mueve). doc: en coordenadas de página. */
function useBox(sel: string, on: boolean, doc = false): Box | null {
  const [b, setB] = useState<Box | null>(null);
  useLayoutEffect(() => { if (!on) { setB(null); return; }
    const el = document.querySelector(sel); if (!el) return;
    const m = () => { const r = el.getBoundingClientRect(), n = { x: r.left + (doc ? scrollX : 0), y: r.top + (doc ? scrollY : 0), w: r.width, h: r.height };
      setB((o) => o && o.x === n.x && o.y === n.y && o.w === n.w && o.h === n.h ? o : n); };
    // 23/10: también si algo encima cambia de alto (fuentes, imágenes, banners) y la fila se corre sin cambiar de tamaño.
    // ponytail: sondeo cada 250 ms solo mientras el foco está activo; un MutationObserver del layout no detecta corrimientos.
    m(); const ro = new ResizeObserver(m); ro.observe(el); ro.observe(document.documentElement); addEventListener("resize", m); addEventListener("scroll", m, true);
    const t = setInterval(m, 250);
    return () => { ro.disconnect(); removeEventListener("resize", m); removeEventListener("scroll", m, true); clearInterval(t); }; }, [sel, on, doc]);
  return b;
}
const grow = (b: Box, p: number, k = 1): Box => { const w = b.w * k + 2 * p, h = b.h * k + 2 * p; return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h }; };
/** Rectángulo redondeado como path (r arriba, rb abajo), para restarlo del velo con evenodd. */
function holePath({ x, y, w, h }: Box, r: number, rb = r): string {
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - r - rb}a${rb} ${rb} 0 0 1 ${-rb} ${rb}h${-(w - 2 * rb)}a${rb} ${rb} 0 0 1 ${-rb} ${-rb}v${-(h - r - rb)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
}
const veilClip = (hole: string | null) => { const W = innerWidth + 200, H = innerHeight + 200;
  return hole ? `path(evenodd, "M-100 -100h${W}v${H}h${-W}z${hole}")` : undefined; };
const boxStyle = (b: Box, extra?: CSSProperties): CSSProperties => ({ left: b.x, top: b.y, width: b.w, height: b.h, ...extra });

/** Dónde va el aviso: debajo si cabe (si no, encima), dentro de la ventana con 16 px de margen; la flecha apunta a ax. */
function place(b: Box, ax: number, doc = false, need = 180): { style: CSSProperties; below: boolean } {
  const w = Math.min(340, innerWidth - 32), left = Math.min(Math.max(16, b.x), innerWidth - 16 - w);
  const below = doc || innerHeight - (b.y + b.h) >= need || b.y < need; // doc (popover, sin bloqueo): siempre debajo, la fila llega centrada
  const arrow = Math.min(Math.max(22, ax - left), w - 22);
  const style: CSSProperties = { left, width: w, ...(below ? { top: b.y + b.h + 14 } : { bottom: innerHeight - b.y + 14 }) };
  return { below, style: { ...style, ["--ax" as string]: `${arrow}px` } };
}

/** «Entendido». onClick(kb): kb si se activó con teclado (detail 0); solo entonces el foco vuelve a la fila (con mouse sobraría el anillo). */
function Ok({ onClick }: { onClick: (kb: boolean) => void }): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);
  // El foco va al aviso (lee su título y Esc lo cierra), no al botón: así el botón se ve en reposo, sin el anillo de foco,
  // y el anillo aparece solo si se llega con Tab.
  useEffect(() => { const box = ref.current?.closest<HTMLElement>("[role=dialog], [role=region]"); if (!box) return;
    box.tabIndex = -1; box.focus({ preventScroll: true }); }, []);
  // Literal el «Proponer» del modal (Propuesta.tsx · ActualDialog): Button secondary + va__btn (200 × 48).
  return <Button ref={ref} variant="secondary" className="va__btn fc-ok" onClick={(e) => onClick(e.detail === 0)}>Entendido</Button>;
}
/** Aviso con flecha: ícono esmerilado de Mis negociaciones, título, una línea y «Entendido». */
function Callout({ at, title = TITLE, body = BODY, onOk, out }: { at: { style: CSSProperties; below: boolean }; title?: string; body?: string; onOk: (kb: boolean) => void; out: boolean }): JSX.Element {
  return <div className={`fc-card${out ? " is-out" : ""}`} data-pos={at.below ? "below" : "above"} style={at.style} role="dialog" aria-labelledby="fc-t" aria-describedby="fc-b">
    <span className="fc-card__icon" aria-hidden><Vidrio s="negociaciones" size={36} /></span>
    <span className="fc-card__text"><b id="fc-t">{title}</b><span id="fc-b">{body}</span></span>
    <Ok onClick={onOk} />
  </div>;
}

/** Lo que va sobre la página: el velo con su hueco, el aro, el aviso y las piezas propias de cada variante. */
export function FocoLayer({ f, photo, car, amount }: { f: Foco; photo: string; car: string; amount: string }): ReactNode {
  const live = f.phase === "on" || f.phase === "out";
  const veil = live && VEIL.has(f.id);
  const sel = f.id === "precision" ? `${ROW} .fr__meta` : ROW;
  const b = useBox(sel, veil || (live && f.id === "popover"), !veil);
  const [stage, setStage] = useState(0); // vuelo: 0 tarjeta al centro · 1 vuela · 2 llegó
  const ghost = useRef<HTMLDivElement>(null);
  useEffect(() => { if (f.id !== "vuelo" || f.phase !== "on") return; if (still()) { setStage(2); return; }
    // 900 ms al centro, 600 ms de vuelo; el hueco se abre al despegar.
    setStage(0); const t1 = setTimeout(() => setStage(1), 900), t2 = setTimeout(() => setStage(2), 1500); return () => { clearTimeout(t1); clearTimeout(t2); }; }, [f.id, f.phase, f.n]);
  useEffect(() => { const g = ghost.current, row = document.querySelector(ROW); if (stage !== 1 || !g || !row) return;
    // Morph modal → fila: el contenido se va primero y la tarjeta (su caja, no una escala: las esquinas no se deforman)
    // se encoge hasta calzar con el hueco de la fila; ahí se funde.
    const a = g.getBoundingClientRect(), rr = row.getBoundingClientRect(), r = grow({ x: rr.left, y: rr.top, w: rr.width, h: rr.height }, 6);
    const box = ({ x, y, w, h }: Box) => ({ left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, translate: "0 0" });
    const o = { duration: 600, fill: "forwards" } as const;
    g.animate([box({ x: a.left, y: a.top, w: a.width, h: a.height }), box(r)], { ...o, easing: "cubic-bezier(.3,0,.2,1)" });
    g.animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], o);
    g.querySelector(".fc-ghost__in")?.animate([{ opacity: 1 }, { opacity: 0, offset: .3 }, { opacity: 0 }], o); }, [stage]);
  if (typeof document === "undefined") return null;
  const out = f.phase === "out";
  if (live && f.id === "toast") return createPortal(<Toast photo={photo} car={car} amount={amount} out={out} onClose={() => f.dismiss(false)} />, document.body);
  if (live && f.id === "popover" && b) {
    const at = place(b, b.x + 48, true);
    return createPortal(<div className="fc-pop" style={{ position: "absolute", inset: 0, height: 0 }}><Callout at={at} onOk={f.dismiss} out={out} /></div>, document.body);
  }
  if (!veil || !b) return null;
  const close = (kb = false) => f.dismiss(kb);
  const lift = f.id === "elevar" ? 1.03 : 1;
  // Precisión: margen vertical corto para no cortar el nombre del auto, que va justo encima.
  const hb = f.id === "precision" ? { x: b.x - 8, y: b.y - 3, w: b.w + 16, h: b.h + 6 } : grow(b, f.id === "elevar" ? 4 : 6, lift);
  const r = f.id === "precision" ? 10 : 16;
  const arrived = f.id !== "vuelo" || stage === 2;
  const opened = f.id !== "vuelo" || stage >= 1;
  const hole = opened ? holePath(hb, r, f.id === "elevar" ? 0 : r) : null;
  const at = place(hb, f.id === "precision" ? hb.x + Math.min(hb.w / 2, 60) : hb.x + 48);
  return createPortal(<div className={`fc-layer fc-layer--${f.id}${out ? " is-out" : ""}`} data-stage={f.id === "vuelo" ? stage : undefined}>
    <div className="fc-veil" style={{ clipPath: veilClip(hole) }} onClick={() => close()} />
    {opened && f.id !== "elevar" ? <span className="fc-ring" style={boxStyle(hb, { borderRadius: r })} aria-hidden /> : null}
    {/* Elevar: una tarjeta que envuelve el hueco (arriba, transparente: se ve la fila) y el aviso; su sombra cae solo por fuera. */}
    {f.id === "elevar" ? <div className="fc-lift" style={{ left: hb.x, top: hb.y, width: hb.w, paddingTop: hb.h }}>
      <div className="fc-strip" role="dialog" aria-labelledby="fc-t" aria-describedby="fc-b"><div className="fc-strip__in"><div className="fc-strip__body">
        <span className="fc-card__icon" aria-hidden><Vidrio s="negociaciones" size={32} /></span><span className="fc-card__text"><b id="fc-t">{TITLE}</b><span id="fc-b">{BODY}</span></span><Ok onClick={close} /></div></div></div></div>
      : f.id === "cajon" ? <div className="fc-drawer" style={{ left: hb.x - 2, top: hb.y + hb.h - 2, width: hb.w + 4 }}>
        <div className="fc-drawer__card" role="dialog" aria-labelledby="fc-t" aria-describedby="fc-b"><span className="fc-card__text"><b id="fc-t">{TITLE}</b><span id="fc-b">{BODY}</span></span><Ok onClick={close} /></div></div>
      : f.id === "vuelo" && !arrived ? <div ref={ghost} className="fc-ghost" role="status"><div className="fc-ghost__in">
        {/* El estado «enviada» del modal de propuesta (Propuesta.tsx · HybridDialog), tal como se acaba de ver. */}
        <span className="fc-card__icon" aria-hidden><Vidrio s="negociaciones" size={48} /></span>
        <i className="fc-ghost__state"><b aria-hidden />Esperando respuesta</i><b className="fc-ghost__h">Propuesta enviada</b><small>{car}</small>
        <dl className="fc-ghost__facts"><div><dt>Tu propuesta</dt><dd>{amount}</dd></div><div><dt>Vence en</dt><dd>24 horas</dd></div></dl></div></div>
      : arrived ? <Callout at={at} onOk={close} out={out} title={f.id === "precision" ? "Esta línea cambiará cuando el vendedor responda" : TITLE} /> : null}
  </div>, document.body);
}

function Toast({ photo, car, amount, out, onClose }: { photo: string; car: string; amount: string; out: boolean; onClose: () => void }): JSX.Element {
  const see = () => { onClose(); const row = document.querySelector<HTMLElement>(`${ROW} > .fr`); row?.scrollIntoView({ block: "center", behavior: still() ? "auto" : "smooth" }); row?.focus({ preventScroll: true }); };
  return <div className={`fc-toast${out ? " is-out" : ""}`} role="status" aria-live="polite">
    <img src={photo} alt="" /><p><b>Propuesta enviada · {amount}</b><small>{car} · El vendedor tiene 24 horas. Su respuesta llegará a Mis negociaciones.</small></p>
    <button type="button" className="fc-toast__see" onClick={see}>Ver</button>
    <button type="button" className="fc-toast__x" aria-label="Cerrar aviso" onClick={onClose}><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
    <i className="fc-toast__time" onAnimationEnd={onClose} aria-hidden /></div>;
}

/** Lo que va dentro de la lista, bajo la fila (slot `tip` de FSection). */
export function FocoInline({ f }: { f: Foco }): ReactNode {
  const live = f.phase === "on" || f.phase === "out", out = f.phase === "out";
  const chip = <p className="fc-chip" key={`c${f.n}`}><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7Z" /></svg>El vendedor tiene 24 horas para responder</p>;
  if (f.id === "chip" && f.phase !== "idle" && f.phase !== "wait") return chip;
  if (f.id === "popover" && f.phase === "done") return chip;
  if (!live) return null;
  if (f.id === "actual") return <div className="g-tip g-tip--row" role="status"><span>Aquí verás su respuesta · tiene 24 h</span><button type="button" onClick={(e) => f.dismiss(e.detail === 0)}>Entendido</button></div>;
  if (f.id === "aparece") return <div className={`fc-appear${out ? " is-out" : ""}`} key={f.n}><div className="fc-appear__in"><div className="fc-appear__bar" role="status">
    <p><b>{TITLE}</b><span>Tiene 24 horas para responder.</span></p><button type="button" onClick={(e) => f.dismiss(e.detail === 0)}>Entendido</button></div></div></div>;
  if (f.id === "empuja") return <div className={`fc-push${out ? " is-out" : ""}`} key={f.n}><div className="fc-push__in"><div className="fc-push__card" role="region" aria-labelledby="fc-t" aria-describedby="fc-b">
    <span className="fc-card__icon" aria-hidden><Vidrio s="negociaciones" size={32} /></span><span className="fc-card__text"><b id="fc-t">{TITLE}</b><span id="fc-b">{BODY}</span></span><Ok onClick={f.dismiss} /></div></div></div>;
  if (f.id === "expande") return <div className={`fc-push fc-push--in${out ? " is-out" : ""}`} key={f.n}><div className="fc-push__in"><div className="fc-expand" role="region" aria-labelledby="fc-t" aria-describedby="fc-b">
    <span className="fc-card__text"><b id="fc-t">{TITLE}</b><span id="fc-b">{BODY}</span></span><Ok onClick={f.dismiss} /></div></div></div>;
  return null;
}

/** Panel del lab (arriba a la derecha): cada clic repite la llegada con esa variante; queda elegida al recargar. */
export function FocoPanel({ f, onPick }: { f: Foco; onPick: (id: FocoId) => void }): JSX.Element {
  const cur = FOCOS.find((x) => x.id === f.id)!;
  // Mismo panel que Banners y Simular al vendedor (LabPanel): solo minimizar; en móvil arranca como píldora.
  return <LabPanel title="Foco al llegar" store="mg-foco" className="fc-panel" side="right" pill={`Foco · ${cur.name}`} mobileClosed
    actions={<button type="button" className="fc-panel__again" onClick={() => onPick(f.id)}><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z" /></svg>Repetir</button>}>
    {([[true, "Con velo", "el resto se oscurece"], [false, "Sin velo", "no bloquea la página"]] as const).map(([v, t, s]) =>
      <div key={t} className="f-sw__g" role="group" aria-label={t}><span className="f-sw__k"><b>{t}</b> · {s}</span>
        {FOCOS.filter((x) => x.veil === v).map((x) => <button key={x.id} type="button" title={x.hint} aria-pressed={f.id === x.id} onClick={() => onPick(x.id)}>{x.name}</button>)}</div>)}
    <small className="f-sw__hint fc-panel__hint">{cur.hint}</small>
  </LabPanel>;
}
