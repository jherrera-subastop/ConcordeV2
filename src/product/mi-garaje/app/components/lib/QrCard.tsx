/** QrCard: tarjeta con QR para el vehículo que recibe ofertas, y su impresión en A4.
 *  Depende de React, qr-card.css, QrCode.tsx (qrcode-generator) y del logo en public (`logoSrc`). */
import type { CSSProperties, JSX, Ref } from "react";
import { qrMatrix } from "./QrCode";
import "./qr-card.css";

/** Azulejo blanco con los cuadros del QR transparentes: se ve el color de la tarjeta y el QR queda oscuro sobre claro.
 *  En una tarjeta blanca no habría contraste, así que `ink` pinta esos cuadros. Corrección alta (H) porque el logo tapa el centro. */
function Mark({ value, ink }: { value: string; ink?: string }): JSX.Element {
  const m = qrMatrix(value || " ", "H"), g = 2, t = m.length + g * 2;
  let d = "", dark = "";
  for (let r = 0; r < t; r++) for (let c = 0; c < t; c++) { const cell = `M${c} ${r}h1v1h-1z`; if (m[r - g]?.[c - g]) dark += cell; else d += cell; }
  return <svg className="qc-mark" viewBox={`0 0 ${t} ${t}`} shapeRendering="crispEdges" aria-hidden><path d={d} fill="#fff" />{ink ? <path d={dark} fill={ink} /> : null}</svg>;
}

/** color: degradado de VMC. negro y blanco: para imprimir sin color. */
export type QrTone = "color" | "negro" | "blanco";

export type QrCardProps = {
  /** Link que abre el QR: el de la publicación del vehículo. */
  value: string;
  /** Texto de arriba. */
  hook?: string;
  /** Texto de abajo. */
  label?: string;
  logoSrc?: string;
  tone?: QrTone;
  /** Ancho en px. Todo escala con él. */
  size?: number;
  /** Para pasarle la tarjeta a `printA4`. */
  ref?: Ref<HTMLDivElement>;
  className?: string;
};

export function QrCard({ value, hook = "¡Hey, tú!", label = "Este vehículo recibe ofertas", logoSrc = "/producto-assets/mi-garaje/garage-reference/logo-vmc.svg", tone = "color", size, ref, className = "" }: QrCardProps): JSX.Element {
  return <div ref={ref} className={`qc${tone === "color" ? "" : ` qc--${tone}`}${className ? ` ${className}` : ""}`} role="img" aria-label={`${hook} ${label}. Código QR de ${value}`}
    style={size ? ({ "--u": `${size / 200}px` } as CSSProperties) : undefined}>
    <p className="qc-hook">{hook}</p>
    <span className="qc-frame"><i /><i /><i /><i />
      <span className="qc-code"><Mark value={value} ink={tone === "blanco" ? "#000" : undefined} /><span className="qc-plate"><img className="qc-logo" src={logoSrc} alt="" /></span></span>
    </span>
    <span className="qc-label">{label}</span>
  </div>;
}

/** Hoja sin márgenes, para que el navegador no agregue fecha, título ni URL. Mientras se imprime, se oculta el resto de la página. */
const PRINT_CSS = `@page { size: A4; margin: 0; }
.qc-print { display: none; }
@media print {
  html, body { height: auto !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body > :not(.qc-print) { display: none !important; }
  .qc-print { display: grid !important; place-items: center; height: 296mm; }
}`;

/** Imprime la tarjeta sola, centrada en una hoja A4 y a 15 cm de ancho. */
export function printA4(card: HTMLElement): void {
  const clone = card.cloneNode(true) as HTMLElement;
  clone.style.setProperty("--u", "0.75mm");
  const sheet = document.createElement("div");
  sheet.className = "qc-print";
  sheet.append(clone);
  const style = document.createElement("style");
  style.textContent = PRINT_CSS;
  document.head.append(style);
  document.body.append(sheet);
  window.addEventListener("afterprint", () => { style.remove(); sheet.remove(); }, { once: true });
  const logo = clone.querySelector("img"); // espera el logo para que no salga vacío
  (logo ? logo.decode() : Promise.resolve()).catch(() => undefined).then(() => window.print());
}

export default QrCard;
