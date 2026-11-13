"use client";

/**
 * Recorrido Publicar / Valorizar («Pulso»).
 * Ambos botones empiezan en el mismo formulario AVT (pasos Vehículo + Detalles, ver
 * entregas-abraham-2026-10-09/03-contrato-avt-desde-app.md). Se conserva desde qué acción se empezó:
 *   Valorizar → Resultado → Guardar · Publicar
 *   Publicar  → Resultado → Guardar · Continuar publicación
 * Publicar continúa: Información adicional (solo lo que AVT no pidió) → Vista previa → Pago → Pendiente de aprobación.
 * Tarifa confirmada (9/10): pago único de 25 SC. Cifras de valorización: de EJEMPLO.
 */
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PIEZAS, bannerKey, bannerSrc } from "./bannersVmc";
import type { JSX, ReactNode } from "react";
import type React from "react";
import Button from "@/src/product/mi-garaje/concorde/components/Button";
import StatPill from "@/src/product/mi-garaje/concorde/components/StatPill";
import ProfileButton from "@/src/product/mi-garaje/concorde/components/ProfileButton";
import Input from "@/src/product/mi-garaje/concorde/components/Input";
import TermsSelector from "@/src/product/mi-garaje/concorde/components/TermsSelector";
import AuctionStatus from "@/src/product/mi-garaje/concorde/components/AuctionStatus";
import CardViewer from "@/src/product/mi-garaje/concorde/components/CardViewer";
import CardTitle from "@/src/product/mi-garaje/concorde/components/CardTitle";
import Signal from "@/src/product/mi-garaje/concorde/components/Signal";
import Table from "@/src/product/mi-garaje/concorde/components/Table";
import Accordion from "@/src/product/mi-garaje/concorde/components/Accordion";
import DetailCard from "@/src/product/mi-garaje/concorde/components/DetailCard";
import ConditionPill from "@/src/product/mi-garaje/concorde/components/ConditionPill";
import ProgressBar from "@/src/product/mi-garaje/concorde/components/ProgressBar";
import { Vidrio, type Sec as VSec } from "@/src/product/mi-garaje/app/iconos/Vidrio";
import InfoIcon from "@/src/product/mi-garaje/concorde/components/InfoIcon";
import CheckIcon from "@/src/product/mi-garaje/concorde/components/CheckIcon";
import { Chrome, photosOf } from "./kit";
import { Chevron } from "./Garaje";
import { computeSellingSignal, SEASONAL_ANNUAL, MONTH_NAMES_ES } from "./avt/sellingSignal";
import { runAVT, projectForward } from "./avt/engine";
import Resultado, { type RData } from "./Resultado";
import Revela from "./Revela";
import "./kit.css";
import "./garaje.css";
import "./valorizaciones.css";
import "./flujo.css";

type From = "publicar" | "valorizar";
type Step = "vehiculo" | "detalles" | "resultado" | "info" | "preview" | "pago" | "listo" | "guardado";

// ─── Catálogo de ejemplo (AVT: marca → modelo → versión, con MSRP) ────────────
// Fila con etiqueta vacía = modelo sin versiones vigentes: AVT valúa a nivel modelo con ese MSRP.
const CATALOG: Record<string, Record<string, [string, number][]>> = {
  Toyota: { Corolla: [["XEI 1.8 CVT", 24500], ["GLI 2.0 CVT", 27900]], Hilux: [["4×4 SRV", 46500], ["4×2 SR", 38900]], Etios: [["XLS 1.5 MT", 15900]] },
  Kia: { Picanto: [["EX 1.2 MT", 13900]], Rio: [["", 17500]] },
  Hyundai: { Accent: [["GL 1.4 AT", 17900]] },
  Volkswagen: { Nivus: [["Highline 200 TSI", 26990]] }, // EJEMPLO: precio de lista por confirmar con el catálogo de AVT
};
// Categoría de depreciación A–G de cada modelo (avt-ai src/catalog.json). Modelo manual: «C», como AVT.
const CAT: Record<string, string> = { Corolla: "B", Hilux: "D", Etios: "A", Picanto: "A", Rio: "A", Accent: "B", Nivus: "D" };
const MANUAL = "+ Mi modelo no aparece";
// Vigencia de EJEMPLO (AVT: lanzamiento ≤ año ≤ vigencia). Sin entrada = vigente todo el rango.
const VIGENCIA: Record<string, [number, number]> = { Etios: [2013, 2022], Picanto: [2004, 2026] };
const vigente = (m: string, y: number) => { const r = VIGENCIA[m]; return !y || !r || (y >= r[0] && y <= r[1]); };
const YEARS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2026 - i); // AVT: del año actual a 2000
const r10 = (n: number) => Math.round(n / 10) * 10; // AVT redondea a la decena
// Comparables de EJEMPLO con la forma de avtValuation (`comparables[]`: precio relativo al valor, km, antigüedad).
export const COMPS: [number, number, number][] = [[1.04, 38000, 0], [0.96, 52000, 1], [1.08, 41000, 0], [0.93, 67000, 1], [1.01, 47000, 0], [0.98, 55000, 1], [1.06, 36000, 0]];
// Confianza según comparables (getMarketValue: ≥10 · ≥5 · ≥2 → 0.90 · 0.75 · 0.60; si no, 0.50).
const confOf = (n: number) => (n >= 10 ? 90 : n >= 5 ? 75 : n >= 2 ? 60 : 50);
// Multiplicadores reales de REFINEMENT_GROUPS (avt-ai src/App.jsx): % sobre el valor base (vehículo «promedio»).
const GROUPS: { id: string; title: string; fields: { id: string; label: string; opts: [string, number][]; typical?: number }[] }[] = [
  { id: "mec", title: "Mecánica", fields: [
    { id: "trans", label: "Transmisión", opts: [["Automática", 0.5], ["Manual", -1.5], ["CVT", 0]], typical: 2 },
    { id: "fuel", label: "Combustible", opts: [["Gasolina", 0], ["Diésel", 0.5], ["Híbrido", 1], ["Eléctrico", 1], ["GLP/GNV", -4]], typical: 0 },
    { id: "drive", label: "Tracción", opts: [["4×2", 0], ["4×4", 1], ["AWD", 0.5], ["RWD", 0], ["FWD", 0]], typical: 0 } ] },
  { id: "est", title: "Estado del vehículo", fields: [
    { id: "ext", label: "Exterior", opts: [["Excelente", 1], ["Bueno", 0], ["Regular", -4], ["Malo", -12]] },
    { id: "int", label: "Interior", opts: [["Excelente", 0.5], ["Bueno", 0], ["Regular", -3], ["Malo", -8]] },
    { id: "tires", label: "Neumáticos", opts: [["Nuevos", 0.5], ["Buenos", 0], ["Desgastados", -1.5]] } ] },
  { id: "his", title: "Historial", fields: [
    { id: "owners", label: "Dueños anteriores", opts: [["Único dueño", 0.5], ["2 dueños", 0], ["3+ dueños", -2]] },
    { id: "acc", label: "Accidentes", opts: [["Sin accidentes", 0.5], ["Menor (golpe leve)", -3], ["Mayor (estructural)", -15]] },
    { id: "mant", label: "Mantenimiento", opts: [["Casa oficial", 0.5], ["Taller regular", 0], ["Sin historial", -4]] } ] },
  { id: "eq", title: "Equipamiento", fields: [
    { id: "color", label: "Color", opts: [["Blanco", 0.5], ["Plata / Gris", 0], ["Negro", 0], ["Otro color", -1]] },
    { id: "sun", label: "Techo solar", opts: [["Sí", 0.5], ["No", 0]] },
    { id: "leather", label: "Asientos de cuero", opts: [["Sí", 0.5], ["No", 0]] } ] },
];
const TOTAL_DETAILS = GROUPS.reduce((n, g) => n + g.fields.length, 0);
const usd = (n: number) => `US$\u00a0${Math.round(n).toLocaleString("en-US")}`; // espacio duro: «US$» no se separa de la cifra

// 19/10: valor base = runAVT de AVT (depreciación diaria por categoría A–G, estacionalidad, ajuste por km y piso por categoría).
const baseValue = (msrp: number, year: number, km: number, cat: string): number => runAVT(msrp, cat, year, km).baseValue;

/** Lo que el resultado de AVT (ResultScreen) muestra además del valor: proyección semanal con km (projectForward) y la lista
 *  plana de «Detalles de tu valuación» (baseRows + cada respuesta con su tag + Valor estimado). */
export function avtExtras(market: number, cat: string, km: number, msrp: number, year: number, brandModel: string, ans: Record<string, number>) {
  const pf = (projectForward(market, cat, 12, km) as { value: number; km: number; label: string | null; date: Date }[]).map((p) => ({ v: p.value, km: p.km, label: p.label, date: p.date }));
  const yearsUsed = Math.max(1, new Date().getFullYear() - year);
  const tag = (pct: number) => (pct ? `${pct > 0 ? "+" : "−"}${Math.abs(pct)}%` : "base");
  const factors: { label: string; value: string; mult?: number; bold?: boolean }[] = [
    { label: "Marca y modelo", value: brandModel }, { label: "Año", value: String(year) }, { label: "Kilometraje", value: `${km.toLocaleString("en-US")} km` },
    { label: "MSRP de referencia", value: `US$ ${msrp.toLocaleString("en-US")}` }, { label: "Años de uso", value: `${yearsUsed} ${yearsUsed === 1 ? "año" : "años"}` },
    ...GROUPS.flatMap((g) => g.fields).filter((f) => ans[f.id] !== undefined).map((f) => { const [o, pct] = f.opts[ans[f.id]]; return { label: f.label, value: `${o} (${tag(pct)})`, mult: 1 + pct / 100 }; }),
    { label: "Valor estimado", value: `US$ ${market.toLocaleString("en-US")}`, bold: true }];
  return { pf, factors };
}

/** Resultado AVT completo de una valorización ya guardada (Mis valorizaciones · «Ver resultado»). Mismas fórmulas que el
 *  componente de abajo: baseValue × factores topados entre 0.60 y 1.06, rango 0.93×–1.10×, señal y proyección de
 *  sellingSignal.js y el puente del valor. `ans` = índice de la opción elegida por id de campo (como el estado de Flujo). */
export function buildResult({ brand, model, year, version, km, ans }: { brand: string; model: string; year: number; version: string; km: number; ans: Record<string, number> }) {
  const msrp = (CATALOG[brand]?.[model] ?? []).find(([v]) => v === version)?.[1] ?? 0;
  const useYears = Math.max(1, 2026 - year), base = baseValue(msrp, year, km, CAT[model] ?? "C"), fields = GROUPS.flatMap((g) => g.fields);
  const market = r10(base * Math.max(0.6, Math.min(1.06, fields.reduce((m, f) => m * (ans[f.id] !== undefined ? 1 + f.opts[ans[f.id]][1] / 100 : 1), 1))));
  const low = r10(market * 0.93), high = r10(market * 1.1), conf = confOf(COMPS.length);
  const sig = computeSellingSignal(market, CAT[model] ?? "C", year, km, new Date());
  const dep = msrp * Math.pow(0.885, Math.max(0, 2026 - year)), kmDiff = Math.round(((km - useYears * 15000) / (useYears * 15000)) * 100);
  const bridge = [{ label: "Precio de lista", note: "De la versión elegida", v: msrp }, { label: "Antigüedad", note: `${useYears} ${useYears === 1 ? "año" : "años"} × −11.5 % anual`, v: dep - msrp },
    { label: "Kilometraje", note: kmDiff <= 0 ? "Bajo el promedio: sin ajuste" : `${kmDiff} % sobre el promedio`, v: base - dep }];
  let v = base, m = 1;
  for (const g of GROUPS) { const f = g.fields.filter((x) => ans[x.id] !== undefined).reduce((k, x) => k * (1 + x.opts[ans[x.id]][1] / 100), 1); if (f === 1) continue;
    m *= f; bridge.push({ label: g.title, note: g.fields.filter((x) => ans[x.id] !== undefined && x.opts[ans[x.id]][1]).map((x) => `${x.opts[ans[x.id]][0]} ${x.opts[ans[x.id]][1] > 0 ? "+" : ""}${x.opts[ans[x.id]][1]} %`).join(" · ") || "Sin efecto", v: base * m - v }); v = base * m; }
  if (Math.abs(market - v) >= 10) bridge.push({ label: "Tope y redondeo AVT", note: "Factores entre 0.60 y 1.06, a la decena", v: market - v });
  const rdata: RData = { meta: `${brand} ${model} ${year} · ${km.toLocaleString("en-US")} km · ${useYears} ${useYears === 1 ? "año" : "años"} de uso`, market, low, high, conf,
    comps: COMPS.map(([p, k, a]) => ({ v: r10(market * p), km: k, year: year - a })), recompra: r10(market * 0.8), subastop: r10(market * 1.05),
    proj: (sig.projection.monthlyProjections as { value: number; monthLabel: string; seasonalFactor?: number }[]).map((p) => ({ v: p.value, full: p.monthLabel, f: p.seasonalFactor ?? 0 })), bridge,
    season: Array.from({ length: 12 }, (_, i) => ({ m: i + 1, f: (SEASONAL_ANNUAL as Record<number, number>)[i + 1], name: MONTH_NAMES_ES[i + 1] as string })),
    now: new Date().getMonth() + 1, sig: sig as unknown as RData["sig"], msrp, ...avtExtras(market, CAT[model] ?? "C", km, msrp, year, `${brand} ${model}`, ans) };
  return { market, low, high, conf, rdata };
}
/** Índices de opción a partir de los rótulos guardados («Transmisión» → «CVT»). */
export const ansFrom = (factors: [string, string, number?][]) => Object.fromEntries(GROUPS.flatMap((g) => g.fields).flatMap((f) => {
  const hit = factors.find(([l]) => l === f.label); const i = hit ? f.opts.findIndex(([o]) => o === hit[1]) : -1; return i >= 0 ? [[f.id, i]] : []; }));

