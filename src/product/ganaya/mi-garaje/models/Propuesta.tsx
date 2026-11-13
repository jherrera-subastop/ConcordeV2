"use client";

/**
 * Comprador · paso 1 (21/10, pedido de Julio): el detalle de una oferta Negociable y la primera propuesta.
 * El DetailCard de Concorde se queda tal cual; «Negocia ahora» abre un modal como el de VMC («Modales Negociable.svg»:
 * Propuesta 1/5 · Consignación · Digita el monto · Proponer), pero en un paso: el botón ya confirma el monto.
 * Al enviar → Mi Garaje (/m/vmc?propuesta=…), donde un aviso señala la fila en la que llegará la respuesta del vendedor.
 * Reglas (skill vmc-modelo-negocio): la Negociable no tiene Precio Base ni Reserva, se propone libremente (C. de Ayuda);
 * la consignación la fija cada oferta, en SubasCoins o dólares (T&C IV.6.2.a; C. de Ayuda); 24 h por propuesta (IV.6.2.f),
 * 5 rondas (IV.6.2.e); la respuesta se sigue en Tu actividad, que en Mi Garaje es Mis negociaciones.
 */
import { useEffect, useRef, useState } from "react";
import type { JSX, MouseEvent } from "react";
import Detalle, { type DetalleProps } from "@/src/product/ganaya/mi-garaje/concorde/blocks/detalle/desktop/Detalle";
import DetailCard from "@/src/product/ganaya/mi-garaje/concorde/components/DetailCard";
import Button from "@/src/product/ganaya/mi-garaje/concorde/components/Button";
import InfoIcon from "@/src/product/ganaya/mi-garaje/concorde/components/InfoIcon";
import TimerIcon from "@/src/product/ganaya/mi-garaje/concorde/components/TimerIcon";
import { Vidrio } from "@/src/product/ganaya/mi-garaje/app/iconos/Vidrio";
import { Chrome, photosOf } from "./kit";
import "./subaschat.css";
import "./propuesta.css";

// Oferta de ejemplo (la misma que entra como fila nueva en Mis negociaciones). `list` es el precio que el vendedor
// tiene en mente: lo usa el simulador del vendedor, el comprador no lo ve.
export const BUY = { name: "Nissan Sentra", year: 2020, plate: "BQZ-418", photo: "sentra", list: 15900 };
// ponytail: consignación de ejemplo (la de la captura real «S< 60 ó US$ 180»); en producción viene de la oferta.
export const DEPOSIT = { sc: 50, usd: 180 }; // 23/10 (Abraham): la consignación pasa a >S< 50
const COINS = 1250;
const usd = (n: number) => `US$ ${n.toLocaleString("en-US")}`;

