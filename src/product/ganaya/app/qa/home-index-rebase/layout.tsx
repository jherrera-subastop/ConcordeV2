import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";

// Families required by the public Concorde component styles. Next hosts the
// font files locally; no remote font request is needed when opening the Home.
const display = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--vmc-font-display" });
const mono = Roboto_Mono({ subsets: ["latin"], display: "swap", variable: "--vmc-font-mono" });

export default function HomePreviewLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Toda la pantalla con el morado del header (#2E0F70); las secciones van como cards encima.
  return <div className={`${display.variable} ${mono.variable}`} style={{ minHeight: "100vh", background: "#2E0F70" }}>{children}</div>;
}
