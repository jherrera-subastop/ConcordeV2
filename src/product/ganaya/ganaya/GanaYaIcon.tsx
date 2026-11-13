"use client";

/** Ícono propio de Ganá Ya para el sidebar (antes compartía OfferIcon con Tipo de oferta).
 *  Misma receta que los íconos del proveedor (OfferIcon, TodayIcon): un solo path relleno con el degradado lila
 *  en reposo, naranja en hover y blanco en activo. Las formas salen de Material Symbols Outlined (peso 600, el más
 *  cercano al trazo de 2 px de los íconos actuales); «Fuego + timer» es una composición local sobre la llama.
 *  La variante local se conserva para la ficha de revisión y se recuerda en este navegador. */
import { useId, useState, useSyncExternalStore } from "react";
import type { JSX } from "react";

export const GANAYA_ICONS = [
  { id: "fuego-timer", label: "Fuego + timer" },
  { id: "fuego", label: "Fuego" },
  { id: "timer", label: "Timer" },
  { id: "trofeo", label: "Trofeo" },
  { id: "rayo", label: "Rayo" },
] as const;
export type GanaYaIconId = (typeof GANAYA_ICONS)[number]["id"];

// Coordenadas de Material Symbols: viewBox 0 -960 960 960.
const PATHS: Record<GanaYaIconId, string> = {
  // Contorno de la llama + interior vacío + reloj (aro y manecillas). Se pinta con fill-rule evenodd.
  "fuego-timer":
    "M488.48-853.57V-708q0 30.68 20.91 51.1 20.92 20.42 51.56 20.42 16.35 0 30.16-6.65 13.8-6.65 24.67-20.52l21.96-27.65q79.21 45.33 124.98 123.47 45.76 78.13 45.76 167.66 0 137.41-95.58 233.03T479.96-71.52q-137.35 0-232.9-95.57-95.54-95.58-95.54-232.92 0-130.82 90.24-253.84Q332-776.87 488.48-853.57Z"
    + "M231.3-400q0 53.97 22.85 101.83t64.81 80.91Q400-145 480-145T641.04-217.26Q683-250.31 705.85-298.17Q728.7-346.03 728.7-400q0-49.48-20.74-97.3-20.74-47.83-59.78-88.57-21 13.31-43.63 20.96-22.63 7.65-44.13 7.65-59.28 0-100.13-37.83-40.85-37.82-47.07-98.56v-20q-42.04 31.3-75.65 69.04-33.61 37.74-57.35 78.41-23.74 40.68-36.61 83.35Q231.3-440.17 231.3-400Z"
    + "M480-540a175 175 0 1 1 0 350a175 175 0 1 1 0-350Z"
    + "M480-472a107 107 0 1 1 0 214a107 107 0 1 1 0-214Z"
    + "M458-445h44v58h43v44h-87Z",
  fuego:
    "M231.3-400q0 53.97 22.85 101.83t64.81 80.91q-4-9.61-6-20.2-2-10.58-2-20.89 2.82-29.17 15.1-54.35 12.29-25.17 33.59-46.47L480-478.09l120.91 118.92q21.31 21.3 33.59 46.47 12.28 25.18 14.54 54.35 0 10.31-2 20.89-2 10.59-5.43 20.2 40.82-33.05 64.24-80.91 23.41-47.86 23.41-101.83 0-49.48-20.74-97.3-20.74-47.83-59.78-88.57-21 13.31-43.63 20.96-22.63 7.65-44.13 7.65-59.28 0-100.13-37.83-40.85-37.82-47.07-98.56v-20q-42.04 31.3-75.65 69.04-33.61 37.74-57.35 78.41-23.74 40.68-36.61 83.35Q231.3-440.17 231.3-400ZM480-366.96l-64.78 64.35q-13.44 12.87-20.09 28.35-6.65 15.48-6.65 33.71 0 37.52 26.74 63.38Q441.96-151.3 480-151.3q38.04 0 64.78-25.94 26.74-25.94 26.74-63.57 0-17.76-6.65-33.34-6.65-15.59-19.41-28.36L480-366.96Zm8.48-486.61V-708q0 30.68 20.91 51.1 20.92 20.42 51.56 20.42 16.35 0 30.16-6.65 13.8-6.65 24.67-20.52l21.96-27.65q79.21 45.33 124.98 123.47 45.76 78.13 45.76 167.66 0 137.41-95.58 233.03T479.96-71.52q-137.35 0-232.9-95.57-95.54-95.58-95.54-232.92 0-130.82 90.24-253.84Q332-776.87 488.48-853.57Z",
  timer:
    "M347-860v-73h266v73H347Zm96.78 458.87h72.44v-231.13h-72.44v231.13ZM334.34-84.6q-68.01-29.6-118.89-80.33-50.89-50.72-80.23-118.68-29.35-67.97-29.35-145.44t29.35-145.51q29.34-68.05 80.25-119.06 50.9-51 118.94-80.6 68.03-29.61 145.59-29.61 68.13 0 128.54 22.5 60.42 22.5 106.98 63.07l56.09-56.09 52.17 51.61-56.08 56.09q36.56 41.13 61.78 99.26t25.22 138.26q0 77.59-29.58 145.66-29.57 68.07-80.54 118.72-50.96 50.64-119.07 80.2Q557.39-55 479.87-55q-77.53 0-145.53-29.6Zm354.77-135.61q85.8-85.42 85.8-208.82 0-123.4-85.7-209.21-85.71-85.8-209.11-85.8-123.4 0-209.21 85.7-85.8 85.71-85.8 209.11 0 123.4 85.7 208.93 85.71 85.52 209.11 85.52 123.4 0 209.21-85.43Z",
  trofeo:
    "M294.61-100.78V-180h145.78v-130.48q-54.56-12.13-96.85-47.63-42.28-35.5-60.54-87.37-84.18-2.34-143.09-60.46Q81-564.05 81-648v-44q0-33.74 23.02-56.76 23.02-23.02 56.76-23.02h104v-88h431v88h104q32.92 0 56.07 23.02T879-692v44q0 83.95-58.91 142.06-58.91 58.12-143.09 60.46-18.26 51.87-60.54 87.37-42.29 35.5-96.85 47.63V-180h145.78v79.22H294.61ZM264.78-526v-166h-104v44q0 45 29.5 78.5t74.5 43.5ZM576.5-425q39.5-40 39.5-97v-258H344v258q0 57 39.5 97t96.5 40q57 0 96.5-40Zm119.28-101q44.44-10 74.22-43.5t29.78-78.5v-44h-104v166Z",
  rayo:
    "M399.22-174.04 670.3-501.13H494.83l34.3-273.57-246.22 355.27h151.18l-34.87 245.39ZM307.56-64.17l40-280H139.09l382.04-552.22h98.65l-40 320h251.31l-426 512.22h-97.53Z",
};

