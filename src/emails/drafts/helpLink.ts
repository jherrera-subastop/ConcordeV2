/** Draft-only destination requested by Julio. Production HTML is never changed. */
export const DRAFT_HELP_URL = "https://www.vmcsubastas.com/centro-de-ayuda";

export function linkDraftHelpButton(html: string): string {
  if (!/<body\b[^>]*class="vmc-email-draft(?: vmc-email-draft-legal)?"/.test(html)) return html;
  return html
    // The current footer renders a visual span. Turn it into a real 98x40 link,
    // retaining the surrounding glass button and all of its existing styling.
    .replace(/<span style="([^"]*)">¡Vamos!<\/span>/g, (_match, style: string) =>
      `<a href="${DRAFT_HELP_URL}" target="_blank" rel="noopener noreferrer" style="${style.replace("position:relative;", "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none;")}">¡Vamos!</a>`)
    // Also preserve the requested destination if the editor selects Basic.
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, anchor =>
      anchor.replace(/<[^>]*>/g, "").trim() === "¡Vamos!"
        ? anchor.replace(/href="[^"]*"/, `href="${DRAFT_HELP_URL}"`)
        : anchor);
}
