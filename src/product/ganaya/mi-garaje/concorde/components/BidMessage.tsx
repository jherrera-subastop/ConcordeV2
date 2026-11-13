"use client";

/**
 * BidMessage — Generado por Concorde
 * Fuente: Figma VOYAGER · "BidMessage" (3162:12972 / 12990 / 13002 / 12984)
 *
 * Burbuja de mensaje de puja, estilo chat. Dos lados (cola en la esquina
 * inferior del lado):
 *   · side="sent"      → derecha (cola inferior-derecha)
 *   · side="received"  → izquierda (cola inferior-izquierda)
 * Color por `type`:
 *   · "live"   → relleno naranja (#F4AC59→#B25614) + borde gradiente, texto blanco
 *   · "vault"  → relleno morado (#19004A→#3B1782→#2E0F70), texto blanco
 *   · "white"  → relleno blanco + borde lila, texto morado #3B1782
 * `logo` (slot) para la variante con logo. `children` = el mensaje.
 * Por convención: sent → live; received → vault/white. (type por defecto según side.)
 */

import type { JSX, ReactNode } from "react";

export type BidMessageSide = "sent" | "received";
export type BidMessageType = "live" | "vault" | "white";

export interface BidMessageProps {
  /** Lado de la burbuja (default "received") */
  side?: BidMessageSide;
  /** Color (default: sent→"live", received→"vault") */
  type?: BidMessageType;
  /** Logo opcional (slot) antes del texto */
  logo?: ReactNode;
  /** Contenido del mensaje */
  children?: ReactNode;
  className?: string;
}

const STYLE_ID = "concorde-bidmessage-styles";

const BIDMESSAGE_STYLES = `
.pbidmsg {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 40px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 18px;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}
.pbidmsg__logo { display: inline-flex; align-items: center; flex-shrink: 0; }
.pbidmsg__text { white-space: nowrap; }

/* Cola según el lado */
.pbidmsg--received { border-radius: 20px 20px 20px 4px; }
.pbidmsg--sent { border-radius: 20px 20px 4px 20px; }

/* live (naranja) — sent */
.pbidmsg--live {
  border: 1.5px solid transparent;
  background-image:
    linear-gradient(180deg, #F4AC59 0%, #ED8936 40%, #B25614 100%),
    linear-gradient(120deg, #ffffff 0%, #F4AC59 22%, #8460E5 74.5%, #ffffff 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  color: #ffffff;
  box-shadow: rgba(212, 110, 32,0.3) 0px 2px 12px;
}

/* vault (morado) — received */
.pbidmsg--vault {
  border: none;
  background: linear-gradient(90deg, #19004A 0%, #3B1782 50%, #2E0F70 100%);
  color: #ffffff;
  box-shadow: rgba(46,15,112,0.35) 0px 4px 16px;
}

/* white (blanco, texto morado) — received */
.pbidmsg--white {
  border: 1.5px solid transparent;
  background-image:
    linear-gradient(#ffffff, #ffffff),
    linear-gradient(135deg, #CFBAFF 0%, #ffffff 35%, #AE8EFF 65%, #CFBAFF 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  color: #3B1782;
  box-shadow: rgba(90,53,194,0.5) 0px 2px 10px;
}
`;

let _stylesInjected = false;

export default function BidMessage({
  side = "received",
  type,
  logo,
  children = "PROPUSO US$ 25,000",
  className = "",
}: BidMessageProps): JSX.Element {
  const resolvedType: BidMessageType = type ?? (side === "sent" ? "live" : "vault");

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = BIDMESSAGE_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const cls = ["pbidmsg", `pbidmsg--${side}`, `pbidmsg--${resolvedType}`, className].filter(Boolean).join(" ");

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BIDMESSAGE_STYLES }} />
      <div className={cls}>
        {logo ? <span className="pbidmsg__logo">{logo}</span> : null}
        <span className="pbidmsg__text">{children}</span>
      </div>
    </>
  );
}
