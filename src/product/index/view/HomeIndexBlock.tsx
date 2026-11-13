"use client";

/**
 * HomeIndexBlock — composición local del bloque Homepage de Concorde V2
 * (concorde/bloques/homepage/desktop/Homepage.tsx, que queda intacto).
 *
 * Mismo lienzo (798 × 1104) y mismas secciones; solo cambia el primer tramo:
 * Principal Banner y Secondary Banner van lado a lado, como en la referencia
 * elegida (hero a la izquierda, el feed «VMC ahora» a la derecha).
 * Debajo, en este orden: Lotes para explorar, el banner de campaña, Explora por
 * categoría, Empresas y vendedores y Tipo de oferta / Categorías.
 *
 * La sección del Subastador (AuctioneerSection, 766 × 352) se recompone aquí como
 * «Lotes para explorar» con los mismos componentes (CardTitle · ProfileButton ·
 * OfferCard · BadgeStatus): la de Concorde fija «Ir al Perfil» y todas las cards
 * en variante «live», y aquí hacen falta «Ver todos los lotes» y negociables.
 * Principal Banner y Secondary Banner: Concorde no tiene hero ni feed de actividad
 * (los banners del registry son 766 × 192 y ActivityCard son contadores de «Tu
 * actividad»), así que se componen aquí solo con piezas de Concorde (Button ·
 * CardTitle · BadgeStatus · ProfileButton) y layout mínimo, sin estilos que las imiten.
 * Contenido de ejemplo; sin inventario real.
 */

import { Fragment, cloneElement, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import {
  BadgeStatus, Button, OfferCard, ProfileButton,
} from "@/src/product/index/adapter";

import {
  CompactCurveCard, EbayLotRow, FichaCard, FichaLegend, FichaPlus, FichaPro, GlassCard, ImmersiveCard, LotCardStyles, ReliefCard, SummaryCard,
  type FichaLayout, type LegendTier, type LotData, type ProTheme,
} from "./LotCards";
import VmcAhora, {
  DEFAULT_DESIGN, setFeedConfig, setFeedDesign, VmcAhoraQa, VmcAhoraTicker, type ActsAlign, type AdBadge, type AdStyle, type FeedView,
  type ColorTone, type ScrollStyle, type ShareIcon, type TagsMode, type ViewsStyle,
} from "./VmcAhora";
import { DEFAULT_SCENARIO, SCENARIOS } from "./feedPlan";
// Íconos de vidrio esmerilado: skill .claude/skills/vidrio-esmerilado (Vidrio.tsx + vidrio.css copiados sin cambios).
import { Vidrio, type Sec as VidrioName } from "./Vidrio";
import LogoLoop from "./reactbits/LogoLoop";
import { GLASS_CSS } from "./glass";

const GAP = 16;

const FONT = "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)";
const SHADOW = "rgba(0,0,0,0.07) 0px 0px 16px 4px"; // sombra de las secciones del homepage


// Principal Banner — réplica del hero de vmc-index-final-review (/producto/index):
// fondo con el degradado del sistema, foto nítida a un lado que se funde con máscara, texto al otro lado,
// tarjeta glass del lote destacado (slide 1) y controles con segmentos de progreso arriba a la derecha.
// Pills: EN VIVO (BadgeStatus de Concorde), PARA VENDEDORES morada y NEGOCIABLE cyan.
// Avanza solo cada 7 s; se pausa con el puntero o el foco dentro.
type HeroSlide = {
  label: string; pill: "live" | "seller" | "negotiable" | "whatsapp";
  title: JSX.Element; lead: JSX.Element; cta: string; bg: string;
  photo: { src: string[]; side: "l" | "r"; width: string; position: string; flip?: boolean; alto?: boolean; style?: CSSProperties }; // alto: encaja por alto (tomas con el sujeto muy abierto)
  copy: "left" | "right"; lot?: boolean;
};
// Slides con las campañas reales de VMC (pedido de Julio, 26/10): canal de WhatsApp, Publica y Negociable.
// Cada slide alterna entre sus variaciones: al volver a una slide, trae la siguiente foto. La versión nueva va primero (27/10).
// Publica C y D quedan fuera: su sujeto ocupa la zona del texto (27/10).
// Fotos 2K generadas para el hero (persona + vehículo seminuevo a la derecha, izquierda libre para el texto). Copy provisional: Julio lo ajusta.
const SLIDES: HeroSlide[] = [
  { label: "Entérate primero de las subastas por WhatsApp", pill: "whatsapp",
    title: <>Entérate <em>primero</em><br />de las subastas</>, lead: <>Únete al canal de VMC y recibe los lotes<br />nuevos antes que nadie.</>, // corte fijo (Julio, 02/11)
    cta: "Unirme al canal", bg: "linear-gradient(100deg, #2A1670 0%, #3D2299 34%, #0E7A5A 78%, #25D366 100%)",
    photo: { src: ["/producto/index/banners/vmc/hero-whatsapp-c.jpg", "/producto/index/banners/vmc/hero-whatsapp.jpg"], side: "r", width: "100%", position: "70% 30%", alto: true }, copy: "left" },
  { label: "Publica tu auto en VMC y recibe ofertas", pill: "seller",
    title: <>Publica tu auto<br />y <em>recibe ofertas</em></>, lead: <>Recibe propuestas y elige la que más te convenga.</>,
    cta: "Publicar mi auto", bg: "linear-gradient(100deg, #2A1670 0%, #3D2299 34%, #6B48DD 76%, #8460E5 100%)",
    photo: { src: ["/producto/index/banners/vmc/hero-publica.jpg"], side: "l", width: "100%", position: "30% 30%" }, copy: "right" },
  // Recibe ofertas (02/11): copy nuevo y solo la toma de la pareja (la del apretón de manos sale).
  { label: "Tú pones el precio y el 100% es tuyo", pill: "negotiable",
    title: <>¡Tú pones el precio<br />y <em>el 100% es tuyo</em>!</>, lead: <>Publica tu auto en minutos y negocia directo con los compradores.</>,
    cta: "¡Publica ahora!", bg: "linear-gradient(100deg, #2A1670 0%, #3D2299 35%, #00838C 78%, #00D2D3 100%)",
    photo: { src: ["/producto/index/banners/vmc/hero-negociable-a.jpg"], side: "r", width: "100%", position: "70% 20%", alto: true }, copy: "left" },
];
const AUTOPLAY_MS = 7000;

const HERO_CSS = `
.hp { position: relative; width: 100%; min-width: 0; height: 100%; box-sizing: border-box; container: hp / inline-size; border-radius: 16px; overflow: hidden;
  font-family: var(--vmc-font-display); color: var(--vmc-color-base-white); background: var(--vmc-color-vault-800); box-shadow: var(--vmc-shadow-card); isolation: isolate; }
.hp *, .hp *::before, .hp *::after { box-sizing: border-box; }
.hp-slide { position: absolute; inset: 0; opacity: 0; visibility: hidden; transition: opacity .5s ease, visibility 0s linear .5s; }
.hp-slide.on { opacity: 1; visibility: visible; transition: opacity .5s ease, visibility 0s; }
.hp-bg { position: absolute; inset: 0; }
.hp-photo { position: absolute; top: 0; bottom: 0; width: var(--pw, 58%); }
.hp-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transform: scaleX(var(--fx, 1)); } /* --fx: -1 = en espejo */
.hp-photo.r { right: 0; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 30%); mask-image: linear-gradient(90deg, transparent 0%, #000 30%); }
/* Foto a lo ancho (--pw: 100%): sin máscara; un velo violeta a la izquierda sostiene el texto y la derecha queda limpia. */
.hp-photo.full { left: 0; right: 0; width: 100%; -webkit-mask-image: none; mask-image: none; }
.hp-photo.full img { left: auto; right: 0; width: 118%; } /* el 18 % izquierdo de la toma es fondo vacío: la persona gana tamaño y se va a la derecha */
.hp-photo.full--l img { left: 0; right: auto; }
.hp-photo.full--alto img { width: auto; height: 100%; } /* encaja por alto, anclada a su lado: el sujeto se aleja del texto */ /* toma en espejo (persona a la izquierda, texto a la derecha) */
.hp-photo.full::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, rgba(34,16,92,0.92) 0%, rgba(42,22,112,0.8) 34%, rgba(42,22,112,0.3) 56%, rgba(42,22,112,0) 72%),
    linear-gradient(0deg, rgba(20,8,60,0.35) 0%, rgba(20,8,60,0) 30%); }
.hp-photo.full--l::after { transform: scaleX(-1); } /* el velo pasa al lado del texto */
.hp-photo.l { left: 0; -webkit-mask-image: linear-gradient(270deg, transparent 0%, #000 30%); mask-image: linear-gradient(270deg, transparent 0%, #000 30%); }
.hp-copy { position: absolute; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  padding-bottom: 28px; gap: 12px; width: 44%; min-width: 0; }
.hp-copy.left { left: 36px; }
.hp-copy.right { right: 36px; }
.hp-label { display: inline-flex; align-items: center; gap: 5px; height: 18px; padding: 0 8px 0 6px; border-radius: 999px; font-size: 9px; font-weight: 700; letter-spacing: 0.07em; line-height: 1; text-transform: uppercase; white-space: nowrap; }
.hp-label svg { flex: none; width: 10px; height: 10px; }
.hp-label--seller { background: linear-gradient(135deg, #8460E5 0%, #3B1782 100%); box-shadow: rgba(32,0,104,0.45) 0 2px 10px; }
.hp-label--whatsapp { background: linear-gradient(135deg, #25D366 0%, #0E7A5A 100%); box-shadow: rgba(14,122,90,0.45) 0 2px 10px; }
.hp-label--negotiable { background: linear-gradient(110deg, #00A9B0 0%, #3F7FD0 45%, #6A35D6 100%); box-shadow: rgba(80,70,210,0.45) 0 2px 10px; } /* = pill de las cards */
.hp-h { margin: 0; font-size: var(--vmc-font-size-hero); line-height: var(--vmc-line-height-hero); font-weight: var(--vmc-font-weight-bold); letter-spacing: var(--vmc-letter-spacing-tight); }
.hp-h em { font-style: normal; color: #FFE2C2; }
.hp-p { margin: 0; font-size: var(--vmc-font-size-body); line-height: var(--vmc-line-height-body); font-weight: var(--vmc-font-weight-medium); max-width: 28ch; } /* 28ch (~300 px): el texto no llega al sujeto de las tomas */
.hp-p b { font-weight: var(--vmc-font-weight-bold); }
.hp-lot { position: absolute; right: 24px; bottom: 24px; width: 232px; padding: 14px 16px; border-radius: var(--vmc-radius-xl);
  background: var(--vmc-color-glass-dark); border: var(--vmc-border-glass); -webkit-backdrop-filter: var(--vmc-glass-blur); backdrop-filter: var(--vmc-glass-blur); }
.hp-lot small { display: block; font-size: var(--vmc-font-size-caption); line-height: var(--vmc-line-height-caption); font-weight: 700; letter-spacing: var(--vmc-letter-spacing-label); text-transform: uppercase; color: #FFE2C2; }
.hp-lot strong { display: block; margin-top: 2px; font-size: var(--vmc-font-size-body); line-height: var(--vmc-line-height-body); font-weight: var(--vmc-font-weight-bold); }
.hp-lot .price { display: block; margin-top: 2px; font-size: 24px; line-height: 30px; font-weight: var(--vmc-font-weight-bold); letter-spacing: var(--vmc-letter-spacing-tight); }
.hp-lot .price span { font-size: var(--vmc-font-size-label); margin-right: 4px; font-weight: 700; }
.hp-lot .timer { display: inline-flex; align-items: center; gap: 7px; height: 28px; margin-top: 10px; padding: 0 13px; border-radius: var(--vmc-radius-full);
  background: linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 100%); border: 1px solid rgba(255,255,255,0.5);
  font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.hp-ctrl { position: absolute; top: 12px; right: 12px; z-index: 5; display: flex; align-items: center; gap: 2px; padding: 2px 4px; border-radius: var(--vmc-radius-full);
  background: var(--vmc-color-glass-dark); border: var(--vmc-border-glass); -webkit-backdrop-filter: var(--vmc-glass-blur); backdrop-filter: var(--vmc-glass-blur); }
.hp-arrow { display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 50%; background-color: transparent; color: var(--vmc-color-base-white); cursor: pointer; transition: background-color .2s; }
.hp-arrow:hover { background-color: rgba(255,255,255,.18); }
.hp-arrow:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }
/* Versiones del indicador del carrusel (control QA «Banner · indicador»). */
.hp-dots { position: absolute; left: 50%; bottom: 14px; z-index: 5; display: flex; align-items: center; gap: 6px; padding: 6px 8px; transform: translateX(-50%);
  border-radius: var(--vmc-radius-full); background: rgba(16,0,48,0.28); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.hp-dot { width: 7px; height: 7px; padding: 0; border: 0; border-radius: var(--vmc-radius-full); background: rgba(255,255,255,0.5); cursor: pointer; transition: width 0.3s ease, background 0.3s; }
.hp-dot.on { width: 20px; background: var(--vmc-color-base-white); }
.hp-bars { position: absolute; top: 10px; left: 16px; right: 16px; z-index: 5; display: flex; gap: 6px; }
.hp-bar { position: relative; flex: 1; height: 16px; padding: 0; border: 0; background: none; cursor: pointer; }
.hp-bar::before, .hp-bar i { content: ""; position: absolute; left: 0; top: 6px; height: 3px; border-radius: 2px; }
.hp-bar::before { right: 0; background: rgba(255,255,255,0.35); }
.hp-bar i { width: 0; background: var(--vmc-color-base-white); }
.hp-bar.done i { width: 100%; }
.hp-bar.on i { animation: hp-fill var(--dur) linear forwards; }
.hp.paused .hp-bar.on i { animation-play-state: paused; }
@keyframes hp-fill { to { width: 100%; } }
.hp-count { padding: 0 6px; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 0.02em; white-space: nowrap; }
.hp-count small { font-size: 12px; font-weight: 600; opacity: 0.7; }
.hp-side { position: absolute; top: 50%; z-index: 5; display: grid; place-items: center; width: 36px; height: 36px; margin-top: -18px; padding: 0; border-radius: 50%;
  color: var(--vmc-color-base-white); background: var(--vmc-color-glass-dark); border: var(--vmc-border-glass); -webkit-backdrop-filter: var(--vmc-glass-blur); backdrop-filter: var(--vmc-glass-blur);
  cursor: pointer; opacity: 0; transition: opacity 0.2s, background-color 0.2s; }
.hp-side.prev { left: 10px; } .hp-side.next { right: 10px; }
.hp:hover .hp-side, .hp:focus-within .hp-side { opacity: 1; }
.hp-side:hover { background-color: rgba(255,255,255,0.22); }
@media (hover: none) { .hp-side { opacity: 1; } }
/* Indicadores en vidrio, como el botón del banner (hib-glass): blanco translúcido + blur + borde degradado VYStrokes1. */
.hp-ctrl, .hp-dots, .hp-side { border: 0; background-color: transparent;
  background-image: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.03) 100%);
  -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
  box-shadow: rgba(0,0,0,0.1) 0 8px 24px, inset 0 1px 6px rgba(255,255,255,0.45); }
.hp-ctrl::before, .hp-dots::before, .hp-side::before { content: ""; position: absolute; inset: 0; padding: 1.5px; border-radius: inherit; pointer-events: none;
  background: linear-gradient(94deg, #FFFFFF 0%, #F4AC59 22.1%, #8460E5 74.5%, #FFFFFF 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.hp-ctrl { padding: 3px 5px; }
.hp-dots { padding: 7px 10px; }
.hp-side:hover { background-color: rgba(255,255,255,0.1); box-shadow: rgba(0,0,0,0.16) 0 12px 28px, inset 0 1px 8px rgba(255,255,255,0.6); }
.hp-side:active { background-color: rgba(32,0,104,0.22); }
.hp-arrow, .hp-count, .hp-side { text-shadow: rgba(0,0,0,0.25) 0 1px 3px; }
/* Pestañas con nombre: segmentado de vidrio; la activa en blanco con una línea de progreso. */
.hp-tabs { position: absolute; top: 12px; right: 12px; z-index: 5; display: flex; gap: 2px; padding: 3px; border-radius: var(--vmc-radius-full); }
.hp-tab { position: relative; height: 26px; padding: 0 12px; overflow: hidden; border: 0; border-radius: var(--vmc-radius-full); background: transparent; cursor: pointer;
  font: 700 11px/1 var(--vmc-font-display); color: rgba(255,255,255,0.85); text-shadow: rgba(0,0,0,0.25) 0 1px 3px; transition: background 0.25s, color 0.25s; }
.hp-tab:hover { color: #fff; background: rgba(255,255,255,0.12); }
.hp-tab.on { color: #3B1782; background: #fff; text-shadow: none; box-shadow: rgba(32,0,104,0.18) 0 2px 8px; }
.hp-tab i { position: absolute; left: 10px; right: 10px; bottom: 3px; height: 2px; border-radius: 2px; background: rgba(59,23,130,0.15); }
.hp-tab i::after { content: ""; position: absolute; inset: 0; width: 0; border-radius: inherit; background: #ED8936; animation: hp-fill var(--dur) linear forwards; }
.hp.paused .hp-tab i::after { animation-play-state: paused; }
/* Siguiente con vista previa: miniatura + nombre de la que viene; el anillo se llena hasta el cambio. */
.hp-next { position: absolute; top: 12px; right: 12px; z-index: 5; display: grid; grid-template-columns: 44px auto 32px; align-items: center; gap: 10px;
  padding: 5px 5px 5px 5px; border-radius: 14px; color: #fff; cursor: pointer; text-align: left; font-family: var(--vmc-font-display); }
.hp-next__thumb { width: 44px; height: 32px; overflow: hidden; border-radius: 9px; background: rgba(255,255,255,0.2); }
.hp-next__thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
.hp-next__txt { display: grid; gap: 2px; padding-right: 2px; text-shadow: rgba(0,0,0,0.25) 0 1px 3px; }
.hp-next__txt small { font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; opacity: 0.8; }
.hp-next__txt b { font-size: 12px; font-weight: 700; white-space: nowrap; }
.hp-next__go { position: relative; display: grid; place-items: center; width: 32px; height: 32px; }
.hp-next__go svg.ring { position: absolute; inset: 0; transform: rotate(-90deg); }
.hp-next__go .ring circle { fill: none; stroke-width: 2.5; }
.hp-next__go .ring .track { stroke: rgba(255,255,255,0.3); }
.hp-next__go .ring .prog { stroke: #fff; stroke-dasharray: 88; stroke-dashoffset: 88; stroke-linecap: round; animation: hp-ring var(--dur) linear forwards; }
.hp.paused .hp-next__go .ring .prog { animation-play-state: paused; }
@keyframes hp-ring { to { stroke-dashoffset: 0; } }
.hp-next:hover { box-shadow: rgba(0,0,0,0.16) 0 12px 28px, inset 0 1px 8px rgba(255,255,255,0.6); }
.hp-tab:focus-visible, .hp-next:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.hp-tabs, .hp-next { border: 0; background-color: transparent;
  background-image: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.03) 100%);
  -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); box-shadow: rgba(0,0,0,0.1) 0 8px 24px, inset 0 1px 6px rgba(255,255,255,0.45); }
.hp-tabs::before, .hp-next::before { content: ""; position: absolute; inset: 0; padding: 1.5px; border-radius: inherit; pointer-events: none;
  background: linear-gradient(94deg, #FFFFFF 0%, #F4AC59 22.1%, #8460E5 74.5%, #FFFFFF 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
@media (prefers-reduced-motion: reduce) { .hp-tab i::after, .hp-next__go .ring .prog { animation: none; } }
/* Editorial (ref. Showreel): ANTERIOR / SIGUIENTE verticales en los bordes, número grande y nombres separados por «/». */
.hp-ed-side { position: absolute; top: 50%; z-index: 5; padding: 10px 6px; border: 0; background: none; cursor: pointer; writing-mode: vertical-rl;
  font: 700 10px/1 var(--vmc-font-display); letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.72); text-shadow: rgba(0,0,0,0.3) 0 1px 3px; transition: color 0.2s; }
.hp-ed-side.prev { left: 6px; transform: translateY(-50%) rotate(180deg); }
.hp-ed-side.next { right: 6px; transform: translateY(-50%); }
.hp-ed-side:hover { color: #fff; }
.hp-ed-num { position: absolute; top: 12px; right: 32px; z-index: 5; display: flex; align-items: baseline; gap: 3px; color: #fff; text-shadow: rgba(0,0,0,0.3) 0 1px 4px; font-family: var(--vmc-font-display); }
.hp-ed-num b { font-size: 30px; line-height: 1; font-weight: 300; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; animation: hp-num 0.55s cubic-bezier(0.2,0.8,0.2,1) both; }
.hp-ed-num small { font-size: 11px; font-weight: 600; opacity: 0.7; }
@keyframes hp-num { from { opacity: 0; transform: translateY(10px); } }
.hp-ed-list { position: absolute; right: 32px; bottom: 12px; z-index: 5; display: flex; align-items: center; gap: 8px; font: 700 10px/1 var(--vmc-font-display);
  letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.45); text-shadow: rgba(0,0,0,0.3) 0 1px 3px; }
.hp-ed-list button { position: relative; padding: 5px 0; border: 0; background: none; font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; cursor: pointer; transition: color 0.2s; }
.hp-ed-list button:hover, .hp-ed-list button.on { color: #fff; }
.hp-ed-list button.on::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: #fff; transform-origin: left; animation: hp-line 0.5s ease both; }
@keyframes hp-line { from { transform: scaleX(0); } }
.hp-ed-list i { font-style: normal; }
/* Muestras (ref. Coffee): columna de círculos con el color de cada diapositiva, fracción con barra diagonal y flechas ↑ ↓. */
.hp-sw { position: absolute; top: 50%; right: 18px; z-index: 5; display: flex; flex-direction: column; gap: 11px; transform: translateY(-50%); }
.hp-sw button { width: 14px; height: 14px; padding: 0; border: 2px solid rgba(255,255,255,0.7); border-radius: 50%; background: rgba(255,255,255,0.25); cursor: pointer;
  box-shadow: rgba(0,0,0,0.25) 0 2px 6px; transition: transform 0.25s cubic-bezier(0.3,0,0,1), border-color 0.25s, box-shadow 0.25s; }
.hp-sw button:hover { transform: scale(1.12); }
.hp-sw button.on { transform: scale(1.3); border-color: #fff; background: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.28), rgba(0,0,0,0.3) 0 3px 8px; }
.hp-frac { position: absolute; top: 12px; right: 16px; z-index: 5; width: 46px; height: 34px; color: #fff; font-family: var(--vmc-font-display); text-shadow: rgba(0,0,0,0.3) 0 1px 3px; }
.hp-frac b { position: absolute; left: 0; top: 0; font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; animation: hp-num 0.5s ease both; }
.hp-frac small { position: absolute; right: 0; bottom: 0; font-size: 11px; font-weight: 600; opacity: 0.7; }
.hp-frac i { position: absolute; left: 50%; top: 50%; width: 1px; height: 30px; background: rgba(255,255,255,0.75); transform: translate(-50%, -50%) rotate(38deg); }
.hp-updown { position: absolute; right: 16px; bottom: 10px; z-index: 5; display: flex; flex-direction: column; gap: 2px; }
.hp-updown button { display: grid; place-items: center; width: 26px; height: 24px; padding: 0; border: 0; background: none; color: rgba(255,255,255,0.8); cursor: pointer;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35)); transition: color 0.2s, transform 0.2s; }
.hp-updown button:hover { color: #fff; }
.hp-updown button:first-child:hover { transform: translateY(-2px); } .hp-updown button:last-child:hover { transform: translateY(2px); }
/* Fracción (ref. Discover): «02/03» en naranja bajo el título y puntos con borde abajo a la izquierda. */
.hp-frac2 { font: 700 13px/1 var(--vmc-font-display); letter-spacing: 0.08em; color: rgba(255,255,255,0.7); font-variant-numeric: tabular-nums; }
.hp-frac2 b { color: #FFC995; }
.hp-odots { position: absolute; left: 36px; bottom: 16px; z-index: 5; display: flex; gap: 9px; }
.hp-odots button { width: 9px; height: 9px; padding: 0; border: 1.5px solid rgba(255,255,255,0.75); border-radius: 50%; background: transparent; cursor: pointer; transition: background 0.25s, border-color 0.25s, transform 0.25s; }
.hp-odots button:hover { transform: scale(1.2); }
.hp-odots button.on { border-color: #FFC995; background: #FFC995; }
/* Flechas finas (ref. Yozenn): chevrones delgados a los lados, sin fondo. */
.hp-thin { position: absolute; top: 50%; z-index: 5; display: grid; place-items: center; width: 34px; height: 54px; margin-top: -27px; padding: 0; border: 0; background: none;
  color: #fff; cursor: pointer; opacity: 0.85; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4)); transition: opacity 0.2s, transform 0.25s cubic-bezier(0.3,0,0,1); }
.hp-thin.prev { left: 4px; } .hp-thin.next { right: 4px; }
.hp-thin:hover { opacity: 1; } .hp-thin.prev:hover { transform: translateX(-3px); } .hp-thin.next:hover { transform: translateX(3px); }
.hp-ed-side:focus-visible, .hp-ed-list button:focus-visible, .hp-sw button:focus-visible, .hp-updown button:focus-visible, .hp-odots button:focus-visible, .hp-thin:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
/* Montaña de vidrio (ref. tarjeta promo): pestaña con hombros curvos que sube desde el borde inferior, en vidrio, con los
   puntos adentro (el activo se alarga). La forma es un clip-path; el borde claro de arriba es un SVG con la misma curva. */
.hp-mtn { position: absolute; left: 50%; bottom: 0; z-index: 5; width: 132px; height: 26px; transform: translateX(-50%); }
/* El recorte va en el contenedor: en Chromium el blur del vidrio no respeta un clip-path puesto en el mismo elemento. */
.hp-mtn__clip { position: absolute; inset: 0; overflow: hidden; clip-path: path("M0 26C22 26 26 2 48 2H84C106 2 110 26 132 26Z"); }
.hp-mtn__glass { position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.16) 100%); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.hp-mtn__edge { position: absolute; inset: 0; overflow: visible; pointer-events: none; }
.hp-mtn__edge path { fill: none; stroke: rgba(255,255,255,0.75); stroke-width: 1.2; }
.hp-mtn__dots { position: absolute; left: 50%; top: 11px; display: flex; align-items: center; gap: 6px; transform: translateX(-50%); }
.hp-mtn__dots button { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 999px; background: rgba(255,255,255,0.6); cursor: pointer;
  box-shadow: rgba(32,0,104,0.25) 0 1px 2px; transition: width 0.3s ease, background 0.3s; }
.hp-mtn__dots button.on { width: 18px; background: #fff; }
.hp-mtn__dots button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
/* Con navegación a los lados, el texto se corre para no quedar debajo. */
.hp--editorial .hp-copy.left, .hp--thin .hp-copy.left { left: 48px; } .hp--editorial .hp-copy.right, .hp--thin .hp-copy.right { right: 48px; }

/* Efectos de texto al entrar la diapositiva (control «Banner · texto»); la foto hace un zoom lento salvo «Sin efecto». */
.hp-slide.on .hp-photo img { animation: hp-kb 7.5s ease-out both; }
@keyframes hp-kb { from { transform: scaleX(var(--fx, 1)) scale(1.08); } to { transform: scaleX(var(--fx, 1)); } }
.hp--fx-none .hp-slide.on .hp-photo img { animation: none; }
.hp--fx-rise .hp-slide.on .hp-copy > *, .hp--fx-letters .hp-slide.on .hp-copy > :not(.hp-h) { animation: hp-rise 0.7s cubic-bezier(0.2,0.8,0.2,1) both; }
.hp--fx-blur .hp-slide.on .hp-copy > * { animation: hp-blur 0.8s ease both; }
.hp--fx-mask .hp-slide.on .hp-copy > * { animation: hp-mask 0.75s cubic-bezier(0.7,0,0.2,1) both; }
.hp-slide.on .hp-copy > :nth-child(2) { animation-delay: 0.08s; }
.hp-slide.on .hp-copy > :nth-child(3) { animation-delay: 0.16s; }
.hp-slide.on .hp-copy > :nth-child(4) { animation-delay: 0.24s; }
.hp-slide.on .hp-copy > :nth-child(5) { animation-delay: 0.32s; }
.hp--fx-letters .hp-slide.on .hp-copy > :nth-child(n+3) { animation-delay: 0.45s; }
.hp--fx-letters .hp-slide.on .hp-copy > :nth-child(n+4) { animation-delay: 0.55s; }
.hp--fx-letters .hp-slide.on .hp-copy > :nth-child(n+5) { animation-delay: 0.62s; }
@keyframes hp-rise { from { opacity: 0; transform: translateY(18px); } }
@keyframes hp-blur { from { opacity: 0; filter: blur(10px); transform: scale(1.03); } }
@keyframes hp-mask { from { clip-path: inset(0 0 100% 0); transform: translateY(40%); } to { clip-path: inset(0 0 0 0); transform: none; } }
/* Letras: cada letra del título sube y se enfoca, en cascada. */
.hp-word { display: inline-block; white-space: nowrap; }
.hp-ch { display: inline-block; }
.hp--fx-letters .hp-slide.on .hp-ch { animation: hp-ch 0.6s cubic-bezier(0.2,0.8,0.2,1) both; animation-delay: calc(var(--i) * 22ms); }
@keyframes hp-ch { from { opacity: 0; transform: translateY(0.55em) rotate(8deg); filter: blur(4px); } }
.hp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .hp-slide.on .hp-photo img, .hp-slide.on .hp-copy > *, .hp--fx-letters .hp-slide.on .hp-ch, .hp-ed-num b, .hp-frac b, .hp-ed-list button.on::after { animation: none !important; }
}
.hp--sides .hp-copy.left { left: 60px; } .hp--sides .hp-copy.right { right: 60px; }
.hp-dot:focus-visible, .hp-bar:focus-visible, .hp-side:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .hp-bar.on i { animation: none; width: 100%; } .hp-dot { transition: none; } }
@container hp (max-width: 960px) { .hp-copy { width: 50%; } .hp-h { font-size: var(--vmc-font-size-title); line-height: var(--vmc-line-height-title); } .hp-lot { width: 200px; right: 16px; bottom: 16px; } }
@container hp (max-width: 700px) {
  .hp-photo { width: 100%; opacity: .6; left: 0; right: 0; }
  .hp-photo.full { opacity: 1; } /* tomas con la izquierda libre: no hace falta lavarlas */
  .hp-slide:has(.hp-photo.full) .hp-copy { width: 58%; }
  .hp-slide:has(.hp-photo.full--l) .hp-copy { left: auto; right: 20px; }
  .hp-copy, .hp-copy.right { left: 20px; right: auto; width: calc(100% - 40px); }
  .hp--sides .hp-copy, .hp--sides .hp-copy.right { left: 54px; width: calc(100% - 108px); }
  .hp--editorial .hp-copy, .hp--editorial .hp-copy.right, .hp--thin .hp-copy, .hp--thin .hp-copy.right { left: 40px; width: calc(100% - 80px); }
  .hp-odots { left: 20px; }
  .hp-lot { display: none; }
}
/* Celular (tomas a lo ancho): la foto arriba, con el velo en vertical, y el texto compacto abajo, sobre los puntos. */
@container hp (max-width: 480px) {
  .hp-photo.full img { width: 100%; object-position: 82% 18% !important; }
  .hp-photo.full--l img { object-position: 18% 18% !important; }
  .hp-photo.full--l::after { transform: none; }
  .hp-photo.full::after { background: linear-gradient(180deg, rgba(42,22,112,0) 18%, rgba(34,16,92,0.72) 50%, rgba(28,12,80,0.96) 100%); }
  .hp-slide:has(.hp-photo.full) .hp-copy { left: 18px; right: 18px; width: auto; justify-content: flex-end; gap: 8px; padding-bottom: 46px; }
  .hp-slide:has(.hp-photo.full) .hp-h { font-size: 23px; line-height: 27px; }
  .hp-slide:has(.hp-photo.full) .hp-p { font-size: 13px; line-height: 18px; max-width: 34ch; }
  .hp-slide:has(.hp-photo.full) .hib-glass { height: 34px; padding: 0 22px; font-size: 14px; }
}

${GLASS_CSS}
`;

const TimerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 22 22" fill="none" aria-hidden><path d="M4.63973 10C5.09082 6.38255 8.17668 3.58333 11.9163 3.58333C15.9664 3.58333 19.2496 6.86658 19.2496 10.9167C19.2496 14.9668 15.9664 18.25 11.9163 18.25H7.33333M11.9167 10.9167V7.25M10.0833 1.75H13.75M2.75 12.75H7.33333M4.58333 15.5H9.16667" stroke="#FFE2C2" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Chevron = ({ dir }: { dir: "prev" | "next" }) => (
  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d={dir === "prev" ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** Cuenta regresiva del lote destacado (empieza en 01:15:27). */
function useCountdown(start: number): string {
  const [left, setLeft] = useState(start);
  useEffect(() => { const t = setInterval(() => setLeft((n) => (n > 0 ? n - 1 : start)), 1000); return () => clearInterval(t); }, [start]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
}

export type BannerNav = "plain" | "tabs" | "dots" | "bars" | "counter" | "sides" | "next" | "editorial" | "swatch" | "fraction" | "thin";
export const BANNER_NAVS: { id: BannerNav; label: string; hint: string }[] = [
  { id: "tabs", label: "Pestañas con nombre", hint: "En vivo · Vende · Negocia, con progreso" },
  { id: "dots", label: "Puntos", hint: "Abajo al centro; el activo se alarga" },
  { id: "bars", label: "Barras de historia", hint: "Arriba; se llenan con el tiempo" },
  { id: "counter", label: "Contador", hint: "‹ 1 / 3 › arriba a la derecha" },
  { id: "sides", label: "Flechas laterales", hint: "Aparecen al pasar el mouse, con puntos" },
  { id: "next", label: "Siguiente con vista previa", hint: "Miniatura de la que viene y anillo de tiempo" },
  { id: "editorial", label: "Editorial", hint: "Ref. Showreel: Anterior / Siguiente verticales, número grande" },
  { id: "swatch", label: "Muestras", hint: "Ref. Coffee: puntos en columna, 02 / 03 y flechas ↑ ↓" },
  { id: "fraction", label: "Fracción y puntos", hint: "Ref. Discover: 02/03 bajo el título, puntos abajo" },
  { id: "thin", label: "Flechas finas", hint: "Ref. Yozenn: chevrones delgados, sin fondo" },
  { id: "plain", label: "Montaña de vidrio", hint: "Ref. tarjeta promo: pestaña curva de vidrio en el borde inferior, con puntos" },
];
export type BannerFx = "letters" | "rise" | "blur" | "mask" | "none";
export const BANNER_FXS: { id: BannerFx; label: string; hint: string }[] = [
  { id: "letters", label: "Letras", hint: "El título entra letra por letra" },
  { id: "rise", label: "Subir en cascada", hint: "Pill, título, texto y botón suben en orden" },
  { id: "blur", label: "Desenfoque", hint: "Aparece enfocándose" },
  { id: "mask", label: "Revelar", hint: "Cada línea se descubre desde abajo" },
  { id: "none", label: "Sin efecto", hint: "Solo el fundido entre diapositivas" },
];
const pad2 = (n: number) => String(n).padStart(2, "0");
/** Parte el título en palabras y letras (para el efecto «Letras»); conserva <em> y <br>. */
function Letters({ children }: { children: ReactNode }): JSX.Element {
  let n = 0;
  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return node.split(/(\s+)/).map((w, k) => (/^\s+$/.test(w) || !w ? w
        : <span key={k} className="hp-word">{[...w].map((c, j) => <span key={j} className="hp-ch" style={{ "--i": n++ } as CSSProperties}>{c}</span>)}</span>));
    }
    if (Array.isArray(node)) return node.map((c, k) => <Fragment key={k}>{walk(c)}</Fragment>);
    if (isValidElement<{ children?: ReactNode }>(node)) return cloneElement(node, undefined, walk(node.props.children));
    return node;
  };
  return <>{walk(children)}</>;
}
// Texto plano del título (para lectores de pantalla cuando se parte en letras).
const plain = (node: ReactNode): string =>
  typeof node === "string" ? node : Array.isArray(node) ? node.map(plain).join("")
    : isValidElement<{ children?: ReactNode }>(node) ? (node.type === "br" ? " " : plain(node.props.children)) : "";
// Nombre corto de cada diapositiva (pestañas y vista previa).
const SHORT: Record<HeroSlide["pill"], string> = { live: "En vivo", seller: "Vende", negotiable: "Recibe ofertas", whatsapp: "Entérate" };

const PILL: Record<HeroSlide["pill"], string> = { live: "En vivo", seller: "Publica en VMC", negotiable: "Recibe ofertas", whatsapp: "Canal de WhatsApp" };
const WhatsAppGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4s-1.1-1.5-1.1-2.8 .7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.4Z" /></svg>
);