/** Enviada: cuenta atrás de 5 s y, al llegar a 0, a Mi Garaje (el botón salta la espera). */
function useGoGarage(active: boolean, amount: number, onDone?: (amount: number) => void): [number, () => void] {
  const [left, setLeft] = useState(5);
  const go = () => { if (onDone) onDone(amount); else location.href = `/m/vmc?propuesta=${amount}`; };
  useEffect(() => {
    if (!active) return;
    setLeft(5);
    const t = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  useEffect(() => { if (active && left <= 0) go(); }, [active, left]);
  return [Math.max(left, 0), go];
}

/** Avisos del flujo (23/10, Abraham): los de VMC (FondosInsuficientes, Notification) con el diseño de la propuesta:
 *  ícono esmerilado, cerrar cian y la consignación en cian. Sin «Realizar una recarga»: es lo mismo que adquirir SubasCoins. */
const NOTICES = {
  fondos: { label: "SubasCoins insuficientes", icon: "bolsa", title: "Fondos insuficientes", btn: "Adquiere SubasCoins" },
  cerrada: { label: "Ya no disponible", icon: "aviso", title: "Aviso", msg: "Esta negociación ya no está disponible.", btn: "Aceptar" },
  error: { label: "Imposible procesar", icon: "aviso", title: "Aviso", msg: "Imposible procesar la propuesta.", btn: "Aceptar" },
} as const;
type Notice = keyof typeof NOTICES;

function NoticeDialog({ kind, open, onClose }: { kind: Notice; open: boolean; onClose: () => void }): JSX.Element {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  const n = NOTICES[kind];
  return <dialog ref={ref} className="va vh" aria-labelledby="vn-title" onClose={onClose}>
    <div className="va__card vn">
      <button type="button" className="va__x va__x--neg" aria-label="Cerrar" onClick={onClose} />
      <span className="vd-host vh__icon"><Vidrio s={n.icon} size={40} /></span>
      <h2 id="vn-title">{n.title}</h2>
      {kind === "fondos" ? <>
        {/* 23/10 (Abraham): jerarquía igual a la propuesta: etiqueta gris chica, monto grande en cian. */}
        <p className="vh__fee vn__fee"><span className="vh__fee-label">Consignación</span><b>&gt;S&lt; {DEPOSIT.sc} ó {usd(DEPOSIT.usd)}</b></p>
        <p className="vh__sub">Recuerda: US$ 1 es igual a &gt;S&lt; 1 SubasCoin</p>
      </> : "msg" in n ? <p className="vn__msg">{n.msg}</p> : null}
      {n.btn ? <Button type="button" variant="secondary" className="vh__btn vn__btn" autoFocus onClick={onClose}>{n.btn}</Button> : null}
    </div>
  </dialog>;
}

/** Propuesta (21/10, Abraham: «la híbrida como propuesta»): la identidad del ConfirmModal de VOYAGER (tarjeta 320, cerrar
 *  naranja, campo de vidrio, botón violeta de Concorde, «Propuesta enviada» dentro del modal) con el contenido corregido:
 *  un paso (el monto va en el botón), ronda, sin precio base, y consignación y plazo explicados en su propio bloque.
 *  Ícono esmerilado de «negociaciones» (Vidrio.tsx), el mismo de Mis negociaciones, donde el comprador sigue la respuesta. */
/** `fail` (lab): el aviso que sale al presionar Enviar en Confirma, que es cuando VMC valida saldo y oferta. */
export type ProposalOffer = { name: string; year: number };

/** Misma composición local de propuesta Negociable observada en /m/vmc-propuesta. */
export function ProposalDialog({ open, origin, onCancel, onDone, offer = BUY, fail, onFail }: { open: boolean; origin?: { x: number; y: number } | null; onCancel: () => void; onDone?: (amount: number) => void; offer?: ProposalOffer; fail?: Notice; onFail?: (n: Notice) => void }): JSX.Element {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amountText, setAmountText] = useState("");
  const val = Number(amountText) || 0;
  const formattedAmount = amountText ? (() => {
    const [whole = "", decimals] = amountText.split(".");
    const grouped = (whole || "0").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimals === undefined ? grouped : `${grouped}.${decimals}`;
  })() : "";
  const [step, setStep] = useState<"monto" | "confirma" | "procesa" | "celebra" | "celebra-salida" | "enviada">("monto");
  const sent = step === "enviada";
  const [left, go] = useGoGarage(sent, val, onDone);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    let timer = 0;
    if (open && !d.open) {
      setAmountText("");
      setStep("monto");
      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? window.innerHeight / 2 + 24;
      d.style.setProperty("--vh-from-x", `${x - window.innerWidth / 2}px`);
      d.style.setProperty("--vh-from-y", `${y - window.innerHeight / 2}px`);
      d.classList.add("is-origin-open");
      d.showModal();
      timer = window.setTimeout(() => d.classList.remove("is-origin-open"), 720);
    }
    if (!open && d.open) d.close();
    return () => window.clearTimeout(timer);
  }, [open, origin]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = step === "procesa" ? "celebra" : step === "celebra" ? "celebra-salida" : step === "celebra-salida" ? "enviada" : null;
    if (!next) return;
    const duration = reduced ? 180 : step === "procesa" ? 650 : step === "celebra" ? 1450 : 420;
    const timer = window.setTimeout(() => setStep(next), duration);
    return () => window.clearTimeout(timer);
  }, [step]);
  const setAmount = (next: string) => setAmountText(next.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 10));
  const pressKey = (key: string) => {
    setAmountText((current) => key === "back" ? current.slice(0, -1) : key === "." ? (current.includes(".") ? current : `${current || "0"}.`) : `${current}${key}`.slice(0, 10));
    inputRef.current?.focus();
  };
  const close = <button type="button" className="va__x va__x--neg" aria-label="Cerrar" onClick={sent ? () => go() : onCancel} />;
  const icon = <span className="vd-host vh__icon"><Vidrio s="negociaciones" size={40} /></span>;
  return <dialog ref={ref} className="va vh" aria-labelledby="vh-title" onClose={sent ? () => go() : onCancel}>
    {sent ? <div className="va__card vh__sent" role="status">{close}{icon}
      {/* Enviada (22/10, Abraham): UX writing del modal actual de VMC, con el diseño de Confirma. */}
      <h2 id="vh-title">Propuesta enviada</h2>
      <div className="vh__ticket"><p className="vh__amount"><span>US$</span>{val.toLocaleString("en-US")}</p></div>
      <p className="vh__sub vh__confirm">Esperando respuesta, expira en 24 horas</p>
      <Button type="button" variant="negotiable" className="vh__btn" autoFocus onClick={go}>Ir a Mi Garaje ({left})</Button>
    </div> : step === "procesa" ? <div className="va__card vh__processing" role="status" aria-live="polite">{close}
      <div className="vh__loader" aria-hidden><i /><i /><i /></div>
      <h2 id="vh-title">Enviando tu oferta</h2>
      <p className="vh__sub">Estamos registrando tu propuesta…</p>
    </div> : step === "celebra" || step === "celebra-salida" ? <div className={`va__card vh__celebrate${step === "celebra-salida" ? " is-leaving" : ""}`} role="status" aria-live="assertive">{close}
      <div className="vh__celebrate-stage" aria-hidden><i /><i /><i /><i /><i /><i /><i /><i />
        <span className="vh__celebrate-check"><svg width="38" height="38" viewBox="0 0 40 40" fill="none"><path d="M11 20.5l6 6L29.5 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      </div>
      <p className="vh__celebrate-kicker">¡Oferta enviada!</p>
      <h2 id="vh-title" className="vh__celebrate-amount"><span>US$</span>{val.toLocaleString("en-US")}</h2>
      <p className="vh__sub">Estamos registrando tu propuesta…</p>
    </div> : step === "confirma" ? <div className="va__card">{close}{icon}
      {/* Confirma (22/10, Abraham): el contenido y los textos del modal actual de VMC, solo con el diseño de la propuesta. */}
      <h2 id="vh-title">Confirma tu propuesta</h2>
      <div className="vh__ticket"><p className="vh__amount"><span>US$</span>{val.toLocaleString("en-US")}</p></div>
      <p className="vh__sub vh__confirm">Al enviar la propuesta aceptas las condiciones y términos de uso de nuestro servicio.</p>
      <Button type="button" variant="negotiable" className="vh__btn" autoFocus onClick={() => fail && onFail ? onFail(fail) : setStep("procesa")}>Enviar</Button>
      <button type="button" className="vh__back2" onClick={() => setStep("monto")}>Volver</button>
    </div> : <form className="va__card" aria-describedby="vh-sub" onSubmit={(e) => { e.preventDefault(); if (val) setStep("confirma"); }}>{close}{icon}
      <span className="vh__round">Propuesta 1 de 5<i aria-hidden>{[0, 1, 2, 3, 4].map((i) => <b key={i} className={i < 1 ? "is-on" : ""} />)}</i></span>
      <h2 id="vh-title">¿Cuánto ofreces?</h2>
      <p id="vh-sub" className="vh__sub">{offer.name} {offer.year}</p>
      <label className="va__input vh__input"><span>US$</span><input ref={inputRef} autoFocus inputMode="decimal" placeholder="0" aria-label="Tu propuesta en US$" value={formattedAmount}
        onChange={(e) => setAmount(e.target.value)} /></label>
      <div className="vh__pinpad" role="group" aria-label="Teclado numérico para propuesta">{["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key) =>
        <button key={key} type="button" className={key === "back" ? "vh__pinpad-back" : ""} aria-label={key === "back" ? "Borrar último dígito" : key === "." ? "Separador decimal" : key} onClick={() => pressKey(key)}>{key === "back" ? "⌫" : key}</button>)}</div>
      <p className="vh__fee"><span className="vh__fee-label">Consignación<span className="vh__fee-info"><button type="button" aria-label="¿Qué es la consignación?" aria-describedby="vh-fee-tip"><InfoIcon size={16} /></button><span id="vh-fee-tip" role="tooltip">Es una garantía en SubasCoins que respalda tu propuesta. Si no hay acuerdo, se libera la consignación y vuelve a tu billetera.</span></span></span><b>&gt;S&lt; {DEPOSIT.sc}</b></p>
      <Button type="submit" variant="negotiable" className="vh__btn" disabled={!val}>Enviar oferta</Button>
    </form>}
  </dialog>;
}

