import type { JSX } from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";
import VariantesCatalog from "./VariantesCatalog";
import { EMAIL_DRAFTS } from "@/src/emails/drafts";

/**
 * /correos/variantes — catálogo de los correos que HOY existen en producción,
 * al estilo del home de Concorde-Email: sidebar con buscador y filtro por
 * categoría, correos agrupados por paso del flujo, diagrama de flujo al filtrar
 * y Copy HTML / Abrir en cada card. Nada es maqueta: el HTML sale del renderer
 * real (src/emails/prodEmails.ts + prodEmailTemplates.ts).
 */

export default function VariantesPage(): JSX.Element {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "var(--ui-ink)", fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)" }}>
      <Header active="correos" />

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 40px 80px" }}>
        <Link
          href="/correos"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ui-body)", textDecoration: "none", marginBottom: 16 }}
        >
          <span aria-hidden="true">←</span> Correos
        </Link>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ui-ink)", margin: 0 }}>Variantes</h1>
        </div>

        <section id="borradores" aria-labelledby="borradores-heading" style={{ padding: 20, marginBottom: 28, scrollMarginTop: 72, border: "1px solid #ddd2f5", borderRadius: 14, background: "#faf8ff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h2 id="borradores-heading" style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Borradores nuevos · {EMAIL_DRAFTS.length}</h2>
            <Link href="/correos/borradores" style={{ color: "var(--ui-accent)", fontSize: 13, fontWeight: 700 }}>Ver los cinco juntos →</Link>
          </div>
          <p style={{ margin: "8px 0 16px", fontSize: 13, lineHeight: 1.6, color: "var(--ui-body)" }}>
            Accesos de revisión. No aprobados para envío; no forman parte de los 50 correos de producción de abajo.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
            {EMAIL_DRAFTS.map(draft => (
              <Link key={draft.id} href={`/correos/borradores/${draft.id}`} style={{ display: "flex", flexDirection: "column", gap: 7, padding: "14px 16px", border: "1px solid var(--ui-border)", borderRadius: 10, background: "#fff", color: "var(--ui-ink)", textDecoration: "none" }}>
                <span style={{ color: "#b45309", fontSize: 10, fontWeight: 800, letterSpacing: "0.04em" }}>BORRADOR</span>
                <strong style={{ fontSize: 14, lineHeight: 1.4 }}>{draft.name}</strong>
                <span style={{ color: "var(--ui-body)", fontSize: 12, lineHeight: 1.5 }}>{draft.subject}</span>
                <span style={{ color: "var(--ui-accent)", fontSize: 12, fontWeight: 700, marginTop: "auto" }}>Abrir borrador →</span>
              </Link>
            ))}
          </div>
        </section>

        <VariantesCatalog />
      </main>
    </div>
  );
}
