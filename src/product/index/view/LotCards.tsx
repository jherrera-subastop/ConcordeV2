"use client";

/**
 * LotCards — variantes de card de lote que NO existen en Concorde (solo QA del Index).
 * Toman como referencia el DetailCard de Concorde: morado de marca #3B1782, naranja en vivo
 * (#FF9639 → #BE3D00), turquesa negociable (#00DAE0 → #008688), Plus Jakarta Sans, radio 8 y la sombra
 * de las cards del homepage. Si se aprueban, deberían subir a Concorde como componentes propios.
 *
 *   · FichaCard     «Ficha»: foto con contador y puntos + datos del lote. En vivo: barra de avance,
 *                   «Inicia en» y precio actual con el SubasCoin. Negociable: grilla de datos, ubicación,
 *                   precio y aviso «Negociable · Contacta al vendedor».
 *   · ImmersiveCard «Inmersiva»: foto a toda la card, datos sobre degradado oscuro (md / sm).
 *   · SummaryCard   «Resumen»: foto, título centrado, datos en una línea, Ofertas / Visitas y precio base.
 *   · ReliefCard    «Relieve»: como el OfferCard, con el cuerpo montado sobre la foto, sombras internas
 *                   suaves y un brillo lila abajo a la derecha.
 *   · FichaPlus     5 variantes de la Ficha (la favorita de producto): cta (la única con botón
 *                   «Ver detalle») · precio · cuenta · compacta · social.
 *   · FichaPro      4 diseños de producto sobre la Ficha: clasica · nocturna · curva · fundido.
 *   · FichaLegend   3 versiones «premium» de la Ficha tipo carta FIFA: leyenda · holo · elite.
 *   · GlassCard     «Cristal»: marco con degradado morado/lila, foto con borde y reflejo de vidrio y el
 *                   precio en una cápsula de vidrio.
 */
import { useId, useState } from "react";
import { PILL_CSS } from "./pills";
import type { JSX, PointerEvent } from "react";

export type LotData = {
  name: string; year: number; price?: string; variant: "live" | "negotiable"; live?: boolean; imageSrc: string;
  kind: string; photos: number; km: string; transmission: string; fuel: string; seats?: number; city: string;
  owner?: string; remaining?: string; progress?: number; offers?: number; visits?: number;
};

const FONT = "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)";

