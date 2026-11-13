"use client";

/**
 * SubasChat · chat del acuerdo (handoff de Julio, 12-oct). Solo frontend: los datos y la contraparte se
 * simulan en ./chat.ts. En el detalle de un acuerdo aceptado REEMPLAZA al DetailCard (Detalle `detailSlot`):
 * una ventana de chat directa con la contraparte (su código de usuario) y el monto acordado arriba.
 * Burbuja propia con el degradado del chat de los KAM (chatbot-ai-vmc MessageBubble: vault-500 → vault-700).
 */
import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { JSX, MouseEvent, ReactNode } from "react";
import Button from "@/src/product/mi-garaje/concorde/components/Button";
import {
  COPY, CHAT_MONTHS, EMOJIS, chatUntil, EMPTY_TEXT, ERROR_TEXT, LOCKED_TEXT, MAX_CHARS, MAX_IMAGE_MB, OFFLINE_TEXT, fakeSend, newId, nowHHMM, replyFor, seed,
  type ChatMode, type ChatRole, type Msg,
} from "./chat";
import "./subaschat.css";

// Ráfaga: mensajes seguidos del mismo emisor con < 5 min entre sí (un fallido corta la ráfaga: lleva su aviso debajo).
const mins = (at: string) => { const [h, m] = at.split(":").map(Number); return h * 60 + m; };
const sameBurst = (a?: Msg, b?: Msg) => !!a && !!b && a.mine === b.mine && a.status !== "failed" && Math.abs(mins(b.at) - mins(a.at)) < 5;

// Red del navegador (online/offline); en el servidor se asume conectado.
const subscribeNet = (cb: () => void) => {
  window.addEventListener("online", cb); window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
};
const scrollBehavior = (): ScrollBehavior => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
const NEAR_BOTTOM = 80; // px: más arriba que esto, el usuario está leyendo historial y no se le arrastra al final
const fmt = (n: number) => n.toLocaleString("es-PE");

// Enlaces: http(s)://… o www.…; la puntuación final («…/informe.») queda fuera del enlace.
const URL_RE = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const isInternal = (href: string) => {
  try { const h = new URL(href).hostname; return h === window.location.hostname || h === "subascars.com" || h.endsWith(".subascars.com"); }
  catch { return false; }
};
const hostOf = (href: string) => { try { return new URL(href).hostname; } catch { return href; } };
const withLinks = (text: string, onLink: (e: MouseEvent<HTMLAnchorElement>, href: string) => void): ReactNode[] =>
  text.split(URL_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    const tail = /[.,;:!?)\]]+$/.exec(part)?.[0] ?? "";
    const url = part.slice(0, part.length - tail.length);
    const href = /^https?:/i.test(url) ? url : `https://${url}`;
    return <Fragment key={i}><a href={href} target="_blank" rel="noopener noreferrer nofollow" onClick={(e) => onLink(e, href)}>{url}</a>{tail}</Fragment>;
  });

