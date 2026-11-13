import {ChevronV,Sparkle} from "@/src/product/ganaya/concorde/bloques/banners/desktop/decor";
import styles from "./GanaYaBanner.module.css";

/** Responsive composition of Concorde PromoBanner/plum-counter.
 * Commercial catalog anatomy verified at vmcsubastas.com/negociable.html.
 * Reuses its pill + headline + dominant offer count; no invented live inventory. */
export default function GanaYaBanner({count}:{count:number}){
 return <header className={styles.banner} data-testid="ganaya-commercial-banner">
  <div className={styles.decor} aria-hidden="true">
   <ChevronV width={290} color="var(--vmc-color-orange-400)" strokeWidth={1} style={{right:70,top:-44,transform:"rotate(-90deg)",opacity:.16}}/>
   <Sparkle size={36} color="var(--vmc-color-orange-400)" style={{right:20,top:20,opacity:.5}}/>
   <Sparkle size={14} color="var(--vmc-color-orange-tint)" style={{right:"37%",bottom:26,opacity:.5}}/>
  </div>
  <div className={styles.copy}>
   <span className={styles.tag}><Sparkle size={13} color="currentColor" style={{position:"static"}}/> GANA YA</span>
   <h1>Gana la oportunidad <span>de compra.</span></h1>
  </div>
  <div className={styles.counter} aria-label={count+" "+(count===1?"oferta":"ofertas")+" con Gana Ya"}>
   <span>{count===1?"Oferta":"Ofertas"}</span><strong>{count}</strong>
  </div>
 </header>;
}