const CSS = `
.lc { position: relative; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; background: #fff;
  font-family: ${FONT}; color: #191C1C; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px;
  transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); cursor: pointer; }
.lc:hover { transform: translateY(-3px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.lc::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 6px; }
.lc--live::after { background: linear-gradient(90deg, #ff9639 0%, #ef852e 50%, #be3d00 100%); }
.lc--negotiable::after { background: linear-gradient(90deg, #00DAE0 0%, #008688 100%); }

/* Pills: pills.ts (PILL_CSS). Like: */
${PILL_CSS}
.lc-like { position: absolute; top: 8px; right: 8px; z-index: 2; display: grid; place-items: center; width: 28px; height: 28px; padding: 0;
  border: 0; border-radius: 50%; color: #6b3fe0; background: #fff; box-shadow: rgba(32,0,104,0.18) 0 2px 8px; cursor: pointer; }

/* Foto con contador y puntos */
.lc-media { position: relative; flex: none; height: 132px; background: #ECEAF3; }
.lc-media > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.lc-count { position: absolute; left: 8px; bottom: 8px; display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px;
  border-radius: 6px; font-size: 10px; font-weight: 700; color: #fff; background: rgba(16,0,48,0.6); }
.lc-dots { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); display: flex; gap: 4px; }
.lc-dots i { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.55); }
.lc-dots i:first-child { background: #fff; }

/* Ficha */
.lc-body { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 10px 10px 16px; }
.lc-name { margin: 0; font-size: 16px; font-weight: 800; line-height: 1.15; color: #1b1442; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-sub { margin: 2px 0 0; font-size: 11px; color: #6b6880; }
.lc-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.lc-chip { display: inline-flex; align-items: center; gap: 3px; padding: 3px 6px; border: 1px solid #E3E1EC; border-radius: 6px; font-size: 10px; color: #3f3f4a; }
.lc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; line-height: 1.2; color: #3f3f4a; }
.lc-stats span { display: flex; align-items: center; gap: 4px; }
.lc-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.lc-tile { display: grid; justify-items: center; gap: 2px; padding: 5px 2px; border-radius: 6px; font-size: 10px; text-align: center; color: #3f3f4a; background: #F5F3FB; }
.lc-meta { display: flex; flex-wrap: wrap; gap: 4px 8px; font-size: 10px; color: #3f3f4a; }
.lc-meta span { display: inline-flex; align-items: center; gap: 3px; }
.lc-label { margin: 0; font-size: 11px; color: #6b6880; display: flex; align-items: center; gap: 4px; }
.lc-price { margin: 0; font-size: 18px; font-weight: 800; line-height: 1.1; color: #4c1ebc; white-space: nowrap; }
.lc-bar { height: 6px; border-radius: 3px; background: #ECEAF3; overflow: hidden; }
.lc-bar > i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #ff9639 0%, #ef852e 60%, #be3d00 100%); }
.lc-time { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #3f3f4a; }
.lc-pricerow { display: flex; align-items: center; gap: 8px; }
.lc-pricerow .lc-label { margin-bottom: 1px; }
.lc-offer { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: #00777A; }
.lc-spacer { flex: 1; }

/* Inmersiva */
.lc--imm { color: #fff; background: #1b1442; }
.lc--imm > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lc-imm__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(16,0,48,0) 40%, rgba(16,0,48,0.55) 62%, rgba(12,8,30,0.92) 100%); }
.lc-imm__info { position: relative; z-index: 1; margin-top: auto; display: grid; gap: 2px; padding: 0 12px 16px; }
.lc-imm__info .lc-dots { position: static; transform: none; justify-content: center; margin-bottom: 8px; }
.lc-imm__name { margin: 0; font-size: 18px; font-weight: 800; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-imm__year { font-size: 12px; color: rgba(255,255,255,0.75); }
.lc-imm__price { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 17px; font-weight: 800; white-space: nowrap; }
.lc-imm__neg { margin-top: 6px; font-size: 13px; font-weight: 700; color: #7CF3F5; }
.lc--sm .lc-like { width: 22px; height: 22px; top: 6px; right: 6px; }
.lc--sm .lc-like svg { width: 12px; height: 12px; }
.lc--sm .lc-pills { top: 6px; left: 6px; }
.lc--sm .lc-imm__info { padding: 0 9px 12px; }
.lc--sm .lc-imm__info .lc-dots { margin-bottom: 6px; }
.lc--sm .lc-imm__name { font-size: 13.5px; }
.lc--sm .lc-imm__year { font-size: 10px; }
.lc--sm .lc-imm__price { margin-top: 3px; font-size: 12.5px; gap: 4px; }
.lc--sm .lc-imm__neg { margin-top: 3px; font-size: 11px; }
/* Resumen */
.lc-sum { flex: 1; display: flex; flex-direction: column; text-align: center; padding-bottom: 6px; }
.lc-sum__head { padding: 10px 10px 8px; }
.lc-sum__title { margin: 0; font-size: 15px; font-weight: 800; line-height: 1.2; color: #1b1442; }
.lc-sum__specs { margin: 4px 0 0; font-size: 10px; line-height: 1.35; color: #3f3f4a; }
.lc-sum__stats { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid #ECEAF3; border-bottom: 1px solid #ECEAF3; }
.lc-sum__stats span { display: grid; align-content: space-between; gap: 1px; padding: 7px 4px; font-size: 10px; line-height: 1.2; color: #6b6880; } /* números a la misma altura aunque la etiqueta ocupe 2 líneas */
.lc-sum__stats span + span { border-left: 1px solid #ECEAF3; }
.lc-sum__stats b { font-size: 13px; color: #1b1442; }
.lc-sum__price { flex: 1; display: grid; align-content: center; justify-items: center; gap: 2px; padding: 8px 8px 10px; }
.lc-sum__price small { font-size: 9.5px; font-weight: 700; letter-spacing: 0.06em; color: #6b6880; }
.lc-sum__price span { display: inline-flex; align-items: center; gap: 6px; }
.lc-sum__price .lc-price { font-size: 18px; }
/* Relieve: el fondo de la card es el degradado de estado y el cuerpo blanco, redondeado abajo, deja ver una
   franja gruesa de color con esquinas curvas. Ola rosada abajo a la derecha y sombras internas suaves. */
.lc--relief { border-radius: 12px; }
.lc--relief.lc--live { background: linear-gradient(90deg, #FF9A2E 0%, #F3542E 55%, #FF7A2F 100%); }
.lc--relief.lc--negotiable { background: linear-gradient(90deg, #22F0F4 0%, #00D3DB 55%, #00BCC7 100%); } /* cyan más vivo */
.lc--relief::after { display: none; }
.lc--relief .lc-media { height: 150px; }
.lc-rel { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; overflow: hidden;
  margin: -18px 0 10px; padding: 14px 14px 18px; background: #fff;
  border-radius: 14px 14px 50% 50% / 14px 14px 16px 16px; /* abajo en curva, no recto */
  box-shadow: 0 -8px 18px -6px rgba(16,0,48,0.18), inset 0 1px 0 #fff, inset 0 -14px 24px -16px rgba(132,96,229,0.18); }
.lc-rel__wave { position: absolute; right: 0; bottom: 0; width: 100%; height: 70%; pointer-events: none; }
.lc-rel > :not(.lc-rel__wave) { position: relative; }
.lc-rel .lc-name { font-size: 16px; font-weight: 800; color: #12133F; }
.lc-rel .lc-sub { margin-top: 2px; font-size: 11px; color: #4A4F6A; }
.lc-rel__price { margin-top: auto; padding-top: 14px; display: flex; align-items: center; gap: 8px; }
.lc-rel__price .lc-price { font-size: 18px; color: #4A2CE0; }
/* Compacta (cards angostas de Normal y Card destacada): franja y curva más chicas. */
.lc--relief.lc--compact .lc-rel { margin: -14px 0 6px; padding: 12px 12px 14px; border-radius: 12px 12px 50% 50% / 12px 12px 9px 9px; }
.lc--relief.lc--compact .lc-rel__price { padding-top: 10px; }

/* Cristal: el vidrio está solo arriba. Detrás de la foto hay una copia desenfocada que hace de marco
   esmerilado; la foto va inset con aro blanco. Abajo la card es blanca con manchas moradas/azules difusas
   (efecto «mesh blur») y el precio en una cápsula blanca con brillo lila. */
.lc--glass { padding: 8px; border-radius: 18px; background: #fff; border: 1px solid #ECEBF0;
  box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; } /* sombra neutra: el único morado es la mancha de la esquina */
.lc--glass::after { display: none; }
/* Única mancha: esquina inferior derecha. El resto de la parte de abajo queda blanco. */
.lc--glass::before { content: ""; position: absolute; right: -14%; bottom: -12%; width: 58%; height: 34%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(112,82,255,0.6), rgba(140,120,255,0.25) 60%, transparent); filter: blur(12px); }
.lc-glass__blur { position: absolute; top: 0; left: 0; width: 100%; height: 190px; object-fit: cover; pointer-events: none;
  filter: blur(5px) saturate(1.15); transform: scale(1.08); opacity: 0.95; /* el auto se reconoce detrás */
  -webkit-mask-image: linear-gradient(180deg, #000 70%, transparent 100%); mask-image: linear-gradient(180deg, #000 70%, transparent 100%); }
.lc--glass .lc-media { z-index: 1; height: 150px; overflow: visible; border-radius: 14px; background: none; }
.lc--glass .lc-media > img { border-radius: 14px; border: 2px solid rgba(255,255,255,0.9); box-sizing: border-box;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.45), 0 10px 20px -10px rgba(0,0,0,0.35); }
.lc--glass .lc-media::after { content: ""; position: absolute; inset: 2px; border-radius: 12px; pointer-events: none;
  background: linear-gradient(125deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 26%, transparent 27%); }
.lc--glass .lc-pills, .lc--glass .lc-like { z-index: 3; }
.lc-glass { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 16px 6px 2px; }
.lc-glass .lc-name { font-size: 16px; font-weight: 800; color: #12133F; }
.lc-glass .lc-sub { font-size: 11px; color: #4A4F6A; }
.lc-glass__rule { width: 28px; height: 3px; margin: 10px 0 0; border-radius: 2px; background: #D6CDF8; }
.lc-glass__price { margin-top: auto; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.95); background: rgba(255,255,255,0.88); backdrop-filter: blur(10px);
  box-shadow: 0 6px 16px -8px rgba(0,0,0,0.18), inset 0 1px 0 #fff; }
.lc-glass__price .lc-price { font-size: 18px; color: #4A2CE0; }
.lc-glass__price .lc-offer { font-size: 14px; }
/* Ficha+ : botón «Ver detalle» (naranja = primary de Concorde; turquesa en negociable) y piezas extra */
.lc-cta { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 34px; margin-top: 8px; padding: 0 12px;
  border: 0; border-radius: 999px; font: inherit; font-size: 12.5px; font-weight: 800; color: #fff; cursor: pointer; flex: none;
  background: linear-gradient(135deg, #ff9639 0%, #ef852e 40%, #be3d00 100%); box-shadow: rgba(239,133,46,0.35) 0 4px 12px; transition: filter 0.15s, transform 0.15s; }
.lc-cta:hover { filter: brightness(1.06); transform: translateY(-1px); }
.lc-cta:focus-visible { outline: 2px solid #3b1782; outline-offset: 2px; }
.lc--negotiable .lc-cta { background: linear-gradient(135deg, #00DAE0 0%, #008688 100%); box-shadow: rgba(0,168,171,0.3) 0 4px 12px; }
.lc-inline { margin: 0; font-size: 10.5px; line-height: 1.35; color: #3f3f4a; }
.lc-countdown { position: absolute; left: 8px; right: 8px; bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px;
  padding: 5px 8px; border-radius: 8px; color: #fff; font-size: 10px; background: rgba(16,0,48,0.62); backdrop-filter: blur(6px); }
.lc-countdown b { font-size: 12px; font-variant-numeric: tabular-nums; }
.lc-countdown i { display: block; height: 3px; margin-top: 3px; border-radius: 2px; background: rgba(255,255,255,0.25); overflow: hidden; }
.lc-countdown i > span { display: block; height: 100%; background: linear-gradient(90deg, #ff9639, #ef852e); }
.lc-specs3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.lc-specs3 span { display: grid; justify-items: center; gap: 2px; padding: 5px 2px; border-radius: 6px; font-size: 9.5px; text-align: center; color: #3f3f4a; background: #F5F3FB; }
.lc-social { display: flex; flex-wrap: wrap; gap: 2px 10px; font-size: 11px; color: #3f3f4a; }
.lc-social span { display: inline-flex; align-items: center; gap: 4px; }
.lc-social b { color: #1b1442; }
.lc-pricerow--big .lc-price { font-size: 18px; }
/* ── FichaPro: 4 diseños (referencia de producto) ───────────────────────── */
.lp .lc-media { height: 150px; overflow: hidden; }
.lp .lc-count, .lp .lc-dots { z-index: 2; }
.lp .lc-body { position: relative; z-index: 1; gap: 9px; padding: 12px 8px 18px 10px; }
.lp .lc-name { font-size: 16px; }
.lp .lc-sub { font-size: 11px; }
.lp .lc-chips { flex-wrap: nowrap; gap: 4px; }
.lp .lc-chip { gap: 3px; padding: 4px 5px; border-radius: 8px; font-size: 10px; white-space: nowrap; }
.lp .lc-stats { gap: 4px; font-size: 11px; white-space: nowrap; }
.lp .lc-pill svg { flex: none; }
.lp-arrow { position: absolute; top: 50%; z-index: 2; transform: translateY(-50%); display: grid; place-items: center; width: 24px; height: 24px; padding: 0;
  border: 0; border-radius: 50%; color: #fff; background: rgba(16,0,48,0.42); backdrop-filter: blur(4px); cursor: pointer; }
.lp-arrow--l { left: 6px; }
.lp-arrow--r { right: 6px; }
.lp-price .lc-price { font-size: 18px; }

/* Nocturna: cuerpo azul noche, foto con tono atardecer que se funde, ola naranja/magenta abajo */
.lp--nocturna { background: linear-gradient(180deg, #241B5C 0%, #17103D 55%, #100A2B 100%); }
.lp--nocturna .lc-media::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,128,64,0.20) 0%, rgba(150,70,200,0.08) 50%, rgba(36,27,92,0) 66%, rgba(36,27,92,0.92) 100%); }
.lp-wave { position: absolute; left: 0; bottom: 0; z-index: 0; width: 100%; height: 64px; pointer-events: none; }

/* Curva: la foto termina en curva; datos en 4 cajitas; precio en cápsula con brillo naranja */
.lp--curva .lc-media { border-bottom-right-radius: 100% 44px; }
.lp--curva::before { content: ""; position: absolute; right: -25%; bottom: -8%; width: 80%; height: 28%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,150,57,0.55), rgba(255,150,57,0.18) 60%, transparent); filter: blur(10px); }
.lp-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.lp-tiles span { display: grid; justify-items: center; gap: 2px; min-width: 0; padding: 6px 3px; border-radius: 8px; font-size: 9.5px; color: #3f3f4a;
  background: #fff; border: 1px solid #EEEAF6; box-shadow: rgba(32,0,104,0.06) 0 2px 6px; white-space: nowrap; }
.lp--curva .lp-price { padding: 6px 12px 6px 6px; border-radius: 999px; background: #fff; box-shadow: rgba(32,0,104,0.12) 0 4px 14px; }
.lp--curva .lp-price .lc-price { font-size: 18px; }

/* Fundido: la foto ocupa la parte de arriba y se funde en azul noche; el texto va encima */
.lp--fundido { background: #15102E; }
.lp-bg { position: absolute; top: 0; left: 0; width: 100%; height: 62%; object-fit: cover; }
.lp-shade { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(21,16,46,0) 0%, rgba(21,16,46,0) 26%, rgba(21,16,46,0.55) 36%, rgba(21,16,46,0.88) 48%, #15102E 62%); }
.lp--fundido .lc-media { z-index: 1; background: none; }

/* Textos y piezas en los temas oscuros */
.lp--nocturna .lc-name, .lp--fundido .lc-name, .lp--nocturna .lc-price, .lp--fundido .lc-price { color: #fff; }
.lp--nocturna .lc-sub, .lp--fundido .lc-sub, .lp--nocturna .lc-label, .lp--fundido .lc-label { color: rgba(255,255,255,0.72); }
.lp--nocturna .lc-stats, .lp--fundido .lc-stats, .lp--nocturna .lc-time, .lp--fundido .lc-time { color: rgba(255,255,255,0.88); }
.lp--nocturna .lc-chip, .lp--fundido .lc-chip { color: #fff; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); }
.lp--nocturna .lc-bar, .lp--fundido .lc-bar { background: rgba(255,255,255,0.16); }
.lp--nocturna .lc-offer, .lp--fundido .lc-offer { color: #5CF0F3; }
/* ── FichaLegend: cartas «premium» inspiradas en las cartas especiales de FIFA (Icon / Hero / TOTY) ──
   La franja de color deja de ser decorativa: placa de precio (Leyenda), contador (Holo) o neón (Élite).
   Se mueven siempre (pedido de producto), también con «reducir animaciones». */
@property --lg-a { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@keyframes lg-spin { to { --lg-a: 360deg; } }
@keyframes lg-sweep { 0%, 60% { transform: translateX(-160%) skewX(-20deg); } 100% { transform: translateX(330%) skewX(-20deg); } }
@keyframes lg-shimmer { to { background-position: -200% 0; } }
@keyframes lg-run { from { left: -30%; } to { left: 100%; } }
@keyframes lg-twinkle { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.95; } }
@keyframes lg-holo-idle { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
.lg::after { display: none; }
.lg .lc-media { overflow: hidden; }
.lg .lc-count, .lg .lc-dots { z-index: 2; }
.lg .lc-pill svg { flex: none; }
.lg .lc-body { padding: 12px 8px 14px 10px; }
.lg .lc-chips { flex-wrap: nowrap; gap: 4px; }
.lg .lc-chip { gap: 3px; padding: 4px 5px; font-size: 10px; white-space: nowrap; }
.lg .lc-stats { gap: 4px; font-size: 11px; white-space: nowrap; }
.lg-in { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.lg-shine { position: absolute; top: 0; left: 0; z-index: 1; width: 35%; height: 100%; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); animation: lg-sweep 4.5s ease-in-out infinite; }

/* Leyenda: borde metálico que gira, destello en la foto y placa de precio brillante */
.lg--leyenda { padding: 2px; border-radius: 12px; animation: lg-spin 6s linear infinite;
  background: conic-gradient(from var(--lg-a), #FF9639, #FFE2C2, #8460E5, #3B1782, #8460E5, #FFE2C2, #FF9639);
  box-shadow: 0 14px 30px -12px rgba(59,23,130,0.55); }
.lg--leyenda.lc--negotiable { background: conic-gradient(from var(--lg-a), #00DAE0, #CFFDFE, #8460E5, #3B1782, #8460E5, #CFFDFE, #00DAE0); }
.lg--leyenda .lg-in { border-radius: 10px; background: linear-gradient(165deg, #2A1670 0%, #170C42 55%, #0E0628 100%); }
.lg--leyenda .lc-chip { color: #FFE2C2; border-color: rgba(255,190,130,0.35); background: rgba(255,150,57,0.08); }
.lg--leyenda.lc--negotiable .lc-chip { color: #CFFDFE; border-color: rgba(0,218,224,0.35); background: rgba(0,218,224,0.08); }
.lg-plaque { position: relative; flex: none; display: flex; align-items: center; gap: 8px; padding: 8px 10px; color: #fff;
  background: linear-gradient(90deg, #BE3D00 0%, #FF9639 25%, #FFD3A1 50%, #FF9639 75%, #BE3D00 100%); background-size: 200% 100%;
  animation: lg-shimmer 3.5s linear infinite; text-shadow: 0 1px 2px rgba(120,40,0,0.45); }
.lc--negotiable .lg-plaque { background-image: linear-gradient(90deg, #00777A 0%, #00DAE0 25%, #B9FBFC 50%, #00DAE0 75%, #00777A 100%); text-shadow: 0 1px 2px rgba(0,80,82,0.5); }
.lg-plaque small { display: block; font-size: 9.5px; font-weight: 600; opacity: 0.92; }
.lg-plaque b { display: block; font-size: 18px; font-weight: 800; line-height: 1.1; white-space: nowrap; }
.lc--negotiable .lg-plaque b { font-size: 14px; }

/* Holo: brillo holográfico y reflejo que siguen al mouse, inclinación 3D; la franja es el contador */
.lg--holo { border: 1px solid #E9E3FF; transform: perspective(700px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.2s ease, box-shadow 0.2s; }
.lg--holo:hover { transform: perspective(700px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(-3px); }
.lg-holo { position: absolute; inset: 0; z-index: 3; pointer-events: none; background-size: 260% 260%;
  background-image: linear-gradient(115deg, transparent 28%, rgba(132,96,229,0.07) 38%, rgba(0,218,224,0.06) 46%, rgba(255,150,57,0.06) 54%, rgba(132,96,229,0.05) 62%, transparent 72%); /* foil sutil */
  animation: lg-holo-idle 5s ease-in-out infinite alternate; }
.lg--holo:hover .lg-holo { animation: none; background-position: var(--mx, 50%) var(--my, 50%); }
.lg-glare { position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0; transition: opacity 0.2s;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.28), transparent 42%); }
.lg--holo:hover .lg-glare { opacity: 1; }
.lg-track { position: relative; flex: none; height: 9px; background: #ECEAF3; overflow: hidden; }
.lg-track > i { position: relative; display: block; height: 100%; overflow: hidden; background: linear-gradient(90deg, #ff9639, #ef852e 60%, #be3d00); }
.lc--negotiable .lg-track > i { background: linear-gradient(90deg, #00DAE0, #008688); }
.lg-track > i::after { content: ""; position: absolute; top: 0; width: 30%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: lg-run 1.8s linear infinite; }
.lg--holo .lc-body { position: relative; z-index: 1; }

/* Élite: carta con esquinas cortadas, estrellas, año como «puntaje» y stats tipo FIFA; neón abajo */
.lg--elite { padding: 1.5px; border-radius: 12px; box-shadow: 0 14px 30px -12px rgba(59,23,130,0.55);
  background: linear-gradient(160deg, #FFE2C2 0%, #FF9639 30%, #8460E5 70%, #FFE2C2 100%); }
.lg--elite.lc--negotiable { background: linear-gradient(160deg, #CFFDFE 0%, #00DAE0 30%, #8460E5 70%, #CFFDFE 100%); }
.lg--elite .lg-in { border-radius: 10.5px; background: radial-gradient(120% 70% at 50% 0%, #3B1E9A 0%, #1A0F4A 55%, #0C0626 100%); }
.lg-stars { position: absolute; inset: 0; pointer-events: none; animation: lg-twinkle 3s ease-in-out infinite;
  background-image: radial-gradient(1.5px 1.5px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 78% 12%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 64% 46%, #FFE2C2, transparent), radial-gradient(1px 1px at 22% 62%, #fff, transparent),
    radial-gradient(1px 1px at 88% 70%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 86%, #FFE2C2, transparent),
    radial-gradient(1px 1px at 55% 78%, #fff, transparent), radial-gradient(1px 1px at 8% 90%, #fff, transparent); }
.lg--elite .lc-media { z-index: 1; background: none; }
.lg--elite .lc-media > img { -webkit-mask-image: linear-gradient(180deg, #000 58%, transparent 100%); mask-image: linear-gradient(180deg, #000 58%, transparent 100%); }
.lg-rating { position: absolute; top: 8px; left: 10px; z-index: 2; display: grid; justify-items: center; padding: 5px 7px; border-radius: 8px; line-height: 1;
  color: #FFE2C2; background: rgba(16,0,48,0.62); backdrop-filter: blur(6px); border: 1px solid rgba(255,211,161,0.35); }
.lc--negotiable .lg-rating { color: #CFFDFE; }
.lg-rating b { font-size: 17px; font-weight: 900; }
.lg-rating small { margin-top: 2px; font-size: 8px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.lg--elite .lc-pills { top: auto; bottom: 6px; left: 50%; transform: translateX(-50%); }
.lg--elite .lc-body { position: relative; z-index: 1; align-items: center; gap: 7px; padding: 6px 10px 12px; text-align: center; }
.lg--elite .lc-name { font-size: 16px; letter-spacing: 0.04em; text-transform: uppercase; }
.lg-divider { flex: none; width: 70%; height: 1px; background: linear-gradient(90deg, transparent, #FFD3A1, transparent); }
.lc--negotiable .lg-divider { background: linear-gradient(90deg, transparent, #7CF3F5, transparent); }
.lg-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
.lg-stats span { display: flex; align-items: baseline; gap: 4px; }
.lg-stats b { min-width: 30px; font-size: 14px; font-weight: 900; text-align: right; color: #fff; }
.lg-stats small { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; color: #FFD3A1; }
.lc--negotiable .lg-stats small { color: #7CF3F5; }
.lg--elite .lc-pricerow { justify-content: center; }
.lg-neon { position: relative; flex: none; height: 3px; margin: 0 14px 9px; border-radius: 3px; overflow: hidden;
  background: #FF9639; box-shadow: 0 0 10px 2px rgba(255,150,57,0.7); }
.lc--negotiable .lg-neon { background: #00DAE0; box-shadow: 0 0 10px 2px rgba(0,218,224,0.7); }
.lg-neon::after { content: ""; position: absolute; top: 0; width: 30%; height: 100%;
  background: linear-gradient(90deg, transparent, #fff, transparent); animation: lg-run 2.2s linear infinite; }

/* Textos en las cartas oscuras */
.lg--leyenda .lc-name, .lg--elite .lc-name, .lg--elite .lc-price { color: #fff; }
.lg--leyenda .lc-sub { color: rgba(255,255,255,0.72); }
.lg--leyenda .lc-stats, .lg--leyenda .lc-time, .lg--elite .lc-time { color: rgba(255,255,255,0.88); }
.lg--leyenda .lc-bar { background: rgba(255,255,255,0.16); }
.lg--elite .lc-label { color: rgba(255,255,255,0.7); }
.lg--elite .lc-offer { color: #5CF0F3; }
.lg--leyenda .lc-body { position: relative; z-index: 1; }
/* ── Holo curva (default de la galería, réplica de vmc-index-final-review) ── */
.clike { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 9999px;
  border: 1.44px solid transparent;
  background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, #e8ddff 0%, #ffffff 40%, #cfbaff 75%, #ae8eff 100%);
  background-origin: padding-box, border-box; background-clip: padding-box, border-box;
  cursor: pointer; padding: 2px; position: relative; overflow: hidden; box-shadow: rgba(132, 96, 229, 0.14) 0px 2px 8px;
  transition: transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s; flex-shrink: 0; outline: none; }
.clike::before { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(rgba(255, 255, 255, 0.55) 0%, transparent 50%); pointer-events: none; z-index: 1; }
.clike svg { position: relative; z-index: 2; }
.clike:hover { transform: scale(1.1) translateY(-1px); box-shadow: rgba(32, 0, 104, 0.2) 0px 6px 14px; }
.clike:active { transform: scale(0.92); }
.clike--active { background-image: linear-gradient(135deg, #8460e5 0%, #3b1782 100%), linear-gradient(135deg, #fbc47d 0%, #fbc47d 100%);
  box-shadow: rgba(132, 96, 229, 0.35) 0px 2px 8px, inset 0px 1px 0px rgba(255, 255, 255, 0.22); }
.clike--pop svg { animation: clike-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 1; }
@keyframes clike-pop { 0% { transform: scale(1); } 35% { transform: scale(1.4); } 65% { transform: scale(0.85); } 85% { transform: scale(1.1); } 100% { transform: scale(1); } }
.clike:focus-visible { outline: 2px solid oklch(0.62 0.20 285); outline-offset: 2px; }
.lc-likepos { position: absolute; top: 8px; right: 8px; z-index: 2; display: grid; place-items: center; }
/* La destacada hereda la curva de «Curva» como detalle de la foto. */
.lc--featured-curve .lc-media { overflow: hidden; border-bottom-right-radius: 100% 44px; }
.lc--featured-curve .lc-media > img { object-position: center; }
/* Curva compacta: cards secundarias de la galería. */
.lc--compact-curve { min-height: 170px; border-radius: 9px; box-shadow: rgba(31, 14, 77, 0.12) 0 5px 13px; }
.lc-compact-curve__media { position: relative; flex: none; height: 76px; overflow: hidden; background: #ECEAF3; border-bottom-right-radius: 100% 28px; }
.lc-compact-curve__media > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.lc-compact-curve__media::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent 45%); }
.lc-compact-curve__body { position: relative; display: flex; flex: 1; flex-direction: column; gap: 3px; padding: 7px 8px 10px; }
.lc-compact-curve__name { margin: 0; overflow: hidden; color: #14112B; font-size: 13px; font-weight: 800; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
.lc-compact-curve__meta { display: flex; align-items: center; gap: 4px; color: #615D73; font-size: 11px; line-height: 1.15; }
.lc-compact-curve__meta i { width: 3px; height: 3px; border-radius: 50%; background: #A7A1B7; }
.lc-compact-curve__footer { display: flex; align-items: center; justify-content: flex-start; gap: 4px; margin-top: auto; padding-top: 5px; border-top: 1px solid #F0EDF7; color: #4C1EBC; font-size: 14px; font-weight: 800; white-space: nowrap; }
.lc-compact-curve__footer > span { overflow: hidden; text-overflow: ellipsis; }
.lc-compact-curve__base-price { display: inline-flex; align-items: center; gap: 4px; min-width: 0; }
.lc--negotiable .lc-compact-curve__footer { color: #007E83; font-size: 13px; } /* = «Haz tu oferta» del listado */
.lc--compact-curve .lc-likepos .clike { width: 26px !important; height: 26px !important; }
/* Lote estilo eBay */
.lc-eb { position: relative; display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 14px; align-items: start; padding: 14px 0; border-bottom: 1px solid #EFEDF5;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); color: #14112B; cursor: pointer; }
.lc-eb__thumb { display: block; width: 112px; height: 112px; overflow: hidden; border-radius: 14px; background: #F3EFFD; }
.lc-eb__thumb img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.lc-eb:hover .lc-eb__thumb img { transform: scale(1.05); }
/* Columna 0–1fr: el texto respeta el ancho de la fila y corta con «…» (si no, la grilla crece al ancho del texto y se sale).
   El favorito va sobre la foto: la columna queda libre para el pill «Recibe ofertas», que no entraba junto al corazón. */
.lc-eb__main { display: grid; grid-template-columns: minmax(0, 1fr); gap: 3px; min-width: 0; }
.lc-eb__pill { justify-self: start; display: inline-flex; }
.lc-eb__title { margin: 3px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; line-height: 1.2; font-weight: 800; color: #14112B; } /* como el nombre de las cards chicas */
.lc-eb__who { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #8A879C; }
.lc-eb__price { display: inline-flex; align-items: center; gap: 6px; margin-top: 2px; font-size: 14px; line-height: 1.15; font-weight: 800; letter-spacing: -0.01em; color: #4C1EBC; }
.lc-eb__offer { margin-top: 2px; font-size: 13px; line-height: 1.15; font-weight: 800; color: #00777A; }
.lc-eb__rest { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; font-weight: 600; color: #8A879C; }
.lc-eb__foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; white-space: nowrap; font-size: 11px; font-weight: 600; color: #8A879C; }
.lc-eb__foot > span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
/* Favorito de las filas de listado: en la esquina superior derecha de la foto (como en la destacada), lejos del pill de estado. */
.lc-eb__like { position: absolute; top: 20px; left: calc(112px - 36px); z-index: 2; display: grid; place-items: center; }
/* Listado compacto (Listado gallery): 4 filas junto a la destacada */
.lc-eb--sm { grid-template-columns: 84px minmax(0, 1fr); gap: 12px; padding: 10px 0; }
.lc-eb--sm .lc-eb__thumb { width: 84px; height: 84px; border-radius: 12px; }
/* Fila chica (Listado gallery): favorito sobre la foto, igual que la fila grande. */
.lc-eb--sm .lc-eb__like { top: 14px; left: calc(84px - 30px); }
.lc-eb--sm .lc-eb__main { gap: 2px; }
.lc-eb--sm .lc-eb__who { display: none; }
.lc-eb--sm .lc-eb__price svg { width: 16px; height: 17px; }
@media (max-width: 480px) {
  .lc-eb--sm { grid-template-columns: 76px minmax(0, 1fr); gap: 10px; }
  .lc-eb--sm .lc-eb__thumb { width: 76px; height: 76px; }
  .lc-eb__title, .lc-eb__rest { overflow: visible; text-overflow: clip; white-space: normal; }
  .lc-eb__like { top: 10px; }
  .lc-eb--sm .lc-eb__like { top: 6px; left: calc(76px - 32px); }
}
@media (prefers-reduced-motion: reduce) { .lc { transition: none; }  }
`;

