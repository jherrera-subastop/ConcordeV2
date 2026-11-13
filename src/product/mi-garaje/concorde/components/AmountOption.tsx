"use client";

/**
 * AmountOption — Generado por Concorde
 * Fuente: Figma VOYAGER · "AmountOption" (3032:13035 default · 13029 selected · 13044 input)
 *
 * Opción de monto tipo radio (pill 254×48, radio 24) con un círculo a la
 * izquierda y el monto a la derecha. 3 variantes:
 *   · default  → blanco, borde gradiente sutil, radio gris, monto morado #3B1782
 *   · selected → relleno gradiente morado (#8460E5→#3B1782), borde gradiente,
 *                radio relleno blanco, monto blanco
 *   · input    → blanco, radio gris, campo editable con placeholder gris #D1D5DC
 * Sombra 0 0 16px 4px rgba(0,0,0,0.1). Controlado o no controlado.
 */

import { useId } from "react";
import type { JSX, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AmountOptionVariant = "default" | "selected" | "input";

export interface AmountOptionProps {
  /** Apariencia/estado (default "default") */
  variant?: AmountOptionVariant;
  /** Monto fijo (modo default/selected) — p.ej. ">S< 80" */
  amount?: ReactNode;
  /** Valor del campo (modo input, controlado) */
  value?: string;
  /** Valor inicial (modo input, no controlado) */
  defaultValue?: string;
  /** Prefijo fijo del campo (modo input) — siempre visible (default ">S<") */
  prefix?: string;
  /** Placeholder del número (modo input) — p.ej. "210" */
  placeholder?: string;
  onValueChange?: (value: string) => void;
  /** Click en la opción (modo default/selected) */
  onSelect?: () => void;
  /** Marca la opción input como seleccionada (morada) aunque no tenga foco */
  selected?: boolean;
  disabled?: boolean;
  /** name del radio (para agrupar) */
  name?: string;
  "aria-label"?: string;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-amountoption-styles";

const AMOUNTOPTION_STYLES = `
.pamount {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 254px;
  max-width: 100%;
  height: 48px;
  padding: 0 16px;
  border-radius: 24px;
  border: 1px solid transparent;
  background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(335deg, #8460E5 0%, #FFF8F1 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: rgba(0,0,0,0.1) 0px 0px 16px 4px;
  cursor: pointer;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
  text-align: left;
  transition: transform 0.15s, box-shadow 0.2s;
}
.pamount:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
.pamount:active { transform: scale(0.99); }
.pamount__radio {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #E1E3E2;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pamount__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  opacity: 0;
}
.pamount__amount {
  flex: 1;
  min-width: 0;
  text-align: right;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #3B1782;
}
.pamount__amountwrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.pamount__prefix {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #D1D5DC;
}
.pamount__num {
  width: auto;
  min-width: 1ch;
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #3B1782;
}
.pamount__num::placeholder { color: #D1D5DC; }

/* input · al hacer click (focus) o cuando está seleccionado (--active) se vuelve morado, mantiene >S< y deja escribir */
.pamount--input:focus-within,
.pamount--input.pamount--active {
  border-width: 1.5px;
  background-image:
    linear-gradient(165deg, #8460E5 0%, #3B1782 100%),
    linear-gradient(120deg, #ffffff 0%, #F4AC59 22%, #8460E5 75%, #ffffff 100%);
}
.pamount--input:focus-within .pamount__radio,
.pamount--input.pamount--active .pamount__radio { border-color: rgba(255,255,255,0.5); }
.pamount--input:focus-within .pamount__dot,
.pamount--input.pamount--active .pamount__dot { opacity: 1; }
.pamount--input:focus-within .pamount__prefix,
.pamount--input:focus-within .pamount__num,
.pamount--input.pamount--active .pamount__prefix,
.pamount--input.pamount--active .pamount__num { color: #ffffff; }
.pamount--input:focus-within .pamount__num::placeholder,
.pamount--input.pamount--active .pamount__num::placeholder { color: rgba(255,255,255,0.65); }

/* selected (morado) */
.pamount--selected {
  border-width: 1.5px;
  background-image:
    linear-gradient(165deg, #8460E5 0%, #3B1782 100%),
    linear-gradient(120deg, #ffffff 0%, #F4AC59 22%, #8460E5 75%, #ffffff 100%);
}
.pamount--selected .pamount__radio { border-color: rgba(255,255,255,0.5); }
.pamount--selected .pamount__dot { opacity: 1; }
.pamount--selected .pamount__amount { color: #ffffff; }

.pamount--disabled { cursor: not-allowed; opacity: 0.7; }

@media (prefers-reduced-motion: reduce) { .pamount { transition: none; } }
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AmountOption({
  variant = "default",
  amount,
  value,
  defaultValue,
  prefix = ">S<",
  placeholder,
  onValueChange,
  onSelect,
  selected = false,
  disabled = false,
  name,
  "aria-label": ariaLabel,
  className = "",
}: AmountOptionProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const isSelected = variant === "selected";
  const isInput = variant === "input";
  const controlled = value !== undefined;
  const sizeText = (controlled ? (value ?? "") : (defaultValue ?? "")) || placeholder || "";
  const inputSize = Math.max(sizeText.length, 1);

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = AMOUNTOPTION_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const cls = [
    "pamount",
    isSelected ? "pamount--selected" : "",
    isInput ? "pamount--input" : "",
    isInput && selected ? "pamount--active" : "",
    disabled ? "pamount--disabled" : "",
    className,
  ].filter(Boolean).join(" ");

  const radio = (
    <span className="pamount__radio" aria-hidden="true">
      <span className="pamount__dot" />
    </span>
  );

  // Modo input: campo editable con placeholder gris.
  if (isInput) {
    return (
      <>
        <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: AMOUNTOPTION_STYLES }} />
        <label className={cls} htmlFor={`${uid}-field`}>
          {radio}
          <span className="pamount__amountwrap">
            <span className="pamount__prefix">{prefix}</span>
            <input
              id={`${uid}-field`}
              name={name}
              className="pamount__num"
              placeholder={placeholder}
              size={inputSize}
              inputMode="numeric"
              disabled={disabled}
              value={controlled ? value : undefined}
              defaultValue={controlled ? undefined : defaultValue}
              onChange={function handle(e) { onValueChange?.(e.target.value); }}
              aria-label={ariaLabel ?? "Ingresa un monto"}
            />
          </span>
        </label>
      </>
    );
  }

  // Modo default/selected: opción tipo radio con monto fijo.
  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: AMOUNTOPTION_STYLES }} />
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        aria-label={ariaLabel}
        className={cls}
        disabled={disabled}
        onClick={onSelect}
      >
        {radio}
        <span className="pamount__amount">{amount}</span>
      </button>
    </>
  );
}
