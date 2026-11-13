/** DropModal: confirma dar de baja una publicación. Cancelar es el botón grande; Dar de baja es pequeño y se activa al elegir el motivo.
 *  Depende de React y drop-modal.css. */
import { useId, useRef, useState } from "react";
import type { JSX, MouseEvent } from "react";
import "./drop-modal.css";

export const DROP_REASONS = ["Ya lo vendí por otra plataforma", "No recibí ninguna oferta", "Ya no lo quiero vender", "Otros"];

export type DropModalProps = {
  /** Nombre del vehículo, p. ej. "Suzuki Swift 2020". */
  name: string;
  /** Foto del vehículo. */
  photo: string;
  /** Lo que dice hoy la fila, debajo del nombre. */
  note?: string;
  /** Se llama con el motivo elegido. */
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

export function DropModal({ name, photo, note, onConfirm, onClose }: DropModalProps): JSX.Element {
  const id = useId();
  const dialog = useRef<HTMLDialogElement | null>(null);
  const [reason, setReason] = useState("");
  const [other, setOther] = useState("");
  const finalReason = reason === "Otros" ? other.trim() : reason;
  const outside = (e: MouseEvent) => { if (e.target === dialog.current) onClose(); }; // clic en el fondo
  return <dialog className="dm" aria-labelledby={`${id}-t`} onClick={outside} onCancel={(e) => { e.preventDefault(); onClose(); }}
    ref={(d) => { dialog.current = d; if (d && !d.open) { d.showModal(); d.querySelector<HTMLElement>(".dm__cancel")?.focus(); } }}>
    <div className="dm__box">
      <span className="dm__icon" aria-hidden><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.8 20h18.4L12 4zM12 10v4.5M12 17.5v.01" /></svg></span>
      <h2 id={`${id}-t`}>¿Dar de baja esta publicación?</h2>
      <p className="dm__warn">Saldrá de Mis publicaciones. No se puede deshacer.</p>
      <div className="dm__car"><img src={photo} alt="" /><span><b>{name}</b>{note ? <small>{note}</small> : null}</span></div>
      <fieldset className="dm__why">
        <legend>¿Por qué?</legend>
        {DROP_REASONS.map((r) => <label key={r}><input type="radio" name={`${id}-why`} checked={reason === r} onChange={() => setReason(r)} /><span>{r}</span></label>)}
        {reason === "Otros" ? <textarea rows={2} value={other} onChange={(e) => setOther(e.target.value)} placeholder="Escribe el motivo" aria-label="Motivo" /> : null}
      </fieldset>
      <button type="button" className="dm__cancel" onClick={onClose}>Cancelar</button>
      <button type="button" className="dm__drop" disabled={!finalReason} onClick={() => onConfirm(finalReason)}>Dar de baja</button>
    </div>
  </dialog>;
}

export default DropModal;
