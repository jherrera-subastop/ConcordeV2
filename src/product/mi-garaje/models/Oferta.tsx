"use client";

/**
 * Oferta · bloque Detalle de Concorde (concorde/blocks/detalle, traído de ConcordeV2 /blocks/detalle)
 * con los datos de la negociación que se acaba de aceptar en Mi Garaje.
 * Llega desde Garaje.negDone → /producto/mi-garaje/m/oferta?name=…&year=…&plate=…&photo=…&monto=…
 * Lo que la negociación no trae (stats, ofertas relacionadas) es de ejemplo.
 * Tras aceptar, el detalle ya llega con el chat del acuerdo EN LUGAR del DetailCard (sin botón para abrirlo;
 * SubasChat.tsx, simulado en chat.ts). El panel de la derecha
 * es solo de revisión: cambia rol y estado del chat y lista lo que el handoff de Julio deja pendiente.
 */
import { useState } from "react";
import type { JSX } from "react";
import Detalle from "@/src/product/mi-garaje/concorde/blocks/detalle/desktop/Detalle";
import ProfileButton from "@/src/product/mi-garaje/concorde/components/ProfileButton";
import { Chrome, photosOf } from "./kit";
import SubasChat from "./SubasChat";
import { MODES, PENDING_RULES, type ChatMode, type ChatRole } from "./chat";

// Comprador (21/10): info breve al abrir el chat del acuerdo, mismo patrón que la tarjeta de propuesta (Propuesta.tsx).
// Tras pactar el precio, VMC habilita el contacto entre ambas partes; la coordinación de transferencia y recojo continúa en SubasChat.
// DS (21/10): tarjeta blanca con título en tipo oración (sin CardTitle con corchetes, Abraham) y línea de tiempo; el enlace es el ProfileButton de Concorde.
const buyerIntro = (amount: number) => <div className="sc__intro">
  <div className="sc__intro-head"><b>Cómo sigue tu compra</b><span>Paso 1 de 3</span></div>
  <ol>
    <li className="is-now"><b>Coordina con el vendedor</b><span>Escríbele aquí para acordar la visita y la entrega.</span></li>
    <li><b>Coordinen la transferencia y el recojo</b><span>VMC conecta a ambas partes; acuerden directamente los detalles de la operación.</span></li>
    <li><b>Queda en Mis compras</b><span>Con este chat, para que vuelvas cuando quieras.</span></li>
  </ol>
  <ProfileButton href={`/producto/mi-garaje/m/vmc?compra=${amount}`}>Ver en Mis compras</ProfileButton>
</div>;
const usd = (n: number) => `US$ ${n.toLocaleString("en-US")}`;
// La ventana de chat (--sc-h: 603 en subaschat.css) reemplaza al DetailCard (450 de alto) → el lienzo crece 153.
const CHAT_EXTRA = 603 - 450;

