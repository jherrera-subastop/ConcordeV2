/**
 * PromoBanner — 766×192 · variantes con los BACKGROUNDS de la referencia Subaspass
 * (carpeta /Banners). Paleta de marca promo:
 *   · naranja  #E8732A · naranja claro #F49B57 · naranja profundo #C85A1E
 *   · morado   #3D2299 · morado profundo #2A1670 · crema #FFE2C2
 * 4 direcciones de fondo A/B/C/D aplicadas a los banners de navegación.
 *
 * Jerarquía visual (de mayor a menor peso):
 *   1. número «Ofertas N» (crema, gigante)     — el dato
 *   2. título con acento crema                  — el qué
 *   3. pill de contexto (EN VIVO / NEGOCIABLE)  — la categoría
 *   4. chip glass de horario                    — el meta
 * Las SubasCoins son TEXTURA de fondo: contenidas dentro del banner, baja
 * opacidad, detrás del contenido — nunca compiten con el número ni se cortan.
 * Estático, sin efectos.
 */

import type { CSSProperties, JSX } from "react";
import TimerIcon from "@/src/product/ganaya/concorde/components/TimerIcon";
import { HandshakeIcon, CarIcon, GemOutline } from "./decor";
import { BANNER_WIDTH, BANNER_HEIGHT } from "./dimensions";

export { BANNER_WIDTH, BANNER_HEIGHT } from "./dimensions";

// ─── Paleta de marca (referencia Subaspass) ───────────────────────────────────

const C = {
  orange: "#E8732A",
  orangeLight: "#F49B57",
  orangeDeep: "#C85A1E",
  orangeDark: "#B14E18",
  plum: "#3D2299",
  plumDeep: "#2A1670",
  cream: "#FFE2C2",
  white: "#FFFFFF",
};

// ─── Backgrounds A/B/C/D ──────────────────────────────────────────────────────

export type PromoBg = "orange" | "plum-orange" | "diagonal" | "orange-bold";

const BACKGROUNDS: Record<PromoBg, string> = {
  "orange": `linear-gradient(105deg, ${C.orange} 0%, ${C.orangeDeep} 100%)`,
  "plum-orange": `linear-gradient(100deg, ${C.plumDeep} 0%, ${C.plum} 32%, ${C.orangeDeep} 78%, ${C.orange} 100%)`,
  "diagonal": `linear-gradient(95deg, ${C.plumDeep} 0%, ${C.plum} 40%, ${C.orangeDeep} 100%)`,
  "orange-bold": `linear-gradient(120deg, ${C.orangeLight} 0%, ${C.orange} 45%, ${C.orangeDark} 100%)`,
};

// ─── Tonos para las variantes con tokens del DS ───────────────────────────────
// live = vault gradiente del Button primary (#ed8936→#8460e5)
// negotiable = el CELESTE del sistema negociable (#00D2D3/#00AEB1) → #8460e5

export type PromoTone = "live" | "negotiable";

interface ToneGrad {
  /** Gradiente token (fill del Button primary / negotiable) */
  token: string;
  /** Gradiente B invertido (color del tono a la izq → morado a la der) */
  flip: string;
  /** Fondo del layout centrado glass */
  centerBg: string;
  /** Fondo del layout con gema outline */
  gemBg: string;
  /** Fondo del layout "mega" (plum profundo → acento del tono) */
  megaBg: string;
  /** Tinte RGB del glass teñido ("232,115,42") */
  glassTint: string;
  /** Glow cálido/frío en RGB */
  glowWarm: string;
  glowCool: string;
  /** Stops del gradiente del tono para SVG (wave-split) */
  stopA: string;
  stopB: string;
}

