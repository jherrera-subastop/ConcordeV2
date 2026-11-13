// Banners VMC (22/10): catálogo único de piezas. Lo usan /banners-publica (galería) y Mi Garaje (panel «Banners», un banner distinto
// en la barra lateral y en el riel derecho). Plantillas en public/banners/: max-vmc.html, publica-vmc.html, venta-empresa.html.
export type Camp = "max" | "auto" | "moto" | "valor" | "empresa" | "whatsapp";
export type Pieza = { id: string; camp: Camp; titulo: string; foto: string; src: string; ant?: boolean; h?: string; ix?: "hero" | "camp" }; // h: titular del banner (si titulo no lo es); ix: va en los formatos del index
// Estilo nuevo (22/10), dirección de los banners de Max. Todas las tomas son personas reales (fotos), nada animado: morado intenso, estelas de luz, CTA naranja con aro. El personaje es solo
// Max; Publica y Valoriza llevan persona + vehículo. Abraham genera las tomas: PNG transparente en public/banners/personaje/<id>.png,
// la plantilla las toma solas (mientras falten: Max ilustrado actual o silueta de persona + vehículo).
export const CAMPANAS: { id: Camp; label: string; destino: string }[] = [
  { id: "max", label: "Max, asistente AI", destino: "el chat de Max (por definir)" },
  { id: "auto", label: "Publica tu auto", destino: "Publicar" },
  { id: "moto", label: "Publica tu moto", destino: "Publicar" },
  { id: "valor", label: "Valoriza tu auto", destino: "Valorizar (AVT)" },
  { id: "empresa", label: "Venta para empresas", destino: "subastop.com/cita" },
  { id: "whatsapp", label: "Canal de WhatsApp", destino: "el canal de WhatsApp de VMC (por definir)" },
];
export const PIEZAS: Pieza[] = [
  // Max (22/10): réplica del sistema de banners de Max (capturas de Abraham), en oscuro y claro, con un copy por formato.
  { id: "oscuro", camp: "max", titulo: "Max · Oscuro (para contexto inmersivo y editorial)", foto: "Max robot", src: "max-vmc" },
  { id: "claro", camp: "max", titulo: "Max · Claro (para módulos y contextos de interfaz claros)", foto: "Max robot", src: "max-vmc" },
  { id: "01-auto", camp: "auto", titulo: "Tu auto, tu precio, tu trato.", foto: "Una toma por formato (Yaris, Accent, Sail, Sportage)", src: "publica-vmc" },
  { id: "02-pago", camp: "auto", titulo: "Un solo pago, hasta que lo vendas.", foto: "Toyota Corolla", src: "publica-vmc" },
  { id: "04-pasos", camp: "auto", titulo: "¡Un solo pago hasta que lo vendas!", foto: "Toyota Hilux", src: "publica-vmc" },
  { id: "05-propuestas", camp: "auto", titulo: "Tú pones el precio, ellos te proponen.", foto: "Suzuki Swift", src: "publica-vmc" },
  { id: "06-cero", camp: "auto", titulo: "Vende tu auto sin comisión.", foto: "Kia Rio", src: "publica-vmc" },
  { id: "03-moto", camp: "moto", titulo: "¡Recibe ofertas por tu moto hoy!", foto: "Honda CB190R", src: "publica-vmc" },
  { id: "07-moto-calle", camp: "moto", titulo: "Tu moto también se vende en VMC.", foto: "Bajaj Pulsar", src: "publica-vmc" },
  { id: "08-valor", camp: "valor", titulo: "¡Descubre cuánto vale tu vehículo!", foto: "Toyota Corolla", src: "publica-vmc" },
  { id: "09-valor-pasos", camp: "valor", titulo: "Valoriza tu auto antes de venderlo.", foto: "Toyota Hilux", src: "publica-vmc" },
  { id: "10-valor-publica", camp: "valor", titulo: "Conoce su valor y publícalo en VMC.", foto: "Suzuki Swift", src: "publica-vmc" },
  { id: "01-general", camp: "empresa", titulo: "Activos y liquidez", foto: "Arte de POPs", src: "venta-empresa", h: "¿Tu empresa necesita liquidez?" },
  { id: "02-maquinaria", camp: "empresa", titulo: "Maquinaria y capacidad instalada", foto: "Arte de POPs", src: "venta-empresa", h: "¿Maquinaria parada? Ponla en venta." },
  { id: "03-tecnologia", camp: "empresa", titulo: "Venta de tecnología", foto: "Arte de POPs", src: "venta-empresa", h: "¿Renovaste tecnología? Vende la anterior." },
  { id: "04-flotas", camp: "empresa", titulo: "Vehículos y flotas", foto: "Arte de POPs", src: "venta-empresa", h: "¿Vehículos parados? Ponlos a la venta." },
  { id: "05-inventario", camp: "empresa", titulo: "Materiales y repuestos", foto: "Arte de POPs", src: "venta-empresa", h: "¿Repuestos que no se mueven? Véndelos." },
  // Tomas del index (vmc-index-lab, 26/10), en sus tamaños del index (27/10): hero 600 × 300 y banner secundario 916 × 204, con su versión móvil.
  // El banner secundario va en index-campana.html, con las 7 vistas del index (vista=fondo|panel|recorte|forma|hero|glass|claro).
  { id: "14-whatsapp", ix: "hero", camp: "whatsapp", titulo: "Entérate primero de las subastas.", foto: "Index · Renault Logan", src: "publica-vmc" },
  { id: "14-whatsapp-a", ix: "hero", camp: "whatsapp", titulo: "Variación A · cian, logo de WhatsApp", foto: "Index · Renault Logan", src: "publica-vmc" },
  { id: "14-whatsapp-c", ix: "hero", camp: "whatsapp", titulo: "Variación C · lavanda, logo de WhatsApp", foto: "Index · Kia Rio", src: "publica-vmc" },
  { id: "14-whatsapp-e", ix: "hero", camp: "whatsapp", titulo: "Variación E · naranja, cenital sobre el capó", foto: "Index · Toyota Yaris", src: "publica-vmc" },
  { id: "15-publica-ofertas", ix: "hero", camp: "auto", titulo: "Publica tu auto y recibe ofertas.", foto: "Index · Honda CR-V", src: "publica-vmc" },
  { id: "15-publica-a", ix: "hero", camp: "auto", titulo: "Variación A · naranja, llave de vidrio", foto: "Index · Honda CR-V", src: "publica-vmc" },
  { id: "15-publica-c", ix: "hero", camp: "auto", titulo: "Variación C · lavanda, llave en alto", foto: "Index · Toyota RAV4", src: "publica-vmc" },
  { id: "15-publica-d", ix: "hero", camp: "auto", titulo: "Variación D · cian, sentado en la maletera", foto: "Index · Hyundai i10", src: "publica-vmc" },
  { id: "16-negociable", ix: "hero", camp: "auto", titulo: "Tú pones el precio y ellos te proponen.", foto: "Index · Hilux, apretón de manos", src: "publica-vmc" },
  { id: "16-negociable-a", ix: "hero", camp: "auto", titulo: "Variación A · lavanda, burbujas de vidrio", foto: "Index · Toyota Hilux", src: "publica-vmc" },
  { id: "16-negociable-b", ix: "hero", camp: "auto", titulo: "Variación B · cian, burbujas de vidrio", foto: "Index · Hyundai Accent", src: "publica-vmc" },
  { id: "16-negociable-c", ix: "hero", camp: "auto", titulo: "Variación C · naranja, el capó como mesa", foto: "Index · Nissan Sentra", src: "publica-vmc" },
  { id: "17-flota", ix: "camp", camp: "empresa", titulo: "¿Vehículos parados? Ponlos a la venta.", foto: "Index · flota", src: "index-campana" },
  { id: "18-valor-index", ix: "camp", camp: "valor", titulo: "¿Cuánto vale tu auto?", foto: "Index · Toyota Corolla", src: "index-campana" },
  { id: "19-moto-index", ix: "camp", camp: "moto", titulo: "¿Vendes tu moto? Publícala en VMC.", foto: "Index · Yamaha MT", src: "index-campana" },
  // Versión del 21/10 (publica-vmc-v1.html), solo para comparar.
  { id: "01-foto", camp: "auto", titulo: "Escenario · VW Nivus recortado", foto: "VW Nivus", src: "publica-vmc-v1", ant: true },
  { id: "02-persona", camp: "auto", titulo: "Persona con celular", foto: "Persona", src: "publica-vmc-v1", ant: true },
  { id: "03-cero", camp: "auto", titulo: "Tipográfica · «0%» gigante", foto: "Sedán", src: "publica-vmc-v1", ant: true },
  { id: "04-pasos", camp: "auto", titulo: "Proceso · 3 pasos", foto: "Toyota Corolla", src: "publica-vmc-v1", ant: true },
  { id: "05-tarjeta", camp: "auto", titulo: "Producto · tarjeta Negociable", foto: "Tarjeta", src: "publica-vmc-v1", ant: true },
  { id: "06-moto", camp: "moto", titulo: "Bloque de color · moto sobre disco", foto: "Honda CB190R", src: "publica-vmc-v1", ant: true },
];
/** URL de la pieza en un formato (side264 barra lateral, side400 riel derecho…); publica-vmc va en el estilo nuevo (e=personaje). */
export const bannerSrc = (p: Pieza, f: string, e = "&e=personaje") =>
  p.src === "max-vmc" ? `/producto-assets/ganaya/banners/max-vmc.html?t=${p.id}&f=${f}` : p.src === "index-campana" ? `/producto-assets/ganaya/banners/index-campana.html?v=${p.id}&vista=fondo` : `/producto-assets/ganaya/banners/${p.src}.html?v=${p.id}&f=${f}${p.src === "publica-vmc" ? e : ""}`;
