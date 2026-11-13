import Garaje, { type GanaYaArrival } from "@/src/product/ganaya/mi-garaje/models/Garaje";
import type { GanaYaFlowRole } from "@/src/product/ganaya/mi-garaje/models/GanaYaFlowSwitcher";

// Destino de «Ir a Mi Garaje» al terminar Ganá Ya (12/11, Aarón): Mi Garaje de VMC-Laptop (maqueta VMC, 1024 px),
// con la compra de Ganá Ya llegando a Mis negociaciones · Compras y su SubasChat abierto. ?ganaya=swift|sentra.
const OFFERS: Record<string, Omit<GanaYaArrival, "fee" | "role">> = {
  swift: { name: "Suzuki Swift", year: 2022, plate: "BXK-207", photo: "swift", amount: 9500 },
  sentra: { name: "Nissan Sentra", year: 2020, plate: "BQZ-418", photo: "sentra", amount: 15000 },
};
const ALL = { summary: true, next: true, tracker: true, compact: true };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const q = await searchParams;
  const offer = OFFERS[q.ganaya ?? ""];
  const role: GanaYaFlowRole = q.rol === "vendedor" ? "vendedor" : "comprador";
  return <Garaje variant="fernando" features={ALL} sober vmc withData risk="muybajo" withNews isEmpty={false} isLoading={false}
    ganaYa={offer ? { ...offer, fee: 50, role } : undefined} />;
}
