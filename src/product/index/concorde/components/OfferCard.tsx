"use client";

/**
 * OfferCard â€” Generado por Concorde
 * Fuente: https://voyager-ds.vercel.app/preview/components/button-primary
 * Generado: 2026-05-28
 * EDITAR LIBREMENTE despuÃ©s de generar
 *
 * Variantes: live (orange bar, pprice+price+like) Â·
 *            negotiable (teal bar, solo like)
 */

import { useState, useCallback, useId } from "react";
import type { JSX } from "react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OfferCardVariant = "live" | "negotiable";

export interface OfferCardProps {
  /** Variante â€” determina barra inferior y fila de precio */
  variant: OfferCardVariant;
  /** TamaÃ±o. "short" = card compacta 134Ã—170 (solo imagen + tÃ­tulo/aÃ±o + barra,
   *  con el precio y el like como overlays sobre la imagen). Default "full". */
  size?: "full" | "short";
  /** Nombre del vehÃ­culo */
  name: string;
  /** AÃ±o */
  year: string | number;
  /**
   * Precio formateado ("US$ 9,999").
   * Si no se pasa, la fila de precio no se renderiza.
   * En negotiable solo aparece el like.
   */
  price?: string;
  /** URL imagen */
  imageSrc?: string;
  /** Alt text de imagen */
  imageAlt?: string;
  /** Badge de estado (pill BadgeStatus) â€” renderizado en img-badge slot */
  badge?: JSX.Element;
  /** Estado like controlado */
  liked?: boolean;
  /** Callback al alternar like */
  onLikeChange?: (liked: boolean) => void;
  /** Click en la card */
  onClick?: () => void;
  /** Aria label */
  "aria-label"?: string;
  /** Si false: showcase estático, sin hover/press. Default true */
  interactive?: boolean;
  /** Sombra elevada de Figma (X0 Y0 · Blur16 · Spread4 · #000000 10%). Default false */
  elevated?: boolean;
  className?: string;
}

// â”€â”€â”€ Self-contained CSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STYLE_ID = "concorde-offercard-styles";

