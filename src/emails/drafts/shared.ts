import { generateEmail, renderSection, type Section } from "../prodEmailTemplates";
import { applyPreset, type LabPreset } from "../headerSwap";
import { linkDraftHelpButton } from "./helpLink";
import { renderPublicationBenefit } from "./publicationBenefit";

export interface EmailDraft {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  bannerTitle: string;
  category: string;
  /** Development handoff only. Never included in recipient-facing email HTML. */
  trigger?: string;
  preset: LabPreset;
  concept: string;
  sections: Section[];
  pending: string[];
  source: string;
}

// Drafts are separate from EMAILS: they must not become production templates by accident.
export const s = (type: Section["type"], content: Record<string, string>): Section =>
  ({ id: `draft-${type}`, type, content });
export const gap = (height = "18"): Section => s("spacer", { height });
export const paragraph = (text: string): Section => s("text", { text, size: "lg" });
export const bodyLabel = (text: string): Section => s("text", { text, size: "lg", typographyRole: "label" });
export const greeting = (): Section => paragraph("__Hola, {{nombre}}__");
export const button = (text: string, url: string): Section => s("cta", { text, url });
export const TERMS_URL = "https://www.vmcsubastas.com/condiciones-y-terminos";

const escape = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Draft-only styling: standard body text (14/22) and the requested purple CTA.
 * Keep the production renderer, original copy, headings and other CTAs intact.
 * Inline styles also preserve this sizing in email clients that drop head CSS. */
