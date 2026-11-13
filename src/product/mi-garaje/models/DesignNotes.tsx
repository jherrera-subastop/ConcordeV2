import type { JSX } from "react";
import "./design-notes.css";

/** Nota de diseño al pie de Pulso y Pulso Fuente: por qué está organizado así, con la investigación que lo sustenta.
 *  Es material de revisión del lab, no parte de la interfaz de VMC. */
const SRC = {
  nngVisual: ["NN/g · 5 principios de diseño visual", "https://www.nngroup.com/articles/principles-visual-design/"],
  nngScan: ["NN/g · patrones de lectura (capas)", "https://nngroup.com/articles/f-shaped-pattern-reading-web-content/"],
  baymard: ["Baymard · Cuentas y autoservicio", "https://baymard.com/blog/collections/accounts-and-self-service"],
  baymardIcons: ["Baymard · Íconos en el panel de cuenta", "https://baymard.com/research-articles/use-icons-in-the-account-dashboard"],
  copart: ["Copart · Member Dashboard", "https://www.copart.co.uk/Content/UK/EN/Member-News/Enhanced-Website-Features"],
  copartWin: ["Copart · Ganar, perder y qué sigue", "https://help.copart.com/22724/kb/article/130793/Winning, Losing & What Happens Next"],
  ebay: ["eBay Community · cambio del Summary", "https://community.ebay.com/t5/Report-eBay-Technical-Issues/Change-to-quot-Summary-page-quot/m-p/22633675"],
  restorff: ["LogRocket · Efecto Von Restorff", "https://blog.logrocket.com/ux-design/von-restorff-effect-in-ux"],
  carbon: ["Carbon (IBM) · Dashboards", "https://carbondesignsystem.com/data-visualization/dashboards"],
  nngAcc: ["NN/g · Acordeones: cuándo evitarlos", "https://www.nngroup.com/videos/avoid-accordions/"],
  ebayMy: ["eBay · My eBay: secciones Comprar y Vender", "https://www.ca.ebay.com/help/account/my-ebay.html"],
  ebayHub: ["eBay · Seller Hub: Tasks y pedidos por pagar", "https://export.ebay.com/en/services-tools/seller-hub/managing-your-sales-in-seller-hub/"],
  stage1: ["Stage 1 · se pueden mover accesos manteniendo destino", ""],
  ebayOffer: ["eBay Developers · Best Offer y contraofertas", "https://developer.ebay.com/api-docs/user-guides/static/trading-user-guide/best-offers-counter.html"],
  avt: ["AVT · valor fechado, se recalcula cada mes", ""],
  doc01: ["Doc 01 · «Historial» con dos destinos", ""],
  digital: ["Digital Applied · flujos de cotización por pasos", "https://www.digitalapplied.com/blog/multi-step-quote-flow-design-conversion-2026"],
  visa: ["Visa Design System · Wizard", "https://design.visa.com/patterns/wizard/usage/"],
  kavak: ["Kavak · cotizar tu auto", "https://www.kavak.com/mx/blog/cotizar-carro-una-tarea-sencilla"],
  wcag: ["TPGi · WCAG 3.3.7 no pedir dos veces", "https://tpgi.com/how-to-test-3-3-7-redundant-entry"],
  baymardVal: ["Baymard · Validación en línea", "https://baymard.com/blog/inline-form-validation"],
  govQ: ["GOV.UK · Question pages y revisar respuestas", "https://design-system.service.gov.uk/patterns/question-pages"],
  carvana: ["Carvana · estimado condicional", "https://www.carwhere.com/guides/sell-to-carvana-review"],
  motorway: ["Motorway · del estimado al precio guía", "https://motorway.co.uk/sell-my-car/guides/how-motorways-app-is-designed-to-get-you-the-best-price"],
  turo: ["Turo · guía de fotos", "https://help.turo.com/en_us/listing-photos-guide-rJBHuRQSh.md"],
  guia: ["Guía visual Cobblepot · pág. 2 (Guardar · Continuar / Publicar)", ""],
  doc07: ["Doc 07 · mejoras UX Valorizar / Publicar", ""],
  pass: ["Centro de Ayuda · Subaspass (planes y diferencia con el canje de Puntos)", "https://centro-de-ayuda-vmc.vercel.app/categorias/consignacion/subaspass"],
  ml: ["Mercado Libre · Sistema de reputación (termómetro)", "https://www.mercadolibre.com.ar/seguro_calif.html"],
  ebayStar: ["eBay · Feedback scores (estrella por nivel)", "https://pages.ebay.ph/help/feedback/feedback-scores.html"],
  toggletip: ["Inclusive Components · Tooltips y toggletips", "https://inclusive-components.design/tooltips-toggletips/"],
  riesgo: ["Centro de Ayuda · El riesgo usuario y sus categorías", "https://centro-de-ayuda-vmc.vercel.app/categorias/riesgo-usuario/el-riesgo-usuario-y-sus-categorias"],
  m3type: ["Material 3 · roles del type scale", "https://material-web.dev/theming/typography"],
  refUI: ["Refactoring UI · jerarquía con peso y color", "https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886"],
  grid8: ["Grilla de 8 pt", "https://breakdance.com/the-8-point-grid-system-a-practical-guide/"],
  badgeA11y: ["MiHCM DS · Notification badge: accesibilidad", "https://designsystem.mihcm.com/components/notification-badge/accessibility"],
  uxw: ["Parallel · UX writing best practices (2026)", "https://www.parallelhq.com/blog/ux-writing-best-practices"],
  tyc: ["VMC · Términos y Condiciones IV.5, IV.6 y IV.9", "https://www.vmcsubastas.com/condiciones-y-terminos"],
  m3badge: ["Material 3 · Badges", "https://m3.material.io/components/badges/guidelines"],
  nngInd: ["NN/g · Indicadores, validaciones y notificaciones", "https://www.nngroup.com/articles/indicators-validations-notifications/"],
  wcagColor: ["WCAG 2.2 · 1.4.1 Uso del color", "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html"],
  wcagContrast: ["WCAG 2.2 · 1.4.3 Contraste mínimo", "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html"],
  chat: ["Concorde · countdown del chat de la Sala (ProgressBar «rainbow»)", ""],
} as const;
type Src = keyof typeof SRC;
/** sel: qué resaltar en la pantalla del lab · pre: lo que hay que activar antes (botón del lab o clic dentro de la pantalla). */
type Show = { sel: string; lab?: string; click?: string };
type Note = { zone: number; t: string; what: string; why: string; src: Src[]; check?: string; pubOnly?: boolean; show?: Show; isNew?: boolean };

