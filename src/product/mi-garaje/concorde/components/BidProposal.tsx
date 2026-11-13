"use client";

/**
 * BidProposal — Generado por Concorde
 * Fuente: Figma VOYAGER · "PropuestaBid v2 / Default" (3300:12845)
 *
 * Propuesta de bid (glassmorphic): card 278×78 (radio 20) con relleno white 8% +
 * backdrop-blur(5px), borde gradiente y sombra morada. Monto grande blanco con
 * glow morado y caption lila.
 *
 * Animación de "nuevo bid" (prop `flash`), con los colores `flashColors` y 4
 * modos `flashMode` (taxonomía de animación de slots):
 *   · "bulb"    → Luminiscente: se prende y apaga como una bombilla (sin giro).
 *   · "spin"    → Rotatoria: un haz/cometa de luz que gira una vez.
 *   · "explode" → Explosiva: estallido de chispas/partículas hacia afuera.
 *   · "pulse"   → Anticipación/Expansiva: escala elástica + borde neón intermitente.
 *   · "combo"   → Celebración: estallido (explode) + anticipación (pulse) juntos.
 *   · "shine"   → Como "combo" pero SIN chispas (solo latido + luz + neón).
 * En todos, el nuevo monto aparece al apagarse/asentarse la luz.
 */

import { useEffect, useRef, useState } from "react";
import type { JSX, CSSProperties } from "react";

export type BidProposalFlashMode = "bulb" | "spin" | "explode" | "pulse" | "combo" | "shine";

export interface BidProposalProps {
  /** Monto grande (blanco) — default "US$ 6,559" */
  amount?: string;
  /** Caption inferior (degradado lila) — default "ENVIADO POR ZAE389" */
  label?: string;
  /** Contador: al cambiar, dispara la animación de nuevo bid */
  flash?: number;
  /** Colores del efecto de luz (editable). Default: primary (naranja→lila→blanco). */
  flashColors?: string[];
  /** Tipo de efecto. Default "bulb". */
  flashMode?: BidProposalFlashMode;
  className?: string;
}

// Primary (VYStrokes1): naranja-500 → vault-500 → blanco
const DEFAULT_FLASH_COLORS = ["#F4AC59", "#8460E5", "#ffffff"];
const SPARKS = 12;

const STYLE_ID = "concorde-bidproposal-styles";

