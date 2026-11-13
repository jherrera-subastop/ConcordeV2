"use client";

/**
 * SidebarItem — nav pill 216×48 del sidebar
 * Fuente: Figma VOYAGER · "SideBarDefault" — State=Default/Hover/Active SVGs
 *
 * Estados del pill:
 *   default — glass gradient + subtle white border + shadow morado
 *   hover   — fondo #8460E5 38% + borde blanco 44%
 *   active  — naranja gradient + VYStrokes1 border + orange glow
 *
 * Subitems: expanden abajo con animación max-height cuando isActive=true y hay subitems
 */

import { useId, useState } from "react";
import type { JSX, ReactNode } from "react";
import SidebarSubItem, { type SidebarSubItemDef } from "./SidebarSubItem";

const STYLE_ID = "concorde-sbi-styles";
const STYLES = `
.sbi-item {
  width: 100%;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  outline: none;
  border: 1.5px solid transparent;
  /* Glass fill (paint0: white 0.28 → 0.1 → 0.04) sobre base oscura #0A002E (simula
     el "behind transparent areas" de Figma: la sombra se ve a través del glass) +
     borde VYStrokes3 (white 0.1 → 0 @55%) */
  background:
    linear-gradient(105deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.04) 100%) padding-box,
    linear-gradient(rgba(10,0,46,0.34), rgba(10,0,46,0.34)) padding-box,
    linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%) border-box;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  /* Drop #0A002E (0,12,36,-4) reforzado + inner top white 22% + inner bottom black 30% */
  box-shadow:
    0px 12px 36px -4px rgba(10,0,46,0.7),
    0px 4px 14px -2px rgba(10,0,46,0.5),
    inset 0px 1px 0px rgba(255,255,255,0.22),
    inset 0px -1px 6px rgba(0,0,0,0.3);
  transition: box-shadow 0.15s, background 0.12s, border-color 0.12s, padding 0.28s cubic-bezier(0.4,0,0.2,1), gap 0.28s cubic-bezier(0.4,0,0.2,1);
}
.sbi-item--collapsed {
  padding: 0;
  gap: 0;
  justify-content: center;
}
/* Hover — fill #8460E5 38% (sobre base oscura) + borde white 44% + drop #0A0026 55%
   (0,6,18,-6) + inner top white 60% (0,1,4) */
.sbi-item--hover {
  border: 1px solid rgba(255,255,255,0.44);
  background:
    rgba(132,96,229,0.38) padding-box,
    linear-gradient(rgba(10,0,38,0.32), rgba(10,0,38,0.32)) padding-box;
  box-shadow:
    0px 6px 18px -6px rgba(10,0,38,0.55),
    inset 0px 1px 4px rgba(255,255,255,0.6);
}
/* Pressed/Active — VYGradientOrange1 + borde gradiente + drop #ED8936 (0,2,25,-2)
   + background blur 10 */
.sbi-item--active {
  border: 1.5px solid transparent;
  background:
    linear-gradient(180deg, #FF9639 0%, #EF852E 40%, #BE3D00 100%) padding-box,
    linear-gradient(143deg, #FFFFFF 0%, #F4AC59 22.1%, #8460E5 74.5%, #FFFFFF 100%) border-box;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0px 2px 25px -2px rgba(237,137,54,0.55);
}
.sbi-item:focus-visible {
  outline: 2px solid rgba(255,255,255,0.5);
  outline-offset: 2px;
}
.sbi-trailing {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
  opacity: 1;
  max-width: 200px;
  transition: opacity 0.18s ease, max-width 0.28s cubic-bezier(0.4,0,0.2,1);
}
.sbi-item--collapsed .sbi-trailing {
  opacity: 0;
  max-width: 0;
  flex: 0;
}
.sbi-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #D1D5DC;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.sbi-item--active .sbi-label {
  color: #FFFFFF;
}
.sbi-sep {
  height: 1px;
  background: rgba(255,255,255,0.4);
  margin: 4px 14px;
  flex-shrink: 0;
}
.sbi-subitems {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 0 0 8px;
  margin-top: 0;
  transition: max-height 0.25s ease, opacity 0.2s ease, margin-top 0.2s ease;
}
.sbi-subitems--open {
  max-height: 400px;
  opacity: 1;
  margin-top: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .sbi-item, .sbi-subitems { transition: none; }
}
`;

