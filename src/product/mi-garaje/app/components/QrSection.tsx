"use client";

/** /components · QR (04/11): el QR de Mi Garaje, un generador para cualquier link y varios a la vez. Descarga en SVG o PNG. */
import { useState } from "react";
import type { JSX } from "react";
import { QrCode, qrSvg, type QrLevel } from "./lib/QrCode";

const MI_GARAJE = "https://mi-garaje-lab.vercel.app/producto/mi-garaje/m/vmc";
const LEVELS: [QrLevel, string][] = [["L", "Baja 7 %"], ["M", "Media 15 %"], ["Q", "Alta 25 %"], ["H", "Máxima 30 %"]];

const slug = (v: string) => v.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || "qr";
function save(blob: Blob, name: string) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
const downloadSvg = (v: string, level: QrLevel) => save(new Blob([qrSvg(v, { level })], { type: "image/svg+xml" }), `qr-${slug(v)}.svg`);
/** PNG de 1024 px: se dibuja el SVG en un canvas. */
function downloadPng(v: string, level: QrLevel) {
  const img = new Image(), url = URL.createObjectURL(new Blob([qrSvg(v, { level })], { type: "image/svg+xml" }));
  img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 1024; const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false; ctx.drawImage(img, 0, 0, 1024, 1024);
    URL.revokeObjectURL(url); c.toBlob((b) => b && save(b, `qr-${slug(v)}.png`)); };
  img.src = url;
}

function Card({ value, level, size = 160, title }: { value: string; level: QrLevel; size?: number; title?: string }): JSX.Element {
  return <figure className="qr-card">
    <QrCode value={value} level={level} size={size} />
    <figcaption>{title ? <b>{title}</b> : null}<a href={value} target="_blank" rel="noreferrer">{value}</a></figcaption>
    <div className="qr-card__btns"><button type="button" onClick={() => downloadPng(value, level)}>PNG</button><button type="button" onClick={() => downloadSvg(value, level)}>SVG</button></div>
  </figure>;
}

export default function QrSection(): JSX.Element {
  const [link, setLink] = useState("https://mi-garaje-lab.vercel.app/components");
  const [level, setLevel] = useState<QrLevel>("M");
  const [many, setMany] = useState(`${MI_GARAJE}\nhttps://mi-garaje-lab.vercel.app/components\nhttps://www.vmcsubastas.com`);
  const links = [...new Set(many.split(/\s+/).map((l) => l.trim()).filter(Boolean))].slice(0, 24);
  return <section id="qr" className="cx-sec" aria-labelledby="qr-t">
    <style>{CSS}</style>
    <header className="cx-sec__head"><h2 id="qr-t">QR</h2><code>QrCode</code></header>
    <p className="cx-sum">Escanéalo con la cámara del celular y abre el link.</p>

    <h3>Mi Garaje</h3>
    <Card value={MI_GARAJE} level="M" size={180} title="Mi Garaje" />

    <h3>Genera uno</h3>
    <div className="qr-gen">
      <div className="qr-gen__form">
        <label className="qr-field"><span>Link</span><input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" spellCheck={false} /></label>
        <div className="qr-levels" role="group" aria-label="Corrección de errores"><span>Corrección de errores</span>
          {LEVELS.map(([l, t]) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}>{t}</button>)}</div>
        <small>Más corrección = el QR se lee aunque esté sucio o tapado en parte, pero tiene más cuadritos.</small>
      </div>
      {link.trim() ? <Card value={link.trim()} level={level} /> : <p className="qr-empty">Escribe un link.</p>}
    </div>

    <h3>Varios a la vez</h3>
    <div className="qr-many">
      <label className="qr-field"><span>Un link por línea</span><textarea rows={4} value={many} onChange={(e) => setMany(e.target.value)} spellCheck={false} /></label>
      <div className="qr-grid">{links.map((l) => <Card key={l} value={l} level={level} size={130} />)}</div>
    </div>
  </section>;
}

const CSS = `
.qr-card { margin: 0; display: grid; justify-items: start; gap: 10px; width: max-content; max-width: 100%; padding: 16px; border: 1px solid #ECE8F7; border-radius: 14px; background: #fff; }
.qr-card figcaption { display: grid; gap: 2px; max-width: 220px; }
.qr-card figcaption b { font-size: 14px; color: #1B1340; }
.qr-card figcaption a { overflow-wrap: anywhere; font-size: 12.5px; color: #5A35C2; }
.qr-card__btns { display: flex; gap: 6px; }
.qr-card__btns button, .qr-levels button { padding: 6px 12px; border: 1px solid #DCD5F3; border-radius: 999px; background: #fff; color: #3D2299; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.qr-card__btns button:hover { background: #F5F2FD; }
.qr-levels button[aria-pressed="true"] { border-color: #3D2299; background: #3D2299; color: #fff; }
.qr-gen { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px; }
.qr-gen__form { display: grid; gap: 12px; flex: 1 1 320px; max-width: 520px; }
.qr-gen__form small { font-size: 12.5px; color: #6B6492; }
.qr-field { display: grid; gap: 6px; }
.qr-field span, .qr-levels > span { font-size: 13px; font-weight: 700; color: #1B1340; }
.qr-field input, .qr-field textarea { box-sizing: border-box; width: 100%; padding: 10px 12px; border: 1px solid #DCD5F3; border-radius: 10px; background: #fff; color: #1B1340; font: 13.5px/1.5 var(--vmc-font-mono); resize: vertical; }
.qr-field input:focus, .qr-field textarea:focus { outline: 2px solid #8460E5; outline-offset: 1px; }
.qr-levels { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.qr-levels > span { width: 100%; }
.qr-empty { margin: 0; font-size: 13px; color: #6B6492; }
.qr-many { display: grid; gap: 14px; }
.qr-many .qr-field { max-width: 620px; }
.qr-grid { display: flex; flex-wrap: wrap; gap: 12px; }
`;
