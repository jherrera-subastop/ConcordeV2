"use client";

import { useId, useState } from "react";
import type { JSX } from "react";

export type SidebarIconType = "today" | "service-center" | "business" | "category" | "offer";

export interface SidebarIconProps {
  type: SidebarIconType;
  size?: number;
  /** Controlled state — omit to use built-in hover/active tracking */
  state?: "default" | "hover" | "active";
}

const STYLE_ID = "concorde-sbicon-styles";
const STYLES = `.sb-icon-wrap { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; user-select: none; }`;

let _injected = false;

export default function SidebarIcon({ type, size = 24, state: controlled }: SidebarIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  if (typeof document !== "undefined" && !_injected) {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
    _injected = true;
  }

  const resolved = controlled ?? (pressed ? "active" : hovered ? "hover" : "default");
  const isActive = resolved === "active";
  const isHover  = resolved === "hover";

  // fill / stroke value — active → white, otherwise → gradient url
  const paint = isActive ? "white" : `url(#${uid}g)`;

  const handlers = controlled ? {} : {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => { setHovered(false); setPressed(false); },
    onMouseDown:  () => setPressed(true),
    onMouseUp:    () => setPressed(false),
  };

  return (
    <>
      <style id={`${STYLE_ID}-ssr`} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: STYLES }} />
      <span className="sb-icon-wrap" style={{ width: size, height: size }} {...handlers}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">

          {/* Gradient defs — not rendered when active (white) */}
          {!isActive && (
            <defs>
              {isHover ? (
                /* Hover: orange vertical */
                <linearGradient id={`${uid}g`} x1="12" y1="1" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF9639"/>
                  <stop offset="0.4" stopColor="#EF852E"/>
                  <stop offset="1" stopColor="#BE3D00"/>
                </linearGradient>
              ) : (
                /* Default: purple diagonal */
                <linearGradient id={`${uid}g`} x1="5.58549" y1="-11.674" x2="29.3422" y2="-4.95314" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#CFBAFF"/>
                  <stop offset="0.35" stopColor="white"/>
                  <stop offset="0.65" stopColor="#AE8EFF"/>
                  <stop offset="1" stopColor="#CFBAFF"/>
                </linearGradient>
              )}
            </defs>
          )}

          {/* ── Today (calendar) ── */}
          {type === "today" && (
            <path
              d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM11 13V17H6V13H11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"
              fill={paint}
            />
          )}

          {/* ── Service Center (chat bubble + ?) ── */}
          {type === "service-center" && (
            <path
              d="M11.9 17C12.25 17 12.5458 16.8792 12.7875 16.6375C13.0292 16.3958 13.15 16.1 13.15 15.75C13.15 15.4 13.0292 15.1042 12.7875 14.8625C12.5458 14.6208 12.25 14.5 11.9 14.5C11.55 14.5 11.2542 14.6208 11.0125 14.8625C10.7708 15.1042 10.65 15.4 10.65 15.75C10.65 16.1 10.7708 16.3958 11.0125 16.6375C11.2542 16.8792 11.55 17 11.9 17ZM11 13.15H12.85C12.85 12.8667 12.8625 12.625 12.8875 12.425C12.9125 12.225 12.9667 12.0333 13.05 11.85C13.1333 11.6667 13.2375 11.4958 13.3625 11.3375C13.4875 11.1792 13.6667 10.9833 13.9 10.75C14.4833 10.1667 14.8958 9.67917 15.1375 9.2875C15.3792 8.89583 15.5 8.45 15.5 7.95C15.5 7.06667 15.2 6.35417 14.6 5.8125C14 5.27083 13.1917 5 12.175 5C11.2583 5 10.4792 5.225 9.8375 5.675C9.19583 6.125 8.75 6.75 8.5 7.55L10.15 8.2C10.2667 7.75 10.5 7.3875 10.85 7.1125C11.2 6.8375 11.6083 6.7 12.075 6.7C12.525 6.7 12.9 6.82083 13.2 7.0625C13.5 7.30417 13.65 7.625 13.65 8.025C13.65 8.30833 13.5583 8.60833 13.375 8.925C13.1917 9.24167 12.8833 9.59167 12.45 9.975C12.1667 10.2083 11.9375 10.4375 11.7625 10.6625C11.5875 10.8875 11.4417 11.125 11.325 11.375C11.2083 11.625 11.125 11.8875 11.075 12.1625C11.025 12.4375 11 12.7667 11 13.15ZM12 23L9 20H5C4.45 20 3.97917 19.8042 3.5875 19.4125C3.19583 19.0208 3 18.55 3 18V4C3 3.45 3.19583 2.97917 3.5875 2.5875C3.97917 2.19583 4.45 2 5 2H19C19.55 2 20.0208 2.19583 20.4125 2.5875C20.8042 2.97917 21 3.45 21 4V18C21 18.55 20.8042 19.0208 20.4125 19.4125C20.0208 19.8042 19.55 20 19 20H15L12 23ZM5 18H9.8L12 20.2L14.2 18H19V4H5V18Z"
              fill={paint}
            />
          )}

          {/* ── Business (building — stroke-only icon) ── */}
          {type === "business" && (
            <path
              d="M3.91406 21H20.4141M4.66406 3H19.6641M5.41406 3V21M18.9141 3V21M9.16406 6.75H10.6641M9.16406 9.75H10.6641M9.16406 12.75H10.6641M13.6641 6.75H15.1641M13.6641 9.75H15.1641M13.6641 12.75H15.1641M9.16406 21V17.625C9.16406 17.004 9.66806 16.5 10.2891 16.5H14.0391C14.6601 16.5 15.1641 17.004 15.1641 17.625V21"
              stroke={paint}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* ── Category (2×2 grid) ── */}
          {type === "category" && (
            <path
              d="M9.52344 3.75H5.02344C4.62561 3.75 4.24408 3.90804 3.96278 4.18934C3.68147 4.47064 3.52344 4.85218 3.52344 5.25V9.75C3.52344 10.1478 3.68147 10.5294 3.96278 10.8107C4.24408 11.092 4.62561 11.25 5.02344 11.25H9.52344C9.92126 11.25 10.3028 11.092 10.5841 10.8107C10.8654 10.5294 11.0234 10.1478 11.0234 9.75V5.25C11.0234 4.85218 10.8654 4.47064 10.5841 4.18934C10.3028 3.90804 9.92126 3.75 9.52344 3.75ZM9.52344 9.75H5.02344V5.25H9.52344V9.75ZM18.5234 3.75H14.0234C13.6256 3.75 13.2441 3.90804 12.9628 4.18934C12.6815 4.47064 12.5234 4.85218 12.5234 5.25V9.75C12.5234 10.1478 12.6815 10.5294 12.9628 10.8107C13.2441 11.092 13.6256 11.25 14.0234 11.25H18.5234C18.9213 11.25 19.3028 11.092 19.5841 10.8107C19.8654 10.5294 20.0234 10.1478 20.0234 9.75V5.25C20.0234 4.85218 19.8654 4.47064 19.5841 4.18934C19.3028 3.90804 18.9213 3.75 18.5234 3.75ZM18.5234 9.75H14.0234V5.25H18.5234V9.75ZM9.52344 12.75H5.02344C4.62561 12.75 4.24408 12.908 3.96278 13.1893C3.68147 13.4706 3.52344 13.8522 3.52344 14.25V18.75C3.52344 19.1478 3.68147 19.5294 3.96278 19.8107C4.24408 20.092 4.62561 20.25 5.02344 20.25H9.52344C9.92126 20.25 10.3028 20.092 10.5841 19.8107C10.8654 19.5294 11.0234 19.1478 11.0234 18.75V14.25C11.0234 13.8522 10.8654 13.4706 10.5841 13.1893C10.3028 12.908 9.92126 12.75 9.52344 12.75ZM9.52344 18.75H5.02344V14.25H9.52344V18.75ZM18.5234 12.75H14.0234C13.6256 12.75 13.2441 12.908 12.9628 13.1893C12.6815 13.4706 12.5234 13.8522 12.5234 14.25V18.75C12.5234 19.1478 12.6815 19.5294 12.9628 19.8107C13.2441 20.092 13.6256 20.25 14.0234 20.25H18.5234C18.9213 20.25 19.3028 20.092 19.5841 19.8107C19.8654 19.5294 20.0234 19.1478 20.0234 18.75V14.25C20.0234 13.8522 19.8654 13.4706 19.5841 13.1893C19.3028 12.908 18.9213 12.75 18.5234 12.75ZM18.5234 18.75H14.0234V14.25H18.5234V18.75Z"
              fill={paint}
            />
          )}

          {/* ── Offer (hand + bid sheets) ── */}
          {type === "offer" && (
            <path
              d="M15.3867 4H9.38672V11H15.3867V4ZM20.3867 4H17.3867V11H20.3867V4ZM14.7617 13H8.38672V19H13.9367C14.2867 19 14.6242 18.9417 14.9492 18.825C15.2742 18.7083 15.5701 18.5333 15.8367 18.3L19.9867 14.875C19.8534 14.7417 19.7034 14.6417 19.5367 14.575C19.3701 14.5083 19.1951 14.4583 19.0117 14.425C18.7284 14.375 18.4534 14.3833 18.1867 14.45C17.9201 14.5167 17.6701 14.6417 17.4367 14.825L14.7367 17H10.3867V15H14.0367L15.1367 14.1C15.2201 14.05 15.2826 13.9833 15.3242 13.9C15.3659 13.8167 15.3867 13.725 15.3867 13.625C15.3867 13.4583 15.3242 13.3125 15.1992 13.1875C15.0742 13.0625 14.9284 13 14.7617 13ZM6.38672 13H4.38672V20H6.38672V13ZM7.38672 13V4C7.38672 3.45 7.58255 2.97917 7.97422 2.5875C8.36589 2.19583 8.83672 2 9.38672 2H20.3867C20.9367 2 21.4076 2.19583 21.7992 2.5875C22.1909 2.97917 22.3867 3.45 22.3867 4V11C22.3867 11.55 22.1909 12.0208 21.7992 12.4125C21.4076 12.8042 20.9367 13 20.3867 13H7.38672ZM6.38672 22H4.38672C3.83672 22 3.36589 21.8042 2.97422 21.4125C2.58255 21.0208 2.38672 20.55 2.38672 20V13C2.38672 12.45 2.58255 11.9792 2.97422 11.5875C3.36589 11.1958 3.83672 11 4.38672 11H14.7617C16.1784 11 17.5451 11.2417 18.8617 11.725C20.1784 12.2083 21.2367 13.025 22.0367 14.175L22.7117 15.2L17.1367 19.85C16.6867 20.2333 16.1867 20.5208 15.6367 20.7125C15.0867 20.9042 14.5201 21 13.9367 21H8.11172C7.92839 21.3 7.68672 21.5417 7.38672 21.725C7.08672 21.9083 6.75339 22 6.38672 22Z"
              fill={paint}
            />
          )}

        </svg>
      </span>
    </>
  );
}
