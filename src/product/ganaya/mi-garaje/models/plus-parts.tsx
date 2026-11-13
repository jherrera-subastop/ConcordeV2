"use client";

/** Piezas PROPUESTAS para Concorde compartidas por los modelos 2, 3 y 4 (ver /ds). */
import { useEffect, useId, useState } from "react";
import type { JSX, ReactNode } from "react";
import "./concorde-plus.css";

// ─── Countdown: cifra mono que corre en vivo. ─────────────────────────────────
function useNow(): number {
  const [now, setNow] = useState(0); // 0 en el servidor: evita desajuste de hidratación
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return now;
}
export function Countdown({ to, label }: { to: number; label: string }): JSX.Element {
  const now = useNow();
  if (!now || !Number.isFinite(to)) return <span className="cp-count"><small>{label}</small><b>--:--:--</b></span>;
  const left = Math.max(0, to - now);
  const h = Math.floor(left / 3.6e6), m = Math.floor((left % 3.6e6) / 6e4), sec = Math.floor((left % 6e4) / 1e3);
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span className="cp-count" aria-label={`${label}: ${h} h ${m} min`}><small>{label}</small><b>{pad(h)}:{pad(m)}:{pad(sec)}</b></span>;
}

// ─── RiskMeter: el riesgo como escala de 5 niveles. tone="light" para fondos blancos. ──
const RISK = ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"];
export function RiskMeter({ level, tone = "dark" }: { level: number; tone?: "dark" | "light" }): JSX.Element {
  return <div className={`cp-risk${tone === "light" ? " cp-risk--light" : ""}`} role="meter" aria-valuemin={1} aria-valuemax={5} aria-valuenow={level + 1} aria-valuetext={`Riesgo ${RISK[level]}`}>
    <span className="cp-risk__label">Riesgo del perfil <b>{RISK[level]}</b></span>
    <span className="cp-risk__bar" aria-hidden>{RISK.map((r, i) => <i key={r} className={i === level ? "is-on" : ""} />)}</span>
  </div>;
}

// ─── StampTitle: extensión de CardTitle para títulos de sección. ──
// Un solo bracket (esquina sup. izq.) en vez de dos: el sello completo queda para la página
// y el grupo «Tu actividad». A diferencia de CardTitle, el título puede partirse en dos líneas.
export function StampTitle({ children, sub, as: H = "h2" }: { children: ReactNode; sub?: string; as?: "h2" | "h3" }): JSX.Element {
  const uid = useId().replace(/:/g, "");
  return <div className="g-stamp">
    <svg className="g-stamp__corner" width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M7 1.022H3.769C1.923 1.022 1 1.943 1 3.784V7.007" stroke={`url(#${uid})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs><linearGradient id={uid} x1="4" y1="1.022" x2="4" y2="7.007" gradientUnits="userSpaceOnUse"><stop stopColor="#F4AC59" /><stop offset="0.4" stopColor="#ED8936" /><stop offset="1" stopColor="#B25614" /></linearGradient></defs>
    </svg>
    <H>{children}</H>{sub ? <p>{sub}</p> : null}
  </div>;
}
