"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/src/product/ganaya/ganaya-concorde/components/Button";
import CardTitle from "@/src/product/ganaya/ganaya-concorde/components/CardTitle";
import CheckIcon from "@/src/product/ganaya/ganaya-concorde/components/CheckIcon";
import InfoIcon from "@/src/product/ganaya/ganaya-concorde/components/InfoIcon";
import PriceIcon from "@/src/product/ganaya/ganaya-concorde/components/PriceIcon";
import { Sparkle } from "@/src/product/ganaya/concorde/bloques/banners/desktop/decor";
import GanaYaIcon from "./GanaYaIcon";
import styles from "./GanaYaPurchase.module.css";

export interface ConfirmationDialogProps {
  open: boolean;
  price: string;
  commission: string;
  /** Fee de activación local de Ganá Ya en SubasCoins (fixture: 50). */
  fee: number;
  /** Saldo de SubasCoins en la billetera (fixture del selector de revisión). */
  balance: number;
  /** Al terminar la cuenta atrás (o con «Ir al SubasChat»): ir al chat con el vendedor. */
  onConfirm: () => void;
  onClose: () => void;
}

type Stage = "confirma" | "fondos" | "procesa" | "celebra" | "listo";
const SC = (n: number) => `>S< ${n.toLocaleString("en-US")}`;
const COUNTDOWN = 5;

/** Ganá Ya · confirmación (12/11, Aarón). Anatomía del modal de propuesta de Negociable (HybridDialog, mi-garaje-lab):
 *  ícono, título, monto en ticket, fee de activación y botón principal; luego procesando → celebración →
 *  «Ir al SubasChat (5)». El diálogo usa el acento teal–lila de Negociable. Si la billetera no cubre el fee,
 *  sale «Fondos insuficientes» (como en Negociable). Local composition, not a registry Dialog. */
