import type { Metadata } from "next";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import ComponentsLibrary from "./ComponentsLibrary";

export const metadata: Metadata = {
  title: "Componentes · Mi Garaje",
  description: "Componentes de Mi Garaje con su código para copiar.",
};

// Archivos de la librería (./lib): se leen al compilar y se muestran tal cual en las pestañas de código.
const LIB_FILES = ["PublicationBadge.tsx", "publication-badge.css", "DropModal.tsx", "drop-modal.css", "QrCard.tsx", "qr-card.css", "QrCode.tsx"];
function libSources(): Record<string, string> {
  const dir = path.join(process.cwd(), "src/product/mi-garaje/app/components/lib");
  return Object.fromEntries(LIB_FILES.map((f) => [f, dir ? readFileSync(path.join(dir, f), "utf8") : `// No se encontró lib/${f}`]));
}

export default function ComponentsPage() {
  return <ComponentsLibrary sources={libSources()} />;
}
