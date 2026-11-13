"use client";

/**
 * SidebarSubItem — subitem expandible 201×48 del SidebarItem
 * Fuente: Figma VOYAGER · "SideBarDefault" — State=Default/Hover/Active (subitems)
 *
 * El gradient border se hace con ::before + mask-composite:exclude porque
 * el fondo es rgba(255,255,255,0.06) — casi transparente. Con el truco
 * padding-box/border-box el gradiente se filtra a través del fondo.
 * La técnica de máscara dibuja el gradiente SOLO en el anillo del borde.
 */

import { useState } from "react";
import type { JSX } from "react";

export interface SidebarSubItemDef {
  id: string;
  label: string;
  count?: number;
}

interface SidebarSubItemProps extends SidebarSubItemDef {
  isActive?: boolean;
  onClick?: (id: string) => void;
}

const STYLE_ID = "concorde-sbsi-styles";
const STYLES = `
.sbsi-item {
  width: 100%;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  outline: none;
  position: relative;
  background: rgba(255,255,255,0.10);
  transition: box-shadow 0.15s;
}
/* Hover — borde VYGradientOrange0 (::before) + drop #0A002E 60% (0,6,20,-4) */
.sbsi-item--hover {
  box-shadow: 0px 6px 20px -4px rgba(10,0,46,0.6);
}
/* Press/Active — borde VYStrokes1 (::before) + drop #0A002E 60% (0,12,36,-4) */
.sbsi-item--active {
  box-shadow: 0px 12px 36px -4px rgba(10,0,46,0.6);
}
/* Anillo de borde gradiente — solo visible en la franja del borde */
.sbsi-item--hover::before,
.sbsi-item--active::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
}
.sbsi-item--hover::before {
  padding: 1px;
  /* VYGradientOrange0 — dirección exacta del SVG (vector 94.42,127.15 → 143deg) */
  background: linear-gradient(143deg, #FF9639 0%, #EF852E 50%, #BE3D00 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
.sbsi-item--active::before {
  padding: 1.5px;
  /* VYStrokes1 — dirección exacta del SVG (vector 94.42,127.15 → 143deg) */
  background: linear-gradient(143deg, #FFFFFF 0%, #F4AC59 22.1%, #8460E5 74.5%, #FFFFFF 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
.sbsi-item:focus-visible {
  outline: 2px solid rgba(255,255,255,0.5);
  outline-offset: 2px;
}
.sbsi-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #D1D5DC;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  position: relative;
  z-index: 1;
}
.sbsi-count {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
@media (prefers-reduced-motion: reduce) {
  .sbsi-item { transition: none; }
}
`;

let _injected = false;

export default function SidebarSubItem({
  id,
  label,
  count,
  isActive = false,
  onClick,
}: SidebarSubItemProps): JSX.Element {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  if (typeof document !== "undefined" && !_injected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
    _injected = true;
  }

  const showActive = isActive || pressed;
  const cls = `sbsi-item${showActive ? " sbsi-item--active" : hovered ? " sbsi-item--hover" : ""}`;

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        role="button"
        tabIndex={0}
        className={cls}
        onClick={() => onClick?.(id)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(id); } }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="sbsi-label">{label}</span>
        {count != null && <span className="sbsi-count">({count})</span>}
      </div>
    </>
  );
}
