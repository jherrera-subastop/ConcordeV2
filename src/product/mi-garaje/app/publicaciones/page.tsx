import type { Metadata } from "next";
import Publicaciones from "./Publicaciones";

export const metadata: Metadata = {
  title: "Mis publicaciones · Mi Garaje",
  description: "Propuesta: widget de Mis publicaciones y recorrido de una publicación, más claros.",
};

export default function Page() {
  return <Publicaciones />;
}