/** Clave única de una pieza (el mismo id puede repetirse entre plantillas). */
export const bannerKey = (p: Pieza) => `${p.src}:${p.id}`;

/** Riel derecho (23/10, lista de Silvana): solo estas piezas, agrupadas por tipo; los banners de Max quedan fuera por ahora.
 *  `corto`: nombre para el botón del panel; el titular completo se lee en la pista. */
export const RIEL_TIPOS: { tipo: string; nombre: string; piezas: { key: string; corto: string }[] }[] = [
  { tipo: "A", nombre: "Publica tu auto", piezas: [{ key: "publica-vmc:01-auto", corto: "Publícalo hoy" }, { key: "publica-vmc:04-pasos", corto: "En 3 pasos" }, { key: "publica-vmc:05-propuestas", corto: "Tú pones el precio" }] },
  { tipo: "B", nombre: "Publica tu moto", piezas: [{ key: "publica-vmc:03-moto", corto: "Publica tu moto" }] },
  { tipo: "C", nombre: "Valoriza tu auto", piezas: [{ key: "publica-vmc:08-valor", corto: "¿Cuánto vale?" }, { key: "publica-vmc:10-valor-publica", corto: "Conoce su valor" }] },
  { tipo: "D", nombre: "Subastop · Venta para empresas", piezas: [{ key: "venta-empresa:01-general", corto: "Liquidez" }, { key: "venta-empresa:02-maquinaria", corto: "Maquinaria" },
    { key: "venta-empresa:03-tecnologia", corto: "Tecnología" }, { key: "venta-empresa:04-flotas", corto: "Flotas" }, { key: "venta-empresa:05-inventario", corto: "Repuestos" }] },
];
