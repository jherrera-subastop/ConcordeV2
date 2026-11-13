"use client";

/**
 * CardViewer — Generado por Concorde
 * Fuente: Figma VOYAGER · "ImageViewer" (2007:16993) + "Filmstrip" (2007:16994 / 2007:18456)
 *
 * Visor de imagen 443×362 (controles glass: expandir · ‹ · › · contador) CON
 * su tira de miniaturas (Filmstrip 443×87, drag-to-scroll) debajo, como UNA sola
 * unidad. Click en una miniatura → cambia la imagen grande al instante.
 *
 * 2 variantes (por el borde de la miniatura seleccionada):
 *   · live       → white → #F4AC59 → #8460E5 → white
 *   · negotiable → white → #4DDCDC → #6445DF → white
 *
 * Estado interno (no controlado) por defecto; o controlado vía selectedIndex.
 */

import { useId, useRef, useState } from "react";
import type { JSX, ReactNode, MouseEventHandler, PointerEvent as ReactPointerEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardViewerVariant = "live" | "negotiable";

export interface CardViewerProps {
  /** Variante del borde de selección (default "live") */
  variant?: CardViewerVariant;
  /** URLs de las imágenes (visor + miniaturas) */
  images?: string[];
  /** Alt de la imagen grande */
  imageAlt?: string;
  /** Índice seleccionado (controlado, 0-based) */
  selectedIndex?: number;
  /** Índice inicial (no controlado, default 0) */
  defaultIndex?: number;
  /** Callback al cambiar de imagen (click en miniatura o ‹/›) */
  onSelect?: (index: number) => void;
  /** Click en el botón expandir */
  onExpand?: MouseEventHandler<HTMLButtonElement>;
  /** Embebido dentro de una card padre: el visor va a ras (sin sombra ni
   *  redondeo propios), porque el borde/redondeo los pone el contenedor. */
  embedded?: boolean;
  /** Slot opcional ARRIBA del visor, DENTRO de la card. Cuando se pasa, un solo
   *  borde gradiente + redondeo inferior envuelve header+visor (el filmstrip
   *  queda fuera, debajo). Úsalo para el conjunto SalaStatus + visor. */
  header?: ReactNode;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-cardviewer-styles";

const CARDVIEWER_STYLES = `
.pcardv {
  display: flex;
  flex-direction: column;
  gap: 9px;
  width: 443px;
  max-width: 100%;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}

/* ── Visor de imagen ── */
.pcardv__viewer {
  position: relative;
  width: 100%;
  height: 362px;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  background: #F2F4F3;
  box-shadow: rgba(0,0,0,0.1) 0px 0px 16px 4px;
}
.pcardv__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pcardv__btn {
  position: absolute;
  appearance: none;
  border: none;
  background: rgba(0,0,0,0.5);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s;
}
.pcardv__btn:hover { background: rgba(0,0,0,0.65); }
.pcardv__btn:active { transform: scale(0.92); }
.pcardv__btn:focus-visible { outline: 2px solid #ffffff; outline-offset: 2px; }
.pcardv__btn--round { width: 36px; height: 36px; border-radius: 50%; }
.pcardv__expand { top: 12px; right: 12px; }
.pcardv__prev { top: 50%; left: 12px; transform: translateY(-50%); }
.pcardv__next { top: 50%; right: 12px; transform: translateY(-50%); }
.pcardv__prev:active, .pcardv__next:active { transform: translateY(-50%) scale(0.92); }
.pcardv__count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  height: 24px;
  min-width: 46px;
  padding: 0 10px;
  border-radius: 12px;
  background: rgba(0,0,0,0.5);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Tira de miniaturas (filmstrip) ── */
.pcardv__strip {
  display: flex;
  gap: 9px;
  width: 100%;
  overflow-x: auto;
  padding: 3px;
  box-sizing: border-box;
  scrollbar-width: none;
  cursor: grab;
  scroll-behavior: smooth;
}
.pcardv__strip--dragging { cursor: grabbing; scroll-behavior: auto; }
.pcardv__strip--dragging .pcardv__thumb { pointer-events: none; }
.pcardv__strip::-webkit-scrollbar { display: none; }
.pcardv__thumb {
  position: relative;
  flex-shrink: 0;
  width: 113px;
  height: 84px;
  border-radius: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s;
}
.pcardv__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 4px; }
.pcardv__thumb:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
/* Hover preview ring · indica click sin transform (igual al filmstrip de detail-header) */
.pcardv__thumb::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 4px;
  pointer-events: none;
  z-index: 2;
  box-shadow: none;
  transition: box-shadow 200ms cubic-bezier(0.3, 0, 0, 1);
}
.pcardv__thumb:not(.pcardv__thumb--selected):hover::before {
  box-shadow:
    inset 0 0 0 2px oklch(0.66 0.17 50 / 0.45),
    inset 0 0 0 3px oklch(1 0 0 / 0.30);
}
.pcardv--negotiable .pcardv__thumb:not(.pcardv__thumb--selected):hover::before {
  box-shadow:
    inset 0 0 0 2px oklch(0.78 0.14 195 / 0.45),
    inset 0 0 0 3px oklch(1 0 0 / 0.30);
}
/* Selección = aro gradiente de 3px ENCIMA (no cambia el tamaño de la miniatura) */
.pcardv__thumb--selected { box-shadow: rgba(0,0,0,0.1) 0px 0px 16px 4px; }
.pcardv__thumb--selected::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 4px;
  padding: 3px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.pcardv--live .pcardv__thumb--selected::after {
  background: linear-gradient(120deg, #ffffff 0%, #F4AC59 25%, #8460E5 75%, #ffffff 100%);
}
.pcardv--negotiable .pcardv__thumb--selected::after {
  background: linear-gradient(120deg, #ffffff 0%, #4DDCDC 25%, #6445DF 75%, #ffffff 100%);
}

/* ── Embebido en una card padre: visor a ras (el borde/redondeo lo pone el padre) ── */
.pcardv--embedded .pcardv__viewer { border-radius: 0; box-shadow: none; }

/* ── Card del conjunto (header + visor) · UN solo borde gradiente, top recto, bottom 16 ── */
.pcardv__card {
  box-sizing: border-box;
  width: 100%;
  padding: 1.5px;
  border-radius: 0 0 16px 16px;
  background: linear-gradient(120deg, #ffffff 0%, #F4AC59 22%, #8460E5 74.5%, #ffffff 100%);
  box-shadow: rgba(0,0,0,0.15) 0px 8px 20px;
}
.pcardv__card-inner {
  box-sizing: border-box;
  width: 100%;
  border-radius: 0 0 15px 15px;
  overflow: hidden;
  background: #2E0F70;
}
/* Visor a ras dentro de la card (el borde/redondeo los pone la card) */
.pcardv__card .pcardv__viewer { border-radius: 0; box-shadow: none; }

@media (prefers-reduced-motion: reduce) {
  .pcardv__btn, .pcardv__thumb, .pcardv__thumb::before { transition: none; }
}
`;

let _stylesInjected = false;

const DEFAULT_IMAGES = ["", "", "", ""];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CardViewer({
  variant = "live",
  images = DEFAULT_IMAGES,
  imageAlt = "",
  selectedIndex,
  defaultIndex = 0,
  onSelect,
  onExpand,
  embedded = false,
  header,
  className = "",
}: CardViewerProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const trackRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const isControlled = selectedIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const total = images.length;
  const index = isControlled ? selectedIndex : internalIndex;

  function select(target: number): void {
    const next = total > 0 ? ((target % total) + total) % total : 0;
    if (!isControlled) setInternalIndex(next);
    onSelect?.(next);
  }

  // Solo registramos el inicio; NO capturamos el puntero todavía para que un
  // click simple llegue normal al botón de la miniatura.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const el = trackRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    // Recién al superar 4px se considera arrastre: capturamos el puntero y
    // desactivamos los clicks de las miniaturas mientras se arrastra.
    if (!drag.current.moved && Math.abs(dx) > 4) {
      drag.current.moved = true;
      el.classList.add("pcardv__strip--dragging");
      try { el.setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
    if (drag.current.moved) {
      el.scrollLeft = drag.current.startScroll - dx;
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const el = trackRef.current;
    if (!el) return;
    drag.current.active = false;
    el.classList.remove("pcardv__strip--dragging");
    try { el.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = CARDVIEWER_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const currentSrc = images[index];

  const viewer = (
    <div className="pcardv__viewer">
          {currentSrc ? <img className="pcardv__img" src={currentSrc} alt={imageAlt} /> : null}

          <button type="button" className="pcardv__btn pcardv__btn--round pcardv__expand" onClick={onExpand} aria-label="Ampliar imagen">
            <svg width="22" height="22" viewBox="421 42 16 16" fill="none" aria-hidden="true">
              <path d="M426.833 44H424.833C424.097 44 423.5 44.5974 423.5 45.3333V47.3333M435.5 47.3333V45.3333C435.5 44.5974 434.903 44 434.167 44H432.167M432.167 56H434.167C434.903 56 435.5 55.4026 435.5 54.6667V52.6667M423.5 52.6667V54.6667C423.5 55.4026 424.097 56 424.833 56H426.833"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button type="button" className="pcardv__btn pcardv__btn--round pcardv__prev" onClick={function prev() { select(index - 1); }} aria-label="Imagen anterior">
            <svg width="22" height="22" viewBox="40 199 16 16" fill="none" aria-hidden="true">
              <path d="M50.5 201L42.5 207L50.5 213" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button type="button" className="pcardv__btn pcardv__btn--round pcardv__next" onClick={function next() { select(index + 1); }} aria-label="Imagen siguiente">
            <svg width="22" height="22" viewBox="423 199 16 16" fill="none" aria-hidden="true">
              <path d="M425.5 201L433.5 207L425.5 213" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

      <span className="pcardv__count">{index + 1}/{total}</span>
    </div>
  );

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: CARDVIEWER_STYLES }} />
      <div className={["pcardv", `pcardv--${variant}`, embedded ? "pcardv--embedded" : "", className].filter(Boolean).join(" ")}>

        {/* Conjunto header + visor (con header → card de borde gradiente; sin header → visor suelto) */}
        {header ? (
          <div className="pcardv__card">
            <div className="pcardv__card-inner">
              {header}
              {viewer}
            </div>
          </div>
        ) : (
          viewer
        )}

        {/* Filmstrip (aparte, debajo del conjunto) */}
        <div
          ref={trackRef}
          className="pcardv__strip"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {images.map((src, i) => {
            const selected = i === index;
            return (
              <button
                key={`${uid}-${i}`}
                type="button"
                className={["pcardv__thumb", selected ? "pcardv__thumb--selected" : ""].filter(Boolean).join(" ")}
                onClick={function pick() { if (!drag.current.moved) select(i); }}
                aria-label={`Imagen ${i + 1}`}
                aria-current={selected ? "true" : undefined}
              >
                {src ? <img src={src} alt="" /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
