/** LightBar: barra llena con una luz que la recorre; naranja en vivo, turquesa en Recibe ofertas. Solo depende de React y light-bar.css. */
import type { CSSProperties, JSX } from "react";
import "./light-bar.css";

export type LightBarTone = "live" | "negotiable";

export type LightBarProps = {
  /** live = naranja (en vivo); negotiable = turquesa (Recibe ofertas). */
  tone?: LightBarTone;
  /** Alto en px (9 en la carta). */
  height?: number;
  className?: string;
};

export function LightBar({ tone = "live", height = 9, className = "" }: LightBarProps): JSX.Element {
  return <span className={`vlb vlb--${tone}${className ? ` ${className}` : ""}`} aria-hidden style={{ "--vlb-h": `${height}px` } as CSSProperties}><i /></span>;
}

export default LightBar;