function PrincipalBanner({ nav = "plain", fx = "letters" }: { nav?: BannerNav; fx?: BannerFx }): JSX.Element {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useCountdown(1 * 3600 + 15 * 60 + 27);
  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused]);
  const [ver, setVer] = useState(() => SLIDES.map(() => 0));
  const prev = useRef(0);
  useEffect(() => { // la slide que se va pasa a su siguiente variación, ya oculta (tras el fundido de .5 s de .hp-slide)
    const p = prev.current; prev.current = index;
    if (p === index) return;
    const t = setTimeout(() => setVer((v) => v.map((x, i) => (i === p ? x + 1 : x))), 600);
    return () => clearTimeout(t);
  }, [index]);
  const foto = (i: number) => SLIDES[i].photo.src[ver[i] % SLIDES[i].photo.src.length];
  return (
    <section className={`hp hp--${nav} hp--fx-${fx}${paused ? " paused" : ""}`} aria-roledescription="carrusel" aria-label="Destacados"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}>
      {SLIDES.map((sl, i) => (
        <div key={sl.cta} className={`hp-slide${i === index ? " on" : ""}`} role="group" aria-roledescription="diapositiva"
          aria-label={`${i + 1} de ${SLIDES.length}: ${sl.label}`} aria-hidden={i !== index} inert={i !== index}>
          <div className="hp-bg" style={{ background: sl.bg }} />
          <div className={`hp-photo ${sl.photo.width === "100%" ? `full full--${sl.photo.side}${sl.photo.alto ? " full--alto" : ""}` : sl.photo.side}`} style={{ "--pw": sl.photo.width, ...sl.photo.style } as CSSProperties}>
            <img src={foto(i)} alt="" style={{ objectPosition: sl.photo.position, ...(sl.photo.flip ? { "--fx": -1 } : {}) } as CSSProperties} />
          </div>
          <div className={`hp-copy ${sl.copy}`}>
            {sl.pill === "live" ? <BadgeStatus variant="live" />
              : <span className={`hp-label hp-label--${sl.pill}`}>{sl.pill === "negotiable" ? <TagIcon /> : sl.pill === "whatsapp" ? <WhatsAppGlyph /> : null}{PILL[sl.pill]}</span>}
            {fx === "letters"
              ? <h2 className="hp-h"><span className="hp-sr">{plain(sl.title)}</span><span aria-hidden><Letters>{sl.title}</Letters></span></h2>
              : <h2 className="hp-h">{sl.title}</h2>}
            {nav === "fraction" ? <span className="hp-frac2" aria-hidden><b>{pad2(i + 1)}</b>/{pad2(SLIDES.length)}</span> : null}
            <p className="hp-p">{sl.lead}</p>
            <button type="button" className="hib-glass">{sl.cta}</button>
          </div>
          {sl.lot ? (
            <div className="hp-lot">
              <small>Lote destacado</small><strong>Toyota Yaris 2022</strong>
              <span className="price"><span>US$</span>2,799</span>
              <span className="timer"><TimerIcon />Cierra en {timer}</span>
            </div>
          ) : null}
        </div>
      ))}
      {nav === "editorial" ? (
        <>
          <button type="button" className="hp-ed-side prev" onClick={() => go(-1)}>Anterior</button>
          <button type="button" className="hp-ed-side next" onClick={() => go(1)}>Siguiente</button>
          <div className="hp-ed-num" aria-hidden><b key={index}>{pad2(index + 1)}</b><small>/ {pad2(SLIDES.length)}</small></div>
          <div className="hp-ed-list" role="group" aria-label="Elegir diapositiva">
            {SLIDES.map((sl, i) => (
              <span key={sl.cta} style={{ display: "contents" }}>
                {i > 0 ? <i aria-hidden>/</i> : null}
                <button type="button" className={i === index ? "on" : undefined} aria-current={i === index} onClick={() => setIndex(i)}>{SHORT[sl.pill]}</button>
              </span>
            ))}
          </div>
        </>
      ) : nav === "swatch" ? (
        <>
          <div className="hp-frac" aria-hidden><b key={index}>{pad2(index + 1)}</b><i /><small>{pad2(SLIDES.length)}</small></div>
          <div className="hp-sw" role="group" aria-label="Elegir diapositiva">
            {SLIDES.map((sl, i) => (
              <button key={sl.cta} type="button" className={i === index ? "on" : undefined} aria-label={`Ir a la diapositiva ${i + 1}: ${SHORT[sl.pill]}`} aria-current={i === index} onClick={() => setIndex(i)} />
            ))}
          </div>
          <div className="hp-updown">
            <button type="button" aria-label="Anterior" onClick={() => go(-1)}><svg width="14" height="16" viewBox="0 0 14 16" aria-hidden><path d="M7 15V2M2 6.5L7 1.5l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <button type="button" aria-label="Siguiente" onClick={() => go(1)}><svg width="14" height="16" viewBox="0 0 14 16" aria-hidden><path d="M7 1v13M2 9.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>
        </>
      ) : nav === "fraction" ? (
        <div className="hp-odots" role="group" aria-label="Elegir diapositiva">
          {SLIDES.map((sl, i) => (
            <button key={sl.cta} type="button" className={i === index ? "on" : undefined} aria-label={`Ir a la diapositiva ${i + 1}: ${SHORT[sl.pill]}`} aria-current={i === index} onClick={() => setIndex(i)} />
          ))}
        </div>
      ) : nav === "plain" ? (
        <div className="hp-mtn">
          <span className="hp-mtn__clip" aria-hidden><span className="hp-mtn__glass" /></span>
          <svg className="hp-mtn__edge" viewBox="0 0 132 26" aria-hidden><path d="M0 26C22 26 26 2 48 2H84C106 2 110 26 132 26" /></svg>
          <div className="hp-mtn__dots" role="group" aria-label="Elegir diapositiva">
            {SLIDES.map((sl, i) => (
              <button key={sl.cta} type="button" className={i === index ? "on" : undefined} aria-label={`Ir a la diapositiva ${i + 1}: ${SHORT[sl.pill]}`} aria-current={i === index} onClick={() => setIndex(i)} />
            ))}
          </div>
        </div>
      ) : nav === "thin" ? (
        <>
          <button type="button" className="hp-thin prev" aria-label="Anterior" onClick={() => go(-1)}><svg width="16" height="34" viewBox="0 0 16 34" aria-hidden><path d="M14 2L2.5 17 14 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button type="button" className="hp-thin next" aria-label="Siguiente" onClick={() => go(1)}><svg width="16" height="34" viewBox="0 0 16 34" aria-hidden><path d="M2 2l11.5 15L2 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </>
      ) : nav === "counter" ? (
        <div className="hp-ctrl" role="group" aria-label="Navegar destacados">
          <button type="button" className="hp-arrow" aria-label="Anterior" onClick={() => go(-1)}><Chevron dir="prev" /></button>
          <span className="hp-count" aria-live="polite">{index + 1} <small>/ {SLIDES.length}</small></span>
          <button type="button" className="hp-arrow" aria-label="Siguiente" onClick={() => go(1)}><Chevron dir="next" /></button>
        </div>
      ) : nav === "tabs" ? (
        <div className="hp-tabs" role="group" aria-label="Elegir diapositiva" style={{ "--dur": `${AUTOPLAY_MS}ms` } as CSSProperties}>
          {SLIDES.map((sl, i) => (
            <button key={sl.cta} type="button" className={`hp-tab${i === index ? " on" : ""}`} aria-current={i === index} onClick={() => setIndex(i)}>
              {SHORT[sl.pill]}{i === index ? <i key={index} aria-hidden /> : null}
            </button>
          ))}
        </div>
      ) : nav === "next" ? (
        <button type="button" className="hp-next" aria-label={`Siguiente: ${SLIDES[(index + 1) % SLIDES.length].label}`} onClick={() => go(1)}
          style={{ "--dur": `${AUTOPLAY_MS}ms` } as CSSProperties}>
          <span className="hp-next__thumb"><img src={foto((index + 1) % SLIDES.length)} alt="" /></span>
          <span className="hp-next__txt"><small>Siguiente</small><b>{SHORT[SLIDES[(index + 1) % SLIDES.length].pill]}</b></span>
          <span className="hp-next__go" aria-hidden>
            <svg className="ring" width="32" height="32" viewBox="0 0 32 32"><circle className="track" cx="16" cy="16" r="14" /><circle key={index} className="prog" cx="16" cy="16" r="14" /></svg>
            <Chevron dir="next" />
          </span>
        </button>
      ) : nav === "bars" ? (
        <div className="hp-bars" role="group" aria-label="Elegir diapositiva" style={{ "--dur": `${AUTOPLAY_MS}ms` } as CSSProperties}>
          {SLIDES.map((sl, i) => (
            <button key={sl.cta} type="button" className={`hp-bar${i === index ? " on" : i < index ? " done" : ""}`} aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)}><i key={`${index}-${i}`} /></button>
          ))}
        </div>
      ) : (
        <>
          {nav === "sides" ? (
            <>
              <button type="button" className="hp-side prev" aria-label="Anterior" onClick={() => go(-1)}><Chevron dir="prev" /></button>
              <button type="button" className="hp-side next" aria-label="Siguiente" onClick={() => go(1)}><Chevron dir="next" /></button>
            </>
          ) : null}
          <div className="hp-dots" role="group" aria-label="Elegir diapositiva">
            {SLIDES.map((sl, i) => (
              <button key={sl.cta} type="button" className={`hp-dot${i === index ? " on" : ""}`} aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)} />
            ))}
          </div>
        </>
      )}
      <style>{HERO_CSS}</style>
    </section>
  );
}

