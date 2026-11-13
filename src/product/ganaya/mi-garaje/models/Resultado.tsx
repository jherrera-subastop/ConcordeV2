"use client";

// Resultado de Valorizar · direcciones «Claro» y «Vidrio» (16/10, PROPUESTA para Julio). Mismos datos y textos AVT que el
// resultado actual; cambia la composición: el valor se lee junto al mercado (tira de publicaciones), recompra y Subastop van
// en un solo eje («escalera») y los gráficos tienen eje real. SVG propio: 0 KB de librerías.
import { useLayoutEffect, useRef, useState } from "react";
import type { JSX, ReactNode, MouseEvent as RME } from "react";
import Signal from "@/src/product/ganaya/mi-garaje/concorde/components/Signal";
import "./resultado.css";

export type RData = {
  meta: string; market: number; low: number; high: number; conf: number;
  comps: { v: number; km: number; year: number }[]; recompra: number; subastop: number;
  proj: { v: number; full: string; f: number }[]; bridge: { label: string; note: string; v: number }[]; season: { m: number; f: number; name: string }[]; now: number;
  sig: { signal: { level: number; label: string; sublabel: string; color?: string }; seasonal: { currentMonth: string; currentFactorLabel: string; trend: string; trendArrow: string; nextMonth: string; nextFactor?: number };
    timing: { dailyValueLoss: number; bestMonths: { monthLabel: string; isPeakDemand?: boolean; isHighDemand?: boolean }[] }; copy: { headline?: string; body?: string } };
  // 19/10 · AVT ResultScreen: proyección semanal con km (projectForward) y la lista plana de factores
  msrp?: number; pf?: { v: number; km: number; label: string | null; date: Date }[]; factors?: { label: string; value: string; mult?: number; bold?: boolean }[];
};

const usd = (n: number) => `US$ ${Math.round(n).toLocaleString("en-US")}`;
const k1 = (n: number) => `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
const pct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n))} %`;

// Paleta validada con validate_palette.js (claro y sobre #2E0F70): violeta = tu valor / más demanda, naranja = menos demanda.
export const LIGHT = { a: "#8460E5", b: "#ED8936", ink: "#3B1782", text: "#191C1C", muted: "#6B6878", grid: "#ECEAF2", band: "#F5F0FF", mute: "#A39FB3", surface: "#FFFFFF" };
const GLASS = { a: "#9474F5", b: "#D07A2C", ink: "#FFFFFF", text: "#FFFFFF", muted: "#CFBAFF", grid: "rgba(255,255,255,.14)", band: "rgba(255,255,255,.12)", mute: "rgba(255,255,255,.6)", surface: "#3B1782" };
type Theme = typeof LIGHT;

/** Ancho real del contenedor: el SVG se dibuja a su tamaño para que el texto no se encoja en mobile. */
function useW(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null); const [w, setW] = useState(640);
  useLayoutEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width))); ro.observe(el); return () => ro.disconnect(); }, []);
  return [ref, w];
}

/** Tooltip compartido: el mouse y el foco de teclado muestran lo mismo; nunca es la única forma de leer el dato. */
function useTip() {
  const [tip, setTip] = useState<{ x: number; y: number; body: ReactNode } | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const at = (e: { clientX: number; clientY: number }, body: ReactNode) => { const r = host.current!.getBoundingClientRect(); setTip({ x: e.clientX - r.left, y: e.clientY - r.top, body }); };
  const atEl = (el: Element, body: ReactNode) => { const r = host.current!.getBoundingClientRect(), b = el.getBoundingClientRect(); setTip({ x: b.left + b.width / 2 - r.left, y: b.top - r.top, body }); };
  const hit = (body: ReactNode) => ({ tabIndex: 0, className: "rv-hit", onMouseMove: (e: RME) => at(e, body), onFocus: (e: React.FocusEvent) => atEl(e.currentTarget, body), onBlur: () => setTip(null) });
  const layer = tip ? <div className="rv-tip" style={{ left: tip.x, top: tip.y }} role="status">{tip.body}</div> : null;
  return { host, hit, layer, clear: () => setTip(null) };
}

