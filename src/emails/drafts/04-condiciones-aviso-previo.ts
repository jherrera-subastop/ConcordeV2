import { s, gap, paragraph, bodyLabel, type EmailDraft } from "./shared";

export const condicionesAvisoPrevio: EmailDraft = {
  id: "condiciones-aviso-previo",
  name: "04 · Nuevas modalidades y condiciones",
  subject: "¡SubasTop evoluciona! Conoce nuestras nuevas modalidades y condiciones",
  preheader: "Una experiencia de compra y venta de vehículos más clara, segura y transparente.",
  bannerTitle: "¡SubasTop evoluciona! Conoce nuestras nuevas modalidades y condiciones",
  category: "Condiciones y Términos",
  preset: { banner: "texto-apilado", footer: "footer-compact", tone: "dark" },
  concept: "Texto de Julio restaurado sin resumir ni renombrar sus cuatro puntos. Conserva el banner Apilado Dark y el footer Compacto de Concorde. El CTA permite revisar el documento cuando se confirme su enlace; el PDF solicitado sigue pendiente de adjuntar.",
  source: "Texto proporcionado por Julio el 10/11/2026 para «¡SubasTop evoluciona! Conoce nuestras nuevas modalidades y condiciones». Solo se limpiaron marcas de formato y entidades HTML del texto pegado. Fecha y documento final pendientes de confirmación.",
  pending: [
    "BORRADOR LEGAL CONDICIONADO: confirmar la versión futura aprobada y verificar que los cuatro temas describan fielmente sus cambios.",
    "xx/12/2026 es el marcador del texto de Julio, no una fecha confirmada. Sustituirlo por la fecha exacta aprobada antes de cualquier envío.",
    "Adjuntar las Nuevas CyT en su versión final aprobada para que el usuario tenga una vista previa. El PDF no se ha proporcionado ni adjuntado todavía.",
    "Sustituir {{url_nuevas_condiciones}} por el enlace a ese mismo documento aprobado, no por la página vigente actual.",
    "Validar con Legal las denominaciones, el aviso previo, los destinatarios y el plazo de comunicación antes de enviar.",
    "{{nombre}} es un marcador para desarrollo: mapearlo al campo real del usuario y sustituirlo de forma segura antes del envío. La integración no está implementada en este borrador.",
  ],
  sections: [
    s("title", { text: "¡SubasTop evoluciona! Conoce nuestras nuevas modalidades y condiciones" }), gap(),
    paragraph("__Hola, {{nombre}}__"), gap("12"),
    paragraph("En __VMC Subastas__ seguimos trabajando para ofrecerte una experiencia de compra y venta de vehículos más clara, segura y transparente."), gap("12"),
    paragraph("Por eso, __hemos actualizado nuestras Condiciones y Términos__, incorporando precisiones sobre el funcionamiento de la plataforma y las responsabilidades de los usuarios."), gap("22"),
    bodyLabel("__¿Qué encontrarás en esta actualización?__"), gap("12"),
    s("list", {
      i1: "__Usuarios y Oferta Basic:__ Información sobre las cuentas de vendedores particulares y sus publicaciones en plataforma",
      i2: "__Mayor claridad en las negociaciones para ofertas Basic:__ información sobre la presentación y aceptación de ofertas.",
      i3: "__Condiciones de pago más transparentes:__ precisiones sobre los cargos aplicables y las condiciones para realizar una compraventa.",
      i4: "__Mejores pautas de coordinación:__ reglas para utilizar los canales de comunicación de la plataforma y realizar las verificaciones correspondientes.",
    }), gap("22"),
    paragraph("Te invitamos a revisar las condiciones completas para conocer cómo se aplican. Recuerda que entrarán en vigencia desde el xx/12/2026"), gap("24"),
    s("cta", { text: "Revisar nuevas condiciones", url: "{{url_nuevas_condiciones}}", variant: "secondary" }), gap("22"),
    paragraph("Si tienes alguna consulta, nuestro equipo de atención estará disponible para orientarte."), gap("12"),
    paragraph("¡Gracias por ser parte de VMC Subastas!"), gap("18"),
    paragraph("Equipo VMC"), gap("24"),
  ],
};