const OFFERCARD_STYLES = `
@keyframes offercard-heart-pop {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.4); }
  65%  { transform: scale(0.85); }
  85%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
@keyframes offercard-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* â”€â”€ Card base â€” ancho y alto fijo, igual en ambas variantes â”€â”€ */
.pcard {
  width: 170px;
  height: 232px;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 8px;
  box-shadow:
    rgba(0, 0, 0, 0.07) 0px 0px 16px 4px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition:
    transform 150ms cubic-bezier(0.3, 0, 0, 1),
    box-shadow 150ms cubic-bezier(0.3, 0, 0, 1);
  cursor: pointer;
}

.pcard:hover:not(.pcard--disabled):not(.pcard--skeleton) {
  transform: translateY(-3px);
  box-shadow: oklch(0.22 0.18 285 / 0.12) 0px 12px 20px;
}

/* â”€â”€ Image â”€â”€ */
.pcard__img {
  width: 100%;
  height: 112px;
  background: oklch(0.93 0.006 220);
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pcard__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pcard__img-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

/* â”€â”€ Body â”€â”€ */
.pcard__body {
  display: flex;
  flex-direction: column;
  padding: 12px;
  height: 112px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.pcard__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pcard__name {
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif);
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
  color: #4c1ebc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.pcard__year {
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #191c1c;
  margin: 0;
}

/* Price row â€” pprice + price text + like */
.pcard__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  flex-shrink: 0;
}

.pcard__price-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pcard__price-text {
  font-family: var(--vmc-font-mono, 'Roboto Mono', monospace);
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  color: #4c1ebc;
  white-space: nowrap;
}

/* Like row â€” solo like (negotiable) */
.pcard__like-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
  flex-shrink: 0;
}

/* â”€â”€ Variants â€” bottom bars â”€â”€ */
.pcard--live {
  position: relative;
}
.pcard--live::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #ff9639 0%, #ef852e 50%, #be3d00 100%);
  border-radius: 0 0 var(--vmc-radius-sm, 4px) var(--vmc-radius-sm, 4px);
}

.pcard--negotiable {
  position: relative;
}
.pcard--negotiable::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #00edee 0%, #00d2d3 50%, #009597 100%);
  border-radius: 0 0 var(--vmc-radius-sm, 4px) var(--vmc-radius-sm, 4px);
}


/* â”€â”€ Price gem (auction diamond, paths exactos de Figma) â”€â”€ */
.pcard-pprice {
  width: 30px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* â”€â”€ Mini like button (self-contained) â”€â”€ */
.pcard-like {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  border: 1.44px solid transparent;
  background-image:
    linear-gradient(#ffffff, #ffffff),
    linear-gradient(135deg, #e8ddff 0%, #ffffff 40%, #cfbaff 75%, #ae8eff 100%);
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  cursor: pointer;
  padding: 2px;
  position: relative;
  overflow: hidden;
  box-shadow: rgba(132, 96, 229, 0.14) 0px 2px 8px;
  transition:
    transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.2s;
  flex-shrink: 0;
  outline: none;
}
/* Glass highlight (white 0.55 → transparent) */
.pcard-like::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(rgba(255, 255, 255, 0.55) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}
.pcard-like svg { position: relative; z-index: 2; }
.pcard-like:hover {
  transform: scale(1.1) translateY(-1px);
  box-shadow: rgba(32, 0, 104, 0.2) 0px 6px 14px;
}
.pcard-like:active { transform: scale(0.92); }
.pcard-like--active {
  background-image:
    linear-gradient(135deg, #8460e5 0%, #3b1782 100%),
    linear-gradient(135deg, #fbc47d 0%, #fbc47d 100%);
  box-shadow: rgba(132, 96, 229, 0.35) 0px 2px 8px, inset 0px 1px 0px rgba(255,255,255,0.22);
}
.pcard-like--pop svg {
  animation: offercard-heart-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 1;
}
.pcard-like:focus-visible {
  outline: 2px solid oklch(0.62 0.20 285);
  outline-offset: 2px;
}

/* â”€â”€ Sombra elevada â€” token "card" de Figma (X0 Y0 Â· Blur16 Â· Spread4 Â· #000000 10%) â”€â”€ */
.pcard--elevated { box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 16px 4px; }
.pcard--static.pcard--elevated:hover { box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 16px 4px; }

/* â”€â”€ Static showcase (sin hover/press) â”€â”€ */
.pcard--static, .pcard--static .pcard-like { transition: none; cursor: default; }
.pcard--static:hover { transform: none; box-shadow: rgba(0, 0, 0, 0.07) 0px 0px 16px 4px; }
.pcard--static .pcard-like { pointer-events: none; }
.pcard--static .pcard-like:hover { transform: none; box-shadow: rgba(132, 96, 229, 0.14) 0px 2px 8px; }
.pcard--static .pcard-like:active { transform: none; }

/* â”€â”€ Short variant (134Ã—170) â€” imagen 134Ã—112 + tÃ­tulo/aÃ±o 134Ã—50 + barra 134Ã—8.
   Precio (99Ã—24) y like (24Ã—24) van como overlays SOBRE la imagen. â”€â”€ */
.pcard--short { width: 134px; height: 170px; }
.pcard--short .pcard__img { height: 112px; }
.pcard__body--short {
  height: 50px;
  box-sizing: border-box;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
}
.pcard--short .pcard__name { font-size: 15px; line-height: 18px; }
.pcard--short .pcard__year { font-size: 10px; line-height: 14px; }

/* Precio como badge (99Ã—24) â€” arriba a la izquierda de la imagen */
.pcard__price-badge {
  position: absolute;
  top: 8px;
  left: 7px;
  height: 24px;
  box-sizing: border-box;
  padding: 0 10px 0 3px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid transparent;
  background-image:
    linear-gradient(135deg, #8460e5 0%, #3b1782 100%),
    linear-gradient(135deg, #8776ff 0%, rgba(255,255,255,0.4) 38%, #532bc7 68%, #8776ff 100%);
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
  box-shadow: rgba(32, 0, 104, 0.5) 0px 2px 6px;
  z-index: 2;
}
.pcard__price-badge::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  pointer-events: none;
}
.pcard__price-badge-gem { width: 20px; height: 22px; display: inline-flex; position: relative; z-index: 1; flex-shrink: 0; }
.pcard__price-badge-text {
  position: relative;
  z-index: 1;
  font-family: var(--vmc-font-mono, 'Roboto Mono', monospace);
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* Like (24Ã—24) â€” abajo a la derecha de la imagen */
.pcard__img-like { position: absolute; bottom: 8px; right: 9px; z-index: 2; }
.pcard--short .pcard__img-like .pcard-like { width: 22px; height: 22px; }
.pcard--short .pcard__img-like .pcard-like svg { width: 12px; height: 12px; }

/* â”€â”€ Reduced motion â”€â”€ */
@media (prefers-reduced-motion: reduce) {
  .pcard, .pcard-like { transition: none; }
  .pcard-like--pop svg { animation: none; }
}
`;

const HEART_PATH  = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

let _stylesInjected = false;