const BIDPROPOSAL_STYLES = `
@property --pbid-spin { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

.pbid {
  position: relative;
  box-sizing: border-box;
  width: 278px;
  max-width: 100%;
  height: 78px;
  border-radius: 20px;
  background: rgba(255,255,255,0.08);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  box-shadow: rgba(16, 0, 48,0.3) 0px 8px 24px -2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 16px;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
/* Borde gradiente base (anillo 1.5px, centro recortado con mask) */
.pbid::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(135deg, #ffffff 0%, #F4AC59 22%, #8460E5 74.5%, #ffffff 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 2;
}
/* Luz del borde (común): el fondo/animación dependen del modo */
.pbid::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  z-index: 3;
  filter: drop-shadow(0 0 5px var(--pbid-c3, #ffffff)) drop-shadow(0 0 12px var(--pbid-c2, #8460E5)) drop-shadow(0 0 20px var(--pbid-c1, #F4AC59));
}

/* Luz interna (común): forma/animación por modo */
.pbid__lightwrap {
  position: absolute; inset: 0; border-radius: inherit;
  overflow: hidden; pointer-events: none; z-index: 0;
}
.pbid__light {
  position: absolute; inset: -15%;
  filter: blur(22px) saturate(1.7) brightness(1.6);
  mix-blend-mode: screen;
  opacity: 0;
}

/* ===== Modo BULB (mancha horizontal, se prende y apaga sin giro) ===== */
.pbid--bulb .pbid__light {
  background: linear-gradient(95deg, var(--pbid-c1, #F4AC59) 0%, var(--pbid-c2, #8460E5) 52%, var(--pbid-c3, #ffffff) 100%);
}
.pbid--bulb.pbid--flash .pbid__light { animation: pbid-bulb 600ms ease-in-out; }
.pbid--bulb::after {
  background: linear-gradient(135deg, var(--pbid-c1, #F4AC59) 0%, var(--pbid-c2, #8460E5) 50%, var(--pbid-c3, #ffffff) 100%);
}
.pbid--bulb.pbid--flash::after { animation: pbid-onoff 600ms ease-in-out; }
@keyframes pbid-bulb { 0% { opacity: 0; } 28% { opacity: 1; } 100% { opacity: 0; } }
@keyframes pbid-onoff { 0% { opacity: 0; } 28% { opacity: 1; } 100% { opacity: 0; } }

/* ===== Modo SPIN (haz/cometa que gira alrededor del borde) ===== */
.pbid--spin .pbid__light {
  inset: -45%;
  background: conic-gradient(from 0deg, transparent 0deg, var(--pbid-c1, #F4AC59) 60deg, var(--pbid-c2, #8460E5) 150deg, var(--pbid-c3, #ffffff) 230deg, transparent 330deg);
}
.pbid--spin.pbid--flash .pbid__light { animation: pbid-spin-light 900ms ease-in-out; }
.pbid--spin::after {
  background: conic-gradient(from var(--pbid-spin), transparent 0 270deg, var(--pbid-c1, #F4AC59) 315deg, var(--pbid-c2, #8460E5) 340deg, var(--pbid-c3, #ffffff) 356deg, transparent 360deg);
}
.pbid--spin.pbid--flash::after { animation: pbid-arc 950ms ease-in-out; }
@keyframes pbid-spin-light {
  0%   { opacity: 0; transform: rotate(0deg) scale(1.2); }
  16%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; transform: rotate(540deg) scale(1.2); }
}
@keyframes pbid-arc {
  0%   { opacity: 0; --pbid-spin: 0deg; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { opacity: 0; --pbid-spin: 540deg; }
}

/* ===== Modo EXPLODE (estallido: flash central + chispas hacia afuera) ===== */
.pbid--explode .pbid__light {
  background: radial-gradient(circle at 50% 50%, var(--pbid-c3, #ffffff) 0%, var(--pbid-c2, #8460E5) 38%, var(--pbid-c1, #F4AC59) 65%, transparent 80%);
}
.pbid--explode.pbid--flash .pbid__light { animation: pbid-burst 500ms ease-out; }
.pbid--explode::after {
  background: linear-gradient(135deg, var(--pbid-c1, #F4AC59) 0%, var(--pbid-c2, #8460E5) 50%, var(--pbid-c3, #ffffff) 100%);
}
.pbid--explode.pbid--flash::after { animation: pbid-onoff 500ms ease-out; }
@keyframes pbid-burst {
  0%   { opacity: 0; transform: scale(0.3); }
  16%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.35); }
}
.pbid__sparks { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
.pbid__spark {
  position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--pbid-c3, #ffffff) 0%, var(--pbid-c1, #F4AC59) 70%, transparent 100%);
  filter: drop-shadow(0 0 4px var(--pbid-c2, #8460E5));
  opacity: 0;
}
.pbid--explode.pbid--flash .pbid__spark { animation: pbid-spark 600ms cubic-bezier(0.2,0.7,0.3,1); }
@keyframes pbid-spark {
  0%   { opacity: 0; transform: rotate(var(--ang)) translateX(6px) scale(0.4); }
  22%  { opacity: 1; }
  100% { opacity: 0; transform: rotate(var(--ang)) translateX(66px) scale(1); }
}

/* ===== Modo PULSE (anticipación/expansiva: escala elástica + neón intermitente) ===== */
.pbid--pulse.pbid--flash { animation: pbid-pulse 700ms cubic-bezier(0.34,1.56,0.64,1); }
@keyframes pbid-pulse {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.pbid--pulse .pbid__light {
  background: linear-gradient(95deg, var(--pbid-c1, #F4AC59) 0%, var(--pbid-c2, #8460E5) 52%, var(--pbid-c3, #ffffff) 100%);
}
.pbid--pulse.pbid--flash .pbid__light { animation: pbid-pulse-light 700ms ease-in-out; }
.pbid--pulse::after {
  background: linear-gradient(135deg, var(--pbid-c1, #F4AC59) 0%, var(--pbid-c2, #8460E5) 50%, var(--pbid-c3, #ffffff) 100%);
}
.pbid--pulse.pbid--flash::after { animation: pbid-flicker 700ms steps(1, end); }
@keyframes pbid-pulse-light {
  0% { opacity: 0; } 25% { opacity: 0.9; } 50% { opacity: 0.2; } 75% { opacity: 0.9; } 100% { opacity: 0; }
}
@keyframes pbid-flicker {
  0% { opacity: 0; } 12% { opacity: 1; } 28% { opacity: 0.15; } 44% { opacity: 1; } 60% { opacity: 0.15; } 78% { opacity: 1; } 100% { opacity: 0; }
}

/* ===== Modos COMBO (estalla + anticipa) y SHINE (combo sin chispas) ===== */
.pbid--combo.pbid--flash, .pbid--shine.pbid--flash { animation: pbid-combo 800ms cubic-bezier(0.34,1.56,0.64,1); }
@keyframes pbid-combo {
  0%   { transform: scale(1); box-shadow: rgba(16, 0, 48,0.3) 0px 8px 24px -2px; }
  18%  {
    transform: scale(1.06);
    box-shadow:
      rgba(16, 0, 48,0.3) 0px 8px 24px -2px,
      0 0 20px var(--pbid-c3, #ffffff),
      0 0 38px var(--pbid-c2, #8460E5),
      0 0 58px var(--pbid-c1, #F4AC59);
  }
  40%  { transform: scale(1.005); box-shadow: rgba(16, 0, 48,0.3) 0px 8px 24px -2px; }
  62%  {
    transform: scale(1.045);
    box-shadow:
      rgba(16, 0, 48,0.3) 0px 8px 24px -2px,
      0 0 18px var(--pbid-c3, #ffffff),
      0 0 34px var(--pbid-c2, #8460E5),
      0 0 52px var(--pbid-c1, #F4AC59);
  }
  100% { transform: scale(1); box-shadow: rgba(16, 0, 48,0.3) 0px 8px 24px -2px; }
}
.pbid--combo .pbid__light, .pbid--shine .pbid__light {
  background: radial-gradient(circle at 50% 50%, var(--pbid-c3, #ffffff) 0%, var(--pbid-c2, #8460E5) 38%, var(--pbid-c1, #F4AC59) 65%, transparent 80%);
}
/* luz interna intermitente (como Anticipa) en vez de un solo estallido */
.pbid--combo.pbid--flash .pbid__light, .pbid--shine.pbid--flash .pbid__light { animation: pbid-pulse-light 800ms ease-in-out; }
.pbid--combo::after, .pbid--shine::after {
  background: linear-gradient(135deg, var(--pbid-c1, #F4AC59) 0%, var(--pbid-c2, #8460E5) 50%, var(--pbid-c3, #ffffff) 100%);
}
.pbid--combo.pbid--flash::after, .pbid--shine.pbid--flash::after { animation: pbid-flicker 800ms steps(1, end); }
/* solo "combo" lanza chispas */
.pbid--combo.pbid--flash .pbid__spark { animation: pbid-spark 650ms cubic-bezier(0.2,0.7,0.3,1); }

/* Glow externo (común salvo pulse/combo): la card "irradia" al prenderse */
.pbid--bulb.pbid--flash, .pbid--spin.pbid--flash, .pbid--explode.pbid--flash {
  animation: pbid-glow 600ms ease-in-out;
}
@keyframes pbid-glow {
  0%, 100% { box-shadow: rgba(16, 0, 48,0.3) 0px 8px 24px -2px; }
  28% {
    box-shadow:
      rgba(16, 0, 48,0.3) 0px 8px 24px -2px,
      0 0 20px var(--pbid-c3, #ffffff),
      0 0 38px var(--pbid-c2, #8460E5),
      0 0 58px var(--pbid-c1, #F4AC59);
  }
}

/* El nuevo monto/label aparecen cuando la luz se apaga (común) */
.pbid--flash .pbid__amount, .pbid--flash .pbid__label { animation: pbid-appear 600ms ease-out; }
@keyframes pbid-appear {
  0%, 38% { opacity: 0; transform: scale(0.94); }
  100%    { opacity: 1; transform: scale(1); }
}

.pbid__amount {
  position: relative;
  z-index: 1;
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-shadow:
    0 0 7px rgba(174, 142, 255,0.7),
    0 0 16px rgba(90, 53, 194,0.6),
    0 0 32px rgba(90, 53, 194,0.5),
    0 0 53px rgba(46, 15, 112,0.4);
}
.pbid__label {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
  background: linear-gradient(160deg, #CFBAFF 0%, #ffffff 35%, #AE8EFF 65%, #CFBAFF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 6px rgba(237, 137, 54,0.5));
}
@media (prefers-reduced-motion: reduce) {
  .pbid--flash, .pbid--flash::after, .pbid--flash .pbid__light, .pbid--flash .pbid__spark,
  .pbid--flash .pbid__amount, .pbid--flash .pbid__label { animation: none; }
}
`;

