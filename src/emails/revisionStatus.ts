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
const AMBAS = 'Faltan las URLs reales de valorización (hoy a la home) y de publicación (hoy a Mi Garaje).';

export const PENDIENTES: Record<string, RevisionPendiente> = {
  'valoriza-1-antes-de-comprar': { nota: URL_VALORIZA },
  'valoriza-2-antes-de-vender': { nota: URL_VALORIZA },
  'valoriza-3-por-que-valorizar': { nota: URL_VALORIZA },
  'valoriza-4-valorizar-y-publicar': { nota: AMBAS },
  'valoriza-5-nuevo-canal-de-venta': { nota: URL_PUBLICAR },
  'valoriza-6-vender-en-vmc': { nota: AMBAS },
  'valoriza-7-vende-y-valoriza': { nota: AMBAS },
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