// Banner de campaña 766 × 168 (el del bloque es 100 de alto; aquí crece para que entre el contenido).
const BANNER_HEIGHT = 204; // con aire arriba y abajo: el copy y el panel de beneficios no tocan los bordes
// Íconos de vidrio (set de mi-garaje-lab): sólido detrás, vidrio delante y detalle en blanco.
// Campañas del banner secundario (pedido de Julio, 26/10): Valoriza tu auto y Publica tu moto (Subastop «Venta para empresas» retirada, 27/10).
// Copy de las plantillas venta-empresa.html y publica-vmc.html (VMC-Laptop); `cut` = PNG recortado, si no la foto va en panel.
type Campaign = { id: "valoriza" | "moto"; label: string; hint: string; eyebrow: string; title: JSX.Element; aria: string; lead: string; cta: string;
  img: string; pos?: string; fondo: { pos: string; bg: string }; cut?: boolean; points: { icon: VidrioName; text: string }[] };
const CAMPAIGNS: Campaign[] = [
  { id: "valoriza", label: "Valoriza tu auto", hint: "Valor estimado en VMC", eyebrow: "Valoriza en VMC", aria: "Cuánto vale tu auto",
    title: <>¿Cuánto <em>vale</em> tu auto?</>, lead: "Responde unas preguntas y conoce el valor estimado de tu auto.", cta: "Valoriza tu auto",
    img: "/producto/index/banners/vmc/campana-valor.jpg", pos: "68% 28%",
    fondo: { pos: "65% 25%", bg: "linear-gradient(100deg, #2A1670 0%, #3D2299 45%, #403566 100%)" }, points: [
      { icon: "valorizaciones", text: "Valor estimado en minutos" },
      { icon: "auto", text: "Con datos reales del mercado de autos" },
      { icon: "publicar", text: "Guarda el resultado y publícalo cuando quieras" },
    ] },
  { id: "moto", label: "Publica tu moto", hint: "Recibe propuestas en VMC", eyebrow: "Publica en VMC", aria: "Vendes tu moto",
    title: <>¿Vendes tu moto? <em>Publícala</em> en VMC</>, lead: "Los compradores te hacen propuestas y tú decides cuál aceptar.", cta: "Publica tu moto",
    img: "/producto/index/banners/vmc/campana-moto.jpg", pos: "70% 22%",
    fondo: { pos: "65% 18%", bg: "linear-gradient(100deg, #2A1670 0%, #3D2299 45%, #1B1442 100%)" }, points: [
      { icon: "publicar", text: "Publica en minutos desde tu celular" },
      { icon: "negociaciones", text: "Los compradores te hacen propuestas" },
      { icon: "precio", text: "Tú decides cuál aceptar" },
    ] },
];
type CampaignId = Campaign["id"];

// Foto en un panel redondeado (sin máscara que la ensucie con el lila), botón compacto de 40 px y
// beneficios separados por un filete. En móvil se apila: copy, foto y beneficios, con el CTA a lo ancho.
const CAMPAIGN_CSS = `
.hib-campaign { position: relative; box-sizing: border-box; width: 100%; height: ${BANNER_HEIGHT}px; overflow: hidden; border-radius: 16px;
  display: grid; grid-template-columns: 300px minmax(0, 1fr) 220px; align-items: center; gap: 16px; padding: 20px 14px;
  background: linear-gradient(100deg, #FFFFFF 0%, #F8F5FF 55%, #EFE9FF 100%); border: 1px solid #ECE6FB;
  box-shadow: ${SHADOW}; font-family: ${FONT}; }
.hib-campaign__copy { display: grid; justify-items: start; gap: 4px; padding-left: 14px; }
.hib-campaign__eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #5C38D6; }
.hib-campaign__eyebrow::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #8460E5; box-shadow: 0 0 0 3px #DCD2FB; }
.hib-campaign h2 { margin: 0; font-size: 20px; font-weight: 800; line-height: 23px; letter-spacing: -0.02em; color: #1B1442; text-wrap: balance; }
.hib-campaign p { margin: 0 0 8px; font-size: 12px; line-height: 16px; font-weight: 400; color: #6B6878; }
.hib-campaign .pvbtn { height: 40px; padding: 0 24px; font-size: 14px; }
.hib-campaign__media { position: relative; height: 100%; overflow: hidden; border-radius: 12px; }
.hib-campaign__media img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 60% 55%; transition: transform 600ms cubic-bezier(0.2,0,0,1); }
.hib-campaign:hover .hib-campaign__media img { transform: scale(1.04); }
.hib-campaign ul { display: grid; gap: 12px; margin: 0; padding: 0 10px 0 16px; list-style: none; border-left: 1px solid #DCD2FB; }
.hib-campaign li { display: grid; grid-template-columns: 28px 1fr; gap: 10px; align-items: center; font-size: 12px; line-height: 16px; font-weight: 500; color: #4A4560; }
@media (max-width: 1023px) {
  .hib-campaign { grid-template-columns: minmax(0, 1fr); height: auto; padding: 20px; gap: 16px; }
  .hib-campaign__copy { padding: 0; }
  .hib-campaign .pvbtn { width: 100%; }
  .hib-campaign__media { height: 160px; }
  .hib-campaign ul { padding: 16px 0 0; border-left: 0; border-top: 1px solid #DCD2FB; }
}
@media (prefers-reduced-motion: reduce) { .hib-campaign__media img { transition: none; } }
`;

// Variaciones con la excavadora recortada (sin fondo): «Recorte» suelta sobre el lila con sombra de piso,
// «Forma» sobre un círculo degradado naranja→morado (los colores del CTA) y «Protagonista», grande y
// pegada al borde derecho, con los beneficios en fila bajo el copy.
const CAMPAIGN_VARIANT_CSS = `
.hib-campaign--recorte .hib-campaign__media, .hib-campaign--forma .hib-campaign__media,
.hib-campaign--hero .hib-campaign__media { overflow: visible; border-radius: 0; align-self: stretch; }
.hib-campaign__media img.hib-campaign__cut { position: absolute; z-index: 1; left: 50%; top: 50%; width: auto; height: 118%; transform: translate(-50%, -50%); filter: drop-shadow(0 10px 12px rgba(27,20,66,0.18)); }
.hib-campaign--recorte .hib-campaign__media::before { content: ""; position: absolute; inset: 8% 6%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,255,255,0)); }
.hib-campaign--recorte .hib-campaign__media::after, .hib-campaign--hero .hib-campaign__media::after { content: ""; position: absolute; left: 18%; right: 14%; bottom: 4px; height: 14px;
  border-radius: 50%; background: radial-gradient(closest-side, rgba(27,20,66,0.22), rgba(27,20,66,0)); }
.hib-campaign--forma .hib-campaign__media::before { content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); height: 128%; aspect-ratio: 1; border-radius: 50%;
  background: linear-gradient(135deg, #F1ECFF 0%, #DCD0FF 100%); }
.hib-campaign--hero { grid-template-columns: minmax(0, 1fr) 420px; padding-left: 10px; }
.hib-campaign--hero .hib-campaign__media img.hib-campaign__cut { left: auto; top: auto; right: -24px; bottom: -6px; height: 128%; transform: none; }
.hib-campaign--hero .hib-campaign__media::before { content: ""; position: absolute; right: -40px; top: -30%; width: 120%; height: 160%; border-radius: 50%;
  background: radial-gradient(closest-side, #FFFFFF 0%, rgba(255,255,255,0) 100%); }
.hib-campaign--hero .hib-campaign__media::after { left: 20%; right: -10%; }
.hib-campaign--hero h2 { white-space: nowrap; font-size: 22px; line-height: 26px; }
.hib-campaign--hero .hib-campaign__copy > p { display: none; } /* los beneficios en fila ya hacen de bajada */
.hib-campaign--hero .hib-campaign__copy ul { display: flex; gap: 18px; padding: 0; margin: 6px 0 12px; border: 0; }
.hib-campaign--hero .hib-campaign__copy li { grid-template-columns: 22px 1fr; gap: 6px; font-size: 11px; line-height: 14px; max-width: 200px; }
.hib-campaign:hover .hib-campaign__media img.hib-campaign__cut { transform: translate(-50%, -50%) scale(1.03); }
.hib-campaign--hero:hover .hib-campaign__media img.hib-campaign__cut { transform: scale(1.03); transform-origin: right bottom; }
.hib-campaign__ico { display: grid; place-items: center; }
/* D y E: la excavadora pasa por detrás del panel de beneficios, que es vidrio esmerilado de verdad (backdrop-filter). */
.hib-campaign--overlap { grid-template-columns: 300px minmax(0, 1fr) 236px; }
.hib-campaign--overlap .hib-campaign__media { overflow: visible; border-radius: 0; align-self: stretch; }
.hib-campaign--overlap .hib-campaign__media img.hib-campaign__cut { left: auto; top: auto; right: -96px; bottom: -14px; height: 136%; transform: none; }
.hib-campaign--overlap:hover .hib-campaign__media img.hib-campaign__cut { transform: translateX(-6px); }
.hib-campaign--overlap ul { position: relative; z-index: 2; gap: 8px; padding: 12px; border: 1px solid rgba(255,255,255,0.7); border-radius: 14px;
  background: rgba(255,255,255,0.5); backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%);
  box-shadow: rgba(59,23,130,0.14) 0 12px 28px -10px, inset 0 1px 0 rgba(255,255,255,0.9); }
.hib-campaign--overlap li { grid-template-columns: 30px 1fr; font-size: 11.5px; line-height: 15px; }
.hib-campaign--overlap .hib-campaign__ico { width: 30px; height: 30px; border-radius: 50%; background: #fff; box-shadow: rgba(59,23,130,0.12) 0 2px 6px; }
/* D · Anillos: fondo claro lineal con dos anillos lila muy suaves detrás; panel de vidrio blanco sobre la máquina. */
.hib-campaign--glass { isolation: isolate; }
.hib-campaign--glass::before { content: ""; position: absolute; z-index: -1; top: -120px; left: 34%; width: 300px; height: 260px; border: 42px solid rgb(132 96 229 / 7%); border-radius: 50%; }
.hib-campaign--glass::after { content: ""; position: absolute; z-index: -1; right: -60px; bottom: -150px; width: 300px; height: 240px; border: 42px solid rgb(132 96 229 / 6%); border-radius: 50%; }
.hib-campaign--glass .hib-campaign__eyebrow { height: 20px; margin-bottom: 2px; padding: 0 10px 0 8px; border: 1px solid #fff; border-radius: 999px; background: rgba(255,255,255,0.7); box-shadow: rgba(59,23,130,0.1) 0 2px 8px; }
.hib-campaign--glass p { margin-bottom: 4px; }
.hib-campaign--glass .hib-campaign__media::after { content: ""; position: absolute; right: -40px; left: 30%; bottom: 0; height: 16px; border-radius: 50%; background: radial-gradient(closest-side, rgba(59,23,130,0.28), rgba(59,23,130,0)); }
@media (max-width: 1023px) {
  .hib-campaign--overlap { grid-template-columns: minmax(0, 1fr); }
  .hib-campaign--overlap .hib-campaign__media { height: 160px; }
  .hib-campaign--overlap .hib-campaign__media img.hib-campaign__cut { left: 50%; right: auto; top: 50%; bottom: auto; height: 110%; transform: translate(-50%, -50%); }
  .hib-campaign--overlap ul { margin-top: -28px; }
  .hib-campaign--glass .pvbtn { width: 100%; }
  .hib-campaign__media img.hib-campaign__cut { height: 110%; }
  .hib-campaign--hero h2 { white-space: normal; }
  .hib-campaign--hero .hib-campaign__copy > p { display: block; }
  .hib-campaign--hero .hib-campaign__media img.hib-campaign__cut { left: 50%; right: auto; top: 50%; bottom: auto; height: 110%; transform: translate(-50%, -50%); }
  .hib-campaign--hero .hib-campaign__media { height: 160px; }
  .hib-campaign--hero .hib-campaign__copy ul { flex-direction: column; gap: 8px; }
  .hib-campaign--hero .hib-campaign__copy li { max-width: none; font-size: 12px; }
}
`;
// Capa de riqueza para A, C y E (se aplica después de las variantes y las sobrescribe).
const CAMPAIGN_RICH_CSS = `
.hib-campaign h2 em { font-style: normal; }
.hib-campaign--recorte h2 em, .hib-campaign--hero h2 em, .hib-campaign--claro h2 em {
  background: linear-gradient(90deg, #ED8936 0%, #C4618F 50%, #8460E5 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hib-campaign--glass h2 em { background: linear-gradient(90deg, #ED8936 0%, #C4618F 50%, #8460E5 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hib-campaign--recorte, .hib-campaign--hero, .hib-campaign--claro { padding-block: 20px; }
.hib-campaign--recorte p, .hib-campaign--claro p { margin-bottom: 4px; }
.hib-campaign--recorte .hib-campaign__eyebrow, .hib-campaign--hero .hib-campaign__eyebrow, .hib-campaign--claro .hib-campaign__eyebrow {
  height: 20px; padding: 0 9px 0 7px; border: 1px solid #fff; border-radius: 999px; background: rgba(255,255,255,0.7);
  box-shadow: rgba(59,23,130,0.1) 0 2px 8px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }

/* A · Escenario: halo cálido y piso; beneficios en filas de vidrio. */
.hib-campaign--recorte .hib-campaign__media { background: radial-gradient(42% 58% at 50% 60%, rgba(132,96,229,0.16), rgba(132,96,229,0) 100%); }
.hib-campaign--recorte .hib-campaign__media::before { display: none; }
.hib-campaign--recorte .hib-campaign__media::after { left: 8%; right: 8%; bottom: 0; height: 26px; background: radial-gradient(closest-side, rgba(59,23,130,0.3), rgba(59,23,130,0)); }
.hib-campaign--recorte ul { gap: 6px; padding: 0; border: 0; }
.hib-campaign--recorte li, .hib-campaign--hero .hib-campaign__copy li { grid-template-columns: 26px 1fr; gap: 8px; padding: 6px 10px 6px 6px; font-size: 11.5px; line-height: 14px;
  border: 1px solid #fff; border-radius: 12px; background: rgba(255,255,255,0.62); box-shadow: rgba(59,23,130,0.08) 0 4px 12px;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: transform 150ms ease, background 150ms ease; }
.hib-campaign--recorte li:hover, .hib-campaign--hero .hib-campaign__copy li:hover { transform: translateX(2px); background: #fff; }

/* C · Protagonista: panel lila claro en diagonal (lineal, dentro del sistema); la máquina rompe el corte. */
.hib-campaign--hero { isolation: isolate; grid-template-columns: minmax(0, 1fr) 300px; }
.hib-campaign--hero h2 { font-size: 21px; line-height: 24px; }
.hib-campaign--hero::before { content: ""; position: absolute; z-index: -1; top: 0; right: 0; bottom: 0; width: 40%; clip-path: polygon(22% 0, 100% 0, 100% 100%, 0 100%);
  background: linear-gradient(135deg, #EEE8FF 0%, #DDD2FF 100%); }
.hib-campaign--hero::after { content: ""; position: absolute; z-index: -1; right: -70px; top: -110px; width: 260px; height: 230px; border: 36px solid rgb(132 96 229 / 8%); border-radius: 50%; }
.hib-campaign--hero .hib-campaign__media::before { display: none; }
.hib-campaign--hero .hib-campaign__media::after { left: 10%; right: -6%; bottom: 0; height: 18px; background: radial-gradient(closest-side, rgba(59,23,130,0.28), rgba(59,23,130,0)); }
.hib-campaign--hero .hib-campaign__copy ul { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 4px 0 8px; width: 100%; }
.hib-campaign--hero .hib-campaign__copy li { max-width: none; grid-template-columns: 22px 1fr; padding: 6px 8px 6px 6px; font-size: 11px; }

/* E · Vidrio claro: fondo lineal claro con trama de puntos, para que el panel de vidrio tenga algo que desenfocar. */
.hib-campaign--claro { isolation: isolate; }
.hib-campaign--claro::before { content: ""; position: absolute; z-index: -1; inset: 0; background-image: radial-gradient(rgba(91,53,194,0.2) 1px, transparent 1.4px); background-size: 14px 14px;
  -webkit-mask-image: linear-gradient(90deg, transparent 30%, #000 75%); mask-image: linear-gradient(90deg, transparent 30%, #000 75%); }
.hib-campaign--claro .hib-campaign__media::after { content: ""; position: absolute; left: 10%; right: -60px; bottom: 0; height: 18px; border-radius: 50%; background: radial-gradient(closest-side, rgba(59,23,130,0.3), rgba(59,23,130,0)); }
.hib-campaign--claro ul { border-color: rgba(255,255,255,0.9); background: linear-gradient(160deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35));
  backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%); }
@media (max-width: 1023px) {
  .hib-campaign--recorte, .hib-campaign--hero, .hib-campaign--claro { padding: 20px; }
  .hib-campaign--hero { grid-template-columns: minmax(0, 1fr); }
  .hib-campaign--hero::before, .hib-campaign--hero::after { display: none; }
  .hib-campaign--hero .hib-campaign__media { overflow: hidden; border-radius: 14px; clip-path: polygon(0 14%, 100% 0, 100% 100%, 0 100%);
    background: linear-gradient(135deg, #EEE8FF 0%, #DDD2FF 100%); }
  .hib-campaign--hero .hib-campaign__copy ul { grid-template-columns: minmax(0, 1fr); }
}
`;
type BannerView = "fondo" | "panel" | "recorte" | "forma" | "hero" | "glass" | "claro";
const BANNER_VIEWS: { id: BannerView; label: string; hint: string }[] = [
  { id: "fondo", label: "Foto de fondo", hint: "Como el banner principal: foto a sangre y mensaje en vidrio" },
  { id: "panel", label: "Panel · Arco", hint: "Foto al borde derecho con corte curvo" },
  { id: "recorte", label: "A · Recorte", hint: "Foto a sangre que se funde con el lila" },
  { id: "forma", label: "B · Forma", hint: "Círculo grande que desborda, con aro del CTA" },
  { id: "hero", label: "C · Protagonista", hint: "Foto en el panel diagonal, beneficios en fila" },
  { id: "glass", label: "D · Anillos", hint: "Banner nocturno: foto fundida y vidrio oscuro" },
  { id: "claro", label: "E · Vidrio claro", hint: "Foto en la mitad derecha, vidrio sobre el corte" },
];

