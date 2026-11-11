/**
 * Estado de revisión de cada correo maquetado — la fuente de verdad es ESTE
 * archivo, no la UI: quien revisa lee, no escribe.
 *
 * Por defecto un correo está «listo para revisar». Solo se listan aquí los que
 * están PENDIENTES, con la nota que explica qué falta; esa nota se muestra al
 * entrar al correo, en la columna derecha, junto a la referencia de Figma.
 *
 * Módulo plano (sin "use client" ni node:fs): lo importan el catálogo (cliente)
 * y el detalle (servidor).
 */

export type RevisionEstado = "listo" | "pendiente";

export interface RevisionPendiente {
  /** Qué falta para poder revisar este correo. Se muestra tal cual. */
  nota: string;
}

/**
 * Correos que NO se pueden revisar todavía, por id. Añadir una entrada aquí lo
 * marca como pendiente en el catálogo y pinta su nota en el detalle; quitarla lo
 * devuelve a «listo para revisar».
 *
 * HOY ESTÁ VACÍO: los 45 correos están listos. El mecanismo se conserva porque
 * es como se marca el siguiente que aparezca —basta con volver a añadir su id—;
 * mientras esté vacío, el filtro «Pendientes» del catálogo no se pinta.
 */
const URL_VALORIZA = 'Falta la URL real del flujo de valorización para el CTA (hoy apunta a la home).';
const URL_PUBLICAR = 'Falta la URL real del flujo de publicación para el CTA (hoy apunta a Mi Garaje).';
const URL_PREGUNTAS = 'Confirmar cómo funcionan las preguntas al vendedor (copy) y la URL del CTA (hoy apunta a la home).';

export const PENDIENTES: Record<string, RevisionPendiente> = {
  'valoriza-a1-leads-whatsapp': { nota: URL_VALORIZA },
  'valoriza-a2-leads-whatsapp': { nota: URL_VALORIZA },
  'valoriza-a3-leads-whatsapp': { nota: URL_VALORIZA },
  'valoriza-a4-leads-whatsapp': { nota: URL_VALORIZA },
  'valoriza-b1-compradores': { nota: URL_VALORIZA },
  'valoriza-b2-compradores': { nota: URL_VALORIZA },
  'valoriza-b3-compradores': { nota: URL_PREGUNTAS },
  'valoriza-b4-compradores': { nota: URL_PUBLICAR },
  'valoriza-c1-vendedores': { nota: URL_VALORIZA },
  'valoriza-c2-vendedores': { nota: URL_PUBLICAR },
  'valoriza-c3-vendedores': { nota: URL_PUBLICAR },
  'valoriza-c4-vendedores': { nota: URL_PREGUNTAS },
};

export function estadoDe(id: string): RevisionEstado {
  return Object.prototype.hasOwnProperty.call(PENDIENTES, id) ? "pendiente" : "listo";
}

/** Nota del correo si está pendiente; null si está listo para revisar. */
export function notaDe(id: string): string | null {
  return PENDIENTES[id]?.nota ?? null;
}

/** Cuántos correos están pendientes (para el contador del catálogo). */
export const PENDIENTES_TOTAL: number = Object.keys(PENDIENTES).length;
