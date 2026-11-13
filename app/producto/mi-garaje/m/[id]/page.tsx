import type React from "react";
import "@/src/product/mi-garaje/models/frame-mi-garaje-review.css";
import FrameMiGarajeReview from "@/src/product/mi-garaje/models/FrameMiGarajeReview";
import Garaje, { type CampView, type Features, type SideView, type Veh, type Risk, type Variant } from "@/src/product/mi-garaje/models/Garaje";
import ConcordePlus from "@/src/product/mi-garaje/models/ConcordePlus";
import Valorizaciones from "@/src/product/mi-garaje/models/Valorizaciones";
import { VALS } from "@/src/product/mi-garaje/models/valorizaciones-data";
import Flujo from "@/src/product/mi-garaje/models/Flujo";
import Oferta from "@/src/product/mi-garaje/models/Oferta";
import Propuesta from "@/src/product/mi-garaje/models/Propuesta";
import { notFound } from "next/navigation";
import type { Viewport } from "next";

// /producto/mi-garaje/m/oferta: viewport-fit=cover para que el chat use la safe-area (notch, barra de inicio) y
// interactive-widget=resizes-content para que el teclado virtual encoja el layout (dvh) en vez de taparlo.
export async function generateViewport({ params }: { params: Promise<{ id: string }> }): Promise<Viewport> {
  const { id } = await params;
  return id === "oferta" ? { viewportFit: "cover", interactiveWidget: "resizes-content" } : {};
}

const ALL: Features = { summary: true, next: true, tracker: true, compact: true };
const VARIANTS: Record<string, [Variant, Features]> = { pulso: ["fernando", ALL], "3": ["fernando", ALL] };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { id } = await params;
  const q = await searchParams;
  if (id === "julio" || id === "ref") {
    // Referencias: una sola entrada del lab con dos vistas (mockups/Zona y avance de Julio).
    const julio = id === "julio" || q.ver === "julio";
    const tab = (on: boolean): React.CSSProperties => ({ padding: "8px 16px", borderRadius: 999, fontWeight: 700, textDecoration: "none", color: on ? "#fff" : "#3B1782", background: on ? "#3B1782" : "#fff" });
    return <>
      <nav aria-label="Referencias" style={{ display: "flex", gap: 8, padding: "12px 24px", background: "#ecebf3" }}>
        <a href="/producto/mi-garaje/m/ref" style={tab(!julio)} aria-current={!julio ? "page" : undefined}>Mockups de Fernando y Zona</a>
        <a href="/producto/mi-garaje/m/ref?ver=julio" style={tab(julio)} aria-current={julio ? "page" : undefined}>Avance de Julio</a>
      </nav>
      {julio ? <FrameMiGarajeReview /> : <RefImages />}
    </>;
  }
  if (id === "valuar") return <Flujo key={id} from="valorizar" single />;
  // Valorizar y Publicar dentro de la maqueta VMC (16/10): vuelven a /producto/mi-garaje/m/vmc.
  if (id === "vmc-valuar") return <Flujo key={id} from="valorizar" single vmc rv={q.resultado} />;
  if (id === "vmc-publica") return <Flujo key={id + (q.desde ?? "")} from="publicar" single vmc fromSaved={!!q.desde} saved={VALS.find((v) => v.id === q.desde)} rv={q.resultado} />;
  if (id === "ficha") return <Flujo key={id} from="valorizar" single ficha />;
  if (id === "publica") return <Flujo key={id + (q.desde ?? "")} from="publicar" single fromSaved={!!q.desde} />;
  if (id === "publicar" || id === "valorizar") return <Flujo key={id + (q.desde ?? "")} from={id} fromSaved={!!q.desde} />;
  if (id === "oferta") return <Oferta q={q} />;
  if (id === "vmc-propuesta") return <Propuesta modal={q.modal} disclaimer={q.disclaimer} />;
  if (id === "valorizaciones" || id === "vmc-valorizaciones") return <Valorizaciones vmc={id === "vmc-valorizaciones"} isEmpty={q.empty === "1"} />;
  if (id === "concorde" || id === "4") return <ConcordePlus withNews={q.news !== "0"} isEmpty={q.empty === "1"} isLoading={q.loading === "1"} />;
  // vmc sin ?propuesta (23/10): abre con una de ejemplo (US$ 14,500) y «Simular al vendedor», sin el foco de llegada (demo);
  // el foco solo sale llegando desde el flujo de propuesta (?propuesta=…). ?propuesta=0 quita la de ejemplo.
  // vmc: el mismo Pulso Fuente dentro de la maqueta de vmcsubastas.com (1024 px), para montar el mock en las pruebas de backend.
  if (id === "fuente" || id === "vmc") return <Garaje variant="fernando" features={ALL} sober vmc withData={q.datos !== "0"} risk={(["muybajo", "bajo", "regular", "alto"].includes(q.riesgo) ? q.riesgo : "muybajo") as Risk} pass={q.pass === "1"} camp={q.banner as CampView} lateral={q.lateral as SideView} vehiculo={q.vehiculo as Veh} variante={q.variante} propuesta={id === "vmc" ? Number(q.propuesta) || (q.compra || q.propuesta === "0" ? undefined : 14500) : undefined} demo={id === "vmc" && !q.propuesta && !q.compra} compra={id === "vmc" ? Number(q.compra) || undefined : undefined} withNews={q.news !== "0"} isEmpty={q.empty === "1"} isLoading={q.loading === "1"} />;
  const v = VARIANTS[id];
  if (!v) notFound();
  return <Garaje variant={v[0]} features={v[1]} withNews={q.news !== "0"} isEmpty={q.empty === "1"} isLoading={q.loading === "1"} many={q.many === "1"} />;
}

function RefImages() {
  return <main style={{ display: "flex", gap: 24, padding: 24, flexWrap: "wrap", alignItems: "flex-start", background: "#ecebf3", minHeight: "100vh" }}>
    {[["mock-mi-garage-wallet-mobile.png", "Mockup Fernando · 1"], ["mock-mi-garage-participaciones-mobile.png", "Mockup Fernando · 2"], ["captura-zona-actual-perfil-wallet-actividad-mobile.png", "Zona actual · mobile"], ["captura-zona-historica-desktop.png", "Zona · desktop (histórica)"]].map(([f, t]) =>
      <figure key={f} style={{ margin: 0, display: "grid", gap: 8 }}><img src={`/producto-assets/mi-garaje/ref/${f}`} alt={t} style={{ maxWidth: f.includes("desktop") ? 900 : 320, borderRadius: 12, boxShadow: "0 8px 24px rgba(34,0,92,.15)" }} /><figcaption style={{ fontWeight: 700, color: "#3B1782" }}>{t}</figcaption></figure>)}
  </main>;
}
