import { getEmailDraft, renderDraft } from "@/src/emails/drafts";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const draft = getEmailDraft(id);
  if (!draft) return new Response("Borrador no encontrado", { status: 404 });
  // This notice belongs to the preview route, never to the email export.
  const preview = renderDraft(draft).replace("<center>", `<aside aria-label="Estado de la vista previa" style="padding:12px 16px;background:#fff7ed;color:#7c2d12;font:12px/1.5 Arial,sans-serif;text-align:center;">
    Borrador. No aprobado para envío.
    <a href="/correos/borradores/${draft.id}" style="color:#7c2d12;font-weight:700;">Volver al editor y revisar pendientes</a>
  </aside><center>`);
  return new Response(preview, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "script-src 'none'; object-src 'none'; base-uri 'none'",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
