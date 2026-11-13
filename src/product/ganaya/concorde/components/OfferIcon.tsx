"use client";

import { useId, useState } from "react";
import type { JSX } from "react";

export interface OfferIconProps {
  size?: number;
  /** Controlled visual state — omit to let the icon track its own hover/active */
  state?: "default" | "hover" | "active";
  title?: string;
  className?: string;
}

export default function OfferIcon({ size = 24, state: controlled, title, className = "" }: OfferIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const [hovered, setHovered] = useState(false);
  const [pressed,  setPressed]  = useState(false);

  const resolved = controlled ?? (pressed ? "active" : hovered ? "hover" : "default");
  const isActive = resolved === "active";
  const isHover  = resolved === "hover";
  const paint    = isActive ? "white" : `url(#${uid}g)`;

  const handlers = controlled ? {} : {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => { setHovered(false); setPressed(false); },
    onMouseDown:  () => setPressed(true),
    onMouseUp:    () => setPressed(false),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      style={{ flexShrink: 0 }}
      {...handlers}
    >
      {title && <title>{title}</title>}

      {!isActive && (
        <defs>
          {isHover ? (
            <linearGradient id={`${uid}g`} x1="12" y1="1" x2="12" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF9639"/>
              <stop offset="0.4" stopColor="#EF852E"/>
              <stop offset="1" stopColor="#BE3D00"/>
            </linearGradient>
          ) : (
            <linearGradient id={`${uid}g`} x1="6.03047" y1="-10.674" x2="30.1148" y2="-3.74975" gradientUnits="userSpaceOnUse">
              <stop stopColor="#CFBAFF"/>
              <stop offset="0.35" stopColor="white"/>
              <stop offset="0.65" stopColor="#AE8EFF"/>
              <stop offset="1" stopColor="#CFBAFF"/>
            </linearGradient>
          )}
        </defs>
      )}

      <path
        d="M15.3867 4H9.38672V11H15.3867V4ZM20.3867 4H17.3867V11H20.3867V4ZM14.7617 13H8.38672V19H13.9367C14.2867 19 14.6242 18.9417 14.9492 18.825C15.2742 18.7083 15.5701 18.5333 15.8367 18.3L19.9867 14.875C19.8534 14.7417 19.7034 14.6417 19.5367 14.575C19.3701 14.5083 19.1951 14.4583 19.0117 14.425C18.7284 14.375 18.4534 14.3833 18.1867 14.45C17.9201 14.5167 17.6701 14.6417 17.4367 14.825L14.7367 17H10.3867V15H14.0367L15.1367 14.1C15.2201 14.05 15.2826 13.9833 15.3242 13.9C15.3659 13.8167 15.3867 13.725 15.3867 13.625C15.3867 13.4583 15.3242 13.3125 15.1992 13.1875C15.0742 13.0625 14.9284 13 14.7617 13ZM6.38672 13H4.38672V20H6.38672V13ZM7.38672 13V4C7.38672 3.45 7.58255 2.97917 7.97422 2.5875C8.36589 2.19583 8.83672 2 9.38672 2H20.3867C20.9367 2 21.4076 2.19583 21.7992 2.5875C22.1909 2.97917 22.3867 3.45 22.3867 4V11C22.3867 11.55 22.1909 12.0208 21.7992 12.4125C21.4076 12.8042 20.9367 13 20.3867 13H7.38672ZM6.38672 22H4.38672C3.83672 22 3.36589 21.8042 2.97422 21.4125C2.58255 21.0208 2.38672 20.55 2.38672 20V13C2.38672 12.45 2.58255 11.9792 2.97422 11.5875C3.36589 11.1958 3.83672 11 4.38672 11H14.7617C16.1784 11 17.5451 11.2417 18.8617 11.725C20.1784 12.2083 21.2367 13.025 22.0367 14.175L22.7117 15.2L17.1367 19.85C16.6867 20.2333 16.1867 20.5208 15.6367 20.7125C15.0867 20.9042 14.5201 21 13.9367 21H8.11172C7.92839 21.3 7.68672 21.5417 7.38672 21.725C7.08672 21.9083 6.75339 22 6.38672 22Z"
        fill={paint}
      />
    </svg>
  );
}
