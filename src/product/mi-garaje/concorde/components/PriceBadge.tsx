/**
 * PriceBadge — Generado por Concorde
 * Fuente: Figma VOYAGER · "BadgeStatus" (3143:13335)
 *
 * Insignia circular 20×20: fondo blanco, borde gradiente lila
 * (#E8DEFF → white → #CFBAFF → #AE8EFF), sombra morada y un ícono de
 * etiqueta con "S" (soles) en #5A35C2. Copia exacta del SVG. Tamaño
 * personalizable. useId para ids únicos.
 */

import { useId } from "react";
import type { JSX } from "react";

export interface PriceBadgeProps {
  /** Diámetro del círculo en px (default 20) */
  size?: number;
  /** Texto accesible. Si se omite, es decorativo (aria-hidden). */
  title?: string;
  className?: string;
}

const S_GLYPH =
  "M17.4625 20.2424V14.1818H17.8508V20.2424H17.4625ZM18.4924 16.1823C18.4734 15.9913 18.3921 15.8429 18.2485 15.7372C18.1049 15.6315 17.91 15.5786 17.6638 15.5786C17.4965 15.5786 17.3552 15.6023 17.24 15.6496C17.1248 15.6954 17.0364 15.7593 16.9748 15.8414C16.9149 15.9234 16.8849 16.0166 16.8849 16.1207C16.8817 16.2075 16.8999 16.2833 16.9393 16.348C16.9804 16.4127 17.0364 16.4687 17.1074 16.5161C17.1784 16.5619 17.2605 16.6021 17.3536 16.6368C17.4468 16.67 17.5462 16.6984 17.6519 16.7221L18.0875 16.8262C18.299 16.8736 18.4932 16.9367 18.6699 17.0156C18.8467 17.0945 18.9998 17.1916 19.1292 17.3068C19.2586 17.422 19.3588 17.5578 19.4299 17.714C19.5025 17.8703 19.5396 18.0494 19.5411 18.2514C19.5396 18.5481 19.4638 18.8054 19.3139 19.0232C19.1655 19.2394 18.9509 19.4075 18.6699 19.5275C18.3906 19.6458 18.0536 19.705 17.659 19.705C17.2676 19.705 16.9267 19.645 16.6363 19.5251C16.3475 19.4051 16.1218 19.2276 15.9592 18.9924C15.7982 18.7557 15.7138 18.4629 15.7059 18.1141H16.6979C16.7089 18.2767 16.7555 18.4124 16.8375 18.5213C16.9212 18.6286 17.0325 18.7099 17.1713 18.7651C17.3118 18.8188 17.4704 18.8456 17.6472 18.8456C17.8208 18.8456 17.9715 18.8204 18.0994 18.7699C18.2288 18.7194 18.329 18.6491 18.4 18.5592C18.4711 18.4692 18.5066 18.3658 18.5066 18.249C18.5066 18.1401 18.4742 18.0486 18.4095 17.9744C18.3464 17.9002 18.2533 17.8371 18.1301 17.785C18.0086 17.7329 17.8595 17.6856 17.6827 17.643L17.1548 17.5104C16.746 17.411 16.4232 17.2555 16.1865 17.044C15.9497 16.8325 15.8322 16.5477 15.8337 16.1894C15.8322 15.8958 15.9103 15.6393 16.0681 15.42C16.2275 15.2006 16.4461 15.0293 16.7239 14.9062C17.0017 14.7831 17.3173 14.7216 17.6709 14.7216C18.0307 14.7216 18.3448 14.7831 18.6131 14.9062C18.883 15.0293 19.0929 15.2006 19.2428 15.42C19.3928 15.6393 19.4701 15.8935 19.4748 16.1823H18.4924Z";

export default function PriceBadge({ size = 20, title, className = "" }: PriceBadgeProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const gid = `pricebadge-grad-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="7.5 8 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      style={{ filter: "drop-shadow(0 2px 6px rgba(34, 0, 92,0.5))", overflow: "visible" }}
    >
      {title ? <title>{title}</title> : null}
      <rect x="7.5" y="8" width="20" height="20" rx="10" fill="white" />
      <rect x="8" y="8.5" width="19" height="19" rx="9.5" fill="none" stroke={`url(#${gid})`} />
      <path
        d="M20 12H15C14.1716 12 13.5 12.7326 13.5 13.6364V22.3636C13.5 23.2674 14.1716 24 15 24H20C20.8284 24 21.5 23.2674 21.5 22.3636V13.6364C21.5 12.7326 20.8284 12 20 12Z"
        stroke="#5A35C2"
        strokeWidth="0.8"
      />
      <path d="M16 22.3636H19" stroke="#5A35C2" strokeWidth="0.8" strokeLinecap="round" />
      <path d={S_GLYPH} fill="#5A35C2" />
      <defs>
        <linearGradient id={gid} x1="7.5" y1="8" x2="27.5" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8DEFF" />
          <stop offset="0.4" stopColor="white" />
          <stop offset="0.75" stopColor="#CFBAFF" />
          <stop offset="1" stopColor="#AE8EFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