// ─── Íconos (trazo 1.8, color heredado) ───────────────────────────────────────
const I = {
  heart: <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  camera: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>,
  gear: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  fuel: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3M7 8h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  gauge: <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M4 17a8 8 0 1 1 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 15l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  seats: <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-2.5-4.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  pin: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="10" r="2" fill="currentColor" /></svg>,
  shield: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  clock: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 8v4l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  eye: <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>,
  tag: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>,
  hands: <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M2 12l4-4 4 2 3-2 4 1 5 3-4 5-3-1-3 2-3-2-3 1z" fill="#00A8AB" opacity="0.9" /><path d="M9 12l2 2M12 11l2 2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></svg>,
};

/** SubasCoin: la gema de precio del OfferCard de Concorde (paths y degradados exactos, viewBox de Figma). */
function SubasCoin({ size = 28 }: { size?: number }): JSX.Element {
  const uid = `lc-coin${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={Math.round(size * 30 / 28)} viewBox="30 199 28 30" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <defs>
        <linearGradient id={`${uid}-d`} gradientUnits="userSpaceOnUse" x1="32" y1="215.5" x2="55.12" y2="228.11">
          <stop stopColor="#00A7A8" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#300089" />
        </linearGradient>
        <linearGradient id={`${uid}-ds`} gradientUnits="userSpaceOnUse" x1="32" y1="215.5" x2="55.12" y2="228.11">
          <stop stopColor="#73DFDF" /><stop offset="0.28" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="0.875" stopColor="#452AA2" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${uid}-c`} gradientUnits="userSpaceOnUse" x1="36.01" y1="199.59" x2="51.99" y2="222.41">
          <stop stopColor="#00ABAD" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#31008A" />
        </linearGradient>
        <linearGradient id={`${uid}-cg`} gradientUnits="userSpaceOnUse" x1="44" y1="203" x2="44" y2="219">
          <stop stopColor="#ffffff" stopOpacity="0.45" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-cb`} gradientUnits="userSpaceOnUse" x1="36.01" y1="199.59" x2="51.99" y2="222.41">
          <stop stopColor="#44D6D6" /><stop offset="0.207" stopColor="#E4EEFF" stopOpacity="0.5" /><stop offset="0.495" stopColor="#567CD3" /><stop offset="1" stopColor="#3D0D9E" />
        </linearGradient>
      </defs>
      <path d="M44 215.5L56 221L44 226.5L32 221L44 215.5Z" fill={`url(#${uid}-d)`} />
      <path d="M44 215.5L56 221L44 226.5L32 221L44 215.5" stroke={`url(#${uid}-ds)`} strokeWidth="2" strokeLinejoin="round" />
      <rect x="34" y="201" width="20" height="20" rx="10" fill={`url(#${uid}-c)`} />
      <rect x="36" y="203" width="16" height="16" rx="8" fill={`url(#${uid}-cg)`} />
      <rect x="35" y="202" width="18" height="18" rx="9" stroke={`url(#${uid}-cb)`} strokeWidth="2" />
      <path d="M44 206.417V215.583" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46.0833 208.083H42.9583C42.1535 208.083 41.5 208.737 41.5 209.542C41.5 210.347 42.1535 211 42.9583 211H45.0417C45.8465 211 46.5 211.653 46.5 212.458C46.5 213.263 45.8465 213.917 45.0417 213.917H41.5" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Pills({ lot, featured }: { lot: LotData; featured?: boolean }): JSX.Element {
  return (
    <span className="lc-pills">
      {featured ? <span className="lc-pill lc-pill--featured">Destacado</span> : null}
      {lot.variant === "live"
        ? (lot.live ? <span className="lc-pill lc-pill--live"><i />En vivo</span> : null)
        : <span className="lc-pill lc-pill--negotiable">{I.tag}Recibe ofertas</span>}
    </span>
  );
}
const Like = ({ name }: { name: string }) => <button type="button" className="lc-like" aria-label={`Guardar ${name}`} onClick={(e) => e.stopPropagation()}>{I.heart}</button>;
const Dots = () => <span className="lc-dots" aria-hidden><i /><i /><i /><i /></span>;
const sizeStyle = (width?: number | string, height?: number | string) => ({ width: width ?? "100%", height: height ?? "auto" });