/** Tira de mercado: rango AVT como banda, publicaciones similares como puntos y tu valor encima. */
function Strip({ d, t: th }: { d: RData; t: Theme }): JSX.Element {
  const [ref, W] = useW(), tip = useTip(), H = 104, P = 12;
  const vals = [...d.comps.map((c) => c.v), d.low, d.high], lo = Math.floor(Math.min(...vals) / 500) * 500, hi = Math.ceil(Math.max(...vals) / 500) * 500;
  const x = (v: number) => P + ((v - lo) / (hi - lo)) * (W - 2 * P), y0 = 66;
  const ticks = Array.from({ length: (hi - lo) / 500 + 1 }, (_, i) => lo + i * 500);
  const lx = Math.max(84, Math.min(W - 84, x(d.market)));
  return <div ref={ref} className="rv-w"><div ref={tip.host} className="rv-plot" onMouseLeave={tip.clear}>
    <svg width={W} height={H} className="rv-svg" role="img" aria-label={`Tu valor ${usd(d.market)} dentro del rango ${usd(d.low)} a ${usd(d.high)}, junto a ${d.comps.length} publicaciones similares`}>
      {ticks.map((v) => <g key={v}><line x1={x(v)} x2={x(v)} y1={34} y2={y0 + 14} stroke={th.grid} /><text x={x(v)} y={H - 4} textAnchor="middle" className="rv-tick" fill={th.muted}>{k1(v)}</text></g>)}
      <rect x={x(d.low)} y={y0 - 14} width={x(d.high) - x(d.low)} height={28} rx={14} fill={th.band} />
      {d.comps.map((c, i) => <g key={i} {...tip.hit(<><b>{usd(c.v)}</b><span>{c.year} · {c.km.toLocaleString("en-US")} km</span></>)}>
        <circle cx={x(c.v)} cy={y0} r={12} fill="transparent" /><circle cx={x(c.v)} cy={y0} r={5} fill={th.mute} stroke={th.surface} strokeWidth={2} /></g>)}
      <line x1={x(d.market)} x2={x(d.market)} y1={28} y2={y0} stroke={th.a} strokeWidth={2} />
      <circle cx={x(d.market)} cy={y0} r={8} fill={th.a} stroke={th.surface} strokeWidth={2} />
      <text x={lx} y={20} textAnchor="middle" className="rv-lab" fill={th.ink}>Tu vehículo · {usd(d.market)}</text>
    </svg>{tip.layer}</div>
    <ul className="rv-legend"><li><i style={{ background: th.a }} />Tu vehículo</li><li><i style={{ background: th.mute }} />Publicaciones similares ({d.comps.length})</li><li><i className="rv-sw-band" style={{ background: th.band }} />Rango AVT {usd(d.low)} – {usd(d.high)}</li></ul>
  </div>;
}

