"use client";

import { useId, useState } from "react";
import type { JSX } from "react";

export interface BusinessIconProps {
  size?: number;
  /** Controlled visual state — omit to let the icon track its own hover/active */
  state?: "default" | "hover" | "active";
  title?: string;
  className?: string;
}

export default function BusinessIcon({ size = 24, state: controlled, title, className = "" }: BusinessIconProps): JSX.Element {
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
            <linearGradient id={`${uid}g`} x1="6.87209" y1="-8.40656" x2="26.7061" y2="-3.26306" gradientUnits="userSpaceOnUse">
              <stop stopColor="#CFBAFF"/>
              <stop offset="0.35" stopColor="white"/>
              <stop offset="0.65" stopColor="#AE8EFF"/>
              <stop offset="1" stopColor="#CFBAFF"/>
            </linearGradient>
          )}
        </defs>
      )}

      {/* Building — stroke-based icon */}
      <path
        d="M3.91406 21H20.4141M4.66406 3H19.6641M5.41406 3V21M18.9141 3V21M9.16406 6.75H10.6641M9.16406 9.75H10.6641M9.16406 12.75H10.6641M13.6641 6.75H15.1641M13.6641 9.75H15.1641M13.6641 12.75H15.1641M9.16406 21V17.625C9.16406 17.004 9.66806 16.5 10.2891 16.5H14.0391C14.6601 16.5 15.1641 17.004 15.1641 17.625V21"
        stroke={paint}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
