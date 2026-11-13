"use client";

/**
 * WalletBalanceCard — Generado por Concorde
 * Fuente: Figma VOYAGER · "WalletBalanceCard" (nodo 2020:13635)
 *
 * Tarjeta «Billetera» 375×221 (blanca, radius 16, drop shadow suave):
 *   · Header: CardTitle «BILLETERA» (brackets) + ProfileButton «Transacciones ›»
 *   · Divisor #E1E3E2
 *   · Filas SubasCoins / Saldo (label morado + valor morado bold)
 *   · CTA «Adquiere SubasCoins» (Button sm-guest, círculo + texto, centrado)
 */

import type { JSX, MouseEventHandler } from "react";
import CardTitle from "./CardTitle";
import ProfileButton from "./ProfileButton";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WalletBalanceCardProps {
  /** Título de la tarjeta (default "BILLETERA"). */
  title?: string;
  /** Valor de SubasCoins (default ">S< 0"). */
  subasCoins?: string;
  /** Valor de Saldo (default "US$ 0"). */
  saldo?: string;
  /** Acción / enlace del acceso «Transacciones». */
  onTransactions?: MouseEventHandler<HTMLElement>;
  transactionsHref?: string;
  /** Click del CTA «Adquiere SubasCoins». */
  onAcquire?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-walletbalancecard-styles";

const STYLES = `
.wbc {
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
.wbc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.wbc__divider {
  height: 1px;
  background: #E1E3E2;
  margin-top: 8px;
}
.wbc__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 18px;
}
.wbc__rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
}
.wbc__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.wbc__row-label { font-size: 15px; font-weight: 500; color: #3B1782; }
.wbc__row-value { font-size: 15px; font-weight: 700; color: #3B1782; }
.wbc__cta {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-bottom: 4px;
}
/* Botón CTA autónomo — mismo look que sm-guest, texto realmente centrado */
.wbc__acquire {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 250px;
  height: 40px;
  padding: 0 16px;
  border-radius: 9999px;
  border: 2px solid transparent;
  cursor: pointer;
  overflow: hidden;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: rgba(0,0,0,0.2) 0 1px 2px;
  background-image:
    linear-gradient(135deg, #ED8936 0%, #ED8936 40%, #8460e5 100%),
    linear-gradient(135deg, #ffffff 0%, #fbc47d 25%, #ae8eff 75%, #ffffff 100%);
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  box-shadow: rgba(255,255,255,0.25) 0 1px 0 2px inset, rgba(237,137,54,0.25) 0 2px 6px;
  transition: transform 0.2s cubic-bezier(0.25,0.8,0.25,1), box-shadow 0.25s;
}
.wbc__acquire::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(rgba(255,255,255,0.15) 0%, transparent 55%);
  pointer-events: none;
}
.wbc__acquire-circle {
  position: absolute;
  left: 4px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
}
.wbc__acquire:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: rgba(255,255,255,0.2) 0 1px 0 2px inset, rgba(132,96,229,0.3) 0 6px 18px, rgba(237,137,54,0.35) 0 3px 8px;
}
.wbc__acquire:active {
  transform: scale(0.97) translateY(1px);
  box-shadow: rgba(0,0,0,0.22) 0 2px 4px 2px inset;
}
@media (prefers-reduced-motion: reduce) { .wbc__acquire { transition: none; } }
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

export default function WalletBalanceCard({
  title = "BILLETERA",
  subasCoins = ">S< 0",
  saldo = "US$ 0",
  onTransactions,
  transactionsHref,
  onAcquire,
  className = "",
}: WalletBalanceCardProps): JSX.Element {
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
      <section className={["wbc", className].filter(Boolean).join(" ")} data-component="wallet-balance-card">
        {/* Header: título + acceso a transacciones */}
        <div className="wbc__header">
          <CardTitle title={title} subtitle="" titleSize={14} />
          <ProfileButton href={transactionsHref} onClick={onTransactions} aria-label="Transacciones">
            Transacciones
          </ProfileButton>
        </div>

        <div className="wbc__divider" />

        {/* Cuerpo: SubasCoins / Saldo + CTA */}
        <div className="wbc__body">
          <div className="wbc__rows">
            <div className="wbc__row">
              <span className="wbc__row-label">SubasCoins:</span>
              <span className="wbc__row-value">{subasCoins}</span>
            </div>
            <div className="wbc__row">
              <span className="wbc__row-label">Saldo:</span>
              <span className="wbc__row-value">{saldo}</span>
            </div>
          </div>

          <div className="wbc__cta">
            <button className="wbc__acquire" type="button" onClick={onAcquire}>
              <span className="wbc__acquire-circle" aria-hidden="true" />
              Adquiere SubasCoins
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
