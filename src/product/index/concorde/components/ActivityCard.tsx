"use client";

/**
 * ActivityCard — Generado por Concorde
 * Fuente: Figma VOYAGER · "Activity Card" (nodo 2020:13636)
 *
 * Tarjeta «Tu actividad» 375×221 (blanca, radius 16, drop shadow suave):
 *   · Header: CardTitle «TU ACTIVIDAD» (brackets)
 *   · Divisor #E1E3E2
 *   · Grid 2×2 de pills de conteo (badge translúcido + label):
 *       Ganadas (gradiente naranja→lila) · Consignaciones · Procesos de compra ·
 *       Rechazadas (gradiente lila). Cada pill 142×40, borde gradiente.
 */

import type { JSX, ReactNode } from "react";
import CardTitle from "@/src/product/index/concorde/components/CardTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityCardProps {
  /** Título de la tarjeta (default "TU ACTIVIDAD"). */
  title?: string;
  /** Conteo «Ganadas» (default 1). */
  won?: number | string;
  /** Conteo «Consignaciones» (default 1). */
  consignments?: number | string;
  /** Conteo «Procesos de compra» (default 1). */
  purchases?: number | string;
  /** Conteo «Rechazadas» (default 1). */
  rejected?: number | string;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-activitycard-styles";

const STYLES = `
.actcard {
  box-sizing: border-box;
  width: 375px;
  height: 221px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 0 8px 4px rgba(0,0,0,0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}
.actcard__header { display: flex; align-items: center; }
.actcard__divider { height: 1px; background: #E1E3E2; margin-top: 8px; }
.actcard__grid {
  flex: 1;
  width: 318px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 34px;
  row-gap: 28px;
  align-content: center;
}
/* ── Pill de actividad — badge absoluto izquierda + label centrado ── */
.actpill {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px 0 40px;
  border-radius: 9999px;
  border: 2px solid transparent;
  position: relative;
  color: #ffffff;
}
.actpill--orange {
  /* Fill VYGradientOrange (#ED8936 → #8460E5) + borde white→#FBC47D→#AE8EFF→white */
  background:
    linear-gradient(131deg, #ED8936 0%, #ED8936 40%, #8460E5 100%) padding-box,
    linear-gradient(135deg, #FFFFFF 0%, #FBC47D 25%, #AE8EFF 75%, #FFFFFF 100%) border-box;
  box-shadow: 0 4px 10px rgba(237,137,54,0.30), inset 0 1px 0 rgba(255,255,255,0.25);
}
.actpill--purple {
  /* Fill vault (#8460E5 → #3B1782) + borde #CFBAFF→white→#AE8EFF→#CFBAFF */
  background:
    linear-gradient(159deg, #8460E5 0%, #3B1782 100%) padding-box,
    linear-gradient(135deg, #CFBAFF 0%, #FFFFFF 35%, #AE8EFF 65%, #CFBAFF 100%) border-box;
  box-shadow: 0 4px 10px rgba(59,23,130,0.32), inset 0 1px 0 rgba(255,255,255,0.22);
}
/* Badge absoluto — no ocupa espacio flex, siempre pegado a la izquierda */
.actpill__badge {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}
/* Label centrado respecto al ancho total del pill */
.actpill__label {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-align: center;
}
`;

let _stylesInjected = false;

// ─── Pill ───────────────────────────────────────────────────────────────────

function ActivityPill({ tone, count, label }: { tone: "orange" | "purple"; count: ReactNode; label: string }): JSX.Element {
  return (
    <div className={`actpill actpill--${tone}`}>
      <span className="actpill__badge">{count}</span>
      <span className="actpill__label">{label}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityCard({
  title = "TU ACTIVIDAD",
  won = 1,
  consignments = 1,
  purchases = 1,
  rejected = 1,
  className = "",
}: ActivityCardProps): JSX.Element {
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
      <section className={["actcard", className].filter(Boolean).join(" ")} data-component="activity-card">
        <div className="actcard__header">
          <CardTitle title={title} subtitle="" titleSize={14} />
        </div>

        <div className="actcard__divider" />

        <div className="actcard__grid">
          <ActivityPill tone="orange" count={won} label="Ganadas" />
          <ActivityPill tone="purple" count={consignments} label="Consignaciones" />
          <ActivityPill tone="purple" count={purchases} label="Procesos de compra" />
          <ActivityPill tone="purple" count={rejected} label="Rechazadas" />
        </div>
      </section>
    </>
  );
}
