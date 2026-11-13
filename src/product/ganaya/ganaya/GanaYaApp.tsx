"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Sidebar, SidebarMobile, SidebarMenuButton } from "./ui";
import { primaryItems, secondaryItems, destination } from "./navigation";
import Detalle from "@/src/product/ganaya/ganaya-reference/Detalle";
import DetailCard from "@/src/product/ganaya/ganaya-reference/DetailCard";
import { LotRow } from "@/src/product/ganaya/app/components/lib/LotGallery";
import shell from "@/src/product/ganaya/app/qa/home-index-rebase/HomeIndexRebase.module.css";
import styles from "./GanaYa.module.css";
import GanaYaBanner from "./GanaYaBanner";
import GanaYaIcon from "./GanaYaIcon";
import { ConfirmationDialog } from "./GanaYaPurchase";
import { GANAYA_FEE_HABILITACION_SC, balanceOf, useWallet } from "./wallet";
import PropuestaAbraham from "./PropuestaAbraham";
import OfferCard from "@/src/product/ganaya/ganaya-concorde/components/OfferCard";
import GanaYaFlowSwitcher from "@/src/product/ganaya/mi-garaje/models/GanaYaFlowSwitcher";
import { ProposalDialog } from "@/src/product/ganaya/mi-garaje/models/Propuesta";

const offer={name:"Nissan Sentra",year:2020,plate:"BQZ-418",seller:"Autoland",price:"US$ 15,000",base:"US$ 5,999"};
// Comisión mostrada en la confirmación local; no implica una regla contable.
const commission="0 Subascoins";
const photos=[1,2,3].map(n=>"/producto-assets/ganaya/ganaya-photos/sentra/"+n+".jpg");
const conditions=[
 {label:"Con Precio Reserva"},
 {label:"Sin Opción a Visitas",tone:"outline" as const},
 {label:"Sin Comisión",tone:"outline" as const},
 {label:"Cuota mínima de 2 participantes"},
 {label:"Sin Opción a Financiamiento",tone:"outline" as const},
];
// Segunda oferta del catálogo: Negociable. Su DetailCard copia la ficha de VMC-Laptop (mi-garaje-lab, models/Propuesta.tsx).
// Con botón Ganá Ya en el DetailCard (ver ganaYaLayout) que abre el mismo modal de confirmación.
const negOffer={name:"Suzuki Swift",year:2022,plate:"BXK-207",seller:"Autoland",price:"US$ 9,500"};
const negPhotos=[1,2,3,4].map(n=>"/producto-assets/ganaya/ganaya-photos/swift/"+n+".jpg");
// El catálogo Negociable conserva la OfferCard compacta original de Concorde.
// Todas las entradas se presentan como propuestas negociables; no se mezcla En Vivo.
const catalogProposals=[
 {name:"Suzuki Swift",year:2022,image:negPhotos[0]},
 {name:"Toyota Corolla",year:2019,image:"/producto-assets/ganaya/ganaya-photos/corolla/1.jpg"},
 {name:"Mazda 3",year:2020,image:"/producto-assets/ganaya/ganaya-photos/mazda3/1.jpg"},
];
const negRelated=[
 {title:"Toyota Corolla 2019",image:"/producto-assets/ganaya/ganaya-photos/corolla/1.jpg",tone:"live" as const,price:"US$ 14,200"},
 {title:"Mazda 3 2020",image:"/producto-assets/ganaya/ganaya-photos/mazda3/1.jpg",tone:"live" as const,price:"US$ 13,500"},
 {title:"Nissan Sentra 2020",image:"/producto-assets/ganaya/ganaya-photos/sentra/1.jpg",tone:"live" as const,price:"US$ 15,000"},
];
const related=[
 {title:"Toyota Corolla 2019",image:"/producto-assets/ganaya/ganaya-photos/corolla/1.jpg",tone:"live" as const,price:"US$ 14,200"},
 {title:"Mazda 3 2020",image:"/producto-assets/ganaya/ganaya-photos/mazda3/1.jpg",tone:"live" as const,price:"US$ 13,500"},
 {title:"Suzuki Swift 2022",image:"/producto-assets/ganaya/ganaya-photos/swift/1.jpg",tone:"negotiable" as const},
];

function GanaYaCatalogBadge(){
 return <span className={styles.ganaYaBadge}><GanaYaIcon size={13} variant="rayo" paint="brand"/><span>Gana Ya</span></span>;
}

