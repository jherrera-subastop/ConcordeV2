"use client";

/**
 * BidPosition — Generado por Concorde
 * Fuente: Figma VOYAGER · "ConsolePositions" (2934:14554) +
 *         "Background+Border" (3188:11944 live · 3188:11955 vault)
 *
 * Tabla de posiciones de pujas: card glass (white 28%→4% + backdrop-blur, radio 16, borde gradiente, sombra)
 * con header de columnas (PUESTO · USUARIO · BIDS, decodificado del SVG) y N
 * filas tipo pastilla en grid de 3 columnas:
 *   · 1ª posición  → live (naranja #F4AC59→#B25614, borde gradiente, trofeo dorado)
 *   · resto        → vault (morado #19004A→#3B1782→#2E0F70, borde #99A1AF)
 * Colores/gradientes/sombras copiados tal cual del SVG. Texto = data (`positions`),
 * porque en el SVG los textos son glifos vectorizados (placeholder), no editables.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import type { JSX } from "react";

export interface BidPositionItem {
  /**
   * Identidad estable de la fila (p. ej. el id de usuario de la API/socket).
   * Es lo que habilita la animación de reordenamiento: mientras el `id` se
   * mantenga, la fila se desliza a su nueva posición en vez de re-montarse.
   * Si se omite se usa el `name` (sin animación de reorden ante nombres iguales).
   */
  id?: string;
  /** Usuario / nombre (columna central) */
  name: string;
  /** Nº de bids (columna derecha) */
  value: string;
  /** Override del ordinal (default: índice + "°") */
  rank?: string;
}

export interface BidPositionProps {
  /** Encabezado columna izquierda (default "PUESTO") */
  rankLabel?: string;
  /** Encabezado columna central (default "C.U.U.") */
  nameLabel?: string;
  /** Encabezado columna derecha (default "BIDS") */
  bidsLabel?: string;
  /**
   * Posiciones (la 1ª es live, el resto vault). Pensado para alimentarse en
   * vivo desde una API/socket: pásalas como nuevo array en cada actualización
   * y, si las filas traen `id`, los cambios de orden se animan automáticamente.
   */
  positions?: BidPositionItem[];
  className?: string;
}

const DEFAULT_POSITIONS: BidPositionItem[] = [
  { id: "u1", name: "JA8NEE", value: "2" },
  { id: "u2", name: "BEKVS1", value: "1" },
  { id: "u3", name: "KAHTH4", value: "1" },
  { id: "u4", name: "KAHTH4", value: "1" },
  { id: "u5", name: "KAHTH4", value: "1" },
];

const STYLE_ID = "concorde-bidposition-styles";

const BIDPOSITION_STYLES = `
.pbidpos {
  box-sizing: border-box;
  width: 313px;
  max-width: 100%;
  border-radius: 16px;
  border: 1.5px solid transparent;
  /* GLASS oscuro: base navy (= el "behind transparent areas" #100030) + sheen
     blanco (paint0: white 28%→4%) + backdrop-blur (Figma "bg blur 40" → 20px) */
  background-image:
    linear-gradient(127deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 45%, rgba(255,255,255,0.03) 100%),
    linear-gradient(160deg, rgba(34, 0, 92,0.93) 0%, rgba(16, 0, 48,0.95) 100%),
    linear-gradient(125deg, rgba(255,255,255,0.9) 0%, rgba(244,172,89,0.7) 22%, rgba(132,96,229,0.7) 74.5%, rgba(255,255,255,0.9) 100%);
  background-origin: border-box;
  background-clip: padding-box, padding-box, border-box;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  box-shadow: rgba(16, 0, 48,0.6) 0px 12px 36px -4px, inset 0 1px 0 rgba(255,255,255,0.22);
  padding: 0 16px 16px;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
/* 3 columnas fijas como el SVG: 78 · 143 · 58 (= 279) */
.pbidpos__head,
.pbidpos__row {
  display: grid;
  grid-template-columns: 78fr 143fr 58fr;
  align-items: center;
}
.pbidpos__head {
  padding: 14px 0 11px;
  margin-bottom: 12px;
  border-bottom: 1px solid #E1E3E2;
}
.pbidpos__head span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #ffffff;
  white-space: nowrap;
}
.pbidpos__rows { display: flex; flex-direction: column; gap: 8px; }
.pbidpos__row {
  box-sizing: border-box;
  height: 28px;
  border-radius: 14px;
  color: #ffffff;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .pbidpos__row { transition: none !important; transform: none !important; }
}
/* alineación por columna (idéntica en header y filas) */
.pbidpos__c1 { text-align: center; }
.pbidpos__c2 { text-align: left; padding-left: 12px; }
.pbidpos__c3 { text-align: center; }
.pbidpos__rank { font-size: 12px; font-weight: 700; }
.pbidpos__value { font-size: 12px; font-weight: 700; white-space: nowrap; }
.pbidpos__name {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding-left: 12px;
}
.pbidpos__nametext {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pbidpos__trophy { flex-shrink: 0; filter: drop-shadow(0 0 2px rgba(240,187,59,0.65)); }

/* 1ª posición — live (naranja, borde gradiente) */
.pbidpos__row--live {
  border: 1px solid transparent;
  background-image:
    linear-gradient(180deg, #F4AC59 0%, #ED8936 40%, #B25614 100%),
    linear-gradient(120deg, #ffffff 0%, #F4AC59 22%, #8460E5 74.5%, #ffffff 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
/* resto — vault (morado, borde gris) */
.pbidpos__row--vault {
  border: 1px solid #99A1AF;
  background: linear-gradient(90deg, #19004A 0%, #3B1782 50%, #2E0F70 100%);
}
`;