function CampaignBanner({ view, camp = "valoriza" }: { view: BannerView; camp?: CampaignId }): JSX.Element {
  const c = CAMPAIGNS.find((x) => x.id === camp) ?? CAMPAIGNS[0];
  const points = (
    <ul>
      {c.points.map(({ icon, text }) => (
        <li key={text}><span className="hib-campaign__ico"><Vidrio s={icon} size={view === "panel" || view === "forma" ? 28 : view === "recorte" ? 24 : 22} /></span>{text}</li>
      ))}
    </ul>
  );
  return (
    <section className={`hib-campaign hib-campaign--${view}${view === "glass" || view === "claro" ? " hib-campaign--overlap" : ""}${c.cut ? "" : " hib-campaign--foto"}`} aria-label={c.aria}
      style={view === "fondo" ? { background: c.fondo.bg } : undefined}>
      <div className="hib-campaign__copy">
        <small className="hib-campaign__eyebrow">{c.eyebrow}</small>
        <h2>{c.title}</h2>
        <p>{c.lead}</p>
        {view === "hero" ? points : null}
        {view === "fondo" ? <button type="button" className="hib-glass">{c.cta}</button> : <Button variant="primary">{c.cta}</Button>}
      </div>
      <div className="hib-campaign__media">
        {view === "fondo"
          ? <img src={c.img} alt="" style={{ objectPosition: c.fondo.pos }} />
          : view === "panel" || !c.cut
          ? <img src={c.img} alt="" style={c.pos ? { objectPosition: c.pos } : undefined} />
          : <img className="hib-campaign__cut" src={c.img} alt="" />}
      </div>
      {view === "hero" || view === "fondo" ? null : points}
      <style>{CAMPAIGN_CSS + CAMPAIGN_VARIANT_CSS + CAMPAIGN_RICH_CSS + CAMPAIGN_FOTO_CSS}</style>
    </section>
  );
}
// Fotos con fondo (las tomas de persona + vehículo, estudio violeta): cada vista las trata a su manera.
//   Panel · Arco: la foto llega al borde derecho con un corte curvo; los beneficios pasan al centro, sobre el lila.
//   A · Recorte: la foto en el centro, fundida con el lila por los dos lados; los beneficios en vidrio rozan su borde derecho.
//   B · Forma: ojo de buey, un círculo grande que desborda el banner, con aro degradado del CTA y halos.
//   C · Protagonista: la foto llena el panel en diagonal de la derecha.
//   D · Anillos (nocturno): el banner toma el violeta del estudio, así la foto se funde sin velo gris; vidrio oscuro.
//   E · Vidrio claro (costura): la foto ocupa la mitad derecha con corte recto y el vidrio queda montado sobre el corte.
// «Foto de fondo»: el lenguaje del banner principal (degradado del sistema, foto a la derecha fundida con máscara)
// y el mensaje en un panel de vidrio. Sin beneficios: el panel ya hace de bajada.
const CAMPAIGN_FOTO_CSS = `
.hib-campaign--foto .hib-campaign__copy, .hib-campaign--foto > ul { position: relative; z-index: 2; }
.hib-campaign--foto .hib-campaign__media::before, .hib-campaign--foto .hib-campaign__media::after { display: none; }
.hib-campaign--foto .hib-campaign__media { overflow: hidden; }
.hib-campaign--foto .hib-campaign__copy { grid-row: 1; grid-column: 1; }
@media (min-width: 1024px) {
/* Panel · Arco */
.hib-campaign--foto.hib-campaign--panel { grid-template-columns: 300px 230px minmax(0, 1fr); }
.hib-campaign--foto.hib-campaign--panel > ul { grid-row: 1; grid-column: 2; padding: 0 0 0 16px; }
.hib-campaign--foto.hib-campaign--panel .hib-campaign__media { grid-row: 1; grid-column: 3; align-self: stretch; height: auto; margin: -20px -14px -20px 0; border-radius: 0;
  clip-path: ellipse(100% 125% at 100% 50%); }
/* A, D: foto al centro, fundida por los dos lados para que la persona no quede detrás de los beneficios. */
.hib-campaign--foto.hib-campaign--recorte .hib-campaign__media, .hib-campaign--foto.hib-campaign--glass .hib-campaign__media {
  position: absolute; top: 0; left: 28%; right: 250px; bottom: 0; width: auto; height: auto; border-radius: 0;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 26%, #000 92%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, #000 26%, #000 92%, transparent 100%); }
.hib-campaign--foto.hib-campaign--recorte > ul, .hib-campaign--foto.hib-campaign--glass > ul { grid-row: 1; grid-column: 3; }
/* B · Ojo de buey */
.hib-campaign--foto.hib-campaign--forma .hib-campaign__media { grid-row: 1; grid-column: 2; justify-self: center; align-self: center; width: 250px; height: 250px; margin-block: -60px; /* el margen negativo evita que el círculo estire la fila */
  border-radius: 50%; padding: 5px; background: linear-gradient(135deg, #ED8936 0%, #C4618F 50%, #8460E5 100%);
  box-shadow: 0 0 0 14px rgba(132,96,229,0.1), 0 0 0 30px rgba(132,96,229,0.05), rgba(59,23,130,0.3) 0 18px 30px -10px; }
.hib-campaign--foto.hib-campaign--forma .hib-campaign__media img { border-radius: 50%; }
.hib-campaign--foto.hib-campaign--forma > ul { grid-row: 1; grid-column: 3; }
/* C: la foto ocupa el panel diagonal de la derecha. */
.hib-campaign--foto.hib-campaign--hero::before { display: none; }
.hib-campaign--foto.hib-campaign--hero .hib-campaign__media { position: absolute; top: 0; right: 0; bottom: 0; width: 40%; height: auto; border-radius: 0;
  clip-path: polygon(22% 0, 100% 0, 100% 100%, 0 100%); }
/* E · Costura */
.hib-campaign--foto.hib-campaign--claro { grid-template-columns: 300px 270px minmax(0, 1fr); }
.hib-campaign--foto.hib-campaign--claro .hib-campaign__media { position: absolute; top: 0; right: 0; bottom: 0; left: 47%; width: auto; height: auto; border-radius: 0;
  box-shadow: inset 1px 0 0 rgba(255,255,255,0.6); }
.hib-campaign--foto.hib-campaign--claro > ul { grid-row: 1; grid-column: 2; background: linear-gradient(160deg, rgba(255,255,255,0.86), rgba(255,255,255,0.62)); }
}
/* D · Nocturno */
.hib-campaign--foto.hib-campaign--glass { background: linear-gradient(100deg, #1C0E4D 0%, #2A1670 50%, #2C1675 100%); border-color: #2A1670; }
.hib-campaign--foto.hib-campaign--glass::before, .hib-campaign--foto.hib-campaign--glass::after { z-index: 1; border-color: rgba(255,255,255,0.05); }
.hib-campaign--foto.hib-campaign--glass h2 { color: #fff; }
.hib-campaign--foto.hib-campaign--glass h2 em { background: none; color: #FFD7B0; -webkit-text-fill-color: currentColor; }
.hib-campaign--foto.hib-campaign--glass p { color: rgba(255,255,255,0.78); }
.hib-campaign--foto.hib-campaign--glass .hib-campaign__eyebrow { color: #fff; border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.1); box-shadow: none; }
.hib-campaign--foto.hib-campaign--glass .hib-campaign__eyebrow::before { background: #FFD7B0; box-shadow: 0 0 0 3px rgba(255,215,176,0.25); }
.hib-campaign--foto.hib-campaign--glass > ul { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.08);
  box-shadow: rgba(10,0,40,0.35) 0 12px 28px -10px, inset 0 1px 0 rgba(255,255,255,0.2); }
.hib-campaign--foto.hib-campaign--glass li { color: #fff; }
@media (max-width: 1023px) {
  .hib-campaign--foto:not(.hib-campaign--fondo) .hib-campaign__copy { grid-row: auto; }
  .hib-campaign--foto:not(.hib-campaign--fondo) .hib-campaign__media { order: -1; } /* en el celular la foto encabeza la tarjeta */
  .hib-campaign--foto .hib-campaign__media { height: 200px; }
  .hib-campaign--foto.hib-campaign--forma .hib-campaign__media { justify-self: center; width: 220px; height: 220px; border-radius: 50%; padding: 4px;
    background: linear-gradient(135deg, #ED8936 0%, #C4618F 50%, #8460E5 100%); box-shadow: 0 0 0 10px rgba(132,96,229,0.1), rgba(59,23,130,0.3) 0 14px 26px -10px; }
  .hib-campaign--foto.hib-campaign--forma .hib-campaign__media img { border-radius: 50%; }
  .hib-campaign--foto.hib-campaign--panel .hib-campaign__media { border-radius: 14px 14px 14px 120px; }
  .hib-campaign--foto.hib-campaign--hero .hib-campaign__media { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%); }
  .hib-campaign--foto.hib-campaign--overlap > ul { margin-top: 0; }
  .hib-campaign--foto.hib-campaign--claro > ul { background: linear-gradient(160deg, rgba(255,255,255,0.86), rgba(255,255,255,0.62)); }
  .hib-campaign--foto.hib-campaign--glass .hib-campaign__media { -webkit-mask-image: linear-gradient(180deg, #000 65%, transparent 100%); mask-image: linear-gradient(180deg, #000 65%, transparent 100%); }
}
.hib-campaign.hib-campaign--fondo { display: block; padding: 0; color: #fff; border: 0; }
.hib-campaign.hib-campaign--fondo::before, .hib-campaign.hib-campaign--fondo::after { display: none; }
.hib-campaign.hib-campaign--fondo .hib-campaign__media { position: absolute; top: 0; right: 0; bottom: 0; width: 68%; height: auto; border-radius: 0; overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 34%); mask-image: linear-gradient(90deg, transparent 0%, #000 34%); }
.hib-campaign.hib-campaign--fondo .hib-campaign__media::before, .hib-campaign.hib-campaign--fondo .hib-campaign__media::after { display: none; }
.hib-campaign.hib-campaign--fondo .hib-campaign__media img { width: 100%; height: 100%; object-fit: cover; }
.hib-campaign--fondo .hib-campaign__copy { position: absolute; z-index: 1; left: 20px; top: 50%; transform: translateY(-50%); box-sizing: border-box; width: min(440px, 52%);
  padding: 16px 20px 18px; gap: 6px; border-radius: 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.22);
  -webkit-backdrop-filter: blur(16px) saturate(140%); backdrop-filter: blur(16px) saturate(140%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 30px rgba(20,8,60,0.3); }
.hib-campaign--fondo .hib-campaign__eyebrow { color: #fff; padding: 3px 10px 3px 8px; border-radius: 999px; background: rgba(255,255,255,0.14); box-shadow: none; }
.hib-campaign--fondo .hib-campaign__eyebrow::before { background: #FFD7B0; box-shadow: 0 0 0 3px rgba(255,215,176,0.3); }
.hib-campaign--fondo h2 { color: #fff; font-size: 22px; line-height: 26px; }
.hib-campaign--fondo h2 em { color: #FFD7B0; background: none; -webkit-text-fill-color: currentColor; font-style: normal; }
.hib-campaign--fondo p { color: rgba(255,255,255,0.85); margin-bottom: 6px; }
.hib-campaign--fondo .hib-glass { color: #fff; }
@media (max-width: 1023px) {
  .hib-campaign.hib-campaign--fondo { height: auto; min-height: 340px; display: flex; align-items: flex-end; padding: 12px; }
  .hib-campaign.hib-campaign--fondo .hib-campaign__media { width: 100%; height: 62%; bottom: auto; -webkit-mask-image: linear-gradient(180deg, #000 55%, transparent 100%); mask-image: linear-gradient(180deg, #000 55%, transparent 100%); }
  .hib-campaign--fondo .hib-campaign__copy { position: relative; left: auto; top: auto; transform: none; width: 100%; }
}

.hib-campaign--foto .hib-campaign__media::before, .hib-campaign--foto .hib-campaign__media::after { display: none; }
`;

// «Explora por categoría»: seis cards con la caja de OfferCard (radio 8, sombra y elevación al pasar).
// Íconos dúotono como los del banner. Las fotos son las de demo del lab; la de mobiliario es de Unsplash (1RT4txDDAbM, licencia Unsplash).
// Artículos diversos va al final: es la card que se alarga en la distribución «5 · 1 larga».
const CATEGORIES = [
  { label: "Vehicular", count: "21 lotes", vd: "vehicular" as VidrioName, imageSrc: "/producto/index/demo/inventory-suv-v1.png" },
  { label: "Equipos diversos", count: "12 lotes", vd: "equipos" as VidrioName, imageSrc: "/producto/index/demo/inventory-forklift-v1.png" },
  { label: "Maquinaria", count: "2 lotes", vd: "maquinaria" as VidrioName, imageSrc: "/producto/index/demo/inventory-excavator-v1.png" },
  { label: "Materiales", count: "1 lote", vd: "materiales" as VidrioName, imageSrc: "/producto/index/demo/inventory-steel-v1.png" },
  { label: "Mobiliario", count: "3 lotes", vd: "mobiliario" as VidrioName, imageSrc: "/producto/index/demo/inventory-furniture-v1.jpg" },
  { label: "Artículos diversos", count: "1 lote", vd: "articulos" as VidrioName, imageSrc: "/producto/index/demo/inventory-mosaic-v1.png" },
];
const CATEGORY_CSS = `
.hib-cat { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; background: #fff; color: inherit; text-decoration: none;
  box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-cat:hover { transform: translateY(-3px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-cat:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-cat > img { display: block; width: 100%; height: 92px; object-fit: cover; }
.hib-cat__foot { flex: 1; display: grid; grid-template-columns: 32px minmax(0,1fr) 20px; gap: 6px; align-items: center; padding: 8px 6px 8px 8px; }
.hib-cat__icon { display: grid; place-items: center; width: 32px; height: 32px; } /* ícono de vidrio, sin caja */
.hib-cat__txt { display: grid; min-width: 0; }
.hib-cat__txt b { font-size: 12px; line-height: 1.2; color: #3b1782; } /* «Equipos diversos» va en 2 líneas: no se corta */
.hib-cat__txt small { font-size: 11px; color: #5b5b66; }
.hib-cat__go { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; color: #3b1782; background: #F3EFFD; }
@media (prefers-reduced-motion: reduce) { .hib-cat { transition: none; } }
/* Vista «Sin card»: el ícono suelto, sin la caja con borde degradado. */
.hib-cats--plain .hib-cat__icon { border: 0; background: none; box-shadow: none; }
`;
// Distribución de las 6 cards (29/10). Las que ocupan media fila o más pasan a horizontal: foto a la izquierda, texto a la derecha.
type CategoriesLayout = "fila" | "s5" | "f5" | "d222" | "d33" | "d42" | "d51" | "carrusel";
const CATEGORY_LAYOUTS: { id: CategoriesLayout; label: string; hint: string }[] = [
  { id: "fila", label: "Fila de 6", hint: "Las 6 en una sola fila" },
  { id: "s5", label: "5 + scroll", hint: "Se ven 5; la sexta aparece con la barra de scroll" },
  { id: "f5", label: "5 + flecha", hint: "Se ven 5; una flecha a la derecha trae la sexta" },
  { id: "d33", label: "3 · 3", hint: "Dos filas de 3" },
  { id: "d222", label: "2 · 2 · 2", hint: "Tres filas de 2, cards horizontales" },
  { id: "d42", label: "4 · 2 largas", hint: "4 arriba y las 2 últimas más largas" },
  { id: "d51", label: "5 · 1 larga", hint: "5 arriba y Artículos diversos a lo ancho" },
  { id: "carrusel", label: "Carrusel", hint: "Una fila con scroll horizontal" },
];
const WIDE = [".hib-cats-l--d222 > li", ".hib-cats-l--d42 > li:nth-child(n+5)", ".hib-cats-l--d51 > li:nth-child(6)"];
const wide = (tail: string) => WIDE.map((w) => `${w} ${tail}`).join(", ");
const CATEGORY_LAYOUT_CSS = `
.hib-cats-l { display: grid; gap: 10px; margin: 0; padding: 0 0 6px; list-style: none; }
.hib-cats-l > li { display: flex; min-width: 0; }
.hib-cats-l--fila { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.hib-cats-l--d33 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.hib-cats-l--d222 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.hib-cats-l--d42 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.hib-cats-l--d42 > li:nth-child(n+5) { grid-column: span 2; }
.hib-cats-l--d51 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.hib-cats-l--d51 > li:nth-child(6) { grid-column: 1 / -1; }
.hib-cats-l--carrusel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 2px 12px; margin: -4px -2px 0;
  scrollbar-width: thin; scrollbar-color: #B9A6F2 #F3EFFD; }
.hib-cats-l--carrusel > li { flex: 0 0 188px; scroll-snap-align: start; }
.hib-cats-l--carrusel::-webkit-scrollbar { height: 6px; }
.hib-cats-l--carrusel::-webkit-scrollbar-track { border-radius: 999px; background: #F3EFFD; }
.hib-cats-l--carrusel::-webkit-scrollbar-thumb { border-radius: 999px; background: #B9A6F2; }
/* 5 visibles (29/10): cada card mide un quinto de la fila; la sexta queda fuera y se trae con la barra (s5) o con la flecha (f5). */
.hib-cats-l--s5, .hib-cats-l--f5 { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; padding: 4px 2px 10px; margin: -4px -2px 0; }
.hib-cats-l--s5 > li, .hib-cats-l--f5 > li { flex: 0 0 calc((100% - 40px) / 5); scroll-snap-align: start; }
.hib-cats-l--s5 { scrollbar-width: thin; scrollbar-color: #B9A6F2 #F3EFFD; }
.hib-cats-l--s5::-webkit-scrollbar { height: 6px; }
.hib-cats-l--s5::-webkit-scrollbar-track { border-radius: 999px; background: #F3EFFD; }
.hib-cats-l--s5::-webkit-scrollbar-thumb { border-radius: 999px; background: #B9A6F2; }
.hib-cats-l--f5 { scrollbar-width: none; } .hib-cats-l--f5::-webkit-scrollbar { display: none; }
.hib-cats-nav { position: relative; }
.hib-cats-nav__btn { position: absolute; top: calc(50% - 20px); z-index: 2; display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 1px solid #E0D4FF; border-radius: 50%;
  color: #3B1782; background: #fff; box-shadow: rgba(32,0,104,0.18) 0 4px 14px; cursor: pointer; transition: transform 150ms, background 150ms, opacity 150ms; }
.hib-cats-nav__btn--next { right: -12px; } .hib-cats-nav__btn--prev { left: -12px; }
.hib-cats-nav__btn--prev svg { transform: scaleX(-1); }
.hib-cats-nav__btn:hover { transform: scale(1.08); background: #F8F5FF; }
.hib-cats-nav__btn:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
.hib-cats-nav__btn[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .hib-cats-l--s5, .hib-cats-l--f5 { scroll-behavior: auto; } .hib-cats-nav__btn { transition: none; } }
/* Cards largas: horizontales, foto a la izquierda de alto fijo (en la de ancho completo, un 30 % del ancho). */
${wide(".hib-cat")}, ${wide(".hib-pcat")} { flex-direction: row; }
${wide(".hib-cat > img")} { width: 46%; height: 104px; }
${wide(".hib-pcat__media")} { flex: none; width: 46%; height: 96px; margin: 6px 0 6px 6px; }
.hib-cats-l--d51 > li:nth-child(6) .hib-cat > img, .hib-cats-l--d51 > li:nth-child(6) .hib-pcat__media { width: 30%; }
${wide(".hib-cat__foot")} { padding: 12px 12px 12px 14px; }
`;
type CategoriesView = "normal" | "plain" | "premium";
const CATEGORIES_VIEWS: { id: CategoriesView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "Foto, ícono y conteo" },
  { id: "premium", label: "Premium", hint: "Fondo lila, ícono en cajita y destello" },
];

// Vista «Premium» (referencia de producto): sección con fondo lila suave, título sin corchetes y enlace
// con flecha; cards de vidrio blanco con la foto sobre lila, ícono en cajita blanca con sombra, flecha
// en círculo que se llena al pasar y un destello que cruza la card.
const CATEGORY_PREMIUM_CSS = `
.hib-pcats { box-sizing: border-box; width: 100%; padding: 18px 16px 16px; border-radius: 16px; font-family: ${FONT};
  background: radial-gradient(120% 140% at 0% 0%, #F4EFFF 0%, #EEE8FF 45%, #F8F5FF 100%); border: 1px solid #E6DEFF;
  box-shadow: rgba(92,56,214,0.12) 0 12px 28px -12px; }
.hib-pcats__head { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 14px; }
.hib-pcats__head h2 { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: #1B1442; }
.hib-pcats__all { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #3B1782; text-decoration: none; }
.hib-pcats__all svg { transition: transform 0.2s; }
.hib-pcats__all:hover svg { transform: translateX(3px); }
.hib-pcats ul { margin: 0; padding: 0; list-style: none; } /* columnas: CATEGORY_LAYOUT_CSS */
.hib-pcat { position: relative; display: flex; flex-direction: column; height: 100%; overflow: hidden; border-radius: 14px; color: inherit; text-decoration: none;
  background: rgba(255,255,255,0.88); border: 1px solid rgba(255,255,255,0.95); box-shadow: rgba(76,40,200,0.12) 0 8px 22px -8px, inset 0 1px 0 #fff;
  transition: transform 0.2s cubic-bezier(0.3,0,0,1), box-shadow 0.2s; }
.hib-pcat:hover { transform: translateY(-4px); box-shadow: rgba(76,40,200,0.24) 0 16px 30px -10px; }
.hib-pcat:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-pcat::before { content: ""; position: absolute; top: 0; left: -60%; z-index: 2; width: 40%; height: 100%; pointer-events: none;
  transform: skewX(-18deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); transition: left 0.6s ease; }
.hib-pcat:hover::before { left: 130%; }
.hib-pcat__media { position: relative; height: 96px; margin: 6px 6px 0; overflow: hidden; border-radius: 10px;
  background: radial-gradient(80% 90% at 50% 40%, #FFFFFF 0%, #ECE6FF 100%); }
.hib-pcat__media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
.hib-pcat:hover .hib-pcat__media img { transform: scale(1.06); }
.hib-pcat__media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(236,230,255,0) 55%, rgba(236,230,255,0.6) 100%); }
.hib-pcat__foot { flex: 1; display: grid; grid-template-columns: 30px minmax(0,1fr) 20px; gap: 6px; align-items: center; padding: 9px 6px 9px 7px; }
.hib-pcat__icon { display: grid; place-items: center; width: 30px; height: 30px; }
.hib-pcat__txt { display: grid; min-width: 0; }
.hib-pcat__txt b { font-size: 12px; line-height: 1.2; color: #1B1442; }
.hib-pcat__txt small { font-size: 11px; color: #6B6880; }
.hib-pcat__go { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; color: #4A2CE0; background: #EEE8FF;
  transition: background 0.2s, color 0.2s; }
.hib-pcat:hover .hib-pcat__go { color: #fff; background: linear-gradient(135deg, #8460E5, #3B1782); }
`;
const ARROW = <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

