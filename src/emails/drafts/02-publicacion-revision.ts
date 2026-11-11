import { s, gap, button, type EmailDraft } from "./shared";

export const publicacionRevision: EmailDraft = {
  id: "publicacion-revision",
  name: "02 — Publicación en revisión",
  subject: "Tu publicación está en revisión",
  preheader: "El equipo de VMC está revisando tu publicación. Sigue su estado en Mi Garaje, en Mis publicaciones.",
  bannerTitle: "¡Tu publicación está en revisión y pronto podrás recibir ofertas!",
  category: "Publicación particular",
  preset: { banner: "texto-centrado", footer: "footer-compact", tone: "negotiable" },
  concept: "Aviso breve de revisión, sin plazo. Incluye un ejemplo móvil completo de Mi Garaje dentro de un iPhone: header VMC y campana originales, una sola publicación y badge En revisión a la derecha. Las demás secciones quedan cerradas. En una nubecita visual aparece el badge real PUBLICADA como siguiente estado, condicionado a la aprobación. La composición está identificada como ejemplo y no representa la cuenta ni una aprobación del destinatario.",
  source: "Indicación final de Julio del 10/11/2026: ejemplo concreto, no screenshot literal, con header completo y una publicación. Basado en la demo local mi-garaje-lab, commit c880184, /m/vmc?propuesta=0&llegada=publicacion&pag=glass, viewport 390 × 760. Conserva header, logo, campana, secciones, fotografía y badge originales. Solo en la composición se ocultan datos de cuenta y promociones, se cierran otras secciones, se deja una fila y se ajusta su layout para que el badge quede íntegro a la derecha. El badge PUBLICADA se captura de una fila nativa y se presenta en una nubecita sobre el espacio libre inferior, sin tapar el header ni la fila, con el texto «Siguiente estado, si se aprueba». Julio confirma que se recibirá una notificación en la campana cuando se publique; se explica ese comportamiento sin inventar el texto del aviso. No se modifica Mi Garaje ni una cuenta real.",
  pending: [
    "Verificar el estado real y que el disparador solo se ejecute tras recibir la publicación.",
    "Comprobar la ruta https://www.vmcsubastas.com/zona y la experiencia del usuario autenticado antes de enviar.",
    "Comprobar el disparador y la entrega real de la notificación al publicarse, según el comportamiento confirmado por Julio. El ejemplo conserva la campana original, sin inventar el texto específico del aviso.",
    "Antes de enviar, alojar la imagen en una URL pública HTTPS verificada y comprobarla en clientes de correo. La ruta actual es solo para revisión local.",
  ],
  sections: [
    s("title", { text: "¡Tu publicación está en revisión y pronto podrás recibir ofertas!" }), gap(),
    s("text", { text: "__Hola, {{nombre}}__", size: "lg", emphasisColor: "vault" }), gap("12"),
    s("text", { text: "El equipo de VMC está __revisando tu publicación__. Puedes seguir su estado en {[Mi Garaje|https://www.vmcsubastas.com/zona]}, en la sección __Mis publicaciones__. Cuando se publique, recibirás una __notificación en la campana__ de la parte superior de Mi Garaje.", size: "lg", emphasisColor: "vault" }), gap("12"),
    s("text", { text: "__Mantente atento a tu teléfono y/o correo__. Si necesitamos confirmar algún dato de tu vehículo, podremos contactarte por esos medios.", size: "lg", emphasisColor: "vault" }), gap("22"),
    s("image", {
      url: "/correos/borradores/publicacion-revision/mi-garaje-iphone.png",
      alt: "Ejemplo móvil de Mi Garaje dentro de un iPhone: header VMC completo con campana, una sola publicación Toyota Corolla 2019 y badge En revisión a la derecha. Una nubecita visual muestra el badge PUBLICADA como siguiente estado solo si se aprueba, sin tapar la interfaz. Ejemplo basado en la interfaz de VMC; no representa una cuenta real ni una aprobación del destinatario.",
      width: "500",
    }), gap("24"),
    button("¡Ir a mi Garaje!", "https://www.vmcsubastas.com/zona"), gap("24"),
  ],
};
