/**
 * EmpresaBannerAlt — 766×192 · variantes MODERNAS del banner de empresa,
 * sin ilustraciones. Usan el design system actual de los componentes:
 *   · rating con StarIcon (la estrella real del DS)
 *   · logo circular con gradiente morado de marca (header de DetailCard)
 *   · cajas de stats con borde gradiente lila estilo CategoryCard
 *   · icono BusinessIcon del sidebar como marca de sección
 * Estático, sin efectos.
 */

import type { CSSProperties, JSX } from "react";
import StarIcon from "@/src/product/ganaya/concorde/components/StarIcon";
import BusinessIcon from "@/src/product/ganaya/concorde/components/BusinessIcon";
import { BANNER_WIDTH, BANNER_HEIGHT } from "./dimensions";

export { BANNER_WIDTH, BANNER_HEIGHT } from "./dimensions";

export type EmpresaAltLayout = "logo-left" | "stats-bottom" | "panel" | "photo" | "glass" | "dark-hero" | "split" | "rating-hero";

export interface EmpresaBannerAltProps {
  nombre: string;
  logoText?: string;
  rating: string;
  ratingLabel: string;
  opiniones: string;
  descripcion: string;
  ventas: string;
  participantes: string;
  layout: EmpresaAltLayout;
  className?: string;
}

/** Borde gradiente lila estilo CategoryCard (fondo claro) */
const GRADIENT_BORDER: CSSProperties = {
  border: "1px solid transparent",
  backgroundImage:
    "linear-gradient(160deg, #ffffff 0%, #f4f5f9 100%), linear-gradient(135deg, #9c96f8 0%, rgba(255,255,255,0.65) 38%, #7364de 70%, #9c96f8 100%)",
  backgroundOrigin: "padding-box, border-box",
  backgroundClip: "padding-box, border-box",
};

function LogoCircle({ text, size = 96 }: { text: string; size?: number }): JSX.Element {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(157deg, #5F3ED8 0%, #340091 50%, #140046 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1.15,
        padding: 12,
        boxSizing: "border-box",
        flexShrink: 0,
        boxShadow: "rgba(255,255,255,0.22) 0 1px 0 0 inset, rgba(32,0,104,0.22) 0 6px 16px",
      }}
    >
      {text}
    </div>
  );
}

/** Logo circular blanco (para fondos oscuros) */
function LogoCircleDark({ text, size = 88 }: { text: string; size?: number }): JSX.Element {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#3B1782",
        fontSize: 13,
        fontWeight: 800,
        lineHeight: 1.15,
        padding: 10,
        boxSizing: "border-box",
        flexShrink: 0,
        boxShadow: "rgba(0,0,0,0.35) 0 6px 18px",
      }}
    >
      {text}
    </div>
  );
}

function Rating({ rating, ratingLabel, opiniones }: { rating: string; ratingLabel: string; opiniones: string }): JSX.Element {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: "#241A3F" }}>{rating}</span>
      <StarIcon size={18} />
      <span style={{ fontSize: 14, fontWeight: 700, color: "#241A3F" }}>{ratingLabel}</span>
      <span style={{ color: "#B9B0CC", fontWeight: 700 }}>·</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#6B6180" }}>{opiniones}</span>
    </div>
  );
}