const TONE_GRADIENTS: Record<PromoTone, ToneGrad> = {
  live: {
    token: "linear-gradient(135deg, #ED8936 0%, #ED8936 25%, #8460E5 100%)",
    flip: `linear-gradient(100deg, ${C.orange} 0%, ${C.orangeDeep} 26%, ${C.plum} 72%, ${C.plumDeep} 100%)`,
    centerBg: `linear-gradient(100deg, ${C.plumDeep} 0%, ${C.plum} 32%, ${C.orangeDeep} 78%, ${C.orange} 100%)`,
    gemBg: `linear-gradient(105deg, ${C.orange} 0%, ${C.orangeDeep} 100%)`,
    megaBg: "linear-gradient(115deg, #241262 0%, #3D2299 52%, #C85A1E 100%)",
    glassTint: "232,115,42",
    glowWarm: "255,226,194",
    glowCool: "174,142,255",
    stopA: "#ED8936",
    stopB: "#8460E5",
  },
  negotiable: {
    token: "linear-gradient(135deg, #00D2D3 0%, #00AEB1 25%, #8460E5 100%)",
    flip: "linear-gradient(100deg, #00D2D3 0%, #00AEB1 26%, #3D2299 72%, #2A1670 100%)",
    centerBg: "linear-gradient(100deg, #2A1670 0%, #3D2299 35%, #00838C 78%, #00D2D3 100%)",
    gemBg: "linear-gradient(105deg, #00D2D3 0%, #00939B 100%)",
    megaBg: "linear-gradient(115deg, #241262 0%, #3D2299 52%, #00939B 100%)",
    glassTint: "0,210,211",
    glowWarm: "178,246,246",
    glowCool: "174,142,255",
    stopA: "#00D2D3",
    stopB: "#8460E5",
  },
};

// ─── Piezas ───────────────────────────────────────────────────────────────────

const shell = (bg: string): CSSProperties => ({
  position: "relative",
  width: BANNER_WIDTH,
  height: BANNER_HEIGHT,
  background: bg,
  overflow: "hidden",
  fontFamily: 'var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif)',
  color: C.white,
  flexShrink: 0,
});

function Pill({ text, icon, end }: { text: string; icon?: boolean; end?: boolean }): JSX.Element {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: end ? "flex-end" : "flex-start",
        gap: 8,
        background: "rgba(0,0,0,0.22)",
        borderRadius: 999,
        padding: "5px 14px",
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: C.white,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <HandshakeIcon size={16} color={C.white} />}
      {text}
    </span>
  );
}

function Headline({ pre, accent }: { pre: string; accent: string }): JSX.Element {
  return (
    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: C.white }}>
      {pre} <span style={{ color: C.cream }}>{accent}</span>
    </h2>
  );
}

/** Contador «Ofertas N» — el elemento de mayor jerarquía (número crema gigante) */
function Counter({ count, size = 92 }: { count: number | string; size?: number }): JSX.Element {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 11, flexShrink: 0 }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: C.white, textShadow: "rgba(0,0,0,0.28) 0 1px 3px" }}>Ofertas</span>
      <span style={{ fontSize: size, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: C.cream, textShadow: "rgba(20,0,70,0.35) 0 3px 0, rgba(20,0,70,0.2) 0 8px 20px" }}>{count}</span>
    </div>
  );
}

function PhotoSlot({ width, side, fadeColor }: { width: number; side: "left" | "right"; fadeColor: string }): JSX.Element {
  const clip = side === "right" ? "polygon(18% 0, 100% 0, 100% 100%, 0 100%)" : undefined;
  const fade =
    side === "left"
      ? `linear-gradient(90deg, transparent 48%, ${fadeColor} 100%)`
      : `linear-gradient(75deg, ${fadeColor} 0%, transparent 42%)`;
  return (
    <div style={{ width, position: "relative", flexShrink: 0, clipPath: clip, background: "repeating-linear-gradient(45deg, #d9cfe6 0, #d9cfe6 20px, #cec2df 20px, #cec2df 40px)" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#8a7ba8", gap: 8 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8a7ba8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>FOTO</span>
      </div>
      <div style={{ position: "absolute", inset: 0, background: fade, pointerEvents: "none" }} />
    </div>
  );
}

function DecoCircle(style: CSSProperties): JSX.Element {
  return <div aria-hidden="true" style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }} />;
}

function Chip({ chip, end }: { chip: { label: string; icon?: "car" }; end?: boolean }): JSX.Element {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: end ? "flex-end" : "flex-start",
        gap: 10,
        background: "rgba(0,0,0,0.24)",
        color: C.white,
        borderRadius: 10,
        padding: "7px 15px",
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {chip.label}
      {chip.icon === "car" && <CarIcon size={18} color={C.white} />}
    </span>
  );
}

