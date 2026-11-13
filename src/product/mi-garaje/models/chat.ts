// SubasChat · simulación 100 % frontend (sin backend). Imita el contrato de stage2-it-final
// (consumer/negotiable/subas-chat.mjs): cada envío lleva un messageId estable, así que reintentar
// actualiza la misma burbuja en vez de duplicarla. Realtime e imágenes son de diseño: el candidato
// de Julio solo refresca a mano y no tiene adjuntos confirmados.

export type ChatRole = "vendedor" | "comprador";
export type ChatMode = "normal" | "cargando" | "vacio" | "error" | "bloqueado" | "verificar" | "porcerrar" | "cerrado";
export type MsgStatus = "sending" | "sent" | "failed";
/** `sig`: firma de la imagen (nombre·tamaño·fecha) para no mandar la misma dos veces. */
export type Msg = { id: string; mine: boolean; text?: string; image?: string; sig?: string; at: string; status: MsgStatus };

export const MODES: { id: ChatMode; label: string; hint: string }[] = [
  { id: "normal", label: "Conversación", hint: "Mensajes previos; la contraparte responde al enviar" },
  { id: "cargando", label: "Cargando", hint: "Esqueleto mientras llega el historial" },
  { id: "error", label: "Error de envío", hint: "El próximo envío falla; Reintentar no duplica" },
  { id: "verificar", label: "Verificar compra (2 semanas)", hint: "Ambas partes confirman si la compra se concretó" },
  { id: "porcerrar", label: "Por cerrar", hint: "Última semana de los 3 meses: recién ahí se avisa la fecha de cierre" },
  { id: "cerrado", label: "Cerrado (3 meses)", hint: "Pasó el plazo: solo lectura, queda como registro de la compra" },
];
// Julio (21/10): el chat sigue activo 3 meses desde que se concreta; después queda como registro, sin poder escribir.
export const CHAT_MONTHS = 3;
export const chatUntil = (from = new Date()): string => { const d = new Date(from); d.setMonth(d.getMonth() + CHAT_MONTHS); return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }); };

// `cuu`: código de usuario VMC de la contraparte (de ejemplo; el header del lab usa ZAEX5G para el usuario actual).
// `deal`: etiqueta del monto en el header del chat, según quién eres en el acuerdo.
// Sin aviso «acuerdo» al abrir (Abraham, 21/10): arriba solo se avisa el cierre (última semana y cerrado).
export const COPY: Record<ChatRole, { other: string; cuu: string; deal: string }> = {
  vendedor: { other: "Comprador", cuu: "KLM8RT", deal: "Venta" },
  comprador: { other: "Vendedor", cuu: "SUBASCARS", deal: "Compra" },
};
export const EMPTY_TEXT = "Inicia la conversación para coordinar los siguientes pasos";
export const ERROR_TEXT = "No se pudo enviar.";
export const LOCKED_TEXT = "Solo el comprador ganador y el vendedor pueden ver este chat.";
export const OFFLINE_TEXT = "Sin conexión. Tus mensajes se enviarán al reconectar";
export const MAX_CHARS = 5000;
export const MAX_IMAGE_MB = 5;

// Pendientes del handoff de Julio (12-oct): se muestran en el panel de revisión, no en el chat.
export const PENDING_RULES = [
  "Decidido (Julio, 21/10): el chat dura 3 meses desde la venta concretada y luego queda en solo lectura, como registro de la compra.",
  "Decidido: sin tiempo de respuesta. Si una parte deja de responder, el chat sirve de sustento para que VMC anule la venta desde adentro y el vendedor pueda republicar. Falta definir cómo se reporta.",
  "Decidido: la compra concretada entra al historial del comprador (Mis compras) con la ficha, el valor pactado, las partes y el chat.",
  "Al aceptar, la ficha sale del listado público y queda en la zona del vendedor.",
  "Acceso desde Mi Garaje para ambas partes: por validar en código.",
  "La compraventa y transferencia final quedan fuera de esta entrega.",
];

export const EMOJIS = ["👍", "🙌", "😊", "🚗", "📍", "📅", "✅", "🤝"];

const SEED: Record<ChatRole, Omit<Msg, "status">[]> = {
  vendedor: [
    { id: "s1", mine: false, text: "Hola, gracias por aceptar 🙌 ¿Cuándo podría ver el auto?", at: "10:31" },
    { id: "s2", mine: true, text: "¡Hola! Puede ser mañana a las 10 am en Miraflores.", at: "10:33" },
    { id: "s3", mine: false, text: "Perfecto, ahí estaré. ¿Tiene el SOAT vigente?", at: "10:34" },
  ],
  comprador: [
    { id: "s1", mine: true, text: "Hola, gracias por aceptar 🙌 ¿Cuándo podría ver el auto?", at: "10:31" },
    { id: "s2", mine: false, text: "¡Hola! Puede ser mañana a las 10 am en Miraflores.", at: "10:33" },
  ],
};
export const seed = (role: ChatRole): Msg[] => SEED[role].map((m) => ({ ...m, status: "sent" }));

const REPLIES: Record<ChatRole, string[]> = {
  // La 2.ª respuesta trae un enlace externo de ejemplo para revisar el aviso «Vas a salir de SubasCars».
  vendedor: ["Genial, gracias 👍", "Te paso el informe de mi mecánico: https://example.com/informe-nivus", "¿Me confirmas la dirección exacta?", "Llevo el documento de identidad.", "Perfecto, nos vemos ✅"],
  comprador: ["Sí, el SOAT está vigente hasta marzo.", "Aquí está el SOAT escaneado: www.example.com/soat-nivus.", "Te comparto la ubicación mañana temprano 📍", "Claro, sin problema.", "¡Nos vemos! 🤝"],
};
export const replyFor = (role: ChatRole, n: number): string => REPLIES[role][n % REPLIES[role].length];

export const nowHHMM = (): string => new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
export const newId = (): string => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()));

/** Envío simulado: ~700 ms; falla si `fail`. Mismo id ⇒ mismo mensaje (idempotente en la UI). */
export const fakeSend = (fail: boolean): Promise<void> =>
  new Promise((ok, ko) => setTimeout(() => (fail ? ko(new Error("SEND_FAILED")) : ok()), 700));
