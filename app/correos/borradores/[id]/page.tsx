import type { JSX } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/_components/Header";
import BannerLab from "@/app/correos/[id]/BannerLab";
import { EMAIL_DRAFTS, getEmailDraft, renderDraftBase } from "@/src/emails/drafts";

export function generateStaticParams(): Array<{ id: string }> {
  return EMAIL_DRAFTS.map(({ id }) => ({ id }));
}

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }): Promise<JSX.Element> {
  const { id } = await params;
  const draft = getEmailDraft(id);
  if (!draft) notFound();
  const index = EMAIL_DRAFTS.findIndex(item => item.id === id);
  return <div style={{ minHeight: "100vh", background: "#fff", color: "var(--ui-ink)", fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif)" }}>
    <Header active="correos" />
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 80px" }}>
      <Link href="/correos/borradores" style={{ color: "var(--ui-accent)", fontSize: 13 }}>← Los cinco borradores</Link>
      <h1 style={{ fontSize: 25, margin: "20px 0 16px", letterSpacing: "-0.02em" }}>{draft.name}</h1>
      <dl style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6 }}>
        <dt style={{ fontWeight: 800 }}>Asunto</dt><dd style={{ margin: "0 0 8px" }}>{draft.subject}</dd>
        <dt style={{ fontWeight: 800 }}>Preencabezado</dt><dd style={{ margin: 0, color: "var(--ui-body)" }}>{draft.preheader}</dd>
      </dl>
      <div style={{ padding: "16px 20px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, marginBottom: 20 }}>
        <strong style={{ fontSize: 13, color: "#9a3412" }}>Borrador para revisión. No aprobado para envío.</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#7c2d12", fontSize: 13, lineHeight: 1.65 }}>
          {draft.pending.map(note => <li key={note}>{note}</li>)}
        </ul>
      </div>
      <p style={{ fontSize: 13, color: "var(--ui-body)", lineHeight: 1.6 }}>{draft.concept}</p>
      <p style={{ fontSize: 12, color: "var(--ui-muted)", lineHeight: 1.6 }}>
        Los cambios hechos en el editor sirven para probar y copiar HTML; no se guardan en los archivos.
        El HTML mantiene variables de destino pendientes. Gmail, Outlook y modo oscuro requieren validación antes del envío.
        Las imágenes con rutas locales también deben resolverse en el entorno de envío.
      </p>
      <Link href={`/correos/borradores/${draft.id}/vista`} style={{ display: "inline-block", margin: "0 0 20px", fontSize: 13, color: "var(--ui-accent)", fontWeight: 700 }}>Ver el correo solo · escritorio / móvil ↗</Link>
      <Suspense fallback={<p>Cargando el editor de Concorde…</p>}>
        <BannerLab key={draft.id} html={renderDraftBase(draft)} title={draft.name} subject={draft.subject}
          bannerTitle={draft.bannerTitle} initialPreset={draft.preset} initialComparing={false}
          categoria={draft.category} estado="pendiente" nota="Validar los puntos de arriba antes de usar. Este borrador no está en el catálogo de producción."
          nav={<nav key={draft.id} aria-label="Recorrer los cinco borradores" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, fontSize: 13 }}>
            {index > 0 && <Link href={`/correos/borradores/${EMAIL_DRAFTS[index - 1].id}`}>← Anterior</Link>}
            <span>{index + 1} de {EMAIL_DRAFTS.length}</span>
            {index < EMAIL_DRAFTS.length - 1 && <Link href={`/correos/borradores/${EMAIL_DRAFTS[index + 1].id}`}>Siguiente →</Link>}
          </nav>} />
      </Suspense>
      <details style={{ marginTop: 24, fontSize: 12, color: "var(--ui-muted)" }}>
        <summary>Fuente y alcance</summary><p>{draft.source}</p>
        <p>Base: AaronCoorahua/ConcordeV2, master f92fcc9. Reutiliza generateEmail, secciones, tipologías de banner, footer y BannerLab.</p>
      </details>
    </main>
  </div>;
}