/** Chip glass de horario — ancho de contenido (nunca se estira) */
function TimerChip({ timer, end }: { timer: string; end?: boolean }): JSX.Element {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: end ? "flex-end" : "flex-start",
        gap: 7,
        height: 28,
        padding: "0 13px",
        borderRadius: 999,
        background: "linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 100%)",
        border: "1px solid rgba(255,255,255,0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "rgba(255,255,255,0.22) 0 1px 0 0 inset",
        fontSize: 12,
        fontWeight: 700,
        color: "#FFFFFF",
        whiteSpace: "nowrap",
      }}
    >
      <TimerIcon size={14} color={C.cream} />
      {timer}
    </span>
  );
}

/**
 * Coins de fondo — TEXTURA sutil, contenida en un área a la derecha detrás del
 * contador. Opacidad baja, blur ligero, recortada al banner (overflow hidden del
 * shell). Nunca compite con el número (va en z-index 0).
 */
/**
 * Decor — decoración de fondo MODERNA (estática): luces radiales suaves,
 * círculos concéntricos y arcos finos. Va detrás del contenido (z-index 0);
 * el overflow:hidden del shell la recorta limpio en los bordes.
 * `warm`/`cool` = los dos colores del glow (crema cálida + un frío del tono).
 */
function Decor({ warm = "255,226,194", cool = "255,255,255", cross = false, side = "right" }: { warm?: string; cool?: string; cross?: boolean; side?: "left" | "right" }): JSX.Element {
  // `side` = lado donde vive el contador (glow + rings van detrás de él)
  const main: CSSProperties = side === "right" ? { right: -40 } : { left: -40 };
  const ringA: CSSProperties = side === "right" ? { right: -70 } : { left: -70 };
  const ringB: CSSProperties = side === "right" ? { right: -30 } : { left: -30 };
  const dotA: CSSProperties = side === "right" ? { right: 200 } : { left: 200 };
  const dotB: CSSProperties = side === "right" ? { right: 260 } : { left: 260 };
  const arc: CSSProperties = side === "right" ? { left: -60 } : { right: -60 };
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Glow cálido grande detrás del número */}
      <div style={{ position: "absolute", ...main, top: "50%", transform: "translateY(-50%)", width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${warm},0.30) 0%, rgba(${warm},0) 70%)` }} />
      {/* Glow frío superior */}
      <div style={{ position: "absolute", left: "38%", top: -120, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${cool},0.14) 0%, rgba(${cool},0) 70%)` }} />
      {/* Círculos concéntricos (ring) — mitad fuera */}
      <div style={{ position: "absolute", ...ringA, top: "50%", transform: "translateY(-50%)", width: 240, height: 240, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", ...ringB, top: "50%", transform: "translateY(-50%)", width: 160, height: 160, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.10)" }} />
      {/* Dots */}
      <div style={{ position: "absolute", ...dotA, top: 34, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.35)" }} />
      <div style={{ position: "absolute", ...dotB, bottom: 34, width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.28)" }} />
      {/* Arco extra opcional en la esquina opuesta */}
      {cross && <div style={{ position: "absolute", ...arc, bottom: -60, width: 200, height: 200, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.10)" }} />}
    </div>
  );
}

function Sheen(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", top: 0, left: 0, right: 0, height: 52, background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 100%)", pointerEvents: "none", zIndex: 1 }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export type PromoLayout =
  | "photo-left"
  | "plum-counter"
  | "photo-right"
  | "bold-cta"
  | "flip"
  | "center-glass"
  | "token"
  | "gem-outline"
  | "mega"
  | "glass-tint"
  | "wave-split"
  | "orbit"
  | "echo";

export interface PromoBannerProps {
  layout: PromoLayout;
  /** Tono para las variantes con tokens del DS (default "live") */
  tone?: PromoTone;
  pillText: string;
  pillIcon?: boolean;
  titlePre: string;
  titleAccent: string;
  count: number | string;
  timer?: string;
  chip?: { label: string; icon?: "car" };
  className?: string;
}

export default function PromoBanner({
  layout,
  tone = "live",
  pillText,
  pillIcon = false,
  titlePre,
  titleAccent,
  count,
  timer,
  chip,
  className = "",
}: PromoBannerProps): JSX.Element {
  const tg = TONE_GRADIENTS[tone];

  // ── FLIP · gradiente invertido (tono→morado) · contador IZQUIERDA ──
  if (layout === "flip") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(tg.flip), display: "flex", alignItems: "stretch" }}>
        <Decor warm={tg.glowWarm} cool={tg.glowCool} side="left" />
        <Sheen />
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 0 0 40px", flexShrink: 0 }}>
          <Counter count={count} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 9, padding: "0 36px 0 20px", position: "relative", zIndex: 2, textAlign: "right" }}>
          <Pill text={pillText} icon={pillIcon} end />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} end />}
          {chip && <Chip chip={chip} end />}
        </div>
      </div>
    );
  }

  // ── CENTER-GLASS · panel glass centrado con todo el contenido ──
  if (layout === "center-glass") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(tg.centerBg), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Decor warm={tg.glowWarm} cool={tg.glowCool} />
        <Sheen />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "18px 34px",
            borderRadius: 18,
            background: "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "rgba(255,255,255,0.25) 0 1px 0 0 inset, rgba(20,0,70,0.25) 0 10px 26px -6px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <Pill text={pillText} icon={pillIcon} />
            <Headline pre={titlePre} accent={titleAccent} />
            {timer && <TimerChip timer={timer} />}
            {chip && <Chip chip={chip} />}
          </div>
          <span aria-hidden="true" style={{ width: 1.5, alignSelf: "stretch", background: "rgba(255,255,255,0.35)", borderRadius: 2 }} />
          <Counter count={count} size={80} />
        </div>
      </div>
    );
  }

  // ── TOKEN · fondo = gradiente del Button primary / negotiable ──
  if (layout === "token") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(tg.token), display: "flex", alignItems: "stretch" }}>
        <Decor warm={tg.glowWarm} cool={tg.glowCool} cross />
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 20px 0 34px", position: "relative", zIndex: 2 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 36px 0 0", flexShrink: 0 }}>
          <Counter count={count} />
        </div>
      </div>
    );
  }

  // ── GEM-OUTLINE · gema SubasCoin en bordes blancos como forma de fondo ──
  if (layout === "gem-outline") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(tg.gemBg), display: "flex", alignItems: "stretch" }}>
        {/* Gema outline gigante detrás del contador (se recorta elegante por la derecha) */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <GemOutline size={300} color="rgba(255,255,255,0.28)" style={{ right: -60, top: -58 }} />
          <GemOutline size={110} color="rgba(255,255,255,0.18)" style={{ left: 296, bottom: -34 }} />
        </div>
        <Decor warm={tg.glowWarm} cool={tg.glowCool} />
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 20px 0 34px", position: "relative", zIndex: 2 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 36px 0 0", flexShrink: 0 }}>
          <Counter count={count} />
        </div>
      </div>
    );
  }

  // ── WAVE-SPLIT · divisor de onda curva: plum (contenido) | tono (número) ──
  if (layout === "wave-split") {
    const gid = `wave-${tone}`;
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell("linear-gradient(160deg, #2A1670 0%, #1D0F52 100%)"), display: "flex", alignItems: "stretch" }}>
        {/* mitad derecha con onda curva y gradiente del tono */}
        <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 766 192" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor={tg.stopA} />
              <stop offset="1" stopColor={tg.stopB} />
            </linearGradient>
          </defs>
          <path d="M 496 0 C 436 58, 546 128, 470 192 L 766 192 L 766 0 Z" fill={`url(#${gid})`} />
          {/* filo claro de la onda */}
          <path d="M 496 0 C 436 58, 546 128, 470 192" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" />
        </svg>
        {/* luces sutiles en el lado plum */}
        <div aria-hidden="true" style={{ position: "absolute", left: -60, top: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(174,142,255,0.20) 0%, rgba(174,142,255,0) 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: "absolute", left: 350, bottom: 24, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", pointerEvents: "none", zIndex: 0 }} />
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 20px 0 36px", position: "relative", zIndex: 2, maxWidth: 470 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, width: 240, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.9)", textTransform: "uppercase", textShadow: "rgba(20,0,70,0.3) 0 1px 3px" }}>Ofertas</span>
          <span style={{ fontSize: 100, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 0 14px rgba(255,255,255,0.4)) drop-shadow(0 4px 10px rgba(20,0,70,0.35))" }}>{count}</span>
        </div>
      </div>
    );
  }

  // ── ORBIT · número al centro de anillos concéntricos (órbitas con dots) ──
  if (layout === "orbit") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(tg.megaBg), display: "flex", alignItems: "stretch" }}>
        {/* órbitas centradas en el número (derecha) */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          {[124, 188, 252].map((d, i) => (
            <div key={d} style={{ position: "absolute", right: 118 - d / 2, top: "50%", transform: "translateY(-50%)", width: d, height: d, borderRadius: "50%", border: `1.5px solid rgba(255,255,255,${0.22 - i * 0.06})` }} />
          ))}
          {/* dots orbitando */}
          <div style={{ position: "absolute", right: 118 - 94 + 8, top: 96 - 60, width: 9, height: 9, borderRadius: "50%", background: tg.stopA, boxShadow: `0 0 10px rgba(${tg.glassTint},0.8)` }} />
          <div style={{ position: "absolute", right: 118 + 74, top: 96 + 44, width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF", opacity: 0.8 }} />
          <div style={{ position: "absolute", right: 118 - 126 + 4, top: 96 + 18, width: 5, height: 5, borderRadius: "50%", background: "#AE8EFF" }} />
          {/* glow central */}
          <div style={{ position: "absolute", right: 118 - 130, top: "50%", transform: "translateY(-50%)", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${tg.glassTint},0.30) 0%, rgba(${tg.glassTint},0) 70%)` }} />
        </div>
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 20px 0 36px", position: "relative", zIndex: 2, maxWidth: 460 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, width: 236, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>Ofertas</span>
          <span style={{ fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: `drop-shadow(0 0 16px rgba(${tg.glassTint},0.7))` }}>{count}</span>
        </div>
      </div>
    );
  }

  // ── ECHO · número con eco tipográfico (outline detrás + sólido delante) ──
  if (layout === "echo") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(tone === "live" ? BACKGROUNDS.orange : tg.gemBg), display: "flex", alignItems: "stretch" }}>
        {/* eco: número gigante en contorno detrás, desplazado */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-46%)",
            fontSize: 170,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: "transparent",
            WebkitTextStroke: "2px rgba(255,255,255,0.4)",
            fontVariantNumeric: "tabular-nums",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {count}
        </span>
        <div aria-hidden="true" style={{ position: "absolute", right: 260, bottom: 28, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.35)", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: "absolute", left: -50, bottom: -70, width: 220, height: 220, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)", pointerEvents: "none", zIndex: 0 }} />
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 20px 0 36px", position: "relative", zIndex: 2, maxWidth: 450 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        {/* número sólido delante, desplazado del eco */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 110px 0 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, transform: "translateY(8%)" }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: "#FFFFFF", textShadow: "rgba(20,0,70,0.3) 0 1px 3px" }}>Ofertas</span>
            <span style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: C.cream, fontVariantNumeric: "tabular-nums", textShadow: "rgba(20,0,70,0.35) 0 3px 0, rgba(20,0,70,0.2) 0 8px 20px" }}>{count}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── MEGA · número BLANCO gigante + bandas diagonales glass ──
  if (layout === "mega") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(tg.megaBg), display: "flex", alignItems: "stretch" }}>
        {/* bandas diagonales finas (textura glass) */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 86px)", pointerEvents: "none", zIndex: 0 }} />
        {/* glow del tono detrás del número */}
        <div aria-hidden="true" style={{ position: "absolute", right: -60, top: "50%", transform: "translateY(-50%)", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${tg.glassTint},0.40) 0%, rgba(${tg.glassTint},0) 70%)`, pointerEvents: "none", zIndex: 0 }} />
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 12px 0 36px", position: "relative", zIndex: 2 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 14, padding: "0 40px 0 0", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.08em", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Ofertas</span>
          <span style={{ fontSize: 148, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.05em", color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: `drop-shadow(0 0 18px rgba(${tg.glassTint},0.65)) drop-shadow(0 0 40px rgba(${tg.glassTint},0.35))` }}>{count}</span>
        </div>
      </div>
    );
  }

  // ── GLASS-TINT · contador en tarjeta glass TEÑIDA del tono + formas ──
  if (layout === "glass-tint") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell("linear-gradient(160deg, #2A1670 0%, #1D0F52 100%)"), display: "flex", alignItems: "stretch" }}>
        {/* formas: cuarto de círculo del tono + arcos + dots + glow lila */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 190, height: 190, borderRadius: "0 0 100% 0", background: `radial-gradient(circle at 0% 0%, rgba(${tg.glassTint},0.35) 0%, rgba(${tg.glassTint},0) 74%)` }} />
          <div style={{ position: "absolute", right: -110, bottom: -150, width: 330, height: 330, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.14)" }} />
          <div style={{ position: "absolute", right: -70, bottom: -110, width: 250, height: 250, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.10)" }} />
          <div style={{ position: "absolute", left: 320, top: 30, width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.32)" }} />
          <div style={{ position: "absolute", left: 396, bottom: 36, width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.24)" }} />
          <div style={{ position: "absolute", left: "44%", top: -140, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(174,142,255,0.20) 0%, rgba(174,142,255,0) 70%)" }} />
        </div>
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 20px 0 36px", position: "relative", zIndex: 2 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        {/* tarjeta glass teñida del tono con el contador */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 36px 0 0", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "16px 34px",
              borderRadius: 18,
              background: `linear-gradient(180deg, rgba(${tg.glassTint},0.38) 0%, rgba(${tg.glassTint},0.16) 100%)`,
              border: "1px solid rgba(255,255,255,0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: `rgba(255,255,255,0.25) 0 1px 0 0 inset, rgba(${tg.glassTint},0.35) 0 8px 28px -4px`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.9)", textTransform: "uppercase" }}>Ofertas</span>
            <span style={{ fontSize: 62, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 0 12px rgba(255,255,255,0.35))" }}>{count}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── A · foto izquierda · copy centro · contador derecha ──
  if (layout === "photo-left") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(BACKGROUNDS.orange), display: "flex", alignItems: "stretch" }}>
        <Decor warm="255,226,194" />
        <PhotoSlot width={186} side="left" fadeColor={C.orange} />
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 8px 0 22px", position: "relative", zIndex: 2 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 34px 0 0", flexShrink: 0 }}>
          <Counter count={count} />
        </div>
      </div>
    );
  }

  // ── B · morado→naranja · texto centro · contador derecha ──
  if (layout === "plum-counter") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(BACKGROUNDS["plum-orange"]), display: "flex", alignItems: "stretch" }}>
        <Decor warm="255,226,194" cool="174,142,255" cross />
        <Sheen />
        {DecoCircle({ left: 28, top: 22, width: 26, height: 26, border: "2px solid rgba(255,255,255,0.16)", zIndex: 1 })}
        {DecoCircle({ left: "42%", bottom: 18, width: 8, height: 8, background: "rgba(255,255,255,0.16)", zIndex: 1 })}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 20px 0 30px", position: "relative", zIndex: 2 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          {timer && <TimerChip timer={timer} />}
          {chip && <Chip chip={chip} />}
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 36px 0 0", flexShrink: 0 }}>
          <Counter count={count} />
        </div>
      </div>
    );
  }

  // ── C · copy + contador izquierda · foto derecha diagonal ──
  if (layout === "photo-right") {
    return (
      <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(BACKGROUNDS.diagonal), display: "flex", alignItems: "stretch" }}>
        <Decor warm="255,226,194" cool="174,142,255" cross />
        <Sheen />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, padding: "0 12px 0 30px", position: "relative", zIndex: 2 }}>
          <Pill text={pillText} icon={pillIcon} />
          <Headline pre={titlePre} accent={titleAccent} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 2 }}>
            <Counter count={count} size={72} />
            {timer && <div style={{ paddingBottom: 8 }}><TimerChip timer={timer} /></div>}
          </div>
          {chip && <Chip chip={chip} />}
        </div>
        <PhotoSlot width={238} side="right" fadeColor={C.orangeDeep} />
      </div>
    );
  }

  // ── D · naranja bold · copy izquierda · contador derecha (coins de fondo) ──
  return (
    <div data-slot="promo-banner" className={`${className}`.trim()} style={{ ...shell(BACKGROUNDS["orange-bold"]), display: "flex", alignItems: "stretch" }}>
      <Decor warm="255,226,194" cross />
      <Sheen />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9, padding: "0 8px 0 34px", position: "relative", zIndex: 2 }}>
        <Pill text={pillText} icon={pillIcon} />
        <Headline pre={titlePre} accent={titleAccent} />
        {timer && <TimerChip timer={timer} />}
        {chip && <Chip chip={chip} />}
      </div>
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", padding: "0 36px 0 0", flexShrink: 0 }}>
        <Counter count={count} />
      </div>
    </div>
  );
}