export default function Oferta({ q }: { q: Record<string, string> }): JSX.Element {
  const name = q.name || "Volkswagen Nivus";
  const year = Number(q.year) || 2022;
  const photo = q.photo || "nivus";
  const amount = Number(q.monto) || 17500;
  const title = `${name} ${year}`;
  // Comprador (21/10): ?rol=comprador&nuevo=1 llega desde Mi Garaje al cerrar el acuerdo; el chat abre vacío (aún no hay mensajes).
  const [role, setRole] = useState<ChatRole>(q.rol === "comprador" ? "comprador" : "vendedor");
  const [mode, setMode] = useState<ChatMode>(q.nuevo ? "vacio" : "normal");
  const [poke, setPoke] = useState(0);
  const [offline, setOffline] = useState(false);
  const [noteHidden, setNoteHidden] = useState(false);
  const [rev, setRev] = useState(false); // panel de revisión plegado (solo < 1100px)
  // ?chat=solo → el chat a pantalla completa (fluido, dvh, safe-area) para revisarlo en móvil: el bloque Detalle
  // es solo de escritorio (lienzo de ancho fijo), así que dentro de él el chat siempre mide 311 × 603.
  const solo = q.chat === "solo";
  const viewHref = (chat: boolean) => {
    const p = new URLSearchParams(q); if (chat) p.set("chat", "solo"); else p.delete("chat");
    const s = p.toString(); return `/producto/mi-garaje/m/oferta${s ? `?${s}` : ""}`;
  };
  const chat = <SubasChat role={role} mode={mode} poke={poke} offline={offline} fluid={solo} amount={usd(amount)}
    intro={q.nuevo && role === "comprador" ? buyerIntro(amount) : undefined} noteHidden={noteHidden} onHideNote={() => setNoteHidden(true)} />;

  const panel = (
    <aside className={`rev${rev ? " is-open" : ""}`} aria-label="Revisión de SubasChat">
      <button type="button" className="rev__toggle" aria-expanded={rev} onClick={() => setRev((v) => !v)}>{rev ? "Ocultar estados ▴" : "Estados del chat ▾"}</button>
      <h2>Revisión SubasChat</h2>
      <p>Solo para revisar el diseño. Elige un estado y el chat del Detail Card cambia a él.</p>
      <div className="rev__group">
        <span className="rev__label">Vista</span>
        <div className="rev__seg">
          <a href={viewHref(false)} aria-current={!solo ? "page" : undefined}>En el detalle</a>
          <a href={viewHref(true)} aria-current={solo ? "page" : undefined}>Solo chat (móvil)</a>
        </div>
      </div>
      <div className="rev__group">
        <span className="rev__label">Ver como</span>
        <div className="rev__seg">{(["vendedor", "comprador"] as ChatRole[]).map((r) =>
          <button key={r} type="button" aria-pressed={role === r} onClick={() => { setRole(r); setNoteHidden(false); }}>{r === "vendedor" ? "Vendedor" : "Comprador"}</button>)}</div>
      </div>
      <div className="rev__group">
        <span className="rev__label">Estado</span>
        {MODES.map((m) => <button key={m.id} type="button" className="rev__opt" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
          <b>{m.label}</b><small>{m.hint}</small></button>)}
      </div>
      <div className="rev__group">
        <button type="button" className="rev__act" disabled={mode === "bloqueado" || mode === "cargando" || mode === "cerrado"} onClick={() => setPoke((n) => n + 1)}>Simular mensaje entrante</button>
        <button type="button" className="rev__act" aria-pressed={offline} disabled={mode === "bloqueado"} onClick={() => setOffline((v) => !v)}>{offline ? "Volver a conectar" : "Simular sin conexión"}</button>
      </div>
      <div className="rev__group">
        <span className="rev__label">Pendiente de definir</span>
        <ul className="rev__pend">{PENDING_RULES.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </aside>
  );

  if (solo) return <><main className="of-solo">{chat}</main>{panel}</>;
  return (
    <Chrome vmc>
    <main className="of-main">
      <Detalle
        variant="negotiable"
        offer={{
          title,
          subtitle: q.plate ? `Placa ${q.plate}${q.rol === "comprador" ? "" : " · Vendedor: SubasCars"}` : "Vendedor: SubasCars",
          images: photosOf(photo),
          detailSlot: chat,
          extraHeight: CHAT_EXTRA,
          related: [
            { name: "Toyota Corolla", year: 2019, price: "US$ 14,200", imageSrc: photosOf("corolla")[0], variant: "live" },
            { name: "Mazda 3", year: 2020, price: "US$ 13,500", imageSrc: photosOf("mazda3")[0], variant: "live" },
            { name: "Nissan Sentra", year: 2021, imageSrc: photosOf("sentra")[0], variant: "negotiable" },
            { name: "Suzuki Swift", year: 2022, imageSrc: photosOf("swift")[0], variant: "negotiable" },
          ],
        }}
      />
    </main>
    {panel}
    </Chrome>
  );
}