const SPOT_CSS = `@keyframes dn-spot { 0%, 100% { outline-color:rgba(255,0,102,.95); } 50% { outline-color:rgba(204,0,255,.35); } }
.dn-spot { outline:3px solid #FF0066 !important; outline-offset:4px !important; border-radius:12px; animation:dn-spot 0.9s ease-in-out 3; }`;

/** Lleva la pantalla del lab al punto de la nota y lo resalta 3 s. Si hace falta, primero activa el estado del lab
 *  (la pantalla se recarga) o hace clic dentro de ella (abrir la vista rápida, encender el interruptor). */
function show({ sel, lab, click }: Show): void {
  const frame = () => document.querySelector<HTMLIFrameElement>(".lab__stage iframe");
  const spot = () => { const doc = frame()?.contentDocument; if (!doc) return;
    if (!doc.getElementById("dn-spot")) { const st = doc.createElement("style"); st.id = "dn-spot"; st.textContent = SPOT_CSS; doc.head.append(st); }
    if (click) doc.querySelector<HTMLElement>(click)?.click();
    setTimeout(() => {
      // display:contents (el riel en mobile) no tiene caja: se resaltan sus hijos.
      const els = [...doc.querySelectorAll<HTMLElement>(sel)].flatMap((e) => (e.getClientRects().length ? [e] : [...e.children] as HTMLElement[]));
      if (!els.length) return;
      els[0].scrollIntoView({ behavior: "smooth", block: "center" });
      els.forEach((e) => { e.classList.add("dn-spot"); setTimeout(() => e.classList.remove("dn-spot"), 2800); });
    }, click ? 400 : 50);
  };
  frame()?.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  const btn = lab ? [...document.querySelectorAll<HTMLButtonElement>(".lab__bar button")].find((b) => b.textContent?.trim() === lab) : undefined;
  if (btn && btn.getAttribute("aria-pressed") !== "true") {
    btn.click(); // cambia el src: el iframe se vuelve a montar
    setTimeout(() => frame()?.addEventListener("load", () => setTimeout(spot, 700), { once: true }), 60);
  } else spot();
}
type Kind = "fuente" | "pulso" | "valorizar" | "publicar";

