"use client";

/**
 * PROPUESTA · Negociación dentro de la vista rápida (reemplaza la cadena de modales actual de VMC,
 * «Modales Negociable.svg»: ofrece → contraproponer → confirma → enviada = 4 modales).
 * Aquí todo pasa en el mismo panel: la oferta con su contexto (precio publicado y valor de mercado AVT),
 * el hilo de propuestas y las acciones; contraproponer y confirmar son un solo paso en línea.
 * Se conserva de VMC: Aceptar · Rechazar · Contraproponer, «Propuesta n/5», expiración, aviso de términos,
 * consignación del comprador y «Fondos insuficientes» (Adquiere SubasCoins · Realizar una recarga).
 */
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import Button from "@/src/product/mi-garaje/concorde/components/Button";
import ProfileButton from "@/src/product/mi-garaje/concorde/components/ProfileButton";
import BidMessage from "@/src/product/mi-garaje/concorde/components/BidMessage";
import TimerIcon from "@/src/product/mi-garaje/concorde/components/TimerIcon";
import { DEPOSIT } from "./Propuesta";
import SubasChat from "./SubasChat";
import { COPY, MODES, chatUntil, type ChatMode } from "./chat";
import { LabPanel } from "./LabPanel";
import "./subaschat.css";
import "./negociacion.css";

export type Neg = {
  side: "vende" | "compra"; amount: number; round: number; hours: number;
  state: "ofrece" | "enviada" | "rechazada" | "aceptada" | "rechazaste" | "cerrada"; // cerrada: otra propuesta del mismo auto fue aceptada
  list: number; market: number; thread: { me: boolean; amount: number; when: string }[];
  sessionStart?: number; // índice de inicio de la negociación vigente; el historial previo permanece visible
  buyer?: string; // vendedor con varias propuestas: «Comprador 1, 2, 3» por orden de llegada (anónimos)
  neg?: number; // comprador: n.º de negociación en esta oferta (máx. 5, T&C IV.6.2.f)
  unread?: boolean; // solo una última propuesta recibida puede dejar la conversación sin leer
  /** Marca un cierre recién producido: permite mostrar su transición una sola vez antes de retirar la negociación. */
  closedAt?: number;
  expiredBy?: "comprador" | "vendedor";
};
// nueva: el comprador abre otra negociación tras un rechazo o un vencimiento (ronda 1, consigna de nuevo).
export type NegResult = { kind: "aceptada" | "rechazaste" | "enviada" | "nueva"; amount: number };

export const MAX = 5;
// Una ronda es una propuesta del comprador y la respuesta del vendedor. El contador
// se deriva del hilo: nunca puede decir 5/5 si el comprador solo llegó, por ejemplo, a la ronda 2.
export const roundOf = (n: Pick<Neg, "side" | "thread" | "sessionStart">) => Math.min(MAX, n.thread.slice(n.sessionStart ?? 0).filter((t) => n.side === "compra" ? t.me : !t.me).length);
/** Vendedor acepta (23/10, Abraham): la misma animación que al enviar una propuesta (Propuesta.tsx, clases vh__ de
 *  propuesta.css), pero dentro del chat, al final del hilo: «Aceptando…» → check con confeti y el monto → cierra con la tarjeta
 *  «Aceptaste la propuesta» (23/10). Luego se va y sube la nube de espera del fee. */
// Animaciones de «aceptada» que el comprador ya vio (para no repetirla cada vez que abre el panel).
const FX_SEEN = new Set<string>();
function AcceptFx({ amount, onEnd, theyAccepted = false, sell = true }: { amount: number; onEnd: () => void; theyAccepted?: boolean; sell?: boolean }): JSX.Element {
  const ref = useRef<HTMLLIElement>(null);
  const [step, setStep] = useState<"procesa" | "celebra" | "tarjeta" | "salida">(theyAccepted ? "celebra" : "procesa"); // si aceptó la otra parte, no hay nada que registrar
  useEffect(() => { const el = ref.current; if (el) glide(el, el.closest(".np")?.querySelector<HTMLElement>(".np__foot")); }, []);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => step === "procesa" ? setStep("celebra") : step === "celebra" ? setStep("tarjeta") : step === "tarjeta" ? setStep("salida") : onEnd(),
      reduced ? 180 : step === "procesa" ? 1100 : step === "celebra" ? 1600 : step === "tarjeta" ? 1800 : 420);
    return () => clearTimeout(t);
  }, [step]);
  return <li ref={ref} className="np__fx va vh">
    {step === "procesa" ? <div className="va__card vh__processing" role="status" aria-live="polite">
      <div className="vh__loader" aria-hidden><i /><i /><i /></div>
      <h2>Aceptando la propuesta</h2>
      <p className="vh__sub">Estamos registrando tu {sell ? "venta" : "compra"}…</p>
    </div> : step === "tarjeta" || step === "salida" ? <div className={`np__sold${step === "salida" ? " is-leaving" : ""}`} role="status">
      <span className="np__sold-mark" aria-hidden><svg width="26" height="26" viewBox="0 0 20 20" fill="none"><path d="m5 10 3.1 3.1L15.5 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <span className="np__sold-tx"><b>{theyAccepted ? `El ${sell ? "comprador" : "vendedor"} aceptó tu propuesta` : "Aceptaste la propuesta"}</b></span><strong>{usd(amount)}</strong>
    </div> : <div className="va__card vh__celebrate" role="status" aria-live="assertive">
      <div className="vh__celebrate-stage" aria-hidden><i /><i /><i /><i /><i /><i /><i /><i />
        <span className="vh__celebrate-check"><svg width="38" height="38" viewBox="0 0 40 40" fill="none"><path d="M11 20.5l6 6L29.5 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      </div>
      <p className="vh__celebrate-kicker">{theyAccepted ? "¡Aceptaron tu propuesta!" : "¡Propuesta aceptada!"}</p>
      <h2 className="vh__celebrate-amount"><span>US$</span>{amount.toLocaleString("en-US")}</h2>
      <p className="vh__sub">{theyAccepted ? `${(sell ? COPY.vendedor : COPY.comprador).cuu} aceptó tu propuesta` : "El precio quedó pactado"}</p>
    </div>}
  </li>;
}
/** El rechazo del vendedor termina la negociación en cualquier ronda. No abre SubasChat ni habilita otra propuesta.
 *  30/10 (Aaron): la expiración (+24 h sin contraproponer ni aceptar) cierra igual, con la misma animación y su texto.
 *  `expiredBy` es la parte que no actuó; el comprador también recibe la fase de consignación liberada. */
