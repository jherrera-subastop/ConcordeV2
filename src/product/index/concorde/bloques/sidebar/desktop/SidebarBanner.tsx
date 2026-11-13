"use client";

/**
 * SidebarBanner — 200×264 · banner CTA inferior del sidebar
 * Fuente: Figma VOYAGER · "SideBarDefault" — frame inferior (paint18 + paint19)
 *
 * Fondo: gradiente vertical #3B1A7A → #3B1782 → #6E3E2A
 * Botón CTA: gradiente vertical #F5921E → #E15F2B, pill de 31px
 */

import type { JSX } from "react";

export const BANNER_W = 200;
export const BANNER_H = 264;

export interface SidebarBannerProps {
  onCta?: () => void;
}

export default function SidebarBanner({ onCta: _ }: SidebarBannerProps): JSX.Element {
  return (
    <div
      data-slot="sidebar-banner"
      style={{
        width:           BANNER_W,
        height:          BANNER_H,
        borderRadius:    16,
        background:      "rgba(255,255,255,0.07)",
        flexShrink:      0,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
      }}
    >
      <span
        style={{
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.25)",
        }}
      >
        Banner
      </span>
    </div>
  );
}