/** Cifra que se cuenta hasta su valor (resultado AVT). Sin animación con reduced-motion. */
function CountUp({ to }: { to: number }): JSX.Element {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || location.hash.includes("paso=")) { setV(to); return; }
    let raf = 0; const t0 = performance.now(), from = to * 0.6;
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / 1100); setV(from + (to - from) * (1 - Math.pow(1 - p, 4))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{usd(v)}</>;
}

/** Valor en vivo: pasa del valor anterior al nuevo en 600 ms, como el Counter de AVT en Detalles. Sin animación con reduced-motion. */
function Tween({ to }: { to: number }): JSX.Element {
  const [v, setV] = useState(to); const prev = useRef(to);
  useEffect(() => {
    const from = prev.current; prev.current = to;
    if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / 600); setV(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{usd(v)}</>;
}

/** PROPUESTA DS · Select con la anatomía de Input (Concorde no tiene select). */
function Select({ label, value, onChange, options, placeholder, disabled, hint, id, onBlur, error }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean; hint?: ReactNode; id?: string; onBlur?: () => void; error?: string }): JSX.Element {
  return <label className="fl-field"><span className="fl-label">{label}</span>
    <span className={`fl-select${disabled ? " is-disabled" : ""}${error ? " is-error" : ""}`}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} disabled={disabled} aria-invalid={error ? true : undefined}><option value="" disabled>{placeholder}</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>{error ? <span className="fl-err">{error}</span> : hint}</label>;
}

/** PROPUESTA DS (14/10): selector con búsqueda para listas largas (Baymard: desplegable solo hasta ~10 opciones).
 *  Patrón combobox del W3C APG: escribir filtra (sin tildes ni mayúsculas), ↑ ↓ recorren, Enter elige, Esc cierra.
 *  Si el texto no coincide con una opción al salir, vuelve al valor elegido. «+ Mi modelo no aparece» siempre queda al final. */
