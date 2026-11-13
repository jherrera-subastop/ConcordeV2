// Valorizaciones guardadas de ejemplo: las usan Mis valorizaciones (cliente) y Publicar (servidor, ?desde=<id>).
// Los mismos tres autos de la sección «Mis valorizaciones» de Mi Garaje VMC (Garaje.tsx · sv1–sv3): «Ver todas» continúa esa lista.
// state: dónde quedó la valorización. «pub» y «review» ya pasaron por Publicar (por eso tienen fotos); «saved» todavía no.
// drift: % que cambió el valor desde que se guardó (AVT recalcula cada mes; PROPUESTA D12, confirmar que guarda el historial).
export type Val = {
  id: string; photo: string; brand: string; model: string; year: number; version: string; km: number; saved: string; updated?: string; drift?: number;
  state: "pub" | "review" | "saved"; pub?: string; // pub: id de su fila en Mis publicaciones (Mi Garaje VMC · su1–su2)
  how?: string; // cómo va la publicación, como su fila en Mis publicaciones (ofertas o revisión)
  factors: [string, string][]; // detalles respondidos en Valorizar: rótulo y opción
};
export const VALS: Val[] = [
  { id: "sv1", photo: "nivus", brand: "Volkswagen", model: "Nivus", year: 2022, version: "Highline 200 TSI", km: 38500, saved: "30/09/2026", state: "pub", pub: "su1", how: "1 oferta recibida",
    factors: [["Transmisión", "Automática"], ["Combustible", "Gasolina"], ["Tracción", "4×2"], ["Exterior", "Excelente"], ["Interior", "Excelente"], ["Neumáticos", "Buenos"],
      ["Dueños anteriores", "Único dueño"], ["Accidentes", "Sin accidentes"], ["Mantenimiento", "Casa oficial"], ["Color", "Blanco"]] },
  { id: "sv2", photo: "hilux", brand: "Toyota", model: "Hilux", year: 2020, version: "4×4 SRV", km: 62000, saved: "08/10/2026", state: "review", pub: "su2", how: "Pago recibido",
    factors: [["Transmisión", "Manual"], ["Combustible", "Diésel"], ["Tracción", "4×4"], ["Exterior", "Bueno"], ["Interior", "Bueno"], ["Neumáticos", "Nuevos"],
      ["Dueños anteriores", "2 dueños"], ["Accidentes", "Sin accidentes"], ["Mantenimiento", "Casa oficial"], ["Color", "Blanco"]] },
  { id: "sv3", photo: "picanto", brand: "Kia", model: "Picanto", year: 2017, version: "EX 1.2 MT", km: 88000, saved: "12/05/2026", updated: "01/10", drift: -2, state: "saved",
    factors: [["Transmisión", "Manual"], ["Combustible", "Gasolina"], ["Tracción", "4×2"], ["Exterior", "Bueno"], ["Interior", "Bueno"], ["Neumáticos", "Buenos"],
      ["Dueños anteriores", "2 dueños"], ["Accidentes", "Sin accidentes"], ["Mantenimiento", "Taller regular"], ["Color", "Plata / Gris"]] },
];
