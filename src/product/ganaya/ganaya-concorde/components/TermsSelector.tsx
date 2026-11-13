"use client";

/**
 * TermsSelector — Generado por Concorde
 * Fuente: Figma VOYAGER · "Label" (nodo 2425:11019)
 *
 * Checkbox de términos: casilla 16×16 (radio 4) con relleno gradiente
 * (#8460E5 → #3B1782) y borde gradiente (white → #F4AC59 → #8460E5 → white)
 * cuando está marcada, más una etiqueta en #3B1782. Controlado o no controlado.
 */

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, JSX, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Hereda los atributos nativos del <input type="checkbox"> (name, id, required,
 * aria-*, data-*, value…) salvo onChange, que aquí entrega el booleano marcado,
 * y children, que es la etiqueta. className se aplica al <label> raíz.
 */
export interface TermsSelectorProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "children" | "type"> {
  /** Callback al alternar */
  onChange?: (checked: boolean) => void;
  /** Etiqueta (texto de términos) */
  children?: ReactNode;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-termsselector-styles";

const TERMS_STYLES = `
.pterms {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
  font-size: 14px;
  line-height: 20px;
  color: #3B1782;
}
.pterms--disabled { cursor: not-allowed; opacity: 0.6; }
.pterms__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  margin: 0;
  pointer-events: none;
}
.pterms__box {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  border-radius: 4px;
  border: 1px solid transparent;
  /* sin marcar: blanco con borde lila claro */
  background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, #CFC2F2, #CFC2F2);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-image 0.15s, box-shadow 0.15s;
}
.pterms__input:checked + .pterms__box {
  /* marcado: relleno gradiente + borde gradiente (white → F4AC59 → 8460E5 → white) */
  background-image:
    linear-gradient(150deg, #8460E5 0%, #3B1782 100%),
    linear-gradient(120deg, #ffffff 0%, #F4AC59 22%, #8460E5 75%, #ffffff 100%);
}
.pterms__input:focus-visible + .pterms__box { outline: 2px solid #8460E5; outline-offset: 2px; }
.pterms__check { width: 10px; height: 10px; opacity: 0; transition: opacity 0.12s; }
.pterms__input:checked + .pterms__box .pterms__check { opacity: 1; }
.pterms__label { user-select: none; }
@media (prefers-reduced-motion: reduce) {
  .pterms__box, .pterms__check { transition: none; }
}
`;

let _stylesInjected = false;

// ─── Component ────────────────────────────────────────────────────────────────

const TermsSelector = forwardRef<HTMLInputElement, TermsSelectorProps>(function TermsSelector({
  checked,
  defaultChecked,
  onChange,
  children = "He leído y acepto los términos y condiciones.",
  disabled = false,
  id,
  className = "",
  ...rest
}, ref): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const inputId = id ?? `${uid}-input`;
  const controlled = checked !== undefined;

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = TERMS_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: TERMS_STYLES }} />
      <label htmlFor={inputId} className={["pterms", disabled ? "pterms--disabled" : "", className].filter(Boolean).join(" ")}>
        <input
          ref={ref}
          {...rest}
          id={inputId}
          type="checkbox"
          className="pterms__input"
          checked={controlled ? checked : undefined}
          defaultChecked={controlled ? undefined : defaultChecked}
          disabled={disabled}
          onChange={function handle(e) { onChange?.(e.target.checked); }}
        />
        <span className="pterms__box" aria-hidden="true">
          <svg className="pterms__check" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="pterms__label">{children}</span>
      </label>
    </>
  );
});

export default TermsSelector;
