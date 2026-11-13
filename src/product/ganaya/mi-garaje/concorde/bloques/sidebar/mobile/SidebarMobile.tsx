"use client";

/**
 * SidebarMobile — variante móvil del bloque Sidebar (Voyager DS).
 *
 * Reutiliza el mismo `Sidebar` de escritorio (idénticos colores, glass, gradientes
 * y estados) y lo presenta como un drawer: se desliza desde la izquierda por encima
 * del contenido y oscurece el fondo con un backdrop, en lugar de empujar el layout.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <SidebarMobile open={open} onOpenChange={setOpen}>
 *   {appContent}
 * </SidebarMobile>
 * ```
 *
 * El botón que abre el drawer se coloca en el header de la app y se cablea a
 * `onOpenChange(true)` (o usa `showTrigger` para el trigger flotante integrado).
 * Cierra con: backdrop, tecla Escape, o el botón del propio Sidebar.
 */

import { useEffect, useId, useRef, useState } from "react";
import type { JSX, ReactNode } from "react";
import Sidebar, { type SidebarNavItem } from "../desktop/Sidebar";
import { SIDEBAR_DRAWER_WIDTH } from "./dimensions";

export { SIDEBAR_MOBILE_WIDTH, SIDEBAR_MOBILE_HEIGHT, SIDEBAR_DRAWER_WIDTH } from "./dimensions";
export type { SidebarNavItem };

const EASE = "cubic-bezier(0.4,0,0.2,1)";

const STYLE_ID = "concorde-sidebar-mobile-styles";
const STYLES = `
.sbm-root { position: relative; }

/* Marco opcional para previews: alto fijo con scroll interno; su transform crea el
   containing block que ancla el drawer fixed dentro del marco (ver prop frameHeight). */
.sbm-frame {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  transform: translateZ(0);
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sbm-frame::-webkit-scrollbar { width: 0; height: 0; display: none; }
.sbm-frame--locked { overflow: hidden; }

.sbm-trigger {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  background: #2E0F70;
  box-shadow: 0 6px 18px -6px rgba(10,0,46,0.6);
  cursor: pointer;
  transition: transform 0.15s, background 0.15s, opacity 0.2s;
}
.sbm-trigger:hover { background: #3a1a86; }
.sbm-trigger:active { transform: scale(0.94); }
.sbm-trigger:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }

.sbm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(10,0,38,0.55);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ${EASE};
}
.sbm-backdrop--open { opacity: 1; pointer-events: auto; }

.sbm-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 41;
  width: ${SIDEBAR_DRAWER_WIDTH}px;
  max-width: 86%;
  transform: translateX(-100%);
  transition: transform 0.3s ${EASE};
  box-shadow: 0 0 40px -4px rgba(10,0,46,0.6);
  will-change: transform;
}
.sbm-panel--open { transform: translateX(0); }
.sbm-panel-inner { height: 100%; }
.sbm-panel-inner > [data-slot="sidebar"] { height: 100% !important; }

@media (prefers-reduced-motion: reduce) {
  .sbm-trigger, .sbm-backdrop, .sbm-panel { transition: none; }
}
`;

let _injected = false;

export interface SidebarMobileProps {
  /** Contenido de la aplicación. Se renderiza detrás del drawer y se oscurece al abrir. */
  children?: ReactNode;
  /** Logo mostrado en la cabecera del Sidebar. */
  logo?: ReactNode;
  /** Ítems de navegación principales. Por defecto usa los del Sidebar. */
  primaryItems?: SidebarNavItem[];
  /** Ítems de navegación secundarios (bajo el separador). */
  secondaryItems?: SidebarNavItem[];
  /** Id del ítem activo inicial. */
  defaultActiveId?: string;
  /** Estado abierto (modo controlado). Si se omite, el drawer gestiona su estado. */
  open?: boolean;
  /** Se invoca al abrir o cerrar el drawer. */
  onOpenChange?: (open: boolean) => void;
  /** Se invoca con el id del ítem seleccionado. */
  onItemClick?: (id: string) => void;
  /** Se invoca al pulsar el CTA del banner inferior. */
  onBannerCta?: () => void;
  /**
   * Cierra el drawer al seleccionar un ítem. Por defecto `false`: seleccionar un
   * ítem solo expande sus subítems. Actívalo cuando los ítems naveguen a una ruta.
   */
  closeOnItemClick?: boolean;
  /**
   * Muestra un botón hamburguesa flotante que abre el drawer. Por defecto `false`:
   * lo habitual es colocar el botón en la cabecera de la app y llamar a
   * `onOpenChange(true)`.
   */
  showTrigger?: boolean;
  /**
   * Alto del bloque interno del Sidebar (cabecera + navegación + banner), en px.
   * Debe cubrir el alto visible para que el banner no se recorte. Por defecto `780`.
   */
  drawerContentHeight?: number;
  /**
   * Envuelve el contenido en un marco de alto fijo (px) con scroll interno,
   * confinando el drawer a ese marco. Pensado para previsualizaciones embebidas;
   * en producción se omite y el drawer flota sobre el viewport completo.
   */
  frameHeight?: number;
}

