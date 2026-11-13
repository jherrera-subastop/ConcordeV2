"use client";

import { useState, type JSX } from "react";
import styles from "./GanaYaFlowSwitcher.module.css";

export type GanaYaFlowRole = "comprador" | "vendedor";

const FLOWS: { id: GanaYaFlowRole; label: string; detail: string; href: string }[] = [
  { id: "comprador", label: "Comprador", detail: "Comienza en la ficha y activa Ganá Ya.", href: "/producto/ganaya/negociable?rol=comprador" },
  { id: "vendedor", label: "Vendedor", detail: "Recibe el aviso y entra desde En venta.", href: "/producto/ganaya-garaje?ganaya=swift&rol=vendedor" },
];

/** Control local de revisión, separado de Mi Garaje para no alterar la anatomía de la pantalla. */
export default function GanaYaFlowSwitcher({ role }: { role: GanaYaFlowRole }): JSX.Element {
  const [open, setOpen] = useState(false);
  return <aside className={styles.switcher} aria-label="Recorridos de Ganá Ya" data-open={open || undefined}>
    <button type="button" className={styles.toggle} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className={styles.bolt} aria-hidden>ϟ</span><span>Probar flujo Ganá Ya</span><span className={styles.chevron} aria-hidden>{open ? "⌄" : "⌃"}</span>
    </button>
    {open ? <div className={styles.body}>
      <div className={styles.copy}><b>Iniciar recorrido como</b><span>Elige la perspectiva para esta prueba.</span></div>
      <nav className={styles.options} aria-label="Perspectiva del flujo">
        {FLOWS.map((flow) => <a key={flow.id} href={flow.href} aria-current={flow.id === role ? "page" : undefined}>
          <b>{flow.label}</b><small>{flow.detail}</small>
        </a>)}
      </nav>
    </div> : null}
  </aside>;
}