// Recorridos por pasos (revisados con agentes UX, doc 07): misma nota para Valorizar y Publicar; Publicar suma sus pasos.
const FLOW_NOTES: Note[] = [
  { zone: 1, t: "Lo fácil primero, lo comprometido al final", what: "Vehículo → Detalles → Valor; en Publicar recién después Información, Vista previa y Pago.", why: "Pedir placa, fotos y pago antes de mostrar el valor hace abandonar. El valor es la recompensa que sostiene el resto del recorrido.", src: ["digital", "visa"] },
  { zone: 1, t: "No se pierde el trabajo", what: "Borrador automático («puedes salir y continuar después»), «Tienes una publicación sin terminar · Continuar», el atrás del navegador vuelve un paso y el foco va al título de cada paso.", why: "Antes el atrás del navegador o de Android sacaba del recorrido y cerrar la pestaña borraba todo.", src: ["visa", "doc07"] },
  { zone: 3, t: "Decir al inicio cuánto toma y qué se necesita", what: "«Unos 3 minutos en total · Para publicar necesitarás: placa, de 1 a 10 fotos y 25 SC». En Valorizar: «Menos de 1 minuto · Sin compromiso».", why: "Si la placa, las fotos o el pago aparecen recién en el paso 4, la persona se siente engañada y abandona.", src: ["kavak"] },
  { zone: 3, t: "Detalles opcionales con el valor en vivo", what: "Mecánica, Estado, Historial y Equipamiento por grupos, con «Típico» sugerido, el % de cada opción y la precisión «n de 12». En Publicar, la mecánica dice «Necesaria para publicar».", why: "Ver cómo se mueve el valor motiva a completar. Saltar la mecánica parecía gratis y luego se pedía igual: ahora se avisa.", src: ["wcag", "carvana"] },
  { zone: 3, t: "Resultado completo de AVT, no solo el número", what: "Valor, rango y confianza · recompra y Estimación Subastop · proyección · señal de venta y momento óptimo · similares · factores. Con «¿Qué puede cambiar este valor?».", why: "La guía pide no reducirlo al precio. Carvana y Motorway presentan el valor como condicional y explican qué lo mueve.", src: ["guia", "carvana", "motorway"] },
  { zone: 4, t: "Guardar o seguir, según por dónde entraste", what: "Desde Valorizar: Guardar · Publicar. Desde Publicar: Guardar · Continuar publicación.", why: "Cambia la intención inicial, no el recorrido: los dos usan el mismo formulario AVT y conservan lo ingresado.", src: ["guia"] },
  { zone: 3, t: "Solo lo que falta para publicar", what: "«Ya lo tenemos de tu valorización» · fotos guiadas por toma con portada · validación al salir del campo · resumen de errores con enlaces · «Faltan n de 9».", why: "No pedir dos veces lo mismo (WCAG 3.3.7). Información era la página más larga en mobile y el error salía al pie, lejos del campo.", src: ["wcag", "turo", "baymardVal", "govQ"], pubOnly: true },
  { zone: 3, t: "Revisar antes de pagar", what: "Vista previa con la ficha real y «Cambiar» por bloque (fotos, mecánica, ubicación, descripción) que lleva directo al campo.", why: "Un solo «Editar» llevaba al inicio de Información. Revisar respuestas por bloque es el patrón de GOV.UK antes de un compromiso.", src: ["govQ"], pubOnly: true },
];
const flow = (pub: boolean) => ({
  title: pub ? "Publicar por pasos: por qué está organizado así" : "Valorizar por pasos: por qué está organizado así",
  weight: [[pub ? "Continuar publicación" : "Publicar", 100], ["Valor de mercado", 86], ["Pasos y borrador", 56], ["Detalles opcionales", 44], ["Guardar", 36]] as [string, number][],
  zones: [[1, "Pasos · borrador guardado", "a"], [2, "Salir a Mi Garaje", "b"], [3, "El paso actual", "c"], [4, "Acciones al pie", "d"]] as [number, string, string, string?][],
  notes: FLOW_NOTES.filter((n) => pub || !n.pubOnly),
});

