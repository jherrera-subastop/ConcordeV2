import type { ReactNode } from "react";
import HomePreviewLayout from "../qa/home-index-rebase/layout";
import "@/src/product/ganaya/ganaya-concorde/styles/tokens.css";
export const metadata={title:"Gana Ya · Prototipo VMC",robots:{index:false,follow:false}};
export default function Layout({children}:{children:ReactNode}) {return <HomePreviewLayout>{children}</HomePreviewLayout>;}