// Selección compartida entre el sidebar y el selector (sin contexto: navigation.tsx sigue siendo una lista fija).
const KEY = "ganaya-icon-v2"; // v2 (12/11): nuevo valor por defecto, sin heredar elecciones anteriores
const DEFAULT_ICON: GanaYaIconId = "rayo"; // por defecto (Aarón, 12/11)
const isId = (v: unknown): v is GanaYaIconId => GANAYA_ICONS.some((i) => i.id === v);
let current: GanaYaIconId | null = null;
const listeners = new Set<() => void>();
function read(): GanaYaIconId {
  if (current) return current;
  let v: string | null = null;
  try { v = new URLSearchParams(window.location.search).get("icono") ?? window.localStorage.getItem(KEY); } catch { /* sin storage */ }
  current = isId(v) ? v : DEFAULT_ICON;
  return current;
}
export function setGanaYaIcon(id: GanaYaIconId) {
  current = id;
  try { window.localStorage.setItem(KEY, id); } catch { /* sin storage */ }
  listeners.forEach((l) => l());
}
export function useGanaYaIcon(): GanaYaIconId {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    read,
    () => DEFAULT_ICON,
  );
}

export interface GanaYaIconProps {
  size?: number;
  state?: "default" | "hover" | "active";
  /** Fija una opción; si se omite, usa la elegida en el selector. */
  variant?: GanaYaIconId;
  /** Pintura fuera del sidebar: "brand" = degradado Ganá Ya (naranja → lila → teal), "current" = currentColor,
   *  "accent" = los dos colores del estilo de botón elegido (variables --acc-a / --acc-b del modal). */
  paint?: "brand" | "current" | "accent";
  title?: string;
  className?: string;
}