let _stylesInjected = false;

export default function BidProposal({
  amount = "US$ 6,559",
  label = "ENVIADO POR ZAE389",
  flash = 0,
  flashColors = DEFAULT_FLASH_COLORS,
  flashMode = "bulb",
  className = "",
}: BidProposalProps): JSX.Element {
  const [flashing, setFlashing] = useState(false);
  const prevFlash = useRef(flash);

  const [c1, c2, c3] = flashColors;
  const colorVars = {
    "--pbid-c1": c1 ?? DEFAULT_FLASH_COLORS[0],
    "--pbid-c2": c2 ?? DEFAULT_FLASH_COLORS[1],
    "--pbid-c3": c3 ?? DEFAULT_FLASH_COLORS[2],
  } as CSSProperties;

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = BIDPROPOSAL_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  // Duración de cada modo (debe ser >= la animación CSS más larga de ese modo,
  // o la clase "pbid--flash" se quita a medio ciclo y el efecto se corta).
  const FLASH_MS: Record<BidProposalFlashMode, number> = {
    bulb: 650,
    spin: 1000,
    explode: 650,
    pulse: 750,
    combo: 850,
    shine: 850,
  };

  useEffect(
    function onFlash() {
      if (flash === prevFlash.current) return;
      prevFlash.current = flash;
      // reinicia la animación (quita y vuelve a poner la clase)
      setFlashing(false);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setFlashing(true)));
      const t = setTimeout(() => setFlashing(false), FLASH_MS[flashMode]);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    },
    [flash, flashMode],
  );

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BIDPROPOSAL_STYLES }} />
      <div className={`pbid pbid--${flashMode}${flashing ? " pbid--flash" : ""} ${className}`.trim()} style={colorVars}>
        <span className="pbid__lightwrap" aria-hidden="true">
          <span className="pbid__light" />
        </span>
        {flashMode === "explode" || flashMode === "combo" ? (
          <span className="pbid__sparks" aria-hidden="true">
            {Array.from({ length: SPARKS }).map((_, i) => (
              <span key={i} className="pbid__spark" style={{ "--ang": `${(360 / SPARKS) * i}deg` } as CSSProperties} />
            ))}
          </span>
        ) : null}
        <span className="pbid__amount">{amount}</span>
        {label ? <span className="pbid__label">{label}</span> : null}
      </div>
    </>
  );
}