export default function SidebarMobile({
  children,
  logo,
  primaryItems,
  secondaryItems,
  defaultActiveId,
  open: openProp,
  onOpenChange,
  onItemClick,
  onBannerCta,
  closeOnItemClick = false,
  showTrigger = false,
  drawerContentHeight = 780,
  frameHeight,
}: SidebarMobileProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;

  function setOpen(next: boolean): void {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
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

  useEffect(
    function closeOnEscape() {
      if (!open) return;
      function onKey(e: KeyboardEvent): void {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  useEffect(
    function lockScroll() {
      if (!open || typeof document === "undefined") return;
      // Con frame, el scroll vive en el marco; sin frame, en el documento. En el
      // marco reseteamos scrollTop a 0 para que el drawer fixed cubra todo lo visible.
      const frame = frameHeight ? rootRef.current : null;
      const prevBodyOverflow = document.body.style.overflow;
      let prevScrollTop = 0;
      if (frame) {
        prevScrollTop = frame.scrollTop;
        frame.scrollTop = 0;
      } else {
        document.body.style.overflow = "hidden";
      }
      return () => {
        if (frame) frame.scrollTop = prevScrollTop;
        else document.body.style.overflow = prevBodyOverflow;
      };
    },
    [open, frameHeight],
  );

  function handleItemClick(id: string): void {
    onItemClick?.(id);
    if (closeOnItemClick) setOpen(false);
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={rootRef}
        className={`sbm-root${frameHeight ? " sbm-frame" : ""}${frameHeight && open ? " sbm-frame--locked" : ""}`}
        style={frameHeight ? { height: frameHeight } : undefined}
      >
        {children}

        {showTrigger ? (
          <button
            type="button"
            className="sbm-trigger"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            style={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : "auto" }}
          >
            <HamburgerIcon />
          </button>
        ) : null}

        <div
          className={`sbm-backdrop${open ? " sbm-backdrop--open" : ""}`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        <div
          className={`sbm-panel${open ? " sbm-panel--open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navegación"
          aria-hidden={!open}
        >
          <div className="sbm-panel-inner">
            <Sidebar
              logo={logo}
              primaryItems={primaryItems}
              secondaryItems={secondaryItems}
              defaultActiveId={defaultActiveId}
              height="100%"
              contentHeight={drawerContentHeight}
              collapsed={false}
              onCollapsedChange={() => setOpen(false)}
              onItemClick={handleItemClick}
              onBannerCta={onBannerCta}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const MENU_BTN_STYLE_ID = "concorde-sidebar-menu-button-styles";
const MENU_BTN_STYLES = `
.sbm-menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.sbm-menu-btn:hover { background: rgba(255,255,255,0.10); }
.sbm-menu-btn:active { transform: scale(0.92); }
.sbm-menu-btn:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
`;

let _menuBtnInjected = false;

export interface SidebarMenuButtonProps {
  /** Se invoca al pulsar el botón (normalmente abre el drawer). */
  onClick: () => void;
  /** Estado abierto del drawer, para `aria-expanded`. */
  expanded?: boolean;
}

/**
 * Botón hamburguesa autocontenido para abrir el drawer desde la cabecera de la app.
 * Incluye el ícono, los estados (hover/active/focus) y la etiqueta accesible.
 */
export function SidebarMenuButton({ onClick, expanded = false }: SidebarMenuButtonProps): JSX.Element {
  if (typeof document !== "undefined" && !_menuBtnInjected) {
    if (!document.getElementById(MENU_BTN_STYLE_ID)) {
      const el = document.createElement("style");
      el.id = MENU_BTN_STYLE_ID;
      el.textContent = MENU_BTN_STYLES;
      document.head.appendChild(el);
    }
    _menuBtnInjected = true;
  }

  return (
    <>
      <style id={`${MENU_BTN_STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: MENU_BTN_STYLES }} />
      <button type="button" className="sbm-menu-btn" onClick={onClick} aria-label="Abrir menú" aria-expanded={expanded}>
        <HamburgerIcon size={24} />
      </button>
    </>
  );
}

/** Ícono hamburguesa con el gradiente lila del sistema. Úsalo en el botón que abre el drawer. */
export function HamburgerIcon({ size = 24 }: { size?: number }): JSX.Element {
  const gid = `sbm-hamburger-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M2.75 5.5H19.25" stroke={`url(#${gid})`} strokeWidth="1.83333" strokeLinecap="round" />
      <path d="M2.75 11H19.25" stroke={`url(#${gid})`} strokeWidth="1.83333" strokeLinecap="round" />
      <path d="M2.75 16.5H19.25" stroke={`url(#${gid})`} strokeWidth="1.83333" strokeLinecap="round" />
      <defs>
        <linearGradient id={gid} x1="2.75" y1="5.5" x2="6" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CFBAFF" />
          <stop offset="0.35" stopColor="white" />
          <stop offset="0.65" stopColor="#AE8EFF" />
          <stop offset="1" stopColor="#CFBAFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
