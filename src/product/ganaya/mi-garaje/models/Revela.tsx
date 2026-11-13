"use client";

// Resultado «Revela» (16/10, PROPUESTA para Julio). Mismo contenido y MISMO ORDEN que la pantalla de resultado de AVT
// (avt-ai src/App.jsx ResultScreen): encabezado → Valor de mercado · Hoy → Recompra · Estimación Subastop → Proyección de valor
// (hitos 1M·3M·6M·12M) → Señal de venta AVT → Momento óptimo de venta → Vehículos similares en el mercado → Detalles de tu valuación.
// Solo cambia el diseño: íconos de vidrio, barras y un reveal único de ~1,4 s (sin animación con «reducir movimiento»).
import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Vidrio } from "@/src/product/ganaya/mi-garaje/app/iconos/Vidrio";
import { Projection, Season, LIGHT, type RData } from "./Resultado";
import "./resultado.css";
import "./revela.css";

// AVT ResultScreen (App.jsx): tabla de «Momento óptimo de venta» y nombres de mes.
const SELL_SEASONAL: Record<number, number> = { 1: 13.1, 2: 13.1, 3: 8.1, 4: 8.1, 5: 8.1, 6: -5.1, 7: -5.1, 8: 8.1, 9: 13.1, 10: 8.1, 11: -5.1, 12: -5.1 };
const MO_FULL = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const usd = (n: number) => `US$ ${Math.round(n).toLocaleString("en-US")}`;

