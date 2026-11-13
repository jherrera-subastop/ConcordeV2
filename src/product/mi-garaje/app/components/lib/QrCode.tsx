/** QrCode: dibuja un código QR en SVG a partir de un texto o un link. Depende de React y de qrcode-generator (MIT, sin dependencias). */
import qrcode from "qrcode-generator";
import type { JSX } from "react";

export type QrLevel = "L" | "M" | "Q" | "H";

/** Matriz del QR: true = módulo oscuro. typeNumber 0 = el tamaño mínimo que entra el texto. */
export function qrMatrix(text: string, level: QrLevel = "M"): boolean[][] {
  const qr = qrcode(0, level);
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** El SVG como texto, para descargarlo o pegarlo en otro lado. `margin` en módulos (4 es lo que pide el estándar). */
export function qrSvg(text: string, { level = "M", color = "#191C1C", background = "#FFFFFF", margin = 4 }: { level?: QrLevel; color?: string; background?: string; margin?: number } = {}): string {
  const m = qrMatrix(text, level), n = m.length + margin * 2;
  let d = "";
  m.forEach((row, r) => row.forEach((dark, c) => { if (dark) d += `M${c + margin} ${r + margin}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="${background}"/><path d="${d}" fill="${color}"/></svg>`;
}

export type QrCodeProps = {
  /** Texto o link que guarda el QR. */
  value: string;
  /** Lado en px. */
  size?: number;
  /** Corrección de errores: L 7 %, M 15 %, Q 25 %, H 30 % del código puede dañarse y aún se lee. */
  level?: QrLevel;
  color?: string;
  background?: string;
  /** Texto para lectores de pantalla. */
  label?: string;
  className?: string;
};

export function QrCode({ value, size = 160, level = "M", color = "#191C1C", background = "#FFFFFF", label, className }: QrCodeProps): JSX.Element {
  const svg = qrSvg(value || " ", { level, color, background });
  return <span className={className} role="img" aria-label={label ?? `Código QR de ${value}`} style={{ display: "inline-block", width: size, height: size, lineHeight: 0 }}
    dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", `<svg width="${size}" height="${size}" `) }} />;
}

export default QrCode;