export default function Propuesta({ modal = "propuesta", disclaimer }: { modal?: string; disclaimer?: string }): JSX.Element {
  // 23/10 (Abraham): sale «Actual VMC»; el panel muestra la propuesta y sus avisos (?modal=fondos|cerrada|error).
  const [kind, setKind] = useState<"propuesta" | Notice>(modal in NOTICES ? modal as Notice : "propuesta");
  const [form, setForm] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null); // aviso que salió al enviar
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [going, setGoing] = useState(0);
  const openProposal = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setForm(true);
  };
  const send = (amount: number) => {
    setForm(false); setGoing(amount);
    setTimeout(() => { location.href = `/m/vmc?propuesta=${amount}`; }, 1400);
  };
  const initialSafetyPlacement: NonNullable<DetalleProps["safetyPlacement"]> = disclaimer === "gallery" ? "gallery" : disclaimer === "info" ? "info" : disclaimer === "conditions" ? "conditions" : disclaimer === "banner" ? "banner" : disclaimer === "related" ? "related" : "teaser";
  const [safetyPlacement, setSafetyPlacement] = useState<NonNullable<DetalleProps["safetyPlacement"]>>(initialSafetyPlacement);
  return <Chrome vmc>
    <main className="of-main">
      <Detalle variant="negotiable" safetyPlacement={safetyPlacement} offer={{
        title: `${BUY.name} ${BUY.year}`, subtitle: `Placa ${BUY.plate}`, images: photosOf(BUY.photo), visits: false,
        detailSlot: <DetailCard variant="negotiable" miniBanner={{ src: "/producto-assets/ganaya/banners/publica/mini-publica@2x.png", alt: "¿Vendes tu auto? Recibe propuestas y tú eliges.", href: "/m/vmc-publica" }} title={"Este vendedor recibe propuestas\nde compra. Aprovecha esta oportunidad\ne inicia una negociación."} ctaLabel="¡Vamos a negociar!" day="VIERNES 30" time="6:00 pm" views={128} likes={23} participants={2} onParticipate={openProposal} />,
        related: [
          { name: "Toyota Corolla", year: 2019, price: "US$ 14,200", imageSrc: photosOf("corolla")[0], variant: "live" },
          { name: "Mazda 3", year: 2020, price: "US$ 13,500", imageSrc: photosOf("mazda3")[0], variant: "live" },
          { name: "Kia Rio", year: 2021, imageSrc: photosOf("rio")[0], variant: "negotiable" },
          { name: "Suzuki Swift", year: 2022, imageSrc: photosOf("swift")[0], variant: "negotiable" },
        ],
      }} />
    </main>
    {/* 23/10 (Abraham): «Ya no disponible» sale al abrir; fondos insuficientes e imposible procesar, al enviar la propuesta. */}
    {kind === "cerrada" ? <NoticeDialog kind={kind} open={form} onClose={() => setForm(false)} />
      : <ProposalDialog open={form} origin={origin} onCancel={() => setForm(false)} onDone={send} fail={kind === "propuesta" ? undefined : kind} onFail={(k) => { setForm(false); setNotice(k); }} />}
    {notice ? <NoticeDialog kind={notice} open onClose={() => setNotice(null)} /> : null}
    <div className="f-sw f-sw--buy pp-sw"><div className="f-sw__bar"><b>Modal de propuesta</b></div>
      <div className="f-sw__g" role="group" aria-label="Modal de propuesta">{([["propuesta", "Propuesta"], ...Object.entries(NOTICES).map(([k, v]) => [k, v.label])] as ["propuesta" | Notice, string][]).map(([k, t]) =>
        <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{t}</button>)}</div></div>
    <div className="f-sw f-sw--buy pp-sw pp-sw--safety"><div className="f-sw__bar"><b>Ubicación del aviso</b></div>
      <div className="f-sw__g" role="group" aria-label="Ubicación del aviso de seguridad">{([
        ["teaser", "Nube informativa"], ["info", "Bajo información"], ["conditions", "Bajo condiciones"], ["banner", "Sobre SubasCoins"], ["related", "Antes de relacionadas"],
      ] as const).map(([placement, label]) => <button key={placement} type="button" aria-pressed={safetyPlacement === placement} onClick={() => setSafetyPlacement(placement)}>{label}</button>)}</div>
    </div>
    {going ? <div className="pp-going" role="status" aria-live="polite"><b>Propuesta enviada · {usd(going)}</b><span>Te llevamos a Mis negociaciones para que sigas la respuesta…</span></div> : null}
  </Chrome>;
}
