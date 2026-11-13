"use client";

/**
 * UserProfileCard — Generado por Concorde
 * Fuente: Figma VOYAGER · "UserProfileCard" (nodo 2035:16581)
 *
 * Tarjeta de zona de usuario 766×140 (blanca, radius 16, drop shadow suave).
 * Dos filas internas de 734 de ancho separadas por un divisor #E1E3E2:
 *   1ª (52px): avatar (AvatarZone) + «¡Hola, {usuario}!»  ·······  «Tu perfil ›» (ProfileButton)
 *   2ª (40px): RIESGO DEL PERFIL / valor  +  PUNTOS VMC / ⭐ pts ⓘ  ···  «Historial ›» (ProfileButton)
 *
 * Figma manda en lo visual; Concorde compone los componentes existentes
 * (AvatarZone, ProfileButton, StarIcon) y aporta el layout + accesibilidad.
 */

import type { JSX, MouseEventHandler } from "react";
import AvatarZone from "@/src/product/ganaya/concorde/components/AvatarZone";
import ProfileButton from "@/src/product/ganaya/concorde/components/ProfileButton";
import StarIcon from "@/src/product/ganaya/concorde/components/StarIcon";
import InfoIcon from "@/src/product/ganaya/concorde/components/InfoIcon";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfileCardProps {
  /** Usuario mostrado en «¡Hola, {usuario}!» (default "ZAEX5G"). */
  username?: string;
  /** Etiqueta de la 1ª estadística (default "RIESGO DEL PERFIL"). */
  riskLabel?: string;
  /** Valor de riesgo (default "Muy bajo"). */
  riskValue?: string;
  /** Etiqueta de la 2ª estadística (default "PUNTOS VMC"). */
  pointsLabel?: string;
  /** Puntos VMC (default "500 pts"). */
  points?: string;
  /** Acción / enlace del acceso «Tu perfil». */
  onProfile?: MouseEventHandler<HTMLElement>;
  profileHref?: string;
  /** Acción / enlace del acceso «Historial». */
  onHistory?: MouseEventHandler<HTMLElement>;
  historyHref?: string;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-userprofilecard-styles";

const STYLES = `
.upc {
  box-sizing: border-box;
  width: 766px;
  height: 140px;
  padding: 16px;
  border-radius: 16px;
  background: #ffffff;
  /* Drop shadow del filtro Figma (dilate 4 · blur 8 · negro 10%) */
  box-shadow: 0 0 8px 4px rgba(0,0,0,0.08);
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
.upc__inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
/* ── Fila 1 (734×52) ── */
.upc__row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
}
.upc__greet {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.upc__hello {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 24px;
  white-space: nowrap;
  /* Texto con gradiente vault del Figma (paint1: #5F3ED8 → #340091 → #140046) */
  background: linear-gradient(168deg, #5F3ED8 0%, #340091 50%, #140046 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
/* ── Divisor ── */
.upc__divider {
  height: 1px;
  background: #E1E3E2;
}
/* ── Fila 2 (734×40) ── */
.upc__row2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}
.upc__stats {
  display: flex;
  align-items: center;
  gap: 56px;
}
.upc__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.upc__stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #99A1AF;
  white-space: nowrap;
}
.upc__stat-value {
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  white-space: nowrap;
}
.upc__stat-value--risk { color: #ED8936; }
.upc__points {
  display: flex;
  align-items: center;
  gap: 6px;
}
.upc__points-text { color: #3B1782; }
.upc__info { display: block; flex-shrink: 0; }
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserProfileCard({
  username = "ZAEX5G",
  riskLabel = "RIESGO DEL PERFIL",
  riskValue = "Muy bajo",
  pointsLabel = "PUNTOS VMC",
  points = "500 pts",
  onProfile,
  profileHref,
  onHistory,
  historyHref,
  className = "",
}: UserProfileCardProps): JSX.Element {
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: STYLES }} />
      <section className={["upc", className].filter(Boolean).join(" ")} data-component="user-profile-card">
        <div className="upc__inner">
          {/* Fila 1 — saludo + acceso al perfil */}
          <div className="upc__row1">
            <div className="upc__greet">
              <AvatarZone size="md" title={`Avatar de ${username}`} />
              <span className="upc__hello">{`¡Hola, ${username}!`}</span>
            </div>
            <ProfileButton href={profileHref} onClick={onProfile} aria-label="Tu perfil">
              Tu perfil
            </ProfileButton>
          </div>

          {/* Divisor */}
          <div className="upc__divider" role="separator" aria-hidden="true" />

          {/* Fila 2 — estadísticas + historial */}
          <div className="upc__row2">
            <div className="upc__stats">
              <div className="upc__stat">
                <span className="upc__stat-label">{riskLabel}</span>
                <span className="upc__stat-value upc__stat-value--risk">{riskValue}</span>
              </div>
              <div className="upc__stat">
                <span className="upc__stat-label">{pointsLabel}</span>
                <span className="upc__points">
                  {/* StarIcon usa viewBox 28 con padding de sombra: el badge ocupa
                      16/28 → size 24 lo deja en ~16px, igual que el InfoIcon (16). */}
                  <StarIcon size={24} />
                  <span className="upc__stat-value upc__points-text">{points}</span>
                  <InfoIcon className="upc__info" title="Más información sobre los puntos VMC" />
                </span>
              </div>
            </div>
            <ProfileButton href={historyHref} onClick={onHistory} aria-label="Historial">
              Historial
            </ProfileButton>
          </div>
        </div>
      </section>
    </>
  );
}
