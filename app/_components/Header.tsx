"use client";

/**
 * Header — barra superior unificada para toda la app (home, components, blocks).
 * Tema claro, mismos tokens de marca (gradiente naranja→morado).
 */

import type { JSX, ReactNode } from "react";

const linkBase = {
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  padding: "6px 12px",
  borderRadius: 8,
  letterSpacing: "0.01em",
  transition: "color 0.15s, background 0.15s",
} as const;

type Active = "producto" | "home" | "components" | "blocks" | "banners" | "correos" | "reporte";

export default function Header({ active, right }: { active?: Active; right?: ReactNode }): JSX.Element {
  const activeStyle = { ...linkBase, color: "var(--ui-accent)", background: "var(--ui-accent-soft)" };
  const idleStyle = { ...linkBase, color: "var(--ui-body)", background: "transparent" };

  return (
    <header
      style={{
        borderBottom: "1px solid var(--ui-border-soft)",
        padding: "0 40px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "linear-gradient(135deg, oklch(0.72 0.16 55), oklch(0.55 0.22 285))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ui-ink)", letterSpacing: "-0.02em" }}>Concorde</span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 24 }}>
          <a href="/components" style={active === "components" ? activeStyle : idleStyle}>Componentes</a>
          <a href="/producto" style={active === "producto" ? activeStyle : idleStyle}>Producto actual</a>
          <a href="/blocks" style={active === "blocks" ? activeStyle : idleStyle}>Bloques</a>
          <a href="/banners" style={active === "banners" ? activeStyle : idleStyle}>Banners</a>
          <a href="/correos" style={active === "correos" ? activeStyle : idleStyle}>Correos</a>
          <a href="/reporte" style={active === "reporte" ? activeStyle : idleStyle}>Reporte</a>
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {right}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "monospace",
            padding: "3px 10px",
            borderRadius: 20,
            background: "var(--ui-border-soft)",
            color: "var(--ui-body)",
            letterSpacing: "0.04em",
          }}
        >
          BETA
        </span>
      </div>
    </header>
  );
}
