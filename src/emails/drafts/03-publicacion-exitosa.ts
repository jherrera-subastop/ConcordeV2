import { s, gap, paragraph, type EmailDraft } from "./shared";

// Cuerpo recuperado de «Oferta publicada — vendedor (tutorial)»:
// src/emails/prodEmails.ts, OFERTA_PUBLICADA_SECTIONS, commit 83f8032.
// Se conserva el tutorial vigente, derivado del correo de Julio en e5896f4.
// Cambian el título, los merge tags y las referencias genéricas de auto a vehículo.
const title = "¡Tu vehículo ya está publicado! Prepárate para recibir ofertas";

export const publicacionExitosa: EmailDraft = {
  id: "publicacion-exitosa",
  name: "03 · Publicación exitosa",
  subject: title,
  preheader: "Ingresa a “Mi Garaje” y administra las propuestas de los compradores",
  bannerTitle: title,
  category: "Negociable",
  trigger: "Cuando la publicación supera la revisión, se aprueba y queda publicada.",
  preset: { banner: "texto-centrado", footer: "footer-compact", tone: "negotiable" },
  concept: "Recupera el cuerpo de Oferta publicada — vendedor: anuncio, siete pasos, recordatorio de 24 horas, video tutorial de 47 segundos y acceso a Mi Garaje. Conserva el banner centrado Negociable y el footer Compacto de los borradores. Sin cifras de compradores ni promesas nuevas.",
  source: "Solicitud de Julio del 10/11/2026: traer el correo existente con su video y siete pasos y mejorar el título. Fuente literal: src/emails/prodEmails.ts, OFERTA_PUBLICADA_SECTIONS, commit 83f8032f521c32695aa2c3a3732b800a504c1dfc (06/11/2026), evolución del texto de Julio en e5896f4a7b0f9c3d9f8b0c8161050de53a0c97e3. Se revisó boletines/glassNegociable.ts como referencia; no se altera el diseño de los borradores ni el correo de producción.",
  pending: [
    "Verificar en el backend la aprobación y el paso al estado «Publicada».",
    "Sustituir {{url_mi_garaje}} y probar el aterrizaje autenticado. Destino de la plantilla recuperada: https://www.vmcsubastas.com/zona.",
    "Validar {{nombre}}, el recorrido de los siete pasos y la vigencia de 24 horas antes del envío.",
    "Comprobar el poster y el enlace al video tutorial de la plantilla original en los clientes de correo finales.",
  ],
  sections: [
    s("title", { eyebrow: "", text: title }), gap("24"),
    s("text", { text: "__Hola, {{nombre}}__", size: "lg", emphasisColor: "vault" }), gap("8"),
    paragraph("¡Excelentes noticias! La publicación de tu vehículo ya está activa."), gap("8"),
    s("text", { text: "A partir de ahora, tendrás el control directo de tu proceso. Ingresa a la sección de **Negociaciones** dentro de {[**“Mi Garaje”**|https://www.vmcsubastas.com/zona]} y negocia a tu manera.", size: "lg", emphasisColor: "vault" }), gap("20"),
    s("steps", {
      s1: "Toca tu perfil|Arriba a la derecha",
      s2: "Baja a Mis negociaciones|En Tu actividad",
      s3: "Toca «En venta»|Ahí llegan tus propuestas",
      s4: "Toca tu vehículo|Ves tus propuestas y su plazo",
      s5: "Acepta, contrapropón o rechaza|Tienes 24 horas",
      s6: "Aceptas una propuesta|Las demás propuestas se cierran",
      s7: "Coordina por el SubasChat|Directo con el comprador",
    }), gap("16"),
    s("note", {
      icon: "⏳",
      title: "Dato clave:",
      size: "lg",
      emphasisColor: "vault",
      body: "Tendrás **24 horas** para responder las propuestas de los compradores, antes de que expiren. ¡Mantente atento para mantener la negociación activa!",
    }), gap("28"),
    s("text", { size: "lg", align: "center", text: "Mira este video para descubrir cómo dominar la negociación en VMC:" }), gap("24"),
    s("video", {
      url: "https://concorde-v2-theta.vercel.app/correos/negociacion-tutorial/video.mp4",
      poster: "https://concorde-v2-theta.vercel.app/correos/negociacion-tutorial/poster.jpg",
      width: "300",
      caption: "Ver tutorial · 47 s",
      alt: "Video tutorial: ¿Te llegó una propuesta? Así la respondes, paso a paso",
    }), gap("32"),
    s("cta", { text: "Ir a Mi Garaje", url: "{{url_mi_garaje}}", variant: "glass" }), gap("32"),
  ],
};
