"use client";

/**
 * DocButton — Generado por Concorde
 * Fuente: Figma VOYAGER · "Button - Ver detalle" (1435:12239) ·
 *         "Button - Descargar comprobante" (1435:12237)
 *
 * Botón de icono 32×32 (radio 4) sobre blanco con borde #22005c/10% y un icono
 * con gradiente morado (#5A35C2 → #2e0f70 → #100030). Dos acciones:
 *   · "view"     → ojo (Ver detalle)
 *   · "download" → bandeja con flecha (Descargar comprobante)
 * Paths/gradientes copiados tal cual del SVG. useId para ids únicos.
 */

import { useId } from "react";
import type { JSX } from "react";

export type DocButtonAction = "view" | "download";

export interface DocButtonProps {
  /** Acción/icono del botón */
  action: DocButtonAction;
  onClick?: () => void;
  /** Texto accesible (default según la acción) */
  title?: string;
  disabled?: boolean;
  className?: string;
}

const STYLE_ID = "concorde-docbutton-styles";

const DOCBUTTON_STYLES = `
.pdocbtn {
  width: 32px; height: 32px; padding: 0;
  border: none; background: transparent;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 4px; cursor: pointer;
  transition: transform 0.12s, filter 0.12s;
}
.pdocbtn:hover { filter: brightness(0.98); }
.pdocbtn:active { transform: scale(0.94); }
.pdocbtn:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
.pdocbtn:disabled { cursor: not-allowed; opacity: 0.5; }
@media (prefers-reduced-motion: reduce) { .pdocbtn { transition: none; } }
`;

let _stylesInjected = false;

const VIEW_PATH =
  "M16 9C11.3846 9 7.53846 11.9556 6 16C7.53846 20.0444 11.3846 23 16 23C20.6154 23 24.4615 20.0444 26 16C24.4615 11.9556 20.6154 9 16 9ZM16 20.6667C13.5385 20.6667 11.3846 18.6444 11.3846 16C11.3846 13.3556 13.5385 11.3333 16 11.3333C18.4615 11.3333 20.6154 13.3556 20.6154 16C20.6154 18.6444 18.4615 20.6667 16 20.6667ZM16 13.2C14.4615 13.2 13.2308 14.4444 13.2308 16C13.2308 17.5556 14.4615 18.8 16 18.8C17.5385 18.8 18.7692 17.5556 18.7692 16C18.7692 14.4444 17.5385 13.2 16 13.2Z";
const DOWNLOAD_PATH =
  "M22.4526 24.329C22.9139 24.329 23.2878 23.955 23.2878 23.4937V23.0821C23.2878 22.6208 22.9139 22.2468 22.4526 22.2468H9.54817C9.08686 22.2468 8.71289 22.6208 8.71289 23.0821V23.4937C8.71289 23.955 9.08686 24.329 9.54817 24.329H22.4526ZM22.848 14.9948C23.4718 14.5047 23.1252 13.5027 22.3319 13.5027H19.3358C18.8745 13.5027 18.5006 13.1287 18.5006 12.6674V8.50714C18.5006 8.04583 18.1266 7.67188 17.6653 7.67188H14.3387C13.8774 7.67188 13.5034 8.04583 13.5034 8.50714V12.6674C13.5034 13.1287 13.1295 13.5027 12.6682 13.5027H9.67205C8.87881 13.5027 8.53227 14.5047 9.156 14.9948L15.4859 19.9683C15.7888 20.2063 16.2152 20.2063 16.518 19.9683L22.848 14.9948Z";

const DEFAULT_TITLE: Record<DocButtonAction, string> = {
  view: "Ver detalle",
  download: "Descargar comprobante",
};

export default function DocButton({
  action,
  onClick,
  title,
  disabled = false,
  className = "",
}: DocButtonProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const gradId = `docbtn-grad-${uid}`;
  const label = title ?? DEFAULT_TITLE[action];

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = DOCBUTTON_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const isView = action === "view";
  const grad = isView
    ? { x1: 6, y1: 9, x2: 17.9585, y2: 26.0836 }
    : { x1: 8.71289, y1: 7.67188, x2: 23.7217, y2: 20.8046 };

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: DOCBUTTON_STYLES }} />
      <button
        type="button"
        className={`pdocbtn ${className}`.trim()}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
      >
        <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="32" height="32" rx="4" fill="white" />
          <rect x="0.5" y="0.5" width="31" height="31" rx="3.5" stroke="#22005c" strokeOpacity="0.1" />
          <path d={isView ? VIEW_PATH : DOWNLOAD_PATH} fill={`url(#${gradId})`} />
          <defs>
            <linearGradient id={gradId} x1={grad.x1} y1={grad.y1} x2={grad.x2} y2={grad.y2} gradientUnits="userSpaceOnUse">
              <stop stopColor="#5A35C2" />
              <stop offset="0.5" stopColor="#2e0f70" />
              <stop offset="1" stopColor="#100030" />
            </linearGradient>
          </defs>
        </svg>
      </button>
    </>
  );
}