export function ConfirmationDialog({ open, price, commission, fee, balance, onConfirm, onClose }: ConfirmationDialogProps) {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLButtonElement>(null);
  const confirmedRef = useRef(false);
  const finishedRef = useRef(false);
  const [stage, setStage] = useState<Stage>("confirma");
  const [left, setLeft] = useState(COUNTDOWN);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    confirmedRef.current = false;
    finishedRef.current = false;
    setStage("confirma");
    setLeft(COUNTDOWN);
    if (!dialog.open) dialog.showModal();
    confirmRef.current?.focus({ preventScroll: true });

    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  // procesa → celebra → listo, con tiempos parecidos a los del modal de Negociable.
  useEffect(() => {
    if (stage !== "procesa" && stage !== "celebra") return;
    const timer = window.setTimeout(() => setStage(stage === "procesa" ? "celebra" : "listo"), stage === "procesa" ? 900 : 1600);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // «Ir al SubasChat (5)»: cuenta atrás y, al llegar a 0, al chat.
  useEffect(() => {
    if (stage !== "listo") return;
    setLeft(COUNTDOWN);
    const timer = window.setInterval(() => setLeft((n) => n - 1), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);
  // Una sola salida al chat, aunque la cuenta llegue a 0 y además se pulse el botón.
  const finish = () => { if (finishedRef.current) return; finishedRef.current = true; onConfirm(); };
  useEffect(() => { if (stage === "listo" && left <= 0) finish(); });

  useEffect(() => { if (stage === "fondos" || stage === "listo") mainRef.current?.focus({ preventScroll: true }); }, [stage]);

  const busy = stage === "procesa" || stage === "celebra";
  const close = () => { if (busy) return; if (stage === "listo") finish(); else onClose(); };
  const confirm = () => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    if (balance < fee) { confirmedRef.current = false; setStage("fondos"); return; }
    setStage("procesa");
  };
  const icon = (glyph: "ganaya" | "fondos") => <span className={styles.icon} aria-hidden="true">
    {glyph === "ganaya" ? <GanaYaIcon size={30} paint="accent" /> : <PriceIcon size="md" />}
  </span>;
  const ticket = <div className={styles.confirmPrice}><span className={styles.ticketLabel}>Precio Gana Ya</span>{price}</div>;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${uid}-title`}
      aria-describedby={stage === "confirma" ? `${uid}-intro ${uid}-funds` : undefined}
      data-ganaya-stage={stage === "confirma" ? "confirmation" : stage}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      {!busy && <button type="button" className={styles.closeButton} onClick={close} aria-label="Cerrar confirmación"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="m5 5 6 6m0-6-6 6" /></svg></button>}

      {stage === "confirma" ? <div key="confirma" className={styles.confirmBody}>
        {icon("ganaya")}
        <h2 id={`${uid}-title`} className={styles.title}>Confirma tu activación</h2>
        <p id={`${uid}-intro`} className={styles.intro}>Aceptas la propuesta Gana Ya y coordinarás la compra por SubasChat.</p>
        <div className={styles.amount}>
          {ticket}
          <p className={styles.fee}><span className={styles.feeLabel}>Fee de activación <span className={styles.feeInfo}><button type="button" aria-label="¿Qué es el fee de activación?" aria-describedby={`${uid}-fee-tip`}><InfoIcon size={16} /></button><span id={`${uid}-fee-tip`} role="tooltip">Es el importe en SubasCoins necesario para activar Gana Ya y continuar con el proceso de compra.</span></span></span><b>{SC(fee)}</b></p>
          <p className={styles.confirmCommission}>Comisión: {commission}</p>
        </div>
        <div className={styles.confirmActions}>
          <button ref={confirmRef} type="button" className={styles.confirmButton} onClick={confirm}>
            <span className={styles.confirmButtonIcon} aria-hidden="true"><GanaYaIcon size={18} paint="current" /></span>
            Sí, confirmar
          </button>
        </div>
      </div>

      : stage === "fondos" ? <div key="fondos" className={styles.confirmBody} role="alert">
        {icon("fondos")}
        <h2 id={`${uid}-title`} className={styles.title}>Fondos insuficientes</h2>
        <p className={styles.fee}><span>Fee de activación</span><b>{SC(fee)} SubasCoins</b></p>
        <p className={styles.funds}>Tienes {SC(balance)} en tu billetera. Necesitas el fee de activación de {SC(fee)} SubasCoins para activar Gana Ya.</p>
        <p className={styles.note}>Recuerda: US$ 1 es igual a &gt;S&lt; 1 SubasCoin</p>
        <div className={styles.confirmActions}>
          <Button ref={mainRef} variant="secondary" type="button" className={styles.walletButton} onClick={onClose}>Adquiere SubasCoins</Button>
        </div>
      </div>

      : stage === "procesa" ? <div key="procesa" className={`${styles.confirmBody} ${styles.processingStage}`} role="status" aria-live="polite">
        <div className={styles.loader} aria-hidden="true"><i /><i /><i /></div>
        <h2 id={`${uid}-title`} className={styles.title}>Activando Gana Ya</h2>
        <p className={styles.intro}>Estamos confirmando tu activación y preparando tu SubasChat.</p>
      </div>

      : stage === "celebra" ? <div key="celebra" className={`${styles.confirmBody} ${styles.celebrate}`} role="status" aria-live="assertive">
        <div className={styles.burst} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i />
          <span className={styles.burstCheck}><svg width="38" height="38" viewBox="0 0 40 40" fill="none"><path d="M11 20.5l6 6L29.5 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        </div>
        <p className={styles.kicker}>¡Felicidades!</p>
        <h2 id={`${uid}-title`} className={styles.celebrateAmount}>{price}</h2>
        <p className={styles.intro}>Activaste Gana Ya</p>
      </div>

      : <div key="listo" className={styles.confirmBody} role="status">
        {icon("ganaya")}
        <h2 id={`${uid}-title`} className={styles.title}>¡Felicidades, activaste Gana Ya!</h2>
        {ticket}
        <p className={styles.intro}>Ahora irás al SubasChat para coordinar directamente con el vendedor.</p>
        <div className={styles.confirmActions}>
          <Button ref={mainRef} variant="negotiable" className={styles.subasChatButton} onClick={finish}>Ir al SubasChat ({Math.max(left, 0)})</Button>
        </div>
      </div>}
    </dialog>
  );
}

export interface ProcessingPanelProps { commission: string }

/** The processing state stays in the offer's right column, never in a modal. */
export function ProcessingPanel({ commission }: ProcessingPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => { panelRef.current?.focus(); }, []);

  return (
    <section ref={panelRef} className={`pdetail ${styles.panel} ${styles.processing}`} role="status" aria-live="polite" aria-atomic="true" aria-busy="true" tabIndex={-1} data-ganaya-stage="processing">
      <div className={styles.processingContent}>
        <span className={styles.processingIcon} aria-hidden="true"><PriceIcon size="md" /></span>
        <h2>Cobrando comisión</h2>
        <p className={styles.processingAmount}>{commission}</p>
        <span className={styles.spinner} aria-hidden="true" />
      </div>
    </section>
  );
}

export interface EnabledPanelProps {
  price: string;
  commission: string;
  deadline: string;
  fee: string;
  consigned: string;
  pending: string;
}

/** Only the three verified post-click stages are represented. Amounts are supplied by the offer. */
export function EnabledPanel({ price, commission, deadline, fee, consigned, pending }: EnabledPanelProps) {
  const uid = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [showDocumentNotice, setShowDocumentNotice] = useState(false);
  useEffect(() => { panelRef.current?.focus(); }, []);

  return (
    <section ref={panelRef} className={`pdetail ${styles.panel} ${styles.enabled}`} aria-label="Resultado Gana Ya del prototipo" tabIndex={-1} data-ganaya-stage="enabled">
      <div className={styles.priceBar}>
        <span className={styles.priceBarIcon} aria-hidden="true"><PriceIcon size="sm" /></span>
        <span><span className={styles.srOnly}>Precio Gana Ya: </span>{price}</span>
      </div>

      <ul className={styles.checks} aria-label="Estado del proceso">
        <li>
          <span className={styles.statusIcon} aria-hidden="true"><Sparkle size={20} color="currentColor" style={{ position: "static" }} /></span>
          <span>Ganador habilitado</span>
          <CheckIcon size="md" />
        </li>
        <li>
          <span className={styles.statusIcon} aria-hidden="true"><PriceIcon size="sm" /></span>
          <span>Comisión pagada<small>{commission}</small></span>
          <CheckIcon size="md" />
        </li>
      </ul>

      <div className={styles.successCard}>
        <div className={styles.successIntro}>
          <p>¡Felicidades!</p>
          <h2>¡Has sido habilitado!</h2>
          <span className={styles.successMark} aria-hidden="true"><CheckIcon size={56} /></span>
        </div>
        <div className={styles.deadline}>
          <p>Recuerda, puedes concretar el proceso de compra hasta</p>
          <strong>{deadline}</strong>
        </div>
        <p className={styles.documentReminder}>Ya puedes adjuntar los documentos pendientes</p>
      </div>

      <dl className={styles.breakdown} aria-label="Desglose de habilitación">
        <div><dt>Fee de activación:</dt><dd>{fee}</dd></div>
        <div><dt>Consignado:</dt><dd>{consigned}</dd></div>
        <div className={styles.pending}><dt>Pendiente:</dt><dd>{pending}</dd></div>
      </dl>

      <section className={styles.documents} aria-label="Documentación requerida">
        <CardTitle title="Documentación requerida" subtitle="" titleSize={13} className={styles.documentTitle} />
        <p className={styles.documentIntro}><InfoIcon size={20} /><span>Ahora adjunta los siguientes documentos.</span></p>
        <div className={styles.documentRow}>
          <span className={styles.documentName}>DNI</span>
          <Button variant="outline" type="button" className={styles.attachButton} onClick={() => setShowDocumentNotice(true)} aria-label="Adjunta DNI: información sobre la carga de documentos" aria-describedby={showDocumentNotice ? `${uid}-document-notice` : undefined}>
            <span className={styles.attachLabel}><span aria-hidden="true">+</span>Adjunta</span>
          </Button>
        </div>
        <p className={styles.documentHelp}>Debes adjuntar la documentación solicitada para seguir con el proceso de compra.</p>
        <div role="status" aria-live="polite" aria-atomic="true">
          {showDocumentNotice && <p id={`${uid}-document-notice`} className={styles.documentNotice}>La carga de documentos continúa en el flujo habitual. Este prototipo no recoge documentos personales.</p>}
        </div>
      </section>
    </section>
  );
}
