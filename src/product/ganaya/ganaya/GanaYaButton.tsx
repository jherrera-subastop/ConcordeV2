"use client";

import {forwardRef,useSyncExternalStore} from "react";
import type {ButtonHTMLAttributes} from "react";
import GanaYaIcon from "./GanaYaIcon";
import styles from "./GanaYaButton.module.css";
import "./ganaya-propuesta-tokens.css";

/** New variant explicitly requested by Julio. Concorde tokens, Button geometry.
 * Local proposal, not a registry export. El emblema usa el ícono Ganá Ya elegido en el selector.
 * Estilos en revisión (12/11, Aarón): la misma receta del CTA de DetailCard con paletas que no son el teal de
 * Negociable, el lila de Primary ni el naranja de En Vivo. «Actual» es la variante clara anterior. */
export const GANAYA_BUTTON_STYLES=[
 {id:"fuego",label:"Fuego"},
 {id:"esmeralda",label:"Esmeralda"},
 {id:"magenta",label:"Magenta"},
 {id:"oro",label:"Oro"},
 {id:"tricolor",label:"Tricolor (tokens)"},
 {id:"actual",label:"Actual (claro)"},
] as const;
export type GanaYaButtonStyle=(typeof GANAYA_BUTTON_STYLES)[number]["id"];

const KEY="ganaya-button-style-v2"; // v2 (12/11): nuevo valor por defecto
const DEFAULT_STYLE:GanaYaButtonStyle="magenta"; // por defecto (Aarón, 12/11)
const isStyle=(v:unknown):v is GanaYaButtonStyle=>GANAYA_BUTTON_STYLES.some(s=>s.id===v);
let current:GanaYaButtonStyle|null=null;
const listeners=new Set<()=>void>();
function read():GanaYaButtonStyle{
 if(current)return current;
 let v:string|null=null;
 try{v=new URLSearchParams(window.location.search).get("boton")??window.localStorage.getItem(KEY);}catch{/* sin storage */}
 current=isStyle(v)?v:DEFAULT_STYLE;
 return current;
}
export function setGanaYaButtonStyle(id:GanaYaButtonStyle){
 current=id;
 try{window.localStorage.setItem(KEY,id);}catch{/* sin storage */}
 listeners.forEach(l=>l());
}
export function useGanaYaButtonStyle():GanaYaButtonStyle{
 return useSyncExternalStore(l=>{listeners.add(l);return()=>listeners.delete(l);},read,()=>DEFAULT_STYLE);
}

export interface GanaYaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {price?:string}
const GanaYaButton=forwardRef<HTMLButtonElement,GanaYaButtonProps>(function GanaYaButton(
 {price,children,className="",type="button",...props},ref
){
 const look=useGanaYaButtonStyle();
 return <button {...props} ref={ref} type={type} data-ganaya-button data-look={look} className={`${styles.button} ${styles[look]??""} ${className}`}>
  <span className={styles.animatedStroke} aria-hidden="true"/>
  <span className={styles.emblem} aria-hidden="true"><GanaYaIcon size={18} paint={look==="actual"?"brand":"current"}/></span>
  <span className={styles.label}>{children??"Gana Ya"}</span>
  {price&&<><span className={styles.separator} aria-hidden="true">·</span><span className={styles.price}>{price}</span></>}
 </button>;
});
export default GanaYaButton;
