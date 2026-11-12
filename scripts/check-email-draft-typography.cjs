/* eslint-disable @typescript-eslint/no-require-imports -- Standalone draft-only typography regression check. */
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
const { renderSection } = require("../src/emails/prodEmailTemplates.ts");
const { EMAILS } = require("../src/emails/prodEmails.ts");
const stripType = html => html.replace(/(?:font-size|line-height):[^;]+;/g, "");
const assertBody = (tags, context) => {
  assert(tags.length, "No body text found: " + context);
  for (const tag of tags) {
    assert(tag.includes("font-size:14px;"), "Body size must be 14px: " + context);
    assert(tag.includes("line-height:22px;"), "Body line height must be 22px: " + context);
  }
};
let bodies = 0;
for (const draft of EMAIL_DRAFTS) {
  const exported = renderDraft(draft);
  for (const section of draft.sections) {
    let before = renderSection(section);
    if ((section.type === "text" || section.type === "note") && section.content.emphasisColor === "vault") {
      before = before.replace(/<(?:strong|a|b)\b[^>]*style="[^"]*"[^>]*>/g,
        tag => tag.replace(/color:[^;]+;/, "color:#3b1782;"));
    }
    const after = renderDraftSection(section);
    const context = draft.id + "/" + section.type;
    if (section.type === "panel" && section.content.variant === "publication-benefit") {
      const plain = markup => markup.replace(/<br\s*\/?\s*>/g, " ").replace(/<[^>]*>/g, " ").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
      assert.equal(plain(after), plain(before), "Publication benefit copy and reading order must be unchanged");
      for (const role of ["lead", "unit", "continuation"]) {
        assertBody(after.match(new RegExp('<p class="publication-benefit__' + role + '"[^>]*>', 'g')) || [], context + "/" + role);
      }
      assert(/class="publication-benefit__title"[^>]*font-size:26px;[^>]*line-height:34px;/.test(after), "Benefit title hierarchy changed");
      assert(/class="publication-benefit__amount"[^>]*font-size:24px;[^>]*line-height:32px;/.test(after), "Benefit price must have its own display hierarchy");
      assert(after.includes('white-space:nowrap;'), "SubasCoins amount must stay together");
      assert(!/<(?:a|button|img|svg)\b/.test(after), "Price block must not look or behave like another CTA, or require image assets");
      assert(renderDraftBase(draft).includes(after), "Base view missed benefit card");
      assert(exported.includes(after), "Export missed benefit card");
      bodies += 3;
      continue;
    }
    const purpleCta = section.type === "cta" && section.content.variant === "secondary";
    if (purpleCta) {
      assert.deepEqual(after.match(/(?:font-size|line-height):[^;]+;/g), before.match(/(?:font-size|line-height):[^;]+;/g), "CTA typography changed");
    } else {
      assert.equal(stripType(after), stripType(before), "Only font size and line height may change: " + context);
    }
    if (section.type === "text" && section.content.typographyRole !== "label") {
      assertBody(after.match(/<td\b[^>]*style="[^"]*font-size:[^"]*"[^>]*>/g) || [], context);
      bodies++;
    } else if (section.type === "panel") {
      assertBody(after.match(/<p style="margin:0;font-size:[^"]*line-height:22px;[^"]*">/g) || [], context);
      const titleTag = before.match(/<p style="[^"]*line-height:1\.35;[^"]*">/)[0];
      const expectedTitleTag = section.content.titleSize === "20" ? titleTag.replace(/font-size:[^;]+;/, "font-size:20px;") : titleTag;
      assert(after.includes(expectedTitleTag), "Panel heading must match its explicit title-size setting");
      bodies++;
    } else if (section.type === "list") {
      assertBody(after.match(/<td\b[^>]*style="[^"]*font-size:[^"]*"[^>]*>/g) || [], context);
      bodies++;
    } else if (section.type === "steps") {
      assertBody(after.match(/<p style="margin:2px 0 0;font-size:[^"]*">/g) || [], context);
      const titles = before.match(/<p style="margin:0;font-size:15px;[^"]*">/g) || [];
      assert(titles.length, "Missing step titles");
      for (const tag of titles) assert(after.includes(tag), "Step title changed");
      bodies++;
    } else if (section.type === "note") {
      assertBody(after.match(/<p style="margin:0;font-size:[^"]*">/g) || [], context);
      assert(after.includes('<b style="font-size:16px;line-height:24px;color:'), "Note label changed");
      bodies++;
    } else if (!purpleCta) {
      assert.equal(after, before, "Heading, CTA, video or other non-body section changed: " + context);
    }
    // Body styling is in the shared renderer used by editor, preview and HTML export.
    if (section.type !== "title") {
      assert(renderDraftBase(draft).includes(after), "Base view missed section: " + context);
      assert(exported.includes(after), "Export missed section: " + context);
    }
  }
}
const standard = EMAILS.flatMap(e => e.sections).find(s => s.type === "text" && !s.content.size);
assert(renderSection(standard).includes("font-size:14px;"));
assert(renderSection(standard).includes("line-height:22px;"));
const original = EMAILS.find(e => e.id === "oferta-publicada-vendedor");
assert(original.sections.filter(s => s.type === "text").every(s => renderSection(s).includes("font-size:16px;")),
  "The production tutorial must keep its original 16px body");
console.log(`PASS: ${bodies} body sections across five drafts use 14px/22px inline; explicit benefit price hierarchy verified; other headings, labels, CTAs and copy preserved; production tutorial unchanged.`);
