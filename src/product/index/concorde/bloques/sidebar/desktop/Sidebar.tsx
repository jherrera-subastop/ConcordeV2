"use client";

/**
 * Sidebar — Bloque de navegación lateral (Voyager DS)
 * Fuente: Figma VOYAGER · "SideBarDefault" (226×1042)
 *
 * Estructura:
 *   ┌──────────────────────────────┐ ← y=0
 *   │  SidebarHeader  (60px)       │
 *   ├──────────────────────────────┤ ← y=60   ← borde VYStrokes1
 *   │  Nav primary items (4)       │
 *   │  ─── separator ───           │
 *   │  Nav secondary items (1)     │
 *   │                              │
 *   │   ┌──────────────────────┐   │
 *   │   │  SidebarBanner 200×264│  │
 *   │   └──────────────────────┘   │
 *   └──────────────────────────────┘ ← y=1042
 */

import { useState } from "react";
import type { JSX, ReactNode } from "react";
import SidebarHeader from "./SidebarHeader";
import SidebarBanner from "./SidebarBanner";
import SidebarItem, { SidebarSeparator, type SidebarNavItem } from "./SidebarItem";
import TodayIcon from "@/src/product/index/concorde/components/TodayIcon";
import OfferIcon from "@/src/product/index/concorde/components/OfferIcon";
import CategoryIcon from "@/src/product/index/concorde/components/CategoryIcon";
import BusinessIcon from "@/src/product/index/concorde/components/BusinessIcon";
import ServiceCenterIcon from "@/src/product/index/concorde/components/ServiceCenterIcon";

// Dimensiones en un módulo plano (no-client) para que los Server Components puedan
// importarlas sin obtener undefined. Se re-exportan para los consumidores cliente.
export { SIDEBAR_WIDTH, SIDEBAR_HEIGHT, SIDEBAR_COLLAPSED_WIDTH } from "./dimensions";
import { SIDEBAR_WIDTH, SIDEBAR_HEIGHT, SIDEBAR_COLLAPSED_WIDTH } from "./dimensions";

const EASE = "cubic-bezier(0.4,0,0.2,1)";

const DEFAULT_PRIMARY: SidebarNavItem[] = [
  { id: "hoy",       icon: (s) => <TodayIcon        size={22} state={s} />, label: "Hoy" },
  {
    id: "oferta",    icon: (s) => <OfferIcon         size={22} state={s} />, label: "Tipo de oferta",  count: 2,
    subitems: [
      { id: "en-vivo",    label: "En Vivo",    count: 38 },
      { id: "negociable", label: "Recibe ofertas" },
    ],
  },
  { id: "categoria", icon: (s) => <CategoryIcon      size={22} state={s} />, label: "Categoría",       count: 2 },
  { id: "empresas",  icon: (s) => <BusinessIcon      size={22} state={s} />, label: "Empresas",        count: 2 },
];

const DEFAULT_SECONDARY: SidebarNavItem[] = [
  { id: "centro",    icon: (s) => <ServiceCenterIcon size={22} state={s} />, label: "Centro de Ayuda" },
];

const STYLE_ID = "concorde-sidebar-styles";
const STYLES = `
.sb-root {
  transition: width 0.28s ${EASE}, height 0.28s ${EASE};
}
.sb-content-frame {
  border: 1.5px solid transparent;
  /* Borde VYStrokes1 — dirección exacta del SVG (paint20: vector 283.9,21.1 → 94deg) */
  background:
    linear-gradient(#2E0F70, #2E0F70) padding-box,
    linear-gradient(94deg, #FFFFFF 0%, #F4AC59 22.1%, #8460E5 74.5%, #FFFFFF 100%) border-box;
  transition: width 0.28s ${EASE};
}
.sb-banner {
  display: flex;
  justify-content: center;
  padding: 0 7px 4px;
  opacity: 1;
  max-height: 280px;
  overflow: hidden;
  transition: opacity 0.18s ease, max-height 0.28s ${EASE}, padding 0.28s ${EASE};
}
.sb-banner--collapsed {
  opacity: 0;
  max-height: 0;
  padding: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .sb-root, .sb-content-frame, .sb-banner { transition: none; }
}
`;

let _injected = false;

export type { SidebarNavItem };

