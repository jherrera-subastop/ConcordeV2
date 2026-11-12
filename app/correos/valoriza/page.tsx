import type { JSX } from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";
import VariantesCatalog from "../variantes/VariantesCatalog";

/** Ruta directa de revisión: solo la campaña Valoriza y su estado actual. */
export default function CampanaValorizaPage(): JSX.Element {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "var(--ui-ink)", fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)" }}>
      <Header active="correos" />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 40px 80px" }}>
        <Link href="/correos/variantes" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ui-body)", textDecoration: "none", marginBottom: 16 }}>
          <span aria-hidden="true">←</span> Todos los correos
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ui-ink)", margin: "0 0 20px" }}>Campaña Valoriza</h1>
        <VariantesCatalog initialCategory="Campaña Valoriza" focusMode />
      </main>
    </div>
  );
}
