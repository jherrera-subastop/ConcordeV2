/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression check for email 03. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
require.extensions[".ts"] = function(module, filename) {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  module._compile(output, filename);
};
const { publicacionExitosa: draft } = require("../src/emails/drafts/03-publicacion-exitosa.ts");
const { renderDraft } = require("../src/emails/drafts/shared.ts");
const { EMAILS } = require("../src/emails/prodEmails.ts");
const original = EMAILS.find(email => email.id === "oferta-publicada-vendedor");
assert(original, "Missing original seller publication email");
// Only the headline, draft merge tags, vehicle wording, requested inline link and emphasis style may differ.
const expectedSections = original.sections.map(section => {
  const content = { ...section.content };
  if (section.type === "title") content.text = draft.bannerTitle;
  if (content.text === "Hola {{Nombre usuario.Ejem: Gabriel Bruno}},") content.text = "__Hola, {{nombre}}__";
  if (section.type === "cta") content.url = "{{url_mi_garaje}}";
  if (content.text === "¡Excelentes noticias! La publicación de tu auto ya está activa.") content.text = "¡Excelentes noticias! La publicación de tu vehículo ya está activa.";
  if (content.s4 === "Toca tu auto|Ves tus propuestas y su plazo") content.s4 = "Toca tu vehículo|Ves tus propuestas y su plazo";
  if (section.type === "text" && content.text.includes('**“Mi Garaje”**')) content.text = content.text.replace('**“Mi Garaje”**', '{[**“Mi Garaje”**|https://www.vmcsubastas.com/zona]}');
  if ((section.type === "text" && /__|\*\*/.test(content.text)) || section.type === "note") content.emphasisColor = "vault";
  return { type: section.type, content };
});
assert.deepEqual(draft.sections.map(({ type, content }) => ({ type, content })), expectedSections,
  "Email 03 must preserve the original wording except requested vehicle terminology, order, spacing, video and seven steps");
assert.equal(draft.bannerTitle, "¡Tu vehículo ya está publicado! Prepárate para recibir ofertas");
assert.deepEqual(draft.preset, { banner: "texto-centrado", footer: "footer-compact", tone: "negotiable" });
const steps = draft.sections.filter(section => section.type === "steps");
assert.equal(steps.length, 1);
assert.equal(Object.keys(steps[0].content).filter(key => /^s\d+$/.test(key)).length, 7);
const videos = draft.sections.filter(section => section.type === "video");
assert.equal(videos.length, 1);
assert.equal(videos[0].content.caption, "Ver tutorial · 47 s");
const html = renderDraft(draft);
const emphasis = html.match(/<strong\b[^>]*>/g) || [];
assert.equal(emphasis.length, 4, "Keep the existing greeting, two navigation labels and 24-hour emphasis");
assert(emphasis.every(tag => tag.includes("color:#3b1782;")), "Email 03 emphasis must match email 02 vault purple");
assert(/<a href="https:\/\/www\.vmcsubastas\.com\/zona"[^>]*><strong[^>]*>“Mi Garaje”<\/strong><\/a>/.test(html), "The inline Mi Garaje label must link to zona without changing its wording or emphasis");
assert(/<b style="font-size:16px;line-height:24px;color:#3b1782;">Dato clave:<\/b>/.test(html), "The note label must use the same emphasis color");
for (const entry of Object.values(steps[0].content)) {
  for (const text of entry.split("|")) assert(html.includes(text), "Missing rendered step: " + text);
}
assert.equal(html.split('href="' + videos[0].content.url + '"').length - 1, 2, "Poster and caption must link to original video");
assert(html.includes('src="' + videos[0].content.poster + '"'));
for (const filename of ["video.mp4", "poster.jpg"]) {
  assert(fs.statSync(path.join(__dirname, "../public/correos/negociacion-tutorial", filename)).size > 0);
}
assert(!/miles|sin comisiones|irrevocable|100% es tuyo/i.test(html), "Unsupported or unrequested claims must not return");
console.log("PASS: email 03 matches original seller tutorial with requested vehicle terminology; 7 steps; original video/poster and 47 s caption; original body order; preserved draft design; no new claims.");