let _injected = false;

// ── Tipos públicos ────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  id: string;
  /** Función que recibe el estado visual y retorna el icono correspondiente */
  icon: (state: "default" | "hover" | "active") => ReactNode;
  label: string;
  /** Número mostrado en el badge circular (normalmente = subitems.length) */
  count?: number;
  /** Subitems expandibles — diseño passed via props */
  subitems?: SidebarSubItemDef[];
}

interface SidebarItemProps extends SidebarNavItem {
  isActive?: boolean;
  collapsed?: boolean;
  onClick?: (id: string) => void;
}

// ── Badge de conteo ───────────────────────────────────────────────────────────

function SidebarBadge({ count, active, uid }: { count: number; active: boolean; uid: string }): JSX.Element {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}bd`} x1="3.73" y1="-11.55" x2="30.06" y2="-3.04" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="0.221154" stopColor="#F4AC59"/>
          <stop offset="0.745192" stopColor="#8460E5"/>
          <stop offset="1" stopColor="white"/>
        </linearGradient>
        {active && (
          <linearGradient id={`${uid}bn`} x1="11" y1="6" x2="11" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9639"/>
            <stop offset="0.5" stopColor="#EF852E"/>
            <stop offset="1" stopColor="#BE3D00"/>
          </linearGradient>
        )}
      </defs>
      <circle
        cx="11" cy="11" r="10.5"
        fill={active ? "white" : "rgba(34,0,92,0.10)"}
        stroke={`url(#${uid}bd)`}
      />
      <text
        x="11" y="15.2"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill={active ? `url(#${uid}bn)` : "white"}
        fontFamily="inherit"
      >
        {count}
      </text>
    </svg>
  );
}

// ── Separador primary / secondary ─────────────────────────────────────────────

export function SidebarSeparator(): JSX.Element {
  return <div className="sbi-sep" role="separator" aria-hidden="true" />;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function SidebarItem({
  id,
  icon,
  label,
  count,
  subitems,
  isActive = false,
  collapsed = false,
  onClick,
}: SidebarItemProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const [hovered, setHovered] = useState(false);
  const [activeSubId, setActiveSubId] = useState<string | undefined>();

  if (typeof document !== "undefined" && !_injected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
    _injected = true;
  }

  const iconState: "default" | "hover" | "active" =
    isActive ? "active" : hovered ? "hover" : "default";

  const cls = `sbi-item${isActive ? " sbi-item--active" : hovered ? " sbi-item--hover" : ""}${collapsed ? " sbi-item--collapsed" : ""}`;
  const hasSubitems = subitems && subitems.length > 0;
  const subitemsOpen = hasSubitems && isActive && !collapsed;

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Pill principal */}
        <div
          role="button"
          tabIndex={0}
          className={cls}
          onClick={() => onClick?.(id)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(id); } }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-current={isActive ? "page" : undefined}
          aria-expanded={hasSubitems ? subitemsOpen : undefined}
          aria-label={count != null ? `${label}, ${count} subitems` : label}
          title={collapsed ? label : undefined}
        >
          {icon(iconState)}
          <div className="sbi-trailing">
            <span className="sbi-label">{label}</span>
            {count != null && <SidebarBadge count={count} active={isActive} uid={uid} />}
          </div>
        </div>

        {/* Subitems expandibles */}
        {hasSubitems && (
          <div className={`sbi-subitems${subitemsOpen ? " sbi-subitems--open" : ""}`}>
            {subitems.map((sub) => (
              <SidebarSubItem
                key={sub.id}
                {...sub}
                isActive={activeSubId === sub.id}
                onClick={(sid) => setActiveSubId(sid)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
