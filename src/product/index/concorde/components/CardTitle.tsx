"use client";

/**
 * CardTitle — Generado por Concorde
 * Fuente: Figma VOYAGER · "Title" (nodo 2877:280)
 * Sincronizado: 2026-06-12
 *
 * Título de sección con subtítulo y brackets naranjas en esquina
 * superior-izquierda (┌) e inferior-derecha (┘). Estático.
 */

import { useId } from "react";
import type { JSX, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardTitleProps {
  /** Título (default: "SANTANDER CONSUMER"). Acepta texto o nodos (p.ej. un dot + texto). */
  title?: ReactNode;
  /** Subtítulo (default: "10 Ofertas") */
  subtitle?: string;
  /** Tamaño del título en px (default 12 · line-height = size + 4) */
  titleSize?: number;
  /** Tamaño del subtítulo en px (default 14) */
  subtitleSize?: number;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-cardtitle-styles";

const CARDTITLE_STYLES = `
.cardtitle {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  padding: 8px 12px;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
.cardtitle__title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0;
  color: #3b1782;
  white-space: nowrap;
}
.cardtitle__subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  color: #191c1c;
}
.cardtitle__bracket {
  position: absolute;
  pointer-events: none;
}
.cardtitle__bracket--tl { top: 0; left: 0; }
.cardtitle__bracket--br { bottom: 0; right: 0; transform: rotate(180deg); }
`;

let _stylesInjected = false;

// ─── Bracket (┌) — gradiente naranja #FF9639 → #EF852E 40% → #BE3D00 ────────────

function Bracket({ uid, corner }: { uid: string; corner: "tl" | "br" }): JSX.Element {
  return (
    <svg
      className={`cardtitle__bracket cardtitle__bracket--${corner}`}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1.022H3.769C1.923 1.022 1 1.943 1 3.784V7.007"
        stroke={`url(#${uid}-${corner})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={`${uid}-${corner}`} x1="4" y1="1.022" x2="4" y2="7.007" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9639" /><stop offset="0.4" stopColor="#EF852E" /><stop offset="1" stopColor="#BE3D00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CardTitle({
  title = "SANTANDER CONSUMER",
  subtitle = "10 Ofertas",
  titleSize = 12,
  subtitleSize = 14,
  className = "",
}: CardTitleProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = CARDTITLE_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: CARDTITLE_STYLES }} />
      <div className={["cardtitle", className].filter(Boolean).join(" ")}>
        <Bracket uid={uid} corner="tl" />
        <h3 className="cardtitle__title" style={{ fontSize: titleSize, lineHeight: `${titleSize + 4}px` }}>{title}</h3>
        {subtitle ? <p className="cardtitle__subtitle" style={{ fontSize: subtitleSize }}>{subtitle}</p> : null}
        <Bracket uid={uid} corner="br" />
      </div>
    </>
  );
}
