"use client";

/**
 * SubastasTicker — franja que pasa en loop arriba del header con lo que hay hoy en subastas
 * (referencia: la cinta superior de subastop.com). Usa el mismo LogoLoop de React Bits que
 * «Empresas y vendedores», con nodos de texto en vez de logos. Contenido de ejemplo.
 */
import type { JSX } from "react";

import LogoLoop from "./reactbits/LogoLoop";

type Tick = { text: string; dot?: "live" | "negotiable" | "next" };

const TICKS: Tick[] = [
  { text: "En vivo · Subasta de vehículos · Lote 12", dot: "live" },
  { text: "Hoy · 21 subastas activas" },
  { text: "Toyota Yaris 2022 · Inicia en 01:24:36", dot: "next" },
  { text: "Recibe ofertas · 12 lotes", dot: "negotiable" },
  { text: "Caterpillar 320 · US$ 45,000", dot: "live" },
  { text: "Próxima 10:00 · Equipos industriales", dot: "next" },
  { text: "Maquinaria · 2 lotes" },
  { text: "7 lotes destacados · SubasCars" },
  { text: "VMC Subastas · Lima · Perú" },
];

const CSS = `
.hib-ticker { position: relative; z-index: 6; width: 100%; height: 30px; display: flex; align-items: center; overflow: hidden;
  background: linear-gradient(90deg, #0B0A2E 0%, #1A0F4A 50%, #0B0A2E 100%); border-bottom: 1px solid rgba(132,96,229,0.35); }
.hib-ticker .logoloop { width: 100%; }
.hib-ticker .logoloop__content, .hib-ticker .logoloop__node { display: flex; align-items: center; } /* todos los textos a la misma altura, con o sin punto */
.hib-tick { display: inline-flex; align-items: center; vertical-align: middle; gap: 8px; padding: 0 22px; border-right: 1px solid rgba(255,255,255,0.16);
  font-family: var(--vmc-font-mono, "Roboto Mono", ui-monospace, monospace); font-size: 11px; font-weight: 600; line-height: 1;
  letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap; color: #DCD5FF; }
.hib-tick i { width: 6px; height: 6px; border-radius: 50%; flex: none; }
.hib-tick i.is-live { background: #FF9639; box-shadow: 0 0 8px 2px rgba(255,150,57,0.7); animation: hib-tick-pulse 1.4s ease-in-out infinite; }
.hib-tick i.is-negotiable { background: #00DAE0; box-shadow: 0 0 8px 2px rgba(0,218,224,0.6); }
.hib-tick i.is-next { background: #A68BFF; box-shadow: 0 0 8px 2px rgba(166,139,255,0.6); }
@keyframes hib-tick-pulse { 50% { opacity: 0.35; } }
`;

export default function SubastasTicker(): JSX.Element {
  return (
    <div className="hib-ticker" role="region" aria-label="Hoy en VMC Subastas">
      <LogoLoop
        logos={TICKS.map((t) => ({
          node: <span className="hib-tick">{t.dot ? <i className={`is-${t.dot}`} aria-hidden /> : null}{t.text}</span>,
          ariaLabel: t.text,
        }))}
        speed={45} gap={0} logoHeight={14} hoverSpeed={10} fadeOutWidth={0.06} draggable={false} ariaLabel="Hoy en VMC Subastas"
      />
      <style>{CSS}</style>
    </div>
  );
}
