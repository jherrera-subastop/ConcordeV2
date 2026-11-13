"use client";

/** /components · QR Recibe ofertas: la tarjeta, el campo del link y la impresión en A4. */
import { useRef, useState } from "react";
import type { JSX } from "react";
import { QrCard, printA4 } from "./lib/QrCard";
import type { QrTone } from "./lib/QrCard";

const TONES: [QrTone, string][] = [["color", "Color"], ["negro", "Fondo negro"], ["blanco", "Fondo blanco"]];

export default function QrRecibeOfertas(): JSX.Element {
  const [link, setLink] = useState("https://www.vmcsubastas.com");
  const [tone, setTone] = useState<QrTone>("color");
  const card = useRef<HTMLDivElement>(null);
  return <div className="qv">
    <style>{CSS}</style>
    <QrCard ref={card} value={link.trim()} tone={tone} size={240} />
    <div className="qv-side">
      <label className="qv-link"><span>Link del QR</span>
        <input type="url" value={link} onChange={(e) => setLink(e.target.value)} spellCheck={false} /></label>
      <p>Aquí va el link de la publicación del vehículo. Es lo que se abre al escanear.</p>
      <div className="qv-tones" role="group" aria-label="Color de la tarjeta">{TONES.map(([id, name]) => <button key={id} type="button" aria-pressed={tone === id} onClick={() => setTone(id)}>{name}</button>)}</div>
      <button type="button" className="qv-print" onClick={() => { if (card.current) printA4(card.current); }}>Imprimir en A4</button>
      <p>Sale sola y centrada en la hoja, a 15 cm de ancho. Escanéala antes de imprimir varias.</p>
    </div>
  </div>;
}

const CSS = `
.qv { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; padding: 20px; border: 1px solid #ECE8F7; border-radius: 14px; background: #fff; }
.qv-side { display: grid; flex: 1 1 260px; gap: 8px; min-width: 0; max-width: 460px; justify-items: start; }
.qv-side p { margin: 0 0 8px; font-size: 13px; line-height: 1.45; color: #6B6492; }
.qv-link { display: grid; gap: 4px; width: 100%; }
.qv-link span { font-size: 13px; font-weight: 700; color: #1B1340; }
.qv-link input { box-sizing: border-box; width: 100%; padding: 8px 10px; border: 1px solid #DCD5F3; border-radius: 10px; background: #fff; color: #1B1340; font: 13px/1.4 var(--vmc-font-mono); }
.qv-tones { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.qv-tones button { padding: 6px 12px; border: 1px solid #DCD5F3; border-radius: 999px; background: #fff; color: #1B1340; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.qv-tones button[aria-pressed="true"] { border-color: #3D2299; background: #EFEBFB; color: #3D2299; }
.qv-print { padding: 9px 18px; border: 0; border-radius: 999px; background: #3D2299; color: #fff; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; }
`;
