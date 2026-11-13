"use client";

import {useEffect,useRef,useState} from "react";
import Button from "@/src/product/ganaya/ganaya-concorde/components/Button";
import GanaYaButton from "./GanaYaButton";
import styles from "./Comparison.module.css";

const slack=(id:string)=>"https://vmc-subastop.slack.com/archives/D092FKH508K/p"+id;
type ComparisonPair={id:string;name:string;source:string;current?:string;kind:string;sourceName:string;link:string;note:string;live?:string;width?:number;height?:number};
const pairs:ComparisonPair[]=[
 {id:"confirmacion",name:"Confirmación",source:"legacy-confirmacion.png",live:"/producto/ganaya/confirmacion",width:1153,height:1280,kind:"desktop",sourceName:"Bruce · 11 de noviembre",link:slack("1794428727254699"),note:"Modal sobre la ficha: importe, comisión de la oferta, aviso de fondos y Confirmar. La propuesta usa la tarjeta blanca, monto enmarcado, acento teal–lila y CTA integrado de Negociable; la X es la única salida. Vista local en vivo al mismo ancho que la captura."},
 {id:"comercial",name:"Catálogo comercial",source:"negociable-desktop.jpg",current:"actual-comercial.jpg",kind:"desktop",sourceName:"Referencia comercial · Negociable",link:"https://www.vmcsubastas.com/negociable.html",note:"Nueva referencia indicada por Julio: banner comercial con mensaje y contador, seguido por grupos de fecha y cards. Fragmentos superiores del catálogo. Gana Ya adapta la receta de PromoBanner de Concorde y mantiene una oferta ilustrativa, no las 22 de la página real."},
 {id:"comercial-mobile",name:"Catálogo móvil",source:"negociable-mobile.jpg",current:"actual-comercial-mobile.jpg",kind:"mobile",sourceName:"Referencia comercial · Negociable móvil",link:"https://www.vmcsubastas.com/negociable.html",note:"El banner se recompone en móvil, conserva el tag y el contador sin escalar una imagen de escritorio. El listado usa la card actual del index, por eso su densidad difiere del catálogo de producción."},
 {id:"index",name:"Inicio",source:"legacy-index.png",current:"actual-index.png",kind:"desktop",sourceName:"Antes · captura de Bruce",link:slack("1794241580690689"),note:"El inicio se conserva sobre el index actual. La incorporación es Gana Ya en la navegación; no se vuelve al home legacy."},
 {id:"catalogo",name:"Catálogo",source:"legacy-catalogo.png",current:"actual-v4-catalogo.jpg",kind:"desktop",sourceName:"Antes · captura de Bruce",link:slack("1794241588416159"),note:"La captura de Bruce conserva el contexto de fecha y oferta. La nueva indicación añade el banner comercial de la referencia Negociable y la identidad propia de Gana Ya, sin cambiar la card actual."},
 {id:"ficha",name:"Ficha desktop",source:"legacy-ficha.png",current:"actual-v4-ficha.jpg",kind:"desktop",sourceName:"Antes · captura de Bruce",link:slack("1794241602733959"),note:"Se conserva la ficha de Mi Garaje: galería e información a la izquierda, fecha y acciones a la derecha. El botón Gana Ya ahora es una variante nueva y explícitamente solicitada, distinta de Primary y Negociable."},
 {id:"mobile",name:"Ficha mobile",source:"legacy-mobile.png",current:"actual-v4-mobile.jpg",kind:"mobile",sourceName:"Antes · captura de Bruce",link:slack("1794241627610989"),note:"La galería actual incorpora miniaturas; acciones y precio base quedan más abajo que en el primer viewport legacy. La nueva acción dice oportunidad de compra, sin simular adjudicación."},
 {id:"drawer",name:"Menú mobile",source:"legacy-drawer.png",current:"actual-v3-drawer.jpg",kind:"mobile",sourceName:"Antes · captura de Bruce",link:slack("1794241627610989"),note:"Gana Ya sigue como segundo ítem. Se usa el drawer actual de Concorde, igual que en el index."},
];
function LiveComparison({pair}:{pair:ComparisonPair}){
 const container=useRef<HTMLDivElement>(null);
 const [scale,setScale]=useState(1);
 const width=pair.width!,height=pair.height!;
 useEffect(()=>{
  if(!container.current)return;
  const observer=new ResizeObserver(([entry])=>setScale(Math.min(1,entry.contentRect.width/width)));
  observer.observe(container.current);
  return()=>observer.disconnect();
 },[width]);
 return <div ref={container} className={styles.liveCanvas} style={{height:height*scale}}><iframe key={pair.id} src={pair.live} title={"Propuesta en vivo de "+pair.name} width={width} height={height} style={{transform:`scale(${scale})`}} /></div>;
}
export default function Comparison(){
 const [selected,setSelected]=useState("confirmacion");
 const pair=pairs.find(p=>p.id===selected)!;
 return <main className={styles.page}>
  <header className={styles.header}>
   <div><p className={styles.eyebrow}>Revisión visual · 11 de noviembre</p><h1>Gana Ya: referencias y propuesta</h1><p>Catálogo, botón claro, confirmación y llegada directa al SubasChat.</p></div>
   <nav><a href="/producto/ganaya">Abrir catálogo</a><a href="/producto/ganaya/detalle">Abrir ficha</a></nav>
  </header>
  <div className={styles.tabs} role="group" aria-label="Pantalla a comparar">{pairs.map(p=><Button key={p.id} variant={selected===p.id?"secondary":"outline"} aria-pressed={selected===p.id} onClick={()=>setSelected(p.id)}>{p.name}</Button>)}</div>
  <p className={styles.note}>{pair.note}</p>
  <div className={styles.pair} data-kind={pair.kind}>
   <section className={styles.panel} aria-label="Referencia original"><header><h2>{pair.sourceName}</h2><a href={pair.link} target="_blank" rel="noreferrer">Ver fuente</a></header><div className={styles.canvas}><a href={"/producto-assets/ganaya/ganaya-comparison/"+pair.source} target="_blank" rel="noreferrer"><img src={"/producto-assets/ganaya/ganaya-comparison/"+pair.source} alt={"Referencia de "+pair.name}/></a></div></section>
   <section className={styles.panel} aria-label="Propuesta actual"><header><h2>Ahora · propuesta Gana Ya</h2><a href={pair.live??"/producto-assets/ganaya/ganaya-comparison/"+pair.current} target="_blank" rel="noreferrer">{pair.live?"Abrir propuesta en vivo":"Abrir captura completa"}</a></header><div className={styles.canvas}>{pair.live?<LiveComparison pair={pair}/>:<img src={"/producto-assets/ganaya/ganaya-comparison/"+pair.current} alt={"Propuesta actual de "+pair.name}/>}</div></section>
  </div>
  <section className={styles.buttonStudy} id="boton-ganaya" aria-labelledby="ganaya-button-study">
   <h2 id="ganaya-button-study">Una acción con identidad propia</h2>
   <p>Base clara, borde multicolor naranja, violeta y turquesa, y destello de Concorde. El color se concentra en los trazos; texto y precio conservan contraste.</p>
   <div className={styles.buttonOptions}>
    <div><span>Primary actual</span><Button variant="primary">Participa</Button></div>
    <div><span>Negociable actual</span><Button variant="negotiable">Negocia ahora</Button></div>
    <div><span>Gana Ya · propuesta clara</span><GanaYaButton price="US$ 15,000"/></div>
   </div>
   <p>Botones de muestra para revisar default, hover, pressed y foco con teclado. En el catálogo Gana Ya abre la ficha; en la ficha abre la confirmación. El recorrido posterior es una demostración local sin cobros.</p>
  </section>
  <aside className={styles.caveat}>
   <h2>Qué está respaldado y qué falta</h2>
   <p>Negociable aporta la estructura comercial. La propuesta local conserva la confirmación y, después, llega directamente a Mi Garaje con el SubasChat preparado.</p>
   <p>La propuesta usa el Suzuki Swift como fixture de la oferta Negociable. No representa inventario vivo, ni ejecuta cobros, compras, cargas de DNI o mensajería real.</p>
   <p>Las capturas históricas de cobro, habilitación y documentación se conservan como fuente, pero ya no se muestran como pantallas del prototipo.</p>
   <p>Banner adaptado y botón nuevo son propuestas locales sobre tokens Concorde; no se presentan como componentes ya aprobados del registry.</p>
  </aside>
 </main>;
}
