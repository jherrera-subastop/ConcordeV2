"use client";

/**
 * DetailCard — Generado por Concorde
 * Fuente: Figma VOYAGER · "DetailCard" (nodo 2007:18447 / Container 2007:16954)
 *
 * Tarjeta de detalle de oferta: header oscuro (Inicia / fecha / hora + LikeButton +
 * 3 stats) sobre cuerpo blanco (título + botón Participa + Precio Base con gema +
 * comisión). 2 variantes según el botón/acento:
 *   · live       → botón naranja→lila (#ED8936 → #8460E5), glow naranja
 *   · negotiable → botón teal→lila  (#00A8AB → #8460E5), glow teal
 * 311 de ancho. Botón con hover/press, LikeButton clickeable.
 */

import { useId } from "react";
import type { JSX, MouseEventHandler } from "react";
import LikeButton from "./LikeButton";
import PriceIcon from "./PriceIcon";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DetailCardVariant = "live" | "negotiable";

export interface DetailCardProps {
  /** Variante de acento del botón (default "live") */
  variant?: DetailCardVariant;
  /** Etiqueta superior izquierda (default "Inicia" en live · "Cierra" en negotiable) */
  startLabel?: string;
  /** Fecha (default "LUNES 04") */
  day?: string;
  /** Hora (default "11:11 pm") */
  time?: string;
  /** Vistas / likes / participantes (default 11) */
  views?: number | string;
  likes?: number | string;
  participants?: number | string;
  /** Texto del banner teal (default solo en negotiable: "¡Aprende a negociar con Subastin!"). Pasa "" para ocultarlo. */
  bannerText?: string;
  /** Banner compacto con Max, el asistente AI de VMC. */
  assistantBanner?: boolean;
  /** Banner mini 311 × 60 en el lugar del de Max (p. ej. «Publica en VMC»): imagen @2x que enlaza a `href`. */
  miniBanner?: { src: string; alt: string; href: string };
  /** Título del cuerpo */
  title?: string;
  /** Etiqueta del precio (default "Precio Base:") */
  priceLabel?: string;
  /** Precio formateado (default "US$ 12,999") */
  price?: string;
  /** Texto de comisión */
  commission?: string;
  /** Estado del like (controlado) */
  liked?: boolean;
  onLikeChange?: (active: boolean) => void;
  /** Texto del botón (default "Participa") */
  ctaLabel?: string;
  onParticipate?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

// ─── Self-contained CSS ───────────────────────────────────────────────────────

const STYLE_ID = "concorde-detailcard-styles";

const DETAILCARD_STYLES = `
.pdetail {
  width: 311px;
  max-width: 100%;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: rgba(0,0,0,0.1) 0px 0px 16px 4px;
  font-family: var(--vmc-font-display, "Plus Jakarta Sans", -apple-system, sans-serif);
}

/* ── Header oscuro ── */
.pdetail__head {
  position: relative;
  height: 130px;
  background: linear-gradient(157deg, #5A35C2 0%, #2e0f70 50%, #100030 100%);
  color: #ffffff;
  box-sizing: border-box;
}
.pdetail__head::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 38px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}
.pdetail__start { position: absolute; top: 14px; left: 20px; z-index: 1; }
.pdetail__start small { display: block; font-size: 14px; font-weight: 400; opacity: 1; line-height: 1.45; }
.pdetail__start b { display: block; font-size: 17px; font-weight: 700; line-height: 1.2; letter-spacing: 0.01em; }
.pdetail__time { position: absolute; top: 25px; right: 20px; font-size: 17px; font-weight: 600; z-index: 1; }
.pdetail__vline { position: absolute; top: 8px; left: 50%; width: 1px; height: 19px; background: rgba(255,255,255,0.6); transform: translateX(-50%); }
.pdetail__hline { position: absolute; top: 58px; height: 1px; background: rgba(255,255,255,0.6); }
.pdetail__hline--l { left: 20px; width: 99.5px; }
.pdetail__hline--r { right: 20px; width: 99.5px; }
.pdetail__like { position: absolute; top: 38px; left: 50%; transform: translateX(-50%); z-index: 2; }
.pdetail__stats {
  position: absolute;
  bottom: 16px; left: 53px; right: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}
.pdetail__stat { display: flex; align-items: center; gap: 12px; }
.pdetail__stat b { font-size: 16px; font-weight: 700; }
.pdetail__statico {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  color: #ffffff;
}

/* ── Banner teal (solo negotiable · 311×60) ── */
.pdetail__banner {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
  background: linear-gradient(90deg, #00DAE0 0%, #008688 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}
.pdetail__max-banner {
  position: relative;
  height: 60px;
  overflow: hidden;
  box-sizing: border-box;
  background: #F3ECFF;
}
.pdetail__max-banner img { display:block; width:100%; max-width:none; height:100%; object-fit:fill; transform:translateX(8px); }
.pdetail__max-banner::before { content:""; position:absolute; z-index:1; top:0; right:0; width:58px; height:100%; pointer-events:none; background:linear-gradient(90deg, rgba(248,244,255,0), #F8F4FF 36%, #F8F4FF 100%); }
.pdetail__mini-banner { display:block; background:#fff; }
.pdetail__mini-banner img { transform:none; }
.pdetail__mini-banner::before { display:none; }
.pdetail__mini-banner:focus-visible { outline:2px solid #8460E5; outline-offset:-2px; }
.pdetail__max-go { position:absolute; z-index:2; top:50%; right:14px; display:grid; place-items:center; width:28px; height:28px; box-sizing:border-box; border:1.5px solid transparent; border-radius:50%; color:#5A35C2;
  background:linear-gradient(145deg, rgba(255,255,255,.94), rgba(245,240,255,.76)) padding-box, linear-gradient(135deg, #30E8EC 0%, #8460E5 72%, #CFBAFF 100%) border-box;
  box-shadow:inset 0 1px 0 #fff, 0 3px 10px rgba(59,23,130,.16); transform:translateY(-50%); animation:pdetail-max-live 2.2s ease-in-out infinite; }
.pdetail__max-go::after { content:""; position:absolute; inset:-4px; border:1px solid rgba(132,96,229,.34); border-radius:inherit; opacity:0; animation:pdetail-max-ring 2.2s ease-out infinite; }
.pdetail__max-go svg { display:block; animation:pdetail-max-chat 1.8s ease-in-out infinite; }
@keyframes pdetail-max-live { 0%,100% { transform:translateY(-50%) scale(1); box-shadow:inset 0 1px 0 #fff, 0 3px 10px rgba(59,23,130,.16); } 50% { transform:translateY(-50%) scale(1.07); box-shadow:inset 0 1px 0 #fff, 0 5px 14px rgba(0,168,171,.22), 0 3px 10px rgba(132,96,229,.2); } }
@keyframes pdetail-max-ring { 0%,52% { opacity:0; transform:scale(.84); } 70% { opacity:.55; } 100% { opacity:0; transform:scale(1.22); } }
@keyframes pdetail-max-chat { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-1px) scale(1.08); } }

/* ── Cuerpo blanco (311×260) ── */
.pdetail__body { padding: 0 16px 40px; text-align: center; }
/* text/VYbody-xsm · Plus Jakarta Sans · 400 · 12px · line-height space/200 (16px) */
.pdetail__title { margin: 44px auto 0; max-width: 216px; font-size: 12px; font-weight: 400; letter-spacing: 0; color: #191C1C; line-height: 16px; white-space: pre-line; }
.pdetail__title--assistant { max-width: 270px; }

/* ── Botón Participa — misma interacción que Button (primary/negotiable) ── */
@property --pdangle { syntax: "<angle>"; inherits: false; initial-value: 135deg; }
@property --pda { syntax: "<color>"; inherits: false; initial-value: #ed8936; }
@property --pdb { syntax: "<color>"; inherits: false; initial-value: #8460e5; }

.pdetail__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  min-width: 186px;
  height: 48px;
  white-space: nowrap;
  padding: 0 20px;
  border-radius: 9999px;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-family: inherit;
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: rgba(0,0,0,0.25) 0 1px 3px;
  background-image:
    linear-gradient(var(--pdangle), var(--pda) 0%, var(--pda) 40%, var(--pdb) 100%),
    var(--pd-border);
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  box-shadow: rgba(255,255,255,0.28) 0 1px 0 2px inset, var(--pd-glow) 0 2px 6px;
  transition:
    --pdangle 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
    --pda 0.35s,
    --pdb 0.35s,
    transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.25s;
  transform: translateZ(0);
}
.pdetail__cta::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(rgba(255,255,255,0.17) 0%, transparent 55%);
  pointer-events: none;
  z-index: 1;
}
.pdetail__cta::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  background: var(--pd-glowgrad);
  filter: blur(14px);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s, filter 0.3s;
}
.pdetail__cta:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: rgba(255,255,255,0.22) 0 1px 0 2px inset, rgba(132,96,229,0.35) 0 8px 24px, var(--pd-glow2) 0 4px 10px;
}
.pdetail__cta:hover::after { opacity: 0.45; filter: blur(18px); }
.pdetail__cta:active {
  color: #d1d5dc;
  transform: scale(0.97) translateY(1px);
  box-shadow: rgba(0,0,0,0.22) 0 2px 5px 2px inset, rgba(0,0,0,0.12) 0 1px 3px;
}
.pdetail__cta:active::after { opacity: 0; }
.pdetail__cta:focus-visible {
  outline: none;
  transform: scale(0.98);
  box-shadow: rgba(255,255,255,0.28) 0 1px 0 2px inset, 0 0 0 3px rgba(132,96,229,0.45);
}

.pdetail--live .pdetail__cta {
  --pda: #ed8936; --pdb: #8460e5;
  --pd-border: linear-gradient(135deg, #ffffff 0%, #fbc47d 25%, #ae8eff 75%, #ffffff 100%);
  --pd-glow: rgba(237,137,54,0.3);
  --pd-glow2: rgba(237,137,54,0.4);
  --pd-glowgrad: linear-gradient(135deg, #ed8936, #8460e5);
}
.pdetail--live .pdetail__cta:hover { --pdangle: 220deg; --pda: #fbc47d; --pdb: #ae8eff; }
.pdetail--live .pdetail__cta:active { --pdangle: 135deg; --pda: #d46e20; --pdb: #5a35c2; }

.pdetail--negotiable .pdetail__cta {
  --pda: #00a8ab; --pdb: #8460e5;
  --pd-border: linear-gradient(135deg, #ffffff 0%, #30e8ec 25%, #5a35c2 75%, #ffffff 100%);
  --pd-glow: rgba(0, 168, 171,0.3);
  --pd-glow2: rgba(0, 168, 171,0.4);
  --pd-glowgrad: linear-gradient(135deg, #00a8ab, #8460e5);
}
.pdetail--negotiable .pdetail__cta:hover { --pdangle: 220deg; --pda: #30e8ec; --pdb: #ae8eff; }
.pdetail--negotiable .pdetail__cta:active { --pdangle: 135deg; --pda: #008688; --pdb: #5a35c2; }

/* ── Precio + comisión ── */
.pdetail__price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 14px 0 0;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  color: #5A35C2;
}
.pdetail__price b { font-size: 12px; font-weight: 400; }
.pdetail__commission {
  margin: 14px auto 0;
  max-width: 215px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  color: #191C1C;
}

@media (prefers-reduced-motion: reduce) {
  .pdetail__cta { transition: none; }
  .pdetail__max-go, .pdetail__max-go::after, .pdetail__max-go svg { animation:none; }
}
`;

let _stylesInjected = false;

// ─── Iconos de stats ──────────────────────────────────────────────────────────

function EyeIcon(): JSX.Element {
  return (
    <svg width="17" height="17" viewBox="86 87.5 20 20" fill="currentColor" aria-hidden="true">
      <path d="M96 100C96.663 100 97.2989 99.7366 97.7678 99.2678C98.2366 98.7989 98.5 98.163 98.5 97.5C98.5 96.837 98.2366 96.2011 97.7678 95.7322C97.2989 95.2634 96.663 95 96 95C95.337 95 94.7011 95.2634 94.2322 95.7322C93.7634 96.2011 93.5 96.837 93.5 97.5C93.5 98.163 93.7634 98.7989 94.2322 99.2678C94.7011 99.7366 95.337 100 96 100Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M87.5704 97.0643C88.7452 93.5417 92.0746 91 96.0009 91C99.9248 91 103.253 93.5393 104.429 97.0588C104.524 97.344 104.524 97.6513 104.429 97.9357C103.255 101.458 99.9248 104 95.9993 104C92.0754 104 88.7468 101.461 87.5712 97.9412C87.4763 97.6566 87.4763 97.3489 87.5712 97.0643H87.5704ZM100.145 97.5C100.145 98.597 99.7083 99.6491 98.931 100.425C98.1537 101.201 97.0994 101.636 96.0001 101.636C94.9008 101.636 93.8465 101.201 93.0691 100.425C92.2918 99.6491 91.8551 98.597 91.8551 97.5C91.8551 96.403 92.2918 95.3509 93.0691 94.5751C93.8465 93.7994 94.9008 93.3636 96.0001 93.3636C97.0994 93.3636 98.1537 93.7994 98.931 94.5751C99.7083 95.3509 100.145 96.403 100.145 97.5Z" />
    </svg>
  );
}

function GroupIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="208 89.5 15 15" fill="currentColor" aria-hidden="true">
      <path d="M219.534 97.5H218.5C218.603 97.8176 218.707 98.1353 218.707 98.4529V102.476C218.707 102.688 218.707 102.794 218.603 102.9H220.362C220.983 102.9 221.5 102.371 221.5 101.735V99.5118C221.5 98.4529 220.672 97.5 219.534 97.5Z" />
      <path d="M211.7 98.4529C211.7 98.1353 211.8 97.8176 211.9 97.5H210.9C209.8 97.5 209 98.4529 209 99.5118V101.735C209 102.371 209.5 102.9 210.1 102.9H211.8C211.7 102.794 211.7 102.688 211.7 102.476V98.4529Z" />
      <path d="M216.369 96.8636H214.169C213.069 96.8636 212.269 97.6636 212.269 98.6636V102.464C212.269 102.664 212.369 102.864 212.569 102.864H217.969C218.169 102.864 218.269 102.664 218.269 102.464V98.6636C218.269 97.6636 217.469 96.8636 216.369 96.8636Z" />
      <path d="M215.323 90.5C214.123 90.5 213.023 91.5 213.023 92.8C213.023 93.6 213.523 94.3 214.223 94.7C214.523 94.9 214.923 95 215.323 95C215.723 95 216.123 94.9 216.423 94.7C217.123 94.3 217.623 93.6 217.623 92.8C217.623 91.5 216.523 90.5 215.323 90.5Z" />
      <path d="M211.062 93.1727C210.162 93.1727 209.362 93.9727 209.362 94.8727C209.362 95.7727 210.162 96.5727 211.062 96.5727C211.362 96.5727 211.562 96.4727 211.762 96.3727C212.162 96.2727 212.362 95.9727 212.562 95.6727C212.762 95.3727 212.762 95.1727 212.762 94.8727C212.762 93.9727 212.062 93.1727 211.062 93.1727Z" />
      <path d="M219.677 93.1727C218.677 93.1727 217.977 93.9727 217.977 94.8727C217.977 95.1727 217.977 95.3727 218.177 95.6727C218.377 95.9727 218.577 96.2727 218.977 96.3727C219.177 96.4727 219.377 96.5727 219.677 96.5727C220.577 96.5727 221.377 95.7727 221.377 94.8727C221.377 93.9727 220.577 93.1727 219.677 93.1727Z" />
    </svg>
  );
}

function MessageIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M18 7.12C18 6.78052 17.8703 6.45495 17.6395 6.2149C17.4087 5.97486 17.0957 5.84 16.7692 5.84H14.3077V3.28C14.3077 2.94052 14.178 2.61495 13.9472 2.3749C13.7164 2.13486 13.4033 2 13.0769 2H3.23077C2.90435 2 2.5913 2.13486 2.36048 2.3749C2.12967 2.61495 2 2.94052 2 3.28V13.52C2.00036 13.6404 2.03337 13.7583 2.09525 13.86C2.15712 13.9618 2.24534 14.0434 2.34978 14.0953C2.45422 14.1473 2.57063 14.1676 2.68565 14.1538C2.80067 14.1401 2.90962 14.0929 3 14.0176L5.69231 11.76V14.16C5.69231 14.4995 5.82198 14.825 6.05279 15.0651C6.28361 15.3051 6.59666 15.44 6.92308 15.44H14.1223L17 17.8576C17.1089 17.9492 17.2446 17.9994 17.3846 18C17.5478 18 17.7044 17.9326 17.8198 17.8125C17.9352 17.6925 18 17.5297 18 17.36V7.12ZM14.7269 14.3024C14.618 14.2108 14.4824 14.1606 14.3423 14.16H6.92308V11.6H13.0769C13.4033 11.6 13.7164 11.4651 13.9472 11.2251C14.178 10.9851 14.3077 10.6595 14.3077 10.32V7.12H16.7692V16.02L14.7269 14.3024Z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DetailCard({
  variant = "live",
  startLabel,
  bannerText,
  day = "LUNES 04",
  time = "11:11 pm",
  views = 11,
  likes = 11,
  participants = 11,
  title,
  priceLabel = "Precio Base:",
  price = "US$ 12,999",
  commission,
  liked,
  onLikeChange,
  ctaLabel,
  onParticipate,
  assistantBanner = false,
  miniBanner,
  className = "",
}: DetailCardProps): JSX.Element {
  useId();

  // Defaults por variante. En negotiable el cuerpo es más corto (sin fila de
  // precio) pero lleva banner teal → el alto total queda igual que en live.
  const isNeg = variant === "negotiable";
  const resolvedStartLabel = startLabel ?? (isNeg ? "Cierra" : "Inicia");
  const resolvedBanner = bannerText ?? (isNeg ? "¡Aprende a negociar con Subastin!" : "");
  const resolvedTitle = title ?? (isNeg ? "Aprovecha esta oportunidad y haz una propuesta al vendedor." : "¡Oportunidad para el que sabe!");
  const resolvedCta = ctaLabel ?? (isNeg ? "Negocia ahora" : "Participa");
  const resolvedCommission = commission ?? (isNeg ? "Comisión >S< 0" : "Comisión: 7.5% del valor de compra o mínimo >S< 50");

  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = DETAILCARD_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: DETAILCARD_STYLES }} />
      <div className={["pdetail", `pdetail--${variant}`, className].filter(Boolean).join(" ")}>

        {/* Header */}
        <div className="pdetail__head">
          <div className="pdetail__start">
            <small>{resolvedStartLabel}</small>
            <b>{day}</b>
          </div>
          <span className="pdetail__time">{time}</span>
          <span className="pdetail__vline" />
          <span className="pdetail__hline pdetail__hline--l" />
          <span className="pdetail__hline pdetail__hline--r" />
          <div className="pdetail__like">
            <LikeButton size="lg" active={liked} onChange={onLikeChange} aria-label="Guardar oferta" />
          </div>
          <div className="pdetail__stats">
            <span className="pdetail__stat"><b>{views}</b><span className="pdetail__statico"><EyeIcon /></span></span>
            <span className="pdetail__stat"><b>{likes}</b></span>
            <span className="pdetail__stat"><span className="pdetail__statico">{isNeg ? <MessageIcon /> : <GroupIcon />}</span><b>{participants}</b></span>
          </div>
        </div>

        {/* Banner teal (negotiable) */}
        {miniBanner ? <a className="pdetail__max-banner pdetail__mini-banner" href={miniBanner.href}><img src={miniBanner.src} alt={miniBanner.alt} /></a>
          : assistantBanner ? <div className="pdetail__max-banner"><img src="/producto-assets/mi-garaje/banners/max/max-mini-claro-escucha@2x.png" alt="¿Tienes alguna duda? Consúltale a Max." /><span className="pdetail__max-go" aria-hidden><MessageIcon /></span></div>
          : resolvedBanner ? <div className="pdetail__banner">{resolvedBanner}</div> : null}

        {/* Body */}
        <div className="pdetail__body">
          <p className={`pdetail__title${assistantBanner || miniBanner ? " pdetail__title--assistant" : ""}`}>{resolvedTitle}</p>
          <button type="button" className="pdetail__cta" onClick={onParticipate}>{resolvedCta}</button>
          {!isNeg && (
            <div className="pdetail__price">
              <PriceIcon size="md" title="Precio base" />
              <span>{priceLabel} <b>{price}</b></span>
            </div>
          )}
          <p className="pdetail__commission">{resolvedCommission}</p>
        </div>
      </div>
    </>
  );
}
