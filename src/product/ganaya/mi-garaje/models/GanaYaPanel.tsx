"use client";

/**
 * Ganá Ya en Mi Garaje (12/11, Aarón). Contenido de la vista rápida (QuickView) para la fila de Ganá Ya en Mis negociaciones · Compras.
 * Abre directamente el SubasChat del acuerdo ya expandido, con el aviso
 * «¡Felicidades, activaste Ganá Ya!» al inicio de la conversación. Sin backend.
 */
import type { JSX } from "react";
import SubasChat from "./SubasChat";
import type { ChatRole } from "./chat";
import "./ganaya-panel.css";

const usd = (n: number) => `US$ ${n.toLocaleString("en-US")}`;

export default function GanaYaPanel({ name, year, amount, role }: { name: string; year: number; amount: number; role: ChatRole }): JSX.Element {
  const seller = role === "vendedor";
  return <div className="np np--chat gy-qv">
    <SubasChat role={role} mode="vacio" amount={usd(amount)} dealLabel="¡Gana Ya Activado!" poke={0} noteHidden={false} onHideNote={() => {}}
      system={seller
        ? <span><b>¡Gana Ya activado!</b> Un comprador activó Ganá Ya para tu {name} {year} por {usd(amount)}. Coordina aquí directamente con el comprador los siguientes pasos.</span>
        : <span><b>¡Felicidades, activaste Gana Ya!</b> Ganaste la oportunidad de compra del {name} {year} por {usd(amount)}. Coordina aquí directamente con el vendedor los siguientes pasos.</span>} />
  </div>;
}