/** «Ficha»: foto + datos. Se adapta a en vivo / negociable. `mediaFill` estira la foto para llenar el alto. */
export function FichaCard({ lot, featured, width, height, mediaFill }: {
  lot: LotData; featured?: boolean; width?: number | string; height?: number | string; mediaFill?: boolean;
}): JSX.Element {
  const live = lot.variant === "live";
  return (
    <article className={`lc lc--${lot.variant}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      <div className="lc-media" style={mediaFill ? { flex: 1, minHeight: 132 } : undefined}>
        <img src={lot.imageSrc} alt="" />
        <Pills lot={lot} featured={featured} />
        <Like name={lot.name} />
        <span className="lc-count">{I.camera}1/{lot.photos}</span>
        <Dots />
      </div>
      <div className="lc-body" style={mediaFill ? { flex: "none" } : undefined}>
        <div><p className="lc-name">{lot.name}</p><p className="lc-sub">{lot.year} · {lot.kind}</p></div>
        {live ? <>
          <div className="lc-chips"><span className="lc-chip">{I.gear}{lot.transmission}</span><span className="lc-chip">{I.fuel}{lot.fuel}</span></div>
          <div className="lc-stats"><span>{I.gauge}{lot.km}</span>{lot.seats ? <span>{I.seats}{lot.seats} asientos</span> : <span>{I.pin}{lot.city}</span>}</div>
          <div className="lc-bar" aria-hidden><i style={{ width: `${Math.round((lot.progress ?? 0.4) * 100)}%` }} /></div>
          <span className="lc-spacer" />
          <div className="lc-pricerow"><SubasCoin /><div><p className="lc-label">{lot.price ? "Precio actual" : "Precio base"}</p><p className="lc-price">{lot.price ?? "Por definir"}</p></div></div>
        </> : <>
          <div className="lc-tiles">
            <span className="lc-tile">{I.gauge}{lot.km}</span><span className="lc-tile">{I.gear}{lot.transmission}</span>
            <span className="lc-tile">{I.fuel}{lot.fuel}</span><span className="lc-tile">{I.seats}{lot.seats ? `${lot.seats} asientos` : "—"}</span>
          </div>
          <div className="lc-meta"><span>{I.pin}{lot.city}</span>{lot.owner ? <span>{I.shield}{lot.owner}</span> : null}</div>
          <span className="lc-spacer" />
          <span className="lc-offer">{I.hands}Haz tu oferta</span>
        </>}
      </div>
    </article>
  );
}

export type FichaLayout = "cta" | "precio" | "cuenta" | "compacta" | "social";

/**
 * Ficha+ — 5 variantes de la Ficha. Solo «cta» lleva botón; en las demás la card entera es el clic.
 *  · cta       la misma Ficha + botón «Ver detalle»: acción explícita al final.
 *  · precio    precio primero: el dato que más decide va bajo el título; specs en una línea.
 *  · cuenta    urgencia: la cuenta regresiva va sobre la foto (se ve aunque no se lea la card).
 *  · compacta  menos texto: 3 specs con ícono, sin barra; precio + botón.
 *  · social    prueba social: ofertas y visitas junto a la cuenta regresiva.
 */
export function FichaPlus({ lot, layout, featured, width, height, mediaFill }: {
  lot: LotData; layout: FichaLayout; featured?: boolean; width?: number | string; height?: number | string; mediaFill?: boolean;
}): JSX.Element {
  const live = lot.variant === "live";
  const head = <div><p className="lc-name">{lot.name}</p><p className="lc-sub">{layout === "compacta" ? lot.year : `${lot.year} · ${lot.kind}`}</p></div>;
  const chips = <div className="lc-chips"><span className="lc-chip">{I.gear}{lot.transmission}</span><span className="lc-chip">{I.fuel}{lot.fuel}</span></div>;
  const stats = <div className="lc-stats"><span>{I.gauge}{lot.km}</span>{lot.seats ? <span>{I.seats}{lot.seats} asientos</span> : <span>{I.pin}{lot.city}</span>}</div>;
  const inline = <p className="lc-inline">{[lot.km, lot.transmission, lot.fuel, lot.city].join(" · ")}</p>;
  const timer = live ? <>
    <div className="lc-bar" aria-hidden><i style={{ width: `${Math.round((lot.progress ?? 0.4) * 100)}%` }} /></div>
  </> : null;
  const price = (big?: boolean) => live
    ? <div className={`lc-pricerow${big ? " lc-pricerow--big" : ""}`}><SubasCoin size={big ? 30 : 28} /><div><p className="lc-label">{lot.price ? "Precio actual" : "Precio base"}</p><p className="lc-price">{lot.price ?? "Por definir"}</p></div></div>
    : <span className="lc-offer">{I.hands}Haz tu oferta</span>;
  const offers = lot.offers ?? 3 + (lot.name.length % 13);
  const visits = lot.visits ?? 120 + lot.name.length * 17;
  const cta = () => (
    <button type="button" className="lc-cta" onClick={(e) => e.stopPropagation()}>
      Ver detalle<svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
  let body: JSX.Element;
  if (layout === "cta") body = <>{head}{chips}{stats}{timer}<span className="lc-spacer" />{price()}{cta()}</>;
  else if (layout === "precio") body = <>{head}{price(true)}{inline}<span className="lc-spacer" />{timer}</>;
  else if (layout === "cuenta") body = <>{head}{inline}<span className="lc-spacer" />{price()}</>;
  else if (layout === "compacta") body = <>{head}
    <div className="lc-specs3"><span>{I.gauge}{lot.km}</span><span>{I.gear}{lot.transmission}</span><span>{I.fuel}{lot.fuel}</span></div>
    <span className="lc-spacer" />{price()}</>;
  else body = <>{head}{chips}
    <div className="lc-social"><span>{I.seats}<b>{offers}</b>{live ? "ofertas" : "propuestas"}</span><span>{I.eye}<b>{visits}</b>visitas</span></div>
    {timer}<span className="lc-spacer" />{price()}</>;
  return (
    <article className={`lc lc--${lot.variant}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      <div className="lc-media" style={mediaFill ? { flex: 1, minHeight: 132 } : undefined}>
        <img src={lot.imageSrc} alt="" />
        <Pills lot={lot} featured={featured} />
        <Like name={lot.name} />
        <span className="lc-count">{I.camera}1/{lot.photos}</span><Dots />
      </div>
      <div className="lc-body" style={mediaFill ? { flex: "none" } : undefined}>{body}</div>
    </article>
  );
}

export type ProTheme = "clasica" | "nocturna" | "curva" | "fundido";

const PI = {
  star: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor" /></svg>,
  live: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>,
  prev: <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  next: <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

/**
 * FichaPro — los 4 diseños de la referencia de producto, sobre la estructura de la Ficha:
 * foto (contador, puntos, pills con ícono, corazón) · nombre · año y tipo · transmisión y combustible ·
 * km y asientos · barra + «Inicia en» · SubasCoin + precio actual. Negociable: sin barra ni precio,
 * «Haz tu oferta».
 *  · clasica   blanca, flechas sobre la foto.
 *  · nocturna  cuerpo azul noche, foto con tono atardecer y ola naranja/magenta abajo.
 *  · curva     foto con borde curvo, datos en 4 cajitas y precio en cápsula con brillo naranja.
 *  · fundido   la foto se funde en azul noche y el texto va encima.
 */
export function FichaPro({ lot, theme, featured, width, height, mediaFill }: {
  lot: LotData; theme: ProTheme; featured?: boolean; width?: number | string; height?: number | string; mediaFill?: boolean;
}): JSX.Element {
  const live = lot.variant === "live";
  const waveId = `lp-wave${useId().replace(/:/g, "")}`;
  return (
    <article className={`lc lp lp--${theme} lc--${lot.variant}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      {theme === "fundido" ? <><img className="lp-bg" src={lot.imageSrc} alt="" /><span className="lp-shade" aria-hidden /></> : null}
      <div className="lc-media" style={mediaFill ? { flex: 1, minHeight: 150 } : undefined}>
        {theme === "fundido" ? null : <img src={lot.imageSrc} alt="" />}
        <span className="lc-pills">
          {featured ? <span className="lc-pill lc-pill--featured">{PI.star}Destacado</span> : null}
          {live ? (lot.live ? <span className="lc-pill lc-pill--live">{PI.live}En vivo</span> : null)
            : <span className="lc-pill lc-pill--negotiable">{I.tag}Recibe ofertas</span>}
        </span>
        <Like name={lot.name} />
        {theme === "clasica" ? <>
          <button type="button" className="lp-arrow lp-arrow--l" aria-label="Foto anterior" onClick={(e) => e.stopPropagation()}>{PI.prev}</button>
          <button type="button" className="lp-arrow lp-arrow--r" aria-label="Foto siguiente" onClick={(e) => e.stopPropagation()}>{PI.next}</button>
        </> : null}
        <span className="lc-count">{I.camera}1/{lot.photos}</span>
        <Dots />
      </div>
      <div className="lc-body" style={mediaFill ? { flex: "none" } : undefined}>
        <div><p className="lc-name">{lot.name}</p><p className="lc-sub">{lot.year} · {lot.kind}</p></div>
        {theme === "curva" ? (
          <div className="lp-tiles">
            <span>{I.gear}{lot.transmission}</span><span>{I.fuel}{lot.fuel}</span>
            <span>{I.gauge}{lot.km}</span><span>{lot.seats ? <>{I.seats}{lot.seats} asientos</> : <>{I.pin}{lot.city}</>}</span>
          </div>
        ) : <>
          <div className="lc-chips"><span className="lc-chip">{I.gear}{lot.transmission}</span><span className="lc-chip">{I.fuel}{lot.fuel}</span></div>
          <div className="lc-stats"><span>{I.gauge}{lot.km}</span>{lot.seats ? <span>{I.seats}{lot.seats} asientos</span> : <span>{I.pin}{lot.city}</span>}</div>
        </>}
        {live ? <>
          <div className="lc-bar" aria-hidden><i style={{ width: `${Math.round((lot.progress ?? 0.4) * 100)}%` }} /></div>
        </> : null}
        <span className="lc-spacer" />
        {live
          ? <div className="lc-pricerow lp-price"><SubasCoin size={30} /><div><p className="lc-label">{lot.price ? "Precio actual" : "Precio base"}</p><p className="lc-price">{lot.price ?? "Por definir"}</p></div></div>
          : <span className="lc-offer">{I.hands}Haz tu oferta</span>}
      </div>
      {theme === "nocturna" ? (
        <svg className="lp-wave" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden>
          <defs><linearGradient id={waveId} x1="0" y1="0" x2="1" y2="0">
            {live ? <><stop stopColor="#FF9639" /><stop offset="0.55" stopColor="#F0447A" /><stop offset="1" stopColor="#8A3FE0" /></>
              : <><stop stopColor="#00DAE0" /><stop offset="0.6" stopColor="#3A8BF0" /><stop offset="1" stopColor="#8A3FE0" /></>}
          </linearGradient></defs>
          <path d="M0 60 L0 40 C40 30 70 52 110 40 C150 28 175 18 200 22 L200 60 Z" fill={`url(#${waveId})`} opacity="0.55" />
          <path d="M0 60 L0 50 C50 44 90 58 140 46 C170 40 188 36 200 38 L200 60 Z" fill={`url(#${waveId})`} opacity="0.85" />
        </svg>
      ) : null}
    </article>
  );
}

export type LegendTier = "leyenda" | "holo" | "elite";

const noAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const abbr = (s: string) => noAccents(s).slice(0, 3).toUpperCase();
/** Stats tipo FIFA («92 PAC»): valor corto + sigla. km → 45K KM · h → 6K HRS · t → 12 TON. */
function eliteStats(lot: LotData): [string, string][] {
  const m = lot.km.match(/^([\d,.]+)\s*(\S+)/);
  const n = m ? Number(m[1].replace(/,/g, "")) : NaN;
  const unit = m?.[2] ?? "";
  const value = Number.isFinite(n) ? (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)) : lot.km;
  const unitLabel = unit === "km" ? "KM" : unit === "h" ? "HRS" : unit === "t" ? "TON" : abbr(unit);
  return [[value, unitLabel], [abbr(lot.transmission), "TRA"], [abbr(lot.fuel), "COM"], [lot.seats ? String(lot.seats) : "—", "ASI"]];
}

/**
 * FichaLegend — 3 versiones «premium» de la Ficha, inspiradas en las cartas especiales de FIFA
 * (borde metálico, brillo, foil holográfico, stats) con los colores de VMC:
 *  · leyenda  borde metálico naranja/lila que gira, destello que cruza la foto y la franja convertida en
 *             placa de precio con brillo metálico.
 *  · holo     card blanca con foil holográfico (lila/cyan/naranja) y reflejo que siguen al mouse, con
 *             inclinación 3D; la franja es el contador de tiempo con una luz que corre.
 *  · elite    carta oscura redondeada con estrellas, el año como «puntaje», stats en siglas
 *             (45K KM · AUT TRA · GAS COM · 5 ASI) y la franja convertida en neón con un pulso de luz.
 */
export function FichaLegend({ lot, tier, featured, width, height, mediaFill, curve }: {
  lot: LotData; tier: LegendTier; featured?: boolean; width?: number | string; height?: number | string; mediaFill?: boolean;
  /** Holo curva: foto con borde curvo, like de Concorde y «Precio base» (default de la galería). */
  curve?: boolean;
}): JSX.Element {
  const live = lot.variant === "live";
  const progress = `${Math.round((lot.progress ?? 0.4) * 100)}%`;
  const pills = (
    <span className="lc-pills">
      {featured ? <span className="lc-pill lc-pill--featured">{PI.star}Destacado</span> : null}
      {live ? (lot.live ? <span className="lc-pill lc-pill--live">{PI.live}En vivo</span> : null)
        : <span className="lc-pill lc-pill--negotiable">{I.tag}Recibe ofertas</span>}
    </span>
  );
  const price = live
    ? <div className="lc-pricerow"><SubasCoin size={28} /><div><p className="lc-label">{curve || !lot.price ? "Precio base" : "Precio actual"}</p><p className="lc-price">{lot.price ?? "Por definir"}</p></div></div>
    : <span className="lc-offer">{I.hands}Haz tu oferta</span>;
  const head = <div><p className="lc-name">{lot.name}</p><p className="lc-sub">{lot.year} · {lot.kind}</p></div>;
  const chips = <div className="lc-chips"><span className="lc-chip">{I.gear}{lot.transmission}</span><span className="lc-chip">{I.fuel}{lot.fuel}</span></div>;
  const stats = <div className="lc-stats"><span>{I.gauge}{lot.km}</span>{lot.seats ? <span>{I.seats}{lot.seats} asientos</span> : <span>{I.pin}{lot.city}</span>}</div>;
  const mediaStyle = mediaFill ? { flex: 1, minHeight: 120 } : undefined;
  const bodyStyle = mediaFill ? { flex: "none" as const } : undefined;

  // Holo: el foil y el reflejo siguen al puntero; la card se inclina hacia él.
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${Math.round(x * 100)}%`); el.style.setProperty("--my", `${Math.round(y * 100)}%`);
    el.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`); el.style.setProperty("--ry", `${((x - 0.5) * 12).toFixed(2)}deg`);
  };
  const onLeave = (e: PointerEvent<HTMLElement>) => { for (const k of ["--mx", "--my", "--rx", "--ry"]) e.currentTarget.style.removeProperty(k); };

  if (tier === "elite") {
    return (
      <article className={`lc lg lg--elite lc--${lot.variant}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
        <div className="lg-in">
          <span className="lg-stars" aria-hidden />
          <div className="lc-media" style={mediaStyle}>
            <img src={lot.imageSrc} alt="" />
            <span className="lg-rating" aria-hidden><b>{lot.year}</b><small>{lot.kind}</small></span>
            {pills}
            <Like name={lot.name} />
          </div>
          <div className="lc-body" style={bodyStyle}>
            <p className="lc-name">{lot.name}</p>
            <span className="lg-divider" aria-hidden />
            <div className="lg-stats">{eliteStats(lot).map(([v, l]) => <span key={l}><b>{v}</b><small>{l}</small></span>)}</div>
            <span className="lc-spacer" />
            {price}
          </div>
          <span className="lg-neon" aria-hidden />
        </div>
      </article>
    );
  }
  const media = (
    <div className="lc-media" style={mediaStyle}>
      <img src={lot.imageSrc} alt="" />
      {pills}
      {curve ? <span className="lc-likepos"><Clike name={lot.name} /></span> : <Like name={lot.name} />}
      <span className="lc-count">{I.camera}1/{lot.photos}</span>
      <Dots />
      {tier === "leyenda" ? <span className="lg-shine" aria-hidden /> : null}
    </div>
  );
  if (tier === "holo") {
    return (
      <article className={`lc lg lg--holo lc--${lot.variant}${curve ? " lc--featured-curve" : ""}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}
        onPointerMove={onMove} onPointerLeave={onLeave}>
        {media}
        <div className="lc-body" style={bodyStyle}>{head}{chips}{stats}<span className="lc-spacer" />{price}</div>
        <span className="lg-track" aria-hidden><i style={{ width: "100%" }} /></span> {/* 03/11: llena en vivo y en negociable */}
        <span className="lg-holo" aria-hidden />
        <span className="lg-glare" aria-hidden />
      </article>
    );
  }
  return (
    <article className={`lc lg lg--leyenda lc--${lot.variant}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      <div className="lg-in">
        {media}
        <div className="lc-body" style={bodyStyle}>
          {head}{chips}{stats}
          {live ? <div className="lc-bar" aria-hidden><i style={{ width: progress }} /></div> : null}
        </div>
        <div className="lg-plaque">
          {live ? <><SubasCoin size={26} /><span><small>{lot.price ? "Precio actual" : "Precio base"}</small><b>{lot.price ?? "Por definir"}</b></span></>
            : <>{I.hands}<b>Haz tu oferta</b></>}
        </div>
      </div>
    </article>
  );
}

/** Like de Concorde (LikeButton): corazón con borde degradado lila; activo, relleno morado con pop. */
function Clike({ name, size = 30 }: { name: string; size?: number }): JSX.Element {
  const [on, setOn] = useState(false);
  const [pop, setPop] = useState(0);
  return (
    <button type="button" className={`clike${on ? " clike--active" : ""}${pop ? " clike--pop" : ""}`} style={{ width: size, height: size }}
      aria-label={`Agregar a favoritos: ${name}`} aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); setOn((v) => !v); setPop((n) => n + 1); }} onAnimationEnd={() => setPop(0)}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill={on ? "#ffffff" : "#ffffff"} stroke={on ? "#ffffff" : "#5a35c2"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

/**
 * Lote estilo listado de eBay: foto cuadrada a la izquierda y, a la derecha, pill de estado con borde,
 * nombre en mayúsculas, empresa verificada, precio grande (o «Haz tu oferta»), datos en gris y, abajo,
 * ciudad · tiempo con me gusta y compartir.
 */
export function EbayLotRow({ lot, store, size = "md" }: { lot: LotData; store: string; size?: "md" | "sm" }): JSX.Element {
  const live = lot.variant === "live";
  return (
    <article className={`lc-eb lc--${lot.variant}${size === "sm" ? " lc-eb--sm" : ""}`} aria-label={`${lot.name} ${lot.year}`}>
      <span className="lc-eb__thumb"><img src={lot.imageSrc} alt="" /></span>
      <span className="lc-eb__like"><Clike name={lot.name} size={size === "sm" ? 26 : 30} /></span>
      <div className="lc-eb__main">
        {/* Pills de las cards (mismo componente visual que la destacada): solo En vivo o Negociable. */}
        <span className="lc-eb__pill">{live
          ? <span className="lc-pill lc-pill--live">{PI.live}En vivo</span>
          : <span className="lc-pill lc-pill--negotiable">{I.tag}Recibe ofertas</span>}</span>
        <p className="lc-eb__title">{lot.name} {lot.year}</p>
        <span className="lc-eb__who">{store}<svg width="12" height="12" viewBox="0 0 24 24" aria-label="Verificado"><path d="M12 1.8l2.6 1.9 3.2-.2 1 3 2.6 1.9-1 3.1 1 3-2.6 1.9-1 3.1-3.2-.2L12 22.2l-2.6-1.9-3.2.2-1-3.1L2.6 15.5l1-3-1-3.1 2.6-1.9 1-3 3.2.2z" fill="#6B48DD" /><path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        {lot.price ? <b className="lc-eb__price"><SubasCoin size={17} />{lot.price}</b> : <b className="lc-eb__offer">Haz tu oferta</b>}
        <span className="lc-eb__rest">{lot.km} · {lot.transmission} · {lot.fuel}</span>
        <span className="lc-eb__foot">
          <span>{lot.city}</span>
        </span>
      </div>
    </article>
  );
}

/** Curva compacta (134 × 170): foto con curva asimétrica, nombre, año · tipo y pie con precio o «Negociable». */
export function CompactCurveCard({ lot }: { lot: LotData }): JSX.Element {
  return (
    <article className={`lc lc--compact-curve lc--${lot.variant}`} aria-label={`${lot.name} ${lot.year}`}>
      <div className="lc-compact-curve__media">
        <img src={lot.imageSrc} alt="" />
        <span className="lc-likepos"><Clike name={lot.name} /></span>
      </div>
      <div className="lc-compact-curve__body">
        <p className="lc-compact-curve__name">{lot.name}</p>
        <span className="lc-compact-curve__meta"><span>{lot.year}</span><i /><span>{lot.kind}</span></span>
        <div className="lc-compact-curve__footer">
          {lot.price ? <span className="lc-compact-curve__base-price"><SubasCoin size={16} /><span>{lot.price}</span></span> : <span>Recibe ofertas</span>}
        </div>
      </div>
    </article>
  );
}

/** «Inmersiva»: foto a toda la card y datos sobre degradado oscuro. `sm` para las cards chicas de la galería. */
export function ImmersiveCard({ lot, featured, size = "md", width, height }: {
  lot: LotData; featured?: boolean; size?: "md" | "sm"; width?: number | string; height?: number | string;
}): JSX.Element {
  return (
    <article className={`lc lc--imm lc--${lot.variant}${size === "sm" ? " lc--sm" : ""}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      <img src={lot.imageSrc} alt="" />
      <span className="lc-imm__shade" aria-hidden />
      <Pills lot={lot} featured={featured} />
      <Like name={lot.name} />
      <div className="lc-imm__info">
        <Dots />
        <p className="lc-imm__name">{lot.name}</p>
        <span className="lc-imm__year">{lot.year}</span>
        {lot.price ? <span className="lc-imm__price"><SubasCoin size={size === "sm" ? 18 : 26} />{lot.price}</span> : <span className="lc-imm__neg">Haz tu oferta</span>}
      </div>
    </article>
  );
}