// Cabecera de las secciones planas (sin card): como la referencia, alineada al borde del contenido.
function SectionHead({ title, subtitle, action }: { title: string; subtitle: string; action?: string }): JSX.Element {
  return (
    <header className="hib-section-head" style={{ boxSizing: "border-box", flex: "none", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, padding: "0 0 10px", marginBottom: 14, borderBottom: "1px solid #DEDCE4" }}>
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <h2 className="hib-section-head__title" style={{ margin: 0, fontSize: 16, lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.01em", color: "#3b1782", whiteSpace: "nowrap" }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 12, lineHeight: "16.8px", color: "#6B6878" }}>{subtitle}</p>
      </div>
      {action ? <div style={{ flex: "none" }}><ProfileButton>{action}</ProfileButton></div> : null}
    </header>
  );
}
const FLAT: CSSProperties = { boxSizing: "border-box", width: "100%", fontFamily: FONT };

// «Vende tu vehículo» (réplica de vmc-index-final-review): dos opciones a la izquierda y el beneficio de
// SubasCars a la derecha, con ProfileButton de Concorde y el botón de vidrio del hero.
const SELL_CSS = `
.hib-sell { box-sizing: border-box; width: 100%; color: #191C1C; font-family: var(--vmc-font-display, "Plus Jakarta Sans", sans-serif); }
.hib-sell *, .hib-sell *::before, .hib-sell *::after { box-sizing: border-box; }
.hib-sell__layout { display: grid; grid-template-columns: minmax(0, 1fr) clamp(260px, 34%, 300px); gap: 16px; align-items: stretch; }
.hib-sell__choices { display: grid; gap: 12px; }
.hib-sell__choice { display: grid; grid-template-columns: 132px minmax(0, 1fr); min-height: 142px; overflow: hidden; border: 1px solid #DEDCE4; border-radius: 14px; background: #fff; text-decoration: none; color: inherit; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.hib-sell__choice:hover { transform: translateY(-2px); border-color: #B7A5E9; box-shadow: rgb(32 0 104 / 14%) 0 12px 24px -16px; }
.hib-sell__photo { position: relative; overflow: hidden; background: #E8E5FF; }
.hib-sell__photo img { display: block; width: 100%; height: 100%; object-fit: cover; } /* tomas light (27/10): estudio claro para la card blanca */
.hib-sell__photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 56%, rgb(255 255 255 / 92%) 100%); pointer-events: none; }
.hib-sell__copy { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; min-width: 0; padding: 14px 16px; }
.hib-sell__copy h3 { margin: 0; color: #191C1C; font-size: 14px; line-height: 18px; font-weight: 700; letter-spacing: -.01em; }
.hib-sell__copy p { margin: 4px 0 10px; color: #6B6878; font-size: 12px; line-height: 16.8px; }
.hib-sell__copy .pprofilebtn { padding: 0; }
.hib-sell__benefit { position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: flex-start; min-height: 296px; overflow: hidden; padding: 22px; border-radius: 14px; color: #fff;
  background: radial-gradient(110% 100% at -10% 112%, rgb(239 133 46 / 88%) 0%, rgb(239 133 46 / 38%) 27%, transparent 56%), linear-gradient(145deg, #32136F 0%, #4E22A9 55%, #7B4BE3 100%); box-shadow: rgb(59 23 130 / 18%) 0 12px 24px -18px; }
.hib-sell__benefit::before { content: ""; position: absolute; z-index: -1; top: -85px; right: -48px; width: 250px; height: 210px; border: 42px solid rgb(255 255 255 / 10%); border-radius: 50%; }
.hib-sell__benefit::after { content: ""; position: absolute; z-index: -1; right: -74px; bottom: -118px; width: 270px; height: 210px; border: 42px solid rgb(255 255 255 / 8%); border-radius: 50%; }
.hib-sell__person { position: absolute; z-index: 0; right: -26px; bottom: -1px; width: min(68%, 238px); height: auto; pointer-events: none; }
.hib-sell__benefit > :not(.hib-sell__person) { position: relative; z-index: 1; }
.hib-sell__coin { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border: 1px solid rgb(255 255 255 / 28%); border-radius: 999px; background: rgb(255 255 255 / 12%); font-size: 11px; font-weight: 800; letter-spacing: .02em; }
.hib-sell__benefit h3 { max-width: 190px; margin: 14px 0 0; font-size: 18px; line-height: 22px; font-weight: 700; letter-spacing: -.02em; }
.hib-sell__benefit p { max-width: 190px; margin: 6px 0 0; color: rgb(255 255 255 / 88%); font-size: 12px; line-height: 16.8px; }
.hib-sell__benefit .hib-glass { height: 38px; margin-top: auto; padding-inline: 24px; }
`;
function SellSection(): JSX.Element {
  return (
    <section className="hib-sell" aria-label="Vende tu vehículo">
      <SectionHead title="Vende tu vehículo" subtitle="Publica tu auto y recibe ofertas de compradores verificados." />
      <div className="hib-sell__layout">
        <div className="hib-sell__choices">
          <article className="hib-sell__choice">
            <div className="hib-sell__photo"><img src="/producto/index/banners/vmc/vende-auto.jpg" alt="" /></div>
            <div className="hib-sell__copy"><h3>¿Vendes tu vehículo?</h3><p>Registra tu publicación en minutos y deja que VMC filtre las ofertas por ti.</p>
              <ProfileButton href="https://www.vmcsubastas.com/landing-subascars">Publica tu auto</ProfileButton></div>
          </article>
          <article className="hib-sell__choice hib-sell__choice--fleet">
            <div className="hib-sell__photo"><img src="/producto/index/banners/vmc/vende-flota.jpg" alt="" /></div>
            <div className="hib-sell__copy"><h3>¿Vendes varios vehículos?</h3><p>Una alternativa para propietarios, empresas y concesionarios que buscan vender sus vehículos seminuevos.</p>
              <ProfileButton href="https://www.subastop.com/cita#vende">Agenda tu consultoría gratis hoy</ProfileButton></div>
          </article>
        </div>
        <aside className="hib-sell__benefit" aria-label="Beneficios de SubasCars">
          <img className="hib-sell__person" src="/producto/index/demo/sell/seller-phone-man.png" alt="" />
          <span className="hib-sell__coin">25 SubasCoins · 0% comisión</span>
          <h3>Un solo pago, hasta que lo vendas</h3>
          <p>Sin pagos mensuales ni renovaciones: el 100% de la venta es tuyo.</p>
          <a className="hib-glass" href="https://www.vmcsubastas.com/landing-subascars">Publica ahora</a>
        </aside>
      </div>
      <style>{SELL_CSS}</style>
    </section>
  );
}

// Lista de categorías; con «5 + flecha» suma los botones que deslizan la fila (el de la izquierda aparece al avanzar).
function CategoryList({ className, layout, children }: { className: string; layout: CategoriesLayout; children: ReactNode }): JSX.Element {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const arrows = layout === "f5";
  useEffect(() => {
    const el = ref.current;
    if (!el || !arrows) return;
    const sync = () => setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync); ro.observe(el);
    return () => { el.removeEventListener("scroll", sync); ro.disconnect(); };
  }, [arrows]);
  const go = (dir: 1 | -1) => { const el = ref.current; if (el) el.scrollBy({ left: dir * (el.clientWidth + 10) / 5 }); };
  const list = <ul ref={ref} className={className}>{children}</ul>;
  if (!arrows) return list;
  return (
    <div className="hib-cats-nav">
      {list}
      <button type="button" className="hib-cats-nav__btn hib-cats-nav__btn--prev" aria-label="Categorías anteriores" hidden={edge.start} onClick={() => go(-1)}>{ARROW}</button>
      <button type="button" className="hib-cats-nav__btn hib-cats-nav__btn--next" aria-label="Más categorías" hidden={edge.end} onClick={() => go(1)}>{ARROW}</button>
    </div>
  );
}

function CategoryRail({ view, layout }: { view: CategoriesView; layout: CategoriesLayout }): JSX.Element {
  if (view === "premium") {
    return (
      <section className="hib-pcats" aria-labelledby="hib-pcats-title">
        <header className="hib-pcats__head">
          <h2 id="hib-pcats-title">Explora por categoría</h2>
          <a href="#" className="hib-pcats__all">Ver todas las categorías{ARROW}</a>
        </header>
        <CategoryList layout={layout} className={`hib-cats-l hib-cats-l--${layout}`}>
          {CATEGORIES.map(({ label, count, vd, imageSrc }) => (
            <li key={label}>
              <a href="#" className="hib-pcat vd-host" aria-label={`${label} · ${count}`}>
                <span className="hib-pcat__media"><img src={imageSrc} alt="" /></span>
                <span className="hib-pcat__foot">
                  <span className="hib-pcat__icon"><Vidrio s={vd} size={30} /></span>
                  <span className="hib-pcat__txt"><b>{label}</b><small>{count}</small></span>
                  <span className="hib-pcat__go" aria-hidden>{ARROW}</span>
                </span>
              </a>
            </li>
          ))}
        </CategoryList>
        <style>{CATEGORY_PREMIUM_CSS + CATEGORY_LAYOUT_CSS}</style>
      </section>
    );
  }
  return (
    <section aria-label="Explora por categoría" style={FLAT}>
      <SectionHead title="Explora por categoría" subtitle="Encuentra oportunidades por tipo de activo" action="Ver todas las categorías" />
      <CategoryList layout={layout} className={`hib-cats-l hib-cats-l--${layout}${view === "plain" ? " hib-cats--plain" : ""}`}>
        {CATEGORIES.map(({ label, count, vd, imageSrc }) => (
          <li key={label}>
            <a href="#" className="hib-cat vd-host" aria-label={`${label} · ${count}`}>
              <img src={imageSrc} alt="" />
              <span className="hib-cat__foot">
                <span className="hib-cat__icon"><Vidrio s={vd} size={32} /></span>
                <span className="hib-cat__txt"><b>{label}</b><small>{count}</small></span>
                <span className="hib-cat__go" aria-hidden><svg width="12" height="12" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </span>
            </a>
          </li>
        ))}
      </CategoryList>
      <style>{CATEGORY_CSS + CATEGORY_LAYOUT_CSS}</style>
    </section>
  );
}

// «Empresas y vendedores»: 2 × 2 filas con la caja de las cards (radio 8, sombra y elevación al pasar).
// Autoplan, Pacífico y Trupal (y sus conteos) salen del submenú «Empresas» del sidebar; Mapfre es de
// ejemplo (no está en el sidebar, su conteo es inventado). Logos oficiales bajados de sus sitios
// (autoplan.pe, pacifico.com.pe, mapfre.com.pe, trupal.com.pe) a public/producto/index/demo/empresas.
const COMPANIES = [
  { name: "Autoplan", lots: "3 lotes", logo: "/producto/index/demo/empresas/autoplan.png", tile: "#ffffff" },
  { name: "Pacífico", lots: "2 lotes", logo: "/producto/index/demo/empresas/pacifico.png", tile: "#ffffff" },
  { name: "Mapfre", lots: "4 lotes", logo: "/producto/index/demo/empresas/mapfre.png", tile: "#ffffff" },
  { name: "Trupal S.A.", lots: "2 lotes", logo: "/producto/index/demo/empresas/trupal.svg", tile: "#ffffff" },
];
const COMPANY_CSS = `
.hib-emp { display: grid; grid-template-columns: 76px minmax(0,1fr) 24px; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 8px; background: #fff; color: inherit; text-decoration: none;
  box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-emp:hover { transform: translateY(-2px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-emp:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-emp__logo { box-sizing: border-box; display: grid; place-items: center; width: 76px; height: 44px; padding: 6px 8px; border-radius: 8px; border: 1px solid #ECE8F6; }
.hib-emp__logo img { display: block; max-width: 58px; max-height: 30px; object-fit: contain; }
.hib-emp__txt { display: grid; min-width: 0; gap: 2px; }
.hib-emp__txt b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #3b1782; }
.hib-emp__txt small { font-size: 12px; color: #5b5b66; }
.hib-emp__go { color: #3b1782; }
@media (prefers-reduced-motion: reduce) { .hib-emp { transition: none; } }

/* Slider: marquee de logos en bucle infinito. La pista lleva la lista dos veces y se desplaza -50%,
   así el corte no se ve. Se pausa con el puntero o el foco; bordes desvanecidos. Se mueve siempre,
   también con «reducir animaciones» activo en el sistema (pedido de producto). */
.hib-marquee { position: relative; overflow: hidden; margin-top: 0; padding: 6px 0 10px;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%); }
.hib-marquee__track { display: flex; gap: 16px; width: max-content; animation: hib-marquee 26s linear infinite; }
.hib-marquee:hover .hib-marquee__track, .hib-marquee:focus-within .hib-marquee__track { animation-play-state: paused; }
@keyframes hib-marquee { to { transform: translateX(calc(-50% - 8px)); } }
.hib-marquee__item { box-sizing: border-box; display: grid; justify-items: center; align-content: center; gap: 6px; width: 168px; height: 92px; padding: 10px;
  border-radius: 8px; background: #fff; color: inherit; text-decoration: none; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px;
  transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-marquee__item:hover { transform: translateY(-2px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-marquee__item:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-marquee__item img { display: block; max-width: 120px; max-height: 40px; object-fit: contain; }
.hib-marquee__item small { font-size: 11px; color: #5b5b66; }
`;
type CompaniesView = "normal" | "slider" | "loop"; // «normal» (2 × 2) se conserva en código, fuera del selector
const COMPANIES_VIEWS: { id: CompaniesView; label: string; hint: string }[] = [
  { id: "slider", label: "Slider", hint: "Logos en movimiento" },
  { id: "loop", label: "Logo loop", hint: "Efecto de React Bits" },
];

// «Tipo de oferta» sin la columna de Categorías del CategoriesSection de Concorde (ya está «Explora por
// categoría»): misma caja y mismos componentes (CardTitle · OfferType).
// «Tipo de oferta» premium, en la línea de la card Holo: tarjeta blanca con borde degradado, foil
// holográfico y reflejo que siguen al puntero (con inclinación 3D), ícono en baldosa con degradado y brillo,
// conteo en vivo, enlace con chevron (ProfileButton) y una franja inferior con luz que corre.
const OFFER_TYPES = [
  { id: "negotiable", kicker: "Modalidad", title: "Recibe ofertas", text: "Haz tu propuesta y cierra el precio directo con el vendedor.",
    count: 12, unit: "lotes reciben ofertas", cta: "Ver lotes",
    a: "#00A9B0", b: "#6A35D6", ink: "#00777A", soft: "rgba(0,218,224,0.16)", glow: "rgba(80,70,210,0.35)" },
  { id: "live", kicker: "Modalidad", title: "En vivo", text: "Puja en tiempo real y llévate el lote al cierre de la subasta.",
    count: 21, unit: "subastas activas", cta: "Ver subastas",
    a: "#FF9639", b: "#BE3D00", ink: "#C2410C", soft: "rgba(255,150,57,0.16)", glow: "rgba(239,133,46,0.35)" },
] as const;
const OFFER_TYPE_CSS = `
@keyframes hib-ot-run { from { left: -35%; } to { left: 100%; } }
@keyframes hib-ot-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.75); } }
@keyframes hib-ot-idle { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
.hib-ot__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 0; perspective: 900px; }
.hib-ot__card { position: relative; isolation: isolate; display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 14px; align-items: start;
  padding: 18px 20px 22px; overflow: hidden; border-radius: 16px; color: #14112B; text-decoration: none;
  border: 1.5px solid transparent;
  background: radial-gradient(120% 90% at 100% 0%, var(--soft) 0%, transparent 55%) padding-box, #fff padding-box,
              linear-gradient(140deg, var(--a) 0%, #ffffff 35%, #CFBAFF 65%, var(--b) 100%) border-box;
  box-shadow: 0 14px 30px -18px var(--glow), 0 2px 6px rgba(32,0,104,0.06);
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform 0.2s ease, box-shadow 0.25s; }
.hib-ot__card:hover { box-shadow: 0 22px 40px -18px var(--glow), 0 4px 10px rgba(32,0,104,0.08); }
.hib-ot__card:focus-visible { outline: 2px solid #8460E5; outline-offset: 3px; }
.hib-ot__holo { position: absolute; inset: 0; z-index: 2; pointer-events: none; background-size: 260% 260%; mix-blend-mode: multiply;
  background-image: linear-gradient(115deg, transparent 26%, rgba(132,96,229,0.09) 38%, rgba(0,218,224,0.08) 46%, rgba(255,150,57,0.08) 54%, rgba(132,96,229,0.07) 62%, transparent 74%);
  animation: hib-ot-idle 6s ease-in-out infinite alternate; }
.hib-ot__card:hover .hib-ot__holo { animation: none; background-position: var(--mx, 50%) var(--my, 50%); }
.hib-ot__glare { position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity 0.2s;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.75), transparent 42%); }
.hib-ot__card:hover .hib-ot__glare { opacity: 1; }
.hib-ot__tile { display: grid; place-items: center; width: 48px; height: 48px; }
.hib-ot__body { position: relative; z-index: 1; display: grid; gap: 4px; min-width: 0; }
.hib-ot__kicker { font-size: 11px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; color: var(--ink); }
.hib-ot__title { margin: 0; font-size: 14px; line-height: 18px; font-weight: 700; letter-spacing: -0.01em; color: #14112B; }
.hib-ot__text { margin: 2px 0 0; font-size: 12px; line-height: 16.8px; color: #6B6878; }
.hib-ot__row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #F0EDF7; }
.hib-ot__count { display: inline-flex; align-items: baseline; gap: 6px; font-size: 12px; color: #5B5870; }
.hib-ot__count b { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: #14112B; font-variant-numeric: tabular-nums; }
.hib-ot__count i { align-self: center; width: 7px; height: 7px; border-radius: 50%; background: var(--a); box-shadow: 0 0 0 3px var(--soft); animation: hib-ot-pulse 1.4s ease-in-out infinite; }
.hib-ot__cta { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #3B1782; white-space: nowrap; }
.hib-ot__cta span { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; color: #fff; background: linear-gradient(135deg, var(--a), var(--b));
  transition: transform 0.2s; }
.hib-ot__card:hover .hib-ot__cta span { transform: translateX(3px); }
.hib-ot__deco { position: absolute; right: -18px; top: -14px; z-index: 0; color: var(--a); opacity: 0.09; pointer-events: none; }
.hib-ot__track { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; overflow: hidden; background: linear-gradient(90deg, var(--a), var(--b)); }
.hib-ot__track::after { content: ""; position: absolute; top: 0; width: 30%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent); animation: hib-ot-run 2.4s linear infinite; }
`;
function OfferTypeClara(): JSX.Element {
  return (
    <>
      <div className="hib-ot__grid">
        {OFFER_TYPES.map((t) => (
          <a key={t.id} href="#" className="hib-ot__card vd-host"
            style={{ "--a": t.a, "--b": t.b, "--ink": t.ink, "--soft": t.soft, "--glow": t.glow } as CSSProperties}>
            <span className="hib-ot__tile"><Vidrio s={t.id === "live" ? "participaciones" : "negociaciones"} size={44} /></span>
            <span className="hib-ot__body">
              <span className="hib-ot__kicker">{t.kicker}</span>
              <span className="hib-ot__title">{t.title}</span>
              <span className="hib-ot__text">{t.text}</span>
              <span className="hib-ot__row">
                <span className="hib-ot__count"><i aria-hidden /><b>{t.count}</b>{t.unit}</span>
                <span className="hib-ot__cta">{t.cta}<span aria-hidden><svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6 11L10 8L6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span></span>
              </span>
            </span>
            <span className="hib-ot__track" aria-hidden />
          </a>
        ))}
      </div>
      <style>{OFFER_TYPE_CSS}</style>
    </>
  );
}

// ── Tipo de oferta · vista «Normal»: tarjeta con el degradado de la modalidad, más luminosa (brillo
// superior, foco de luz que respira y un destello que cruza). Al pasar el mouse la tarjeta crece, el
// contenido se desenfoca y aparece al centro el botón de vidrio «Ver …».
const OFFER_GRAD_CSS = `
@keyframes hib-otg-breathe { 0%, 100% { opacity: 0.55; transform: translate(0, 0) scale(1); } 50% { opacity: 0.85; transform: translate(-8%, 6%) scale(1.12); } }
@keyframes hib-otg-sweep { 0%, 70% { transform: translateX(-160%) skewX(-20deg); } 100% { transform: translateX(360%) skewX(-20deg); } }
.hib-otg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 4px 0; }
.hib-otg__card { position: relative; isolation: isolate; display: block; min-height: 108px; overflow: hidden; border-radius: 16px; color: #fff; text-decoration: none;
  box-shadow: var(--glow) 0 12px 26px -10px, inset 0 1px 0 rgba(255,255,255,0.45);
  transition: transform 0.35s cubic-bezier(0.3,0,0,1), box-shadow 0.35s; }
.hib-otg__card:hover, .hib-otg__card:focus-visible { transform: scale(1.035); box-shadow: var(--glow) 0 22px 40px -12px, inset 0 1px 0 rgba(255,255,255,0.55); z-index: 1; }
.hib-otg__card:focus-visible { outline: 2px solid #fff; outline-offset: -4px; }
/* Luz: brillo de vidrio arriba, foco que respira en la esquina y destello que cruza. */
.hib-otg__card::before { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0) 60%); }
.hib-otg__light { position: absolute; top: -60%; right: -20%; z-index: 0; width: 70%; height: 180%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 55%, transparent); animation: hib-otg-breathe 5s ease-in-out infinite; }
.hib-otg__card::after { content: ""; position: absolute; top: 0; left: 0; z-index: 0; width: 30%; height: 100%; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); animation: hib-otg-sweep 5s ease-in-out infinite; }
.hib-otg__body { position: relative; z-index: 1; display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 16px; align-items: center; height: 100%; padding: 20px 24px;
  transition: filter 0.35s, opacity 0.35s, transform 0.35s; }
.hib-otg__card:hover .hib-otg__body, .hib-otg__card:focus-visible .hib-otg__body { filter: blur(6px); opacity: 0.55; transform: scale(0.98); }
/* Los íconos de vidrio van sobre blanco (regla de la skill): ficha blanca redonda sobre el degradado. */
.hib-otg__icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 14px -6px rgba(0,0,0,0.3); }
.hib-otg__txt b { font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; text-shadow: rgba(0,0,0,0.18) 0 1px 3px; }
/* Vista «Con foto» (como el banner): el auto de fondo a la derecha y la sombra del color de la modalidad
   desde la izquierda; texto encima. El hover (crece, blur, botón al centro) es el mismo. */
.hib-otg--photo .hib-otg__card { min-height: 128px; }
.hib-otg--photo .hib-otg__body { grid-template-columns: minmax(0, 1fr); padding: 20px 24px; }
.hib-otg__bgimg { position: absolute; top: 0; right: 0; bottom: 0; z-index: 0; width: 66%; pointer-events: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 38%); mask-image: linear-gradient(90deg, transparent 0%, #000 38%); }
.hib-otg__bgimg img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 68% 40%; } /* tomas de estudio (03/11): la persona con el auto, a la derecha */
.hib-otg__shade { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: var(--shade); }
.hib-otg--photo .hib-otg__txt { gap: 6px; max-width: 60%; }
.hib-otg--photo .hib-otg__txt b { font-size: 16px; letter-spacing: 0; text-transform: none; }
.hib-otg--photo .hib-otg__card:hover .hib-otg__bgimg, .hib-otg--photo .hib-otg__card:focus-visible .hib-otg__bgimg { filter: blur(6px); }
.hib-otg__bgimg { transition: filter 0.35s; }
/* Pill como la de las cards (ícono + texto en mayúsculas), en blanco para que resalte sobre el degradado. */
.hib-otg__pill { justify-self: start; display: inline-flex; align-items: center; gap: 5px; height: 18px; padding: 0 8px 0 6px; border-radius: 999px; font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; white-space: nowrap; color: var(--ink); background: #fff; box-shadow: rgba(0,0,0,0.16) 0 3px 8px; }
.hib-otg__txt { display: grid; gap: 4px; }
.hib-otg__pill svg { flex: none; width: 10px; height: 10px; }
.hib-otg--photo .hib-otg__txt { gap: 8px; }
.hib-otg__txt > span:last-child { font-size: 12px; line-height: 16.8px; opacity: 0.95; }
.hib-otg__cta { position: absolute; left: 50%; top: 50%; z-index: 2; transform: translate(-50%, -40%) scale(0.92); opacity: 0; pointer-events: none;
  transition: opacity 0.3s, transform 0.35s cubic-bezier(0.3,0,0,1), background-color 0.25s, box-shadow 0.25s; }
.hib-otg__card:hover .hib-otg__cta, .hib-otg__card:focus-visible .hib-otg__cta { opacity: 1; transform: translate(-50%, -50%) scale(1); pointer-events: auto; }
.hib-otg__cta.hib-glass { height: 36px; padding: 0 26px; }
/* Hover y press del botón de vidrio (como el del banner), sin perder el centrado. El clic sigue siendo el de la card. */
.hib-otg__card .hib-otg__cta.hib-glass:hover { transform: translate(-50%, calc(-50% - 1px)); background-color: rgba(255,255,255,0.1);
  box-shadow: rgba(0,0,0,0.16) 0 12px 28px, inset 0 1px 8px rgba(255,255,255,0.6); }
.hib-otg__card:active .hib-otg__cta.hib-glass { transform: translate(-50%, calc(-50% + 1px)) scale(0.97); background-color: rgba(32,0,104,0.22);
  box-shadow: rgba(0,0,0,0.12) 0 2px 6px, inset 0 2px 8px rgba(32,0,104,0.4); }
`;
const OFFER_GRAD = [
  { id: "negotiable" as const, title: "Recibe ofertas", text: "Envía tu propuesta y negocia directo con el vendedor", cta: "Ver lotes", photo: "/producto/index/banners/vmc/tipo-oferta-recibe-ofertas.jpg", ink: "#00777A",
    // Recibe ofertas: cian → morado, como su pill (feature nuevo).
    shade: "linear-gradient(90deg, rgba(0,150,160,0.96) 0%, rgba(40,120,205,0.82) 34%, rgba(95,60,215,0.25) 68%, rgba(95,60,215,0.05) 100%)",
    bg: "linear-gradient(135deg, #12C6CF 0%, #2F8FD4 35%, #5A3FD8 70%, #3B1FA8 100%)", glow: "rgba(90,70,215,0.45)" },
  { id: "live" as const, title: "En vivo", text: "Participa en subastas en tiempo real", cta: "Ver subastas", photo: "/producto/index/banners/vmc/tipo-oferta-en-vivo.jpg", ink: "#C2410C",
    shade: "linear-gradient(90deg, rgba(225,95,20,0.96) 0%, rgba(240,120,40,0.82) 34%, rgba(255,140,50,0.25) 68%, rgba(255,140,50,0.05) 100%)",
    bg: "linear-gradient(135deg, #FFB25E 0%, #FF8F2E 30%, #EF6A1C 65%, #B83A00 100%)", glow: "rgba(255,130,40,0.45)" },
];
// Íconos de las pills de las cards (LotCards): En vivo (aro con punto) y Negociable (etiqueta).
const LiveDot = () => <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>;
const TagIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>;
function OfferTypeGradient({ photo }: { photo?: boolean }): JSX.Element {
  return (
    <div className={`hib-otg${photo ? " hib-otg--photo" : ""}`}>
      {OFFER_GRAD.map((t) => (
        <a key={t.id} href="#" className="hib-otg__card" style={{ background: t.bg, "--glow": t.glow, "--ink": t.ink } as CSSProperties} aria-label={`${t.title}: ${t.cta}`}>
          {photo ? <><span className="hib-otg__bgimg" aria-hidden><img src={t.photo} alt="" /></span><span className="hib-otg__shade" aria-hidden style={{ "--shade": t.shade } as CSSProperties} /></> : null}
          <span className="hib-otg__light" aria-hidden />
          <span className="hib-otg__body">
            {photo ? <>
              <span className="hib-otg__txt">
                <span className="hib-otg__pill">{t.id === "live" ? <LiveDot /> : <TagIcon />}{t.title}</span>
                <span>{t.text}</span>
              </span>
            </> : <>
              <span className="hib-otg__icon"><Vidrio s={t.id === "live" ? "participaciones" : "negociaciones"} size={36} /></span>
              <span className="hib-otg__txt"><b>{t.title}</b><span>{t.text}</span></span>
            </>}
          </span>
          <span className="hib-otg__cta hib-glass" aria-hidden>{t.cta}</span>
        </a>
      ))}
      <style>{OFFER_GRAD_CSS}</style>
    </div>
  );
}

// ── Tipo de oferta · vista «Selector»: lo mínimo, como un control segmentado grande. Cada lado: el número
// en degradado como protagonista, una palabra y una flecha. Sin bajadas, sin efectos sobre la tarjeta; el
// color solo aparece en el número, el punto de estado y una línea que crece al pasar el mouse.
const OFFER_SEG_CSS = `
@keyframes hib-seg-pulse { 0%, 100% { box-shadow: 0 0 0 0 var(--ring); } 50% { box-shadow: 0 0 0 6px transparent; } }
.hib-seg { display: grid; grid-template-columns: 1fr 1fr; margin: 0; border: 1px solid #ECE8F6; border-radius: 16px; background: #FBFAFE; overflow: hidden; }
.hib-seg__opt + .hib-seg__opt::before { content: ""; position: absolute; left: 0; top: 18px; bottom: 18px; width: 1px; background: #ECE8F6; }
.hib-seg__opt { position: relative; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 18px; padding: 22px 28px; color: #14112B; text-decoration: none;
  transition: background 0.25s; }
.hib-seg__opt:hover { background: #fff; }
.hib-seg__opt::after { content: ""; position: absolute; left: 28px; right: 28px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: linear-gradient(90deg, var(--a), var(--b));
  transform: scaleX(0); transform-origin: left; transition: transform 0.35s cubic-bezier(0.3,0,0,1); }
.hib-seg__opt:hover::after { transform: scaleX(1); }
.hib-seg__opt:focus-visible { outline: 2px solid #8460E5; outline-offset: -4px; }
.hib-seg__num { font-size: 18px; line-height: 1; font-weight: 800; letter-spacing: -0.04em; font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, var(--a), var(--b)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hib-seg__lbl { display: grid; gap: 3px; }
.hib-seg__lbl b { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
.hib-seg__lbl span { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #6B6880; }
.hib-seg__lbl i { width: 7px; height: 7px; border-radius: 50%; background: var(--a); animation: hib-seg-pulse 2s ease-in-out infinite; }
.hib-seg__go { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; color: #3B1782; background: #fff; border: 1px solid #ECE8F6;
  transition: transform 0.25s cubic-bezier(0.3,0,0,1), background 0.25s, color 0.25s, border-color 0.25s; }
.hib-seg__opt:hover .hib-seg__go { transform: translateX(3px); color: #fff; border-color: transparent; background: linear-gradient(135deg, var(--a), var(--b)); }
`;
const OFFER_SEG = [
  { id: "negotiable", n: 12, label: "Recibe ofertas", note: "Disponibles", a: "#00A9B0", b: "#6A35D6", ring: "rgba(80,70,210,0.45)" },
  { id: "live", n: 21, label: "En vivo", note: "Activas ahora", a: "#FF9639", b: "#BE3D00", ring: "rgba(255,150,57,0.45)" },
];
function OfferTypeSegmented(): JSX.Element {
  return (
    <div className="hib-seg">
      {OFFER_SEG.map((t) => (
          <a key={t.id} href="#" className="hib-seg__opt" style={{ "--a": t.a, "--b": t.b, "--ring": t.ring } as CSSProperties} aria-label={`${t.label}: ${t.n}`}>
            <span className="hib-seg__num">{t.n}</span>
            <span className="hib-seg__lbl"><b>{t.label}</b><span><i aria-hidden />{t.note}</span></span>
            <span className="hib-seg__go" aria-hidden><svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          </a>
      ))}
      <style>{OFFER_SEG_CSS}</style>
    </div>
  );
}

type OfferTypeView = "normal" | "clara" | "selector" | "foto" | "corta";
const OFFER_TYPE_VIEWS: { id: OfferTypeView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "Degradado de cada modalidad" },
  { id: "clara", label: "Clara", hint: "Blanca con borde y conteo" },
  { id: "selector", label: "Selector", hint: "Mínimo: número y flecha" },
  { id: "foto", label: "Con foto", hint: "Auto de fondo y pill" },
  { id: "corta", label: "Corta", hint: "Bajo el banner; VMC ahora crece al lado" },
];
function OfferTypeCard({ view }: { view: OfferTypeView }): JSX.Element {
  return (
    <section className="hib-ot" aria-label="Tipo de oferta" style={FLAT}>
      <SectionHead title="Tipo de oferta" subtitle="Elige cómo quieres comprar" />
      {view === "normal" ? <OfferTypeGradient /> : view === "foto" || view === "corta" ? <OfferTypeGradient photo /> : view === "clara" ? <OfferTypeClara /> : <OfferTypeSegmented />}
    </section>
  );
}
// Cada mitad de la pista repite la lista 2 veces (8 logos) para que siempre cubra los 734 de ancho.
const MARQUEE_HALF = [...COMPANIES, ...COMPANIES];

