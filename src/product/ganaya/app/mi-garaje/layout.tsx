import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import "@/src/product/ganaya/mi-garaje/globals.css";

// Mi Garaje copiado de VMC-Laptop (mi-garaje-lab): sus mismas fuentes y su CSS global, solo en esta ruta.
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const mono = Roboto_Mono({ variable: "--font-roboto-mono", subsets: ["latin"], weight: ["500", "700"] });

export const metadata = { title: "Mi Garaje · Gana Ya", robots: { index: false, follow: false } };

export default function MiGarajeLayout({ children }: { children: ReactNode }) {
  // Las variables van en :root porque Mi Garaje dibuja avisos y paneles fuera de este árbol (portales en <body>).
  const root = `:root{--font-jakarta:${jakarta.style.fontFamily};--font-roboto-mono:${mono.style.fontFamily}}`;
  return <><style>{root}</style><div className={`${jakarta.variable} ${mono.variable}`}>{children}</div></>;
}