export function renderDraftSection(section: Section): string {
  let html = renderSection(section);
  // Explicit opt-in for emails 02/03: the same inline vault-700 emphasis.
  // No global recoloring, and the production renderer is unchanged.
  if ((section.type === "text" || section.type === "note") && section.content.emphasisColor === "vault") {
    html = html.replace(/<(?:strong|a|b)\b[^>]*style="[^"]*"[^>]*>/g,
      tag => tag.replace(/color:[^;]+;/, "color:#3b1782;"));
  }
  const bodyType = (tag: string): string => tag
    .replace(/font-size:[^;]+;/, "font-size:14px;")
    .replace(/line-height:[^;]+;/, "line-height:22px;");
  switch (section.type) {
    case "cta":
      if (section.content.variant !== "secondary") return html;
      // Email-safe palette of the official Button variant="secondary" (.psec).
      // Preserve the existing CTA's label, destination, dimensions and typography.
      return html
        .replace("linear-gradient(135deg,#ed8936 0%,#8460e5 100%)", "linear-gradient(160deg,#8460e5 0%,#3b1782 100%)")
        .replace("linear-gradient(135deg,#ffffff 0%,#fbc47d 25%,#ae8eff 75%,#ffffff 100%)", "linear-gradient(135deg,#cfbaff 0%,#ffffff 35%,#ae8eff 65%,#cfbaff 100%)")
        .replace("rgba(237,137,54,0.3) 0 2px 6px", "rgba(132,96,229,0.3) 0 2px 8px")
        .replace("rgba(0,0,0,0.25) 0 1px 3px", "rgba(0,0,0,0.3) 0 1px 3px")
        .replace("inset 0 1px 0 rgba(255,255,255,0.30)", "rgba(255,255,255,0.22) 0 1px 0 2px inset");
    case "text":
      if (section.content.typographyRole === "label") return html;
      return html.replace(/<td\b[^>]*style="[^"]*font-size:[^"]*"[^>]*>/g, bodyType);
    case "panel": {
      if (section.content.variant === "publication-benefit") {
        const benefit = renderPublicationBenefit(section);
        if (benefit) return benefit;
      }
      // Only the body paragraph: the title has line-height:1.35.
      const panel = html.replace(/<p style="margin:0;font-size:[^"]*line-height:1\.45;[^"]*">/g, bodyType);
      // Explicit draft-only title hierarchy; leave body sizing and weight intact.
      return section.content.titleSize === "20"
        ? panel.replace(/<p style="[^"]*line-height:1\.35;[^"]*">/g, tag => tag.replace(/font-size:[^;]+;/, "font-size:20px;"))
        : panel;
    }
    case "list":
      // Item cells and bullets, not an optional list heading.
      return html.replace(/<td\b[^>]*style="[^"]*font-size:13px;[^"]*"[^>]*>/g, bodyType);
    case "steps":
      // Step titles and numbered markers retain their original hierarchy.
      return html.replace(/<p style="margin:2px 0 0;font-size:[^"]*">/g, bodyType);
    case "note": {
      const labelSize = section.content.size === "lg" ? "16px" : "13px";
      const labelLine = section.content.size === "lg" ? "24px" : "19.5px";
      return html.replace(/<p style="margin:0;font-size:[^"]*">/g, bodyType)
        .replace(/<b style="color:/, `<b style="font-size:${labelSize};line-height:${labelLine};color:`);
    }
    default:
      return html;
  }
}

/** Production renderer, with a draft-only preheader and responsive wrapper.
 * The underlying renderer and all production emails remain untouched. */
export function renderDraftBase(draft: EmailDraft): string {
  const originalBody = draft.sections.map(renderSection).join("\n");
  const body = draft.sections.map(renderDraftSection).join("\n");
  const html = generateEmail(draft.sections, draft.subject).replace(originalBody, body);
  const legalHero = draft.id === "condiciones-aviso-previo" || draft.id === "condiciones-vigentes";
  const bodyClass = legalHero ? "vmc-email-draft vmc-email-draft-legal" : "vmc-email-draft";
  return html
    .replace("<body ", `<body class="${bodyClass}" `)
    .replace("</head>", `<style>
      .vmc-email-draft table[width="600"] { max-width:600px; }
      @media screen and (max-width:639px) {
        .vmc-email-draft table[width="600"] { width:100% !important; }
        .vmc-email-draft div[style*="width:600px"] { width:100% !important; }
        .vmc-email-draft table[style="padding:20px;"] { padding:8px !important; }
        .vmc-email-draft img { max-width:100%; height:auto; }
        /* Legal notices keep the current stacked VMC hero, with room for full titles on mobile. */
        .vmc-email-draft-legal div[style*="min-height:190px"][style*="display:flex"] { padding:24px !important; }
        .vmc-email-draft-legal div[style*="min-height:190px"][style*="display:flex"] > img { width:128px !important; }
        .vmc-email-draft-legal div[style*="min-height:190px"][style*="display:flex"] > div[style*="font-size:30px"] { font-size:24px !important; line-height:1.2 !important; overflow-wrap:break-word; }
        .vmc-email-draft p { overflow-wrap:anywhere; }
        .vmc-email-draft a[style*="padding:13px 44px"] { padding:13px 24px !important; }
        .vmc-email-draft td[style="padding:22px 20px 14px;"] { padding:16px 12px 8px !important; }
        /* Reflow the real Compacto footer; its desktop positions assume 600px. */
        .vmc-email-draft div[style*="width:600px;height:110px"] { height:212px !important; }
        .vmc-email-draft div[style*="width:600px;height:110px"] > svg:first-child { width:100%; height:100%; }
        .vmc-email-draft div[style*="width:600px;height:110px"] > img { left:50% !important; right:auto !important; top:18px !important; transform:translateX(-50%); }
        .vmc-email-draft div[style*="left:44px;top:0;height:110px"] { left:16px !important; right:16px !important; top:64px !important; height:72px !important; text-align:center !important; }
        .vmc-email-draft div[style*="left:44px;top:0;height:110px"] > div { white-space:normal !important; }
        .vmc-email-draft div[style*="left:450px;top:58px"] { left:50% !important; top:150px !important; transform:translateX(-50%); }
        .vmc-email-draft tr[bgcolor="#FFFFFF"] td[width="28"] { width:16px !important; }
        .vmc-email-draft tr[bgcolor="#FFFFFF"] td[width="15%"] { display:none; }
        .vmc-email-draft tr[bgcolor="#FFFFFF"] td[valign="top"] { display:block; width:100%; }
        .vmc-email-draft tr[bgcolor="#FFFFFF"] td { text-align:center; }
        .vmc-email-draft tr[bgcolor="#FFFFFF"] table { margin-left:auto; margin-right:auto; }
        .vmc-email-draft tr[bgcolor="#FFFFFF"] a[style*="font-size:9px"] { font-size:11px !important; line-height:22px !important; }
        .vmc-email-draft tr[bgcolor="#FFFFFF"] a[href="https://www.vmcsubastas.com/"] { font-size:18px !important; line-height:24px !important; }
      }
    </style></head>`)
    .replace("<center>", `<!-- BORRADOR: validar condiciones, disparador, variables y destinos antes de usar. -->
<div style="display:none;font-size:1px;line-height:1px;color:#FAFAFA;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escape(draft.preheader)}</div><center>`);
}

export function renderDraft(draft: EmailDraft): string {
  return linkDraftHelpButton(applyPreset(renderDraftBase(draft), draft.preset, { titulo: draft.bannerTitle }));
}
