/* eslint-disable @typescript-eslint/no-require-imports -- This CLI registers a TypeScript CommonJS loader without changing the app toolchain. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const ts = require("typescript");
require.extensions[".ts"] = function(module, filename) {
  const code = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  module._compile(output, filename);
};
const { EMAIL_DRAFTS, isDraftReadyForDevelopment, renderDraft, renderDraftBase } = require("../src/emails/drafts/index.ts");
const { renderDraftSection } = require("../src/emails/drafts/shared.ts");
const { linkDraftHelpButton, DRAFT_HELP_URL } = require("../src/emails/drafts/helpLink.ts");
const { generateEmail } = require("../src/emails/prodEmailTemplates.ts");
const { EMAILS } = require("../src/emails/prodEmails.ts");
const { BANNER_OPTIONS, FOOTER_OPTIONS } = require("../src/emails/headerSwap.ts");
assert.equal(EMAIL_DRAFTS.length, 5);
assert.equal(new Set(EMAIL_DRAFTS.map(d=>d.id)).size, 5);
assert.deepEqual(EMAIL_DRAFTS.filter(d => isDraftReadyForDevelopment(d.id)).map(d => d.id), ["valorizacion-publicacion", "publicacion-revision", "publicacion-exitosa"], "Only the three emails validated by Julio are ready for development");
assert.deepEqual(EMAIL_DRAFTS.filter(d => !isDraftReadyForDevelopment(d.id)).map(d => d.id), ["condiciones-aviso-previo", "condiciones-vigentes"], "Both legal notices must remain pending");
assert.equal(isDraftReadyForDevelopment("unknown-email"), false);
assert.deepEqual(EMAIL_DRAFTS.filter(d => isDraftReadyForDevelopment(d.id)).map(d => d.trigger), [
  "Cuando el usuario termina la valorización de su vehículo y la guarda.",
  "Cuando el usuario acaba de publicar su vehículo y la publicación queda en revisión.",
  "Cuando la publicación supera la revisión, se aprueba y queda publicada.",
], "Development triggers must match Julio's confirmed flow");
for (const d of EMAIL_DRAFTS) {
  assert(!EMAILS.some(e=>e.id===d.id), "Draft leaked into production");
  assert(d.pending.length > 0);
  assert(BANNER_OPTIONS.some(b=>b.id===d.preset.banner));
  assert(FOOTER_OPTIONS.some(b=>b.id===d.preset.footer));
  assert.equal(d.sections.filter(s=>s.type==="cta").length, 1);
  const html = renderDraft(d);
  if (d.trigger) {
    assert(!html.includes(d.trigger), "Development trigger leaked into recipient-facing HTML");
    assert(!renderDraftBase(d).includes(d.trigger), "Development trigger leaked into the editable email body");
  }
  assert(html.includes("BORRADOR"));
  assert(html.includes(d.bannerTitle));
  assert(html.includes(d.preheader));
  const visibleDraftCopy = [d.subject, d.preheader, d.bannerTitle, html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ")].join(" ");
  // Preserve the existing SubasBlog resource title; it is not publication copy.
  assert(!/\bautos?\b/i.test(visibleDraftCopy.replace("SubasBlog: La guía definitiva de subastas y venta de autos", "SubasBlog")), "Draft copy must include all vehicles, including motorcycles: " + d.id);
  assert(html.includes("Tipología:"));
  assert(html.includes("Footer: Centro de Ayuda compact"), "The real Compacto footer was not applied");
  assert(!html.includes("¡Despierta al cazador de ofertas que hay en ti!"), "The buyer footer leaked into a seller draft");
  assert(!html.includes("{{ Título del correo }}"));
  assert(!html.includes(">undefined<"));
  const mainTitleCount = html.split("</head>")[1].split(d.bannerTitle).length - 1;
  assert.equal(mainTitleCount, 1, "Banner title duplicated in body");
  assert(/class="vmc-email-draft(?: vmc-email-draft-legal)?"/.test(renderDraftBase(d)));
  if (d.id !== "publicacion-revision" && d.id !== "valorizacion-publicacion") assert(html.includes("{{url_"));
  const greeting = d.sections.find(section => section.type === "text");
  assert.equal(greeting.content.text.replace(/__/g, ""), "Hola, {{nombre}}", "All five drafts need the personalized greeting");
  assert(/<strong[^>]*>Hola, \{\{nombre\}\}<\/strong>/.test(html), "The complete greeting must be bold in all five drafts");
  for (const footer of [...FOOTER_OPTIONS.map(option => option.id), "original"]) {
    const variantHtml = renderDraft({ ...d, preset: { ...d.preset, footer } });
    const helpLinks = (variantHtml.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) || []).filter(anchor => anchor.replace(/<[^>]*>/g, "").trim() === "¡Vamos!");
    assert.equal(helpLinks.length, 1, "Exactly one clickable Help CTA is required: " + d.id + "/" + footer);
    assert(helpLinks[0].includes(`href="${DRAFT_HELP_URL}"`), "Wrong Help destination");
    assert.equal(linkDraftHelpButton(variantHtml), variantHtml, "Help-link transformation must be idempotent");
  }
}
for (const email of EMAILS) {
  const productionHtml = email.html || generateEmail(email.sections, email.subject);
  assert.equal(linkDraftHelpButton(productionHtml), productionHtml, "Draft links must not change production: " + email.id);
}
const review = EMAIL_DRAFTS.find(d=>d.id==="publicacion-revision");
const published = EMAIL_DRAFTS.find(d=>d.id==="publicacion-exitosa");
const valuation = EMAIL_DRAFTS.find(d=>d.id==="valorizacion-publicacion");
assert.equal(valuation.bannerTitle, "¡Ya valorizaste tu vehículo! Estás a un paso de encontrar el precio que buscas.");
assert.equal(valuation.sections.find(section => section.type === "title").content.text, valuation.bannerTitle);
assert.deepEqual(valuation.sections.filter(section => section.type === "text").map(section => renderDraftSection(section).replace(/<[^>]*>/g, "").trim()), [
  "Hola, {{nombre}}",
  "Acabas de valorizar tu vehículo. Ahora da el siguiente paso: publícalo en VMC Subastas con la modalidad Negociable y recibe ofertas sin comisiones, ni intermediarios.",
  "Tú defines tu expectativa de venta. Los compradores verificados podrán enviarte propuestas que puedes aceptar, contraproponer o rechazar. ¡Tú decides con cuál avanzar!",
  "Tu vehículo, tu precio, tu trato.",
]);
const valuationPanel = valuation.sections.find(section => section.type === "panel");
assert.equal(valuationPanel.content.title, "¡Un solo pago hasta que lo vendas!");
assert.equal(valuationPanel.content.align, "center");
assert.equal(valuationPanel.content.titleSize, "20");
assert.equal(valuationPanel.content.variant, "publication-benefit");
assert.equal(valuationPanel.content.body, "Publica por tan solo [[>S< 25]] SubasCoins y mantén la publicación hasta que vendas tu vehículo.");
assert(renderDraftSection(valuationPanel).includes("&gt;S&lt; 25"), "Use the existing Concorde SubasCoins symbol with HTML-safe escaping");
const valuationCta = valuation.sections.find(section => section.type === "cta");
assert.equal(valuationCta.content.text, "¡Publica ahora!");
assert.equal(valuationCta.content.url, "https://www.vmcsubastas.com/zona/publicar");
assert(renderDraft(valuation).includes('href="https://www.vmcsubastas.com/zona/publicar"'), "The requested publication destination must be present in exported HTML");
assert(!renderDraft(valuation).includes("{{url_publicar_vehiculo}}"), "The resolved publication CTA must not retain its old placeholder");
assert(!valuation.sections.some(section => section.type === "steps"), "Email 01 must not add publication steps");
const valuationVideo = valuation.sections.find(section => section.type === "video");
assert(valuationVideo, "The requested publication video must appear in email 01");
assert.equal(valuation.sections.filter(section => section.type === "video").length, 1);
assert.equal(valuationVideo.content.url, "/correos/borradores/valorizacion-publicacion/vende-spot-v7-v7.mp4");
assert.equal(valuationVideo.content.poster, "/correos/borradores/valorizacion-publicacion/poster.jpg");
assert(valuation.sections.indexOf(valuationPanel) < valuation.sections.indexOf(valuationVideo), "Publication benefits must precede the video");
const afterValuationVideo = valuation.sections.slice(valuation.sections.indexOf(valuationVideo) + 1).filter(section => section.type !== "spacer");
const valuationTagline = valuation.sections.find(section => section.content.text === "Tu vehículo, tu precio, tu trato.");
assert.equal(valuationTagline.content.align, "center");
assert.deepEqual(afterValuationVideo, [valuationTagline, valuationCta], "The video must be followed by the centered tagline and ¡Publica ahora!, without steps");
assert(/<strong[^>]*>Negociable<\/strong>/.test(renderDraft(valuation)));
assert(/<strong[^>]*>publícalo en VMC Subastas<\/strong>/.test(renderDraft(valuation)));
assert(/<strong[^>]*>Tú defines tu expectativa de venta\.<\/strong>/.test(renderDraft(valuation)));
const valuationVideoBytes = fs.readFileSync(path.join(__dirname, "../public", valuationVideo.content.url));
assert.equal(createHash("sha256").update(valuationVideoBytes).digest("hex"), "f764d1ae235fe1ea4748139721df60c5ca619085dc080c7d524f3f0a9abd31f0", "The video must be the exact requested file, without transcoding");
assert(fs.existsSync(path.join(__dirname, "../public", valuationVideo.content.poster)));
assert(!renderDraft(valuation).includes("<video"), "Email must use a linked poster, not an embedded video");
assert(valuation.pending.some(note => note.includes("URLs públicas HTTPS verificadas")), "Hosting must remain explicitly pending");
assert.deepEqual(review.preset, published.preset, "Emails 02 and 03 must use the same banner design and tone");
assert.equal(review.preset.banner, "texto-centrado");
assert.equal(review.preset.tone, "negotiable");
assert.equal(valuation.preset.tone, "proximas", "Valuation must retain its purple banner");
assert.equal(review.subject, "Tu publicación está en revisión");
assert.equal(review.bannerTitle, "¡Tu publicación está en revisión y pronto podrás recibir ofertas!");
assert.equal(review.sections.find(section => section.type === "title").content.text, review.bannerTitle);
const reviewHtml = renderDraft(review);
const reviewCta = review.sections.find(section => section.type === "cta");
assert.equal(reviewCta.content.text, "¡Ir a mi Garaje!");
assert.equal(reviewCta.content.url, "https://www.vmcsubastas.com/zona");
assert(!reviewHtml.includes("{{url_estado_publicacion}}"));
assert(/<a href="https:\/\/www\.vmcsubastas\.com\/zona"[^>]*color:#3b1782;[^>]*>Mi Garaje<\/a>/.test(reviewHtml), "Mi Garaje must be an actual purple link to Julio's exact URL");
const reviewStrong = reviewHtml.match(/<strong\b[^>]*>/g) || [];
assert(reviewStrong.length >= 3 && reviewStrong.every(tag => tag.includes("color:#3b1782;")), "All email02 bold emphasis must use Concorde vault purple");
for (const fragment of ["revisando tu publicación", "Mantente atento a tu teléfono y/o correo", "notificación en la campana", "Mi Garaje", "Mis publicaciones"]) {
  assert(reviewHtml.includes(fragment), "Missing requested review information: " + fragment);
}
for (const fragment of ["hasta 1 día hábil", "lunes a viernes", "sábados, domingos ni feriados", "Cuánto demora", "48 horas", "Un paso más para recibir ofertas"]) {
  assert(!reviewHtml.includes(fragment), "Removed review copy returned: " + fragment);
}
assert(!/tiempo de revisión|día hábil|48 horas/.test(review.preheader));
const reviewImage = review.sections.find(section => section.type === "image");
assert(reviewImage, "Email02 needs the requested Mi Garaje visual");
const reviewBeforeImage = review.sections.slice(0, review.sections.indexOf(reviewImage)).filter(section => section.type !== "spacer").at(-1);
assert.equal(reviewBeforeImage.type, "text");
assert.equal(reviewBeforeImage.content.text, "__Mantente atento a tu teléfono y/o correo__. Si necesitamos confirmar algún dato de tu vehículo, podremos contactarte por esos medios.", "Only the attention lead must be bold in its paragraph immediately above the phone image");
const reviewParagraphs = review.sections.filter(section => section.type === "text");
assert.equal(reviewParagraphs.length, 3, "Review email needs greeting, joined review/notification copy, and separate attention paragraph");
assert(reviewParagraphs[1].content.text.includes("__Mis publicaciones__. Cuando se publique, recibirás"), "Notification sentence must follow Mis publicaciones in the same paragraph");
assert(/<strong[^>]*>Mantente atento a tu teléfono y\/o correo<\/strong>\. Si necesitamos confirmar algún dato de tu vehículo, podremos contactarte por esos medios\./.test(reviewHtml), "Only the requested attention lead must render in bold; its continuation must be normal");
assert(!review.sections.some(section => section.type === "panel"), "Review attention copy must not return as a bubble or panel");
assert(fs.existsSync(path.join(__dirname, "../public", reviewImage.content.url)));
assert(reviewImage.content.alt.includes("Ejemplo"), "Demo visual must not imply the recipient is already approved");
assert(reviewImage.content.alt.includes("una sola publicación") && reviewImage.content.alt.includes("header VMC completo"));
const reviewVisual = JSON.parse(fs.readFileSync(path.join(__dirname, "../public/correos/borradores/publicacion-revision/mobile-capture.json"), "utf8"));
assert.equal(reviewVisual.qa.visibleVehicleCount, 1);
assert.equal(reviewVisual.qa.header.y, 0);
assert(reviewVisual.qa.badge.x >= reviewVisual.qa.name.right - 1, "Review badge must stay right-aligned without overlap");
assert(!reviewVisual.qa.overflow);
assert(!reviewVisual.annotationQa.overlapsHeader && !reviewVisual.annotationQa.overlapsPublication);
assert(!reviewVisual.annotationQa.upperLabelPresent);
assert.equal(reviewVisual.annotationQa.caption, "Ejemplo basado en la interfaz de VMC");
assert.equal(reviewVisual.pointerQa.target, "EN REVISIÓN");
assert.equal(reviewVisual.pointerQa.gap, 7);
assert.equal(reviewVisual.pointerQa.targetY, reviewVisual.pointerQa.badgeCenterY);
assert.equal(reviewVisual.nextState.label, "PUBLICADA");
assert(reviewVisual.nextState.classes.includes("badgestatus--live"), "Next-state badge must come from Mi Garaje's real published component");
assert(reviewVisual.nextState.placement.includes("si se aprueba"), "Next state must be explicitly conditional");
assert(!reviewVisual.sectionText.includes("PUBLICADA"), "The publication inside the phone must remain under review");
assert(reviewImage.content.alt.includes("solo si se aprueba"));
for (const file of reviewVisual.files) {
  const bytes = fs.readFileSync(path.join(__dirname, "../public/correos/borradores/publicacion-revision", file.file));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256, "Example image provenance must match its bytes");
}
assert(review.pending.some(note => note.includes("aviso de aprobación") || note.includes("notificación")));
const legal = EMAIL_DRAFTS.filter(d=>d.id.startsWith("condiciones"));
assert(legal.every(d=>d.pending.some(s=>/versión|version/i.test(s))));
const priorNotice = legal.find(d=>d.id==="condiciones-aviso-previo");
assert.equal(priorNotice.subject, "¡SubasTop evoluciona! Conoce nuestras nuevas modalidades y condiciones");
const expectedCopy = [
  "Hola, {{nombre}}",
  "En VMC Subastas seguimos trabajando para ofrecerte una experiencia de compra y venta de vehículos más clara, segura y transparente.",
  "Por eso, hemos actualizado nuestras Condiciones y Términos, incorporando precisiones sobre el funcionamiento de la plataforma y las responsabilidades de los usuarios.",
  "¿Qué encontrarás en esta actualización?",
  "Usuarios y Oferta Basic: Información sobre las cuentas de vendedores particulares y sus publicaciones en plataforma",
  "Mayor claridad en las negociaciones para ofertas Basic: información sobre la presentación y aceptación de ofertas.",
  "Condiciones de pago más transparentes: precisiones sobre los cargos aplicables y las condiciones para realizar una compraventa.",
  "Mejores pautas de coordinación: reglas para utilizar los canales de comunicación de la plataforma y realizar las verificaciones correspondientes.",
  "Te invitamos a revisar las condiciones completas para conocer cómo se aplican. Recuerda que entrarán en vigencia desde el xx/12/2026",
  "Si tienes alguna consulta, nuestro equipo de atención estará disponible para orientarte.",
  "¡Gracias por ser parte de VMC Subastas!",
  "Equipo VMC",
];
const actualCopy = priorNotice.sections.flatMap(section => {
  if (section.type === "text") return [section.content.text];
  if (section.type === "list") return ["i1", "i2", "i3", "i4"].map(key => section.content[key]);
  return [];
}).map(text => text.replace(/__/g, ""));
assert.deepEqual(actualCopy, expectedCopy, "The prior notice must preserve Julio's supplied copy, order and wording");
const priorHtml = renderDraft(priorNotice);
const priorBoldPhrases = Array.from(priorHtml.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/g), match => match[1]);
assert.deepEqual(priorBoldPhrases, [
  "Hola, {{nombre}}",
  "VMC Subastas",
  "hemos actualizado nuestras Condiciones y Términos",
  "¿Qué encontrarás en esta actualización?",
  "Usuarios y Oferta Basic:",
  "Mayor claridad en las negociaciones para ofertas Basic:",
  "Condiciones de pago más transparentes:",
  "Mejores pautas de coordinación:",
], "Email 04 must preserve Silvana's bold phrases, the personalized greeting and Julio's two later introductory emphases");
const priorCta = priorNotice.sections.find(section => section.type === "cta");
assert.equal(priorCta.content.variant, "secondary", "Email 04 must use Concorde's purple Secondary button");
const purpleCtaHtml = renderDraftSection(priorCta);
assert(purpleCtaHtml.includes("linear-gradient(160deg,#8460e5 0%,#3b1782 100%)"));
assert(purpleCtaHtml.includes("linear-gradient(135deg,#cfbaff 0%,#ffffff 35%,#ae8eff 65%,#cfbaff 100%)"));
assert(!purpleCtaHtml.includes("#ed8936"), "Orange primary CTA must not return in email 04");
assert.equal(priorCta.content.text, "Revisar nuevas condiciones");
assert.equal(priorCta.content.url, "{{url_nuevas_condiciones}}");
assert(priorHtml.includes(purpleCtaHtml), "Purple CTA missing from export");
assert(EMAIL_DRAFTS.filter(draft => !draft.id.startsWith("condiciones")).every(draft => draft.sections.filter(section => section.type === "cta").every(section => section.content.variant !== "secondary")), "Only emails 04 and 05 requested purple CTAs");
const visiblePriorCopy = priorHtml.replace(/<\/(?:p|h[1-6]|td|tr|div)>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
for (const paragraph of expectedCopy) assert(visiblePriorCopy.includes(paragraph), "Missing supplied copy: " + paragraph);
assert(priorNotice.pending.some(note => note.includes("xx/12/2026") && note.includes("no una fecha confirmada")));
assert(priorNotice.pending.some(note => note.includes("PDF") && note.includes("no se ha proporcionado ni adjuntado")));
assert(!priorHtml.includes("Adjuntar las Nuevas CyT"), "Internal attachment task leaked into email body");
assert(priorHtml.includes("Hola, {{nombre}}"), "The latest instruction requires a personalized greeting");
const effectiveNotice = legal.find(d=>d.id==="condiciones-vigentes");
const effectiveCta = effectiveNotice.sections.find(section => section.type === "cta");
assert.equal(effectiveCta.content.variant, "secondary", "Email 05 must use Concorde's purple Secondary button");
assert.equal(effectiveCta.content.text, "Ingresar VMC");
assert.equal(effectiveCta.content.url, "{{url_ingresar_vmc}}");
assert(renderDraftSection(effectiveCta).includes("linear-gradient(160deg,#8460e5 0%,#3b1782 100%)"));
assert.equal(priorNotice.bannerTitle, "¡SubasTop evoluciona! Conoce nuestras nuevas modalidades y condiciones");
assert.equal(effectiveNotice.bannerTitle, "¡Nuestras nuevas Condiciones y Términos ya están vigentes!");
for (const notice of legal) {
  assert.equal(notice.preset.banner, "texto-apilado");
  assert.equal(notice.preset.tone, "dark");
  const noticeHtml = renderDraft(notice);
  assert(noticeHtml.includes('class="vmc-email-draft vmc-email-draft-legal"'));
  assert(noticeHtml.includes('src="/logo-correos2.svg"'), "Legal heroes must use the current VMC logo asset");
  assert(!noticeHtml.includes("vmcsubastas-mail-header.png"), "Legacy mailing header leaked into legal notice");
  assert(!noticeHtml.includes(">>vmc<"), "A reconstructed legacy wordmark leaked into legal notice");
  assert(noticeHtml.includes("font-size:24px !important; line-height:1.2 !important"));
}
for (const draft of EMAIL_DRAFTS.filter(d => !d.id.startsWith("condiciones"))) {
  assert(renderDraftBase(draft).includes('class="vmc-email-draft"'), "Legal hero styling must not affect other drafts");
}
assert.equal(effectiveNotice.subject, "Nuestras nuevas Condiciones y Términos ya están vigentes.");
const expectedEffectiveCopy = [
  "Hola, {{nombre}}",
  "En VMC Subastas seguimos mejorando tu experiencia en nuestra plataforma.",
  "Te informamos que nuestras nuevas Condiciones y Términos ya se encuentran vigentes, incorporando nuevas disposiciones relacionadas con los Usuarios Basic, las Ofertas Basic, los procesos de negociación y las condiciones aplicables a las operaciones realizadas en la plataforma.",
  "¿Qué debes hacer ahora?",
  "Para continuar utilizando VMC Subastas bajo las nuevas condiciones, deberás revisarlas y confirmar tu aceptación directamente desde la plataforma.",
  "Sigue estos sencillos pasos:",
  "Inicia sesión en tu cuenta de VMC Subastas.",
  "Revisa las nuevas Condiciones y Términos: al ingresar, aparecerá automáticamente una ventana con el documento actualizado.",
  "Desplázate hasta el final del documento para habilitar la opción de aceptar.",
  "Haz clic en «Aceptar» para registrar tu conformidad con las nuevas Condiciones y Términos.",
  "Una vez completado este proceso, podrás continuar utilizando la plataforma conforme a las condiciones actualizadas.",
  "Ingresar VMC",
  "Si tienes alguna consulta o necesitas asistencia durante el proceso, nuestro equipo de atención estará disponible para ayudarte.",
  "¡Gracias por ser parte de VMC Subastas!",
  "Equipo VMC Subastas",
];
const actualEffectiveCopy = effectiveNotice.sections.flatMap(section => {
  if (section.type === "text" || section.type === "cta") return [section.content.text];
  if (section.type === "steps") return ["s1", "s2", "s3", "s4"].map(key => section.content[key].replace("|", " "));
  return [];
}).map(text => text.replace(/__/g, ""));
assert.deepEqual(actualEffectiveCopy, expectedEffectiveCopy, "The effective notice must preserve Julio's full supplied body and four exact steps");
const effectiveSteps = effectiveNotice.sections.find(section=>section.type==="steps");
assert.equal(Object.keys(effectiveSteps.content).filter(key=>/^s\d+$/.test(key) && effectiveSteps.content[key]).length, 4);
const effectiveHtml = renderDraft(effectiveNotice);
assert(/<strong[^>]*>Hola, \{\{nombre\}\}<\/strong>/.test(effectiveHtml), "The complete greeting in email 05 must be bold");
assert(!effectiveHtml.includes("opción de aceptación"), "Step 3 must use the requested word aceptar");
const visibleEffectiveCopy = effectiveHtml.replace(/<\/(?:p|h[1-6]|td|tr|div)>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
for (const paragraph of expectedEffectiveCopy) assert(visibleEffectiveCopy.includes(paragraph), "Missing supplied effective notice copy: " + paragraph);
assert(!/si este paso aplica|si aplica|si corresponde/i.test(effectiveHtml), "An invented conditional acceptance disclaimer leaked into the supplied body");
assert(effectiveNotice.pending.some(note=>note.includes("nueva versión final") && note.includes("entrada en vigencia real")));
assert(effectiveNotice.pending.some(note=>note.includes("flujo de aceptación") && note.includes("ventana automática") && note.includes("«Aceptar»")));
for (const note of effectiveNotice.pending) assert(!effectiveHtml.includes(note), "Pre-send verification notes leaked into the email body");
console.log("PASS: 5 drafts; separate from "+EMAILS.length+" production templates; real banners; 1 CTA each; preheaders; pending variables; no duplicate headlines; legal/review guards.");
