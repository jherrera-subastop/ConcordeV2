import type { JSX } from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";
import { EMAIL_DRAFTS, isDraftReadyForDevelopment, renderDraft } from "@/src/emails/drafts";

export default function BorradoresPage(): JSX.Element {
  const groups = [
    { id: "listos", title: "Listos para desarrollo", description: "Valorización, revisión y publicación: revisados y validados por Julio.", ready: true },
    { id: "pendientes", title: "Pendientes de revisión", description: "Los dos correos de condiciones y términos siguen pendientes de validación.", ready: false },
  ];
  return <div style={{ minHeight: "100vh", background: "#fff", color: "var(--ui-ink)", fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif)" }}>
    <Header active="correos" />
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 80px" }}>
      <Link href="/correos" style={{ color: "var(--ui-accent)", fontSize: 13 }}>← Correos</Link>
      <h1 style={{ fontSize: 28, margin: "20px 0 8px", letterSpacing: "-0.02em" }}>Cinco correos</h1>
      <p style={{ color: "var(--ui-body)", lineHeight: 1.6, maxWidth: 760, marginBottom: 28 }}>
        Asuntos, títulos, banners y cuerpo integrados con las plantillas reales de Concorde.
        Tres listos para desarrollo y dos pendientes de revisión. Separados del catálogo de producción; no habilitan envíos.
      </p>
      {groups.map(group => <section key={group.id} aria-labelledby={`${group.id}-title`} style={{ marginTop: group.ready ? 0 : 48 }}>
        <h2 id={`${group.id}-title`} style={{ fontSize: 22, margin: "0 0 8px" }}>{group.title} <span style={{ color: "var(--ui-muted)", fontSize: 16 }}>· {EMAIL_DRAFTS.filter(draft => isDraftReadyForDevelopment(draft.id) === group.ready).length}</span></h2>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ui-body)", margin: "0 0 20px" }}>{group.description}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 20 }}>
        {EMAIL_DRAFTS.filter(draft => isDraftReadyForDevelopment(draft.id) === group.ready).map(draft => <Link key={draft.id} href={`/correos/borradores/${draft.id}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid var(--ui-border)", borderRadius: 16, overflow: "hidden", background: "var(--ui-surface)" }}>
          <div style={{ height: 220, position: "relative", overflow: "hidden", background: "var(--ui-subtle)" }}>
            <iframe title={draft.name} srcDoc={renderDraft(draft)} scrolling="no" sandbox="allow-same-origin" style={{ width: 640, height: 650, border: 0, transform: "scale(0.48)", transformOrigin: "top left", pointerEvents: "none" }} />
          </div>
          <div style={{ padding: 20 }}>
            <span style={{ fontSize: 11, color: group.ready ? "#047857" : "#b45309", fontWeight: 700 }}>{group.ready ? "LISTO PARA DESARROLLO" : "PENDIENTE DE REVISIÓN"}</span>
            <h3 style={{ fontSize: 18, margin: "8px 0 10px" }}>{draft.name}</h3>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ui-body)", margin: 0 }}>{draft.subject}</p>
            {draft.trigger && <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ui-body)", margin: "16px 0 0" }}><strong style={{ display: "block", color: "var(--ui-ink)" }}>Momento de envío</strong>{draft.trigger}</p>}
            <span style={{ display: "block", marginTop: 18, color: "var(--ui-accent)", fontSize: 13, fontWeight: 700 }}>Abrir en Concorde →</span>
          </div>
        </Link>)}
        </div>
      </section>)}
    </main>
  </div>;
}
