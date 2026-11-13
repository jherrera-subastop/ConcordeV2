"use client";

/**
 * AmountOptionGroup — Generado por Concorde
 *
 * Selector de monto configurable, compuesto con AmountOption:
 *   · `amounts`     → cuántos montos fijos (uno por elemento)
 *   · `allowCustom` → si se muestra la opción personalizada (input editable)
 * Maneja la selección tipo radio (uno activo a la vez). Controlado o no.
 */

import { useId, useState } from "react";
import type { JSX } from "react";
import AmountOption from "./AmountOption";

export type AmountSelection = number | "custom";

export interface AmountOptionGroupProps {
  /** Montos fijos (solo el número) — la cantidad = length. P.ej. ["80","130","210"] */
  amounts: string[];
  /** Muestra la opción personalizada (input editable) — default false */
  allowCustom?: boolean;
  /** Etiqueta sobre la opción personalizada — default "Ingresa un monto:" */
  customLabel?: string;
  /** Placeholder del número del input — default "0" */
  customPlaceholder?: string;
  /** Prefijo del monto — default ">S<" */
  prefix?: string;
  /** Selección controlada: índice del monto fijo o "custom" */
  value?: AmountSelection;
  /** Selección inicial (no controlado) — default 0 */
  defaultValue?: AmountSelection;
  onChange?: (selected: AmountSelection) => void;
  /** Valor del input personalizado (controlado) */
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  /** name del grupo radio */
  name?: string;
  className?: string;
}

export default function AmountOptionGroup({
  amounts,
  allowCustom = false,
  customLabel = "Ingresa un monto:",
  customPlaceholder = "0",
  prefix = ">S<",
  value,
  defaultValue = 0,
  onChange,
  customValue,
  onCustomValueChange,
  name,
  className = "",
}: AmountOptionGroupProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const controlled = value !== undefined;
  const [internalSel, setInternalSel] = useState<AmountSelection>(defaultValue);
  const sel = controlled ? value : internalSel;

  const customControlled = customValue !== undefined;
  const [internalCustom, setInternalCustom] = useState("");
  const cval = customControlled ? customValue : internalCustom;

  const groupName = name ?? `amountgroup-${uid}`;

  function select(next: AmountSelection): void {
    if (!controlled) setInternalSel(next);
    onChange?.(next);
  }

  function handleCustomChange(v: string): void {
    if (!customControlled) setInternalCustom(v);
    onCustomValueChange?.(v);
    select("custom");
  }

  return (
    <div role="radiogroup" className={className} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {amounts.map(function renderFixed(a, i) {
        return (
          <AmountOption
            key={i}
            name={groupName}
            variant={sel === i ? "selected" : "default"}
            amount={`${prefix} ${a}`}
            onSelect={function pick() { select(i); }}
          />
        );
      })}

      {allowCustom ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
          onFocusCapture={function focusCustom() { select("custom"); }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94A3B8", fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            {customLabel}
          </span>
          <AmountOption
            variant="input"
            name={groupName}
            prefix={prefix}
            placeholder={customPlaceholder}
            value={cval}
            selected={sel === "custom"}
            onValueChange={handleCustomChange}
          />
        </div>
      ) : null}
    </div>
  );
}