export default function SubasChat({ role, mode, amount, poke, offline = false, fluid = false, noteHidden, onHideNote, intro, system, before, hideHead = false, initialIncoming, purchaseConfirmed = false, onPurchaseConfirmed }: {
  role: ChatRole; mode: ChatMode; amount: string;
  /** Reemplaza el aviso del acuerdo (p. ej. el comprador que aceptó la contrapropuesta). */
  /** Chat recién abierto: info breve de cómo sigue, en lugar del vacío genérico (desaparece con el primer mensaje). */
  intro?: ReactNode;
  /** Aviso del sistema arriba de la conversación, como el de WhatsApp al activar los mensajes temporales (23/10). */
  system?: ReactNode;
  /** Lo que pasó antes del chat (23/10: la negociación), arriba de todo: subiendo se ve como continuación. */
  before?: ReactNode;
  /** Sin el encabezado fijo (23/10: el panel del vendedor lo pone dentro de la lista, debajo de la negociación). */
  hideHead?: boolean;
  /** Mensaje que disparó la notificación de llegada al SubasChat. */
  initialIncoming?: string;
  /** La compra ya fue confirmada y este chat debe reabrirse solo como historial. */
  purchaseConfirmed?: boolean;
  /** Ambas partes confirmaron que la compra se concretó: el comprador la registra en Mis compras. */
  onPurchaseConfirmed?: () => void;
  /** El aviso «Coordina los siguientes pasos…» se puede cerrar; se recuerda mientras dure la página. */
  noteHidden: boolean; onHideNote: () => void;
  /** Cambia → la contraparte escribe y responde (botón «Simular mensaje entrante» del panel de revisión). */
  poke: number;
  /** Simula la red caída (panel de revisión); también reacciona al offline real del navegador. */
  offline?: boolean;
  /** Móvil / pantalla completa: ancho 100 %, alto del viewport visible (se encoge con el teclado), safe-area. */
  fluid?: boolean;
}): JSX.Element {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [emojis, setEmojis] = useState(false);
  const [unread, setUnread] = useState(0); // entrantes que llegaron mientras el usuario leía más arriba
  const [notice, setNotice] = useState(""); // aviso del compositor (imagen no válida o repetida)
  const [leaving, setLeaving] = useState<string | null>(null); // enlace externo pendiente de confirmar
  const [verification, setVerification] = useState<"pending" | "yes" | "no" | "confirmed" | "reported">(() => purchaseConfirmed ? "confirmed" : "pending");
  const replies = useRef(0);
  const failedOnce = useRef(new Set<string>()); // en «Error de envío» cada mensaje falla una vez; el reintento pasa
  const queued = useRef(new Set<string>()); // enviados sin red: se entregan solos al reconectar
  const seenIds = useRef(new Set<string>());
  const atBottom = useRef(true);
  const msgsRef = useRef<Msg[]>([]);
  const prevRole = useRef(role);
  const urls = useRef(new Set<string>()); // object URLs de imágenes, para liberarlas
  const linkFrom = useRef<HTMLAnchorElement | null>(null);
  const timers = useRef<number[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const leaveId = useId();
  const { other, cuu, deal } = COPY[role];

  const netOnline = useSyncExternalStore(subscribeNet, () => navigator.onLine, () => true);
  const online = netOnline && !offline;
  const onlineRef = useRef(online);

  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => { msgsRef.current = msgs; }, [msgs]);

  // Al abrir o cambiar de estado/rol: historial desde cero (con 0.8 s de carga en «Conversación»).
  // Los propios sin entregar (fallidos o en cola sin red) sobreviven al cambio de estado; cambiar de rol es otro chat.
  useEffect(() => {
    clearTimers(); setTyping(false); setText(""); setEmojis(false); setNotice(""); setUnread(0); setVerification(purchaseConfirmed ? "confirmed" : "pending"); replies.current = 0;
    const sameChat = prevRole.current === role;
    prevRole.current = role;
    const keep = sameChat ? msgsRef.current.filter((m) => m.mine && (m.status === "failed" || queued.current.has(m.id))) : [];
    if (!sameChat) queued.current.clear();
    seenIds.current.clear(); atBottom.current = true;
    setMsgs(keep);
    if (mode === "cargando") { setLoading(true); return; }
    // error (23/10): con historial; solo falla el próximo envío.
    if (mode === "normal" || mode === "error" || mode === "verificar" || mode === "cerrado" || mode === "porcerrar") { setLoading(true); later(800, () => {
      const arrived = initialIncoming ? [{ id: `arrival-${role}-${initialIncoming}`, mine: false, text: initialIncoming, at: nowHHMM(), status: "sent" as const }] : [];
      // El cierre no reemplaza la conversación: queda registrado como dos
      // respuestas reales al final del historial para ambos lados.
      const confirmation = purchaseConfirmed ? role === "comprador"
        ? [{ id: "purchase-confirmed-me", mine: true, text: "Sí, la compra se concretó.", at: "10:40", status: "sent" as const }, { id: "purchase-confirmed-other", mine: false, text: "Sí, confirmo que la compra se concretó.", at: "10:41", status: "sent" as const }]
        : [{ id: "purchase-confirmed-other", mine: false, text: "Sí, la compra se concretó.", at: "10:40", status: "sent" as const }, { id: "purchase-confirmed-me", mine: true, text: "Sí, confirmo que la compra se concretó.", at: "10:41", status: "sent" as const }]
        : [];
      setMsgs((m) => [...seed(role), ...arrived, ...confirmation, ...m]); setLoading(false);
    }); }
    else setLoading(false);
    return clearTimers;
  }, [initialIncoming, mode, purchaseConfirmed, role]);

  // Foco al abrir solo con puntero fino: en táctil abriría el teclado virtual y taparía el chat.
  useEffect(() => { if (mode !== "bloqueado" && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus(); }, [mode]);

  // Fluido: el alto sigue al viewport visible (iOS no encoge dvh con el teclado; visualViewport sí), así el
  // compositor queda siempre a la vista. Sin visualViewport manda el CSS (100dvh).
  useEffect(() => {
    const vv = window.visualViewport; const el = rootRef.current;
    if (!fluid || !vv || !el) return;
    const fit = () => { el.style.setProperty("--sc-vh", `${vv.height}px`); };
    fit(); vv.addEventListener("resize", fit);
    return () => { vv.removeEventListener("resize", fit); el.style.removeProperty("--sc-vh"); };
  }, [fluid]);

  // Autoscroll solo si el usuario ya está abajo o el mensaje nuevo es suyo; si no, se cuentan para el chip «↓ N nuevos».
  useEffect(() => {
    const el = listRef.current; if (!el) return;
    const added = msgs.filter((m) => !seenIds.current.has(m.id));
    added.forEach((m) => seenIds.current.add(m.id));
    if (atBottom.current || added.some((m) => m.mine)) {
      el.scrollTo({ top: el.scrollHeight, behavior: scrollBehavior() }); atBottom.current = true; setUnread(0);
    } else setUnread((n) => n + added.filter((m) => !m.mine).length);
  }, [msgs, typing]);
  const onScroll = () => {
    const el = listRef.current; if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
    if (atBottom.current) setUnread(0);
  };
  const toBottom = () => {
    const el = listRef.current; if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: scrollBehavior() }); atBottom.current = true; setUnread(0);
  };

  // El textarea crece con el texto hasta el max-height del CSS (120px); +2 = bordes (box-sizing: border-box).
  useEffect(() => { const el = inputRef.current; if (!el) return; el.style.height = "auto"; el.style.height = `${el.scrollHeight + 2}px`; }, [text]);

  useEffect(() => { const set = urls.current; return () => set.forEach((u) => URL.revokeObjectURL(u)); }, []);

  const incoming = () => {
    later(600, () => setTyping(true));
    later(2000, () => {
      setTyping(false);
      setMsgs((m) => [...m, { id: newId(), mine: false, text: replyFor(role, replies.current++), at: nowHHMM(), status: "sent" }]);
    });
  };
  useEffect(() => { if (poke && online && mode !== "bloqueado" && mode !== "cargando" && mode !== "cerrado") incoming(); }, [poke]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (id: string, status: Msg["status"]) => setMsgs((m) => m.map((x) => (x.id === id ? { ...x, status } : x)));
  const deliver = async (id: string) => {
    patch(id, "sending");
    if (!onlineRef.current) { queued.current.add(id); return; } // queda en «Enviando» hasta que vuelva la red
    const fail = mode === "error" && !failedOnce.current.has(id);
    try { await fakeSend(fail); patch(id, "sent"); incoming(); }
    catch { failedOnce.current.add(id); patch(id, "failed"); }
  };
  // Al reconectar se entrega lo que quedó en cola, en el orden en que se escribió.
  useEffect(() => {
    onlineRef.current = online;
    if (!online || !queued.current.size) return;
    const ids = [...queued.current]; queued.current.clear();
    ids.forEach((id) => void deliver(id));
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = (body: { text?: string; image?: string; sig?: string }) => {
    const id = newId();
    setMsgs((m) => [...m, { id, mine: true, ...body, at: nowHHMM(), status: "sending" }]);
    void deliver(id);
  };
  const remove = (id: string) => {
    const img = msgs.find((m) => m.id === id)?.image;
    if (img) { URL.revokeObjectURL(img); urls.current.delete(img); }
    queued.current.delete(id);
    setMsgs((m) => m.filter((x) => x.id !== id));
    inputRef.current?.focus();
  };
  const over = text.length - MAX_CHARS;
  const submit = () => { const t = text.trim(); if (!t || over > 0) return; send({ text: t }); setText(""); setEmojis(false); inputRef.current?.focus(); };

  const verifyPurchase = (answer: "yes" | "no") => {
    if (verification !== "pending") return;
    const confirmed = answer === "yes";
    setVerification(answer);
    setMsgs((m) => [...m, { id: newId(), mine: true, text: confirmed ? "Sí, la compra se concretó." : "No, la compra no se concretó.", at: nowHHMM(), status: "sent" }]);
    later(700, () => {
      setMsgs((m) => [...m, { id: newId(), mine: false, text: confirmed ? "Sí, confirmo que la compra se concretó." : "No, confirmo que la compra no se concretó.", at: nowHHMM(), status: "sent" }]);
      setVerification(confirmed ? "confirmed" : "reported");
    });
    // Deja visibles ambas respuestas antes de cerrar el chat y mostrar el viaje a Mis compras.
    if (confirmed) later(2100, () => onPurchaseConfirmed?.());
  };

  const pickImage = (f: File) => {
    if (!f.type.startsWith("image/")) { setNotice("Solo puedes enviar imágenes (JPG, PNG, WebP…)."); return; }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) { setNotice(`La imagen pesa más de ${MAX_IMAGE_MB} MB. Elige una más liviana.`); return; }
    const sig = `${f.name}·${f.size}·${f.lastModified}`;
    if (msgs.some((m) => m.sig === sig && m.status !== "failed")) { setNotice("Ya enviaste esta imagen."); return; }
    setNotice("");
    const url = URL.createObjectURL(f); urls.current.add(url);
    send({ image: url, sig });
  };

  // Enlaces de fuera de SubasCars piden confirmación antes de abrirse.
  const onLink = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isInternal(href)) return;
    e.preventDefault(); linkFrom.current = e.currentTarget; setLeaving(href);
  };
  const closeLeave = () => { setLeaving(null); linkFrom.current?.focus(); };

  const locked = mode === "bloqueado";
  const purchaseCompleted = purchaseConfirmed || (mode === "verificar" && verification === "confirmed");
  const empty = !loading && !locked && msgs.length === 0;
  const showCount = text.length >= MAX_CHARS * 0.9;

  return <section ref={rootRef} className={`sc${fluid ? " sc--fluid" : ""}`} aria-label={`SubasChat con ${cuu}`}>
{hideHead ? null :       <header className="sc__head">
        <span className="sc__avatar" aria-hidden>{cuu.slice(0, 2)}</span>
        <div className="sc__who"><b>{cuu}</b><span>{other}</span></div>
        <div className="sc__deal"><small>{deal}</small><b>{amount}</b></div>
      </header>}

      {locked ? <div className="sc__locked">
        <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        <b>Acceso restringido</b><p>{LOCKED_TEXT}</p>
      </div> : <>
        {online ? null : <div className="sc__offline" role="status">{OFFLINE_TEXT}</div>}
        {/* El aviso cambia con el estado (antes decía lo mismo abierto, por cerrar y cerrado). La fecha de cierre solo se
            avisa la última semana: desde el día 1 confundía («cerraste» y «abierto hasta»). */}
        {(noteHidden && mode !== "cerrado") || (mode !== "cerrado" && mode !== "porcerrar") ? null : <div className={`sc__note${mode === "cerrado" ? " is-closed" : ""}`}><p suppressHydrationWarning>{mode === "cerrado" ? <>Este chat se cerró<small>Queda como registro de tu {deal.toLowerCase()}. Ya no se pueden enviar mensajes.</small></>
          : mode === "porcerrar" ? <>Este chat se cierra el {chatUntil()}<small>Después queda como registro de tu {deal.toLowerCase()}.</small></>
          : null}</p>
          {mode === "cerrado" ? null : <button type="button" onClick={onHideNote} aria-label="Quitar aviso">
            <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>}</div>}
        <div className="sc__body">
          <div className="sc__list" ref={listRef} onScroll={onScroll} role="log" aria-label={`Mensajes con ${cuu}`} aria-busy={loading}>
            {loading ? <div className="sc__skel" aria-hidden>
              <span className="is-l" /><span className="is-r" /><span className="is-l is-short" />
            </div> : null}
            {before}
            {!loading && system && !msgs.length ? <div className="sc__sys" role="note">{system}</div> : null}
            {empty && intro ? intro : empty ? <div className="sc__empty">
              <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" strokeLinecap="round" /></svg>
              <p>{EMPTY_TEXT}</p>
            </div> : null}
            {/* Como WhatsApp: primero el día y debajo el aviso del sistema. */}
            {!loading && msgs.length ? <div className="sc__day"><span>Hoy</span></div> : null}
            {!loading && system && msgs.length ? <div className="sc__sys" role="note">{system}</div> : null}
            {loading ? null : msgs.map((m, i) => {
              const cont = sameBurst(msgs[i - 1], m); // no es el primero de su ráfaga
              const more = sameBurst(m, msgs[i + 1]); // no es el último → sin hora (salvo que siga enviándose)
              return <div key={m.id} className={`sc__row${m.mine ? " is-mine" : ""}${cont ? " is-cont" : ""}${more ? " is-more" : ""}`}>
                <div className={`sc__bubble is-${m.status}${m.image ? " has-img" : ""}`}>
                  <span className="sc__sr">{m.mine ? "Tú" : cuu}: </span>
                  {m.image ? <img src={m.image} alt="Imagen enviada" /> : null}
                  {m.text ? <p>{withLinks(m.text, onLink)}</p> : null}
                  {more && m.status === "sent" ? null : <span className="sc__meta">{m.at}{m.mine ? <>
                    <i className="sc__tick" aria-hidden>{m.status === "sent" ? "✓✓" : m.status === "sending" ? "◷" : "!"}</i>
                    <span className="sc__sr">{m.status === "sent" ? "Enviado" : m.status === "sending" ? "Enviando" : "No enviado"}</span></> : null}</span>}
                </div>
                {m.status === "failed" ? <div className="sc__fail" role="alert">{ERROR_TEXT}
                  <button type="button" onClick={() => void deliver(m.id)}>Reintentar</button>
                  <button type="button" onClick={() => remove(m.id)}>Eliminar</button>
                </div> : null}
              </div>;
            })}
            {!loading && mode === "verificar" ? <div className="sc__verify" role="status">
              <span className="sc__verify-kicker">Confirmación · 2 semanas</span>
              <div className="sc__verify-head"><span className="sc__verify-mark" aria-hidden><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="m5 10 3.1 3.1L15.5 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span><b>¿Se concretó la compra?</b></div>
              <p>Confirma el resultado para actualizar el estado de tu compra.</p>
              {verification === "pending" ? <div className="sc__verify-actions"><Button variant="negotiable" className="sc__verify-yes" onClick={() => verifyPurchase("yes")}>Sí, se concretó</Button><Button variant="outline" className="sc__verify-no" onClick={() => verifyPurchase("no")}>No se concretó</Button></div>
                : verification === "confirmed" ? <small>Ambas partes confirmaron la compra. Ya se registró en Mis compras.</small>
                : verification === "reported" ? <small>Ambas partes indicaron que no se concretó. Queda registrado en este chat.</small>
                : <small>Registrando tu respuesta con la contraparte…</small>}
            </div> : null}
            {typing ? <div className="sc__row" role="status"><div className="sc__typing" aria-hidden><i /><i /><i /></div><span className="sc__typing-l">{other} está escribiendo…</span></div> : null}
          </div>
          {unread ? <button type="button" className="sc__jump" onClick={toBottom}>
            ↓ {unread} {unread === 1 ? "mensaje nuevo" : "mensajes nuevos"}
          </button> : null}
        </div>

        {emojis ? <div className="sc__emojis" role="group" aria-label="Emojis">
          {EMOJIS.map((e) => <button key={e} type="button" onClick={() => { setText((t) => t + e); inputRef.current?.focus(); }}>{e}</button>)}
        </div> : null}
        {notice || showCount ? <div className="sc__hint">
          {notice ? <span className="sc__notice" role="alert">{notice}</span> : null}
          {showCount ? <span className={`sc__count${over > 0 ? " is-over" : ""}`} aria-live={over > 0 ? "polite" : "off"}>
            {over > 0 ? `Sobran ${fmt(over)} caracteres` : `${fmt(text.length)} / ${fmt(MAX_CHARS)}`}
          </span> : null}
        </div> : null}
        {mode === "cerrado" || purchaseCompleted ? <p className="sc__closed">{purchaseCompleted ? "Compra confirmada · este chat queda como registro y ya no admite mensajes." : `Solo lectura · el chat dura ${CHAT_MONTHS} meses desde el acuerdo`}</p> : <>
        <form className="sc__compose" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <button type="button" className="sc__tool" aria-label="Emojis" aria-pressed={emojis} onClick={() => setEmojis((v) => !v)} disabled={loading}>😊</button>
          <button type="button" className="sc__tool" aria-label="Enviar imagen" onClick={() => fileRef.current?.click()} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImage(f); e.target.value = ""; }} />
          {/* Sin maxLength: al pegar no se corta en silencio; el contador avisa y Enviar se bloquea si sobra texto. */}
          <textarea ref={inputRef} rows={1} value={text} placeholder="Escribe un mensaje…" disabled={loading}
            aria-label={`Mensaje para ${cuu}`} aria-invalid={over > 0} enterKeyHint="send"
            onChange={(e) => { setText(e.target.value); if (notice) setNotice(""); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
          <button type="submit" className="sc__send" aria-label="Enviar" disabled={loading || !text.trim() || over > 0}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="M4 12l16-8-6 16-2-7z" fill="currentColor" /></svg>
          </button>
        </form></>}
      </>}

      {leaving ? <div className="sc__leave" role="alertdialog" aria-modal="true" aria-labelledby={`${leaveId}-t`} aria-describedby={`${leaveId}-d`}
        onKeyDown={(e) => { if (e.key === "Escape") closeLeave(); }}>
        <div className="sc__leave-card">
          <b id={`${leaveId}-t`}>Vas a salir de SubasCars</b>
          <p id={`${leaveId}-d`}>El enlace abre <span className="sc__host">{hostOf(leaving)}</span>. Nunca pagues ni compartas datos personales o bancarios fuera de SubasCars.</p>
          <div className="sc__leave-act">
            <button type="button" onClick={closeLeave} autoFocus>Cancelar</button>
            <a href={leaving} target="_blank" rel="noopener noreferrer nofollow" onClick={() => setLeaving(null)}>Abrir enlace</a>
          </div>
        </div>
      </div> : null}
  </section>;
}
