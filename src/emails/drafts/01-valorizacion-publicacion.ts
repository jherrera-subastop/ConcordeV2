import { s, gap, paragraph, greeting, button, type EmailDraft } from "./shared";

export const valorizacionPublicacion: EmailDraft = {
  id: "valorizacion-publicacion",
  name: "01 · Valorización → publicación",
  subject: "Ya lo valorizaste. Ahora ponlo en venta.",
  preheader: "Tú defines el precio que buscas y decides con qué propuesta avanzar.",
  bannerTitle: "¡Ya valorizaste tu vehículo! Estás a un paso de encontrar el precio que buscas.",
  category: "Publicación particular",
  preset: { banner: "texto-centrado", footer: "footer-compact", tone: "proximas" },
  concept: "Banner centrado morado de Concorde. Texto literal de Julio: valorización completada, modalidad Negociable y control de las propuestas. Panel de pago único en vidrio claro neutro, basado en la referencia de pasos enviada por Julio: título protagonista, monto reducido y símbolo >S< de SubasCoins. Video original, lema centrado y CTA, sin pasos adicionales.",
  source: "Correcciones literales de Julio del 10/11/2026: vehículo, Negociable, aceptar/contraproponer/rechazar, panel de pago único y lema antes de ¡Publica ahora!. Diseño actualizado a pedido de Julio el 10/11/2026: vidrio claro neutro de la segunda captura, basado en steps de src/emails/prodEmailTemplates.ts; sin fondo morado, título 26px y monto 24px secundario. Símbolo >S< ya utilizado en Concorde. Respaldo comercial: https://www.vmcsubastas.com/landing-subascars ; costo y alcance: https://www.vmcsubastas.com/condiciones-y-terminos , IV.11.2 (consultados el 10/11/2026).",
  pending: [
    "Confirmar el disparador: persona que ya vio su valorización y todavía no publicó.",
    "El CTA ¡Publica ahora! usa https://www.vmcsubastas.com/zona/publicar, destino proporcionado por Julio el 10/11/2026. Probar su recorrido autenticado antes del envío.",
    "Validar las condiciones aplicables en la fecha de envío y el escape seguro de {{nombre}}; si falta nombre, usar «Hola:».",
    "El MP4 original vende-spot-v7-v7.mp4 y su miniatura se incluyen para revisión con autorización de publicación en el repositorio público. Antes de enviar correos, sustituir las rutas relativas por URLs públicas HTTPS verificadas del entorno de envío. El MP4 se enlaza; no se adjunta ni incrusta en el correo.",
    "0% se refiere a la comisión de VMC al vendedor sobre el precio de venta, no a servicios adicionales que el usuario contrate ni a eventuales cargos de recarga. La publicación puede retirarse por solicitud del propietario o incumplimiento; no garantiza venta, precio mínimo ni recepción de ofertas. Revalidar IV.11.2 antes del envío.",
  ],
  sections: [
    s("title", { text: "¡Ya valorizaste tu vehículo! Estás a un paso de encontrar el precio que buscas." }), gap(),
    greeting(), gap("12"),
    paragraph("Acabas de valorizar tu vehículo. Ahora da el siguiente paso: __publícalo en VMC Subastas__ con la modalidad __Negociable__ y recibe ofertas sin comisiones, ni intermediarios."), gap(),
    paragraph("__Tú defines tu expectativa de venta.__ Los compradores verificados podrán enviarte propuestas que puedes aceptar, contraproponer o rechazar. ¡Tú decides con cuál avanzar!"), gap("22"),
    s("panel", {
      title: "¡Un solo pago hasta que lo vendas!",
      titleSize: "20",
      variant: "publication-benefit",
      body: "Publica por tan solo [[>S< 25]] SubasCoins y mantén la publicación hasta que vendas tu vehículo.",
      align: "center",
    }), gap("24"),
    s("video", {
      url: "/correos/borradores/valorizacion-publicacion/vende-spot-v7-v7.mp4",
      poster: "/correos/borradores/valorizacion-publicacion/poster.jpg",
      width: "270",
      caption: "Ver video",
      alt: "Ver video: Ahora se vende así",
    }), gap("24"),
    s("text", { text: "Tu vehículo, tu precio, tu trato.", size: "lg", align: "center" }), gap("12"),
    button("¡Publica ahora!", "https://www.vmcsubastas.com/zona/publicar"), gap("22"),
  ],
};
