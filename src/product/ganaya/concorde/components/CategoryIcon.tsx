"use client";

import { useId, useState } from "react";
import type { JSX } from "react";

export interface CategoryIconProps {
  size?: number;
  /** Controlled visual state — omit to let the icon track its own hover/active */
  state?: "default" | "hover" | "active";
  title?: string;
  className?: string;
}

export default function CategoryIcon({ size = 24, state: controlled, title, className = "" }: CategoryIconProps): JSX.Element {
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
            <linearGradient id={`${uid}g`} x1="6.48147" y1="-6.70602" x2="26.0807" y2="-1.16134" gradientUnits="userSpaceOnUse">
              <stop stopColor="#CFBAFF"/>
              <stop offset="0.35" stopColor="white"/>
              <stop offset="0.65" stopColor="#AE8EFF"/>
              <stop offset="1" stopColor="#CFBAFF"/>
            </linearGradient>
          )}
        </defs>
      )}

      <path
        d="M9.52344 3.75H5.02344C4.62561 3.75 4.24408 3.90804 3.96278 4.18934C3.68147 4.47064 3.52344 4.85218 3.52344 5.25V9.75C3.52344 10.1478 3.68147 10.5294 3.96278 10.8107C4.24408 11.092 4.62561 11.25 5.02344 11.25H9.52344C9.92126 11.25 10.3028 11.092 10.5841 10.8107C10.8654 10.5294 11.0234 10.1478 11.0234 9.75V5.25C11.0234 4.85218 10.8654 4.47064 10.5841 4.18934C10.3028 3.90804 9.92126 3.75 9.52344 3.75ZM9.52344 9.75H5.02344V5.25H9.52344V9.75ZM18.5234 3.75H14.0234C13.6256 3.75 13.2441 3.90804 12.9628 4.18934C12.6815 4.47064 12.5234 4.85218 12.5234 5.25V9.75C12.5234 10.1478 12.6815 10.5294 12.9628 10.8107C13.2441 11.092 13.6256 11.25 14.0234 11.25H18.5234C18.9213 11.25 19.3028 11.092 19.5841 10.8107C19.8654 10.5294 20.0234 10.1478 20.0234 9.75V5.25C20.0234 4.85218 19.8654 4.47064 19.5841 4.18934C19.3028 3.90804 18.9213 3.75 18.5234 3.75ZM18.5234 9.75H14.0234V5.25H18.5234V9.75ZM9.52344 12.75H5.02344C4.62561 12.75 4.24408 12.908 3.96278 13.1893C3.68147 13.4706 3.52344 13.8522 3.52344 14.25V18.75C3.52344 19.1478 3.68147 19.5294 3.96278 19.8107C4.24408 20.092 4.62561 20.25 5.02344 20.25H9.52344C9.92126 20.25 10.3028 20.092 10.5841 19.8107C10.8654 19.5294 11.0234 19.1478 11.0234 18.75V14.25C11.0234 13.8522 10.8654 13.4706 10.5841 13.1893C10.3028 12.908 9.92126 12.75 9.52344 12.75ZM9.52344 18.75H5.02344V14.25H9.52344V18.75ZM18.5234 12.75H14.0234C13.6256 12.75 13.2441 12.908 12.9628 13.1893C12.6815 13.4706 12.5234 13.8522 12.5234 14.25V18.75C12.5234 19.1478 12.6815 19.5294 12.9628 19.8107C13.2441 20.092 13.6256 20.25 14.0234 20.25H18.5234C18.9213 20.25 19.3028 20.092 19.5841 19.8107C19.8654 19.5294 20.0234 19.1478 20.0234 18.75V14.25C20.0234 13.8522 19.8654 13.4706 19.5841 13.1893C19.3028 12.908 18.9213 12.75 18.5234 12.75ZM18.5234 18.75H14.0234V14.25H18.5234V18.75Z"
        fill={paint}
      />
    </svg>
  );
}