export interface SidebarProps {
  logo?: ReactNode;
  primaryItems?: SidebarNavItem[];
  secondaryItems?: SidebarNavItem[];
  defaultActiveId?: string;
  /** Alto del sidebar. Por defecto SIDEBAR_HEIGHT; pásale el alto del canvas
   *  cuando el contenido a la derecha sea más alto, para que crezca con él. */
  height?: number | string;
  /** Alto del bloque interno fijo (header + nav + banner). Por defecto
   *  SIDEBAR_HEIGHT (igual que siempre: si `height` es mayor, el sobrante
   *  queda como relleno morado plano debajo, sin estirar nav/banner).
   *  Edítalo SOLO cuando el contenido de al lado sea más CORTO que el
   *  sidebar — pásale ese mismo alto (igual a `height`) para que el spacer
   *  interno se comprima y el sidebar no sobre por debajo del contenido. */
  contentHeight?: number;
  /** Alto de la cabecera fija (logo + hamburguesa), en px. Por defecto 60. Cuando
   *  el contenido de al lado tiene su propio header y se escala, pásale la altura
   *  de ESE header escalada (p.ej. HEADER_HEIGHT × scale) para que el top de los
   *  iconos del sidebar quede alineado con el top del contenido. */
  headerHeight?: number;
  /** Colapsado (controlado). Si se omite, el Sidebar maneja su estado interno. */
  collapsed?: boolean;
  /** Callback al alternar el colapsado (para reaccionar desde el contenedor). */
  onCollapsedChange?: (collapsed: boolean) => void;
  onItemClick?: (id: string) => void;
  onBannerCta?: () => void;
}

export default function Sidebar({
  logo,
  primaryItems  = DEFAULT_PRIMARY,
  secondaryItems = DEFAULT_SECONDARY,
  defaultActiveId,
  height = SIDEBAR_HEIGHT,
  contentHeight = SIDEBAR_HEIGHT,
  headerHeight = 60,
  collapsed: collapsedProp,
  onCollapsedChange,
  onItemClick,
  onBannerCta,
}: SidebarProps): JSX.Element {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;
  const [activeId,  setActiveId]  = useState(defaultActiveId);

  function toggleCollapsed(): void {
    const next = !collapsed;
    if (collapsedProp === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  if (typeof document !== "undefined" && !_injected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
    _injected = true;
  }

  function handleItemClick(id: string) {
    setActiveId(id);
    onItemClick?.(id);
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        data-slot="sidebar"
        className="sb-root"
        style={{
          width:         collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          height,
          background:    "#2E0F70",
          fontFamily:    'var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif)',
          flexShrink:    0,
          position:      "relative",
          /* Sin overflow:hidden en la raíz — la cabecera (logo+hamburguesa) se
             mantiene a 226px aunque el resto colapse a 76px. */
        }}
      >
        {/* Cabecera FIJA (logo + hamburguesa) — ancho completo 226, no colapsa.
            Va como overlay en el top; el bloque de contenido de abajo deja headerHeight px. */}
        <div
          style={{
            position:  "absolute",
            top:       0,
            left:      0,
            width:     SIDEBAR_WIDTH,
            height:    headerHeight,
            zIndex:    2,
            background: "#2E0F70",
          }}
        >
          <SidebarHeader logo={logo} collapsed={collapsed} onToggle={toggleCollapsed} height={headerHeight} />
        </div>

        {/* Bloque colapsable (nav + banner) — este SÍ encoge su ancho. Recortado
            con overflow:hidden y desplazado headerHeight px para no tapar la cabecera. */}
        <div
          style={{
            height:        contentHeight,
            width:         collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            paddingTop:    headerHeight,
            boxSizing:     "border-box",
            flexShrink:    0,
            display:       "flex",
            flexDirection: "column",
            overflow:      "hidden",
            transition:    `width 0.28s ${EASE}`,
          }}
        >
        {/* Área de contenido 216×935 — borde VYStrokes1 */}
        <div
          className="sb-content-frame"
          style={{
            width:         collapsed ? SIDEBAR_COLLAPSED_WIDTH - 10 : 216,
            flex:          1,
            margin:        "0 5px 47px",
            display:       "flex",
            flexDirection: "column",
            overflow:      "hidden",
            borderRadius:  17,
          }}
        >
          {/* Nav items */}
          <nav
            aria-label="Navegación principal"
            style={{ padding: 0, display: "flex", flexDirection: "column", gap: 6 }}
          >
            {primaryItems.map((item) => (
              <SidebarItem
                key={item.id}
                {...item}
                isActive={activeId === item.id}
                collapsed={collapsed}
                onClick={handleItemClick}
              />
            ))}

            {secondaryItems.length > 0 && <SidebarSeparator />}

            {secondaryItems.map((item) => (
              <SidebarItem
                key={item.id}
                {...item}
                isActive={activeId === item.id}
                collapsed={collapsed}
                onClick={handleItemClick}
              />
            ))}
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Banner inferior 200×264 */}
          <div className={`sb-banner${collapsed ? " sb-banner--collapsed" : ""}`}>
            <SidebarBanner onCta={onBannerCta} />
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
