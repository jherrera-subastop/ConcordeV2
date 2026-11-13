import GanaYaApp from "@/src/product/ganaya/ganaya/GanaYaApp";
import { notFound, redirect } from "next/navigation";
const retired=["ingreso","habilitacion","confirmar","procesando","resultado","garaje","negociacion","cobrando","habilitado"];
export default async function Page({params,searchParams}:{params:Promise<{screen?:string[]}>;searchParams:Promise<{volver?:string;}>}) {
 const p=await params;const query=await searchParams;const screen=p.screen?.[0]??"listado";
 if(retired.includes(screen))redirect("/producto/ganaya/detalle");
 if((p.screen?.length??0)>1||!["listado","detalle","negociable","revision","confirmacion","propuesta-abraham","propuesta-abraham-juntos","propuesta-abraham-minima"].includes(screen))notFound();
 return <GanaYaApp screen={screen} returnFocus={query.volver==="ganaya"}/>;
}
