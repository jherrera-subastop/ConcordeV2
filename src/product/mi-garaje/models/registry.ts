// Selector del lab: lo elegido (Pulso Fuente y su recorrido) y las alternativas que se conservan para comparar.
export type Proposal = { id: string; name: string; hint: string; group: string };

export const PROPOSALS: Proposal[] = [
  { id: "fuente", group: "Elegido", name: "Pulso Fuente", hint: "Versión elegida · Campos de VMC y mejoras factibles con sus datos, sin Pendientes: Tu actividad a la izquierda; Publicar, Valorizar y Wallet en el riel. Datos de ejemplo desactivables" },
  { id: "vmc", group: "Elegido", name: "Maqueta VMC", hint: "Para las pruebas de backend (15/10) · Pulso Fuente dentro de la maqueta de vmcsubastas.com: 1024 px centrados, barra lateral expandida con su banner, una columna; sin banner principal. No cambia Pulso Fuente" },
  { id: "vmc-propuesta", group: "Elegido", name: "Comprador", hint: "Pedido de Julio (21/10) · Versión comprador: detalle Negociable → «Negocia ahora» → tu propuesta con info breve → Mi Garaje señala dónde llega la respuesta → el vendedor responde (panel del lab) → aceptas → se abre el chat" },
  { id: "valuar", group: "Elegido", name: "Valorizar", hint: "Recorrido elegido · Pedido de Fernando · Valorizar en una página: formulario en un frame, «Valuar mi vehículo» y el resultado AVT carga debajo (sin foto ni datos ajenos a AVT) · Guardar · Publicar" },
  { id: "publica", group: "Elegido", name: "Publicar", hint: "Recorrido elegido · Pedido de Fernando · Publicar en una página: primero valorizar en un frame (mismo formulario y resultado AVT debajo) · Guardar · Continuar publicación → solo lo que falta: Información, Vista previa, Pago" },
  { id: "valorizaciones", group: "Elegido", name: "Mis valorizaciones", hint: "Tarjeta por vehículo (valor, rango, señal de venta, 12 meses, estimación Subastop y la acción según el estado); las publicadas con la identidad Negociable. El análisis AVT se abre en panel lateral. Vacío con ?empty=1" },
  { id: "ficha", group: "Alternativas", name: "Ficha viva", hint: "Propuesta 14/10 · Valorizar con cascada Marca → Modelo → Año → Versión → Km, la ficha del vehículo se arma en vivo a la izquierda, el borrador se retoma solo y el km se lee como etiqueta · Resultado: dónde vender (recompra vs. subasta), qué movió el valor y cuándo vender; solo datos AVT" },
  { id: "pulso", group: "Alternativas", name: "Pulso", hint: "Versión anterior · cuenta y Pendientes con cuenta regresiva, Wallet, Tu actividad en una lista, vista rápida con galería" },
  { id: "valorizar", group: "Alternativas", name: "Valorizar por pasos", hint: "Por pasos: Vehículo → Detalles → Resultado (Guardar · Publicar)" },
  { id: "publicar", group: "Alternativas", name: "Publicar por pasos", hint: "Por pasos: Vehículo → Detalles → Valor (Guardar · Continuar) → Información → Vista previa → Pago → En revisión" },
  { id: "ref", group: "", name: "Referencias", hint: "Mockups de Fernando, capturas de Zona y el avance de Julio (punto de partida del ZIP)" },
];