/** Escalera de venta: recompra, mercado y Subastop en un solo eje. */
function Ladder({ d, t: th }: { d: RData; t: Theme }): JSX.Element {
  const [ref, W] = useW(), tip = useTip(), narrow = W < 520, rowH = narrow ? 68 : 48, L = narrow ? 8 : Math.min(168, Math.round(W * 0.34)), R = narrow ? 8 : 92, top = 4;
  const lo = Math.floor(d.recompra / 1000) * 1000, hi = Math.ceil(d.high / 1000) * 1000, x = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  const rows = [
    { name: "Valor de recompra", note: "Compra inmediata para dealers", v: d.recompra },
    { name: "Valor de mercado", note: "Rango AVT", v: d.market, band: [d.low, d.high] as [number, number], main: true },
    { name: "Estimación Subastop", note: "Cierre en subasta VMC", v: d.subastop },
  ];
  const H = top + rows.length * rowH + 24;
  const ticks = Array.from({ length: (hi - lo) / 1000 + 1 }, (_, i) => lo + i * 1000);
  return <div ref={ref} className="rv-w"><div ref={tip.host} className="rv-plot" onMouseLeave={tip.clear}>
    <svg width={W} height={H} className="rv-svg" role="img" aria-label={rows.map((r) => `${r.name} ${usd(r.v)}`).join(", ")}>
      {ticks.map((v) => <g key={v}><line x1={x(v)} x2={x(v)} y1={top + (narrow ? 24 : 0)} y2={H - 22} stroke={th.grid} /><text x={x(v)} y={H - 6} textAnchor="middle" className="rv-tick" fill={th.muted}>{k1(v)}</text></g>)}
      {rows.map((r, i) => { const cy = top + i * rowH + (narrow ? 48 : rowH / 2), ty = narrow ? top + i * rowH + 14 : cy - 2;
        return <g key={r.name} {...tip.hit(<><b>{r.name} · {usd(r.v)}</b><span>{r.band ? `Rango ${usd(r.band[0])} – ${usd(r.band[1])}` : r.note}</span></>)}>
          <rect x={0} y={cy - rowH / 2} width={W} height={rowH} fill="transparent" />
          <text x={0} y={ty} className={`rv-lab${r.main ? "" : " rv-lab--n"}`} fill={th.text}>{r.name}{narrow ? <tspan className="rv-val" fill={th.text} dx={8}>{usd(r.v)}</tspan> : null}</text>
          {narrow ? null : <text x={0} y={cy + 14} className="rv-tick" fill={th.muted}>{r.note}</text>}
          <line x1={x(lo)} x2={narrow ? x(hi) : x(r.v)} y1={cy} y2={cy} stroke={th.grid} strokeWidth={2} />
          {r.band ? <rect x={x(r.band[0])} y={cy - 8} width={x(r.band[1]) - x(r.band[0])} height={16} rx={8} fill={th.a} opacity={0.2} /> : null}
          <circle cx={x(r.v)} cy={cy} r={r.main ? 8 : 6} fill={r.main ? th.a : th.mute} stroke={th.surface} strokeWidth={2} />
          {narrow ? null : <text x={x(r.band ? r.band[1] : r.v) + 12} y={cy + 5} className={`rv-val${r.main ? " rv-val--b" : ""}`} fill={th.text}>{usd(r.v)}</text>}
        </g>; })}
    </svg>{tip.layer}</div></div>;
}

