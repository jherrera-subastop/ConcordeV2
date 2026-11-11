/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression check for the draft-only Concorde price panel. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = function(module, filename) {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  module._compile(output, filename);
};
const { EMAIL_DRAFTS, renderDraft, renderDraftBase } = require("../src/emails/drafts/index.ts");
const { renderDraftSection } = require("../src/emails/drafts/shared.ts");
const { renderPublicationBenefit } = require("../src/emails/drafts/publicationBenefit.ts");
const draft = EMAIL_DRAFTS.find(item => item.id === "valorizacion-publicacion");
const intro = draft.sections.find(section => section.type === "text" && section.content.text.startsWith("Acabas de valorizar"));
const introHtml = renderDraftSection(intro);
assert(/<a href="https:\/\/www\.vmcsubastas\.com\/zona\/publicar"[^>]*text-decoration:underline;[^>]*><strong[^>]*font-weight:700;[^>]*>publícalo en VMC Subastas<\/strong><\/a>/.test(introHtml), "The publication phrase must retain its wording and bold style, with an underlined link to zona/publicar");
assert.equal(introHtml.replace(/<[^>]*>/g, "").trim(), "Acabas de valorizar tu vehículo. Ahora da el siguiente paso: publícalo en VMC Subastas con la modalidad Negociable y recibe ofertas sin comisiones, ni intermediarios.");
const panel = draft.sections.find(section => section.content.variant === "publication-benefit");
const html = renderDraftSection(panel);
const plain = html.replace(/<br\s*\/?\s*>/g, " ").replace(/<[^>]*>/g, " ").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/\s+/g, " ").trim();
assert.equal(plain, "¡Un solo pago hasta que lo vendas! Publica por tan solo >S< 25 SubasCoins y mantén la publicación hasta que vendas tu vehículo.");
assert(html.includes('bgcolor="#f5f3fe"'), "Light glass fallback must be readable without CSS gradients");
assert(html.includes('linear-gradient(180deg,#fbfaff 0%,#f3effb 100%)'), "Use the light neutral glass surface from the supplied steps reference");
assert(html.includes('class="publication-benefit__price-surface"'), "Price needs its own Concorde luminous surface");
assert(html.includes('width:100%;max-width:200px;'), "Price surface must shrink on 320px phones");
assert(/class="publication-benefit__amount"[^>]*color:#3b1782;/.test(html));
assert(!html.includes('#ed8936'), "Legacy orange corner accents must not return");
assert(!html.includes('bgcolor="#3b1782"'), "Dark purple background must not return");
assert(/class="publication-benefit__title"[^>]*font-size:26px;[^>]*font-weight:800;/.test(html));
assert(/class="publication-benefit__amount"[^>]*font-size:24px;[^>]*font-weight:600;/.test(html));
assert(!/<(?:a|button|img|svg)\b/.test(html), "Price must remain live text, not a CTA or image");
assert(renderDraft(draft).includes(html));
assert(renderDraftBase(draft).includes(html));
assert.equal(EMAIL_DRAFTS.flatMap(item => item.sections).filter(section => section.content.variant === "publication-benefit").length, 1, "Only email01 may use the redesigned block");
assert.equal(renderPublicationBenefit({...panel, content:{...panel.content, body:"Unparsed text"}}), null, "Unknown copy shape must retain the regular renderer fallback");
console.log("PASS: email01 current Concorde surface, exact price/copy, readable fallback, responsive price width, no legacy corners and no extra CTA.");