function CompaniesSection({ view }: { view: CompaniesView }): JSX.Element {
  const compact = false; // a todo el ancho
  return (
    <section aria-label="Empresas que publican en VMC" style={{ ...FLAT, flex: 1, minWidth: 0, width: compact ? "auto" : "100%" }}>
      <SectionHead title="Empresas que publican en VMC" subtitle="Tiendas especializadas que publican en VMC" />
      {view === "normal" ? (
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {COMPANIES.map((c) => (
            <li key={c.name}>
              <a href="#" className="hib-emp" aria-label={`${c.name} · ${c.lots}`}>
                <span className="hib-emp__logo" style={{ background: c.tile }}><img src={c.logo} alt="" /></span>
                <span className="hib-emp__txt"><b>{c.name}</b><small>{c.lots}</small></span>
                <svg className="hib-emp__go" width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </li>
          ))}
        </ul>
      ) : view === "loop" ? (
        // Logo Loop de React Bits: loop continuo, bordes desvanecidos, se frena y agranda el logo al pasar el
        // mouse y se puede arrastrar. Nombre de la empresa debajo de cada logo.
        <div style={{ marginTop: 18 }}>
          <LogoLoop
            logos={COMPANIES.map((c) => ({ src: c.logo, alt: c.name, title: c.name, href: "#" }))}
            speed={50} gap={48} logoHeight={28} hoverSpeed={12} scaleOnHover labels="below" ariaLabel="Empresas que publican en VMC"
          />
        </div>
      ) : (
        <div className="hib-marquee" role="region" aria-label="Empresas que publican en VMC">
          <div className="hib-marquee__track">
            {[...MARQUEE_HALF, ...MARQUEE_HALF].map((c, k) => (
              // Solo la primera vuelta es navegable y la lee el lector de pantalla; las copias son decorativas.
              <a key={k} href="#" className="hib-marquee__item" aria-label={`${c.name} · ${c.lots}`}
                aria-hidden={k >= COMPANIES.length || undefined} tabIndex={k >= COMPANIES.length ? -1 : undefined}>
                <img src={c.logo} alt="" />
                <small>{c.lots}</small>
              </a>
            ))}
          </div>
        </div>
      )}
      <style>{COMPANY_CSS}</style>
    </section>
  );
}


// El primero es el destacado; los otros seis van en 2 filas de 3 a su derecha.
const LOTS: LotData[] = [
  { name: "Toyota Yaris", year: 2022, price: "US$ 2,799", variant: "live", live: true, imageSrc: "/producto/index/demo/vehicles/autoplan-yaris.png",
    kind: "Hatchback", photos: 12, km: "45,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "01:24:36", progress: 0.72 },
  { name: "Hyundai Grand i10", year: 2021, price: "US$ 2,199", variant: "live", imageSrc: "/producto/index/demo/vehicles/autoplan-grand-i10.png",
    kind: "Hatchback", photos: 9, km: "38,200 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "05:10:00", progress: 0.35 },
  { name: "Toyota Agya", year: 2023, variant: "negotiable", imageSrc: "/producto/index/demo/vehicles/autoplan-agya.png",
    kind: "Hatchback", photos: 15, km: "32,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", owner: "Único dueño" },
  { name: "Jac Refine", year: 2022, variant: "negotiable", imageSrc: "/producto/index/demo/vehicles/autoplan-refine.png",
    kind: "Van", photos: 8, km: "61,500 km", transmission: "Mecánica", fuel: "Diésel", seats: 8, city: "Arequipa", owner: "Empresa" },
  { name: "Caterpillar 320", year: 2019, price: "US$ 45,000", variant: "live", live: true, imageSrc: "/producto/index/demo/inventory-excavator-v1.png",
    kind: "Excavadora", photos: 10, km: "6,200 h", transmission: "Hidráulica", fuel: "Diésel", city: "Lima", remaining: "03:02:10", progress: 0.5 },
  { name: "Lote de vigas", year: 2024, variant: "negotiable", imageSrc: "/producto/index/demo/inventory-steel-v1.png",
    kind: "Materiales", photos: 6, km: "12 t", transmission: "Acero A36", fuel: "Vigas H", city: "Callao", owner: "Empresa" },
  { name: "Kia Sportage", year: 2020, price: "US$ 8,450", variant: "live", imageSrc: "/producto/index/demo/vehicles/autoplan-suv.png",
    kind: "SUV", photos: 14, km: "52,300 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "07:45:00", progress: 0.2 },
  // Dos más para completar las 2 filas de 4 de la Card gallery.
  { name: "Nissan Sentra", year: 2021, variant: "negotiable", imageSrc: "/producto/index/demo/vehicles/autoplan-sedan.png",
    kind: "Sedán", photos: 11, km: "29,800 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", owner: "Único dueño" },
  { name: "Toyota Hilux", year: 2020, price: "US$ 18,900", variant: "live", imageSrc: "/producto/index/demo/vehicles/autoplan-pickup.png",
    kind: "Camioneta", photos: 13, km: "64,000 km", transmission: "Mecánica", fuel: "Diésel", seats: 5, city: "Trujillo", remaining: "04:20:00", progress: 0.45 },
];

// Misma caja que AuctioneerSection de Concorde (766 de ancho, radio 16, sombra del homepage), con tres
// vistas para comparar (selector flotante a la derecha del bloque). Todas usan el OfferCard de Concorde;
// solo cambian medidas por clase.
//   · normal   → 4 OfferCard en fila, como la sección del Subastador.
//   · gallery  → tipo «Oferta del día» de Mercado Libre: destacado alto a la izquierda + 2 filas de 3 «short».
//   · featured → destacado más chico + 3 autos más grandes que las «short» (menos que el destacado).
type LotsView = "normal" | "gallery" | "featured" | "listado" | "listado-gallery";
const LOTS_VIEWS: { id: LotsView; label: string; hint: string }[] = [
  { id: "gallery", label: "Card gallery", hint: "Destacada + 2 filas de 4" },
  { id: "featured", label: "Card destacada", hint: "Destacada + 3 autos" },
  { id: "listado", label: "Listado", hint: "Foto a la izquierda, detalle a la derecha" },
  { id: "listado-gallery", label: "Listado gallery", hint: "Destacada Holo + listado en 2 columnas" },
];
// Segunda tienda (referencia): Mapfre, con destacado sin «En vivo» y 8 chicas.
const MAPFRE_LOTS: LotData[] = [
  { name: "Hyundai Tucson", year: 2021, price: "US$ 11,400", variant: "live", imageSrc: "/producto/index/demo/vehicles/mapfre-tucson.png",
    kind: "SUV", photos: 16, km: "34,500 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "02:48:10", progress: 0.68 },
  { name: "Kia Rio", year: 2020, price: "US$ 6,300", variant: "live", imageSrc: "/producto/index/demo/vehicles/mapfre-rio.png",
    kind: "Sedán", photos: 10, km: "48,000 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Toyota Hilux", year: 2019, variant: "negotiable", imageSrc: "/producto/index/demo/vehicles/mapfre-pickup.png",
    kind: "Camioneta", photos: 12, km: "72,000 km", transmission: "Mecánica", fuel: "Diésel", seats: 5, city: "Arequipa" },
  { name: "Nissan Versa", year: 2022, variant: "negotiable", imageSrc: "/producto/index/demo/vehicles/autoplan-sedan.png",
    kind: "Sedán", photos: 9, km: "21,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Chevrolet Onix", year: 2021, price: "US$ 5,900", variant: "live", imageSrc: "/producto/index/demo/vehicles/autoplan-grand-i10.png",
    kind: "Hatchback", photos: 8, km: "39,500 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Mitsubishi L200", year: 2018, variant: "negotiable", imageSrc: "/producto/index/demo/vehicles/autoplan-pickup.png",
    kind: "Camioneta", photos: 11, km: "96,000 km", transmission: "Mecánica", fuel: "Diésel", seats: 5, city: "Trujillo" },
  { name: "Suzuki Vitara", year: 2020, price: "US$ 8,700", variant: "live", imageSrc: "/producto/index/demo/vehicles/autoplan-suv.png",
    kind: "SUV", photos: 13, km: "44,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Honda HR-V", year: 2019, variant: "negotiable", imageSrc: "/producto/index/demo/vehicles/autoplan-agya.png",
    kind: "SUV", photos: 10, km: "58,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Volkswagen Tiguan", year: 2020, price: "US$ 13,200", variant: "live", imageSrc: "/producto/index/demo/vehicles/autoplan-yaris.png",
    kind: "SUV", photos: 14, km: "41,000 km", transmission: "Automática", fuel: "Gasolina", seats: 7, city: "Lima" },
];
type Store = { name: string; logo: string; lots: LotData[]; total: number };
const STORES: Store[] = [
  { name: "Autoplan", logo: "/producto/index/demo/empresas/autoplan.png", lots: LOTS, total: 9 },
  { name: "Mapfre", logo: "/producto/index/demo/empresas/mapfre.png", lots: MAPFRE_LOTS, total: 9 },
];

const CAR_LOTS = ["Hyundai Grand i10", "Toyota Agya", "Kia Sportage", "Kia Rio", "Toyota Hilux", "Nissan Versa"];

// Estilo de las cards de lote. «normal» es el OfferCard de Concorde; «ficha» e «inmersiva» son variantes
// nuevas del lab (LotCards.tsx). En «Card gallery» con un estilo nuevo, las chicas usan la Inmersiva chica.
type CardStyle = "holo-curva" | "normal" | "ficha" | `pro-${ProTheme}` | `leg-${LegendTier}` | `ficha-${FichaLayout}` | "inmersiva" | "resumen" | "relieve" | "cristal";
const CARD_STYLES: { id: CardStyle; label: string; hint: string }[] = [
  { id: "holo-curva", label: "Holo curva", hint: "Default: destacada Holo + curvas" },
  { id: "ficha", label: "Ficha", hint: "Foto + datos, precio y estado" },
  { id: "ficha-social", label: "Prueba social", hint: "Ofertas y visitas" },
  { id: "relieve", label: "Relieve", hint: "Sombras internas y franja curva" },
];

const GALLERY_HEIGHT = 2 * 170 + 12;

const LOTS_CSS = `
.hib-eblist { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
.hib-eblist--one { grid-template-columns: minmax(0, 1fr); }
.hib-eblist--two { column-gap: 20px; }
.hib-eblist--two > .lc-eb:nth-child(-n + 2) { padding-top: 0; }
.hib-eblist--two > .lc-eb:nth-last-child(-n + 2) { border-bottom: 0; padding-bottom: 0; }
.hib-eblist--one > .lc-eb:first-child { padding-top: 0; }
.hib-eblist--one > .lc-eb:last-child { border-bottom: 0; padding-bottom: 0; }
/* Cards de Concorde dentro de grillas fluidas: ocupan su columna (el OfferCard las fija en px). */
.hib-fluid > .pcard { width: 100%; }
/* Destacado de la Card gallery (352 de alto): foto más baja y detalles más chicos para que entre todo. */
.hib-dense .lc .lc-media { min-height: 84px !important; }
.hib-dense .lc .lc-body, .hib-dense .lp .lc-body { gap: 5px; padding: 8px 10px 12px; }
.hib-dense .lc .lc-sub { margin-top: 0; }
.hib-dense .lc .lc-bar { height: 5px; }
.hib-dense .lc .lc-pricerow > svg { width: 24px; height: 26px; }
.hib-dense .lc .lc-cta { height: 30px; margin-top: 4px; }
.hib-dense .lc .lp-tiles span { padding: 4px 3px; }
.hib-dense .lc .lc-sum__head { padding: 6px 10px; }
.hib-dense .lc .lc-sum__stats span { padding: 4px; }
.hib-dense .lc .lc-sum__price { padding: 4px 8px 8px; }
.hib-dense .lc .lc-rel { padding: 10px 12px 12px; }
.hib-dense .lc .lc-rel__price { padding-top: 8px; }
.hib-dense .lc .lc-glass { padding: 10px 6px 2px; }
.hib-dense .lc .lc-glass__rule { margin-top: 6px; }
.hib-dense .lc .lc-glass__price { padding: 6px 10px; }
.pcard.hib-feat { width: 100%; height: 100%; }
.pcard.hib-feat .pcard__img { flex: 1; min-height: 0; height: auto; }
.pcard.hib-feat .pcard__name { font-size: 20px; line-height: 24px; }
.pcard.hib-feat .pcard__year { font-size: 12px; }
.pcard.hib-feat--sm .pcard__name { font-size: 18px; line-height: 22px; }
.pcard.hib-mid { width: 160px; height: 262px; }
.pcard.hib-mid .pcard__img { height: 142px; }
/* Precio y corazón más chicos que los del OfferCard (gema 30 × 32 · texto 13 · like 30). */
.pcard.hib-mid .pcard-pprice { width: 24px; height: 26px; }
.pcard.hib-mid .pcard-pprice svg { width: 22px; height: 24px; }
.pcard.hib-mid .pcard__price-left { gap: 4px; }
.pcard.hib-mid .pcard__price-text { font-size: 11.5px; }
.pcard.hib-mid .pcard-like { width: 24px; height: 24px; }
.pcard.hib-mid .pcard-like svg { width: 13px; height: 13px; }
/* Etiqueta de precio de las short, más chica que la de Concorde (24 de alto · texto 13). */
.pcard--short .pcard__price-badge { height: 20px; top: 7px; left: 6px; padding: 0 8px 0 2px; gap: 2px; border-radius: 10px; }
.pcard--short .pcard__price-badge::before { border-radius: 10px; }
.pcard--short .pcard__price-badge-gem { transform: scale(0.8); }
.pcard--short .pcard__price-badge-text { font-size: 11px; }
`;

type Lot = LotData;
function badgeFor(lot: Lot, isFeatured: boolean): JSX.Element | undefined {
  const live = lot.live ? <BadgeStatus variant="live" /> : null;
  if (!isFeatured) return live ?? undefined;
  // Pill «Destacado»: el BadgeStatus morado de Concorde (variante «proxima») sin el reloj, a la izquierda de EN VIVO.
  return <span style={{ display: "inline-flex", gap: 6 }}><BadgeStatus variant="proxima" label="Destacado" icon={false} />{live}</span>;
}
function lotCard(lot: Lot, opts: { className?: string; size?: "short"; featured?: boolean } = {}): JSX.Element {
  return (
    <OfferCard key={lot.name} className={opts.className} size={opts.size} variant={lot.variant} name={lot.name} year={lot.year}
      price={lot.price} imageSrc={lot.imageSrc} badge={badgeFor(lot, !!opts.featured)} elevated />
  );
}

function LotsSection({ view, card, store }: { view: LotsView; card: CardStyle; store: Store }): JSX.Element {
  const LOTS = store.lots;
  const [featured, ...rest] = LOTS;
  const count = store.total;
  // Card «grande» según el estilo elegido (en Normal, el OfferCard de Concorde).
  const big = (lot: Lot, o: { featured?: boolean; width?: number | string; height?: number | string; fill?: boolean } = {}) =>
    card === "holo-curva" ? <FichaLegend key={lot.name} lot={lot} tier="holo" curve featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("leg-") ? <FichaLegend key={lot.name} lot={lot} tier={card.slice(4) as LegendTier} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("pro-") ? <FichaPro key={lot.name} lot={lot} theme={card.slice(4) as ProTheme} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("ficha-") ? <FichaPlus key={lot.name} lot={lot} layout={card.slice(6) as FichaLayout} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "ficha" ? <FichaCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "resumen" ? <SummaryCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "relieve" ? <ReliefCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} compact={view !== "gallery"} />
      : card === "cristal" ? <GlassCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : <ImmersiveCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height ?? 262} />;
  let body: JSX.Element;
  if (view === "listado") {
    // Listado en 2 columnas: cada lote con la foto a la izquierda y el detalle a la derecha.
    body = <div className="hib-eblist">{LOTS.slice(0, 6).map((lot) => <EbayLotRow key={lot.name} lot={lot} store={store.name} />)}</div>;
  } else if (view === "listado-gallery") {
    // Destacada vertical (Holo curva) a la izquierda y 6 lotes en listado (2 columnas × 3 filas); la destacada toma el alto de la lista.
    body = (
      <div className="hib-listado-gallery" style={{ display: "grid", gridTemplateColumns: "292px minmax(0, 1fr)", gap: 20, alignItems: "stretch" }}>
        <div style={{ display: "flex", minWidth: 0 }}>
          <FichaLegend lot={featured} tier="holo" curve featured width="100%" height="100%" mediaFill />
        </div>
        <div className="hib-eblist hib-eblist--two">{rest.slice(0, 6).map((lot) => <EbayLotRow key={lot.name} lot={lot} store={store.name} size="sm" />)}</div>
      </div>
    );
  } else if (card === "normal") {
    if (view === "normal") {
      body = <div className="hib-fluid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>{LOTS.slice(0, 4).map((lot) => lotCard(lot))}</div>;
    } else if (view === "gallery") {
      body = (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 16, height: GALLERY_HEIGHT }}>
          <div style={{ display: "flex", minWidth: 0, minHeight: 0 }}>{lotCard(featured, { className: "hib-feat", featured: true })}</div>
          <div className="hib-fluid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>{rest.map((lot) => lotCard(lot, { size: "short" }))}</div>
        </div>
      );
    } else {
      const cars = rest.filter((lot) => CAR_LOTS.includes(lot.name)).slice(0, 3);
      body = (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.8fr)", gap: 16, height: 300 }}>
          <div style={{ display: "flex", minWidth: 0 }}>{lotCard(featured, { className: "hib-feat hib-feat--sm", featured: true })}</div>
          <div className="hib-fluid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignItems: "start" }}>{cars.map((lot) => lotCard(lot, { className: "hib-mid" }))}</div>
        </div>
      );
    }
  } else if (view === "normal") {
    body = <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, alignItems: "stretch" }}>{LOTS.slice(0, 4).map((lot) => big(lot))}</div>;
  } else if (view === "gallery") {
    // Mismas proporciones que la galería Normal: 2 filas de 170 (las «short» de Concorde) = 352 de alto.
    // El destacado (estilo elegido) entra en esos 352: en .hib-dense la foto cede alto y los detalles
    // van más chicos. Las seis chicas, Inmersiva «sm» de 134 × 170.
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "292px minmax(0, 1fr)", gap: 16 }}>
        <div className="hib-dense" style={{ display: "flex", minWidth: 0, height: GALLERY_HEIGHT }}>{big(featured, { featured: true, height: "100%", fill: true })}</div>
        <div className="hib-smallgrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 134px)", justifyContent: "space-between", gridTemplateRows: "repeat(2, 170px)", gridAutoRows: 0, overflow: "hidden", gap: 12 }}>
          {rest.map((lot) => <CompactCurveCard key={lot.name} lot={lot} />)}
        </div>
      </div>
    );
  } else {
    const cars = rest.filter((lot) => CAR_LOTS.includes(lot.name)).slice(0, 3);
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.8fr)", gap: 16, alignItems: "stretch" }}>
        <div style={{ display: "flex", minWidth: 0 }}>{big(featured, { featured: true, height: "100%", fill: true })}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignItems: "stretch" }}>{cars.map((lot) => big(lot))}</div>
      </div>
    );
  }
  return (
    <section
      aria-label={`Lotes de ${store.name}`}
      style={{
        boxSizing: "border-box", width: "100%", background: "#ffffff", borderRadius: 16,
        boxShadow: SHADOW, padding: "0 0 16px", display: "flex", flexDirection: "column", gap: 16, fontFamily: FONT,
      }}
    >
      {/* Cabecera de tienda (referencia): logo 56 × 44, nombre, oportunidades y «Ver todo el lote». */}
      <header className="hib-lots-head" style={{ boxSizing: "border-box", flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: 68, padding: "0 24px", borderBottom: "1px solid #e8ddff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <span style={{ flex: "none", display: "grid", placeItems: "center", width: 56, height: 44, padding: "6px 8px", boxSizing: "border-box", borderRadius: 8, border: "1px solid #e8ddff", background: "#fff" }}>
            <img src={store.logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
          </span>
          <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 16, lineHeight: "20px", fontWeight: 700, letterSpacing: "-0.01em", color: "#3b1782", whiteSpace: "nowrap" }}>{store.name}</h3>
            <p style={{ margin: 0, fontSize: 12, lineHeight: "16.8px", color: "#6B6878" }}>{count} oportunidades</p>
          </div>
        </div>
        <div style={{ flex: "none" }}><ProfileButton className="hib-lots-cta" aria-label="Ver todo el lote"><span>Ver todo</span><span>el lote</span></ProfileButton></div>
      </header>
      <div style={{ padding: "0 16px" }}>{body}</div>
      <style>{LOTS_CSS}</style>
      <LotCardStyles />
    </section>
  );
}

