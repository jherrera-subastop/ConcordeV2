"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { JSX, ReactNode } from "react";

/** Dock del lab (27/10): una columna por lado donde los paneles se apilan y se reparten el alto, sin encimarse. */
function dockCol(side: "left" | "right"): HTMLElement {
  let d = document.getElementById("lab-dock");
  if (!d) { d = document.createElement("div"); d.id = "lab-dock"; d.className = "lab-dock"; d.innerHTML = '<div class="lab-dock__col lab-dock__col--left"></div><div class="lab-dock__col lab-dock__col--right"></div>'; document.body.append(d); }
  return d.querySelector<HTMLElement>(`.lab-dock__col--${side}`)!;
}

/** Panel flotante del lab (22/10, Abraham): solo minimizar y expandir, sin cerrar. Recuerda el estado (preferencia del visor,
 *  no crítica). Lo usan Banners, Simular al vendedor y Foco al llegar. `actions` va en la barra, antes de minimizar;
 *  `pill` es el texto de la píldora minimizada; `mobileClosed` arranca minimizado en pantallas ≤ 600 px; `closed` arranca
 *  siempre minimizado (no recuerda que lo dejaste abierto). `defaultOpen` ignora una
 *  preferencia guardada al cargar: sirve para el control principal de una demo. `side` lo manda al dock de ese lado
 *  (sin `side` queda donde lo ponga su CSS, p. ej. dentro de un diálogo).
 *  04/11: los paneles del dock (con `side`) arrancan minimizados, aunque tengan `defaultOpen`; solo se abren solos si el visor
 *  los dejó abiertos (se recuerda con una clave nueva, para no heredar lo guardado antes). */
/** Ganá Ya (12/11, Aarón): en esta copia de Mi Garaje no se muestran los paneles de revisión del lab. */
export function LabPanel(props: { title: string; store: string; className: string; actions?: ReactNode; pill?: string; mobileClosed?: boolean; closed?: boolean; defaultOpen?: boolean; side?: "left" | "right"; children: ReactNode }): JSX.Element | null {
  void props;
  return null;
}
export function LabPanelOriginal({ title, store, className, actions, pill, mobileClosed, closed, defaultOpen, side, children }: { title: string; store: string; className: string; actions?: ReactNode; pill?: string; mobileClosed?: boolean; closed?: boolean; defaultOpen?: boolean; side?: "left" | "right"; children: ReactNode }): JSX.Element | null {
  const [open, setOpen] = useState(side ? false : defaultOpen || !closed);
  const key = side ? `${store}:dock` : store;
  const [col, setCol] = useState<HTMLElement | null>(null);
  useEffect(() => { if (side) setCol(dockCol(side)); }, [side]);
  useEffect(() => {
    // En móvil el dock arranca solo con píldoras: cinco paneles abiertos no caben en 60vh.
    if (side && matchMedia("(max-width:600px)").matches) { setOpen(false); return; }
    if (side) { try { setOpen(localStorage.getItem(key) === "1"); } catch {} return; }
    if (closed || defaultOpen) return; try { if (localStorage.getItem(store) === "0" || (mobileClosed && matchMedia("(max-width:600px)").matches)) setOpen(false); } catch {} }, [store, key, mobileClosed, closed, defaultOpen, side]);
  const toggle = () => { setOpen(!open); try { localStorage.setItem(key, open ? "0" : "1"); } catch {} };
  // Minimizado, la píldora entera lo vuelve a abrir.
  const node = !open ? <div className={`f-sw ${className} f-sw--closed`}><button type="button" className="f-sw__pill" aria-expanded={false} onClick={toggle}>{pill ?? title}
    <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><rect x="4" y="4" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></button></div>
    : <div className={`f-sw ${className}`}>
      <div className="f-sw__bar"><b>{title}</b>{actions}
        <button type="button" className="f-sw__win" aria-label="Minimizar panel" aria-expanded onClick={toggle}><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d="M4 15h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button></div>
      {children}
    </div>;
  if (!side) return node;
  return col ? createPortal(node, col) : null;
}
