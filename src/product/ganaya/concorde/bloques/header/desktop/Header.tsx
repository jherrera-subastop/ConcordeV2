/**
 * Header — Bloque de Concorde (Voyager DS)
 *
 * Barra superior 798 × 64 con fondo vault (#2E0F70). A la derecha lleva el
 * Button «Ingresa» (variante sm-guest, con UserIcon), a 16px del borde y
 * centrado verticalmente — igual que el export de Figma (1312:4674).
 *
 * Si se pasa `username`, el CTA cambia a la variante logueada: «Bienvenido,
 * {username}» (Button sm-logged-in) — usado p.ej. en la Zona de usuario.
 */

"use client";

import type { JSX, ReactNode } from "react";
import Button, { UserIcon } from "../../../components/Button";
import { HEADER_WIDTH, HEADER_HEIGHT } from "./dimensions";

export interface HeaderProps {
  /** Ancho de la barra. Por defecto HEADER_WIDTH (798, desktop); 420 en mobile. */
  width?: number | string;
  /** Logo a la izquierda (slot). En desktop no se usa (el logo va en el Sidebar);
   *  en mobile se pasa el logo de la marca. */
  logo?: ReactNode;
  /** Usuario logueado. Si se pasa, el CTA muestra «Bienvenido, {username}»
   *  (variante sm-logged-in) en vez de «Ingresa» (sm-guest). */
  username?: string;
  /** En mobile el ancho es 420 y el botón «Bienvenido, {username}» no entra junto
   *  al logo+hamburguesa: con `compact` se muestra solo el ícono de usuario. */
  compact?: boolean;
  className?: string;
}

export default function Header({ width = HEADER_WIDTH, logo, username, compact = false, className = "" }: HeaderProps): JSX.Element {
  return (
    <header
      className={className}
      data-block="header"
      style={{
        width,
        height: HEADER_HEIGHT,
        background: "#2E0F70",
        display: "flex",
        alignItems: "center",
        justifyContent: logo ? "space-between" : "flex-end",
        padding: "0 16px",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      {logo}
      {username && compact ? (
        // Solo el ícono circular (mobile) — el botón con texto no entra en 420px.
        <button
          type="button"
          aria-label={`Perfil de ${username}`}
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.7)",
            background: "linear-gradient(135deg, #ED8936 0%, #ED8936 40%, #8460E5 100%)",
            boxShadow: "rgba(255,255,255,0.28) 0 1px 0 2px inset, rgba(237,137,54,0.3) 0 2px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <UserIcon />
        </button>
      ) : username ? (
        <Button variant="sm-logged-in" username={username} icon={<UserIcon />} />
      ) : (
        <Button variant="sm-guest" icon={<UserIcon />}>
          Ingresa
        </Button>
      )}
    </header>
  );
}
