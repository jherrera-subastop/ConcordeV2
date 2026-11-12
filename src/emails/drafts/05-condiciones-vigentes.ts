import { s, gap, paragraph, bodyLabel, type EmailDraft } from "./shared";

export const condicionesVigentes: EmailDraft = {
  id: "condiciones-vigentes",
  name: "05 · Condiciones ya vigentes",
  subject: "Nuestras nuevas Condiciones y Términos ya están vigentes.",
  preheader: "Revisa las nuevas Condiciones y Términos y confirma tu aceptación desde la plataforma.",
  bannerTitle: "¡Nuestras nuevas Condiciones y Términos ya están vigentes!",
  category: "Condiciones y Términos",
  preset: { banner: "texto-apilado", footer: "footer-compact", tone: "dark" },
  concept: "Banner apilado Dark de Concorde, hermano del aviso previo. Conserva el cuerpo y los cuatro pasos del borrador proporcionado por Julio.",
  source: "Borrador proporcionado por Julio el 09/11/2026: cuerpo y cuatro pasos restituidos sin cambios de redacción. No confirma que las futuras condiciones ya estén vigentes hoy.",
  pending: [
    "ANTES DE ENVIAR: verificar la nueva versión final de las Condiciones y Términos, su entrada en vigencia real y el público destinatario.",
    "ANTES DE ENVIAR: verificar el flujo de aceptación descrito por Julio, incluida la ventana automática, el desplazamiento hasta el final y el botón «Aceptar». El texto se conserva como borrador, no como una comprobación del funcionamiento actual.",
    "Sustituir {{url_ingresar_vmc}} por el destino autenticado real y verificar el escape seguro y la sustitución de {{nombre}}.",
  ],
  sections: [
    s("title", { text: "¡Nuestras nuevas Condiciones y Términos ya están vigentes!" }), gap(),
    paragraph("__Hola, {{nombre}}__"), gap("12"),
    paragraph("En __VMC Subastas__ seguimos mejorando tu experiencia en nuestra plataforma."), gap(),
    paragraph("Te informamos que nuestras __nuevas Condiciones y Términos ya se encuentran vigentes__, incorporando nuevas disposiciones relacionadas con los Usuarios Basic, las Ofertas Basic, los procesos de negociación y las condiciones aplicables a las operaciones realizadas en la plataforma."), gap(),
    bodyLabel("__¿Qué debes hacer ahora?__"), gap("12"),
    paragraph("Para continuar utilizando VMC Subastas bajo las nuevas condiciones, deberás revisarlas y confirmar tu aceptación directamente desde la plataforma."), gap(),
    bodyLabel("__Sigue estos sencillos pasos:__"), gap("12"),
    s("steps", {
      s1: "Inicia sesión|en tu cuenta de VMC Subastas.",
      s2: "Revisa las nuevas Condiciones y Términos:|al ingresar, aparecerá automáticamente una ventana con el documento actualizado.",
      s3: "Desplázate hasta el final del documento|para habilitar la opción de aceptar.",
      s4: "Haz clic en «Aceptar»|para registrar tu conformidad con las nuevas Condiciones y Términos.",
    }), gap("24"),
    paragraph("Una vez completado este proceso, podrás continuar utilizando la plataforma conforme a las condiciones actualizadas."), gap(),
    s("cta", { text: "Ingresar VMC", url: "{{url_ingresar_vmc}}", variant: "secondary" }), gap("22"),
    paragraph("Si tienes alguna consulta o necesitas asistencia durante el proceso, nuestro equipo de atención estará disponible para ayudarte."), gap("12"),
    paragraph("¡Gracias por ser parte de VMC Subastas!"), gap("12"),
    paragraph("Equipo VMC Subastas"), gap("24"),
  ],
};
