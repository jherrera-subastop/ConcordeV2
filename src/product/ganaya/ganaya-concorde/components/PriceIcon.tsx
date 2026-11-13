"use client";

/**
 * PriceIcon — Generado por Concorde
 * Fuente: Figma VOYAGER · "PriceIcon" (Size=Small|Medium, State=Default|Expirada|Skeleton)
 * Nodos: 231:912 (md default) · 235:581 (md expirada) · 232:1204 (sm default) · 235:574 (sm expirada)
 * Sincronizado: 2026-06-12
 *
 * Gema de subasta (diamante + medallón con $). Ícono estático — sin interacción.
 * Figma manda en lo visual; aquí no hay capa de interacción.
 */

import { useId } from "react";
import type { JSX } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PriceIconSize = "sm" | "md";
export type PriceIconState = "default" | "expirada" | "skeleton";

export interface PriceIconProps {
  size?: PriceIconSize;
  state?: PriceIconState;
  className?: string;
  /** Texto accesible (default: "Precio") */
  title?: string;
}

// ─── Gema DEFAULT (con gradientes teal→vault + medallón $) ──────────────────────

function GemDefaultMd({ uid }: { uid: string }): JSX.Element {
  return (
    <svg width="36" height="38" viewBox="0 0 36 38" fill="none" aria-hidden="true">
      <g filter={`url(#${uid}-fd)`}>
        <path d="M18 21.5L30 27L18 32.5L6 27L18 21.5Z" fill={`url(#${uid}-d)`} />
        <path d="M18 21.5L30 27L18 32.5L6 27L18 21.5" stroke={`url(#${uid}-ds)`} strokeWidth="2" strokeLinejoin="round" />
        <g filter={`url(#${uid}-fm)`}>
          <g clipPath={`url(#${uid}-c0)`}>
            <rect x="8" y="7" width="20" height="20" rx="10" fill={`url(#${uid}-c)`} />
            <g clipPath={`url(#${uid}-c1)`}>
              <path d="M18 12.4165V21.5832" stroke="white" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.0833 14.0835H16.9583C16.1535 14.0835 15.5 14.737 15.5 15.5418C15.5 16.3467 16.1535 17.0002 16.9583 17.0002H19.0417C19.8465 17.0002 20.5 17.6536 20.5 18.4585C20.5 19.2634 19.8465 19.9168 19.0417 19.9168H15.5" stroke="white" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <rect x="10" y="9" width="16" height="16" rx="8" fill={`url(#${uid}-cg)`} />
          </g>
          <rect x="9" y="8" width="18" height="18" rx="9" stroke={`url(#${uid}-cb)`} strokeWidth="2" />
        </g>
      </g>
      <defs>
        <filter id={`${uid}-fd`} x="4" y="7" width="28" height="31" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="ha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
          <feBlend mode="normal" in2="bg" result="e1" />
          <feBlend mode="normal" in="SourceGraphic" in2="e1" result="shape" />
        </filter>
        <filter id={`${uid}-fm`} x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="ha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.130618 0 0 0 0 0.155494 0 0 0 0 0.666156 0 0 0 0.22 0" />
          <feBlend mode="normal" in2="bg" result="e1" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha2" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="ha2" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="e1" result="e2" />
          <feBlend mode="normal" in="SourceGraphic" in2="e2" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha3" />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="e3" />
          <feOffset dy="-1" />
          <feComposite in2="ha3" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="shape" result="e3o" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha4" />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="e4" />
          <feOffset dy="1" />
          <feComposite in2="ha4" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.52 0" />
          <feBlend mode="normal" in2="e3o" result="e4o" />
        </filter>
        <linearGradient id={`${uid}-d`} x1="6" y1="21.5" x2="29.121" y2="34.1115" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00A7A8" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#300089" />
        </linearGradient>
        <linearGradient id={`${uid}-ds`} x1="6" y1="21.5" x2="29.121" y2="34.1115" gradientUnits="userSpaceOnUse">
          <stop stopColor="#73DFDF" /><stop offset="0.0001" stopColor="#5C82DA" /><stop offset="0.283654" stopColor="white" stopOpacity="0.9" /><stop offset="0.875" stopColor="#452AA2" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${uid}-c`} x1="10.0116" y1="5.59144" x2="25.9884" y2="28.4086" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ABAD" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#31008A" />
        </linearGradient>
        <linearGradient id={`${uid}-cg`} x1="18" y1="9" x2="18" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.45" /><stop offset="0.5" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-cb`} x1="10.0116" y1="5.59144" x2="25.9884" y2="28.4086" gradientUnits="userSpaceOnUse">
          <stop stopColor="#44D6D6" /><stop offset="0.206731" stopColor="#E4EEFF" stopOpacity="0.5" /><stop offset="0.495192" stopColor="#567CD3" /><stop offset="1" stopColor="#3D0D9E" />
        </linearGradient>
        <clipPath id={`${uid}-c0`}><rect x="8" y="7" width="20" height="20" rx="10" fill="white" /></clipPath>
        <clipPath id={`${uid}-c1`}><rect width="10" height="10" fill="white" transform="translate(13 12)" /></clipPath>
      </defs>
    </svg>
  );
}

