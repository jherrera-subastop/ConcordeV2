import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import "@/src/product/mi-garaje/globals.css";
const jakarta=Plus_Jakarta_Sans({variable:"--font-jakarta",subsets:["latin"]});
const mono=Roboto_Mono({variable:"--font-roboto-mono",subsets:["latin"],weight:["500","700"]});
export default function Layout({children}:{children:ReactNode}){return <div className={`mi-garaje-product ${jakarta.variable} ${mono.variable}`}>{children}</div>;}
