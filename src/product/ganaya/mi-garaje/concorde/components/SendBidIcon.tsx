"use client";

/**
 * SendBidIcon — Generado por Concorde
 * Fuente: Figma VOYAGER · "Background+Border+Shadow" (mis bids / bids totales)
 *
 * Botón circular 32×32 (círculo blanco, borde gradiente, sombra morada + inner
 * highlight) con ícono de "persona + flecha de reenvío". 2 variantes:
 *   · "white"  → MIS BIDS    → 1 persona + flecha, NARANJA (#F4AC59→#B25614),
 *                 borde white→#F4AC59→#8460E5→white.
 *   · "vault"  → BIDS TOTALES → grupo de personas + flecha, MORADO (#AE8EFF→#5A35C2),
 *                 borde #AE8EFF→#5A35C2.
 * Copia del SVG (colores/sombra). Tamaño personalizable. useId para el gradiente.
 */

import { useId } from "react";
import type { JSX, MouseEventHandler } from "react";

export type SendBidIconVariant = "vault" | "white";

export interface SendBidIconProps {
  /** Variante de color (default "vault") */
  variant?: SendBidIconVariant;
  /** Diámetro en px (default 32) */
  size?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

const STYLE_ID = "concorde-sendbidicon-styles";

const SENDBIDICON_STYLES = `
.psendbid {
  box-sizing: border-box;
  padding: 0;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: rgba(16, 0, 48,0.4) 0px 3px 8px, inset 0px 1px 0px rgba(255,255,255,0.3);
  transition: transform 0.15s cubic-bezier(0.3,0,0,1), box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
}
/* MIS BIDS — círculo blanco, borde white→naranja→lila→white */
.psendbid--white {
  border: 1px solid transparent;
  background-image:
    linear-gradient(#ffffff, #ffffff),
    linear-gradient(120deg, #ffffff 0%, #F4AC59 22%, #8460E5 74.5%, #ffffff 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
/* BIDS TOTALES — círculo blanco, borde morado (#AE8EFF→#5A35C2) */
.psendbid--vault {
  border: 1px solid transparent;
  background-image:
    linear-gradient(#ffffff, #ffffff),
    linear-gradient(135deg, #AE8EFF 0%, #5A35C2 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
.psendbid:hover { transform: translateY(-1px); box-shadow: rgba(16, 0, 48,0.45) 0px 6px 14px, inset 0px 1px 0px rgba(255,255,255,0.3); }
.psendbid:active { transform: scale(0.94); }
.psendbid:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
.psendbid:disabled { cursor: not-allowed; opacity: 0.6; }
@media (prefers-reduced-motion: reduce) { .psendbid { transition: none; } }
`;

// MIS BIDS (white): 1 persona + flecha
const WHITE_PERSON =
  "M27.5412 16.36C27.5412 14.52 25.9765 13 24 13C22.0235 13 20.5412 14.52 20.5412 16.36C20.5412 18.28 22.0235 19.8 24 19.8C25.9765 19.8 27.5412 18.28 27.5412 16.36ZM17 25.4C18.4824 27.56 21.1176 29 24 29C26.8824 29 29.5176 27.56 31 25.4C31 23.16 26.3059 21.88 24 21.88C21.6941 21.88 17 23.16 17 25.4Z";
const WHITE_ARROW =
  "M33.332 26.2488V26.2498C33.3329 26.2511 33.3355 26.2553 33.3379 26.2625C33.3413 26.2725 33.3437 26.2857 33.3438 26.3005C33.3438 26.3156 33.3413 26.3295 33.3379 26.3396L33.332 26.3523L29.2012 31.3796V28.3884L28.666 28.4255C25.376 28.6529 23.1606 31.2287 22.5596 32.0095C22.5289 32.0494 22.5026 32.0593 22.4941 32.0613C22.4896 32.0624 22.486 32.0628 22.4824 32.0623C22.4787 32.0617 22.4716 32.0599 22.4619 32.0544C22.4418 32.0431 22.4076 32.0132 22.3799 31.9529C22.3661 31.9228 22.3556 31.8887 22.3496 31.8523L22.3457 31.7371C22.5334 29.7507 23.4288 27.8321 24.873 26.3406C26.0771 25.097 27.5096 24.3431 28.7529 24.2136L29.2012 24.1677V21.2214L33.332 26.2488Z";

// BIDS TOTALES (vault): grupo (cuerpos + cabezas) + flecha
const VAULT_GROUP = [
  "M20.3517 21.2353C20.3517 20.8235 20.4759 20.4118 20.6 20H19.3586C17.9931 20 17 21.2353 17 22.6078V25.4902C17 26.3137 17.6207 27 18.3655 27H20.4759C20.3517 26.8627 20.3517 26.7255 20.3517 26.451V21.2353Z",
  "M25.1 19H22.9C21.8 19 21 20.0667 21 21.4V26.4667C21 26.7333 21.1 27 21.3 27H26.7C26.9 27 27 26.7333 27 26.4667V21.4C27 20.0667 26.2 19 25.1 19Z",
  "M24 12C22.4348 12 21 13.3333 21 15.0667C21 16.1333 21.6522 17.0667 22.5652 17.6C22.9565 17.8667 23.4783 18 24 18C24.5217 18 25.0435 17.8667 25.4348 17.6C26.3478 17.0667 27 16.1333 27 15.0667C27 13.3333 25.5652 12 24 12Z",
  "M19 15C17.9412 15 17 15.9412 17 17C17 18.0588 17.9412 19 19 19C19.3529 19 19.5882 18.8824 19.8235 18.7647C20.2941 18.6471 20.5294 18.2941 20.7647 17.9412C21 17.5882 21 17.3529 21 17C21 15.9412 20.1765 15 19 15Z",
  "M28.9998 15C27.8233 15 26.9998 15.9412 26.9998 17C26.9998 17.353 26.9998 17.5883 27.2351 17.9412C27.4704 18.2942 27.7057 18.6471 28.1762 18.7648C28.4115 18.8824 28.6468 19 28.9998 19C30.0586 19 30.9998 18.0589 30.9998 17C30.9998 15.9412 30.0586 15 28.9998 15Z",
  "M28.7414 20H27.5C27.6241 20.4118 27.7483 20.8235 27.7483 21.2353V26.451C27.7483 26.7255 27.7483 26.8627 27.6241 27H29.7345C30.4793 27 31.1 26.3137 31.1 25.4902V22.6078C31.1 21.2353 30.1069 20 28.7414 20Z",
];
const VAULT_ARROW =
  "M32.9883 24.6865V24.6875C32.9892 24.6889 32.9917 24.6931 32.9941 24.7002C32.9975 24.7102 33 24.7234 33 24.7383C33 24.7534 32.9976 24.7672 32.9941 24.7773L32.9883 24.79L28.8574 29.8174V26.8262L28.3223 26.8633C25.0323 27.0906 22.8168 29.6665 22.2158 30.4473C22.1851 30.4872 22.1588 30.497 22.1504 30.499C22.1459 30.5001 22.1422 30.5005 22.1387 30.5C22.1349 30.4994 22.1278 30.4976 22.1182 30.4922C22.0981 30.4809 22.0639 30.4509 22.0361 30.3906C22.0223 30.3606 22.0119 30.3265 22.0059 30.29L22.002 30.1748C22.1896 28.1885 23.0851 26.2699 24.5293 24.7783C25.7334 23.5348 27.1659 22.7809 28.4092 22.6514L28.8574 22.6055V19.6592L32.9883 24.6865Z";

let _stylesInjected = false;

export default function SendBidIcon({
  variant = "vault",
  size = 32,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
  className = "",
}: SendBidIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const gradId = `sendbid-grad-${uid}`;
  const isVault = variant === "vault";

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = SENDBIDICON_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SENDBIDICON_STYLES }} />
      <button
        type="button"
        className={`psendbid psendbid--${variant} ${className}`.trim()}
        style={{ width: size, height: size }}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel ?? (isVault ? "Bids totales" : "Mis bids")}
      >
        <svg width={size} height={size} viewBox="8 5 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {isVault ? (
            <>
              {VAULT_GROUP.map((d, i) => (
                <path key={i} d={d} fill={`url(#${gradId})`} />
              ))}
              <path d={VAULT_ARROW} fill="#ffffff" stroke={`url(#${gradId})`} strokeWidth={1} strokeLinejoin="round" />
            </>
          ) : (
            <>
              <path d={WHITE_PERSON} fill={`url(#${gradId})`} />
              <path d={WHITE_ARROW} fill="#ffffff" stroke={`url(#${gradId})`} strokeWidth={1} strokeLinejoin="round" />
            </>
          )}
          <defs>
            <linearGradient id={gradId} x1="24" y1="12" x2="24" y2="30" gradientUnits="userSpaceOnUse">
              {isVault ? (
                <>
                  <stop stopColor="#AE8EFF" />
                  <stop offset="1" stopColor="#5A35C2" />
                </>
              ) : (
                <>
                  <stop stopColor="#F4AC59" />
                  <stop offset="0.5" stopColor="#ED8936" />
                  <stop offset="1" stopColor="#B25614" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
      </button>
    </>
  );
}