// â”€â”€â”€ Which variants show price row vs like row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SHOW_PRICE: Record<OfferCardVariant, boolean> = {
  live:       true,   // pprice + price + like
  negotiable: false,  // solo like
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function OfferCard({
  variant,
  size = "full",
  name,
  year,
  price,
  imageSrc,
  imageAlt,
  badge,
  liked: controlledLiked,
  onLikeChange,
  onClick,
  "aria-label": ariaLabel,
  interactive = true,
  elevated = false,
  className = "",
}: OfferCardProps): JSX.Element {
  if (typeof document !== "undefined" && !_stylesInjected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = OFFERCARD_STYLES;
      document.head.appendChild(el);
    }
    _stylesInjected = true;
  }

  const uid = useId().replace(/:/g, "-");

  const isControlled = controlledLiked !== undefined;
  const [internalLiked, setInternalLiked] = useState(false);
  const isLiked = isControlled ? controlledLiked : internalLiked;
  const [popping, setPopping] = useState(false);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isLiked;
    if (!isControlled) setInternalLiked(next);
    onLikeChange?.(next);
    if (next) {
      setPopping(true);
      setTimeout(() => { setPopping(false); }, 420);
    }
  }, [isLiked, isControlled, onLikeChange]);

  const showPriceRow = SHOW_PRICE[variant] && (price != null);
  const showLikeRow  = !showPriceRow;

  const cardClasses = [
    "pcard",
    `pcard--${variant}`,
    size === "short" ? "pcard--short" : "",
    interactive ? "" : "pcard--static",
    elevated ? "pcard--elevated" : "",
    className,
  ].filter(Boolean).join(" ");

  const likeClasses = [
    "pcard-like",
    isLiked ? "pcard-like--active" : "",
    popping ? "pcard-like--pop"    : "",
  ].filter(Boolean).join(" ");

  const svgFill   = isLiked ? "rgba(255,255,255,0.92)" : "#ffffff";
  const svgStroke = isLiked ? "none" : "#5a35c2";

  const LikeBtn = (
    <button
      type="button"
      className={likeClasses}
      onClick={handleLike}
      aria-label={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isLiked}
    >
      <svg
        width="15" height="15"
        viewBox="0 0 24 24"
        fill={svgFill}
        stroke={svgStroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={HEART_PATH} />
      </svg>
    </button>
  );

  // Gema del precio (diamante de subasta) â€” reutilizada en la fila (full) y en el badge (short)
  const PriceGem = ({ w, h }: { w: number; h: number }): JSX.Element => (
    <svg width={w} height={h} viewBox="30 199 28 30" fill="none" aria-hidden="true">
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

  // â”€â”€ Short variant: imagen con precio + like overlay, luego tÃ­tulo/aÃ±o, barra por ::after â”€â”€
  if (size === "short") {
    return (
      <>
        <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: OFFERCARD_STYLES }} />
        <article
          className={cardClasses}
          onClick={onClick}
          aria-label={ariaLabel ?? name}
          role={onClick ? "button" : undefined}
          tabIndex={onClick ? 0 : undefined}
        >
          <div className="pcard__img">
            {imageSrc && <img src={imageSrc} alt={imageAlt ?? name} loading="lazy" />}
            {showPriceRow && (
              <div className="pcard__price-badge">
                <span className="pcard__price-badge-gem"><PriceGem w={20} h={22} /></span>
                <span className="pcard__price-badge-text">{price}</span>
              </div>
            )}
            <div className="pcard__img-like">{LikeBtn}</div>
          </div>
          <div className="pcard__body--short">
            <h3 className="pcard__name">{name}</h3>
            <p className="pcard__year">{String(year)}</p>
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      <style
        id={`${STYLE_ID}-ssr`}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: OFFERCARD_STYLES }}
      />
      <article
        className={cardClasses}
        onClick={onClick}
        aria-label={ariaLabel ?? name}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={function handleKey(e) {
          if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
        }}
      >
        {/* Image */}
        <div className="pcard__img">
          {imageSrc && (
            <img src={imageSrc} alt={imageAlt ?? name} loading="lazy" />
          )}
          {badge && (
            <div className="pcard__img-badge">{badge}</div>
          )}
        </div>

        {/* Body */}
        <div className="pcard__body">
          <div className="pcard__meta">
            <h3 className="pcard__name">{name}</h3>
            <p className="pcard__year">{String(year)}</p>
          </div>

          {/* Price row â€” live / proxima / when price provided */}
          {showPriceRow && (
            <div className="pcard__price-row">
              <div className="pcard__price-left">
                <div className="pcard-pprice" aria-hidden="true">
                  <PriceGem w={30} h={32} />
                </div>
                <span className="pcard__price-text">{price}</span>
              </div>
              {LikeBtn}
            </div>
          )}

          {/* Like row â€” negotiable / expired (no price shown) */}
          {showLikeRow && (
            <div className="pcard__like-row">
              {LikeBtn}
            </div>
          )}
        </div>
      </article>
    </>
  );
}