function Trophy(): JSX.Element {
  return (
    <svg className="pbidpos__trophy" width="14" height="14" viewBox="177.5 80.3 12.5 12" fill="none" aria-hidden="true">
      <path
        d="M187.471 81.1675H180.476V82.3333H178.145V84.0821C178.145 85.3698 179.188 86.4137 180.476 86.4137C180.935 87.6649 182.065 88.5465 183.391 88.6871V90.4941H181.642V91.66H186.305V90.4941H184.557V88.6871C185.882 88.5465 187.012 87.6649 187.471 86.4137C188.759 86.4137 189.803 85.3698 189.803 84.0821V82.3333H187.471V81.1675ZM180.476 85.2479C179.832 85.2479 179.31 84.7259 179.31 84.0821V83.4991H180.476V85.2479ZM188.637 84.0821C188.637 84.7259 188.115 85.2479 187.471 85.2479V83.4991H188.637V84.0821Z"
        fill="#FBC47D"
      />
    </svg>
  );
}

function keyOf(p: BidPositionItem, i: number): string {
  return p.id ?? `${p.name}-${i}`;
}

export default function BidPosition({
  rankLabel = "PUESTO",
  nameLabel = "C.U.U.",
  bidsLabel = "BIDS",
  positions = DEFAULT_POSITIONS,
  className = "",
}: BidPositionProps): JSX.Element {
  // Inyección de estilos en cliente (el <style> SSR de abajo cubre el primer paint)
  useEffect(function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = BIDPOSITION_STYLES;
    document.head.appendChild(el);
  }, []);

  // ── FLIP: anima el deslizamiento de cada fila a su nueva posición ───────────
  // Usa offsetTop/offsetLeft (relativos al contenedor, NO al viewport) para que
  // el scroll de la página no genere deltas falsos. Solo corre cuando cambian las
  // posiciones (no en cada render ni al scrollear).
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevPos = useRef<Map<string, { top: number; left: number }>>(new Map());

  useLayoutEffect(function flip() {
    const refs = rowRefs.current;
    const before = prevPos.current;
    const after = new Map<string, { top: number; left: number }>();
    refs.forEach(function measure(node, key) {
      after.set(key, { top: node.offsetTop, left: node.offsetLeft });
    });
    refs.forEach(function play(node, key) {
      const a = before.get(key);
      const b = after.get(key);
      if (!a || !b) return;
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx === 0 && dy === 0) return;
      // 1) coloca la fila en su posición anterior, sin transición
      node.style.transition = "transform 0s";
      node.style.transform = `translate(${dx}px, ${dy}px)`;
      // 2) fuerza reflow y deja que anime hasta su lugar real
      void node.offsetWidth;
      requestAnimationFrame(function release() {
        node.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
        node.style.transform = "";
      });
    });
    prevPos.current = after;
  }, [positions]);

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BIDPOSITION_STYLES }} />
      <section className={`pbidpos ${className}`.trim()} aria-label="Posiciones">
        <div className="pbidpos__head">
          <span className="pbidpos__c1">{rankLabel}</span>
          <span className="pbidpos__c2">{nameLabel}</span>
          <span className="pbidpos__c3">{bidsLabel}</span>
        </div>
        <div className="pbidpos__rows">
          {positions.map(function renderPos(p, i) {
            const live = i === 0;
            const k = keyOf(p, i);
            return (
              <div
                key={k}
                ref={function setRef(node) {
                  if (node) rowRefs.current.set(k, node);
                  else rowRefs.current.delete(k);
                }}
                className={`pbidpos__row ${live ? "pbidpos__row--live" : "pbidpos__row--vault"}`}
              >
                <span className="pbidpos__rank pbidpos__c1">{p.rank ?? `${i + 1}°`}</span>
                <span className="pbidpos__name">
                  <span className="pbidpos__nametext">{p.name}</span>
                  {live ? <Trophy /> : null}
                </span>
                <span className="pbidpos__value pbidpos__c3">{p.value}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