const FEED_VIEWS: { id: FeedView; label: string; hint: string }[] = [
  { id: "timeline", label: "Timeline", hint: "Estilo X / Twitter" },
  { id: "normal", label: "Listado", hint: "Foto, lote y precio" },
];
// Inventario de la demo (V en vivo + N negociables) y velocidad del reloj: ×1 son los 45 s reales entre entradas simuladas.
const FEED_SCENARIOS = SCENARIOS.map(({ id, label, hint }) => ({ id, label, hint }));
const FEED_SPEEDS = [
  { id: "1", label: "×1", hint: "45 s entre entradas" },
  { id: "10", label: "×10", hint: "4,5 s entre entradas" },
];
// Diseño de VMC ahora (no cuándo aparece cada entrada): cómo se ve la publicidad, su badge y las visualizaciones.
const FEED_ADS: { id: AdStyle; label: string; hint: string }[] = [
  { id: "post", label: "Post", hint: "Texto y foto debajo" },
  { id: "tarjeta", label: "Tarjeta", hint: "Foto arriba, texto abajo" },
  { id: "banner", label: "Banner", hint: "Foto a lo ancho, texto encima" },
];
const FEED_AD_BADGES: { id: AdBadge; label: string; hint: string }[] = [
  { id: "sin", label: "Sin badge", hint: "Solo la foto y el botón" },
  { id: "foto", label: "Sobre la foto", hint: "Badge en la esquina" },
  { id: "pill", label: "Insignia", hint: "Como los demás tipos" },
  { id: "texto", label: "En la hora", hint: "Publicidad en vez de la hora" },
];
const FEED_VIEWS_STYLES: { id: ViewsStyle; label: string; hint: string }[] = [
  { id: "ojo", label: "Ojo", hint: "Ojito y 1,2 mil" },
  { id: "completo", label: "Ojo y número", hint: "Ojito y 1,234" },
  { id: "ojo-palabra", label: "Ojo y palabra", hint: "Ojito y 1,2 mil visitas" },
  { id: "texto", label: "Texto", hint: "1,2 mil visualizaciones" },
];
const FEED_SHARE_ICONS: { id: ShareIcon; label: string; hint: string }[] = [
  { id: "caja", label: "Flecha y caja", hint: "Como en el iPhone" },
  { id: "nodos", label: "Tres puntos", hint: "El ícono de compartir" },
  { id: "avion", label: "Avión", hint: "El de antes" },
];
const FEED_ACTS: { id: ActsAlign; label: string; hint: string }[] = [
  { id: "palabra", label: "Palabra completa", hint: "1,234 visualizaciones" },
  { id: "extremos", label: "Extremos", hint: "Visitas a un lado, compartir al otro" },
  { id: "izquierda", label: "A la izquierda", hint: "Todo junto a la izquierda" },
  { id: "derecha", label: "A la derecha", hint: "Todo junto a la derecha" },
];
const FEED_TAGS: { id: TagsMode; label: string; hint: string }[] = [
  { id: "sin", label: "Sin insignia", hint: "Solo autor, texto y foto" },
  { id: "con", label: "Con insignia", hint: "En vivo, Recibe ofertas, Blog…" },
];
const FEED_SCROLLS: { id: ScrollStyle; label: string; hint: string }[] = [
  { id: "gris", label: "Gris claro", hint: "Fino, sin sombra" },
  { id: "vidrio", label: "Vidrio", hint: "Blanco translúcido" },
  { id: "morado", label: "Morado", hint: "El de antes" },
];
const FEED_TONES: { id: ColorTone; label: string; hint: string }[] = [
  { id: "oscuro", label: "Oscuro", hint: "Naranja #C2410C, cian #00777A" },
  { id: "medio", label: "Medio", hint: "Naranja #EF852E, cian #00AEB1" },
  { id: "ds", label: "Design system", hint: "Naranja #FF9639, cian #00D2D3" },
];

// Selector flotante de vistas, pegado a la derecha del bloque (fuera de los 798 del homepage). Solo QA.
const SWITCH_CSS = `
.hib-switches { position: absolute; top: 0; left: calc(100% + 32px); z-index: 5; display: flex; flex-direction: column; gap: 12px;
  width: clamp(0px, calc(50vw - 536px), 360px); }
/* Cada grupo no pasa del alto de su sección (si no, se monta sobre el de la siguiente): scroll propio, con aire para la sombra. */
.hib-switches { box-sizing: border-box; max-height: 100%; margin: -4px; padding: 4px 8px 12px 4px; overflow-y: auto; overscroll-behavior: contain;
  scrollbar-width: thin; scrollbar-color: #8460E5 transparent; }
.hib-switches > * { flex: none; }
.hib-switch { width: 100%; box-sizing: border-box; padding: 10px;
  border-radius: 12px; background: #fff; box-shadow: rgba(32,0,104,0.16) 0 6px 20px; font-family: ${FONT}; }
.hib-switch > span { display: block; margin: 0 2px 8px; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #8a879c; }
.hib-switch__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(104px, 100%), 1fr)); gap: 4px; }
.hib-switch button { display: block; width: 100%; padding: 7px 9px; border: 1px solid #e3e1ec; border-radius: 9px; font: inherit; text-align: left; background: #fff; cursor: pointer; }
.hib-switch button b { display: block; font-size: 12px; color: #191C1C; }
.hib-switch button small { display: block; margin-top: 1px; font-size: 10.5px; color: #6b6880; }
.hib-switch button:hover { border-color: #b9a8ef; }
.hib-switch button[aria-pressed="true"] { border-color: #8460e5; background: #f3effd; }
.hib-switch button[aria-pressed="true"] b { color: #3b1782; }
.hib-slider > span { display: flex; justify-content: space-between; align-items: baseline; }
.hib-slider > span b { font-size: 12px; letter-spacing: 0; text-transform: none; color: #3b1782; font-variant-numeric: tabular-nums; }
.hib-slider input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; margin: 6px 0 4px; border-radius: 999px; outline: none; cursor: pointer; }
.hib-slider input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff;
  background: linear-gradient(135deg, #8460E5, #3B1782); box-shadow: rgba(59,23,130,0.35) 0 2px 6px; }
.hib-slider input[type="range"]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; background: #5A35C2; box-shadow: rgba(59,23,130,0.35) 0 2px 6px; }
.hib-slider input[type="range"]:focus-visible::-webkit-slider-thumb { outline: 2px solid #8460E5; outline-offset: 2px; }
.hib-slider__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; }
.hib-slider__foot small { font-size: 10.5px; color: #8a879c; }
.hib-slider__foot button { width: auto !important; padding: 3px 8px !important; font-size: 11px !important; font-weight: 700; color: #3b1782; }
.hib-slider__foot button:disabled { opacity: 0.45; cursor: default; }
.hib-lots-cta .pprofilebtn__label > span + span::before { content: " "; }
/* Botones flotantes de QA: presets Opción A / B y mostrar u ocultar los selectores. */
.hib-controls-toggle { position: fixed; right: 18px; bottom: 18px; z-index: 10; min-height: 32px; padding: 0 11px; border: 1px solid #d9d0f2; border-radius: 999px;
  color: #3b1782; background: rgba(255,255,255,0.94); box-shadow: rgba(32,0,104,0.16) 0 4px 14px; font: 700 12px/1 ${FONT}; cursor: pointer; }
.hib-controls-toggle:hover { border-color: #8460e5; background: #f8f6ff; }
.hib-controls-toggle:focus-visible { outline: 2px solid #8460e5; outline-offset: 3px; }
.hib-option-toggle { position: fixed; right: 18px; bottom: 58px; z-index: 10; min-height: 32px; padding: 0 11px; border: 1px solid #8460e5; border-radius: 999px;
  color: #fff; background: #3b1782; box-shadow: rgba(32,0,104,0.22) 0 4px 14px; font: 700 12px/1 ${FONT}; cursor: pointer; }
.hib-option-toggle--a { bottom: 98px; }
.hib-option-toggle:hover { background: #4c238f; }
.hib-option-toggle:focus-visible { outline: 2px solid #8460e5; outline-offset: 3px; }
`;
// Móvil y tablet: todo en una columna; los selectores quedan en el flujo y los botones flotantes se ocultan.
const MOBILE_CSS = `
@media (max-width: 1023px) {
  .hib-home { overflow-x: clip; padding: 14px !important; gap: 18px !important; }
  /* Móvil: banner y justo después VMC ahora (pedido de Fernando); Tipo de oferta baja, compacto, después de las tiendas. */
  .hib-top-grid { grid-template-columns: minmax(0, 1fr) !important; grid-template-rows: 300px 390px auto !important; gap: 14px !important; }
  .hib-top-grid > [data-slot="principal-banner"] { grid-column: 1 !important; grid-row: 1 !important; }
  .hib-top-grid > [data-slot="secondary-banner"] { grid-column: 1 !important; grid-row: 2 !important; height: 390px !important; }
  .hib-top-grid > [data-slot="offer-type"] { display: none; }
  .hib-ot-mobile { display: block !important; }
  /* Tipo de oferta en móvil: dos tarjetas lado a lado y más bajas (Normal / Con foto / Corta). */
  .hib-ot-mobile .hib-otg { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
  .hib-ot-mobile .hib-otg__card, .hib-ot-mobile .hib-otg--photo .hib-otg__card { min-height: 104px; }
  .hib-ot-mobile .hib-otg__body, .hib-ot-mobile .hib-otg--photo .hib-otg__body { grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 14px; }
  .hib-ot-mobile .hib-otg__icon { width: 40px; height: 40px; }
  .hib-ot-mobile .hib-otg__icon .vd { width: 28px; height: 28px; }
  .hib-ot-mobile .hib-otg--photo .hib-otg__txt { max-width: none; }
  .hib-ot-mobile .hib-otg__bgimg { width: 100%; opacity: 0.55; }
  .hib-ot-mobile .hib-otg__txt > span:last-child { font-size: 11px; line-height: 15px; }
  /* Modo Feed: sin VMC ahora, la fila 3 (390) desaparece. */
  .hib-top-grid[data-nofeed] { grid-template-rows: 300px auto !important; }
  /* «Ver más»: VMC ahora crece con su contenido (sin el alto fijo de 390 ni scroll interno). */
  .hib-top-grid[data-feedmore] { grid-template-rows: 300px auto auto !important; }
  .hib-top-grid[data-feedmore] > [data-slot="secondary-banner"] { height: auto !important; }
  .hib-top-grid > [data-slot="ticker"] { grid-column: 1 !important; grid-row: 2 !important; }
  /* Banner / Feed: el espacio crece para que el feed se lea (selector 36 + 8 + 356). */
  .hib-top-grid[data-feedslot] { grid-template-rows: 400px auto !important; }
  .hib-top-grid > .hib-switches { position: static !important; grid-column: 1 !important; grid-row: 3 !important; width: 100% !important; margin-top: 0; }
  .hib-home .hib-switches { position: static !important; width: 100% !important; margin-top: 12px; }
  .hib-home .hib-switch__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hib-section-head { align-items: flex-start !important; flex-wrap: wrap; gap: 10px !important; }
  .hib-section-head__title { white-space: normal !important; }
  .hib-controls-toggle, .hib-option-toggle { display: none !important; }
  .hib-listado-gallery { grid-template-columns: minmax(0, 1fr) !important; gap: 14px !important; }
  .hib-listado-gallery > div:first-child { min-height: 360px; }
  /* La cabecera conserva una fila; solo la etiqueta del CTA se divide en dos líneas. */
  .hib-lots-head { height: 68px !important; min-height: 0; flex-wrap: nowrap; align-items: center !important; padding: 0 16px !important; gap: 10px !important; }
  .hib-lots-head > div:first-child { min-width: 0; }
  .hib-lots-cta { gap: 6px; }
  .hib-lots-cta .pprofilebtn__label { display: inline-flex; flex-direction: column; align-items: flex-end; line-height: 15px; white-space: nowrap; }
  .hib-lots-cta .pprofilebtn__label > span { display: block; white-space: nowrap; }
  .hib-lots-cta .pprofilebtn__label > span + span::before { content: none; }
  .hib-eblist, .hib-eblist--two { grid-template-columns: minmax(0, 1fr) !important; column-gap: 0 !important; }
  .hib-eblist--two > .lc-eb { padding-top: 10px; padding-bottom: 10px; border-bottom: 1px solid #EFEDF5; }
  .hib-ot__grid { grid-template-columns: minmax(0, 1fr) !important; gap: 12px !important; }
  .hib-otg { grid-template-columns: minmax(0, 1fr) !important; gap: 12px !important; }
  .hib-otg--photo .hib-otg__card { min-height: 128px; }
  /* Solo slides sin toma a lo ancho: en las «full» el texto se queda en su columna (si no, pisa a las personas, p. ej. Recibe ofertas). */
  .hp-slide:not(:has(.hp-photo.full)) .hp-copy { left: 20px; right: auto; width: calc(100% - 40px); }
  .hp-slide:not(:has(.hp-photo.full)) .hp-p { max-width: 100%; white-space: normal; overflow-wrap: anywhere; }
  .hib-sell__layout { grid-template-columns: minmax(0, 1fr) !important; }
  .hib-sell__benefit { min-height: 270px; }
  /* Categorías: en móvil, 2 columnas y cards verticales salvo las que se deslizan (carrusel, 5 + scroll, 5 + flecha). */
  .hib-home .hib-cats-l--s5 > li, .hib-home .hib-cats-l--f5 > li { flex: 0 0 150px !important; }
  .hib-home .hib-cats-nav__btn--next { right: -4px; } .hib-home .hib-cats-nav__btn--prev { left: -4px; }
  .hib-home .hib-cats-l:not(.hib-cats-l--carrusel):not(.hib-cats-l--s5):not(.hib-cats-l--f5) { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .hib-home .hib-cats-l:not(.hib-cats-l--carrusel):not(.hib-cats-l--s5):not(.hib-cats-l--f5) > li { grid-column: auto !important; }
  .hib-home .hib-cats-l:not(.hib-cats-l--carrusel):not(.hib-cats-l--s5):not(.hib-cats-l--f5) .hib-cat, .hib-home .hib-cats-l:not(.hib-cats-l--carrusel):not(.hib-cats-l--s5):not(.hib-cats-l--f5) .hib-pcat { flex-direction: column !important; }
  .hib-home .hib-cats-l:not(.hib-cats-l--carrusel):not(.hib-cats-l--s5):not(.hib-cats-l--f5) .hib-cat > img { width: 100% !important; height: 92px !important; min-height: 0 !important; }
  .hib-home .hib-cats-l:not(.hib-cats-l--carrusel):not(.hib-cats-l--s5):not(.hib-cats-l--f5) .hib-pcat__media { width: auto !important; height: 96px !important; min-height: 0 !important; margin: 6px 6px 0 !important; }
}
@media (max-width: 480px) {
  .hib-home { padding: 12px !important; }
  .hib-top-grid { grid-template-rows: 300px 390px auto !important; }
  .hib-top-grid > [data-slot="secondary-banner"] { height: 390px !important; }
  .hib-home .hib-switch__grid { grid-template-columns: minmax(0, 1fr); }
  .hib-listado-gallery > div:first-child { min-height: 330px; }
  .hib-sell__choice { grid-template-columns: 104px minmax(0, 1fr); min-height: 128px; }
  .hib-sell__copy { padding: 12px; }
  .hib-sell__copy h3 { font-size: 15px; line-height: 19px; }
  .hib-sell__copy p { font-size: 12px; line-height: 17px; }
}
`;
// Control QA: alto del banner principal y de «VMC ahora» (misma fila), para ver cómo se adaptan.
const HERO_MIN = 220;
const HERO_MAX = 460;
const HERO_DEFAULT = 368;

// Presets de QA. Opción A: Tipo de oferta «Corta» bajo el banner; Opción B: igual pero con Tipo de oferta «Clara».
type Preset = {
  lotsView: LotsView; cardStyle: CardStyle; lotsView2: LotsView; cardStyle2: CardStyle; companiesView: CompaniesView;
  feedView: FeedView; offerView: OfferTypeView; heroH: number; categoriesView: CategoriesView;
};
const OPTION_A: Preset = {
  lotsView: "listado-gallery", cardStyle: "holo-curva", lotsView2: "listado-gallery", cardStyle2: "holo-curva", companiesView: "slider",
  feedView: "timeline", offerView: "corta", heroH: 300, categoriesView: "normal",
};
const OPTION_B: Preset = { ...OPTION_A, offerView: "clara" };
const PRESETS: Record<"a" | "b", Preset> = { a: OPTION_A, b: OPTION_B };
type PresetId = keyof typeof PRESETS;
const isPresetId = (v: unknown): v is PresetId => v === "a" || v === "b";
function HeightSlider({ value, onChange }: { value: number; onChange: (v: number) => void }): JSX.Element {
  return (
    <div className="hib-switch hib-slider" role="group" aria-label="Alto del banner">
      <span>Alto del banner<b>{value}px</b></span>
      <input type="range" min={HERO_MIN} max={HERO_MAX} step={4} value={value} aria-label="Alto del banner en píxeles"
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(90deg, #8460E5 ${((value - HERO_MIN) / (HERO_MAX - HERO_MIN)) * 100}%, #E6E1F5 0)` }} />
      <div className="hib-slider__foot"><small>{HERO_MIN}</small>
        <button type="button" onClick={() => onChange(HERO_DEFAULT)} disabled={value === HERO_DEFAULT}>Restablecer {HERO_DEFAULT}</button>
        <small>{HERO_MAX}</small></div>
    </div>
  );
}

function Switches({ children, visible }: { children: ReactNode; visible: boolean }): JSX.Element | null {
  return visible ? <div className="hib-switches">{children}</div> : null;
}
function ViewSwitch<T extends string>({ title, suffix = "vista", options, value, onChange }: {
  title: string; suffix?: string; options: { id: T; label: string; hint: string }[]; value: T; onChange: (v: T) => void;
}): JSX.Element {
  return (
    <div className="hib-switch" role="group" aria-label={`${title} · ${suffix}`}>
      <span>{title}{suffix ? ` · ${suffix}` : ""}</span>
      <div className="hib-switch__grid">
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}><b>{o.label}</b><small>{o.hint}</small></button>
        ))}
      </div>
    </div>
  );
}