function GemDefaultSm({ uid }: { uid: string }): JSX.Element {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g clipPath={`url(#${uid}-c0)`}>
        <g filter={`url(#${uid}-fd)`}>
          <path d="M12 9.03174L19.3296 14.0497L12 19.0676L4.67041 14.0497L12 9.03174Z" fill={`url(#${uid}-d)`} />
          <path d="M12 9.03174L19.3296 14.0497L12 19.0676L4.67041 14.0497L12 9.03174" stroke={`url(#${uid}-ds)`} strokeWidth="2" strokeLinejoin="round" />
          <g filter={`url(#${uid}-fm)`}>
            <g clipPath={`url(#${uid}-c1)`}>
              <rect x="5.5" y="3" width="13" height="13" rx="6.5" fill={`url(#${uid}-c)`} />
              <path d="M12 6.18115L12 12.3735" stroke="white" strokeOpacity="0.92" strokeWidth="0.623537" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.4866 7.34766H11.2567C10.6824 7.34766 10.2161 7.7873 10.2161 8.32882C10.2161 8.87034 10.6824 9.30999 11.2567 9.30999H12.7433C13.3176 9.30999 13.7839 9.74963 13.7839 10.2911C13.7839 10.8327 13.3176 11.2723 12.7433 11.2723H10.2161" stroke="white" strokeOpacity="0.92" strokeWidth="0.570859" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="7.5" y="5" width="9" height="9" rx="4.5" fill={`url(#${uid}-cg)`} />
            </g>
            <rect x="6.5" y="4" width="11" height="11" rx="5.5" stroke={`url(#${uid}-cb)`} strokeWidth="2" />
          </g>
        </g>
      </g>
      <defs>
        <filter id={`${uid}-fd`} x="-2" y="3" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
          <feOffset dy="1" /><feGaussianBlur stdDeviation="0.5" /><feComposite in2="ha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
          <feBlend mode="normal" in2="bg" result="e1" /><feBlend mode="normal" in="SourceGraphic" in2="e1" result="shape" />
        </filter>
        <filter id={`${uid}-fm`} x="-2.5" y="-4" width="29" height="29" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
          <feOffset dy="1" /><feGaussianBlur stdDeviation="4" /><feComposite in2="ha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.130618 0 0 0 0 0.155494 0 0 0 0 0.666156 0 0 0 0.22 0" />
          <feBlend mode="normal" in2="bg" result="e1" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha2" />
          <feOffset dy="2" /><feGaussianBlur stdDeviation="2" /><feComposite in2="ha2" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="e1" result="e2" /><feBlend mode="normal" in="SourceGraphic" in2="e2" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha3" />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="e3" />
          <feOffset dy="-1" /><feComposite in2="ha3" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="shape" result="e3o" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha4" />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="e4" />
          <feOffset dy="1" /><feComposite in2="ha4" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.52 0" />
          <feBlend mode="normal" in2="e3o" result="e4o" />
        </filter>
        <linearGradient id={`${uid}-d`} x1="4.67041" y1="9.03174" x2="20.8384" y2="14.9358" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00A7A8" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#300089" />
        </linearGradient>
        <linearGradient id={`${uid}-ds`} x1="4.67041" y1="9.03174" x2="20.8384" y2="14.9358" gradientUnits="userSpaceOnUse">
          <stop stopColor="#73DFDF" /><stop offset="0.25" stopColor="white" stopOpacity="0.9" /><stop offset="0.55" stopColor="#5C82DA" /><stop offset="1" stopColor="#452AA2" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${uid}-c`} x1="6.80756" y1="2.08443" x2="17.1924" y2="16.9156" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ABAD" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#31008A" />
        </linearGradient>
        <linearGradient id={`${uid}-cg`} x1="12" y1="5" x2="12" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.45" /><stop offset="0.5" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-cb`} x1="6.80756" y1="2.08443" x2="17.1924" y2="16.9156" gradientUnits="userSpaceOnUse">
          <stop stopColor="#44D6D6" /><stop offset="0.206731" stopColor="#E4EEFF" stopOpacity="0.5" /><stop offset="0.495192" stopColor="#567CD3" /><stop offset="1" stopColor="#3D0D9E" />
        </linearGradient>
        <clipPath id={`${uid}-c0`}><rect width="24" height="24" fill="white" /></clipPath>
        <clipPath id={`${uid}-c1`}><rect x="5.5" y="3" width="13" height="13" rx="6.5" fill="white" /></clipPath>
      </defs>
    </svg>
  );
}

