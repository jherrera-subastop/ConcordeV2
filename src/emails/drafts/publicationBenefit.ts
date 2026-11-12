import type { Section } from "../prodEmailTemplates";

const FONT = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const NUMBER = "'Poppins', 'Plus Jakarta Sans', Arial, Helvetica, sans-serif";
const escape = (value: string): string => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Draft-only light glass, matching the steps panel Julio supplied as reference.
 * Reuses that email-safe frosted surface: pale base, subtle aqua/lilac halos,
 * luminous edge and translucent inset. No blur, dark fill, image or extra CTA.
 * The heading leads (26/34, 800); the price is deliberately secondary (24/32).
 * Solid background fallbacks remain readable in clients without gradients.
 */
export function renderPublicationBenefit(section: Section): string | null {
  const parts = section.content.body?.match(/^([\s\S]*?)\[\[([^\]]+)\]\]\s+(\S+)\s+([\s\S]*)$/);
  if (!parts) return null;
  const [, lead, amount, unit, continuation] = parts;
  const title = escape(section.content.title || "").replace("¡Un solo pago hasta", "¡Un solo pago<br>hasta");
  return `<tr><td align="center" style="padding:0 16px;font-family:${FONT};">
<table role="presentation" class="publication-benefit" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f5f3fe" style="border:1px solid #ded7f1;border-radius:22px;background-color:#f5f3fe;background-image:radial-gradient(circle at 95% 0%,rgba(0,174,177,0.12) 0%,rgba(0,174,177,0) 40%),radial-gradient(circle at 0% 100%,rgba(132,96,229,0.12) 0%,rgba(132,96,229,0) 50%),linear-gradient(180deg,#fbfaff 0%,#f3effb 100%);box-shadow:0 12px 28px rgba(59,23,130,0.10),inset 0 1px 0 #ffffff;">
<tr><td align="center" style="padding:20px 20px 12px;">
<p class="publication-benefit__title" style="margin:0;font-family:${FONT};font-size:26px;font-weight:800;line-height:34px;color:#3b1782;text-align:center;">${title}</p>
</td></tr>
<tr><td align="center" style="padding:0 20px 20px;">
<p class="publication-benefit__lead" style="margin:0;font-size:14px;line-height:22px;font-family:${FONT};font-weight:400;color:#5a4d75;text-align:center;">${escape(lead.trim())}</p>
<table role="presentation" class="publication-benefit__price-surface" border="0" cellpadding="0" cellspacing="0" width="100%" align="center" bgcolor="#ffffff" style="width:100%;max-width:200px;margin:8px auto 12px;border:1px solid rgba(132,96,229,0.18);border-radius:14px;background-color:rgba(255,255,255,0.78);box-shadow:inset 0 1px 0 #ffffff,0 2px 8px rgba(59,23,130,0.06);">
<tr><td align="center" style="padding:8px 12px;">
<p class="publication-benefit__amount" style="margin:0;font-family:${NUMBER};font-size:24px;line-height:32px;font-weight:600;color:#3b1782;white-space:nowrap;text-align:center;">${escape(amount)}</p>
<p class="publication-benefit__unit" style="margin:0;font-size:14px;line-height:22px;font-family:${FONT};font-weight:400;color:#5a4d75;text-align:center;">${escape(unit)}</p>
</td></tr></table>
<p class="publication-benefit__continuation" style="margin:0;font-size:14px;line-height:22px;font-family:${FONT};font-weight:400;color:#5a4d75;text-align:center;">${escape(continuation)}</p>
</td></tr></table>
</td></tr>`;
}