/** «Resumen»: card centrada y compacta. Negociable: «Propuestas» en vez de ofertas y «Haz tu oferta» en vez del precio. */
export function SummaryCard({ lot, featured, width, height, mediaFill }: {
  lot: LotData; featured?: boolean; width?: number | string; height?: number | string; mediaFill?: boolean;
}): JSX.Element {
  const live = lot.variant === "live";
  const offers = lot.offers ?? 3 + (lot.name.length % 13);
  const visits = lot.visits ?? 120 + lot.name.length * 17;
  return (
    <article className={`lc lc--${lot.variant}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      <div className="lc-media" style={mediaFill ? { flex: 1, minHeight: 132 } : undefined}>
        <img src={lot.imageSrc} alt="" />
        <Pills lot={lot} featured={featured} />
        <Like name={lot.name} />
      </div>
      <div className="lc-sum" style={mediaFill ? { flex: "none" } : undefined}>
        <div className="lc-sum__head">
          <p className="lc-sum__title">{lot.name} {lot.year}</p>
          <p className="lc-sum__specs">{[lot.km, lot.transmission, lot.fuel, lot.city].join(" • ")}</p>
        </div>
        <div className="lc-sum__stats">
          <span>{live ? "Ofertas actuales" : "Propuestas"}<b>{offers}</b></span>
          <span>Visitas<b>{visits}</b></span>
        </div>
        <div className="lc-sum__price">
          {live ? <>
            <small>{lot.live ? "PRECIO ACTUAL" : "PRECIO BASE"}</small>
            <span><SubasCoin size={24} /><b className="lc-price">{lot.price ?? "Por definir"}</b></span>
          </> : <span className="lc-offer">{I.hands}Haz tu oferta</span>}
        </div>
      </div>
    </article>
  );
}

/** Precio con SubasCoin o, en negociables, «Haz tu oferta» (Relieve y Cristal). */
function PriceOrOffer({ lot, coin = 26 }: { lot: LotData; coin?: number }): JSX.Element {
  return lot.price ? <><SubasCoin size={coin} /><b className="lc-price">{lot.price}</b></> : <span className="lc-offer">{I.hands}Haz tu oferta</span>;
}

/** «Relieve»: el cuerpo blanco se monta sobre la foto con sombras internas suaves. */
export function ReliefCard({ lot, featured, width, height, mediaFill, compact }: {
  lot: LotData; featured?: boolean; width?: number | string; height?: number | string; mediaFill?: boolean; compact?: boolean;
}): JSX.Element {
  const wave = lot.variant === "live"
    ? { a: "#FFF0F5", b: "#FFD9E6", c: "#FFC2D6", d: "#FFB8CF" }
    : { a: "#EFFFFF", b: "#C8F7F9", c: "#A6F0F3", d: "#7FE9EE" };
  return (
    <article className={`lc lc--relief lc--${lot.variant}${compact ? " lc--compact" : ""}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      <div className="lc-media" style={mediaFill ? { flex: 1, minHeight: 150 } : undefined}>
        <img src={lot.imageSrc} alt="" />
        <Pills lot={lot} featured={featured} />
        <Like name={lot.name} />
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 22 }}><Dots /></span>
      </div>
      <div className="lc-rel" style={mediaFill ? { flex: "none" } : undefined}>
        <svg className="lc-rel__wave" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden>
          {/* Ola del color del estado: rosada en vivo, cyan en negociable (id por variante para no pisarse). */}
          <defs><linearGradient id={`lc-wave-${lot.variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={wave.a} stopOpacity="0" /><stop offset="0.45" stopColor={wave.b} /><stop offset="1" stopColor={wave.c} />
          </linearGradient></defs>
          <path d="M40 100 C90 85 120 60 200 10 L200 100 Z" fill={`url(#lc-wave-${lot.variant})`} opacity="0.75" />
          <path d="M90 100 C130 90 160 70 200 45 L200 100 Z" fill={wave.d} opacity="0.35" />
        </svg>
        <p className="lc-name">{lot.name}</p>
        <span className="lc-sub">{lot.year}</span>
        <div className="lc-rel__price"><PriceOrOffer lot={lot} /></div>
      </div>
    </article>
  );
}

/** «Cristal»: marco morado/lila, foto con borde y reflejo de vidrio, precio en cápsula de vidrio. */
export function GlassCard({ lot, featured, width, height, mediaFill }: {
  lot: LotData; featured?: boolean; width?: number | string; height?: number | string; mediaFill?: boolean;
}): JSX.Element {
  return (
    <article className={`lc lc--glass lc--${lot.variant}`} style={sizeStyle(width, height)} aria-label={`${lot.name} ${lot.year}`}>
      <img className="lc-glass__blur" src={lot.imageSrc} alt="" aria-hidden />
      <div className="lc-media" style={mediaFill ? { flex: 1, minHeight: 150 } : undefined}>
        <img src={lot.imageSrc} alt="" />
        <Pills lot={lot} featured={featured} />
        <Like name={lot.name} />
        <Dots />
      </div>
      <div className="lc-glass" style={mediaFill ? { flex: "none" } : undefined}>
        <p className="lc-name">{lot.name}</p>
        <span className="lc-sub">{lot.year}</span>
        <span className="lc-glass__rule" aria-hidden />
        <span className="lc-spacer" />
        <div className="lc-glass__price"><PriceOrOffer lot={lot} coin={24} /></div>
      </div>
    </article>
  );
}

export function LotCardStyles(): JSX.Element {
  return <style>{CSS}</style>;
}