// ─── Gema EXPIRADA (gris #E1E3E2 + $ blanco) ────────────────────────────────────

function GemExpiradaMd({ uid }: { uid: string }): JSX.Element {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <path d="M14 15.5L26 21L14 26.5L2 21L14 15.5Z" fill="#E1E3E2" />
      <path d="M14 15.5L26 21L14 26.5L2 21L14 15.5" stroke="#E1E3E2" strokeWidth="2" strokeLinejoin="round" />
      <rect x="5" y="2" width="18" height="18" rx="9" fill="#E1E3E2" />
      <rect x="5" y="2" width="18" height="18" rx="9" stroke="#E1E3E2" strokeWidth="2" />
      <g clipPath={`url(#${uid}-c0)`}>
        <path d="M14 6.4165V15.5832" stroke="white" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.0833 8.0835H12.9583C12.1535 8.0835 11.5 8.73695 11.5 9.54183C11.5 10.3467 12.1535 11.0002 12.9583 11.0002H15.0417C15.8465 11.0002 16.5 11.6536 16.5 12.4585C16.5 13.2634 15.8465 13.9168 15.0417 13.9168H11.5" stroke="white" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id={`${uid}-c0`}><rect width="10" height="10" fill="white" transform="translate(9 6)" /></clipPath>
      </defs>
    </svg>
  );
}

function GemExpiradaSm({ uid }: { uid: string }): JSX.Element {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g clipPath={`url(#${uid}-c0)`}>
        <path d="M12 9.03223L19.3296 14.0502L12 19.0681L4.67041 14.0502L12 9.03223Z" fill="#E1E3E2" />
        <path d="M12 9.03223L19.3296 14.0502L12 19.0681L4.67041 14.0502L12 9.03223" stroke="#E1E3E2" strokeWidth="2" strokeLinejoin="round" />
        <g clipPath={`url(#${uid}-c1)`}>
          <rect x="5.5" y="3" width="13" height="13" rx="6.5" fill="#E1E3E2" />
          <path d="M12 6.18115L12 12.3735" stroke="white" strokeOpacity="0.92" strokeWidth="0.623537" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.4866 7.34766H11.2567C10.6824 7.34766 10.2161 7.7873 10.2161 8.32882C10.2161 8.87034 10.6824 9.30999 11.2567 9.30999H12.7433C13.3176 9.30999 13.7839 9.74963 13.7839 10.2911C13.7839 10.8327 13.3176 11.2723 12.7433 11.2723H10.2161" stroke="white" strokeOpacity="0.92" strokeWidth="0.570859" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <rect x="6.5" y="4" width="11" height="11" rx="5.5" stroke="#E1E3E2" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id={`${uid}-c0`}><rect width="24" height="24" fill="white" /></clipPath>
        <clipPath id={`${uid}-c1`}><rect x="5.5" y="3" width="13" height="13" rx="6.5" fill="white" /></clipPath>
      </defs>
    </svg>
  );
}

// ─── Skeleton (círculo gris) ────────────────────────────────────────────────────

function GemSkeleton({ size }: { size: PriceIconSize }): JSX.Element {
  if (size === "sm") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" fill="#E1E3E2" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="#E1E3E2" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PriceIcon({
  size = "md",
  state = "default",
  className = "",
  title = "Precio",
}: PriceIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");

  function renderGem(): JSX.Element {
    if (state === "skeleton") return <GemSkeleton size={size} />;
    if (state === "expirada") return size === "sm" ? <GemExpiradaSm uid={uid} /> : <GemExpiradaMd uid={uid} />;
    return size === "sm" ? <GemDefaultSm uid={uid} /> : <GemDefaultMd uid={uid} />;
  }

  return (
    <span
      className={["priceicon", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={title}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 0 }}
    >
      {renderGem()}
    </span>
  );
}
