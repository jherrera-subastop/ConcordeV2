/** RepublishModal: confirma republicar una publicación y dice por cuánto tiempo queda publicada.
 *  11/11: con la casa de los modales de Mi Garaje (ConfirmModal de VOYAGER, ver models/Propuesta.tsx): tarjeta .va/.vh de 320,
 *  cerrar ×, ícono esmerilado, datos en .vh__facts, Button de Concorde, apertura desde donde se tocó y los pasos
 *  «procesando» → «celebración» antes de cerrar. */
"use client";
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import Button from "@/src/product/mi-garaje/concorde/components/Button";
import { Vidrio } from "@/src/product/mi-garaje/app/iconos/Vidrio";
import "@/src/product/mi-garaje/models/propuesta.css";
import "./republish-modal.css";

// Propuesta para Julio (11/11): los TyC (IV.11.2.b) dicen que republicar no cuesta, pero no fijan cuánto dura la publicación.
// Este plazo es un valor de ejemplo; cambiarlo aquí cuando Julio/negocio lo confirme.
export const REPUBLISH_DAYS = 7;

const until = (days: number) => new Date(Date.now() + days * 864e5).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");

const longUntil = (days: number) => new Date(Date.now() + days * 864e5).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }).replace(",", "");

// Último toque en pantalla: desde ahí «sale» el modal, como en la propuesta.
let lastPt: { x: number; y: number } | null = null;
if (typeof window !== "undefined") addEventListener("pointerdown", (e) => { lastPt = { x: e.clientX, y: e.clientY }; }, true);

type Step = "confirma" | "procesa" | "celebra" | "celebra-salida";

export type RepublishModalProps = {
  /** Nombre del vehículo, p. ej. "Suzuki Swift 2020". */
  name: string;
  /** Foto del vehículo (no se muestra: el modal de la casa no lleva foto). */
  photo?: string;
  /** Lo que dice hoy la fila (no se muestra). */
  note?: string;
  /** Días que queda publicada. */
  days?: number;
  /** Se llama al terminar la celebración; ahí la fila hace su propia animación de republicar. */
  onConfirm: () => void;
  onClose: () => void;
};

export function RepublishModal({ name, days = REPUBLISH_DAYS, onConfirm, onClose }: RepublishModalProps): JSX.Element {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("confirma");
  const busy = step !== "confirma";
  const done = useRef(onConfirm); done.current = onConfirm; // el padre puede pasar una función nueva en cada render
  useEffect(() => {
    const d = ref.current; if (!d || d.open) return;
    const x = lastPt?.x ?? innerWidth / 2, y = lastPt?.y ?? innerHeight / 2 + 24;
    d.style.setProperty("--vh-from-x", `${x - innerWidth / 2}px`);
    d.style.setProperty("--vh-from-y", `${y - innerHeight / 2}px`);
    d.classList.add("is-origin-open"); d.showModal();
    const t = setTimeout(() => d.classList.remove("is-origin-open"), 720);
    return () => clearTimeout(t);
  }, []);
  // Mismos tiempos que la propuesta: procesa 650 ms, celebra 1450 ms, salida 420 ms.
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (step === "confirma") return;
    const t = setTimeout(() => step === "procesa" ? setStep("celebra") : step === "celebra" ? setStep("celebra-salida") : done.current(),
      reduced ? 180 : step === "procesa" ? 650 : step === "celebra" ? 1450 : 420);
    return () => clearTimeout(t);
  }, [step]);
  const close = <button type="button" className="va__x va__x--neg" aria-label="Cerrar" disabled={busy} onClick={onClose} />;
  return <dialog ref={ref} className="va vh" aria-labelledby="rm-title" onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }}
    onClick={(e) => { if (e.target === ref.current && !busy) onClose(); }}>
    {step === "procesa" ? <div className="va__card vh__processing" role="status" aria-live="polite">
      <div className="vh__loader" aria-hidden><i /><i /><i /></div>
      <h2 id="rm-title">Republicando tu auto</h2>
      <p className="vh__sub">Estamos volviendo a publicar tu oferta…</p>
    </div> : busy ? <div className={`va__card vh__celebrate${step === "celebra-salida" ? " is-leaving" : ""}`} role="status" aria-live="assertive">
      <div className="vh__celebrate-stage" aria-hidden><i /><i /><i /><i /><i /><i /><i /><i />
        <span className="vh__celebrate-check"><svg width="38" height="38" viewBox="0 0 40 40" fill="none"><path d="M11 20.5l6 6L29.5 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      </div>
      <p className="vh__celebrate-kicker">¡Publicación republicada!</p>
      <h2 id="rm-title">{name}</h2>
      <p className="vh__sub">Visible por {days} días, hasta el {until(days)}</p>
    </div> : <div className="va__card">{close}
      <span className="vd-host vh__icon"><Vidrio s="publicaciones" size={40} /></span>
      <h2 id="rm-title">Confirma la republicación</h2>
      <p className="vh__sub">{name}</p>
      {/* El plazo (11/11): campo blanco con borde degradado violeta, como el ticket de la casa; el naranja queda para dinero. */}
      <div className="rm__term">
        <span className="vd-host rm__term-ic" aria-hidden><Vidrio s="fecha" size={36} /></span>
        <span className="rm__term-txt"><b>{days} días publicada</b><small>Hasta el {longUntil(days)}</small></span>
      </div>
      <p className="vh__sub rm__free">Republicar no tiene costo: ya pagaste la publicación.</p>
      <Button type="button" variant="secondary" className="vh__btn" autoFocus onClick={() => setStep("procesa")}>Republicar</Button>
    </div>}
  </dialog>;
}

export default RepublishModal;
