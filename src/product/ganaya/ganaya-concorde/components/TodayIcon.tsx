"use client";

import { useId, useState } from "react";
import type { JSX } from "react";

export interface TodayIconProps {
  size?: number;
  /** Controlled visual state — omit to let the icon track its own hover/active */
  state?: "default" | "hover" | "active";
  title?: string;
  className?: string;
}

export default function TodayIcon({ size = 24, state: controlled, title, className = "" }: TodayIconProps): JSX.Element {
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
            <linearGradient id={`${uid}g`} x1="5.58549" y1="-11.674" x2="29.3422" y2="-4.95314" gradientUnits="userSpaceOnUse">
              <stop stopColor="#CFBAFF"/>
              <stop offset="0.35" stopColor="white"/>
              <stop offset="0.65" stopColor="#AE8EFF"/>
              <stop offset="1" stopColor="#CFBAFF"/>
            </linearGradient>
          )}
        </defs>
      )}

      <path
        d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM11 13V17H6V13H11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"
        fill={paint}
      />
    </svg>
  );
}