function Combo({ label, value, onChange, options, placeholder, disabled }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean }): JSX.Element {
  const id = useId();
  const [q, setQ] = useState<string | null>(null); // null = cerrado, muestra el valor
  const [act, setAct] = useState(0);
  const norm = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const fixed = options.filter((o) => o === MANUAL);
  const list = q === null ? [] : [...options.filter((o) => o !== MANUAL && norm(o).includes(norm(q))), ...fixed];
  const pick = (o: string) => { onChange(o); setQ(null); };
  const close = () => { const hit = q && options.find((o) => norm(o) === norm(q)); if (hit && hit !== value) onChange(hit); setQ(null); };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (q === null) { setQ(""); setAct(0); return; } setAct((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + list.length) % Math.max(list.length, 1)); }
    else if (e.key === "Enter" && q !== null && list[act]) { e.preventDefault(); pick(list[act]); }
    else if (e.key === "Escape") setQ(null);
  };
  return <div className="fl-field"><label className="fl-label" htmlFor={id}>{label}</label>
    <span className={`fl-select fl-combo${disabled ? " is-disabled" : ""}${q !== null ? " is-open" : ""}`}>
      <input id={id} role="combobox" aria-expanded={q !== null} aria-controls={`${id}-l`} aria-autocomplete="list" autoComplete="off" disabled={disabled}
        aria-activedescendant={q !== null && list[act] ? `${id}-${act}` : undefined}
        value={q ?? value} placeholder={value || placeholder} onFocus={() => { setQ(""); setAct(-1); }} onBlur={close} onKeyDown={key}
        onChange={(e) => { setQ(e.target.value); setAct(0); }} />
      <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {q !== null ? <ul id={`${id}-l`} role="listbox" aria-label={label} className="fl-combo__list">
        {list.length ? list.map((o, i) => <li key={o} id={`${id}-${i}`} role="option" aria-selected={o === value} className={`${i === act ? "is-act" : ""}${o === MANUAL ? " is-manual" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); pick(o); }} onMouseEnter={() => setAct(i)}>{o}</li>)
          : <li className="fl-combo__none" aria-disabled>Sin resultados para «{q}»</li>}
      </ul> : null}
    </span></div>;
}

// Tomas guiadas (Motorway, Turo): siguen siendo de 1 a 10 fotos; la portada se elige.
const SHOTS: [string, string][] = [["frente", "Frente"], ["lat-izq", "Lateral izquierdo"], ["lat-der", "Lateral derecho"], ["posterior", "Posterior"], ["interior", "Interior"], ["tablero", "Tablero y kilometraje"]];
const MAX_PHOTOS = 10, MAX_MB = 10;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Lleva al campo: lo centra y le da el foco (resumen de errores, «Cambiar» de la vista previa). */
function focusField(id: string): void {
  const el = document.getElementById(id); if (!el) return;
  const t = el.matches("input,select,textarea,button") ? el : el.querySelector<HTMLElement>("input,select,textarea,button,label");
  el.scrollIntoView({ behavior: "smooth", block: "center" }); (t ?? el).focus({ preventScroll: true });
}

type Draft = { at?: number; step: Step; brand: string; model: string; version: string; year: string; km: string; ans: Record<string, number>; mech: Record<string, string>;
  plate: string; desc: string; city: string; prov: string; dist: string; cc: string; expect: string; equip: string[]; docs: string[]; shots: Record<string, string>; extra: string[]; cover: string };

// onGo (VMC, 16/10): los pasos hechos son botones para volver a ellos; el check va en violeta (hecho), no en el naranja de la acción.
function Stepper({ steps, current, onGo }: { steps: string[]; current: number; onGo?: (i: number) => void }): JSX.Element {
  // El tramo del paso actual va a la mitad (en curso); los hechos, llenos.
  if (onGo) return <div className={`fl-steps${steps.length > 3 ? " fl-steps--long" : ""}`} style={{ "--n": steps.length } as React.CSSProperties}><ProgressBar value={((current + 0.5) / steps.length) * 100} />
    <ol aria-label={`Paso ${current + 1} de ${steps.length}`}>{steps.map((s, i) => <li key={s} className={i < current ? "is-done" : i === current ? "is-now" : ""} aria-current={i === current ? "step" : undefined}>
      {i < current ? <button type="button" onClick={() => onGo(i)} aria-label={`Volver a ${s}`}><CheckIcon size={16} />{s}</button> : <><span>{i + 1}</span>{s}{i === current ? <small className="fl-steps__of">· paso {i + 1} de {steps.length}</small> : null}</>}</li>)}</ol></div>;
  return <ol className="fl-stepper" aria-label={`Paso ${current + 1} de ${steps.length}`}>
    {steps.map((s, i) => <li key={s} className={i < current ? "is-done" : i === current ? "is-now" : ""} aria-current={i === current ? "step" : undefined}>
      <span className="fl-stepper__dot">{i < current ? <CheckIcon size={14} /> : i + 1}</span><span className="fl-stepper__label">{s}</span></li>)}
  </ol>;
}

/** Valorización guardada con la que se entra a Publicar (Mis valorizaciones · «Publicar»). */
export type Saved = { brand: string; model: string; version: string; year: number; km: number; factors: [string, string][] };

export default function Flujo({ from, fromSaved, saved, single = false, ficha = false, vmc = false, rv }: { from: From; fromSaved?: boolean; saved?: Saved; single?: boolean; ficha?: boolean; vmc?: boolean; rv?: string }): JSX.Element {
  // vmc (16/10): el mismo recorrido de una página dentro de la maqueta de vmcsubastas.com (/producto/mi-garaje/m/vmc); solo cambia el marco y el CSS bajo .fl--vmc.
  // ficha («Ficha viva», propuesta 14/10): solo cambia el paso Vehículo. Cascada Marca → Modelo → Año (filtrado por la
  // vigencia del modelo, el mismo dato de AVT al revés) → Versión → Km; a la izquierda, la ficha del vehículo se arma en vivo;
  // el borrador se retoma solo, sin banner ni segundo «Continuar». El resto del recorrido es el mismo.
  // single (pedido de Fernando): Vehículo → Detalles → Resultado, en 3 pasos como AVT; el resultado sin foto
  // ni nada que no salga de lo ingresado. Luego Guardar · Publicar.
  // El valor AVT es una sugerencia: en una página se puede ajustar «Tu valor» (AVT queda como referencia).
  // fromSaved: «Publicar» desde una valorización guardada → entra directo a Información adicional, sin repetir AVT.
  const [step, setStep] = useState<Step>(fromSaved ? "info" : "vehiculo");
  // Con `saved` se usa ESA valorización (antes siempre entraba el Corolla de ejemplo); sin ella, el ejemplo de siempre.
  const [brand, setBrand] = useState(saved?.brand ?? (fromSaved ? "Toyota" : "")); const [model, setModel] = useState(saved?.model ?? (fromSaved ? "Corolla" : "")); const [version, setVersion] = useState(saved?.version ?? (fromSaved ? "XEI 1.8 CVT" : ""));
  const [year, setYear] = useState(saved ? String(saved.year) : fromSaved ? "2019" : ""); const [km, setKm] = useState(saved ? saved.km.toLocaleString("en-US") : fromSaved ? "45,000" : "");
  const [buyPrice, setBuyPrice] = useState(""); const [buyMonth, setBuyMonth] = useState(""); const [buyYear, setBuyYear] = useState(""); // AVT: con 3+ dueños
  const [manualModel, setManualModel] = useState(""); const [manualPrice, setManualPrice] = useState(""); // «+ Mi modelo no aparece»
  const [msrpEdit, setMsrpEdit] = useState(false); const [msrpOverride, setMsrpOverride] = useState(""); // «Corregir» precio de lista
  const [ans, setAns] = useState<Record<string, number>>(() => saved ? ansFrom(saved.factors) : {});
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["mec"])); // como AVT: Mecánica abierta primero; abrir otro no cierra el anterior (NN/g)
  const [auto, setAuto] = useState<Set<string>>(new Set());
  const [plate, setPlate] = useState(""); const [desc, setDesc] = useState(""); const [city, setCity] = useState("");
  const [prov, setProv] = useState(""); const [dist, setDist] = useState(""); const [cc, setCc] = useState(""); const [expect, setExpect] = useState("");
  const [equip, setEquip] = useState<Set<string>>(new Set()); const [docs, setDocs] = useState<Set<string>>(new Set());
  const [terms, setTerms] = useState(false); const [pay, setPay] = useState<"sc" | "card" | "bcp">("sc");
  const [tried, setTried] = useState(false);
  const [mech, setMech] = useState<Record<string, string>>({}); // tracción/transmisión/combustible si se saltaron en AVT
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [shots, setShots] = useState<Record<string, string>>({}); const [extra, setExtra] = useState<string[]>([]); const [cover, setCover] = useState("frente");
  const [photoErr, setPhotoErr] = useState("");
  const [savedAt, setSavedAt] = useState(0); const [draft, setDraft] = useState<Draft | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const focusNext = useRef<string | null>(null); // campo a enfocar al llegar a un paso
  const stepRef = useRef(step); stepRef.current = step;
  // Cada paso entra al historial: el atrás del navegador/Android vuelve un paso sin perder nada.
  const go = (s: Step) => { setStep(s); setTried(false); top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Se conserva el estado de Next (__NA): sin él, el router recarga la página al volver atrás.
    const st = { ...(history.state ?? {}), fl: s };
    if (s === "listo" || s === "guardado") history.replaceState(st, ""); else history.pushState(st, ""); };
  const goField = (id: string) => { focusNext.current = id; go("info"); };
  const touch = (id: string) => () => setTouched((t) => (t.has(id) ? t : new Set(t).add(id)));

  const isManual = model === MANUAL;
  const rows = brand && model && !isManual ? CATALOG[brand][model] : [];
  const versions = rows.filter(([v]) => v); // sin filas con etiqueta: no hay versiones ese año
  const manualMsrp = Number(manualPrice.replace(/\D/g, "")) || 0;
  const catMsrp = isManual ? manualMsrp : (versions.length ? versions.find(([v]) => v === version)?.[1] : rows[0]?.[1]) ?? 0;
  // Precio de lista: VRN de la versión o MSRP del modelo. «Corregir» solo se aplica sin versión y si difiere ≥ 8 % (AVT msrpOverride).
  const overN = Number(msrpOverride.replace(/\D/g, "")) || 0;
  const overPct = catMsrp && overN ? Math.round(((overN - catMsrp) / catMsrp) * 100) : 0;
  const overApplies = !isManual && !versions.length && msrpEdit && overN > 0 && Math.abs(overPct) >= 8;
  const msrp = overApplies ? overN : catMsrp;
  const modelName = isManual ? manualModel.trim() : model;
  const kmN = Number(km.replace(/\D/g, "")) || 0, yearN = Number(year) || 0;
  const useYears = Math.max(1, 2026 - yearN); // AVT: mínimo 1 año de uso
  const expected = useYears * 15000;
  const kmDiff = yearN && kmN ? Math.round(((kmN - expected) / expected) * 100) : null;
  // Versión obligatoria solo si hay versiones; modelo manual: precio nuevo desde US$ 1,000.
  const step1Ok = !!(brand && modelName && (version || !versions.length) && yearN && kmN && msrp >= 1000);
  const base = step1Ok ? baseValue(msrp, yearN, kmN, CAT[modelName] ?? "C") : 0;
  const answered = Object.keys(ans).length;
  // AVT multiplica los factores y los topa entre 0.60 y 1.06 (getMultiplier).
  const mult = Math.max(0.6, Math.min(1.06, GROUPS.flatMap((g) => g.fields).reduce((m, f) => m * (ans[f.id] !== undefined ? 1 + f.opts[ans[f.id]][1] / 100 : 1), 1)));
  const market = r10(base * mult);
  // Lo que devuelve avtValuation: estimated_value, value_low (0.93×), value_high (1.10×), confidence y comparables.
  const low = r10(market * 0.93), high = r10(market * 1.1);
  const conf = confOf(COMPS.length);
  const compsAvg = r10(COMPS.reduce((s, [p]) => s + p, 0) / COMPS.length * market);
  const car = `${brand} ${modelName} ${year}`.trim();
  // Resultado completo, con las mismas fórmulas que la pantalla de resultado de AVT (App.jsx ResultScreen + sellingSignal.js).
  const recompra = r10(market * 0.8), subastop = r10(market * 1.05);
  const sig = computeSellingSignal(market, CAT[modelName] ?? "C", yearN, kmN, new Date());
  const proj = sig.projection.monthlyProjections as { value: number; monthLabel: string }[];
  const slug = model.toLowerCase() in { corolla: 1, hilux: 1, etios: 1, picanto: 1, rio: 1, accent: 1 } ? model.toLowerCase() : "corolla";
  const photos = photosOf(slug);
  const FEE_SC = 25; // T&C IV.11.2.a: «Fee por publicación» de 25 SubasCoins para particulares

  // La publicación exige la mecánica: lo que no se respondió en AVT se pide en Información adicional.
  const MECH = GROUPS[0].fields;
  // 16/10: «Usar texto sugerido» (antes «Escribir con IA», que era una plantilla). Solo datos reales: vehículo, km y lo que el
  // usuario marcó en Detalles, sin frases de relleno («buen estado», «listo para transferir») que nadie afirmó.
  const lc = (o: string) => (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(o) ? o[0].toLowerCase() + o.slice(1) : o); // CVT, GLP/GNV, AWD quedan igual
  const suggestedDesc = () => { const marked = GROUPS.flatMap((g) => g.fields).filter((f) => ans[f.id] !== undefined).map((f) => `${f.label}: ${lc(f.opts[ans[f.id]][0])}`);
    return `${car}${version ? ` ${version}` : ""}, ${km} km.${marked.length ? ` ${marked.join(" · ")}.` : ""}`; };
  const mechMissing = MECH.filter((f) => ans[f.id] === undefined);
  const mechLabel = (id: string) => { const f = MECH.find((x) => x.id === id)!; return ans[id] !== undefined ? f.opts[ans[id]][0] : mech[id] || "—"; };
  const gallery = [shots[cover], ...SHOTS.map(([k]) => (k === cover ? "" : shots[k])), ...extra].filter(Boolean).slice(0, MAX_PHOTOS) as string[];
  // Obligatorios de Información adicional: [id del campo, nombre, completo]
  const REQ: [string, string, boolean][] = [["f-fotos", "Fotos (al menos 1)", gallery.length >= 1], ["f-placa", "Placa", !!plate], ["f-expect", "Cuánto esperas recibir", !!expect], ["f-cc", "Cilindrada", !!cc],
    ...mechMissing.map((f): [string, string, boolean] => [`f-${f.id}`, f.label, !!mech[f.id]]), ["f-ubic", "Ubicación", !!(city && prov && dist)], ["f-desc", "Descripción", !!desc], ["f-terms", "Aceptar los términos", terms]];
  const infoMissing = REQ.filter((x) => !x[2]);
  // VMC (16/10): cabecera de bloque con ícono en baldosa (como las secciones de Tu actividad), título y estado a la derecha:
  // «Listo» con check, «Falta(n) N» o «Opcional». Así el bloque dice de un vistazo si ya está.
  const SUB_ICON: Record<string, VSec> = { datos: "publicaciones", mec: "caja", ubic: "ubicacion", equip: "equipo", docs: "docs", desc: "texto" }; // vidrio esmerilado de Tu actividad
  const subHead = (icon: string, title: string, ids: string[] | null, hint?: string) => {
    const miss = ids ? REQ.filter((x) => ids.includes(x[0]) && !x[2]).length : 0;
    return <div className="fl-sh"><span className="fl-sh__ico vd-host" aria-hidden><Vidrio s={SUB_ICON[icon]} size={36} /></span>
      <div className="fl-sh__txt"><h2 className="fl-sub__t">{title}</h2>{hint ? <small>{hint}</small> : null}</div>
      {!ids ? <span className="fl-sh__st is-opt">Opcional</span> : miss ? <span className="fl-sh__st">{miss === 1 ? "Falta 1" : `Faltan ${miss}`}</span> : <span key="ok" className="fl-sh__st is-ok"><CheckIcon size={14} /> Listo</span>}</div>; };
  const showErr = (id: string) => (tried || touched.has(id)) && infoMissing.some((x) => x[0] === id);
  const expN = Number(expect.replace(/\D/g, "")) || 0;
  const expState = !expN ? null : expN < low ? "low" : expN > high ? "high" : "ok";

  const ccField = <Select id="f-cc" onBlur={touch("f-cc")} error={showErr("f-cc") ? "Elige la cilindrada" : undefined} label="Cilindrada" value={cc} onChange={setCc} options={["1.0 L", "1.2 L", "1.4 L", "1.5 L", "1.6 L", "1.8 L", "2.0 L", "2.4 L", "2.8 L", "3.0 L+"]} placeholder="Selecciona cilindrada" />;

  const isPub = from === "publicar";
  // VMC (16/10, verificado con vmcsubastas.com): no hay paso «Pago». La vista previa es el último paso y «¡Publica ahora!»
  // descuenta los 25 SC del Wallet; si no alcanzan, aviso «SubasCoins insuficientes» que lleva a recargar.
  const flowSteps = isPub || ["info", "preview", "pago", "listo"].includes(step) ? (vmc ? ["Vehículo", "Detalles", "Valor", "Información", "Vista previa"] : ["Vehículo", "Detalles", "Valor", "Información", "Vista previa", "Pago"]) : ["Vehículo", "Detalles", "Resultado"];
  const saldoSC = typeof location !== "undefined" && /saldo=0/.test(location.search + location.hash) ? 0 : 1250; // lab: ?saldo=0 muestra el aviso
  const [noSC, setNoSC] = useState(false);
  // Vista previa: «Negocia ahora» es el botón del comprador; si lo tocan, se señala «¡Publica ahora!» (pedido 19/10).
  const [pubHint, setPubHint] = useState(false);
  const pointPublish = () => setPubHint(true); // la cabecera es sticky: el botón ya está a la vista
  // Al guardar una valorización se vuelve directo a Mi Garaje. Publicar, en
  // cambio, confirma primero el pago y el estado «En revisión»; desde allí la
  // persona elige continuar hacia la nueva card de Mis publicaciones.
  const returnToGarage = (arrival: "valorizacion" | "publicacion") => {
    const q = new URLSearchParams({ llegada: arrival, vehiculo: `${brand} ${modelName}`.trim(), anio: String(yearN), valor: String(market) });
    location.href = `${home}?${q}`;
  };
  const saveValuation = () => { if (vmc) returnToGarage("valorizacion"); else go("guardado"); };
  const publishNow = () => { if (saldoSC >= FEE_SC) go("listo"); else setNoSC(true); };
  const [garageCountdown, setGarageCountdown] = useState(5);
  const idx = { vehiculo: 0, detalles: 1, resultado: 2, info: 3, preview: 4, pago: 5, listo: 6, guardado: 3 }[step];
  const home = vmc ? "/producto/mi-garaje/m/vmc" : single ? "/producto/mi-garaje/m/fuente" : "/producto/mi-garaje/m/pulso";

  const prefill = () => { setBrand("Toyota"); setModel("Corolla"); setVersion("XEI 1.8 CVT"); setYear("2019"); setKm("45,000"); };
  // #paso=<step> abre ese paso con datos de ejemplo (atajo de revisión, no es parte del diseño).
  // #paso=faltantes: Información adicional con los detalles de AVT saltados (pide la mecánica).
  useEffect(() => { const h = location.hash.match(/paso=(\w+)/)?.[1]; if (!h) return;
    prefill();
    if (h === "faltantes") { setStep("info"); return; }
    const p = h as Step;
    if (p !== "vehiculo") setAns({ trans: 2, fuel: 0, drive: 0, ext: 1, int: 0, owners: 0, acc: 0, mant: 0 });
    if (["preview", "pago", "listo"].includes(p)) { setPlate("BXT-231"); setCity("Lima"); setProv("Lima"); setDist("Miraflores"); setCc("1.8 L"); setExpect("11,200"); setTerms(true); setEquip(new Set(["Sistema ABS", "Aire acondicionado", "Cámara de reversa"])); setDocs(new Set(["SOAT al día", "Tarjeta de propiedad"])); setDesc("Único dueño, mantenimientos en casa oficial y llantas al 80 %. Lo vendo porque me mudo."); }
    setStep(p); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const first = stepRef.current; // la entrada inicial es de Next: no se toca, y sin «fl» vuelve al paso de entrada
    const onPop = (e: PopStateEvent) => { const s = (e.state as { fl?: Step } | null)?.fl ?? first;
      if (stepRef.current === "listo" || stepRef.current === "guardado") { location.href = home; return; } // terminado: atrás sale a Mi Garaje
      setStep(s); setTried(false); };
    addEventListener("popstate", onPop); return () => removeEventListener("popstate", onPop);
  }, []);

  // La confirmación de publicación da un breve tiempo para leer el estado y
  // luego llega sola a Mi Garaje, igual que el envío de una propuesta.
  useEffect(() => {
    if (!vmc || step !== "listo") return;
    setGarageCountdown(5);
    const ticker = window.setInterval(() => setGarageCountdown((n) => Math.max(1, n - 1)), 1000);
    const redirect = window.setTimeout(() => returnToGarage("publicacion"), 5000);
    return () => { window.clearInterval(ticker); window.clearTimeout(redirect); };
  }, [step, vmc]); // returnToGarage usa los datos ya confirmados en esta vista

  // Al cambiar de paso, el foco va al título (lector de pantalla) o al campo pedido.
  const firstRender = useRef(true);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; }
    const id = focusNext.current; focusNext.current = null;
    requestAnimationFrame(() => (id ? focusField(id) : document.getElementById("fl-h")?.focus({ preventScroll: true }))); }, [step]);

  // Borrador automático (Visa, WFP). ponytail: localStorage del navegador; el real va al servidor con la cuenta.
  const KEY = `mg-borrador-${from}${single ? "-una" : ""}${ficha ? "-ficha" : ""}`;
  const review = typeof location !== "undefined" && location.hash.includes("paso=");
  useEffect(() => { if (review || fromSaved) return;
    try { const d = JSON.parse(localStorage.getItem(KEY) || "null") as Draft | null; if (d?.brand) setDraft(d); } catch { /* sin almacenamiento */ } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (review || draft) return;
    try {
      if (step === "listo" || step === "guardado") { localStorage.removeItem(KEY); return; }
      if (!brand) return;
      const keep = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).filter(([, v]) => !v.startsWith("blob:"))); // las fotos subidas no sobreviven a una recarga
      const d: Draft = { at: Date.now(), step, brand, model, version, year, km, ans, mech, plate, desc, city, prov, dist, cc, expect, equip: [...equip], docs: [...docs], shots: keep(shots), extra: extra.filter((u) => !u.startsWith("blob:")), cover };
      localStorage.setItem(KEY, JSON.stringify(d)); setSavedAt(Date.now());
    } catch { /* sin almacenamiento: el recorrido sigue funcionando */ }
  }, [step, brand, model, version, year, km, ans, mech, plate, desc, city, prov, dist, cc, expect, equip, docs, shots, extra, cover]); // eslint-disable-line react-hooks/exhaustive-deps
  const resume = (d: Draft) => { setBrand(d.brand); setModel(d.model); setVersion(d.version); setYear(d.year); setKm(d.km); setAns(d.ans); setMech(d.mech); setPlate(d.plate); setDesc(d.desc);
    setCity(d.city); setProv(d.prov); setDist(d.dist); setCc(d.cc); setExpect(d.expect); setEquip(new Set(d.equip)); setDocs(new Set(d.docs)); setShots(d.shots); setExtra(d.extra); setCover(d.cover); setDraft(null); if (!ficha) go(d.step); };
  // Descartar se puede deshacer (UX4G: proteger lo que se descarta): el borrador queda en memoria hasta salir.
  const [gone, setGone] = useState<Draft | null>(null);
  const discard = () => { try { localStorage.removeItem(KEY); } catch { /* nada */ } setGone(draft); setDraft(null); };
  const undo = () => { if (!gone) return; try { localStorage.setItem(KEY, JSON.stringify(gone)); } catch { /* nada */ } setDraft(gone); setGone(null); };
  const ago = (t?: number) => { if (!t) return ""; const d = Math.floor((Date.now() - t) / 864e5); return d <= 0 ? " · guardado hoy" : d === 1 ? " · guardado ayer" : ` · guardado el ${new Date(t).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" })}`; };
  // Ficha viva: el borrador se carga en el formulario y queda un solo camino (el CTA de siempre).
  const [restored, setRestored] = useState(false);
  useEffect(() => { if (ficha && draft) { resume(draft); setRestored(true); } }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
  const restart = () => { discard(); setRestored(false); setBrand(""); setModel(""); setVersion(""); setYear(""); setKm(""); setManualModel(""); setManualPrice(""); setAns({}); setAuto(new Set()); };

  // Prototipo: la galería arranca con 2 tomas de ejemplo para que se vean las casillas vacías.
  useEffect(() => { if (step === "info" && !Object.keys(shots).length && !extra.length) setShots({ frente: photos[0], posterior: photos[1] }); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const addPhoto = (slot: string | null) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])]; e.target.value = "";
    const bad = files.find((f) => !PHOTO_TYPES.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (bad) { setPhotoErr(`«${bad.name}» no se pudo agregar: usa JPEG, PNG o WebP de hasta ${MAX_MB} MB.`); return; }
    setPhotoErr(""); const urls = files.map((f) => URL.createObjectURL(f));
    if (slot) { setShots((x) => ({ ...x, [slot]: urls[0] })); return; }
    setExtra((x) => [...x, ...urls].slice(0, Math.max(0, MAX_PHOTOS - Object.keys(shots).length)));
  };

  // Regla de títulos (16/10): 4 bloques hermanos → mismo encabezado de bloque que Publicar (.fl-sh), con su ícono de vidrio.
  const GROUP_ICON: Record<string, VSec> = { mec: "caja", est: "auto", his: "fecha", eq: "equipo" };
  const groupsUI = <div className="fl-groups" id="fl-groups">{GROUPS.map((g) => {
          const done = g.fields.every((f) => ans[f.id] !== undefined), open = openGroups.has(g.id);
          if (vmc) return <section key={g.id} id={`fl-g-${g.id}`} className="fl-sec" aria-labelledby={`fl-gt-${g.id}`}><div className="fl-sh"><span className="fl-sh__ico vd-host" aria-hidden><Vidrio s={GROUP_ICON[g.id]} size={36} /></span><h2 id={`fl-gt-${g.id}`} className="fl-sub__t">{g.title}{done ? <span key="ok" className="fl-gdone"><CheckIcon size={20} title="Completo" /></span> : null}</h2>{g.fields.some((f) => auto.has(f.id) && ans[f.id] === f.typical) ? <span className="fl-gtip"><InfoIcon size={16} />típico · toca para cambiar</span> : null}</div><div className="fl-group__body">{g.fields.map((f) => <fieldset key={f.id} className="fl-opts">
              <legend>{f.label}{auto.has(f.id) && ans[f.id] === f.typical ? null : f.typical !== undefined && ans[f.id] === undefined ? <span className="fl-typical">Típico: {f.opts[f.typical][0]}</span> : null}</legend>
              <div>{f.opts.map(([o, imp], i) => <button key={o} type="button" aria-pressed={ans[f.id] === i} className={`${ans[f.id] === i ? "is-on" : ""}${vmc ? " fl-pill" : ""}`}
                onClick={() => { setAns((a) => ({ ...a, [f.id]: i })); setAuto((x) => { if (!x.has(f.id)) return x; const n = new Set(x); n.delete(f.id); return n; }); }}>{vmc ? <ConditionPill variant={ans[f.id] === i ? "filled" : "outline"}>{o}{auto.has(f.id) && ans[f.id] === i && i === f.typical ? <small className="fl-pill__tip">típico</small> : null}</ConditionPill> : <>{o}{imp ? <small>{imp > 0 ? "+" : ""}{imp} %</small> : null}</>}</button>)}</div>
            </fieldset>)}</div>
          </section>;
          return <div key={g.id} className="fl-gwrap"><Accordion className="fl-group" titleSize={15} open={open} onOpenChange={(o) => setOpenGroups((x) => { const n = new Set(x); if (o) n.add(g.id); else n.delete(g.id); return n; })}
            title={<span className="fl-group__t">{g.title}{isPub && g.id === "mec" && !done ? <span className="fl-need">Necesaria para publicar</span> : null}{done ? <span className="fl-group__done" aria-label="Completo"><CheckIcon size={16} /></span> : <small>{g.fields.filter((f) => ans[f.id] !== undefined).length} de {g.fields.length}</small>}</span>}>
            <div className="fl-group__body">{g.fields.map((f) => <fieldset key={f.id} className="fl-opts">
              <legend>{f.label}{auto.has(f.id) && ans[f.id] === f.typical ? <span className="fl-typical">✓ típico · toca para cambiar</span> : f.typical !== undefined && ans[f.id] === undefined ? <span className="fl-typical">Típico: {f.opts[f.typical][0]}</span> : null}</legend>
              <div>{f.opts.map(([o, imp], i) => <button key={o} type="button" aria-pressed={ans[f.id] === i} className={`${ans[f.id] === i ? "is-on" : ""}${vmc ? " fl-pill" : ""}`}
                onClick={() => { setAns((a) => ({ ...a, [f.id]: i })); setAuto((x) => { if (!x.has(f.id)) return x; const n = new Set(x); n.delete(f.id); return n; }); }}>{vmc ? <ConditionPill variant={ans[f.id] === i ? "filled" : "outline"}>{o}</ConditionPill> : <>{o}{imp ? <small>{imp > 0 ? "+" : ""}{imp} %</small> : null}</>}</button>)}</div>
            </fieldset>)}</div>
          </Accordion></div>;
        })}</div>;
  // AVT: la mecánica llega ya seleccionada desde la ficha o el catálogo y cuenta en la precisión. El modelo manual no tiene ficha.
  // 16/10: lo típico sale de la versión y el modelo (la etiqueta del catálogo dice CVT / MT / AT y 4×4; la Hilux es diésel),
  // no un valor fijo para todos (una Hilux salía CVT · gasolina · 4×2). Lo que el usuario ya cambió no se pisa.
  const typicalOf = (id: string): number | undefined => {
    const f = MECH.find((x) => x.id === id)!, at = (o: string) => f.opts.findIndex(([x]) => x === o);
    if (id === "trans") return /CVT/.test(version) ? at("CVT") : /\bMT\b/.test(version) ? at("Manual") : /\bAT\b/.test(version) ? at("Automática") : f.typical;
    if (id === "drive") return /4×4/.test(version) ? at("4×4") : f.typical;
    if (id === "fuel") return model === "Hilux" ? at("Diésel") : f.typical;
    return f.typical;
  };
  useEffect(() => {
    if (!model || isManual) return;
    const ids = MECH.filter((f) => f.typical !== undefined && (ans[f.id] === undefined || auto.has(f.id))).map((f) => f.id);
    if (!ids.length) return;
    setAns((a) => ({ ...a, ...Object.fromEntries(ids.map((id) => [id, typicalOf(id)!])) }));
    setAuto((x) => new Set([...x, ...ids]));
  }, [model, version]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (vmc && versions.length === 1 && version !== versions[0][0]) setVersion(versions[0][0]); }, [vmc, versions.map(([v]) => v).join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const versionUI = isManual ? <>
            <label className="fl-field"><span className="fl-label">Tu modelo</span><Input value={manualModel} onChange={setManualModel} placeholder="Ej. Yaris Cross" className="fl-input" aria-label="Tu modelo" /></label>
            <label className="fl-field"><span className="fl-label">¿Cuál fue el precio nuevo? (US$)</span>
              <Input value={manualPrice} onChange={(v) => setManualPrice(v.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} placeholder="Ej. 21,500" inputMode="numeric" className="fl-input" aria-label="Precio nuevo en USD"
                variant={manualPrice && manualMsrp < 1000 ? "error" : "default"} errorMessage={manualPrice && manualMsrp < 1000 ? "Desde US$ 1,000" : undefined} /></label>
          </> : model && !versions.length ? <p className="fl-hint">Sin datos de versión para {year || "ese año"} — valuamos a nivel modelo</p>
            : vmc && versions.length === 1 ? <div className="fl-field"><span className="fl-label">Versión</span><p className="fl-only"><CheckIcon size={20} /><b>{versions[0][0]}</b><small>Única versión para {year}</small></p></div>
            : <Select label="Versión" value={version} onChange={setVersion} options={versions.map(([v]) => v)} placeholder={model ? "Elige la versión" : "Primero elige el modelo"} disabled={!model} />;
  // Precio de lista (AVT): dato calculado; «Corregir» solo sin versión y se aplica si difiere ≥ 8 %.
  const msrpUI = !isManual && model && yearN && catMsrp ? <div className={`fl-msrp${vmc && !msrpEdit ? " fl-msrp--ds" : ""}`}>{vmc && !msrpEdit ? null : <span>Precio de lista (MSRP)</span>}
            {msrpEdit ? <>
              <Input value={msrpOverride} onChange={(v) => setMsrpOverride(v.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} placeholder={catMsrp.toLocaleString("en-US")} inputMode="numeric" className="fl-input fl-msrp__input" aria-label="Precio de lista real (US$)" />
              <button type="button" className="fl-inline" onClick={() => { setMsrpEdit(false); setMsrpOverride(""); }}>Catálogo</button>
              <p className="fl-hint fl-msrp__note">Precio de lista real (US$){overN ? (Math.abs(overPct) >= 8 ? ` · ${overPct > 0 ? "+" : "−"}US$${Math.abs(overN - catMsrp).toLocaleString("en-US")} (${Math.abs(overPct)}%) — se aplicará` : " — <8%, se usará catálogo") : null}</p>
            </> : vmc ? <><span className="fl-msrp__ico vd-host" aria-hidden><Vidrio s="precio" size={40} /></span><span className="fl-msrp__t"><small>Precio de lista (MSRP)</small><b>{usd(catMsrp)}</b></span>{versions.length ? null : <button type="button" className="fl-inline" onClick={() => setMsrpEdit(true)}>Corregir</button>}</> : <><b>{usd(catMsrp)}</b>{versions.length ? null : <button type="button" className="fl-inline" onClick={() => setMsrpEdit(true)}>Corregir</button>}</>}
          </div> : null;
  // Ficha viva: el kilometraje se lee como etiqueta (la fórmula queda en el title); ±10 % del promedio = «promedio».
  const kmTag = kmDiff === null ? null : kmDiff < -10 ? ["is-good", "Poco recorrido para su año"] : kmDiff > 10 ? ["is-warn", "Recorrido alto para su año"] : ["", "Recorrido promedio para su año"];
  const fichaDone = [brand, modelName, yearN, version || (model && !isManual && !versions.length) || (isManual && msrp >= 1000), kmN].filter(Boolean).length;
  const projUI = <>
            <svg className="fl-spark" viewBox={`0 0 ${proj.length - 1} 40`} preserveAspectRatio="none" aria-hidden>
              <polyline fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
                points={proj.map((p, i) => `${i},${40 - ((p.value - proj[proj.length - 1].value) / Math.max(1, market - proj[proj.length - 1].value)) * 36 - 2}`).join(" ")} /></svg>
            <dl className="fl-miles">{([["1M", sig.projection.value30d], ["3M", sig.projection.value90d], ["6M", sig.projection.value180d], ["12M", sig.projection.value365d]] as [string, number][]).map(([l, v]) =>
              <div key={l}><dt>{l}</dt><dd>{usd(v)}</dd><small>−{((1 - v / market) * 100).toFixed(1)} %</small></div>)}</dl>
  </>;
  const compsUI = <section className="fl-avt__card">
          <CardTitle title="Vehículos similares en el mercado" subtitle={`${COMPS.length} publicaciones · promedio ${usd(compsAvg)} · tu valor está ${market <= compsAvg ? `${Math.round((1 - market / compsAvg) * 100)} % bajo` : `${Math.round((market / compsAvg - 1) * 100)} % sobre`} el promedio`} titleSize={14} subtitleSize={13} />
          <Table caption="Vehículos similares" columns={[{ header: "Precio" }, { header: "Año", align: "center" }, { header: "Kilometraje", align: "right" }]}
            rows={COMPS.slice(0, 4).map(([p, k, a]) => [<b key="p">{usd(r10(market * p))}</b>, yearN - a, `${k.toLocaleString("en-US")} km`])} />
        </section>;
  const seasonAccUI = <>
        <Accordion title={`Momento óptimo de venta · ${sig.signal.label}`} titleSize={14} className="fl-acc">
          <ol className="fl-season">{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => { const f = (SEASONAL_ANNUAL as Record<number, number>)[m];
            return <li key={m} className={`${f < 0 ? "is-neg" : ""}${m === new Date().getMonth() + 1 ? " is-now" : ""}`} title={`${MONTH_NAMES_ES[m]}: ${f > 0 ? "+" : ""}${f} %`}>
              <i style={{ height: `${Math.abs(f) / 13.14 * 100}%` }} /><span>{MONTH_NAMES_ES[m].slice(0, 3)}</span></li>; })}</ol>
          {sig.timing.nextPeakMonth ? <p>Próximo pico: <b>{sig.timing.nextPeakMonth}</b> (en {sig.timing.daysUntilPeak} días){sig.timing.worstMonths.length ? <> · Evitar: {sig.timing.worstMonths.map((m: { monthLabel: string }) => m.monthLabel).join(" y ")}</> : null}</p> : null}
        </Accordion>
  </>;
  const detailAccUI = <>
        <Accordion title={`Detalles de tu valuación · ${5 + answered} factores`} titleSize={14} className="fl-acc">
          <Table caption="Factores de la valuación" columns={[{ header: "Factor" }, { header: "Dato" }, { header: "Impacto", align: "right" }]}
            rows={[["Marca y modelo", `${brand} ${modelName}`, "—"], ["Año", year, "—"], ["Kilometraje", `${kmN.toLocaleString("en-US")} km`, "—"], ["Precio de lista", usd(msrp), "—"], ["Años de uso", useYears, "—"],
              ...GROUPS.flatMap((g) => g.fields).filter((f) => ans[f.id] !== undefined).map((f) => { const [o, pct] = f.opts[ans[f.id]];
                return [f.label, o, <span key="i" className={pct < 0 ? "is-neg" : pct > 0 ? "is-pos" : ""}>{pct > 0 ? "+" : ""}{pct} %</span>]; }),
              [<b key="t">Valor estimado</b>, "", <b key="v">{usd(market)}</b>]]} />
          {/* Precisión: el mismo dato del panel de Detalles de AVT («X de 12 detalles»). */}
          <p className="fl-prec">Precisión · {answered} de {TOTAL_DETAILS} detalles{answered < TOTAL_DETAILS ? <> · <button type="button" className="fl-inline" onClick={() => go("detalles")}>Agregar detalles</button></> : null}</p>
        </Accordion>
  </>;
  const tailUI = <>{compsUI}{seasonAccUI}{detailAccUI}</>;
  // Direcciones del resultado (16/10, PROPUESTA): ?resultado=claro|vidrio. El resto del resultado es el mismo.
  const rvAlt = rv === "claro" || rv === "vidrio" || rv === "explicado" || rv === "simulador" ? rv : null;
  // «Revela» (16/10): dirección por defecto en la maqueta VMC; ?resultado=actual vuelve al resultado anterior.
  const revela = rv === "revela" || (vmc && !rvAlt && rv !== "actual");
  // Puente del valor (dirección «Explicado»): las mismas fórmulas de baseValue y getMultiplier, paso a paso.
  const bridge = (() => { if (!step1Ok) return [];
    const dep = msrp * Math.pow(0.885, Math.max(0, 2026 - yearN)), out: { label: string; note: string; v: number }[] = [
      { label: "Precio de lista", note: versions.length ? "De la versión elegida" : "Del modelo", v: msrp },
      { label: "Antigüedad", note: `${useYears} ${useYears === 1 ? "año" : "años"} × −11.5 % anual`, v: dep - msrp },
      { label: "Kilometraje", note: kmDiff !== null && kmDiff <= 0 ? "Bajo el promedio: sin ajuste" : `${kmDiff} % sobre el promedio`, v: base - dep } ];
    let v = base, m = 1;
    for (const g of GROUPS) { const f = g.fields.filter((x) => ans[x.id] !== undefined).reduce((k, x) => k * (1 + x.opts[ans[x.id]][1] / 100), 1); if (f === 1) continue;
      m *= f; out.push({ label: g.title, note: g.fields.filter((x) => ans[x.id] !== undefined && x.opts[ans[x.id]][1]).map((x) => `${x.opts[ans[x.id]][0]} ${x.opts[ans[x.id]][1] > 0 ? "+" : ""}${x.opts[ans[x.id]][1]} %`).join(" · ") || "Sin efecto", v: base * m - v }); v = base * m; }
    if (Math.abs(market - v) >= 10) out.push({ label: "Tope y redondeo AVT", note: "Factores entre 0.60 y 1.06, a la decena", v: market - v });
    return out; })();
  const rdata: RData = { meta: `${car} · ${km} km · ${useYears} ${useYears === 1 ? "año" : "años"} de uso`, market, low, high, conf,
    comps: COMPS.map(([p, k, a]) => ({ v: r10(market * p), km: k, year: yearN - a })), recompra, subastop,
    proj: proj.map((p) => ({ v: p.value, full: p.monthLabel, f: (p as { seasonalFactor?: number }).seasonalFactor ?? 0 })), bridge, season: Array.from({ length: 12 }, (_, i) => ({ m: i + 1, f: (SEASONAL_ANNUAL as Record<number, number>)[i + 1], name: MONTH_NAMES_ES[i + 1] as string })),
    now: new Date().getMonth() + 1, sig: sig as unknown as RData["sig"], msrp, ...(step1Ok ? avtExtras(market, CAT[modelName] ?? "C", kmN, msrp, yearN, `${brand} ${modelName}`, ans) : { pf: [], factors: [] }) };
  // Factores que movieron el valor (los mismos de «Detalles de tu valuación»), de mayor a menor impacto.
  const moved = GROUPS.flatMap((g) => g.fields).filter((f) => ans[f.id] !== undefined && f.opts[ans[f.id]][1] !== 0)
    .map((f): [string, string, number] => [f.label, ...f.opts[ans[f.id]]]).sort((a, b) => Math.abs(b[2]) - Math.abs(a[2]));
  // 26/10 · Barra lateral: el banner por defecto de Mi Garaje VMC (publica-vmc 01-auto, formato side400) en el espacio «BANNER»
  // de concorde/, por portal como en Garaje.tsx. ?lateral=<plantilla:pieza> elige otro.
  const [sideSlot, setSideSlot] = useState<Element | null>(null);
  useEffect(() => { if (vmc) setSideSlot(document.querySelector('.kit-shell__sidebar [data-slot="sidebar-banner"]')); }, [vmc]);
  const sideBan = PIEZAS.find((p) => bannerKey(p) === (typeof location !== "undefined" && new URLSearchParams(location.search).get("lateral"))) ?? PIEZAS.find((p) => bannerKey(p) === "max-vmc:claro")!;
  const showResult = step === "resultado";
  const valuate = () => { if (!step1Ok) { setTried(true); return; } go("detalles"); };

  return <Chrome vmc={vmc}>
    <main className={`g-page g--fernando fl${step === "vehiculo" || step === "detalles" ? " fl--form" : ""}${vmc ? " fl--vmc" : ""}${vmc && ["info", "preview", "pago", "listo"].includes(step) ? " fl--neg" : ""}`} ref={top as never}>
      <div className={`fl-bar${flowSteps.length > 3 ? " fl-bar--long" : ""}`}>
      <nav className="vz-back" aria-label="Salir"><a href={home}><span className="vz-back__chev"><Chevron /></span>Mi Garaje</a>
        {ficha || !isPub ? null : <span className="fl-origin">{isPub ? "Publicar" : "Valorizar"} · empieza valorizando tu vehículo</span>}</nav>

      {step !== "listo" && step !== "guardado" ? <Stepper steps={flowSteps} current={idx} onGo={vmc ? (i) => go((["vehiculo", "detalles", "resultado", "info", "preview", "pago"] as Step[])[i]) : undefined} /> : null}</div>
      {/* 26/10 (pedido de Julio): el costo desde el inicio, no solo al final. Copy de T&C IV.11.2 a, b y g. Foto: fee-publica.jpg (recorte de fee-publica-original.jpg). */}
      {vmc && isPub && step === (fromSaved ? "info" : "vehiculo") ? (() => { // el paso donde se entra: desde una valorización guardada es Información
        // 26/10 (pedido de Julio): el costo desde el inicio, solo en Vehículo, entre los pasos y el formulario. Copy de T&C IV.11.2 a, b y g. Tres opciones para comparar con ?costo=:
        // precio (por defecto: la receta oscura del MSRP y del valor estimado, con el monto como protagonista), franja (sin foto,
        // tarjeta blanca con borde degradado) y foto (la card «Tipo de oferta · Con foto» de INDEX).
        const costo = typeof location !== "undefined" ? new URLSearchParams(location.search).get("costo") ?? "precio" : "precio";
        const tag = <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="#fff" /><circle cx="7.5" cy="8.5" r="1.6" fill="#8460E5" /></svg>;
        if (costo === "franja") return <aside className="fl-fee fl-fee--franja" aria-label="Costo de publicar">
          <span className="vd-host" aria-hidden><Vidrio s="precio" size={36} /></span>
          <p><b>Publicar cuesta &gt;S&lt; {FEE_SC}</b> · pago único</p><ul className="fl-fee__perks"><li><CheckIcon size={16} />Republicación gratis</li><li><CheckIcon size={16} />Sin comisión</li></ul></aside>;
        if (costo === "foto") return <aside className="fl-fee fl-fee--foto" aria-label="Costo de publicar">
          <span className="fl-fee__img" aria-hidden><img src="/producto-assets/mi-garaje/banners/personaje/fee-publica.jpg" alt="" /></span><span className="fl-fee__light" aria-hidden />
          <div className="fl-fee__tx"><StatPill variant="glass" label="" value="Pago único" className="fl-fee__pill" icon={tag} />
            <b>Publicar cuesta &gt;S&lt; {FEE_SC}, una sola vez</b>
            <span>Republicación gratis hasta que lo vendas · Sin comisión al vender</span></div></aside>;
        return <aside className="fl-fee fl-fee--precio" aria-label="Costo de publicar">
          <span className="fl-fee__img" aria-hidden><img src="/producto-assets/mi-garaje/banners/personaje/fee-publica.jpg" alt="" /></span>
          {/* 26/10 · copy de Julio con el vocabulario de la landing (propuestas, 100 % es tuyo, directo). «Sin intermediarios» no: los T&C dicen que VMC es intermediario tecnológico. */}
          {/* 26/10 v3: misma receta que las piezas de publica-vmc.html (pill de vidrio · titular 800 · bajada), sin CTA porque ya está publicando. */}
          <div className="fl-fee__tx">
            <span className="fl-fee__tag">25 SubasCoins · Pago único · 0% comisión</span>
            <b>Recibe propuestas por solo <em>&gt;S&lt; {FEE_SC}</em></b>
            <span>Un solo pago hasta que lo vendas: el 100% de la venta es tuyo.</span>
          </div></aside>;
      })() : null}
      {savedAt && step !== "listo" && step !== "guardado" && step !== "resultado" ? <p className="fl-saved" aria-live="polite"><CheckIcon size={14} /> Borrador guardado · puedes salir y continuar después</p> : null}

      {/* ── 1 · Vehículo ─────────────────────────────── */}
      {step === "vehiculo" && ficha ? <section className="fl-card fl-card--ficha" aria-labelledby="fl-h">
        <div className="fl-card__aside"><header><h1 id="fl-h" tabIndex={-1}>¿Cuánto vale tu vehículo?</h1></header>
          <div className="fl-ficha" aria-live="polite">
            <small>Tu vehículo</small>
            <b className={brand ? "" : "is-empty"}>{brand ? `${brand} ${modelName}`.trim() : "Elige la marca para empezar"}</b>
            <dl>{([["Año", year], ["Versión", isManual ? "Modelo manual" : model && !versions.length ? "Nivel modelo" : version], ["Kilómetros", kmN ? `${km} km` : ""]] as [string, string][]).map(([k, v]) =>
              <div key={k}><dt>{k}</dt><dd className={v ? "" : "is-empty"}>{v || "—"}</dd></div>)}</dl>
            {kmTag ? <span className={`fl-ficha__tag ${kmTag[0]}`} title={`Promedio esperado: ${expected.toLocaleString("en-US")} km (${useYears} ${useYears === 1 ? "año" : "años"} × 15,000 km)`}>{kmTag[1]}</span> : null}
            <span className="fl-live__bar" role="img" aria-label={`${fichaDone} de 5 datos`}><i style={{ transform: `scaleX(${fichaDone / 5})` }} /></span>
            <small className="fl-ficha__count">{fichaDone === 5 ? "Listo para valuar" : `${fichaDone} de 5 datos`}</small>
          </div>
          <p className="fl-trust"><CheckIcon size={16} />Sin compromiso: al final decides si lo guardas o lo publicas</p>
        </div>
        <div className="fl-card__main">
          {restored ? <p className="fl-restored"><span>Retomamos tu valorización sin terminar.</span><button type="button" className="fl-tlink" onClick={restart}>Empezar de nuevo</button></p> : null}
          <div className="fl-grid">
          {/* Cascada por dependencia: Marca → Modelo → Año (solo los de su vigencia) → Versión → Km. */}
          <Combo label="Marca" value={brand} onChange={(v) => { setBrand(v); setModel(""); setVersion(""); setMsrpEdit(false); }} options={Object.keys(CATALOG)} placeholder="Escribe o elige la marca" />
          <Combo label="Modelo" value={model} onChange={(v) => { setModel(v); setVersion(""); setMsrpEdit(false); setMsrpOverride(""); if (v !== MANUAL && yearN && !vigente(v, yearN)) setYear(""); }} options={brand ? [...Object.keys(CATALOG[brand]), MANUAL] : []} placeholder={brand ? "Escribe o elige el modelo" : "Primero elige la marca"} disabled={!brand} />
          {isManual ? versionUI : null}
          <Select label="Año de fabricación" value={year} onChange={setYear} options={YEARS.filter((y) => isManual || vigente(model, y)).map(String)} placeholder={model ? "Elige el año" : "Primero elige el modelo"} disabled={!model} />
          {isManual ? null : versionUI}
          <label className="fl-field fl-km"><span className="fl-label">Kilómetros</span>
            <Input value={km} onChange={(v) => setKm(v.replace(/[^\d]/g, "").slice(0, 6).replace(/\B(?=(\d{3})+(?!\d))/g, ","))} placeholder={yearN ? "" : "Primero elige el año"} inputMode="numeric" className="fl-input" disabled={!yearN}
              variant={tried && yearN && !kmN ? "error" : "default"} errorMessage={tried && yearN && !kmN ? "Ingresa el kilometraje" : undefined} aria-label="Kilómetros" />
          </label>
          {msrpUI}
          </div>
          <footer className="fl-foot fl-foot--stack">
            <Button variant={draft ? "outline" : "primary"} onClick={valuate}>Valorizar mi vehículo</Button>
            <div className="fl-foot__links"><button type="button" className="fl-demo" onClick={prefill}>Completar con un ejemplo (lab)</button></div>
          </footer>
          {tried && !step1Ok ? <p className="fl-error" role="alert">Completa {(isManual ? ["marca", "modelo", "precio nuevo", "año", "kilómetros"] : ["marca", "modelo", "año", ...(versions.length ? ["versión"] : []), "kilómetros"]).join(", ").replace(/, ([^,]*)$/, " y $1")} para continuar.</p> : null}
          <p className="fl-src">Basado en datos reales del mercado peruano · motor AVT</p></div>
      </section> : null}
      {step === "vehiculo" && !ficha ? <section className="fl-card" aria-labelledby="fl-h">
        {/* VMC (16/10, pedido de Abraham): sin aviso de borrador; el formulario empieza limpio y el CTA principal manda. */}
        {draft && !vmc ?<div className="fl-resume" role="region" aria-label="Borrador sin terminar">
          <div><b>Tienes {isPub ? "una publicación" : "una valorización"} sin terminar</b><span>{`${draft.brand} ${draft.model} ${draft.year}`.trim()} · te quedaste en {{ vehiculo: "Vehículo", detalles: "Detalles", resultado: "Resultado", info: "Información", preview: "Vista previa", pago: "Pago" }[draft.step as string] ?? "Vehículo"}{ago(draft.at)}</span></div>
          <div className="fl-resume__btns"><button type="button" className="fl-tlink" onClick={discard}>Empezar de nuevo</button><Button variant="primary" onClick={() => resume(draft)}>Continuar</Button></div>
        </div> : gone && !vmc ? <p className="fl-gone" role="status">Borrador descartado <button type="button" className="fl-tlink" onClick={undo}>Deshacer</button></p> : null}
        <div className="fl-card__aside"><header><h1 id="fl-h" tabIndex={-1}>{isPub ? "Publica tu vehículo en unos 3 minutos" : "Estás a 1 minuto de revelar el valor de tu vehículo"}</h1><p>{isPub ? "Primero, su valor de mercado." : "Sin compromiso: al final eliges si lo guardas o lo publicas."}</p>
          {isPub && !vmc ? <ul className="fl-expect"><li><CheckIcon size={16} />Para publicar necesitarás: placa, de 1 a 10 fotos y &gt;S&lt; 25</li></ul> : null}</header></div>
        <div className="fl-card__main"><div className="fl-grid">
          {/* Orden de AVT: Marca → Año → Km → Modelo (filtrado por año) → Versión, habilitados en cadena. */}
          <Combo label="Marca" value={brand} onChange={(v) => { setBrand(v); setModel(""); setVersion(""); setMsrpEdit(false); }} options={Object.keys(CATALOG)} placeholder="Escribe o elige la marca" />
          <Select label="Año de fabricación" value={year} onChange={(v) => { setYear(v); if (model && model !== MANUAL && !vigente(model, Number(v))) { setModel(""); setVersion(""); } }} options={YEARS.map(String)} placeholder={brand ? "Año" : "Primero elige la marca"} disabled={!brand} />
          <label className="fl-field fl-km"><span className="fl-label">Kilómetros</span>
            <Input value={km} onChange={(v) => setKm(v.replace(/[^\d]/g, "").slice(0, 6).replace(/\B(?=(\d{3})+(?!\d))/g, ","))} placeholder={yearN ? "" : "Primero elige el año"} inputMode="numeric" className="fl-input" disabled={!yearN}
              variant={tried && yearN && !kmN ? "error" : "default"} errorMessage={tried && yearN && !kmN ? "Ingresa el kilometraje" : undefined} aria-label="Kilómetros" />
            {yearN ? <span className="fl-hint fl-kmh"><span>Promedio esperado: <b>{expected.toLocaleString("en-US")} km</b> <span className="fl-kmh__f">({useYears} {useYears === 1 ? "año" : "años"} × 15,000 km)</span></span>{kmDiff === null ? null : <span className={`fl-kmh__d ${Math.abs(kmDiff) <= 10 ? "is-avg" : kmDiff > 0 ? "is-up" : "is-down"}`}>{Math.abs(kmDiff) <= 10 ? "≈ Promedio" : `${kmDiff > 0 ? "↑" : "↓"}\u00a0${Math.abs(kmDiff)}\u00a0% ${kmDiff > 0 ? "sobre" : "bajo"} promedio`}</span>}</span> : null}
          </label>
          <Combo label="Modelo" value={model} onChange={(v) => { setModel(v); setVersion(""); setMsrpEdit(false); setMsrpOverride(""); }} options={brand && yearN ? [...Object.keys(CATALOG[brand]).filter((m) => vigente(m, yearN)), MANUAL] : []} placeholder={!brand ? "Primero elige la marca" : !yearN ? "Primero elige el año" : !kmN ? "Primero ingresa los kilómetros" : "Escribe o elige el modelo"} disabled={!brand || !yearN || !kmN} />
          {versionUI}
          {msrpUI}
                  </div>
        <footer className="fl-foot fl-foot--stack">
          <Button variant={draft && !vmc ? "outline" : "primary"} onClick={valuate}>Valorizar mi vehículo</Button>
          <div className="fl-foot__links"><button type="button" className="fl-demo" onClick={prefill}>Completar con un ejemplo (lab)</button></div>
        </footer>
        {tried && !step1Ok ? <p className="fl-error" role="alert">Completa {(isManual ? ["marca", "año", "kilómetros", "modelo", "precio nuevo"] : ["marca", "año", "kilómetros", "modelo", ...(versions.length ? ["versión"] : [])]).join(", ").replace(/, ([^,]*)$/, " y $1")} para continuar.</p> : null}
        <p className="fl-src">Basado en datos reales del mercado peruano · motor AVT</p></div>
      </section> : null}

      {/* ── 2 · Detalles ─────────────────────────────── */}
      {step === "detalles" ? <section className="fl-card" aria-labelledby="fl-h">
        <div className="fl-card__aside"><header><h1 id="fl-h" tabIndex={-1}>Develemos el valor de tu vehículo</h1><p>{vmc ? "Cada detalle afina la precisión. Tu auto es único — su valor también." : "Son opcionales. Puedes saltarlos y ver el resultado ahora."}</p></header>
        {vmc ? <div className="fl-live fl-live--ds" aria-live="polite">
          {/* 16/10: sin corchetes de CardTitle (pedido); el valor manda, el auto queda como contexto. */}
          <div className="fl-live__id"><span className="fl-live__ico vd-host" aria-hidden><Vidrio s="precio" size={40} /></span><div><b>{car}</b><span>{km} km</span></div></div>
          <div className="fl-live__v"><small>Valor estimado</small><b><Tween to={market} /></b>{market !== base ? <em key={market} className={market > base ? "is-up" : "is-down"}>{market > base ? "+" : "−"}{usd(Math.abs(market - base))} vs base</em> : null}</div>
          <div className="fl-live__p"><ProgressBar value={(answered / TOTAL_DETAILS) * 100} /><small><span>Precisión</span><b>{answered} de {TOTAL_DETAILS} detalles</b></small></div>
        </div> : <div className="fl-live" aria-live="polite">
          <div><small>{car} · {km} km</small><span>Valor estimado</span></div>
          <b>{usd(market)}</b>
          <em className={market >= base ? "is-up" : "is-down"}>{market >= base ? "+" : "−"}{usd(Math.abs(market - base))} {vmc ? "por los detalles" : "vs base"}</em>
          <span className="fl-live__bar" role="img" aria-label={`Precisión: ${answered} de ${TOTAL_DETAILS} detalles`}><i style={{ transform: `scaleX(${answered / TOTAL_DETAILS})` }} /></span>
          <small className="fl-live__prec">Precisión · {answered} de {TOTAL_DETAILS} detalles</small>
        </div>}</div>
        <div className="fl-card__main">{groupsUI}
        {vmc && ans.owners === 2 ? <section className="fl-buy" aria-labelledby="fl-buy-h"><h3 id="fl-buy-h">Precio de compra</h3><p className="fl-hint">¿En cuánto y cuándo compraste este vehículo? (USD)</p>
          <Input value={buyPrice} onChange={(v) => setBuyPrice(v.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} placeholder="Ej: 18,000" inputMode="numeric" className="fl-input" aria-label="Precio de compra (USD)" />
          <div className="fl-buy__when"><Select label="Mes" value={buyMonth} onChange={setBuyMonth} options={["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]} placeholder="Mes" /><Select label="Año" value={buyYear} onChange={setBuyYear} options={Array.from({ length: 37 }, (_, i) => String(2026 - i))} placeholder="Año" /></div>
        </section> : null}
        {isPub && mechMissing.length ? <p className="fl-hint fl-skipnote"><InfoIcon size={14} /> Si lo saltas, te pediremos {mechMissing.map((f) => f.label.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " y $1")} al completar la publicación.</p> : null}
        <footer className="fl-foot fl-foot--stack">
          {/* 19/10: en AVT «Saltar» y «Ver valuación» llaman al mismo handleSubmit (los detalles son opcionales y se envía lo marcado):
              en VMC queda una sola acción. Volver al vehículo va arriba, en el stepper. */}
          {vmc ? <Button variant="primary" onClick={() => go("resultado")}>Ver valuación</Button> : <>
          <Button variant="primary" onClick={() => go("resultado")}>Ver valuación</Button>
          <div className="fl-foot__links"><button type="button" className="fl-tlink" onClick={() => go("vehiculo")}>Atrás</button><button type="button" className="fl-tlink" onClick={() => go("resultado")}>Saltar los detalles</button></div></>}
        </footer></div>
      </section> : null}

      {/* ── 3 · Resultado (Concorde: héroe oscuro como Wallet, CardTitle, Signal, Table, Accordion) ── */}
      {/* ── 3 · Resultado «Ficha viva» (propuesta 14/10): primero la decisión (dónde vender), luego el porqué y el cuándo.
           Solo datos de AVT: valor y rango 0.93×–1.10×, confianza por comparables, recompra 0.80×, Subastop 1.05×, factores,
           computeSellingSignal y comparables. Lo único derivado es la resta Subastop − recompra. */}
      {showResult && ficha ? <section className="fl-result fl-result--ds fl-result--ficha" id="fl-result" aria-labelledby="fl-h">
        <div className="fl-hero">
          <div className="fl-hero__top"><small>{car} · {version || "Nivel modelo"} · {km} km</small></div>
          <h1 id="fl-h" tabIndex={-1}>Valor de mercado hoy</h1>
          <b className="fl-hero__big"><CountUp to={market} /></b>
          <div className="fl-hero__range" role="img" aria-label={`Rango estimado de ${usd(low)} a ${usd(high)}`}>
            <span>{usd(low)}</span><i><em style={{ left: `${((market - low) / (high - low)) * 100}%` }} /></i><span>{usd(high)}</span>
          </div>
          <p className="fl-hero__sub">Estimación basada en depreciación real, estacionalidad y kilometraje</p>
          <p className="fl-hero__conf2"><span className="fl-hero__conf">Confianza {conf} %</span>Según {COMPS.length} publicaciones similares en el mercado</p>
        </div>

        <section className="fl-where" aria-labelledby="fl-where-h">
          <h2 id="fl-where-h">¿Cuánto podrías recibir?</h2>
          {([["Venta inmediata a un dealer", "Valor de recompra", recompra], ["Subasta en VMC", "Estimación Subastop", subastop]] as [string, string, number][]).map(([t, s, v]) =>
            <div key={s} className="fl-where__row"><div><b>{t}</b><small>{s}</small></div><span className="fl-where__bar"><i style={{ width: `${(v / subastop) * 100}%` }} /></span><strong>{usd(v)}</strong></div>)}
          <p className="fl-where__diff">En subasta, <b>{usd(subastop - recompra)} más</b> que vendiéndolo hoy a un dealer.</p>
        </section>

        <div className="fl-avt">
          <section className="fl-avt__card">
            <CardTitle title="Qué movió el valor" subtitle={`Precisión · ${answered} de ${TOTAL_DETAILS} detalles`} titleSize={14} subtitleSize={13} />
            {moved.length ? <ul className="fl-moved">{moved.map(([l, o, pct]) => <li key={l}><span>{l}: {o}</span><b className={pct < 0 ? "is-neg" : "is-pos"}>{pct > 0 ? "+" : ""}{pct} %</b></li>)}</ul>
              : <p className="fl-hint">Tus detalles están en el promedio: no suben ni bajan el valor.</p>}
            {answered < TOTAL_DETAILS ? <button type="button" className="fl-inline" onClick={() => go("detalles")}>Agregar detalles para afinar el valor</button> : null}
          </section>
          <section className="fl-avt__card">
            <CardTitle title="¿Cuándo vender?" subtitle={sig.signal.sublabel} titleSize={14} subtitleSize={13} />
            <p className="fl-sig"><span className="fl-sigchip"><Signal level={sig.signal.level} width={24} title={`Nivel ${sig.signal.level} de 5`} /></span><b>{sig.signal.label}</b></p>
            <dl className="fl-when">
              <div><dt>Demanda en {sig.seasonal.currentMonth}</dt><dd>{sig.seasonal.currentFactor > 0 ? "+" : ""}{Math.round(sig.seasonal.currentFactor)} %</dd></div>
              <div><dt>En 12 meses</dt><dd>{usd(sig.projection.value365d)}</dd><small>−{((1 - sig.projection.value365d / market) * 100).toFixed(1)} %</small></div>
            </dl>
            {sig.timing.bestMonths.length ? <p className="fl-pills"><span>Mejores meses</span>{sig.timing.bestMonths.map((m: { monthLabel: string }) => <em key={m.monthLabel}>{m.monthLabel}</em>)}</p> : null}
          </section>
        </div>
        <Accordion title="Proyección mes a mes" titleSize={14} className="fl-acc">{projUI}</Accordion>
        {tailUI}
        <p className="fl-legal">Valuación estimativa generada por el motor AVT.ai. No constituye oferta comercial. Los valores reales pueden variar según condición específica del vehículo, documentación y condiciones del mercado al momento de la transacción.</p>
        <footer className="fl-decide">
          <div><b>¿Qué quieres hacer con este valor?</b><span>Guárdalo en Mis valorizaciones o publícalo ahora; no volverás a llenar estos datos.</span></div>
          <div className="fl-decide__btns">
            <Button variant="outline" className="fl-save" onClick={saveValuation}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4z" /></svg>Guardar</Button>
            <Button variant="primary" onClick={() => go("info")}>Publicar</Button>
          </div>
        </footer>
      </section> : null}
      {showResult && !ficha ? <section className={`fl-result fl-result--ds${rvAlt || revela ? " fl-result--rv" : ""}`} id="fl-result" aria-labelledby="fl-h">
        {revela ? <Revela d={rdata} /> : rvAlt ? <Resultado d={rdata} variant={rvAlt} /> : <>
        <div className="fl-hero">
          <div className="fl-hero__top">
            <small>{car} · {km} km · {useYears} {useYears === 1 ? "año" : "años"} de uso</small>
            <span className="fl-hero__conf">Confianza {conf} %</span>
          </div>
          <h1 id="fl-h" tabIndex={-1}>{isPub && !single ? "Tu vehículo vale hoy" : "Valor de mercado hoy"}</h1>
          <b className="fl-hero__big"><CountUp to={market} /></b>
          {/* Rango AVT como escala: dónde cae el valor entre el mínimo y el máximo. */}
          <div className="fl-hero__range" role="img" aria-label={`Rango estimado de ${usd(low)} a ${usd(high)}`}>
            <span>{usd(low)}</span><i><em style={{ left: `${((market - low) / (high - low)) * 100}%` }} /></i><span>{usd(high)}</span>
          </div>
          {/* Textos exactos de AVT (ResultScreen): subtítulo del valor y aviso legal. */}
          <p className="fl-hero__sub">Estimación basada en depreciación real, estacionalidad y kilometraje</p>
          <p>Valuación estimativa generada por el motor AVT.ai. No constituye oferta comercial. Los valores reales pueden variar según condición específica del vehículo, documentación y condiciones del mercado al momento de la transacción.</p>
        </div>
        <dl className="vz-pair fl-two">
          <div><dt>Valor de recompra</dt><dd>{usd(recompra)}</dd><small>Compra inmediata para dealers</small></div>
          <div><dt>Estimación Subastop</dt><dd>{usd(subastop)}</dd><small>Cierre en subasta VMC</small></div>
        </dl>
        <div className="fl-avt">
          <section className="fl-avt__card">
            <CardTitle title="Proyección de valor" subtitle={sig.projection.value365d ? `−${((1 - sig.projection.value365d / market) * 100).toFixed(1)} % en 12 meses` : ""} titleSize={14} subtitleSize={13} />
            {projUI}
          </section>
          <section className="fl-avt__card">
            <CardTitle title="Señal de venta AVT" subtitle={sig.signal.sublabel} titleSize={14} subtitleSize={13} />
            <p className="fl-sig"><span className="fl-sigchip"><Signal level={sig.signal.level} width={24} title={`Nivel ${sig.signal.level} de 5`} /></span><b>{sig.signal.label}</b></p>
            <p>Demanda en {sig.seasonal.currentMonth}: <b>{sig.seasonal.currentFactorLabel}</b> · tendencia {sig.seasonal.trend} {sig.seasonal.trendArrow} {sig.seasonal.nextMonth}</p>
            {sig.timing.dailyValueLoss > 0 ? <p className="fl-loss">Tu vehículo pierde ~{usd(sig.timing.dailyValueLoss)} por día</p> : null}
            {sig.timing.bestMonths.length ? <p className="fl-pills"><span>Mejores meses</span>{sig.timing.bestMonths.map((m: { monthLabel: string }) => <em key={m.monthLabel}>{m.monthLabel}</em>)}</p> : null}
            {sig.copy.headline ? <p><b>{sig.copy.headline}</b> {sig.copy.body}</p> : null}
          </section>
        </div>
        </>}
        {revela ? null : rvAlt ? <>{compsUI}{detailAccUI}</> : tailUI}
        {/* Barra sticky: al final del resultado para que acompañe todo el scroll (visible desde el valor, como el «Guardar» de AVT). */}
        {/* 19/10 · VMC desde Publicar: lo que falta en una línea y la entrada a la publicación en Negociable (botón y borde teal). */}
        <footer className={`fl-decide${vmc && isPub ? " fl-decide--neg" : ""}`}>
          {vmc && isPub ? <div><b>¿Seguimos con tu publicación?</b>
            <span>Ya tenemos los datos del vehículo. Falta: <em>fotos</em> · <em>descripción</em> · <em>pago de &gt;S&lt; {FEE_SC}</em></span></div>
          : <div><b>{isPub ? "¿Seguimos con tu publicación?" : "¿Qué quieres hacer con este valor?"}</b>
            <span>{isPub ? "Ya tenemos los datos del vehículo: solo faltan fotos, descripción y el pago." : "Guárdalo en Mis valorizaciones o publícalo ahora; no volverás a llenar estos datos."}</span></div>}
          <div className="fl-decide__btns">
            <Button variant="outline" className="fl-save" onClick={saveValuation}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4z" /></svg>Guardar</Button>
            <Button variant="primary" onClick={() => go("info")}>{isPub ? "Continuar publicación" : "Publicar"}</Button>
          </div>
        </footer>
      </section> : null}

      {/* ── Guardado ─────────────────────────────────── */}
      {step === "guardado" ? <section className="fl-done" aria-labelledby="fl-h">
        <span className="fl-done__check"><CheckIcon size={36} /></span>
        <h1 id="fl-h" tabIndex={-1}>Guardamos tu valorización</h1>
        <p>{car} · {usd(market)} · la encuentras en Mis valorizaciones. Desde ahí puedes publicar tu vehículo cuando quieras.</p>
        <div className="fl-done__btns"><a className="fl-link-btn" href={vmc ? "/producto/mi-garaje/m/vmc-valorizaciones" : "/producto/mi-garaje/m/valorizaciones"}>Ir a Mis valorizaciones</a><ProfileButton href={home}>Volver a Mi Garaje</ProfileButton></div>
      </section> : null}

      {/* ── 4 · Información adicional ────────────────── */}
      {step === "info" ? <section className="fl-card" aria-labelledby="fl-h">
        <header><h1 id="fl-h" tabIndex={-1}>Completa tu publicación{vmc ? <span className="fl-negtag">Negociable</span> : null}</h1><p>{vmc ? "Solo lo que falta. Lo opcional está marcado." : "Solo te pedimos lo que la valorización no tiene. Todos los campos son obligatorios, salvo los marcados como opcional."}</p></header>
        {tried && infoMissing.length ? <div className="fl-errsum" id="fl-errsum" role="alert" tabIndex={-1}>
          <b>Falta completar {infoMissing.length} {infoMissing.length === 1 ? "dato" : "datos"}</b>
          <ul>{infoMissing.map(([id, l]) => <li key={id}><button type="button" className="fl-inline" onClick={() => focusField(id)}>{l}</button></li>)}</ul></div> : null}
        {/* VMC (16/10): el auto en una línea y cuántos detalles ya están; sin la lista de campos (era mucho texto). */}
        {vmc ? <div className="fl-have fl-have--ds"><span className="fl-have__ico vd-host" aria-hidden><Vidrio s="valorizaciones" size={40} /></span>
          <small className="fl-have__k">De tu valorización</small><b className="fl-have__car">{car} {version}</b><span className="fl-have__m">{km} km{answered ? ` · ${answered} ${answered === 1 ? "detalle" : "detalles"}` : ""}</span>
          <button type="button" className="fl-chg" onClick={() => go("vehiculo")} aria-label={`Cambiar el vehículo (${car} ${version})`}>Cambiar</button></div> :
        <div className="fl-have"><span><CheckIcon size={16} /> Ya lo tenemos de tu valorización</span>
          <p>Marca, modelo, año, versión, kilometraje{ans.trans !== undefined ? ", transmisión" : ""}{ans.fuel !== undefined ? ", combustible" : ""}{ans.drive !== undefined ? ", tracción" : ""}{ans.ext !== undefined ? ", estado" : ""}{ans.sun !== undefined ? ", techo solar" : ""} · {car} {version} · {km} km</p><button type="button" className="fl-tlink" onClick={() => go("vehiculo")}>Cambiar</button></div>}

        <fieldset className={`fl-photos${showErr("f-fotos") ? " is-error" : ""}`} id="f-fotos"><legend>Fotos <small>{gallery.length} de {MAX_PHOTOS}</small></legend>
          <div className="fl-shots">{SHOTS.map(([k, l]) => shots[k]
            ? <figure key={k} className={`fl-shot is-full${cover === k ? " is-cover" : ""}`}><img src={shots[k]} alt={l} />
                <figcaption>{cover === k ? <span className="fl-shot__cover">Portada</span> : <button type="button" onClick={() => setCover(k)}>Usar de portada</button>}<span>{l}</span></figcaption>
                <button type="button" className="fl-shot__x" aria-label={`Quitar foto: ${l}`} onClick={() => { setShots((x) => { const n = { ...x }; delete n[k]; return n; }); if (cover === k) setCover(SHOTS.find(([o]) => o !== k && shots[o])?.[0] ?? "frente"); }}>×</button></figure>
            : <label key={k} className="fl-shot"><input type="file" accept={PHOTO_TYPES.join(",")} className="fl-sr" onChange={addPhoto(k)} onBlur={touch("f-fotos")} />
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg><span>{l}</span></label>)}
            {extra.map((u, i) => <figure key={u} className="fl-shot is-full"><img src={u} alt={`Otra foto ${i + 1}`} /><figcaption><span>Otra</span></figcaption>
              <button type="button" className="fl-shot__x" aria-label={`Quitar otra foto ${i + 1}`} onClick={() => setExtra((x) => x.filter((v) => v !== u))}>×</button></figure>)}
            {gallery.length < MAX_PHOTOS ? <label className="fl-shot fl-shot--more"><input type="file" accept={PHOTO_TYPES.join(",")} multiple className="fl-sr" onChange={addPhoto(null)} /><span className="fl-shot__plus">+</span><span>Otras fotos</span></label> : null}
          </div>
          {photoErr ? <p className="fl-err" role="alert">{photoErr}</p> : showErr("f-fotos") ? <p className="fl-err">Agrega al menos una foto.</p> : null}
          <p className="fl-hint">Con luz de día y el vehículo completo. Las 6 tomas guiadas ayudan a vender. Toca una toma para agregarla · hasta {MAX_PHOTOS} fotos · JPEG, PNG o WebP de hasta {MAX_MB} MB.</p>
        </fieldset>

        {/* VMC (16/10): con el lenguaje negociable de Concorde (borde de CardViewer negotiable + etiqueta de OfferType). */}
        {vmc ? <div className="fl-kindnote fl-kindnote--neg"><span className="fl-negtag">Negociable</span><p><b>Tu vehículo se publica como oferta Negociable.</b> Recibes propuestas y decides si las aceptas, rechazas o contrapropones.</p></div>
        : <div className="fl-kindnote"><span className="g-status g-status--done">Negociable</span><p>Tu vehículo se publica como oferta <b>Negociable</b>: recibes propuestas y decides si las aceptas, rechazas o contrapropones.</p></div>}

        <div className="fl-sub">{vmc ? subHead("datos", "Datos de la publicación", ["f-expect", "f-placa", "f-cc"]) : <CardTitle title="Datos de la publicación" subtitle="" titleSize={15} />}</div>
        <div className="fl-grid fl-grid--datos">
          <label className="fl-field"><span className="fl-label">Placa</span><Input id="f-placa" onBlur={touch("f-placa")} value={plate} onChange={(v) => setPlate(v.toUpperCase())} placeholder="ABC-123" className="fl-input" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false} maxLength={7}
            variant={showErr("f-placa") ? "error" : "default"} errorMessage={showErr("f-placa") ? "Ingresa la placa" : undefined} aria-label="Placa" /></label>
          <label className={`fl-field${vmc ? " fl-field--price" : ""}`}><span className="fl-label">¿Cuánto esperas recibir? (US$)</span><Input id="f-expect" onBlur={touch("f-expect")} value={expect} onChange={(v) => setExpect(v.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} placeholder={market.toLocaleString("en-US")} inputMode="numeric" className="fl-input"
            variant={showErr("f-expect") ? "error" : "default"} errorMessage={showErr("f-expect") ? "Ingresa cuánto esperas recibir" : undefined} aria-label="Cuánto esperas recibir (US$)" />
            {expState ? <span className={`fl-gauge fl-gauge--${expState}`} aria-live="polite">{expState === "ok" ? "Dentro del rango AVT: buen punto de partida." : expState === "high" ? "Por encima del rango AVT: puede tardar más en recibir propuestas." : "Por debajo del rango AVT: podrías estar dejando dinero."}</span> : null}
            {/* VMC (16/10): el rango AVT como 3 atajos de un toque (bajo · mercado · alto) en vez de un enlace al final del texto. */}
            {vmc ? <span className="fl-quick__src" aria-hidden><Vidrio s="valorizaciones" size={20} />De tu valorización AVT · toca para usar</span> : null}
            {vmc ? <span className="fl-quick" role="group" aria-label="Usar un valor de la valorización AVT">{([["Rango bajo", low], ["Mercado", market], ["Rango alto", high]] as [string, number][]).map(([l, v]) => {
              const on = expect === v.toLocaleString("en-US");
              return <button key={l} type="button" className={`fl-pill${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => { setExpect(v.toLocaleString("en-US")); }}>
                <ConditionPill variant={on ? "filled" : "outline"}><small>{l}</small>{usd(v)}</ConditionPill></button>; })}</span>
            : <span className="fl-hint">Valor de mercado: {usd(market)} · rango {usd(low)} – {usd(high)}{expect !== market.toLocaleString("en-US") ? <> · <button type="button" className="fl-inline" onClick={() => setExpect(market.toLocaleString("en-US"))}>Usar valor de mercado</button></> : null}</span>}</label>
          {mechMissing.length ? null : ccField}
        </div>

        {/* Cilindrada + la mecánica que se saltó en AVT (2–4 campos: 3 en fila de 3, el resto en 2 columnas). Sin faltantes, cilindrada va en Perfil. */}
        {mechMissing.length ? <>
        <div className="fl-sub">{vmc ? subHead("mec", "Mecánica", mechMissing.map((f) => `f-${f.id}`), "Completa lo que no indicaste en la valorización") : <CardTitle title="Mecánica" subtitle="Completa lo que no indicaste en la valorización" titleSize={15} subtitleSize={13} />}</div>
        <div className="fl-grid">
          {ccField}
          {mechMissing.map((f) =>
            <Select key={f.id} id={`f-${f.id}`} onBlur={touch(`f-${f.id}`)} error={showErr(`f-${f.id}`) ? `Elige ${f.label.toLowerCase()}` : undefined} label={`${f.label} *`} value={mech[f.id] ?? ""} onChange={(v) => setMech((m) => ({ ...m, [f.id]: v }))} options={f.opts.map(([o]) => o)} placeholder={`Selecciona ${f.label.toLowerCase()}`} />)}
        </div>
        </> : null}

        <div className="fl-sub">{vmc ? subHead("ubic", "Ubicación del vehículo", ["f-ubic"]) : <CardTitle title="Ubicación del vehículo" subtitle="" titleSize={15} />}</div>
        <div className="fl-grid fl-grid--3">
          <Select id="f-ubic" onBlur={touch("f-ubic")} error={showErr("f-ubic") && !city ? "Elige el departamento" : undefined} label="Departamento" value={city} onChange={(v) => { setCity(v); setProv(""); setDist(""); }} options={["Lima", "Arequipa", "La Libertad", "Piura", "Cusco"]} placeholder="Departamento" />
          <Select label="Provincia" value={prov} onChange={(v) => { setProv(v); setDist(""); }} options={city ? [city === "La Libertad" ? "Trujillo" : city, "Otra provincia"] : []} placeholder={city ? "Provincia" : "Primero el departamento"} disabled={!city} error={showErr("f-ubic") && city && !prov ? "Elige la provincia" : undefined} />
          <Select label="Distrito" value={dist} onChange={setDist} options={prov ? ["Miraflores", "San Isidro", "Surco", "La Molina", "Otro distrito"] : []} placeholder={prov ? "Distrito" : "Primero la provincia"} disabled={!prov} error={showErr("f-ubic") && prov && !dist ? "Elige el distrito" : undefined} />
        </div>

        <div className="fl-sub" id="f-equip" tabIndex={-1}>{vmc ? subHead("equip", "Equipamiento", null) : <CardTitle title="Equipamiento" subtitle="Opcional" titleSize={15} subtitleSize={13} />}</div>
        <div className="fl-checks">{["Sistema ABS", "Seguro central", "Bloqueo de ruedas", "Freno de mano electrónico", "Espejos eléctricos", "Llanta de repuesto", "Sensores de retroceso", "Asientos eléctricos", "Catalizador", "Cámara de reversa", "Techo solar", "Sistema de audio", "Aire acondicionado", "GPS", "Luces neblineras"].map((e) => {
          const fromAvt = e === "Techo solar" && ans.sun === 0;
          const on = equip.has(e) || fromAvt;
          return <div key={e} className={`fl-check${on ? " is-on" : ""}`}><TermsSelector className="fl-check__lbl" checked={on} disabled={fromAvt} onChange={() => setEquip((x) => { const n = new Set(x); n.has(e) ? n.delete(e) : n.add(e); return n; })}>{e}</TermsSelector>{fromAvt ? <small>de tu valorización</small> : null}</div>;
        })}</div>

        <div className="fl-sub">{vmc ? subHead("docs", "Documentos y detalles", null) : <CardTitle title="Documentos y detalles" subtitle="Opcional" titleSize={15} subtitleSize={13} />}</div>
        <div className="fl-checks">{["Revisión técnica al día", "SOAT al día", "Tarjeta de propiedad", "Conversión GNV/GLP", "Llaves completas"].map((e) => {
          const fromAvt = e === "Conversión GNV/GLP" && mechLabel("fuel") === "GLP/GNV";
          const on = docs.has(e) || fromAvt;
          return <div key={e} className={`fl-check${on ? " is-on" : ""}`}><TermsSelector className="fl-check__lbl" checked={on} disabled={fromAvt} onChange={() => setDocs((x) => { const n = new Set(x); n.has(e) ? n.delete(e) : n.add(e); return n; })}>{e}</TermsSelector>{fromAvt ? <small>de tu valorización</small> : null}</div>;
        })}</div>

        <div className="fl-sub">{vmc ? subHead("desc", "Descripción", ["f-desc"]) : <CardTitle title="Descripción" subtitle="" titleSize={15} />}</div>
        <label className="fl-field"><span className="fl-label">Descripción del vehículo</span>
          <textarea id="f-desc" onBlur={touch("f-desc")} aria-invalid={showErr("f-desc") || undefined} className={`fl-textarea${showErr("f-desc") ? " is-error" : ""}`} rows={4} maxLength={999} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Cuenta lo que hace especial a tu vehículo: mantenimientos, extras, por qué lo vendes…" />
          {showErr("f-desc") ? <span className="fl-err">Escribe una descripción (o usa «Usar texto sugerido»).</span> : null}
          <span className="fl-desc-foot"><span className="fl-hint">{desc.length} / 999</span>
            <button type="button" className="fl-ai" onClick={() => setDesc(suggestedDesc())}>Usar texto sugerido</button></span></label>
        <div id="f-terms" className={showErr("f-terms") ? "fl-terms is-error" : "fl-terms"}><TermsSelector checked={terms} onChange={setTerms}>Acepto los Términos y Condiciones de publicación de VMC Subastas</TermsSelector>
          {showErr("f-terms") ? <span className="fl-err">Acepta los términos para publicar.</span> : null}</div>
        {/* Barra fija: cuánto falta y salto al primer pendiente (resumen de errores al intentar avanzar). */}
        <footer className="fl-foot fl-foot--sticky">
          <button type="button" className="fl-tlink" onClick={() => go("resultado")}>Atrás</button>
          <div className="fl-foot__right">
            {infoMissing.length ? <button type="button" className="fl-left" onClick={() => focusField(infoMissing[0][0])}>Faltan {infoMissing.length} de {REQ.length}</button> : <span className="fl-left is-ok"><CheckIcon size={14} /> Todo listo</span>}
            <Button variant="primary" onClick={() => { if (!infoMissing.length) { go("preview"); return; } setTried(true); requestAnimationFrame(() => document.getElementById("fl-errsum")?.focus()); }}>Ver vista previa</Button>
          </div>
        </footer>
      </section> : null}

      {/* ── 5 · Vista previa ─────────────────────────── */}
      {step === "preview" ? <section className="fl-prev" aria-labelledby="fl-h">
        <header className="fl-prev__bar">
          <div>{vmc ? <span className="fl-negtag fl-negtag--step">Último paso</span> : <span className="fl-prev__tag">Último paso</span>}<h1 id="fl-h" tabIndex={-1}>Vista previa de tu oferta</h1><p>Así la verán los compradores en VMC Subastas. Revisa los datos antes de pagar.</p></div>
          {/* VMC (19/10): Abraham pidió las acciones arriba, en la cabecera, en vez de la barra fija inferior. */}
          {vmc ? <><div className="fl-prev__actions fl-prev__actions--vmc"><button type="button" className="fl-chg" onClick={() => go("info")}>Editar mi oferta</button>
            <span className="fl-prev__fee"><small>Costo de publicación</small><b>&gt;S&lt; {FEE_SC}</b></span><span className={`fl-pubwrap${pubHint ? " is-hint" : ""}`}><Button variant="primary" onClick={publishNow}>¡Publica ahora!</Button></span></div>
          {pubHint ? <p className="fl-pubhint" role="status"><InfoIcon size={16} /><span>«Negocia ahora» es lo que verán los compradores. Para publicar tu oferta, toca <b>¡Publica ahora!</b></span>
            <button type="button" className="fl-pubhint__x" aria-label="Cerrar aviso" onClick={() => setPubHint(false)}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button></p> : null}</>
          : <div className="fl-prev__actions"><button type="button" className="fl-tlink" onClick={() => go("info")}>Cambiar datos</button><Button variant="primary" onClick={() => go("pago")}>Continuar al pago</Button></div>}
        </header>
        <div className="fl-prev__wrap"><div className="fl-prev__page">
          <div className="fl-prev__main">
            <AuctionStatus variant="negotiable" title={`${modelName} ${version}`.trim()} subtitle="Vendedor: SubasCars" className="fl-prev__status" />
            <CardViewer variant="negotiable" images={gallery.length ? gallery : photos} imageAlt={car} embedded className="fl-prev__viewer" />
            <button type="button" className="fl-change" onClick={() => goField("f-fotos")}>Cambiar fotos o portada</button>
            <section className="fl-prev__info">
              <div className="fl-prev__h"><h2>Información general</h2><button type="button" className="fl-change" onClick={() => goField("f-placa")}>Cambiar</button></div>
              <dl className="vz-factors">{[["Versión", version], ["Año", year], ["Kilometraje", `${km} km`], ["Cilindrada", cc || "—"],
                ["Ubicación", [dist, prov, city].filter(Boolean).join(", ") || "—"], ["Transmisión", mechLabel("trans")],
                ["Combustible", mechLabel("fuel")], ["Tracción", mechLabel("drive")]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              {desc ? <><div className="fl-prev__h"><h2>Descripción</h2><button type="button" className="fl-change" onClick={() => goField("f-desc")}>Cambiar</button></div><p className="fl-preview__desc">{desc}</p></> : null}
              <div className="fl-prev__h"><h2>Equipamiento y documentos</h2><button type="button" className="fl-change" onClick={() => goField("f-equip")}>Cambiar</button></div>
              <p className="fl-prev__list"><b>Equipamiento:</b> {equip.size ? [...equip].join(" · ") : "—"}</p>
              <p className="fl-prev__list"><b>Documentos:</b> {docs.size ? [...docs].map((d) => `${d}: Sí`).join(" · ") : "—"}</p>
            </section>
          </div>
          <aside className="fl-prev__side">
            <DetailCard variant="negotiable" startLabel="Publicada" day="Al aprobarse" time="" views={0} likes={0} participants={0}
              bannerText="Oferta negociable" title={car} priceLabel="Expectativa de venta" price={expect ? `US$ ${expect}` : usd(market)} commission="Sin comisión al vendedor" ctaLabel="Negocia ahora" onParticipate={vmc ? pointPublish : undefined} />
            <button type="button" className="fl-change" onClick={() => goField("f-expect")}>Cambiar cuánto esperas recibir</button>
            <div className="fl-prev__pills"><ConditionPill variant="outline">Pago único &gt;S&lt; 25</ConditionPill></div>
            <p className="fl-note"><InfoIcon size={14} /> Valor de referencia AVT: {usd(market)} · solo lo ves tú; no se muestra a los compradores.</p>
          </aside>
        </div></div>
        {vmc && noSC ? <div className="fl-modal" role="dialog" aria-modal="true" aria-labelledby="fl-nosc" onClick={(e) => { if (e.target === e.currentTarget) setNoSC(false); }}>
          <div className="fl-modal__box">
            <button type="button" className="fl-modal__x" aria-label="Cerrar" onClick={() => setNoSC(false)}><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
            <Vidrio s="alertas" size={48} />
            <h2 id="fl-nosc">SubasCoins insuficientes</h2>
            <p>Necesitas recargar para activar tu oferta.</p>
            <dl><div><dt>Costo de publicación</dt><dd>&gt;S&lt; {FEE_SC}</dd></div><div><dt>Tu saldo</dt><dd>&gt;S&lt; {saldoSC}</dd></div>
              <div className="is-total"><dt>A recargar</dt><dd>&gt;S&lt; {Math.max(0, FEE_SC - saldoSC)}</dd></div></dl>
            <Button variant="secondary" onClick={() => setNoSC(false)}>Recargar {Math.max(0, FEE_SC - saldoSC)} SubasCoins</Button>
            <Button variant="outline" onClick={() => setNoSC(false)}>Cancelar</Button>
          </div></div> : null}
      </section> : null}

      {/* ── 6 · Pago ─────────────────────────────────── */}
      {step === "pago" ? <section className="fl-card" aria-labelledby="fl-h">
        <header><h1 id="fl-h" tabIndex={-1}>Paga tu publicación{vmc ? <span className="fl-negtag">Negociable</span> : null}</h1><p>Un solo pago: cubre la publicación y sus republicaciones hasta que se venda. Después del pago, VMC la revisa antes de publicarla.</p></header>
        <div className="fl-pay">
          <fieldset className="fl-pay__methods"><legend>Medio de pago</legend>
            {/* T&C IV.2.b · Centro de Ayuda «La recarga» y «Subascoins». Por confirmar: el Fee por publicación es en SC (IV.11.2.a) y la Recarga BCP agrega saldo en US$. */}
            {([["sc", "SubasCoins de Mi Wallet", "Tienes >S< 1,250 disponibles"], ["card", "Adquirir SubasCoins con tarjeta", "Mínimo >S< 30 · pasarela Niubiz · +3.9 % de fee por uso de pasarela"], ["bcp", "Recarga en BCP con tu Código Único de Usuario (C.U.U.)", "Saldo en US$ · sin fee de pasarela · hasta 24 horas hábiles en acreditarse"]] as const).map(([id, t, s]) =>
              <label key={id} className={`fl-method${pay === id ? " is-on" : ""}`}><input type="radio" name="pay" checked={pay === id} onChange={() => setPay(id)} /><span><b>{t}</b><small>{s}</small></span></label>)}
          </fieldset>
          <aside className="fl-pay__sum"><h2>Resumen</h2>
            <p>{car}</p>
            <dl><div><dt>Fee por publicación</dt><dd>&gt;S&lt; {FEE_SC}</dd></div>
              {pay === "card" ? <div><dt>Fee por uso de pasarela (3.9 %)</dt><dd>&gt;S&lt; {(FEE_SC * 0.039).toFixed(2)}</dd></div> : null}
              <div><dt>Comisión al vender</dt><dd>Sin costo</dd></div>
              <div className="is-total"><dt>Total</dt><dd>&gt;S&lt; {pay === "card" ? (FEE_SC * 1.039).toFixed(2) : FEE_SC}</dd></div></dl>
            <ul className="fl-perks"><li>Republicación sin costo hasta que se venda</li><li>Se publica en el perfil comercial SubasCars</li></ul>
            <p className="fl-note"><InfoIcon size={14} /> <a href="https://www.vmcsubastas.com/condiciones-y-terminos" target="_blank" rel="noreferrer">Condiciones de publicación</a></p>
            <Button variant="primary" onClick={() => go("listo")}>{pay === "sc" ? `Pagar >S< ${FEE_SC}` : pay === "card" ? "Ir a pagar con tarjeta" : "Ver mi C.U.U."}</Button>
          </aside>
        </div>
        <footer className="fl-foot"><button type="button" className="fl-tlink" onClick={() => go("preview")}>Atrás</button></footer>
      </section> : null}

      {/* ── Listo: pendiente de aprobación ──────────── */}
      {step === "listo" ? <section className="fl-done" aria-labelledby="fl-h">
        {/* VMC: el check de Concorde en teal de Negociable (mismo trazo; degradado #30E8EC → #00A8AB → #008688) */}
        <span className="fl-done__check">{vmc ? <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden><defs><linearGradient id="fl-negchk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#30E8EC" /><stop offset=".45" stopColor="#00A8AB" /><stop offset="1" stopColor="#006E70" /></linearGradient></defs><circle cx="18" cy="18" r="18" fill="url(#fl-negchk)" /><path d="M10.5 18.5l5 5 10-11" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <CheckIcon size={36} />}</span>
        <h1 id="fl-h" tabIndex={-1}>¡Pago recibido! Tu publicación está en revisión</h1>
        <p>{car} aparece en Mis publicaciones como <b>Pendiente de aprobación</b>. Te avisaremos cuando esté publicada.</p>
        <ol className="fl-track"><li className="is-done">Pago</li><li className="is-now">Aprobación VMC</li><li>Publicada</li></ol>
        {vmc
          ? <div className="fl-done__btns"><Button variant="primary" onClick={() => returnToGarage("publicacion")}>Ir a mi garaje · {garageCountdown}</Button></div>
          : <div className="fl-done__btns"><a className="fl-link-btn" href={`${home}#sec-publicaciones`}>Ver en Mis publicaciones</a><ProfileButton href={home}>Volver a Mi Garaje</ProfileButton></div>}
      </section> : null}
    </main>
    {sideSlot ? createPortal(<iframe className="pr-arte pr-arte--side" src={bannerSrc(sideBan, "side400")} title={`Publicidad: ${sideBan.titulo}`} />, sideSlot) : null}
  </Chrome>;
}