const DATA: Record<Kind, { title: string; weight: [string, number][]; zones: [number, string, string, string?][]; notes: Note[] }> = {
  valorizar: flow(false),
  publicar: flow(true),
  fuente: {
    title: "Pulso Fuente: por qué está organizado así",
    weight: [["Publicar", 100], ["Lo que pide acción en Tu actividad", 84], ["Tu actividad (estados)", 64], ["Mi Wallet", 48], ["SubasPass", 44], ["Valorizar", 40], ["Recomendados", 32]],
    zones: [[1, "Cabecera · tarjeta de cuenta y SubasPass", "a", ".f-head"], [2, "Publicar · Valorizar", "b", ".f-actions"], [3, "Tu actividad", "c", ".g-activity"], [4, "Mi Wallet · Publicidad", "d", ".f-wallet, .f-ad"]],
    notes: [
      { zone: 3, isNew: true, t: "Estados como texto; la píldora es de Concorde", what: "Antes: píldoras grises y una lila para cada estado. Ahora: solo EN VIVO y PRÓXIMA (BadgeStatus) son píldora; el resto es texto, magenta si te toca actuar y gris si toca esperar. Sin estado cuando la sección o el paso ya lo dicen («Guardada», «Publicada»).", why: "Tres estilos de estado para lo mismo era ruido, y «Guardada» en Mis valorizaciones no informaba nada. La píldora lila rompía la regla de un solo gris.", src: ["restorff"], show: { sel: ".fr__side" } },
      { zone: 3, isNew: true, t: "Solo lo que está en curso", what: "Antes: pestañas En curso / Rechazadas en cada sección y contadores con el total. Ahora: sin pestañas; se ve lo que está en curso y el historial va en «Ver todas (n)». Contadores de lo en curso y filas sin placa (sigue en la vista rápida).", why: "Seguir algo en curso es el motivo más común para abrir el historial (Baymard). Una compra tenía 4 controles alrededor de 1 fila.", src: ["baymard"], show: { sel: ".fs__more" } },
      { zone: 4, isNew: true, t: "Wallet plana", what: "Antes: degradado con un brillo naranja en la esquina. Ahora: degradado de Concorde (#3B1782 → #22005C) sin brillo.", why: "El naranja translúcido sobre morado se veía marrón y competía con «Publicar», justo arriba.", src: [], show: { sel: ".f-wallet" } },
      { zone: 3, isNew: true, t: "Recomendados", what: "El OfferShelf de Concorde tal cual (pedido de Julio, por ahora), bajo Tu actividad: cuatro ofertas con su barra (naranja en vivo, cyan negociable). Mide 766, así que no entra en el riel; en pantallas angostas las tarjetas se desplazan en horizontal.", why: "Mantiene vivo el motivo de volver (el próximo auto) con un componente que ya existe. El riel queda más corto: Publicar, Valorizar, Wallet y publicidad. Sin datos de ejemplo no se muestra.", src: [], check: "Por confirmar: recomendar por lo que ofertó", show: { sel: ".f-shelf" } },
      { show: { sel: ".f-src__rail" }, zone: 3, t: "Tu actividad al centro", what: "Dos columnas: cabecera y Tu actividad a la izquierda, de arriba abajo; a la derecha un solo riel sticky con Publicar, Valorizar y Wallet, que acompaña el scroll sin dejar huecos.", why: "La gente entra a su cuenta con un solo objetivo y casi nunca vuelve: la página plana y lo abierto primero rinden mejor. Copart abre con pagos pendientes, ítems abiertos y pujas.", src: ["baymard", "copart"] },
      { show: { sel: ".g-activity", click: '.f-only[aria-checked="false"]' }, zone: 3, t: "Interruptor «Requieren tu acción»", what: "En el encabezado de Tu actividad, con la cantidad en magenta. Antes «Solo pendientes»: Julio pidió nombrar el criterio real, que es lo que te pide actuar (por responder, en vivo, por pagar); una sala en vivo cuenta porque, si consignaste, debes enviar un bid. Al filtrar, las filas y secciones se reacomodan en 200 ms sin mover los encabezados. Encendido deja solo eso, sin pestañas para no esconder nada. Desaparece cuando no queda nada pendiente y no se recuerda entre visitas.", why: "El filtro va junto a lo que filtra: en la cabecera el efecto quedaba lejos y el chip sobre el título competía con «Mi Garaje». Filtrar las mismas filas en su sección conserva el contexto, como «No leídos» en Gmail; desplegar una lista aparte volvería a duplicar el panel Pendientes de Pulso.", src: ["nngInd"] },
      { show: { sel: ".fs__chips" }, zone: 3, t: "Cada encabezado cuenta su estado", what: "«1 por responder», «1 en vivo», «1 pago pendiente». Se calculan con los estados que ya existen (D12).", why: "En páginas con secciones la gente lee casi solo los encabezados (patrón de capas): el encabezado tiene que decir si hay que entrar.", src: ["nngScan"] },
      { show: { sel: ".fs__act, .fr__new, .g-status--action, .f-only b" }, zone: 3, t: "Magenta: lo que te necesita al entrar", what: "Un color nuevo con un solo significado: los tags de sección («1 por responder», «1 en vivo», «1 pago pendiente»), la acción de la fila («Responder», «Pago pendiente») y el punto de lo nuevo. Es el gradiente del countdown del chat de la Sala (#CC00FF → #FF0066). El naranja queda para marca, Publicar y el badge EN VIVO de la fila (Concorde).", why: "El naranja hacía cuatro trabajos (marca, en vivo, tareas y hasta el riesgo «Muy bajo») y ya no avisaba de nada. «1 en vivo» también es magenta porque una sala abierta te necesita: quien consignó debe conectarse y enviar al menos un bid válido o pierde 15 Puntos (Centro de Ayuda, «La oferta en vivo»). Lo distinto destaca solo si es escaso y significa una sola cosa. Material 3 reserva un único color para sus badges.", src: ["restorff", "m3badge", "chat"] },
      { show: { sel: ".fs__act" }, zone: 3, t: "Una señal por nivel", what: "Sección: el número en un círculo magenta (badge de notificación) y un texto corto en paralelo: «Por responder», «Por pagar», «En vivo». Fila: la acción como verbo («Responder», «Pagar») y, si es nueva, punto y negrita. Para lectores de pantalla el badge se lee completo («1 Por responder»).", why: "Antes una sola oferta se anunciaba 6 veces y la píldora «1 por responder» mezclaba número y texto en un solo bloque. El badge numérico va pegado a lo que describe, su texto no puede depender solo del color y el número debe tener contexto accesible. Los textos van en paralelo y con verbos de acción, como pide el UX writing actual.", src: ["nngInd", "m3badge", "badgeA11y", "uxw"] },
      { show: { sel: ".fr.is-new" }, zone: 3, t: "Negrita = no lo has visto", what: "Nombre y detalle en negrita y punto magenta mientras la fila no se abre; al abrirla vuelve al peso normal. La palabra «NUEVO» queda solo para lectores de pantalla.", why: "Es el patrón de no leído de Gmail, Outlook y Slack: la negrita marca lo nuevo y se apaga sola. El punto y la negrita juntos evitan depender solo del color.", src: ["wcagColor"] },
      { show: { sel: ".fs__act > b, .f-only b" }, zone: 3, t: "Contraste del magenta", what: "Con texto blanco se usa el gradiente oscurecido (#A800D4 → #D6005A: 5.8:1 y 5.2:1). El gradiente brillante del chat queda solo para el punto, que no lleva texto.", why: "Blanco sobre #CC00FF da 4.2:1 y sobre #FF0066 3.9:1: no llega al 4.5:1 que pide el texto pequeño.", src: ["wcagContrast"] },
      { show: { sel: ".fs__icon, .fs__more" }, zone: 3, t: "Íconos y un solo «Ver todas»", what: "Ícono por sección de la familia de Concorde (Material Symbols relleno, 24 px; Negociaciones usa el de Ofertas); «Ver todas (n)» al pie de cada sección abierta, con el total; no aparece si ya se ve todo (Stage 1: conservar el destino).", why: "Los íconos ayudan a escanear en visitas poco frecuentes. Tres formas de navegar en un encabezado eran ruido.", src: ["baymardIcons", "ebay"] },
      { show: { sel: ".fs__list" }, zone: 3, t: "Estados que faltaban", what: "Las próximas subastas van con su tag PRÓXIMA junto a la sala abierta · lo rechazado y lo finalizado queda en «Ver todas» (antes, pestañas) · valorización con su cambio de valor desde que se guardó (Recalcular ahora).", why: "AVT recalcula cada mes, así que no hay valorizaciones «desactualizadas»: lo útil es cuánto cambió. Una consignación para una subasta que aún no empieza no aparecía en ningún lado; ahora convive con la sala abierta, porque las dos son participaciones activas y el tag las distingue. En una negociación cualquiera de las partes puede rechazar y eso la cierra (T&C IV.6.g); en una subasta con reserva el vendedor puede declinar el bid del mejor postor o el mejor postor la contrapropuesta, y el proceso queda desierto (T&C IV.5.b). «Historial» ya era el enlace de la cuenta. El valor AVT tiene fecha.", src: ["copartWin", "doc01", "avt", "tyc"] },
      { show: { sel: ".fs__toggle" }, zone: 3, t: "Encabezados en columnas fijas", what: "Título · lo que pide acción · el resto del estado, siempre en la misma vertical. Sin miniaturas en las plegadas.", why: "Con todo plegado la sección funciona como lista: alinear las columnas permite comparar de un vistazo. Las miniaturas de 28 px no se reconocían y sumaban ruido.", src: ["nngVisual"] },
      { show: { sel: ".fs__head" }, zone: 3, t: "Nada dicho dos veces", what: "«1 nueva» desaparece si la novedad ya es la que pide acción; el resumen muestra solo los otros estados, con su cantidad.", why: "Antes «1 por responder», «1 nueva» y «Responder · Esperando…» decían lo mismo tres veces y el texto se cortaba.", src: ["restorff"] },
      { show: { sel: ".fs:not(.is-open)" }, zone: 3, t: "Abiertas solo las que piden acción", what: "Secciones con algo que hacer arrancan abiertas; las que están al día, plegadas.", why: "Los acordeones bajan la visibilidad y suben el costo de interacción: se pliega solo lo que no hace falta ver.", src: ["nngAcc"] },
      { show: { sel: ".f-acct__row", lab: "Alto" }, zone: 1, t: "Tarjeta de cuenta", what: "Una tarjeta blanca bajo el título con tres columnas de rótulo arriba y valor abajo: ¡Hola, ZAEX5G! con «Tu perfil» · Riesgo Usuario con termómetro de 4 tramos · Puntos VMC con la estrella de Concorde a 36 px, ⓘ que se abre al tocar e «Historial». El termómetro se llena en morado según la categoría y pasa a magenta en Alto; el cyan queda para lo negociable (Concorde).", why: "En una sola fila eran diez elementos en cinco tamaños, sin agrupación, y «Tu perfil» quedaba huérfano junto al título. Es el patrón de UserProfileCard (Concorde) y de Zona, con el mismo lenguaje de tarjeta que Tu actividad. Riesgo y Puntos son el mismo dato (300 o más = Muy bajo): van lado a lado. El termómetro de Mercado Libre se entiende sin leer; la información esencial no va en un tooltip de hover.", src: ["ml", "toggletip", "riesgo"], check: "Lab: selector «Riesgo» · destino de «Historial» por confirmar" },
      { show: { sel: ".f-acct__pass", lab: "SubasPass activo" }, zone: 1, t: "SubasPass como banda de la tarjeta de cuenta", what: "Banda al pie de la tarjeta con el gradiente de Zona: «✦ SubasPass · Participa sin límites, con consignación 0 · Ver planes ›». Con plan: «SubasPass VIP · Participación ilimitada hasta el dd/mm · Mi plan» en morado. Con riesgo alto: «Participa sin límites, también con riesgo alto». Textos tomados de la landing («acceso ilimitado», «consignación 0», «membresía VIP»). El riel queda libre para la Wallet y los recomendados.", why: "SubasPass vende participar sin límites: se consigna igual, pero en 0 («sin consignar» era incorrecto). Le sirve a quien participa seguido. El doc 01 lo deja debajo de Cuenta; como banda de la tarjeta gana el ancho y el peso del banner de Zona sin sumar otro bloque a la página.", src: ["tyc", "pass"], check: "Lab: «SubasPass activo»" },
      { show: { sel: ".g-qv__panel", click: ".fr.is-new, .fr" }, zone: 3, t: "Negociar sin salir del panel", what: "PROPUESTA D12 · La vista rápida muestra la oferta con tu precio publicado y el valor de mercado AVT, el hilo de propuestas y Aceptar · Contraproponer · Rechazar. Contraproponer es un paso (monto con atajos y términos debajo); aceptar y rechazar se confirman en línea.", why: "Hoy contraproponer son 4 modales seguidos y se decide viendo solo un número. Se conserva lo de VMC: 5 propuestas, expiración, consignación y fondos insuficientes. eBay usa el mismo trío aceptar/contraofertar/rechazar.", src: ["ebayOffer"] },
      { show: { sel: ".fs__chips, .fr__meta" }, zone: 1, t: "Mejoras factibles, no inventos", what: "Cada pieza nueva sale de un dato que VMC o AVT ya tienen: «cosas por hacer» y chips (estados), cambio de valor (AVT). «Último movimiento» (Transacciones) queda guardado para ofrecerlo después.", why: "Lo que no tenía dato real se quitó o se cambió: «Desactualizada», el número de fotos y los términos que no eran de AVT («Precio justo», «Revalorizar»).", src: ["avt", "doc01"] },
      { show: { sel: ".f-head__title, .fs__name, .fr__name" }, zone: 3, t: "6 tamaños, 3 pesos, 1 gris", what: "Display 40/800 (Mi Garaje) · Headline 24/800 (Tu actividad, saldos) · Title 18/800 (secciones, Publicar, Valorizar, Mi Wallet, valores de la cuenta) · Body fuerte 15/600 (autos, saludo) · Label 14/600 (Concorde label-md: enlaces, pestañas, interruptor) y Body 14/400 (detalle) · Caption 12/600 (chips, estados, rótulos). Texto en morado de marca y un solo gris. Espacios en múltiplos de 8: título → tarjeta 16, tarjeta → Tu actividad 40.", why: "La medición dio 11 tamaños y 4 pesos: la cuenta (20/800) gritaba más que Tu actividad (17), sección, tarjetas y autos se confundían (17 vs 15) y los enlaces sonaban como el contenido. Bastan pocos niveles con saltos claros, y la jerarquía se arma más con peso y color que con tamaño. Excepción: los badges EN VIVO y PRÓXIMA de Concorde van a 9 px (caso para Julio).", src: ["m3type", "refUI", "grid8"], check: "Badge de 9 px: caso para Julio" },
    ],
  },
  pulso: {
    title: "Pulso: por qué está organizado así",
    weight: [["Pendientes (3 más urgentes)", 100], ["Publicar", 86], ["Mi Wallet", 70], ["Tu actividad", 54], ["Valorizar", 40], ["SubasPass", 30]],
    zones: [[1, "Cabecera y cuenta", "a"], [2, "Publicar · Valorizar", "b"], [3, "Pendientes", "c"], [4, "Mi Wallet", "d"]],
    notes: [
      { zone: 3, t: "Por qué existe «Pendientes»", what: "Un solo panel con lo que vence primero y su botón (Ir a la Sala · Responder · Pagar), arriba de todo.", why: "En VMC hay plazos que se pierden: una sala que cierra, una oferta que vence, un pago con fecha. Sin el panel, esas tareas quedan repartidas en 5 secciones y hay que revisarlas todas para saber si estás al día. Copart abre su panel con pagos pendientes, ítems abiertos y pujas; eBay Seller Hub tiene «Tasks», una lista de acciones sugeridas, y cuenta los pedidos que esperan pago.", src: ["copart", "ebayHub"] },
      { zone: 3, t: "Solo los 3 más urgentes, sin paginar", what: "El resto se resume por tipo y se despliega en el lugar.", why: "En el rediseño de eBay, las listas largas arriba taparon lo importante y fue la principal queja.", src: ["ebay"] },
      { zone: 3, t: "Cuenta regresiva", what: "Tiempo restante en mono en vez de fecha.", why: "Supuesto a validar: los plazos (42 min, 6,5 h, 72 h) son de ejemplo y no están confirmados con los T&C.", src: [], check: "Sin evidencia externa" },
      { zone: 1, t: "Riesgo como escala", what: "5 niveles con el actual resaltado.", why: "Una escala dice dónde estás y cuánto puedes empeorar. Por confirmar que VMC tenga 5 niveles.", src: ["carbon"], check: "Niveles sin confirmar" },
      { zone: 0, t: "Secciones plegadas que informan", what: "Plegadas muestran cantidad, estados y miniaturas.", why: "Patrón de capas: el encabezado basta para decidir si entrar.", src: ["nngScan"] },
      { zone: 0, t: "Vista rápida sin salir", what: "Panel lateral (hoja en mobile) con foto, estado, etapas e historial.", why: "Navegación plana: entender y actuar sin perder el contexto de Mi Garaje.", src: ["baymard"] },
      { zone: 0, t: "Por qué existe «Todo · Comprando · Vendiendo»", what: "Filtra Tu actividad por rol, sin mover las secciones.", why: "En VMC la misma persona compra (participaciones, compras) y vende (publicaciones, valorizaciones, ofertas recibidas). My eBay separa igual su actividad en Comprar y Vender. El filtro deja ver un rol a la vez sin perder el orden fijo. Pendiente: hoy no filtra el panel Pendientes; hay que decidir si filtra toda la página.", src: ["ebayMy"], check: "Alcance por decidir" },
      { zone: 0, t: "Un acento por significado", what: "Naranja en vivo; turquesa en ofertas negociables; morado en pagos y estructura.", why: "Lo distinto destaca solo si es escaso.", src: ["restorff"] },
    ],
  },
};