export default function GanaYaApp({screen,returnFocus=false}:{screen:string;returnFocus?:boolean}) {
 const router=useRouter();
 const [mobile,setMobile]=useState<boolean|null>(null);
 // El shell local siempre muestra la navegación completa; no permite colapsarla.
 const collapsed=false;
 const [menuOpen,setMenuOpen]=useState(false);
 const [height,setHeight]=useState(900);
 const [liked,setLiked]=useState(false);
 const wallet=useWallet();
 const [negDialog,setNegDialog]=useState(false); // Ganá Ya del Swift (Negociable): el modal se abre sobre su ficha
 const [proposalDialog,setProposalDialog]=useState(false); // «Vamos a negociar» abre la propuesta Negociable de Mi Garaje.
 const propuesta=screen.startsWith("propuesta-abraham"); // /ganaya/propuesta-abraham y sus variantes -juntos y -minima
 const negotiableFlow=screen==="negociable"||screen==="confirmacion";
 const [propDialog,setPropDialog]=useState(false); // Gana Ya de /ganaya/propuesta-abraham: el modal se abre sobre su ficha
 useEffect(()=>{
  const resize=()=>{setMobile(window.innerWidth<1024);setHeight(Math.max(720,window.innerHeight));};
  resize();window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize);
 },[]);
 useEffect(()=>{
  if(screen==="detalle"&&mobile!==null&&returnFocus){
   document.querySelector<HTMLButtonElement>("[data-ganaya-button]")?.focus({preventScroll:true});
  }
 },[screen,mobile,returnFocus]);
 const go=(path:string)=>{setMenuOpen(false);router.push(path);};
 const nav=(id:string)=>{const path=destination(id);if(path==="/producto/ganaya")go(path);else window.location.assign(path);};
 const openNegotiable=()=>go("/producto/ganaya/negociable");
 const closeConfirmation=()=>{if(propDialog){setPropDialog(false);return;}if(negDialog){setNegDialog(false);return;}router.replace("/producto/ganaya/negociable?volver=ganaya");};
 // Fin del modal del comprador: no hay estados intermedios de cobro, habilitación ni SubasChat automático.
 const confirmPurchase=()=>{const swift=negDialog||screen==="confirmacion";setNegDialog(false);setPropDialog(false);window.location.assign("/producto/ganaya-garaje?ganaya="+(swift?"swift":"sentra")+"&rol=comprador");};
 const body=<main className={styles.page} aria-label={screen==="listado"?"Catálogo Gana Ya":"Ficha de oferta Gana Ya"} data-testid="ganaya-main" data-screen={screen}>
  {screen==="listado"?<section className={styles.catalog}>
   <GanaYaBanner count={catalogProposals.length}/>
   <section className={styles.dateGroup} aria-labelledby="ganaya-date">
   <div className={styles.dateLine}><h2 id="ganaya-date">Lun. 30 nov.</h2><span>{catalogProposals.length} ofertas <strong>Inicia 10:04 am</strong></span></div>
   <div className={styles.catalogGrid}>
    {catalogProposals.map(proposal=><div key={proposal.name} className={styles.offerTile}>
     <OfferCard variant="negotiable" name={proposal.name} year={proposal.year} imageSrc={proposal.image}
      imageAlt={proposal.name+" "+proposal.year} badge={<GanaYaCatalogBadge/>} elevated
      aria-label={"Ver propuesta de "+proposal.name+" "+proposal.year+". Gana Ya disponible."} onClick={openNegotiable}/>
     </div>)}
   </div>
   </section>
  </section>:screen==="revision"?<section className={styles.catalog}>
   <header className={styles.catalogTitle}><h1>Continuación por validar</h1></header>
   <p>Esta acción de participación pertenece al flujo de subasta. La nueva referencia de Bruce permite recorrer Gana Ya desde su botón en la ficha.</p>
   <p>Los pasos genéricos de la primera versión siguen retirados. No se realiza ningún cobro ni compra real.</p>
   <a href="/producto/ganaya/detalle">Volver a la ficha</a>
  </section>:negotiableFlow?<div className={styles.detailHost}>
   <Detalle className={styles.detail} variant="negotiable" safetyPlacement="teaser" offer={{
    title:negOffer.name+" "+negOffer.year,subtitle:"Placa "+negOffer.plate,images:negPhotos,onBack:()=>go("/producto/ganaya"),visits:false,
    detailSlot:<DetailCard className={styles.negotiableDetail} variant="negotiable" miniBanner={{src:"/producto-assets/ganaya/banners/publica/mini-publica@2x.png",alt:"¿Vendes tu auto? Recibe propuestas y tú eliges.",href:"/producto/ganaya/negociable"}}
     title={"Este vendedor recibe propuestas\nde compra. Aprovecha esta oportunidad\ne inicia una negociación."} ctaLabel="¡Vamos a negociar!" day="VIERNES 30" time="6:00 pm" views={128} likes={liked?24:23} participants={2}
     liked={liked} onLikeChange={setLiked} onParticipate={()=>setProposalDialog(true)}
     ganaYa={{price:negOffer.price,onClick:()=>setNegDialog(true)}} ganaYaLayout="sin-banner"/>,
    relatedContent:<div className={styles.related}>{negRelated.map(item=><LotRow key={item.title} item={item}/>)}</div>,
   }}/>
  </div>:<div className={styles.detailHost}>
   <Detalle className={styles.detail} variant="live" safetyPlacement="none" offer={{
    title:offer.name+" "+offer.year,subtitle:"Vendedor: "+offer.seller,images:photos,onBack:()=>go("/producto/ganaya"),visits:false,conditionPills:conditions,
    detailSlot:propuesta?<PropuestaAbraham variante={screen==="propuesta-abraham-juntos"?"juntos":screen==="propuesta-abraham-minima"?"minima":"separado"} estado="disponible" price={offer.price} base={offer.base} fee={GANAYA_FEE_HABILITACION_SC} start="lun. 30 nov., 10:04 am"
     liked={liked} onLikeChange={setLiked} onGanaYa={()=>setPropDialog(true)} onParticipate={()=>go("/producto/ganaya/revision")}/>:<DetailCard variant="live" startLabel="Inicia" day="LUNES 30" time="10:04 am" views={617} likes={liked?12:11} participants={2}
     liked={liked} onLikeChange={setLiked} bannerText="" title="¡Oportunidad para el que sabe!" ctaLabel="Participa" price={offer.base} commission="Sin comisión"
     onParticipate={()=>go("/producto/ganaya/revision")}/>,
    information:<div className={styles.information}><dl className={styles.specs}>
     <div><dt>Vehículo</dt><dd>{offer.name} {offer.year}</dd></div><div><dt>Placa</dt><dd>{offer.plate}</dd></div>
     <div><dt>Transmisión</dt><dd>Automática</dd></div><div><dt>Combustible</dt><dd>Gasolina</dd></div><div><dt>Ubicación</dt><dd>Lima</dd></div>
    </dl></div>,
    relatedContent:<div className={styles.related}>{related.map(item=><LotRow key={item.title} item={item}/>)}</div>,
   }}/>
  </div>}
  <ConfirmationDialog open={screen==="confirmacion"||negDialog||propDialog} price={negotiableFlow||negDialog?negOffer.price:offer.price}
   commission={commission} fee={GANAYA_FEE_HABILITACION_SC} balance={balanceOf(wallet)} onConfirm={confirmPurchase} onClose={closeConfirmation}/>
  <ProposalDialog open={proposalDialog} offer={{name:negOffer.name,year:negOffer.year}} onCancel={()=>setProposalDialog(false)} onDone={()=>setProposalDialog(false)}/>
  <GanaYaFlowSwitcher role="comprador"/>
 </main>;
 const logo=<img className={shell.brandLogo} src="/producto-assets/ganaya/assets/brand/logo-voyager.svg" alt="VMC Subastas"/>;
 if(mobile===null)return null;
 return mobile?<div className={shell.mobileShell}><SidebarMobile open={menuOpen} onOpenChange={setMenuOpen} logo={logo} primaryItems={primaryItems} secondaryItems={secondaryItems} defaultActiveId="ganaya" onItemClick={nav} closeOnItemClick>
  <Header width="100%" compact logo={<div className={shell.mobileBrand}><SidebarMenuButton onClick={()=>setMenuOpen(true)} expanded={menuOpen}/><img className={shell.mobileLogo} src="/producto-assets/ganaya/assets/brand/logo-voyager.svg" alt="VMC Subastas"/></div>}/>{body}
 </SidebarMobile></div>:<div className={shell.desktopShell} data-collapsed={collapsed||undefined}>
  <Header width="100%"/><aside className={shell.sidebarRail} aria-label="Navegación de VMC"><Sidebar primaryItems={primaryItems} secondaryItems={secondaryItems} defaultActiveId="ganaya" height={height} contentHeight={height} headerHeight={64} logo={logo} collapsed={collapsed} onCollapsedChange={() => undefined} onItemClick={nav}/></aside>
  <div className={shell.mainColumn}>{body}</div>
 </div>;
}