export default function GanaYaIcon({ size = 24, state: controlled, variant, paint: tone, title, className = "" }: GanaYaIconProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const chosen = useGanaYaIcon();
  const icon = variant ?? chosen;
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const resolved = controlled ?? (pressed ? "active" : hovered ? "hover" : "default");
  const isActive = resolved === "active";
  const isHover = resolved === "hover";
  const paint = tone === "current" ? "currentColor" : isActive && !tone ? "white" : `url(#${uid}g)`;
  const handlers = controlled ? {} : {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => { setHovered(false); setPressed(false); },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
  };
  // Los degradados de OfferIcon, escritos en la caja de 24 y llevados a la de 960.
  const to960 = "matrix(40 0 0 40 0 -960)";
  return (
    <svg width={size} height={size} viewBox="0 -960 960 960" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true} style={{ flexShrink: 0 }} data-ganaya-icon={icon} {...handlers}>
      {title && <title>{title}</title>}
      {tone === "brand" ? (
        <defs>
          <linearGradient id={`${uid}g`} x1="3" y1="20" x2="21" y2="4" gradientUnits="userSpaceOnUse" gradientTransform={to960}>
            <stop style={{ stopColor: "var(--vmc-color-orange-700)" }} />
            <stop offset="0.5" style={{ stopColor: "var(--vmc-color-vault-500)" }} />
            <stop offset="1" style={{ stopColor: "var(--vmc-color-teal-600)" }} />
          </linearGradient>
        </defs>
      ) : tone === "accent" ? (
        <defs>
          <linearGradient id={`${uid}g`} x1="3" y1="20" x2="21" y2="4" gradientUnits="userSpaceOnUse" gradientTransform={to960}>
            <stop style={{ stopColor: "var(--acc-a, var(--vmc-color-orange-700))" }} />
            <stop offset="1" style={{ stopColor: "var(--acc-b, var(--vmc-color-teal-600))" }} />
          </linearGradient>
        </defs>
      ) : !tone && !isActive && (
        <defs>
          {isHover ? (
            <linearGradient id={`${uid}g`} x1="12" y1="1" x2="12" y2="21" gradientUnits="userSpaceOnUse" gradientTransform={to960}>
              <stop stopColor="#FF9639" />
              <stop offset="0.4" stopColor="#EF852E" />
              <stop offset="1" stopColor="#BE3D00" />
            </linearGradient>
          ) : (
            <linearGradient id={`${uid}g`} x1="6.03047" y1="-10.674" x2="30.1148" y2="-3.74975" gradientUnits="userSpaceOnUse" gradientTransform={to960}>
              <stop stopColor="#CFBAFF" />
              <stop offset="0.35" stopColor="white" />
              <stop offset="0.65" stopColor="#AE8EFF" />
              <stop offset="1" stopColor="#CFBAFF" />
            </linearGradient>
          )}
        </defs>
      )}
      <path d={PATHS[icon]} fill={paint} fillRule={icon === "fuego-timer" ? "evenodd" : undefined} />
    </svg>
  );
}