export default function DesignNotes({ kind }: { kind: Kind }): JSX.Element {
  const d = DATA[kind];
  return <section className="dn" aria-labelledby={`dn-${kind}`}>
    <header className="dn__head"><span className="dn__tag">Nota de diseño · no es parte de la interfaz</span><h2 id={`dn-${kind}`}>{d.title}</h2>
      {kind === "fuente" ? <p className="dn__lead">Toca una zona del mapa, un color o «Ver en la pantalla» y la pantalla de arriba te lleva a esa parte y la resalta.</p> : null}</header>
    <div className="dn__visuals">
      <figure className="dn__fig"><figcaption>Mapa de la página</figcaption>
        <div className="dn__map">{d.zones.map(([n, l, a, sel]) => sel
          ? <button type="button" key={n} style={{ gridArea: a }} onClick={() => show({ sel })} aria-label={`Ver en la pantalla: ${l}`}><b>{n}</b><span>{l}</span></button>
          : <div key={n} style={{ gridArea: a }}><b>{n}</b><span>{l}</span></div>)}</div></figure>
      <figure className="dn__fig"><figcaption>Peso visual, de más a menos</figcaption>
        <ol className="dn__weight">{d.weight.map(([l, w]) => <li key={l}><span>{l}</span><i style={{ width: `${w}%` }} /></li>)}</ol></figure>
      <figure className="dn__fig"><figcaption>Qué significa cada color</figcaption>
        <ul className="dn__legend">{(kind === "valorizar" || kind === "publicar" ? [["is-orange", "Acción principal (Continuar · Publicar)"], ["is-teal", "Borrador guardado y completado"], ["is-violet", "Estructura, pasos y opciones elegidas"]]
          : kind === "fuente" ? [["is-magenta", "Te necesita · novedad al entrar", ".fs__act, .fr__new, .g-status--action, .f-only b"], ["is-orange", "Marca, Publicar y badge EN VIVO", ".f-act--publish, .badgestatus--live"], ["is-violet", "Estructura y navegación", ".fs__icon, .fs__count, .f-wallet"]]
          : [["is-orange", "En vivo · Publicar"], ["is-teal", "Ofertas negociables (Concorde negotiable)"], ["is-violet", "Pagos y estructura"]]).map(([c, l, sel]) => <li key={l}>{sel ? <button type="button" onClick={() => show({ sel })}><i className={c} />{l}</button> : <><i className={c} />{l}</>}</li>)}</ul></figure>
    </div>
    <ol className="dn__notes">{d.notes.map((n, i) => <li key={n.t}>
      <span className="dn__n">{i + 1}{n.zone ? <small>zona {n.zone}</small> : null}</span>
      <div><h3>{n.isNew ? <mark>Nuevo 14/10</mark> : null}{n.t}{n.check ? <em>{n.check}</em> : null}</h3><p className="dn__what">{n.what}</p><p>{n.why}</p>
        {n.show ? <button type="button" className="dn__show" onClick={() => show(n.show!)}>Ver en la pantalla{n.show.lab ? ` · activa «${n.show.lab}»` : n.show.click ? " · lo activa" : ""} →</button> : null}
        {n.src.length ? <p className="dn__src">{n.src.map((k) => { const [l, u] = SRC[k]; return u ? <a key={k} href={u} target="_blank" rel="noreferrer">{l}</a> : <span key={k}>{l}</span>; })}</p> : null}</div>
    </li>)}</ol>
  </section>;
}