/** Stat con los ESTILOS del StatPill del bloque Sala (dark glass + VYStrokes) */
function GlassStat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: 168,
        borderRadius: 16,
        border: "1.5px solid transparent",
        backgroundImage:
          "linear-gradient(127deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 45%, rgba(255,255,255,0.03) 100%), linear-gradient(160deg, rgba(28,13,82,0.93) 0%, rgba(14,3,56,0.95) 100%), linear-gradient(125deg, rgba(255,255,255,0.9) 0%, rgba(244,172,89,0.7) 22%, rgba(132,96,229,0.7) 74.5%, rgba(255,255,255,0.9) 100%)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, padding-box, border-box",
        boxShadow: "rgba(10,0,46,0.6) 0px 12px 36px -4px, inset 0 1px 0 rgba(255,255,255,0.22)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "9px 14px",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", lineHeight: 1, color: "#ffffff", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 148 }}>
      <span
        style={{
          position: "relative",
          zIndex: 1,
          background: "linear-gradient(157deg, #5F3ED8 0%, #340091 100%)",
          color: "#FFFFFF",
          borderRadius: 9999,
          padding: "7px 24px",
          fontSize: 12.5,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "rgba(255,255,255,0.25) 0 1px 0 0 inset, rgba(32,0,104,0.20) 0 2px 8px",
        }}
      >
        {label}
      </span>
      <div
        style={{
          ...GRADIENT_BORDER,
          marginTop: -13,
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 12,
          padding: "18px 10px 10px",
          textAlign: "center",
          fontSize: 18,
          fontWeight: 800,
          color: "#3B1782",
          boxShadow: "rgba(32,0,104,0.10) 0 3px 10px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const shell: CSSProperties = {
  position: "relative",
  width: BANNER_WIDTH,
  height: BANNER_HEIGHT,
  background: "linear-gradient(160deg, #ffffff 0%, #f4f5f9 100%)",
  overflow: "hidden",
  fontFamily: 'var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif)',
  flexShrink: 0,
  boxSizing: "border-box",
};

export default function EmpresaBannerAlt({
  nombre,
  logoText,
  rating,
  ratingLabel,
  opiniones,
  descripcion,
  ventas,
  participantes,
  layout,
  className = "",
}: EmpresaBannerAltProps): JSX.Element {
  const logo = logoText ?? nombre;

  // ── "split" — mitad clara (datos) | mitad morada diagonal (stats con glow) ──
  if (layout === "split") {
    return (
      <div data-slot="empresa-banner-alt" className={className} style={{ ...shell, background: "linear-gradient(160deg, #ffffff 0%, #f4f5f9 100%)" }}>
        {/* mitad derecha morada con corte diagonal */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 340,
            clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(140deg, #3D2299 0%, #2A1670 60%, #1D0F52 100%)",
          }}
        />
        {/* luces del lado morado */}
        <div aria-hidden="true" style={{ position: "absolute", right: -60, top: -80, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(232,115,42,0.30) 0%, rgba(232,115,42,0) 70%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", right: 40, bottom: 22, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
        {/* datos en la mitad clara */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 430, display: "flex", alignItems: "center", gap: 18, padding: "0 0 0 30px" }}>
          <LogoCircle text={logo} size={88} />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#241A3F", letterSpacing: "-0.01em" }}>{nombre}</h3>
            <div style={{ marginTop: 5 }}><Rating rating={rating} ratingLabel={ratingLabel} opiniones={opiniones} /></div>
            <p style={{ margin: "7px 0 0", fontSize: 11.5, fontWeight: 500, lineHeight: 1.45, color: "#6B6180", maxWidth: 280 }}>{descripcion}</p>
          </div>
        </div>
        {/* stats en la mitad morada */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 268, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#F49B57", textTransform: "uppercase", width: 108, textAlign: "right" }}>Ventas</span>
            <span style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 0 10px rgba(232,115,42,0.5))" }}>{ventas}</span>
          </div>
          <span aria-hidden="true" style={{ width: 150, height: 1, background: "rgba(255,255,255,0.25)" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#AE8EFF", textTransform: "uppercase", width: 108, textAlign: "right" }}>Particip.</span>
            <span style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 0 10px rgba(132,96,229,0.55))" }}>{participantes}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── "rating-hero" — el rating como protagonista con glow dorado ──
  if (layout === "rating-hero") {
    return (
      <div
        data-slot="empresa-banner-alt"
        className={className}
        style={{ ...shell, background: "linear-gradient(100deg, #2A1670 0%, #3D2299 40%, #C85A1E 100%)", display: "flex", alignItems: "center", gap: 20, padding: "0 36px" }}
      >
        {/* luces */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", right: -60, top: "50%", transform: "translateY(-50%)", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,215,120,0.28) 0%, rgba(255,215,120,0) 70%)" }} />
          <div style={{ position: "absolute", left: -70, bottom: -90, width: 240, height: 240, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", left: 330, top: 28, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
        </div>
        <LogoCircleDark text={logo} size={88} />
        <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>{nombre}</h3>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 500, lineHeight: 1.45, color: "#d8d2ec", maxWidth: 300 }}>{descripcion}</p>
          <div style={{ display: "flex", gap: 16, marginTop: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FFFFFF" }}>Ventas <b style={{ fontSize: 15 }}>{ventas}</b></span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FFFFFF" }}>Participantes <b style={{ fontSize: 15 }}>{participantes}</b></span>
          </div>
        </div>
        {/* rating protagonista */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, paddingRight: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 74, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 0 16px rgba(255,196,90,0.65))" }}>{rating}</span>
            <StarIcon size={44} />
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 999,
              background: "linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 100%)",
              border: "1px solid rgba(255,255,255,0.5)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              fontSize: 12,
              fontWeight: 700,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {ratingLabel} · {opiniones}
          </span>
        </div>
      </div>
    );
  }

  // ── "glass" — panel glass centrado sobre gradiente morado→naranja ──
  if (layout === "glass") {
    return (
      <div
        data-slot="empresa-banner-alt"
        className={className}
        style={{ ...shell, background: "linear-gradient(100deg, #2A1670 0%, #3D2299 32%, #C85A1E 78%, #E8732A 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* luces de fondo */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", right: -50, top: "50%", transform: "translateY(-50%)", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,226,194,0.28) 0%, rgba(255,226,194,0) 70%)" }} />
          <div style={{ position: "absolute", left: -60, bottom: -80, width: 240, height: 240, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", left: 200, top: 26, width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.32)" }} />
        </div>
        {/* panel glass con todo el contenido */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "16px 30px",
            borderRadius: 18,
            background: "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "rgba(255,255,255,0.25) 0 1px 0 0 inset, rgba(20,0,70,0.25) 0 10px 26px -6px",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#3B1782",
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.15,
              padding: 10,
              boxSizing: "border-box",
              flexShrink: 0,
              boxShadow: "rgba(20,0,70,0.3) 0 5px 14px",
            }}
          >
            {logo}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0, maxWidth: 300 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>{nombre}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>{rating}</span>
              <StarIcon size={16} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{ratingLabel}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>·</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#FFE2C2" }}>{opiniones}</span>
            </div>
          </div>
          <span aria-hidden="true" style={{ width: 1.5, alignSelf: "stretch", background: "rgba(255,255,255,0.35)", borderRadius: 2 }} />
          <div style={{ display: "flex", gap: 26, flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>Ventas</span>
              <span style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", filter: "drop-shadow(0 0 10px rgba(255,226,194,0.5))" }}>{ventas}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>Participantes</span>
              <span style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", filter: "drop-shadow(0 0 10px rgba(255,226,194,0.5))" }}>{participantes}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── "dark-hero" — plum profundo, stats XXL blancas con glow, formas de fondo ──
  if (layout === "dark-hero") {
    return (
      <div
        data-slot="empresa-banner-alt"
        className={className}
        style={{ ...shell, background: "linear-gradient(160deg, #2A1670 0%, #1D0F52 100%)", display: "flex", alignItems: "center", gap: 22, padding: "0 36px" }}
      >
        {/* formas: cuarto de círculo naranja + arcos + dots */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 180, height: 180, borderRadius: "0 0 100% 0", background: "radial-gradient(circle at 0% 0%, rgba(232,115,42,0.32) 0%, rgba(232,115,42,0) 74%)" }} />
          <div style={{ position: "absolute", right: -100, top: -120, width: 300, height: 300, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", right: -60, top: -80, width: 220, height: 220, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.09)" }} />
          <div style={{ position: "absolute", right: 320, bottom: 30, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
          <div style={{ position: "absolute", right: -40, bottom: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(174,142,255,0.22) 0%, rgba(174,142,255,0) 70%)" }} />
        </div>
        <div
          style={{
            position: "relative",
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#3B1782",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.15,
            padding: 10,
            boxSizing: "border-box",
            flexShrink: 0,
            boxShadow: "rgba(0,0,0,0.35) 0 6px 18px",
          }}
        >
          {logo}
        </div>
        <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>{nombre}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>{rating}</span>
            <StarIcon size={16} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{ratingLabel}</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>·</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#d8d2ec" }}>{opiniones}</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, fontWeight: 500, lineHeight: 1.45, color: "#d8d2ec", maxWidth: 320 }}>{descripcion}</p>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 34, flexShrink: 0, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#F49B57", textTransform: "uppercase" }}>Ventas</span>
            <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 0 14px rgba(232,115,42,0.55))" }}>{ventas}</span>
          </div>
          <span aria-hidden="true" style={{ width: 1.5, height: 64, background: "rgba(255,255,255,0.28)", borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#AE8EFF", textTransform: "uppercase" }}>Participantes</span>
            <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 0 14px rgba(132,96,229,0.6))" }}>{participantes}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── "photo" — placeholder de imagen + gradiente de opacidad morado ──
  if (layout === "photo") {
    return (
      <div data-slot="empresa-banner-alt" className={className} style={{ ...shell, background: "#E9EAEC" }}>
        {/* Placeholder de imagen (visible por la derecha) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 96,
            gap: 12,
            color: "#9AA1AC",
            background: "repeating-linear-gradient(45deg, #E9EAEC 0px, #E9EAEC 22px, #E2E4E7 22px, #E2E4E7 44px)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9AA1AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em" }}>IMAGEN</span>
        </div>
        {/* Gradiente de opacidad morado (marca) de izquierda a transparente */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg, rgba(46,15,112,1) 0%, rgba(46,15,112,0.92) 36%, rgba(46,15,112,0.55) 54%, rgba(46,15,112,0) 76%)" }}
        />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 18, padding: "0 32px" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#3B1782",
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.15,
              padding: 10,
              boxSizing: "border-box",
              flexShrink: 0,
              boxShadow: "rgba(20,0,70,0.35) 0 6px 18px",
            }}
          >
            {logo}
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 330 }}>
            <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em", textShadow: "rgba(20,0,70,0.3) 0 1px 3px" }}>{nombre}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>{rating}</span>
              <StarIcon size={17} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF" }}>{ratingLabel}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#d8d2ec" }}>{opiniones}</span>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Ventas <b style={{ fontSize: 17 }}>{ventas}</b></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>Participantes <b style={{ fontSize: 17 }}>{participantes}</b></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── "panel" — fondo morado del header DetailCard + StatPill reales ──
  if (layout === "panel") {
    return (
      <div
        data-slot="empresa-banner-alt"
        className={className}
        style={{
          ...shell,
          background: "linear-gradient(157deg, #5F3ED8 0%, #340091 50%, #140046 100%)",
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 32px",
        }}
      >
        {/* glass superior */}
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 100%)", pointerEvents: "none" }} />
        {/* logo circular blanco */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#3B1782",
            fontSize: 14,
            fontWeight: 800,
            lineHeight: 1.15,
            padding: 12,
            boxSizing: "border-box",
            flexShrink: 0,
            boxShadow: "rgba(20,0,70,0.35) 0 6px 18px",
          }}
        >
          {logo}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>{nombre}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>{rating}</span>
            <StarIcon size={18} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>{ratingLabel}</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>·</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#d8d2ec" }}>{opiniones}</span>
          </div>
          <p style={{ margin: "9px 0 0", fontSize: 12, fontWeight: 500, lineHeight: 1.5, color: "#d8d2ec", maxWidth: 340 }}>{descripcion}</p>
        </div>
        {/* stats con los ESTILOS del StatPill (dark glass + borde VYStrokes) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <GlassStat label="Ventas" value={ventas} />
          <GlassStat label="Participantes" value={participantes} />
        </div>
      </div>
    );
  }

  if (layout === "stats-bottom") {
    return (
      <div data-slot="empresa-banner-alt" className={className} style={shell}>
        <span
          style={{
            position: "absolute",
            right: 32,
            top: 16,
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "#2E0F70",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "rgba(255,255,255,0.22) 0 1px 0 0 inset, rgba(32,0,104,0.20) 0 3px 10px",
          }}
        >
          <BusinessIcon size={24} state="default" />
        </span>
        {/* Cabecera: logo + nombre + rating + reseña */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 122, display: "flex", alignItems: "center", gap: 18, padding: "0 32px", boxSizing: "border-box" }}>
          <LogoCircle text={logo} size={84} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#241A3F", letterSpacing: "-0.01em" }}>{nombre}</h3>
            <div style={{ marginTop: 5 }}><Rating rating={rating} ratingLabel={ratingLabel} opiniones={opiniones} /></div>
            <p style={{ margin: "6px 0 0", fontSize: 11.5, fontWeight: 500, lineHeight: 1.45, color: "#6B6180" }}>{descripcion}</p>
          </div>
        </div>
        {/* Franja de stats inferior */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 70,
            background: "#F4F1FB",
            borderTop: "1px solid #E7E1F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 44,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6B6180", textTransform: "uppercase", letterSpacing: "0.04em" }}>Ventas</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#3B1782" }}>{ventas}</span>
          </div>
          <div style={{ width: 1, height: 36, background: "#D8CEF0" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6B6180", textTransform: "uppercase", letterSpacing: "0.04em" }}>Participantes</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#3B1782" }}>{participantes}</span>
          </div>
        </div>
      </div>
    );
  }

  // logo-left
  return (
    <div data-slot="empresa-banner-alt" className={className} style={{ ...shell, display: "flex", alignItems: "center", gap: 20, padding: "0 28px" }}>
      <LogoCircle text={logo} size={98} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#241A3F", letterSpacing: "-0.01em" }}>{nombre}</h3>
        <div style={{ marginTop: 6 }}><Rating rating={rating} ratingLabel={ratingLabel} opiniones={opiniones} /></div>
        <p style={{ margin: "8px 0 0", fontSize: 11.5, fontWeight: 500, lineHeight: 1.45, color: "#6B6180", maxWidth: 300 }}>{descripcion}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
        <StatCard label="Ventas" value={ventas} />
        <StatCard label="Participantes" value={participantes} />
      </div>
    </div>
  );
}
