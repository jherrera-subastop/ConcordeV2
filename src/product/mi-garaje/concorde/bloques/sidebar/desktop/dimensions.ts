/**
 * Dimensiones del bloque Sidebar — en un módulo PLANO (sin "use client") para
 * que los Server Components (catálogo /blocks, páginas de bloque) puedan importar
 * estas constantes. Importar valores desde un módulo "use client" hacia un Server
 * Component devuelve undefined → NaN en los cálculos de escala.
 */

export const SIDEBAR_WIDTH = 226;
export const SIDEBAR_HEIGHT = 1171;
export const SIDEBAR_COLLAPSED_WIDTH = 76; // solo iconos
