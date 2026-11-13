"use client";
import { TodayIcon, OfferIcon, CategoryIcon, BusinessIcon, ServiceCenterIcon, type SidebarNavItem } from "./ui";
import GanaYaIcon from "./GanaYaIcon";
export const primaryItems: SidebarNavItem[] = [
 {id:"hoy",label:"Hoy",icon:s=><TodayIcon size={22} state={s}/>},
 {id:"ganaya",label:"Gana Ya",icon:s=><GanaYaIcon size={22} state={s}/>},
 {id:"oferta",label:"Tipo de oferta",icon:s=><OfferIcon size={22} state={s}/>,subitems:[{id:"en-vivo",label:"En Vivo"},{id:"negociable",label:"Recibe ofertas"}]},
 {id:"categoria",label:"Categoría",icon:s=><CategoryIcon size={22} state={s}/>},
 {id:"empresas",label:"Empresas",icon:s=><BusinessIcon size={22} state={s}/>},
];
export const secondaryItems: SidebarNavItem[] = [{id:"centro",label:"Centro de Ayuda",icon:s=><ServiceCenterIcon size={22} state={s}/>}];
export const destination=(id:string)=>id==="ganaya"?"/producto/ganaya":"/producto/index";