/** `hideFeed`: modo «Feed» del móvil (barra inferior Inicio / Feed): VMC ahora sale del home y pasa a su propia pestaña. */
// Móvil · alternativa «Banner / Feed»: un selector arriba alterna, en el mismo espacio, el banner y VMC ahora.
const BFS_CSS = `
.hib-bfs { display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; min-height: 0; }
.hib-bfs__tabs { flex: none; display: grid; grid-template-columns: 1fr 1fr; height: 36px; padding: 3px; border-radius: 999px; background: #F3EFFD; }
.hib-bfs__tabs button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 999px; background: transparent; cursor: pointer;
  font: 700 13px/1 ${FONT}; color: #6B6878; transition: background 0.2s, color 0.2s, box-shadow 0.2s; }
.hib-bfs__tabs button[aria-pressed="true"] { color: #3B1782; background: #fff; box-shadow: rgba(32,0,104,0.14) 0 2px 8px; }
.hib-bfs__tabs button:focus-visible { outline: 2px solid #8460E5; outline-offset: 1px; }
.hib-bfs__tabs i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; }
.hib-bfs__body { position: relative; flex: 1; min-height: 0; display: flex; }
.hib-bfs__body > * { flex: 1; }
`;
function BannerFeedSlot({ feedView, nav, fx }: { feedView: FeedView; nav: BannerNav; fx: BannerFx }): JSX.Element {
  const [show, setShow] = useState<"banner" | "feed">("banner");
  return (
    <div className="hib-bfs">
      <div className="hib-bfs__tabs" role="group" aria-label="Banner o VMC ahora">
        <button type="button" aria-pressed={show === "banner"} onClick={() => setShow("banner")}>Destacados</button>
        <button type="button" aria-pressed={show === "feed"} onClick={() => setShow("feed")}><i aria-hidden />En vivo</button>
      </div>
      <div className="hib-bfs__body">{show === "banner" ? <PrincipalBanner nav={nav} fx={fx} /> : <VmcAhora view={feedView} live={false} />}</div>
      <style>{BFS_CSS}</style>
    </div>
  );
}

const AD_STRIP_CSS = `
.hib-adstrip { position: relative; display: block; width: 100%; overflow: hidden; border-radius: 16px; box-shadow: ${SHADOW}; }
.hib-adstrip iframe { position: absolute; top: 0; left: 0; display: block; border: 0; transform-origin: 0 0; }
`;
// Publicidad de Subastop sobre Mapfre (skill banners-subastop, 03-tecnologia: distinta de la del sidebar, 01-general): franja 1532 × 200 en escritorio y 776 × 232
// en móvil. El iframe se dibuja a su tamaño de diseño y se escala al ancho disponible, como una imagen.
function AdStrip(): JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const f = w > 0 && w < 600 ? { id: "strip776", w: 776, h: 232 } : { id: "strip1532", w: 1532, h: 200 };
  const s = w / f.w;
  return (
    <aside ref={ref} className="hib-adstrip" aria-label="Publicidad" style={{ aspectRatio: `${f.w} / ${f.h}` }}>
      {w ? <iframe key={f.id} src={`/producto/index/banners/venta-empresa.html?v=03-tecnologia&f=${f.id}`} title="Venta para empresas: ¿Renovaste tecnología? Vende la anterior."
        width={f.w} height={f.h} loading="lazy" style={{ transform: `scale(${s})` }} /> : null}
    </aside>
  );
}

// Todos los selectores de QA en una lista: el panel de la vista mobile los muestra igual que escritorio y los envía al teléfono.
export type QaKey = "bannerNav" | "bannerFx" | "feedView" | "feedScenario" | "feedSpeed" | "feedAd" | "feedAdBadge" | "feedViews" | "feedShare" | "feedActs" | "feedTags" | "feedScroll" | "feedTone" | "offerView" | "lotsView" | "cardStyle" | "lotsView2" | "cardStyle2"
  | "categoriesView" | "categoriesLayout" | "bannerView" | "bannerCamp" | "companiesView";
type QaOption = { id: string; label: string; hint: string };
export const QA_CONTROLS: { key: QaKey; title: string; options: QaOption[] }[] = [
  { key: "bannerNav", title: "Banner · indicador", options: BANNER_NAVS },
  { key: "bannerFx", title: "Banner · texto", options: BANNER_FXS },
  { key: "feedView", title: "VMC ahora · vista", options: FEED_VIEWS },
  { key: "feedScenario", title: "VMC ahora · inventario", options: FEED_SCENARIOS },
  { key: "feedSpeed", title: "VMC ahora · velocidad", options: FEED_SPEEDS },
  { key: "feedAd", title: "VMC ahora · publicidad", options: FEED_ADS },
  { key: "feedAdBadge", title: "VMC ahora · badge de publicidad", options: FEED_AD_BADGES },
  { key: "feedViews", title: "VMC ahora · visualizaciones", options: FEED_VIEWS_STYLES },
  { key: "feedShare", title: "VMC ahora · compartir", options: FEED_SHARE_ICONS },
  { key: "feedActs", title: "VMC ahora · fila de acciones", options: FEED_ACTS },
  { key: "feedTags", title: "VMC ahora · insignias", options: FEED_TAGS },
  { key: "feedScroll", title: "VMC ahora · scroll", options: FEED_SCROLLS },
  { key: "feedTone", title: "VMC ahora · tono de color", options: FEED_TONES },
  { key: "offerView", title: "Tipo de oferta · vista", options: OFFER_TYPE_VIEWS },
  { key: "lotsView", title: "Autoplan · lotes", options: LOTS_VIEWS },
  { key: "cardStyle", title: "Autoplan · detail card", options: CARD_STYLES },
  { key: "lotsView2", title: "Mapfre · lotes", options: LOTS_VIEWS },
  { key: "cardStyle2", title: "Mapfre · detail card", options: CARD_STYLES },
  { key: "categoriesView", title: "Categorías · vista", options: CATEGORIES_VIEWS },
  { key: "categoriesLayout", title: "Categorías · distribución", options: CATEGORY_LAYOUTS },
  { key: "bannerCamp", title: "Banner secundario · campaña", options: CAMPAIGNS },
  { key: "bannerView", title: "Banner secundario · vista", options: BANNER_VIEWS },
  { key: "companiesView", title: "Empresas · vista", options: COMPANIES_VIEWS },
];
const isQaValue = (key: QaKey, v: unknown) => QA_CONTROLS.some((c) => c.key === key && c.options.some((o) => o.id === v));
// Último estado de los selectores (dentro del teléfono): si el bloque se vuelve a montar (pestañas, franja) no se pierde.
const lastQa: Partial<Record<QaKey, string>> = {};
const initQa = <T extends string>(key: QaKey, fallback: T): T => (lastQa[key] as T | undefined) ?? fallback;

/** Variantes de VMC ahora en el móvil (QA):
 *  `hideFeed`   VMC ahora sale del inicio (modo Feed con barra inferior, pestañas arriba o franja).
 *  `feedSlot`   banner y VMC ahora se alternan en el mismo espacio.
 *  `onOpenFeed` muestra la franja «En vivo» de una línea; al tocarla se abre el feed completo. */
export default function HomeIndexBlock({ hideFeed = false, feedSlot = false, onOpenFeed, feedMore = false }: {
  hideFeed?: boolean; feedSlot?: boolean; onOpenFeed?: () => void; feedMore?: boolean;
}): JSX.Element {
  // Cada tienda tiene su propio selector de vista de lotes y de Detail card.
  const [lotsView, setLotsView] = useState<LotsView>(() => initQa("lotsView", OPTION_A.lotsView));
  const [cardStyle, setCardStyle] = useState<CardStyle>(() => initQa("cardStyle", OPTION_A.cardStyle));
  const [lotsView2, setLotsView2] = useState<LotsView>(() => initQa("lotsView2", OPTION_A.lotsView2));
  const [cardStyle2, setCardStyle2] = useState<CardStyle>(() => initQa("cardStyle2", OPTION_A.cardStyle2));
  const [companiesView, setCompaniesView] = useState<CompaniesView>(() => initQa("companiesView", OPTION_A.companiesView));
  const [feedView, setFeedView] = useState<FeedView>(() => initQa("feedView", OPTION_A.feedView));
  const [offerView, setOfferView] = useState<OfferTypeView>(() => initQa("offerView", OPTION_A.offerView));
  const [feedScenario, setFeedScenario] = useState<string>(() => initQa("feedScenario", DEFAULT_SCENARIO));
  const [feedSpeed, setFeedSpeed] = useState<string>(() => initQa("feedSpeed", "1"));
  useEffect(() => setFeedConfig(feedScenario, Number(feedSpeed)), [feedScenario, feedSpeed]);
  const [feedAd, setFeedAd] = useState<AdStyle>(() => initQa("feedAd", DEFAULT_DESIGN.ad));
  const [feedAdBadge, setFeedAdBadge] = useState<AdBadge>(() => initQa("feedAdBadge", DEFAULT_DESIGN.badge));
  const [feedViews, setFeedViews] = useState<ViewsStyle>(() => initQa("feedViews", DEFAULT_DESIGN.views));
  const [feedShare, setFeedShare] = useState<ShareIcon>(() => initQa("feedShare", DEFAULT_DESIGN.share));
  const [feedActs, setFeedActs] = useState<ActsAlign>(() => initQa("feedActs", DEFAULT_DESIGN.acts));
  const [feedTags, setFeedTags] = useState<TagsMode>(() => initQa("feedTags", DEFAULT_DESIGN.tags));
  const [feedScroll, setFeedScroll] = useState<ScrollStyle>(() => initQa("feedScroll", DEFAULT_DESIGN.scroll));
  const [feedTone, setFeedTone] = useState<ColorTone>(() => initQa("feedTone", DEFAULT_DESIGN.tone));
  useEffect(() => setFeedDesign({
    ad: feedAd, badge: feedAdBadge, views: feedViews, share: feedShare, acts: feedActs, tags: feedTags, scroll: feedScroll, tone: feedTone,
  }), [feedAd, feedAdBadge, feedViews, feedShare, feedActs, feedTags, feedScroll, feedTone]);
  const [heroH, setHeroH] = useState(OPTION_A.heroH); // alto del banner + VMC ahora (control QA)
  const [categoriesView, setCategoriesView] = useState<CategoriesView>(() => initQa("categoriesView", OPTION_A.categoriesView));
  const [categoriesLayout, setCategoriesLayout] = useState<CategoriesLayout>(() => initQa("categoriesLayout", "fila"));
  const [bannerView, setBannerView] = useState<BannerView>(() => initQa("bannerView", "fondo"));
  const [bannerCamp, setBannerCamp] = useState<CampaignId>(() => initQa("bannerCamp", "valoriza"));
  const [controls, setControls] = useState(false);
  const [bannerNav, setBannerNav] = useState<BannerNav>(() => initQa("bannerNav", "plain"));
  const [bannerFx, setBannerFx] = useState<BannerFx>(() => initQa("bannerFx", "letters"));
  const qa: Record<QaKey, string> = { bannerNav, bannerFx, feedView, feedScenario, feedSpeed, feedAd, feedAdBadge, feedViews, feedShare, feedActs, feedTags, feedScroll, feedTone, offerView, lotsView, cardStyle, lotsView2, cardStyle2, categoriesView, categoriesLayout, bannerView, bannerCamp, companiesView };
  const setQa = useCallback((key: QaKey, v: string) => {
    const set: Record<QaKey, (v: string) => void> = {
      bannerNav: (x) => setBannerNav(x as BannerNav), bannerFx: (x) => setBannerFx(x as BannerFx),
      feedView: (x) => setFeedView(x as FeedView), feedScenario: setFeedScenario, feedSpeed: setFeedSpeed,
      feedAd: (x) => setFeedAd(x as AdStyle), feedAdBadge: (x) => setFeedAdBadge(x as AdBadge), feedViews: (x) => setFeedViews(x as ViewsStyle),
      feedShare: (x) => setFeedShare(x as ShareIcon), feedActs: (x) => setFeedActs(x as ActsAlign), feedTags: (x) => setFeedTags(x as TagsMode),
      feedScroll: (x) => setFeedScroll(x as ScrollStyle), feedTone: (x) => setFeedTone(x as ColorTone), offerView: (x) => setOfferView(x as OfferTypeView), lotsView: (x) => setLotsView(x as LotsView),
      cardStyle: (x) => setCardStyle(x as CardStyle), lotsView2: (x) => setLotsView2(x as LotsView), cardStyle2: (x) => setCardStyle2(x as CardStyle),
      categoriesView: (x) => setCategoriesView(x as CategoriesView), categoriesLayout: (x) => setCategoriesLayout(x as CategoriesLayout), bannerView: (x) => setBannerView(x as BannerView), bannerCamp: (x) => setBannerCamp(x as CampaignId), companiesView: (x) => setCompaniesView(x as CompaniesView),
    };
    if (isQaValue(key, v)) set[key](v);
  }, []);
  // Dentro del teléfono: cada cambio se guarda y se informa a la página de afuera (su panel de controles lo refleja).
  const qaKey = JSON.stringify(qa);
  const firstReport = useRef(true);
  useEffect(() => {
    const state = JSON.parse(qaKey) as Record<QaKey, string>;
    Object.assign(lastQa, state);
    if (window.parent !== window) window.parent.postMessage({ type: "hib-state", state, initial: firstReport.current }, window.location.origin);
    firstReport.current = false;
  }, [qaKey]);
  // En móvil y tablet los selectores empiezan cerrados.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => { if (mq.matches) setControls(false); };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const applyPreset = useCallback((id: PresetId) => {
    const p = PRESETS[id];
    setLotsView(p.lotsView); setCardStyle(p.cardStyle); setLotsView2(p.lotsView2); setCardStyle2(p.cardStyle2);
    setCompaniesView(p.companiesView); setFeedView(p.feedView); setOfferView(p.offerView); setHeroH(p.heroH);
    setCategoriesView(p.categoriesView);
  }, []);
  // Al elegir A / B se avisa al selector de dispositivo (para el teléfono de la vista mobile).
  const choosePreset = (id: PresetId) => {
    applyPreset(id);
    window.dispatchEvent(new CustomEvent("hib-preset", { detail: id }));
  };
  // Dentro del teléfono: el preset llega en la URL (?opcion=b) y luego por postMessage desde la página de afuera.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const initial = q.get("opcion");
    if (isPresetId(initial)) applyPreset(initial);
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "hib-preset" && isPresetId(e.data.id)) applyPreset(e.data.id);
      if (e.data?.type === "hib-set" && e.data.state) for (const [k, v] of Object.entries(e.data.state)) setQa(k as QaKey, String(v));
    };
    // Al pasar a la vista mobile se cierran los selectores para que se vean Opción A / B.
    const onDevice = (e: Event) => { if ((e as CustomEvent<string>).detail === "mobile") setControls(false); };
    window.addEventListener("message", onMessage);
    window.addEventListener("hib-device", onDevice);
    return () => { window.removeEventListener("message", onMessage); window.removeEventListener("hib-device", onDevice); };
  }, [applyPreset, setQa]);
  // Orden: hero + actividad · Lotes para explorar · banner de campaña · Explora por categoría · Empresas y vendedores ·
  // Tipo de oferta y Categorías.
  // Columna con el mismo margen (16) y separación (16) que el bloque de Concorde; el alto lo da el contenido.
  return (
    <div data-block="homepage" className="hib-home" style={{ width: "100%", padding: "16px", boxSizing: "border-box", background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", gap: GAP }}>
      {controls ? null : (
        <>
          <button type="button" className="hib-option-toggle hib-option-toggle--a" onClick={() => choosePreset("a")}>Opción A</button>
          <button type="button" className="hib-option-toggle" onClick={() => choosePreset("b")}>Opción B</button>
        </>
      )}
      <button type="button" className="hib-controls-toggle" aria-expanded={controls} onClick={() => setControls((v) => !v)}>
        {controls ? "Ocultar controles" : "Abrir controles"}
      </button>
      {/* Proporción de la referencia: hero flexible + feed de mín. 300 (32 %), 368 de alto (600 × 368 · 300 × 368 con el sidebar cerrado). */}
      {/* «Corta»: Tipo de oferta va bajo el banner (mismo ancho) y VMC ahora ocupa las dos filas a su lado. */}
      <div className="hib-top-grid" data-nofeed={hideFeed || feedSlot || undefined} data-feedslot={feedSlot || undefined} data-feedmore={feedMore || undefined} style={{ position: "relative", width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 32%)", gap: GAP,
        gridTemplateRows: `${heroH}px auto` }}>
        <div data-slot="principal-banner" style={{ gridColumn: 1, gridRow: 1, minWidth: 0, display: "flex", height: "100%" }}>{feedSlot ? <BannerFeedSlot feedView={feedView} nav={bannerNav} fx={bannerFx} /> : <PrincipalBanner nav={bannerNav} fx={bannerFx} />}</div>
        {hideFeed || feedSlot ? null : (
          <div data-slot="secondary-banner" style={{ gridColumn: 2, gridRow: offerView === "corta" ? "1 / 3" : 1, minWidth: 0, minHeight: 0, display: "flex", height: "100%", position: "relative" }}>
            {/* El feed no empuja la fila: se dibuja absoluto y toma el alto que dejan banner + Tipo de oferta. */}
            {feedMore
              ? <div style={{ display: "flex", width: "100%" }}><VmcAhora view={feedView} more /></div>
              : <div style={{ position: "absolute", inset: 0, display: "flex" }}><VmcAhora view={feedView} /></div>}
          </div>
        )}
        {/* Tipo de oferta siempre en la fila 2: «Corta» bajo el banner (VMC ahora a su lado); las demás a todo el ancho.
            En móvil todo va en una columna (banner · Tipo de oferta · VMC ahora), sea Opción A u Opción B. */}
        <div data-slot="offer-type" style={{ gridColumn: offerView === "corta" ? 1 : "1 / -1", gridRow: 2, minWidth: 0 }}><OfferTypeCard view={offerView} /></div>
        {onOpenFeed ? <div data-slot="ticker" style={{ gridColumn: "1 / -1", gridRow: 3, minWidth: 0 }}><VmcAhoraTicker onOpen={onOpenFeed} /></div> : null}
        <Switches visible={controls}>
          <ViewSwitch title="Banner · indicador" suffix="" options={BANNER_NAVS} value={bannerNav} onChange={setBannerNav} />
          <ViewSwitch title="Banner · texto" suffix="" options={BANNER_FXS} value={bannerFx} onChange={setBannerFx} />
          <ViewSwitch title="VMC ahora" options={FEED_VIEWS} value={feedView} onChange={setFeedView} />
          <ViewSwitch title="VMC ahora · inventario" suffix="" options={FEED_SCENARIOS} value={feedScenario} onChange={setFeedScenario} />
          <ViewSwitch title="VMC ahora · velocidad" suffix="" options={FEED_SPEEDS} value={feedSpeed} onChange={setFeedSpeed} />
          <ViewSwitch title="VMC ahora · publicidad" suffix="" options={FEED_ADS} value={feedAd} onChange={setFeedAd} />
          <ViewSwitch title="VMC ahora · badge de publicidad" suffix="" options={FEED_AD_BADGES} value={feedAdBadge} onChange={setFeedAdBadge} />
          <ViewSwitch title="VMC ahora · visualizaciones" suffix="" options={FEED_VIEWS_STYLES} value={feedViews} onChange={setFeedViews} />
          <ViewSwitch title="VMC ahora · compartir" suffix="" options={FEED_SHARE_ICONS} value={feedShare} onChange={setFeedShare} />
          <ViewSwitch title="VMC ahora · fila de acciones" suffix="" options={FEED_ACTS} value={feedActs} onChange={setFeedActs} />
          <ViewSwitch title="VMC ahora · insignias" suffix="" options={FEED_TAGS} value={feedTags} onChange={setFeedTags} />
          <ViewSwitch title="VMC ahora · scroll" suffix="" options={FEED_SCROLLS} value={feedScroll} onChange={setFeedScroll} />
          <ViewSwitch title="VMC ahora · tono de color" suffix="" options={FEED_TONES} value={feedTone} onChange={setFeedTone} />
          <VmcAhoraQa />
          <HeightSlider value={heroH} onChange={setHeroH} />
          {/* El selector de Tipo de oferta va siempre aquí: es más alto que su sección y se montaba sobre el de Autoplan. */}
          <ViewSwitch title="Tipo de oferta" options={OFFER_TYPE_VIEWS} value={offerView} onChange={setOfferView} />
        </Switches>
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        <LotsSection view={lotsView} card={cardStyle} store={STORES[0]} />
        <Switches visible={controls}>
          <ViewSwitch title="Autoplan · lotes" suffix="" options={LOTS_VIEWS} value={lotsView} onChange={setLotsView} />
          <ViewSwitch title="Autoplan · detail card" suffix="" options={CARD_STYLES} value={cardStyle} onChange={setCardStyle} />
        </Switches>
      </div>
      <AdStrip />
      <div style={{ position: "relative", width: "100%" }}>
        <LotsSection view={lotsView2} card={cardStyle2} store={STORES[1]} />
        <Switches visible={controls}>
          <ViewSwitch title="Mapfre · lotes" suffix="" options={LOTS_VIEWS} value={lotsView2} onChange={setLotsView2} />
          <ViewSwitch title="Mapfre · detail card" suffix="" options={CARD_STYLES} value={cardStyle2} onChange={setCardStyle2} />
        </Switches>
      </div>
      {/* Solo móvil: Tipo de oferta después de las tiendas (arriba quitaba mucho espacio). */}
      <div className="hib-ot-mobile" style={{ display: "none", width: "100%" }}><OfferTypeCard view={offerView} /></div>
      <div style={{ position: "relative", width: "100%" }}>
        <CategoryRail view={categoriesView} layout={categoriesLayout} />
        <Switches visible={controls}><ViewSwitch title="Categorías" options={CATEGORIES_VIEWS} value={categoriesView} onChange={setCategoriesView} />
          <ViewSwitch title="Categorías" suffix="distribución" options={CATEGORY_LAYOUTS} value={categoriesLayout} onChange={setCategoriesLayout} /></Switches>
      </div>
      <div data-slot="banner" style={{ position: "relative", width: "100%" }}>
        <CampaignBanner view={bannerView} camp={bannerCamp} />
        <Switches visible={controls}>
          <ViewSwitch title="Campaña" suffix="" options={CAMPAIGNS} value={bannerCamp} onChange={setBannerCamp} />
          <ViewSwitch title="Banner" options={BANNER_VIEWS} value={bannerView} onChange={setBannerView} />
        </Switches>
      </div>
      <div style={{ width: "100%" }}><SellSection /></div>
      <div style={{ position: "relative", width: "100%" }}>
        <CompaniesSection view={companiesView} />
        <Switches visible={controls}><ViewSwitch title="Empresas" options={COMPANIES_VIEWS} value={companiesView} onChange={setCompaniesView} /></Switches>
      </div>
      {/* Un solo texto: un <style> con varios hijos no hidrata igual en servidor y cliente. */}
      <style>{SWITCH_CSS + MOBILE_CSS + AD_STRIP_CSS}</style>
    </div>
  );
}