/** Cifra que sube hasta el valor (como el Counter de AVT). Solo visual: el valor real va en texto para lectores de pantalla. */
function Count({ to, delay = 0, still }: { to: number; delay?: number; still?: boolean }): JSX.Element {
  const [v, setV] = useState(to);
  useEffect(() => {
    if (still || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; const t0 = performance.now() + delay, from = to * 0.85; setV(from);
    const tick = (t: number) => { const p = Math.max(0, Math.min(1, (t - t0) / 900)); setV(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to, delay]);
  return <><span aria-hidden>{usd(v)}</span><span className="g-sr">{usd(to)}</span></>;
}


/** still: resultado ya guardado (Mis valorizaciones): se muestra quieto, el reveal es solo para el momento de valorizar. */
/** El texto de AVT (sellingSignal.js, copia literal) escribe «$» y deja «pierdes ~$0» cuando no hay pérdida diaria:
 *  aquí se muestra en US$ y sin la frase de $0. Reportado a AVT para corregirlo en su fuente. */
const copyBody = (t = "") => t.replace(/[^.]*~?\$0(\/día)?[^.]*\.\s*/g, "").replace(/~?\$(\d[\d,.]*)/g, (m, n) => `${m.startsWith("~") ? "~" : ""}US$ ${n}`).trim();

// at: fecha del cálculo de una valorización guardada («Valor de mercado al 01/10»); sin ella, «hoy» como en AVT.
export default function Revela({ d, still, at }: { d: RData; still?: boolean; at?: string }): JSX.Element {
  const s = d.sig;
  const [car, ...meta] = d.meta.split(" · ");
  // Vehículos similares (AVT): Promedio · Rango · AVT vs Mkt, y cada publicación con su % frente a AVT.
  const vals = d.comps.map((c) => c.v), avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length / 10) * 10;
  const cmin = Math.min(...vals), cmax = Math.max(...vals), vsMkt = Math.round(((d.market - avg) / avg) * 100);
  // Escala de AVT: de mín × 0.9 a máx × 1.1 de las publicaciones.
  const X = (v: number) => `${((v - cmin * 0.9) / (cmax * 1.1 - cmin * 0.9)) * 100}%`;
  const yMin = Math.min(...d.comps.map((c) => c.year)), yMax = Math.max(...d.comps.map((c) => c.year));
  const brandModel = d.factors?.[0]?.value ?? car.replace(/\s\d{4}$/, "");
  // Proyección: hitos de projectForward (AVT); Momento óptimo: SELL_SEASONAL de AVT, próximo pico (> 10) y meses bajo 0.
  const miles = (d.pf ?? []).filter((p) => p.label && p.label !== "Hoy") as { v: number; km: number; label: string }[], m12 = miles.find((m) => m.label === "12M");
  const cur = new Date().getMonth() + 1, ahead = Array.from({ length: 12 }, (_, i) => ((cur - 1 + i + 1) % 12) + 1);
  const nextPeak = ahead.find((m) => SELL_SEASONAL[m] > 10), dips = ahead.filter((m) => SELL_SEASONAL[m] < 0);
  const card = (i: number) => ({ className: "rv-card rva-step", style: { ["--i" as string]: i } });

  return <div className={`rv rv--claro rva${still ? " rva--still" : ""}`}>
    {/* 1-3 · Encabezado · Valor de mercado hoy · Recompra y Estimación Subastop (las dos tarjetas de AVT, aquí al pie del héroe) */}
    <section className="rva-hero" aria-labelledby="fl-h">
      <div className="rva-left">
        <header className="rva-top"><h1 id="fl-h" tabIndex={-1} className="rva-car">{car}</h1><p className="rva-meta">{meta.join(" · ")}</p></header>
        <div className="rva-value">
          <p className="rva-h">Valor de mercado {at ? `al ${at}` : "hoy"}</p>
          <p className="rva-big"><Count to={d.market} still={still} /></p>
          <p className="rva-note">Estimación basada en depreciación real, estacionalidad y kilometraje.</p>
        </div>
      </div>
      <ul className="rva-two">
        <li><Vidrio s="billetera" size={40} /><div><small>Valor de recompra</small><b><Count to={d.recompra} delay={300} still={still} /></b><span>Compra inmediata para dealers.</span></div></li>
        <li><Vidrio s="participaciones" size={40} /><div><small>Estimación Subastop</small><b><Count to={d.subastop} delay={400} still={still} /></b><span>Cierre en subasta VMC.</span></div></li>
      </ul>
    </section>

    {/* 4 · Proyección de valor (AVT ResultScreen: projectForward semanal; hitos 1M · 3M · 6M · 12M con valor, % y km) */}
    <section {...card(1)} aria-labelledby="rva-proy">
      <header className="rva-head"><Vidrio s="fecha" size={36} /><div><h2 id="rva-proy">Proyección de valor</h2><p>{m12 ? `−${(((d.market - m12.v) / d.market) * 100).toFixed(1)}% en 12 meses` : "Próximos 12 meses"}</p></div></header>
      <Projection d={d} t={LIGHT} gid="rva-p" ds />
      <dl className="rva-miles">{miles.map((m) => <div key={m.label}><dt>{m.label}</dt><dd>{usd(m.v)}<small>−{(((d.market - m.v) / d.market) * 100).toFixed(1)}% · {(m.km / 1000).toFixed(0)}k km</small></dd></div>)}</dl>
    </section>

    {/* 5 · Señal de venta AVT: 5 puntos + etiqueta, sublabel, demanda del mes y tendencia, pérdida diaria, mejores meses y el texto dinámico */}
    <section {...card(2)} aria-labelledby="rva-sig">
      <header className="rva-head"><Vidrio s="alertas" size={36} /><div><h2 id="rva-sig">Señal de venta AVT</h2><p>{s.signal.sublabel}</p></div>
        <span className="rva-level" role="img" aria-label={`Señal de venta: ${s.signal.label}, ${s.signal.level} de 5`}>
          <i aria-hidden>{[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= s.signal.level ? "is-on" : ""} />)}</i><b>{s.signal.label}</b></span></header>
      <dl className="rva-sig">
        <div><dt>Demanda en {s.seasonal.currentMonth}</dt><dd><b>{s.seasonal.currentFactorLabel}</b><span>Tendencia: {s.seasonal.trend} {s.seasonal.trendArrow} → {s.seasonal.nextMonth}{s.seasonal.nextFactor !== undefined ? ` (${s.seasonal.nextFactor > 0 ? "+" : ""}${s.seasonal.nextFactor}%)` : ""}</span></dd></div>
        {s.timing.dailyValueLoss > 0 ? <div><dt>Tu auto pierde</dt><dd><b>~US$ {s.timing.dailyValueLoss}/día</b></dd></div> : null}
        {s.timing.bestMonths.length ? <div><dt>Mejores meses</dt><dd className="rva-pills">{s.timing.bestMonths.map((m) => <em key={m.monthLabel} className={m.isPeakDemand ? "is-peak" : m.isHighDemand ? "is-high" : ""}>{m.monthLabel}</em>)}</dd></div> : null}
      </dl>
      {s.copy.headline ? <p className="rva-copy"><b>{s.copy.headline}</b> {copyBody(s.copy.body)}</p> : null}
    </section>

    {/* 6 · Momento óptimo de venta (AVT: SELL_SEASONAL, 3 tonos, mes actual con su %, próximo pico y meses a evitar) */}
    <section {...card(3)} aria-labelledby="rva-mom">
      <header className="rva-head"><Vidrio s="valorizaciones" size={36} /><div><h2 id="rva-mom">Momento óptimo de venta</h2><p>{s.signal.label} · {MO_FULL[cur]}</p></div></header>
      <Season d={{ ...d, now: cur, season: d.season.map((x) => ({ ...x, f: SELL_SEASONAL[x.m] })) }} t={LIGHT} ds />
      {nextPeak || dips.length ? <ul className="rva-ins">
        {nextPeak && nextPeak !== cur ? <li className="is-up">Próximo pico: <b>{MO_FULL[nextPeak]}</b> (+{SELL_SEASONAL[nextPeak]}%)</li> : null}
        {dips.length ? <li className="is-down">Evitar: <b>{[...new Set(dips.slice(0, 2).map((m) => MO_FULL[m]))].join(" – ")}</b> ({SELL_SEASONAL[dips[0]]}%)</li> : null}
      </ul> : null}
    </section>

    {/* 7 · Vehículos similares en el mercado (AVT: banda mín–máx de las publicaciones, marcador AVT, Promedio · Rango ± · AVT vs Mkt).
         En el lab son publicaciones de ejemplo: en producción vienen de getComparables. */}
    <section {...card(4)} aria-labelledby="rva-comp">
      <header className="rva-head"><Vidrio s="auto" size={36} /><div><h2 id="rva-comp">Vehículos similares en el mercado</h2><p>{d.comps.length} publicaciones encontradas</p></div></header>
      <p className="rva-win">Publicaciones de años cercanos · {yMin === yMax ? yMin : `${yMin}–${yMax}`} <span className="rva-demo">Ejemplo</span></p>
      <div className="rva-map" role="img" aria-label={`Publicaciones entre ${usd(cmin)} y ${usd(cmax)}; AVT ${usd(d.market)}`}>
        <span className="rva-band" style={{ left: X(cmin), width: `calc(${X(cmax)} - ${X(cmin)})` }} />
        <span className="rva-dot" style={{ left: X(d.market) }} />
      </div>
      <p className="rva-ends"><span>{usd(cmin)}</span><b>AVT: {usd(d.market)}</b><span>{usd(cmax)}</span></p>
      <dl className="rva-stats">
        <div><dt>Promedio</dt><dd>{usd(avg)}</dd></div>
        <div><dt>Rango</dt><dd>{d.comps.length <= 1 ? "Datos insuficientes" : `±${usd(Math.round((cmax - cmin) / 2 / 100) * 100)}`}</dd></div>
        <div><dt>AVT vs Mkt</dt><dd>{vsMkt >= 0 ? "+" : ""}{vsMkt}%</dd></div>
      </dl>
      <ul className="rva-list">{[...d.comps].map((c) => ({ ...c, dl: Math.round(((c.v - d.market) / d.market) * 100) })).sort((x, y) => Math.abs(x.dl) - Math.abs(y.dl)).map((c, i) =>
        <li key={i}><b>{usd(c.v)}</b><span>{brandModel} {c.year} · {c.km.toLocaleString("en-US")} km</span><em className={c.dl > 5 ? "is-down" : c.dl < -5 ? "is-up" : ""}>{c.dl >= 0 ? "+" : ""}{c.dl}% vs AVT</em></li>)}</ul>
    </section>

    {/* 8 · Detalles de tu valuación (AVT: lista plana — vehículo, MSRP de referencia, años de uso, cada respuesta con su tag y Valor estimado) */}
    <section {...card(5)} aria-labelledby="rva-det">
      <header className="rva-head"><Vidrio s="publicaciones" size={36} /><div><h2 id="rva-det">Detalles de tu valuación</h2><p>{(d.factors ?? []).length} factores</p></div></header>
      <ul className="rva-flist">{(d.factors ?? []).map((r) => <li key={r.label} className={r.bold ? "is-total" : ""}><span>{r.label}</span>
        <b className={r.mult && r.mult > 1 ? "is-up" : r.mult && r.mult < 1 ? "is-down" : ""}>{r.value}</b></li>)}</ul>
    </section>
    <p className="rv-legal rva-legal">Valuación estimativa generada por el motor AVT.ai. No constituye oferta comercial. Los valores reales pueden variar según condición específica del vehículo, documentación y condiciones del mercado al momento de la transacción. <span>v3.0</span></p>
  </div>;
}