/** Proyección: eje real, hitos 1/3/6/12 meses, valor final rotulado; cruz con mouse o ← →. */
// ds (19/10, Revela): línea con el degradado primario de Concorde (ProgressBar: #F4AC59 → #8460E5) y puntos blancos con anillo lila.
export function Projection({ d, t: th, gid, ds }: { d: RData; t: Theme; gid: string; ds?: boolean }): JSX.Element {
  // Con ds y d.pf: curva semanal de AVT (projectForward) y sus hitos rotulados (Hoy · 1M · 3M · 6M · 12M), como ChartSVG de AVT.
  const P: { v: number; full: string; lab: string | null; km?: number }[] = ds && d.pf?.length ? d.pf.map((p) => ({ v: p.v, full: p.label ?? "", lab: p.label, km: p.km })) : d.proj.map((p) => ({ v: p.v, full: p.full, lab: null }));
  const marks = ds && d.pf?.length ? P.flatMap((p, i) => (p.lab ? [i] : [])) : [0, 1, 3, 6, 12];
  const [ref, W] = useW(), narrow = W < 480, H = 200, L = 44, R = narrow ? 12 : 108, T = narrow ? 36 : 12, B = 24, n = P.length;
  const vs = P.map((p) => p.v), lo = Math.floor((Math.min(...vs) - 60) / 200) * 200, hi = Math.ceil((Math.max(...vs) + 40) / 200) * 200;
  const x = (i: number) => L + (i / (n - 1)) * (W - L - R), y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const [hov, setHov] = useState<number | null>(null);
  const pts = P.map((p, i) => `${x(i)},${y(p.v)}`);
  const ticks = Array.from({ length: (hi - lo) / 200 + 1 }, (_, k) => lo + k * 200);
  const last = P[n - 1], drop = ((1 - last.v / d.market) * 100).toFixed(1), h = hov === null ? null : P[hov];
  const move = (e: RME<SVGSVGElement>) => { const r = e.currentTarget.getBoundingClientRect(); setHov(Math.max(0, Math.min(n - 1, Math.round((e.clientX - r.left - L) / (W - L - R) * (n - 1))))); };
  return <div ref={ref} className="rv-w rv-plot">
    <svg width={W} height={H} className="rv-svg" role="img" tabIndex={0} aria-label={`Proyección: de ${usd(d.market)} hoy a ${usd(last.v)} en 12 meses (−${drop} %)`}
      onMouseMove={move} onMouseLeave={() => setHov(null)} onBlur={() => setHov(null)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") setHov((v) => Math.min(n - 1, (v ?? -1) + 1)); if (e.key === "ArrowLeft") setHov((v) => Math.max(0, (v ?? 1) - 1)); }}>
      <defs><linearGradient id={gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={th.a} stopOpacity={th.surface === "#FFFFFF" ? 0.16 : 0.4} /><stop offset="1" stopColor={th.a} stopOpacity="0" /></linearGradient>
        {ds ? <linearGradient id={`${gid}l`} gradientUnits="userSpaceOnUse" x1={x(0)} x2={x(n - 1)} y1="0" y2="0"><stop offset="0" stopColor="#F4AC59" /><stop offset=".3" stopColor="#ED8936" /><stop offset="1" stopColor="#8460E5" /></linearGradient> : null}</defs>
      {ticks.map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={th.grid} /><text x={L - 8} y={y(v) + 4} textAnchor="end" className="rv-tick" fill={th.muted}>{k1(v)}</text></g>)}
      {(ds && d.pf?.length ? marks : [0, 3, 6, 9, 12]).filter((i) => i < n).map((i) => <text key={i} x={x(i)} y={H - 4} textAnchor="middle" className="rv-tick" fill={th.muted}>{i === 0 ? "Hoy" : ds && d.pf?.length ? P[i].lab : P[i].full.slice(0, 3)}</text>)}
      <path d={`M${x(0)},${H - B} L${pts.join(" L")} L${x(n - 1)},${H - B} Z`} fill={`url(#${gid})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={ds ? `url(#${gid}l)` : th.a} strokeWidth={ds ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />
      {(ds && d.pf?.length ? marks.slice(1) : [1, 3, 6, 12]).filter((i) => i < n).map((i) => <circle key={i} cx={x(i)} cy={y(P[i].v)} r={ds ? 5 : 4} fill={ds ? "#fff" : th.a} stroke={ds ? "#8460E5" : th.surface} strokeWidth={2} />)}
      <circle cx={x(0)} cy={y(d.market)} r={ds ? 6 : 5} fill={ds ? "#ED8936" : th.a} stroke={th.surface} strokeWidth={2} />
      <text x={narrow ? x(n - 1) : x(n - 1) + 10} y={narrow ? 14 : y(last.v) - 3} textAnchor={narrow ? "end" : "start"} className="rv-val rv-val--b" fill={th.text}>{usd(last.v)}</text>
      <text x={narrow ? x(n - 1) : x(n - 1) + 10} y={narrow ? 30 : y(last.v) + 13} textAnchor={narrow ? "end" : "start"} className="rv-tick" fill={th.muted}>−{drop}{" "}% · 12 meses</text>
      {h ? <g pointerEvents="none"><line x1={x(hov!)} x2={x(hov!)} y1={T} y2={H - B} stroke={th.muted} strokeOpacity={0.5} /><circle cx={x(hov!)} cy={y(h.v)} r={6} fill={th.a} stroke={th.surface} strokeWidth={2} /></g> : null}
    </svg>
    {h ? <div className="rv-tip" style={{ left: x(hov!), top: y(h.v) }} role="status"><b>{h.full ? `${h.full} · ` : ""}{usd(h.v)}</b><span>{hov ? `−${usd(d.market - h.v)} desde hoy${h.km ? ` · ${(h.km / 1000).toFixed(0)}k km` : ""}` : "Valor de hoy"}</span></div> : null}
  </div>;
}

/** Estacionalidad divergente: arriba más demanda (violeta), abajo menos (naranja); «Hoy» rotulado. */
// ds (19/10, Revela): barras con los degradados de Concorde — más demanda = ConditionPill (#AE8EFF → #5A35C2), menos = EN VIVO (#F4AC59 → #B25614).
export function Season({ d, t: th, ds }: { d: RData; t: Theme; ds?: boolean }): JSX.Element {
  const [ref, W] = useW(), tip = useTip(), H = 168, T = 22, B = 28;
  const max = Math.max(...d.season.map((s) => Math.abs(s.f))), y0 = T + (H - T - B) / 2, sy = (H - T - B) / 2 / max, slot = W / 12, bw = Math.min(22, slot * 0.62);
  const bar = (cx: number, f: number) => { const h = Math.abs(f) * sy, x0 = cx - bw / 2, r = Math.min(4, h), s = f >= 0 ? -1 : 1;
    return `M${x0},${y0} V${y0 + s * (h - r)} Q${x0},${y0 + s * h} ${x0 + r},${y0 + s * h} H${x0 + bw - r} Q${x0 + bw},${y0 + s * h} ${x0 + bw},${y0 + s * (h - r)} V${y0} Z`; };
  return <div ref={ref} className="rv-w"><div ref={tip.host} className="rv-plot" onMouseLeave={tip.clear}>
    <svg width={W} height={H} className="rv-svg" role="img" aria-label={d.season.map((s) => `${s.name} ${pct(s.f)}`).join(", ")}>
      {ds ? <defs><linearGradient id="rvs-up" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#AE8EFF" /><stop offset="1" stopColor="#5A35C2" /></linearGradient><linearGradient id="rvs-mid" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#CFBAFF" /><stop offset="1" stopColor="#8460E5" /></linearGradient><linearGradient id="rvs-dn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ED8936" /><stop offset="1" stopColor="#F4AC59" /></linearGradient></defs> : null}
      <line x1={0} x2={W} y1={y0} y2={y0} stroke={th.muted} strokeOpacity={0.5} />
      {d.season.map((s, i) => { const cx = slot * i + slot / 2, now = s.m === d.now;
        return <g key={s.m} {...tip.hit(ds ? <b>{s.name} · {s.f > 0 ? "+" : ""}{s.f}%</b> : <><b>{s.name} · {pct(s.f)} demanda</b><span>{s.f > 0 ? "Sobre el promedio del año" : "Bajo el promedio del año"}</span></>)}>
          <rect x={cx - slot / 2} y={T - 16} width={slot} height={H - T + 16} fill="transparent" />
          {ds && now ? <path d={bar(cx, s.f)} fill="none" stroke={s.f >= 0 ? "#8460E5" : "#ED8936"} strokeOpacity={0.28} strokeWidth={8} strokeLinejoin="round" /> : null}
          <path d={bar(cx, s.f)} fill={ds ? `url(#rvs-${s.f > 10 ? "up" : s.f >= 0 ? "mid" : "dn"})` : s.f >= 0 ? th.a : th.b} opacity={now || ds ? 1 : 0.8} stroke={ds && now ? "#fff" : "none"} strokeWidth={ds && now ? 1.5 : 0} />
          {now ? <text x={cx} y={s.f >= 0 ? y0 - Math.abs(s.f) * sy - 6 : y0 + Math.abs(s.f) * sy + 14} textAnchor="middle" className="rv-val rv-val--b" fill={ds ? "#3B1782" : th.text}>{ds ? `${s.f > 0 ? "+" : ""}${s.f}%` : pct(s.f)}</text> : null}
          <text x={cx} y={H - 6} textAnchor="middle" className={`rv-tick${now ? " rv-tick--now" : ""}`} fill={now ? (ds ? "#3B1782" : th.text) : th.muted}>{now && !ds ? "Hoy" : s.name.slice(0, 3)}</text>
        </g>; })}
    </svg>{tip.layer}</div>
    {ds ? null : <ul className="rv-legend"><li><i style={{ background: th.a }} />Más demanda que el promedio</li><li><i style={{ background: th.b }} />Menos demanda</li></ul>}</div>;
}

/** Puente del valor: del precio de lista al valor de mercado, factor por factor (por qué vale lo que vale). */
function Bridge({ d, t: th }: { d: RData; t: Theme }): JSX.Element {
  const [ref, W] = useW(), tip = useTip(), narrow = W < 520, rowH = narrow ? 56 : 40, L = narrow ? 0 : Math.min(190, Math.round(W * 0.34)), R = narrow ? 0 : 104, top = 4;
  const steps = d.bridge, max = steps[0]?.v ?? 1, x = (v: number) => L + (v / max) * (W - L - R);
  const rows = [...steps, { label: "Valor de mercado", note: "Resultado AVT", v: d.market, total: true }] as { label: string; note: string; v: number; total?: boolean }[];
  let run = 0; const H = top + rows.length * rowH + 24;
  return <div ref={ref} className="rv-w"><div ref={tip.host} className="rv-plot" onMouseLeave={tip.clear}>
    <svg width={W} height={H} className="rv-svg" role="img" aria-label={rows.map((r) => `${r.label} ${r.total || r === rows[0] ? usd(r.v) : (r.v < 0 ? "−" : "+") + usd(Math.abs(r.v))}`).join(", ")}>
      {[0, 0.25, 0.5, 0.75, 1].map((k) => <g key={k}><line x1={x(max * k)} x2={x(max * k)} y1={top} y2={H - 22} stroke={th.grid} /><text x={x(max * k)} y={H - 6} textAnchor={k === 0 ? "start" : k === 1 ? "end" : "middle"} className="rv-tick" fill={th.muted}>{k1(max * k)}</text></g>)}
      {rows.map((r, i) => { const first = i === 0, from = r.total || first ? 0 : run, to = r.total || first ? r.v : run + r.v; if (!r.total) run = first ? r.v : run + r.v;
        const y = top + i * rowH + (narrow ? 24 : 8), bh = narrow ? 18 : 24, x0 = x(Math.min(from, to)), bw = Math.max(2, Math.abs(x(to) - x(from)));
        const fill = r.total ? th.ink === "#fff" || th === GLASS ? "#FFFFFF" : th.ink : first ? th.mute : r.v < 0 ? th.b : th.a;
        const rv10 = Math.round(r.v / 10) * 10, val = r.total || first ? usd(r.v) : rv10 === 0 ? "Sin ajuste" : `${rv10 < 0 ? "−" : "+"}${usd(Math.abs(rv10))}`; // AVT redondea a la decena
        return <g key={r.label} {...tip.hit(<><b>{r.label} · {val}</b><span>{r.note}</span></>)}>
          <rect x={0} y={y - (narrow ? 22 : 8)} width={W} height={rowH} fill="transparent" />
          {narrow ? <text x={0} y={y - 6} className={`rv-lab${r.total ? "" : " rv-lab--n"}`} fill={th.text}>{r.label}<tspan className="rv-val" dx={8} fill={th.muted}>{val}</tspan></text>
            : <><text x={0} y={y + 10} className={`rv-lab${r.total ? "" : " rv-lab--n"}`} fill={th.text}>{r.label}</text><text x={0} y={y + 25} className="rv-tick" fill={th.muted}>{r.note.length > 30 ? r.note.slice(0, 29) + "…" : r.note}</text></>}
          <rect x={x0} y={y} width={bw} height={bh} rx={4} fill={fill} opacity={first ? 0.7 : 1} />
          {!narrow ? <text x={W - R + 12} y={y + bh / 2 + 5} className={`rv-val${r.total ? " rv-val--b" : ""}`} fill={th.text}>{val}</text> : null}
          {!r.total && i < rows.length - 1 ? <line x1={x(run)} x2={x(run)} y1={y + bh} y2={y + rowH} stroke={th.muted} strokeOpacity={0.5} /> : null}
        </g>; })}
    </svg>{tip.layer}</div>
    <ul className="rv-legend"><li><i style={{ background: th.b }} />Resta valor</li><li><i style={{ background: th.a }} />Suma valor</li></ul></div>;
}

/** ¿Cuándo vender?: un solo control une proyección y demanda. Se elige el mes (deslizador nativo o tocando la columna). */
export function WhenToSell({ d, t: th, gid }: { d: RData; t: Theme; gid: string }): JSX.Element {
  const [ref, W] = useW(), [sel, setSel] = useState(0), n = d.proj.length, H = 156, L = 8, R = 8, T = 16, B = 8, cellH = 40;
  const vs = d.proj.map((p) => p.v), lo = Math.min(...vs) - 60, hi = Math.max(...vs) + 40;
  const slot = (W - L - R) / n, x = (i: number) => L + slot * i + slot / 2, y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const p = d.proj[sel], diff = p.v - d.market, best = new Set(d.sig.timing.bestMonths.map((m) => m.monthLabel));
  const maxF = Math.max(...d.proj.map((q) => Math.abs(q.f)), 1);
  return <div ref={ref} className="rv-w rv-when">
    <div className="rv-when__read" aria-live="polite">
      <span>{sel === 0 ? "Si vendes hoy" : `Si vendes en ${p.full}`}</span>
      <b>{usd(p.v)}</b>
      <small>{sel === 0 ? "Valor de mercado hoy" : `${diff < 0 ? "−" : "+"}${usd(Math.abs(diff))} vs hoy`} · demanda {pct(p.f)}{best.has(p.full) ? " · de los mejores meses" : ""}</small>
    </div>
    <svg width={W} height={H + cellH + 22} className="rv-svg" role="img" aria-label={`Valor y demanda mes a mes. ${p.full}: ${usd(p.v)}, demanda ${pct(p.f)}`}>
      <defs><linearGradient id={gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={th.a} stopOpacity={th === LIGHT ? 0.14 : 0.36} /><stop offset="1" stopColor={th.a} stopOpacity="0" /></linearGradient></defs>
      <path d={`M${x(0)},${H} L${d.proj.map((q, i) => `${x(i)},${y(q.v)}`).join(" L")} L${x(n - 1)},${H} Z`} fill={`url(#${gid})`} />
      <polyline points={d.proj.map((q, i) => `${x(i)},${y(q.v)}`).join(" ")} fill="none" stroke={th.a} strokeWidth={2} strokeLinejoin="round" />
      <line x1={x(sel)} x2={x(sel)} y1={T - 8} y2={H + cellH} stroke={th.ink === "#fff" ? "#fff" : th.ink} strokeOpacity={0.35} />
      {d.proj.map((q, i) => { const on = i === sel, a = 0.14 + (Math.abs(q.f) / maxF) * 0.5, c = q.f >= 0 ? (th === LIGHT ? "132,96,229" : "148,116,245") : (th === LIGHT ? "237,137,54" : "208,122,44");
        return <g key={i} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
          <rect x={x(i) - slot / 2} y={0} width={slot} height={H + cellH + 22} fill="transparent" />
          <circle cx={x(i)} cy={y(q.v)} r={on ? 7 : 3.5} fill={th.a} stroke={th.surface} strokeWidth={2} />
          <rect x={x(i) - slot / 2 + 1} y={H + 2} width={slot - 2} height={cellH - 4} rx={6} fill={`rgba(${c},${a})`} stroke={on ? (th === LIGHT ? th.ink : "#fff") : "none"} strokeWidth={2} />
          {slot >= 40 ? <text x={x(i)} y={H + cellH / 2 + 4} textAnchor="middle" className="rv-tick" fill={th.text}>{pct(q.f)}</text> : null}
          {on || slot >= 34 || i % 2 === 0 ? <text x={x(i)} y={H + cellH + 16} textAnchor="middle" className={`rv-tick${on ? " rv-tick--now" : ""}`} fill={on ? th.text : th.muted}>{i === 0 ? "Hoy" : q.full.slice(0, 3)}</text> : null}
        </g>; })}
    </svg>
    <label className="rv-when__range"><span className="rv-sr">Mes de venta</span>
      <input type="range" min={0} max={n - 1} step={1} value={sel} onChange={(e) => setSel(Number(e.target.value))} aria-valuetext={`${p.full}: ${usd(p.v)}`} style={{ marginInline: L + slot / 2 - 10 }} /></label>
    <ul className="rv-legend"><li><i style={{ background: th.a }} />Valor proyectado y más demanda</li><li><i style={{ background: th.b }} />Menos demanda</li><li>Más intenso = más fuerte</li></ul>
  </div>;
}

/** Las cuatro secciones del resultado (valor, dónde vender, proyección, momento de venta). Comparables, detalles y la barra
 *  Guardar · Publicar las pone Flujo, iguales en todas las direcciones. */
export default function Resultado({ d, variant }: { d: RData; variant: "claro" | "vidrio" | "explicado" | "simulador" }): JSX.Element {
  const th = variant === "vidrio" ? GLASS : LIGHT, s = d.sig, last = d.proj[d.proj.length - 1];
  const rangeFirst = variant === "explicado";
  const ladder = <section className="rv-card" aria-labelledby="rv-donde">
      <header className="rv-card__head"><h2 id="rv-donde">¿Dónde conviene venderlo?</h2><p>La subasta VMC estima {usd(d.subastop - d.recompra)} más que la recompra inmediata.</p></header>
      <Ladder d={d} t={th} />
    </section>;
  const hero = <section className="rv-card rv-hero" aria-labelledby="fl-h">
      <header className="rv-hero__top"><p className="rv-meta">{d.meta}</p><span className="rv-chip">Confianza {d.conf}{"\u00a0"}%</span></header>
      <h1 id="fl-h" tabIndex={-1} className="rv-hero__h">Valor de mercado hoy</h1>
      {rangeFirst ? <><b className="rv-big rv-big--range">{usd(d.low)}<span> – </span>{usd(d.high)}</b><p className="rv-likely">Más probable: <b>{usd(d.market)}</b> · según {d.comps.length} publicaciones similares</p></> : <b className="rv-big">{usd(d.market)}</b>}
      <p className="rv-sub">Estimación basada en depreciación real, estacionalidad y kilometraje</p>
      <Strip d={d} t={th} />
      <p className="rv-legal">Valuación estimativa generada por el motor AVT.ai. No constituye oferta comercial. Los valores reales pueden variar según condición específica del vehículo, documentación y condiciones del mercado al momento de la transacción.</p>
    </section>;
  if (variant === "simulador") return <div className="rv rv--claro">{hero}
    <section className="rv-card" aria-labelledby="rv-cuando">
      <header className="rv-card__head rv-card__head--row"><div><h2 id="rv-cuando">¿Cuándo te conviene vender?</h2><p>Mueve el mes: valor proyectado y demanda del mercado, juntos.</p></div>
        <span className="rv-signal"><Signal level={s.signal.level} width={20} title={`Nivel ${s.signal.level} de 5`} />{s.signal.label}</span></header>
      <WhenToSell d={d} t={th} gid="rvw" />
      {s.copy.headline ? <p className="rv-note"><b>{s.copy.headline}</b> {s.copy.body}</p> : null}
    </section>
    {ladder}</div>;
  const body = <>
    {hero}
    {rangeFirst && d.bridge.length ? <section className="rv-card" aria-labelledby="rv-puente">
      <header className="rv-card__head"><h2 id="rv-puente">Cómo llegamos a este valor</h2><p>Del precio de lista al valor de mercado, con las mismas fórmulas de AVT.</p></header>
      <Bridge d={d} t={th} />
    </section> : null}
    {ladder}
    <div className="rv-pair">
      <section className="rv-card" aria-labelledby="rv-proy">
        <header className="rv-card__head"><h2 id="rv-proy">Proyección de valor</h2><p>{usd(last.v)} en 12 meses{s.timing.dailyValueLoss > 0 ? <> · pierde ~{usd(s.timing.dailyValueLoss)} por día</> : null}</p></header>
        <Projection d={d} t={th} gid={`rvp-${variant}`} />
      </section>
      <section className="rv-card" aria-labelledby="rv-mom">
        <header className="rv-card__head rv-card__head--row"><div><h2 id="rv-mom">Momento de venta</h2><p>{s.signal.sublabel}</p></div>
          <span className="rv-signal"><Signal level={s.signal.level} width={20} title={`Nivel ${s.signal.level} de 5`} />{s.signal.label}</span></header>
        <Season d={d} t={th} />
        <p className="rv-note">Demanda en {s.seasonal.currentMonth}: <b>{s.seasonal.currentFactorLabel}</b> · tendencia {s.seasonal.trend} {s.seasonal.trendArrow} {s.seasonal.nextMonth}</p>
        {s.timing.bestMonths.length ? <p className="rv-months"><span>Mejores meses</span>{s.timing.bestMonths.map((m) => <em key={m.monthLabel}>{m.monthLabel}</em>)}</p> : null}
        {s.copy.headline ? <p className="rv-note"><b>{s.copy.headline}</b> {s.copy.body}</p> : null}
      </section>
    </div>
  </>;
  return variant === "vidrio" ? <div className="rv rv--vidrio"><div className="rv-stage">{body}</div></div> : <div className="rv rv--claro">{body}</div>;
}