type Side = "comprador" | "vendedor";
function RejectFx({ sell, expiredBy, onEnd }: { sell: boolean; expiredBy?: Side; onEnd: () => void }): JSX.Element | null {
  const ref = useRef<HTMLLIElement>(null);
  // Primero se deja leer la respuesta real del vendedor en el hilo. Solo después
  // el chat asciende para revelar el cierre; si ocurriera a la vez, se pierde el motivo.
  const [step, setStep] = useState<"notice" | "preparing" | "rejected" | "consequence" | "leaving">("notice");
  useEffect(() => {
    // El movimiento del historial se completa antes de montar la animación. De otro
    // modo, el usuario llega al escenario cuando sus primeros fotogramas ya pasaron.
    if (step !== "preparing") return;
    const el = ref.current; if (el) glide(el, el.closest(".np")?.querySelector<HTMLElement>(".np__foot"));
  }, [step]);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Un cierre no debe sentirse como un toast: cada beat queda el tiempo suficiente
    // para leer el resultado y su consecuencia antes de que el panel abandone la vista.
    // El vendedor ya ejecutó el rechazo: no recibe la fase de devolución. Esa fase
    // pertenece solo al comprador, cuya consignación vuelve a la Billetera.
    const ms = reduced ? 180 : step === "notice" ? 2000 : step === "preparing" ? 520 : step === "rejected" ? 3200 : step === "consequence" ? 2600 : 620;
    const t = setTimeout(() => {
      if (step === "notice") return setStep("preparing");
      if (step === "preparing") return setStep("rejected");
      // Al expirar, el vendedor también tiene segunda fase («está por cerrar»); en el rechazo, no.
      if (step === "rejected") return sell && !expiredBy ? setStep("leaving") : setStep("consequence");
      if (step === "consequence") return setStep("leaving");
      return onEnd();
    }, ms);
    return () => clearTimeout(t);
  }, [step, onEnd, sell, expiredBy]);
  const buyer = !sell;
  if (step === "notice") return null;
  if (step === "preparing") return <li ref={ref} data-step={step} className="np__fx np__rejectfx np__rejectfx--prepare" aria-hidden>
    <div className="va__card vh__reject vh__reject--preparing"><span className="vh__closing-bridge"><i /><i /></span></div>
  </li>;
  const consequence = (buyer || !!expiredBy) && (step === "consequence" || step === "leaving");
  const mine = expiredBy === (sell ? "vendedor" : "comprador"); // quien no actuó es quien mira
  // Segunda fase al expirar, según quién no actuó: el vendedor → consignación liberada (Billetera);
  // el comprador → la negociación está por cerrar (candado). En el rechazo, solo el comprador la tiene (consignación).
  const released = consequence && (expiredBy ? expiredBy === "vendedor" : buyer);
  const kicker = consequence
    ? (released ? "CONSIGNACIÓN LIBERADA" : expiredBy ? "NEGOCIACIÓN EXPIRADA" : "NEGOCIACIÓN CERRADA")
    : expiredBy ? "NEGOCIACIÓN EXPIRADA" : "PROPUESTA RECHAZADA";
  const title = consequence
    ? (released ? (!expiredBy ? "Tu consignación fue liberada" : buyer ? "Tu consignación ha sido liberada" : "La consignación del comprador ha sido liberada")
      : expiredBy ? "La negociación está por cerrar…" : "Cerraste la negociación")
    : expiredBy ? "La negociación ha expirado" : (buyer ? "El vendedor rechazó tu propuesta" : "Rechazaste la propuesta");
  const body = consequence
    ? (released ? (buyer ? "La enviamos de vuelta a tu Billetera." : "Volvió a su Billetera.") : expiredBy ? "" : "La propuesta dejará de aparecer en En venta.")
    : expiredBy ? (mine ? "Porque dejaste de contraproponer o aceptar por +24 horas." : `El ${expiredBy} dejó de contraproponer o aceptar por +24 horas.`)
    : "La negociación se cerrará.";
  return <li ref={ref} data-step={step} className={`np__fx va vh np__rejectfx${buyer ? " np__rejectfx--buyer" : " np__rejectfx--seller"}${step === "leaving" ? " is-leaving" : ""}`} role="status" aria-live="polite">
    <div className="va__card vh__reject">
      {released ? <div className="vh__release-stage" aria-hidden>
        <i className="vh__release-coin vh__release-coin--one">&gt;S&lt;</i><i className="vh__release-coin vh__release-coin--two">&gt;S&lt;</i><i className="vh__release-coin vh__release-coin--three">&gt;S&lt;</i>
        <span className="vh__release-wallet">
          <svg viewBox="0 0 52 52" fill="none" aria-hidden>
            <defs><linearGradient id="release-wallet-fill" x1="6" y1="15" x2="46" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#00B8BD" /><stop offset=".6" stopColor="#008688" /><stop offset="1" stopColor="#7752DD" /></linearGradient></defs>
            {/* Misma silueta compacta de «Mi billetera»: tarjeta detrás + cuerpo redondeado. */}
            <rect x="14" y="7" width="24" height="17" rx="4" transform="rotate(-10 26 15.5)" fill="#8460E5" />
            <rect x="6" y="15" width="40" height="28" rx="7" fill="url(#release-wallet-fill)" />
            <path d="M36 24h10v10H36a5 5 0 0 1 0-10Z" fill="rgba(255,255,255,.22)" />
            <circle cx="41" cy="29" r="1.6" fill="white" />
            <text x="12" y="33.3" fill="white" fontSize="11.5" fontWeight="800" letterSpacing="-1.2">&gt;S&lt;</text>
          </svg>
        </span>
      </div> : <div className="vh__reject-stage" aria-hidden><span className="vh__reject-shutter"><i /><i /></span><i /><i /><i /><i /><i /><i /><i /><i />
        <span className="vh__reject-mark">{consequence ? <svg width="36" height="36" viewBox="0 0 40 40" fill="none"><path d="M10 16h20v15H10zM15 16v-3.5a5 5 0 0 1 10 0V16M15 23h10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="38" height="38" viewBox="0 0 40 40" fill="none"><path d="m13 13 14 14m0-14-14 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>}</span>
      </div>}
      <p className="vh__reject-kicker">{kicker}</p>
      <h2 className="vh__reject-title">{title}</h2>
      {body ? <p className="vh__sub">{body}</p> : null}
    </div>
  </li>;
}
/** Sube el contenedor con scroll hasta centrar `el`. ponytail: rAF a mano, sin librería; con «reducir movimiento», salta. */
function glide(el: HTMLElement, foot?: HTMLElement | null, top = false): void {
  let box = el.parentElement;
  while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
  if (!box) return;
  // Centra `el` en lo visible del panel (sin el pie fijo). --np-view deja el aire justo para que lo de arriba salga de la vista
  // pero siga ahí: al volver a subir se ve el historial.
  const view = box.clientHeight - (foot?.offsetHeight ?? 0);
  box.style.setProperty("--np-view", `${view}px`);
  // Posición sin transformaciones: la nube entra animada con translate y su getBoundingClientRect saldría corrido;
  // se mide desde su contenedor (sin animar) más su offsetTop.
  const host = el.parentElement!, hr = host.getBoundingClientRect(), r = { top: hr.top + el.offsetTop - host.offsetTop, height: el.offsetHeight };
  const from = box.scrollTop, to = from + r.top - box.getBoundingClientRect().top - (top ? 24 : view / 2 - r.height / 2); // top: arriba, a 24 px
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { box.scrollTop = to; return; }
  const t0 = performance.now(), ms = 1400, ease = (t: number) => (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const step = (t: number) => { const k = Math.min(1, (t - t0) / ms); box!.scrollTop = from + (to - from) * ease(k); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
// Consignación del comprador al iniciar: la fija cada oferta (T&C IV.6.2.a); la de ejemplo es la del modal de Propuesta.tsx.
const FEE = DEPOSIT.sc;
const usd = (n: number) => `US$ ${n.toLocaleString("en-US")}`;
// Plazo con TimerIcon y cifras en mono (Concorde: countdowns en --vmc-font-mono). 23/10 (Silvana): siempre con segundero,
// «23:59:24», para que se vea que el tiempo corre de verdad (urgencia en ambos lados).
function DueIn({ to, mine, pre = "Vence en", post = "" }: { to: number; mine: boolean; pre?: string; post?: string }): JSX.Element {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const left = Math.max(0, to - now), h = Math.floor(left / 3.6e6), m = Math.floor((left % 3.6e6) / 6e4), sec = Math.floor((left % 6e4) / 1e3);
  const pad = (x: number) => String(x).padStart(2, "0");
  // Solo las cifras en mono; las unidades en la fuente del texto (en mono «h» y «min» se separaban demasiado).
  return <span className={`np__due${mine ? " is-me" : ""}`} role="timer" aria-label={`Vence en ${h} h ${m} min`}><TimerIcon size={16} />{pre} <b>{pad(h)}:{pad(m)}:{pad(sec)}</b>{post}</span>;
}
// La flecha permite leer la dirección del cambio de un vistazo: ↑ cuando sube, ↓ cuando baja.
// Vencimiento de la propuesta vigente, fijo mientras no llegue otra: se guarda por propuesta (lado, comprador, negociación,
// ronda y monto) en memoria y en sessionStorage, para que cerrar y abrir el panel (o recargar) no lo vuelva a poner en 24 h.
const DUE = new Map<string, number>();
function dueOf(n: Neg): number {
  const last = n.thread[n.thread.length - 1];
  const k = `mg-due:${n.side}:${n.buyer ?? ""}:${n.neg ?? 1}:${n.thread.length}:${last?.amount ?? n.amount}`;
  let t = DUE.get(k);
  if (t === undefined) { try { const v = Number(sessionStorage.getItem(k)); if (v) t = v; } catch { /* sin almacenamiento: solo memoria */ } }
  if (t === undefined) { t = Date.now() + n.hours * 3.6e6; try { sessionStorage.setItem(k, String(t)); } catch { /* idem */ } }
  DUE.set(k, t); return t;
}
const pct = (a: number, b: number) => {
  const d = Math.round(((a - b) / b) * 100);
  if (d === 0) return "igual";
  return <b>{d > 0 ? "↑" : "↓"} {Math.abs(d)} %</b>;
};

// Referencias del vendedor en texto (sin gráfico): tu precio y el valor AVT; con `on`, cuánto se aleja esa propuesta de cada uno.
function Refs({ list, market, on }: { list: number; market: number; on?: number }): JSX.Element {
  return <dl className="np__refs">
    <div><dt>Tu precio publicado</dt><dd>{usd(list)}{on ? <small>Propuesta {pct(on, list)}</small> : null}</dd></div>
    <div><dt>Valor de mercado AVT</dt><dd>{usd(market)}{on ? <small>Propuesta {pct(on, market)}</small> : null}</dd></div>
  </dl>;
}

export type Peer = { id: string; n: Neg };
const isOpen = (p: Peer) => p.n.state === "ofrece" || p.n.state === "enviada";
// Lo que separa al comprador del vendedor: su última propuesta vs lo último que pidió el vendedor (o su precio publicado).
const gapOf = (n: Neg) => {
  const buyer = [...n.thread].reverse().find((t) => !t.me)?.amount ?? n.amount;
  const ask = [...n.thread].reverse().find((t) => t.me)?.amount ?? n.list;
  return { buyer, gap: Math.max(0, ask - buyer) };
};

// Bandeja de entrada: la última propuesta recibida sube, no la que está más cerca
// del precio. Así el orden expresa qué cambió recientemente y evita una etiqueta extra.
const lastActivity = (n: Neg) => {
  const last = n.thread[n.thread.length - 1]?.when ?? "";
  // La contrapropuesta recién enviada debe subir inmediatamente, aunque su etiqueta visual sea «Ahora».
  if (last === "Ahora") return Number.MAX_SAFE_INTEGER;
  const [, h = "0", m = "0"] = last.match(/(\d{1,2}):(\d{2})/) ?? [];
  const day = last.startsWith("Hoy") ? 2 : last.startsWith("Ayer") ? 1 : 0;
  return day * 1440 + Number(h) * 60 + Number(m);
};

/**
 * Nivel 1 · varias propuestas sobre la misma publicación (T&C IV.6.2.c/h): solo comparar, sin acciones.
 * Lista → detalle (patrón list-detail): la conversación se ve recién al entrar a un comprador.
 * Por defecto arriba la más cerca de un acuerdo (menor brecha); el orden no cambia mientras miras.
 */
export function NegList({ peers, onPick, back }: { peers: Peer[]; onPick: (id: string) => void; back?: boolean }): JSX.Element {
  const open = peers.filter(isOpen);
  const list = [...open].sort((a, b) => lastActivity(b.n) - lastActivity(a.n));
  const ref = open[0]?.n ?? peers[0]?.n;
  // 23/10 (Abraham): aceptada una propuesta, las demás se cierran (T&C IV.6.c): arriba la aceptada (abre su chat en espera)
  // y debajo las cerradas, en gris y sin abrir; ya no hay nada que responder.
  const won = peers.find((p) => p.n.state === "aceptada"), shut = peers.filter((p) => p.n.state === "cerrada");
  if (won) return <div className={`np${back ? " np--from-left" : ""}`}>
    {ref ? <Refs list={ref.list} market={ref.market} /> : null}
    <section className="np__peers" aria-label="Propuesta aceptada">
      <div className="np__phead"><h3>Propuesta aceptada</h3></div>
      <ul><li className="is-won"><button type="button" onClick={() => onPick(won.id)}>
        <span className="np__pwho"><b>{won.n.buyer}</b><small className="np__deadline">Esperando el pago del fee de habilitación</small></span>
        <span className="np__pamt"><b>{usd(won.n.amount)}</b></span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button></li></ul>
      {shut.length ? <><div className="np__phead np__phead--shut"><h3>Cerradas <span className="np__count">{shut.length}</span></h3></div>
        <ul className="np__shut">{shut.map((p) => <li key={p.id} aria-disabled="true"><div>
          <span className="np__pwho"><b>{p.n.buyer}</b><small className="np__deadline">Se cerró al aceptar a {won.n.buyer}</small></span>
          <span className="np__pamt"><b>{usd(gapOf(p.n).buyer)}</b></span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="5" y="9" width="10" height="7" rx="1.5" fill="currentColor" /><path d="M7.5 9V7.5a2.5 2.5 0 0 1 5 0V9" stroke="currentColor" strokeWidth="1.6" /></svg>
        </div></li>)}</ul></> : null}
    </section>
  </div>;
  return <div className={`np${back ? " np--from-left" : ""}`}>
    {ref ? <Refs list={ref.list} market={ref.market} /> : null}
    <section className="np__peers" aria-label="Propuestas activas">
      <div className="np__phead"><h3>Propuestas activas <span className="np__count">{open.length}</span></h3>
        </div>
      <ul>{list.map((p, index) => { const g = gapOf(p.n), last = p.n.thread[p.n.thread.length - 1];
        // Como una bandeja de entrada: solo una respuesta nueva del comprador se resalta. Si el último
        // mensaje fue tuyo, el resumen deja claro que la negociación está esperando su respuesta.
        const unread = !last?.me && p.n.unread;
        const amount = last?.me ? last.amount : g.buyer;
        return <li key={p.id} className={unread ? "is-new" : ""}><button type="button" onClick={() => onPick(p.id)}>
        <span className="np__pwho"><b>{p.n.buyer ?? `Comprador ${index + 1}`}</b><small className="np__deadline" suppressHydrationWarning>Propuesta {roundOf(p.n)}/{MAX} · Vence en {p.n.hours} h</small></span>
        <span className="np__pamt">{last?.me ? <small>Tu última propuesta</small> : null}<b>{usd(amount)}</b></span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button></li>; })}</ul>
      <p className="np__exp">Al aceptar una propuesta, las demás se cierran.</p>
    </section>
  </div>;
}

export default function NegPanel({ n, coins, onDone, peers, active, onBack, onCancel, chat, autoFee, chatReady, chatMessageText, purchaseConfirmed = false, onSim, onFeePaid, onPurchaseConfirmed, onChatOpen, onClosed }: { n: Neg; coins: number; onDone: (n: Neg, r: NegResult) => void; peers?: Peer[]; active?: string; onBack?: () => void; onCancel?: () => void; chat?: string; autoFee?: boolean; chatReady?: boolean; chatMessageText?: string; purchaseConfirmed?: boolean; onSim?: (k: "contra" | "acepta") => void; onFeePaid?: () => void; onPurchaseConfirmed?: () => void; onChatOpen?: (open: boolean) => void; onClosed?: (n: Neg, expired?: boolean) => void }): JSX.Element {
  const [mode, setMode] = useState<"" | "contra" | "aceptar" | "rechazar">("");
  const [val, setVal] = useState(0);
  const [custom, setCustom] = useState("");
  const customRef = useRef("");
  // Toda propuesta vence a las 24 h (T&C IV.6.2.f); al vencer, la negociación termina (estado «expirada», solo en la vista).
  // 23/10 (Silvana): el plazo ya no se reinicia al salir y volver; se fija una vez por propuesta (dueOf).
  const [due, setDue] = useState(() => dueOf(n));
  const [expired, setExpired] = useState(false);
  // 30/10 (Aaron): al vencer, cierra con la animación. Quien no actuó es a quien le tocaba: «ofrece» = a mí, «enviada» = a la otra parte.
  // El lab lo adelanta con «Simula expiración» (los 4 casos: 2 aquí y 2 en la otra pestaña).
  const [expiredBy, setExpiredBy] = useState<Side | null>(n.expiredBy ?? null);
  useEffect(() => { setMode(""); setVal(0); setCustom(""); customRef.current = ""; setDue(dueOf(n)); setExpired(false); setExpiredBy(n.expiredBy ?? null); }, [n]);
  useEffect(() => { if (expired && (n.state === "ofrece" || n.state === "enviada")) setExpiredBy((n.state === "ofrece") === (n.side === "vende") ? "vendedor" : "comprador"); }, [expired, n.state, n.side]);
  useEffect(() => {
    if (n.state !== "ofrece" && n.state !== "enviada") return;
    const t = setTimeout(() => setExpired(true), Math.max(0, due - Date.now()));
    return () => clearTimeout(t);
  }, [due, n.state]);
  // Al abrir una propuesta: desplazamiento suave hasta lo último del historial, por encima del pie fijo (en móvil quedaba tapado).
  // Espera a que termine la entrada del detalle (280 ms); con «reducir movimiento», salta sin animar.
  // 23/10 (Abraham): «aceptada» igual para ambos lados. El comprador ve la animación al abrir si el vendedor aceptó su propuesta.
  const sell = n.side === "vende";
  const fxKey = `${n.side}:${n.amount}:${n.thread.length}`;
  const theyAccepted = n.state === "aceptada" && !!n.thread[n.thread.length - 1]?.me;
  // Si el vendedor llega después de que el comprador ya pagó el fee, no se
  // repite la celebración: la notificación ya señaló el acceso y entra directo
  // al SubasChat listo para conversar.
  const chatAlreadyReady = !!chatReady || (sell && !!autoFee);
  const [fx, setFx] = useState(() => theyAccepted && !chatAlreadyReady && !FX_SEEN.has(fxKey));
  // 26/10: también cuando la otra parte acepta con el panel abierto (el vendedor simula que el comprador aceptó).
  useEffect(() => { if (theyAccepted && !chatAlreadyReady && !FX_SEEN.has(fxKey)) setFx(true); }, [chatAlreadyReady, fxKey, theyAccepted]);
  const lastRef = useRef<HTMLElement>(null), footRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const t = setTimeout(() => { const el = lastRef.current; if (!el) return;
      el.style.scrollMarginBottom = `${(footRef.current?.offsetHeight ?? 0) + 16}px`;
      // Venta aceptada (23/10): el historial sube hasta arriba y deja fuera el resumen y el plazo, con una curva propia
      // (ease-in-out, 900 ms): el «smooth» del navegador es corto y frena de golpe.
      if (n.state === "aceptada" && !fx) { const c = el.querySelector<HTMLElement>(".np__wait"); if (c) glide(c, footRef.current); return; } // centrada (23/10)
      if (fx) return; // la animación se centra sola
      el.scrollIntoView({ block: "end", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }, 300);
    return () => clearTimeout(t);
  }, [n, fx]);
  const [paid, setPaid] = useState(!!autoFee); // lab (23/10): el comprador pagó su fee → se abre el SubasChat
  // 26/10 (Abraham): a veces el fee se cobra solo de la consignación inicial; al abrir, animación y luego el chat directo.
  useEffect(() => { setPaid(!!autoFee); }, [autoFee]);
  // Estados del SubasChat (23/10: los de «Revisión SubasChat» de /producto/mi-garaje/m/oferta, traídos a la pestaña del lab).
  const [chatMode, setChatMode] = useState<ChatMode>(() => purchaseConfirmed ? "verificar" : "normal"), [poke, setPoke] = useState(0), [offline, setOffline] = useState(false);
  // Una compra ya confirmada debe volver a abrir su registro, no una conversación nueva.
  useEffect(() => { if (purchaseConfirmed) setChatMode("verificar"); }, [purchaseConfirmed]);
  // 23/10 (Abraham): el chat abre con el encabezado del comprador arriba del todo (la negociación queda encima, fuera de la vista).
  // Si la conversación es corta, se agrega aire al final de la lista para que el encabezado pueda llegar arriba.
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!paid || fx) return; // 26/10: con fee automático el chat se monta al terminar la animación
    const list = chatRef.current?.querySelector<HTMLElement>(".sc__list"); if (!list) return;
    let first = true;
    const fit = () => { const head = list.querySelector<HTMLElement>(".np__chathead"); if (!head || list.getAttribute("aria-busy") === "true") return;
      list.style.paddingBottom = ""; head.style.position = "static";
      const top = head.offsetTop - list.offsetTop, need = top + list.clientHeight - list.scrollHeight; head.style.position = "";
      if (need > 0) list.style.paddingBottom = `${parseFloat(getComputedStyle(list).paddingBottom) + need}px`;
      if (first) { list.scrollTop = top; first = false; } };
    const mo = new MutationObserver(fit); mo.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-busy"] });
    fit(); return () => mo.disconnect();
  }, [paid, chatMode, fx]);
  // 29/10: avisa si el chat del acuerdo está abierto; con él, la tarjeta del auto lleva al detalle de la oferta (Acuerdo.tsx).
  const chatOpen = n.state === "aceptada" && paid && !fx;
  useEffect(() => { onChatOpen?.(chatOpen); }, [chatOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => onChatOpen?.(false), []); // eslint-disable-line react-hooks/exhaustive-deps
  const other = sell ? "comprador" : "vendedor";
  const mine = [...n.thread].reverse().find((t) => t.me)?.amount;
  const ask = [...n.thread].reverse().find((t) => !t.me)?.amount; // lo último que pidió la otra parte
  // Vencida o rechazada por el vendedor, la negociación se termina: no se reinicia desde este panel.
  const ended = expired || n.state === "rechazada";
  const restart = false;
  const shown = (n.state === "enviada" || n.state === "rechazada") && mine ? mine : n.amount;
  // Contrapropuesta válida: el vendedor pide más que la oferta; el comprador ofrece menos que lo que le piden.
  // Una negociación nueva no tiene tope: la Negociable carece de Precio Base y Reserva (Centro de Ayuda).
  const ok = val > 0 && (restart || (sell ? val > n.amount && val <= n.list : val < n.amount));
  const mid = Math.round((n.amount + (sell ? n.list : mine ?? n.amount * 0.9)) / 2 / 100) * 100; // el comprador no ve el valor AVT
  // Varias propuestas sobre la misma publicación (T&C IV.6.2.c/h): el vendedor compara y elige; aceptar cierra las demás.
  const open = (peers ?? []).filter(isOpen);
  const rest = open.filter((p) => p.id !== active);
  // Lo que ya pediste a otros compradores: si este acepta un monto menor, vendes por menos y se cierran las demás (eBay: gana el primero que acepta).
  const asked = rest.filter((p) => p.n.state === "enviada").map((p) => ({ buyer: p.n.buyer ?? "otro comprador", ask: [...p.n.thread].reverse().find((t) => t.me)?.amount ?? 0 })).sort((a, b) => b.ask - a.ask);
  const hi = asked[0];
  // Máximo dos sugerencias para que el formulario no tape el historial: «Como a…» reemplaza al punto medio cuando ya pediste a otro.
  const chips = ((sell ? [hi ? [hi.buyer ?? "Referencia", hi.ask] : ["Punto medio", mid], ["Valor de mercado", n.market]] : [["Punto medio", mid]]) as [string, number][])
    .filter(([, x], i, all) => (sell ? x > n.amount && x <= n.list : x < n.amount) && all.findIndex(([, y]) => y === x) === i);
  const opts = restart ? [] : chips; // una negociación nueva no sugiere montos: no hay referencia previa
  const round = roundOf(n);
  const left = MAX - round;
  const negsLeft = MAX - (n.neg ?? 1);
  const finalRound = round === MAX;
  const finalCounter = !sell && finalRound;
  const finalRejected = !sell && n.state === "rechazada" && finalCounter;
  const terminalReject = Boolean(n.closedAt);
  const closing = terminalReject || !!expiredBy; // rechazo o expiración: la negociación se cierra con la animación
  // Se consigna una sola vez, al iniciar la negociación (T&C IV.6.2.a), no en cada contrapropuesta.
  const short = restart && coins < FEE;
  const done = (r: NegResult) => { onDone(n, r); setMode(""); };

  const live = !expired && (n.state === "ofrece" || n.state === "enviada");
  // Lo que cedió cada parte respecto de su propuesta anterior, y lo que aún los separa (Backus et al.: lo habitual es partir la diferencia).
  const steps = n.thread.map((t, i) => { const prev = n.thread.slice(0, i).reverse().find((x) => x.me === t.me); return { ...t, delta: prev ? t.amount - prev.amount : 0 }; });
  const last = n.thread[n.thread.length - 1], lastOther = [...n.thread].reverse().find((t) => t.me !== last?.me);
  const gap = live && last && lastOther ? Math.abs(last.amount - lastOther.amount) : 0;
  const dueIndicator = live ? <DueIn to={due} mine={n.state === "ofrece"} /> : null;
  const acceptedBuy = false; // 23/10: el comprador usa el mismo flujo de «aceptada» que el vendedor

  // Vendedor (23/10, Abraham): pestaña flotante del lab para simular que el comprador pagó su fee.
  const sim = n.state === "aceptada" && !fx ? <LabPanel title={sell ? "Simula vendedor" : "Simula comprador"} store="mg-sim-comprador" className="f-sw--buy np__sim" mobileClosed>
    <div className="f-sw__g" role="group" aria-label="Fee de habilitación del comprador"><span className="f-sw__k"><b>Fee de habilitación</b> · {sell ? "del comprador" : "tuyo"}</span>
      <button type="button" aria-pressed={!paid} onClick={() => setPaid(false)}>Esperando pago</button>
      <button type="button" aria-pressed={paid} onClick={() => setPaid(true)}>{sell ? "Comprador pagó el fee" : "Pagaste el fee"}</button>
      <small className="f-sw__hint">Solo para el lab: en VMC el chat se abre solo cuando el pago se confirma.</small></div>
    {paid ? <><div className="f-sw__g" role="group" aria-label="Estado del SubasChat"><span className="f-sw__k"><b>Estado</b> · del SubasChat</span>
      {MODES.map((m) => <button key={m.id} type="button" title={m.hint} aria-pressed={chatMode === m.id} onClick={() => setChatMode(m.id)}>{m.label}</button>)}
      <small className="f-sw__hint">{MODES.find((m) => m.id === chatMode)?.hint}</small></div>
    <div className="f-sw__g" role="group" aria-label="Simular en el chat"><span className="f-sw__k"><b>Simular</b></span>
      <button type="button" disabled={chatMode === "cargando" || chatMode === "cerrado"} onClick={() => setPoke((x) => x + 1)}>Mensaje entrante</button>
      <button type="button" aria-pressed={offline} onClick={() => setOffline((v) => !v)}>{offline ? "Volver a conectar" : "Sin conexión"}</button></div></> : null}</LabPanel> : null;
  // 26/10 (Abraham): el vendedor que envió una contrapropuesta simula la respuesta del comprador (espejo de «Simula vendedor»).
  // 30/10 (Aaron): adelanta las 24 h para ver la expiración. 4 casos: la vista (Compras o Ventas) × quién no actuó.
  const simExp = (n.state === "ofrece" || n.state === "enviada") && !closing ? <div className="f-sw__g" role="group" aria-label="Expiración"><span className="f-sw__k"><b>Expira</b> · pasan las 24 h sin respuesta</span>
    {(["comprador", "vendedor"] as const).map((s) => <button key={s} type="button" onClick={() => setExpiredBy(s)}>{s === "comprador" ? "Comprador" : "Vendedor"} no actuó</button>)}
    <small className="f-sw__hint">Vista {sell ? "vendedor" : "comprador"}. Si no actuó el vendedor, se libera la consignación; si no actuó el comprador, la negociación está por cerrar. La otra vista, en {sell ? "Compras" : "En venta"}.</small></div> : null;
  const simResp = sell && onSim && n.state === "enviada" && !expired && !closing ? <LabPanel title="Simula vendedor" store="mg-sim-resp" className="f-sw--buy np__sim" mobileClosed>
    <div className="f-sw__g" role="group" aria-label="Respuesta del comprador"><span className="f-sw__k"><b>Responde</b> · tu contrapropuesta</span>
      {([["contra", "Comprador contrapropone"], ["acepta", "Comprador acepta"]] as const).map(([k, l]) => <button key={k} type="button" onClick={() => onSim(k)}>{l}</button>)}
      <small className="f-sw__hint">Solo para el lab: en VMC lo envía el comprador.</small></div>{simExp}</LabPanel>
    : simExp ? <LabPanel title="Simula expiración" store="mg-sim-exp" className="f-sw--buy np__sim" mobileClosed>{simExp}</LabPanel> : null;
  const me = sell ? COPY.vendedor : COPY.comprador; // la contraparte en el chat (código, rol y etiqueta del monto)
  const doneNote = theyAccepted ? <>{me.cuu} aceptó tu propuesta de <b>{usd(n.amount)}</b></> : <>Aceptaste la propuesta de <b>{usd(n.amount)}</b></>;
  if (n.state === "aceptada" && paid && !fx) return <div className="np np--chat" ref={chatRef}>
    <SubasChat key={chatMode} role={sell ? "vendedor" : "comprador"} mode={chatMode} amount={usd(n.amount)} poke={poke} offline={offline} noteHidden={false} onHideNote={() => {}} initialIncoming={chatReady ? chatMessageText : undefined} purchaseConfirmed={purchaseConfirmed} onPurchaseConfirmed={sell ? undefined : onPurchaseConfirmed}
      hideHead before={<>{/* 23/10 (Abraham): la negociación va arriba del encabezado del comprador; bajando se pasa a la conversación. */}
        <section className="np__prev" aria-label="Negociación">
          {sell ? <><p className="np__offer-refs">Oferta <b>{usd(n.amount)}</b></p>
          <p className="np__offer-compare">Valorización VMC <b>{usd(n.market)}</b> <span>·</span> {pct(n.amount, n.market)}</p>
          <p className="np__offer-ask">Tú pides <b>{usd(n.list)}</b> <span>·</span> Te ofrecen {pct(n.amount, n.list)}</p></>
          : <><p className="np__offer-refs">Acuerdo <b>{usd(n.amount)}</b></p>
          <p className="np__offer-ask">Consignación <b>&gt;S&lt; {FEE}</b> <span>·</span> se aplica a tu compra</p></>}
          <h3>{n.buyer ? `Historial con ${n.buyer}` : "Historial de propuestas"}</h3>
          <div className="sc__day"><span>{n.thread[0]?.when.split(" ")[0] ?? "Hoy"}</span></div>
          {n.thread.map((t, i) => <div key={i} className={`sc__row sc__row--bid${t.me ? " is-mine" : ""}`}><div className="sc__bubble"><p><b>{usd(t.amount)}</b></p>
            <span className="sc__meta">{t.me ? "Tú" : sell ? n.buyer ?? "Comprador" : "Vendedor"} · {t.when.split(" ").slice(1).join(" ") || t.when}</span></div></div>)}
          <div className="sc__sys sc__sys--done" role="note"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden><path d="m5 10 3.1 3.1L15.5 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>{doneNote}</span></div>
        </section>
        <header className="sc__head np__chathead"><span className="sc__avatar" aria-hidden>{me.cuu.slice(0, 2)}</span>
          <div className="sc__who"><b>{me.cuu}</b><span>{me.other}</span></div>
          <div className="sc__deal"><small>{me.deal}</small><b>{usd(n.amount)}</b></div></header></>}
      system={<><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="4" y="9" width="12" height="8" rx="2" fill="currentColor" /><path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" /></svg>
        <span suppressHydrationWarning><b>{sell ? (autoFee ? `Se cobró el fee de habilitación de ${me.cuu} de su consignación.` : `${me.cuu} pagó su fee de habilitación.`) : autoFee ? `Se cobró tu fee de habilitación de tu consignación (>S<\u00a0${FEE}).` : "Pagaste tu fee de habilitación."}</b> Coordinen aquí la visita y el pago hasta el {chatUntil()}.</span></>} />
    {sim}
  </div>;
  return <div className={`np${onBack ? " np--from-right" : ""}`}>
    {/* Comprador: la misma fila que el vendedor (izquierda dónde estás, derecha el plazo). */}
    {!sell && !onBack && n.state !== "aceptada" && !fx ? acceptedBuy ? <div className="np__nav np__nav--accepted"><div className="np__accepted-win"><span><i className="np__accepted-mark" aria-hidden><svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="m5 10 3.1 3.1L15.5 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></i><em>Propuesta aceptada</em></span><b>{usd(n.amount)}</b></div></div> : <div className="np__nav"><span className="np__state">{expired ? "La propuesta venció" : n.state === "enviada" ? finalCounter ? "Última propuesta (5/5) · esperando al vendedor" : "Esperando al vendedor" : n.state === "ofrece" && finalCounter ? "El vendedor hizo su contrapropuesta final (5/5)" : finalRejected ? "El vendedor rechazó tu propuesta final (5/5)" : n.state === "rechazada" ? "El vendedor rechazó tu propuesta" : n.state === "rechazaste" ? "Rechazaste la propuesta" : "El vendedor te respondió"}</span></div> : null}
    {onBack ? <div className="np__nav"><button type="button" className="np__back" onClick={onBack}>
      <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>{open.length ? `Propuestas (${open.length})` : "Propuestas"}</button>{sell ? null : dueIndicator}</div> : null}
    {/* Resumen compacto: contexto, monto y referencias; el historial desarrolla la negociación. */}
    {/* La tarjeta de aceptación ya muestra «Tu propuesta» y su monto; no se repite arriba. */}
    {!acceptedBuy ? <section className="np__offer" aria-label="Oferta actual">
      {sell ? <><p className="np__offer-refs">Oferta <b>{usd(shown)}</b></p>
        <p className="np__offer-compare">Valorización VMC <b>{usd(n.market)}</b> <span>·</span> {pct(shown, n.market)}</p>
        <p className="np__offer-ask">Tú pides <b>{usd(n.list)}</b> <span>·</span> Te ofrecen {pct(shown, n.list)}</p></>
      : n.state === "aceptada" ? null
      : <><p className="np__offer-refs">Tu propuesta <b>{usd(mine ?? n.amount)}</b></p>
        {ask ? <p className="np__offer-compare">El vendedor pide <b>{usd(ask)}</b>{mine ? <><span> · </span>{pct(ask, mine)}</> : null}</p> : null}
        {n.state === "rechazada" ? null : <p className="np__offer-ask">Consignación <b>&gt;S&lt; {FEE}</b></p>}</>}
    </section> : null}

    <section className={acceptedBuy ? "np__history np__history--accepted" : n.state === "aceptada" || fx ? "np__history np__history--sold" : "np__history"} aria-label="Historial de propuestas" ref={lastRef}>
      <div className="np__hhead"><h3>{n.buyer && open.length > 1 ? `Historial con ${n.buyer}` : "Historial de propuestas"}</h3>
        <div className="np__meta"><span>{/* Cada punto corresponde a una negociación: propuesta del comprador + respuesta del vendedor. */}Negociación {round}/{MAX}{sell && n.buyer ? ` con ${n.buyer}` : ""}</span><i aria-hidden>{Array.from({ length: MAX }, (_, i) => <b key={i} className={i < round ? "is-on" : ""} />)}</i></div></div>
      {/* BidMessage de Concorde: lo tuyo en vault (sent), lo de la otra parte en white (received). Sin «live»: el naranja es en vivo. */}
      <ol className="np__thread">{steps.map((t, i) => { const [day, ...hh] = t.when.split(" "), prevDay = i ? steps[i - 1].when.split(" ")[0] : "";
        return [day !== prevDay ? <li key={`d${i}`} className="np__day"><span>{day}</span></li> : null,
          <li key={i} className={t.me ? "is-me" : ""}>{t.me ? null : <span className="np__avatar" aria-hidden>{sell ? (n.buyer ? `C${n.buyer.replace(/\D/g, "")}` : "C") : "V"}</span>}
            <div><BidMessage side={t.me ? "sent" : "received"} type={t.me ? "vault" : "white"}><b>{usd(t.amount)}</b></BidMessage>
              <span className="np__at">{t.me ? "Tú" : sell ? (n.buyer ?? "Comprador") : "Vendedor"} · {hh.join(" ") || day}{t.me ? <i aria-label="Enviada"> ✓✓</i> : null}</span></div></li>]; })}
        {!sell && n.state === "rechazada" ? <li className="np__reply"><span className="np__avatar" aria-hidden>V</span><div>
          <BidMessage side="received" type="white" className="np__reply-bubble"><b>El vendedor rechazó tu propuesta.</b><span>{terminalReject ? "La negociación se cerrará." : "La negociación se cerró."}</span></BidMessage>
          <span className="np__at">Vendedor · Ahora</span>
        </div></li> : null}
        {sell && (n.state === "rechazaste" || terminalReject) ? <li className="np__reply np__reply--reject is-me"><div>
          <BidMessage side="sent" type="vault" className="np__reply-bubble"><b>Rechazaste la propuesta.</b><span>La negociación se cerró.</span></BidMessage>
          <span className="np__at">Tú · Ahora <i aria-label="Enviada">✓✓</i></span>
        </div></li> : null}
        {/* Al expirar no hay mensaje de nadie: el aviso va como separador del hilo y se lee durante el «notice» de RejectFx. */}
        {expiredBy ? <li className="np__day"><span>Pasaron 24 h sin respuesta · La propuesta venció</span></li> : null}
        {/* Vendedor (23/10, Abraham): al aceptar, el hilo cierra con la aceptación y la espera del pago del comprador. */}
        {fx ? <AcceptFx amount={n.amount} sell={sell} theyAccepted={theyAccepted} onEnd={() => { FX_SEEN.add(fxKey); setFx(false); if (n.state !== "aceptada") done({ kind: "aceptada", amount: n.amount }); }} /> : null}
        {closing ? <RejectFx sell={sell} expiredBy={expiredBy ?? undefined} onEnd={() => onClosed?.(n, Boolean(expiredBy))} /> : null}
        {/* 23/10 (Abraham): tras la animación, sin tarjeta: el aviso del pie sube como nube gris del sistema y queda arriba del chat. */}
        {/* Comprador (23/10, Abraham): tras la animación, la felicitación y el costo del fee, centrados; abajo pagar y el chat desactivado. */}
        {!sell && n.state === "aceptada" && !fx ? <li className="np__wait np__won" role="status">
          {/* 23/10 (Abraham): jerarquía en 3 niveles — 1) qué pasó (título), 2) el dato (tu propuesta), 3) qué sigue (fee + botón).
              Un solo color de acento (cian) y un solo peso fuerte por nivel; el botón vive en la tarjeta, junto a lo que explica. */}
          <div className="np__won-card">
            <span className="np__won-mark" aria-hidden><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="m5 10 3.1 3.1L15.5 6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <h3 className="np__won-title">¡Ganaste la oportunidad de compra!</h3>
            <p className="np__won-sub">{COPY.comprador.cuu} aceptó tu propuesta</p>
            <div className="np__won-amt"><span>Tu propuesta</span><b>{usd(n.amount)}</b></div>
            <div className="np__won-next">
              <div className="np__won-step"><span>Siguiente paso</span><p>Paga el fee de habilitación para abrir el SubasChat con el vendedor.</p></div>
              <Button variant="negotiable" className="np__payfee" onClick={() => { setPaid(true); onFeePaid?.(); }}>Pagar fee · &gt;S&lt; {FEE}</Button>
            </div>
          </div>
        </li> : null}
        {sell && n.state === "aceptada" && !fx ? <li className="np__wait" role="status"><span><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="4" y="9" width="12" height="8" rx="2" fill="currentColor" /><path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" /></svg>
          {sell ? "El chat se abre cuando el comprador pague su fee." : "El chat se abre cuando pagues tu fee de habilitación."}</span></li> : null}</ol>
      {gap ? <p className="np__gap">Diferencia actual <b>{usd(gap)}</b></p> : null}
    </section>

    {/* Acciones al pie; contraproponer, aceptar y rechazar se confirman en línea (sin modales encadenados). */}
    {/* Vendedor con la venta aceptada (23/10, Abraham): el SubasChat se ve, pero desactivado hasta que el comprador pague su fee. */}
    {sim ?? simResp}
    {closing ? <footer className="np__foot np__closed-foot" ref={footRef} aria-hidden /> : n.state === "aceptada" || fx ? <footer className="np__foot np__chatoff" ref={footRef}>
      {/* Comprador: el pago del fee es lo que abre el chat (en el lab, lo simula). */}
      {/* El botón de pagar va dentro de la tarjeta (23/10). */}
      <div className="sc__compose" aria-disabled="true">
        <button type="button" className="sc__tool" aria-label="Emojis" disabled>😊</button>
        <button type="button" className="sc__tool" aria-label="Enviar imagen" disabled><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></svg></button>
        <textarea rows={1} placeholder="Escribe un mensaje…" aria-label={sell ? "Mensaje (disponible cuando el comprador pague)" : "Mensaje (disponible cuando pagues tu fee)"} disabled />
        <button type="button" className="sc__send" aria-label="Enviar" disabled><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="M4 12l16-8-6 16-2-7z" fill="currentColor" /></svg></button>
      </div>
    </footer> : <footer className="np__foot" ref={footRef}>
      {/* 23/10 (Abraham): el plazo del vendedor va junto a las acciones que lo cumplen (antes, arriba junto a «Propuestas»). */}
      {sell && live ? <p className="np__foot-due"><DueIn to={due} mine={n.state === "ofrece"} pre={n.state === "ofrece" ? "Tienes" : "El comprador tiene"} post=" para responder" /></p> : null}
      {!sell && (live || n.state === "rechazada") && !finalRejected ? <p className="np__foot-due"><DueIn to={due} mine={n.state !== "enviada"} pre={n.state === "enviada" ? "Esperando al vendedor" : "Tienes"} post={n.state === "enviada" ? "" : " para responder"} /></p> : null}
      {/* «aceptada» ya no llega aquí: usa el pie del chat desactivado (arriba). */}
      {finalRejected ? <div className="np__closed-final" aria-disabled="true"><div className="np__compose"><label><span>US$</span><input disabled placeholder="No puedes enviar más propuestas" aria-label="Propuestas agotadas" /></label><button type="button" className="np__send" disabled aria-label="Enviar deshabilitado"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 19V5m0 0-5 5m5-5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div></div>
      : n.state === "rechazaste" ? finalRound && !sell ? <div className="np__done is-off"><b>Dejaste pasar la última contrapropuesta</b><span>Se completaron las 5 de 5 propuestas. La negociación terminó.</span></div> : null
      : n.state === "rechazada" && sell ? <div className="np__done is-off"><b>{finalRound ? "El comprador dejó pasar tu contrapropuesta final" : "El comprador rechazó tu contrapropuesta"}</b><span>{finalRound ? "Se completaron las 5 de 5 propuestas. La negociación terminó." : "El comprador puede enviar otra contrapropuesta mientras tu publicación siga activa."}</span></div>
      : expired && sell ? <div className="np__done is-off"><b>La propuesta venció sin respuesta</b><span>La negociación terminó. El comprador puede iniciar una nueva mientras tu publicación siga activa.</span></div>
      : n.state === "enviada" && !expired ? <div className="np__done is-wait"><div>{sell ? <b><TimerIcon size={16} />Esperando respuesta del {other}</b> : null /* el comprador ya lo lee en la fila de arriba */}<span>{sell ? "Si el comprador no te brinda una respuesta antes de que el tiempo finalice, la negociación termina. Te notificaremos cuando te responda." : "Si el vendedor no te brinda una respuesta antes de que el tiempo finalice, tu consignación será devuelta a tu Billetera. Te notificaremos cuando te responda."}</span></div></div>
      : mode === "contra" || restart ? <div className={`np__form${restart ? " np__form--restart" : ""}`}>
          {restart && negsLeft <= 0 ? <p className="np__err">Usaste las {MAX} negociaciones de esta oferta.</p> : <>
          {opts.length ? <div className="np__chips" role="group" aria-label="Montos sugeridos">{opts.map(([label, amount]) => <button key={label} type="button" className={label.startsWith("Comprador") ? "is-buyer" : ""} aria-pressed={val === amount} onClick={() => { const text = amount.toLocaleString("en-US"); customRef.current = text; setCustom(text); setVal(amount); }}><small>{label}</small><b>{usd(amount)}</b></button>)}</div> : null}
          <form className="np__compose" onSubmit={(e) => { e.preventDefault(); if (ok && !short) done({ kind: restart ? "nueva" : "enviada", amount: val }); }}>
            <label><span>US$</span><input inputMode="numeric" value={custom} placeholder={sell ? "Escribe tu contrapropuesta" : "Escribe tu propuesta"} aria-label={sell ? "Tu contrapropuesta en US$" : "Tu propuesta en US$"}
              onChange={(e) => { const amount = Number(e.target.value.replace(/\D/g, "")) || 0; const text = amount ? amount.toLocaleString("en-US") : ""; customRef.current = text; setCustom(text); setVal(amount); }} /></label>
            <button type="submit" className="np__send" disabled={!ok || short} aria-label={ok ? `Enviar ${usd(val)}` : "Enviar"}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 19V5m0 0-5 5m5-5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </form>
          {sell && hi && ok && val < hi.ask ? <p className="np__warn"><b>Estás proponiendo {usd(val)}</b><span>Son {usd(hi.ask - val)} menos que lo pedido a {hi.buyer}. Si acepta, se cierran las demás negociaciones.</span></p> : null}
          {val > 0 && !ok ? <p className="np__err">{sell ? `Ingresa un monto mayor a ${usd(n.amount)} y hasta tu precio publicado (${usd(n.list)}).` : `Ingresa un monto menor a ${usd(n.amount)}.`}</p> : null}
          {short ? <div className="np__short"><b>Fondos insuficientes</b><Button variant="secondary">Adquiere SubasCoins</Button><ProfileButton>Realizar una recarga</ProfileButton></div>
          : <p className="np__terms">{restart ? `Te ${negsLeft === 1 ? "queda 1 negociación" : `quedan ${negsLeft} negociaciones`} para esta oferta.` : `Te ${left === 1 ? "queda 1 ronda" : `quedan ${left} rondas`} en esta negociación.`} Al enviar aceptas las <a href="https://www.vmcsubastas.com/condiciones-y-terminos" target="_blank" rel="noreferrer">condiciones y términos</a>.</p>}</>}
          <button type="button" className="np__link" onClick={() => restart ? onCancel?.() : setMode("")}>Cancelar</button>
        </div>
      : mode === "aceptar" ? <div className="np__confirm">
          {/* Aceptar cierra el acuerdo en el monto indicado. Luego el SubasChat permite
              que ambas partes coordinen directamente transferencia y recojo. */}
          <h3>{sell ? `¿Vender por ${usd(n.amount)}${n.buyer && rest.length ? ` a ${n.buyer}` : ""}?` : `¿Comprar por ${usd(n.amount)}?`}</h3>
          {/* 23/10 (Abraham): las propuestas que se cierran como filas con su monto, y la más alta marcada: aceptar una menor
              teniendo otra mayor es lo que más conviene ver antes de confirmar. */}
          {sell && rest.length ? <div className="np__confirm-impact"><span>{rest.length === 1 ? "También se cerrará esta propuesta" : `También se cerrarán estas ${rest.length} propuestas`}</span>
            <ul>{(() => { const top = Math.max(...rest.map((p) => gapOf(p.n).buyer)); return rest.map((p) => { const a = gapOf(p.n).buyer; return <li key={p.id}><span>{p.n.buyer}</span>{a === top && a > n.amount ? <em>Más alta</em> : null}<b>{usd(a)}</b></li>; }); })()}</ul></div> : null}
          <p className="np__confirm-copy"><b>No se puede deshacer.</b> El precio queda pactado y, al habilitarse el SubasChat, {sell ? "coordinarás directamente con el comprador la transferencia y el recojo." : "coordinarás directamente con el vendedor la transferencia y el recojo."} VMC conecta a ambas partes.</p>
          {/* Acción principal arriba y a todo el ancho, como el resto del panel; seguir negociando, debajo y en segundo plano. */}
          <div className="np__btns np__btns--stack"><Button variant="negotiable" onClick={() => setFx(true)}>Aceptar {usd(n.amount)}</Button><button type="button" className="np__keep" onClick={() => setMode("contra")}>Seguir negociando</button></div></div>
      : mode === "rechazar" && sell ? <div className="np__confirm">
          <h3>{finalRound ? "¿Rechazar esta última oferta?" : `¿Rechazar ${usd(n.amount)}${n.buyer && rest.length ? ` de ${n.buyer}` : ""}?`}</h3>
          <p>El rechazo no se puede deshacer. La negociación se cerrará y el comprador recuperará su consignación en su Billetera.</p>
          <div className="np__btns"><Button variant="outline" onClick={() => setMode("")}>Volver</Button><Button variant="negotiable" onClick={() => done({ kind: "rechazaste", amount: n.amount })}>Continuar</Button></div></div>
      : <div className="np__acts">
          {/* Elegir la intención antes de abrir el formulario evita que una contrapropuesta
              y la aceptación de la oferta queden visibles —y se pulsen— al mismo tiempo. */}
          <Button variant="outline" className="np__accept-glass" onClick={() => setMode("aceptar")}>Aceptar {usd(n.amount)}</Button>
          {left > 0 ? <><Button variant="negotiable" onClick={() => setMode("contra")}>Contraproponer</Button>{sell ? <button type="button" className="np__link np__link--reject" onClick={() => setMode("rechazar")}>Rechazar oferta</button> : null}</> : sell ? <div className="np__last-act"><button type="button" className="np__link np__link--reject" onClick={() => setMode("rechazar")}>Rechazar oferta</button><p className="np__exp"><b>Última contrapropuesta del comprador (5/5). Si la rechazas, la negociación termina.</b></p></div> : null}
        </div>}
    </footer>}
  </div>;
}
