"use client";

import { Header, Sidebar, SidebarMenuButton, SidebarMobile } from "@/src/product/index/adapter";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { JSX } from "react";

import DevicePreview from "./DevicePreview";
import HomeIndexBlock from "./HomeIndexBlock";
import VmcAhora from "./VmcAhora";
import styles from "./HomeIndexRebase.module.css";

// Barra inferior del modo Feed (como Instagram): solo íconos; el activo va relleno.
const HomeIcon = ({ on }: { on: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
    <path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6h-5.6v6H5A1.5 1.5 0 0 1 3.5 19z" />
  </svg>
);
const FeedIcon = ({ on }: { on: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill={on ? "currentColor" : "none"} />
    <path d="M7.5 9h9M7.5 12.5h9M7.5 16h5" stroke={on ? "#fff" : "currentColor"} />
  </svg>
);

type MobileFeedView = "card" | "more" | "tabs" | "slot" | "ticker";
const isMobileFeedView = (v: unknown): v is MobileFeedView => ["card", "more", "tabs", "slot", "ticker"].includes(v as string);

// Banner lateral (200 × 264, en escritorio y en el menú del celular): piezas de VMC Laptop (publica-vmc.html en estilo estudio y max-vmc.html con el Max real).
// Regla de los banners (27/10): hero, banner de abajo y lateral nunca muestran la misma campaña (ni la de la card «Un solo pago» de Vende tu vehículo).
//   Hero = WhatsApp, Publica y Recibe ofertas · Abajo = Valoriza tu auto y Publica tu moto · Lateral = 0% comisión y Max.
// Cada carga de la página trae una pieza lateral distinta.
const SIDE_ADS = [
  { src: "/producto/index/banners/publica-vmc.html?v=06-cero&f=side264&e=personaje", title: "Publica en VMC: vende tu auto sin comisión" },
  { src: "/producto/index/banners/max-vmc.html?t=oscuro&f=side264", title: "Max, el asistente AI de VMC" },
];

// En móvil, Opción A / B también eligen la versión de VMC ahora: A = card con «Ver más», B = pestañas arriba (estilo X).
const PRESET_MVIEW: Record<string, MobileFeedView> = { a: "more", b: "tabs" };
// Móvil sin barras de scroll visibles (la página y los paneles siguen desplazándose).
const NO_SCROLLBARS = `@media (max-width: 1023px) {
  html, body, * { scrollbar-width: none; }
  html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar { display: none; width: 0; height: 0; }
}`;

function BrandLogo() {
  return <img className={styles.brandLogo} src="/producto/index/assets/brand/logo-voyager.svg" alt="VMC Subastas" />;
}

export default function HomeIndexRebase() {
  const [sidebarHeight, setSidebarHeight] = useState(900);
  const [collapsed, setCollapsed] = useState(true); // sidebar cerrado por defecto
  const [menuOpen, setMenuOpen] = useState(false);
  // Modo Feed (control de la vista mobile): barra inferior Inicio / Feed; VMC ahora sale del inicio a su pestaña.
  const [feedMode, setFeedMode] = useState(false);
  const [tab, setTab] = useState<"home" | "feed">("home");
  // Huecos del banner del sidebar (escritorio y menú del celular), donde se monta la publicidad.
  const [adSlots, setAdSlots] = useState<Element[]>([]);
  const [sideAd, setSideAd] = useState(SIDE_ADS[0]);
  useEffect(() => setSideAd(SIDE_ADS[Math.floor(Math.random() * SIDE_ADS.length)]), []); // en el efecto: sin desajuste de hidratación
  useEffect(() => { setAdSlots([...document.querySelectorAll('[data-slot="sidebar-banner"]')]); }, [menuOpen, collapsed]);
  // Variante de VMC ahora en el móvil sin modo Feed (control «VMC ahora · móvil» de la vista celular).
  const [mview, setMview] = useState<MobileFeedView>("more");
  const [liveOpen, setLiveOpen] = useState(false); // pestaña «En vivo» abierta, o feed abierto desde la franja

  useEffect(() => {
    const set = (on: boolean) => { setFeedMode(on); if (!on) setTab("home"); };
    const q = new URLSearchParams(window.location.search);
    if (q.get("feed") === "1") set(true);
    const vista = q.get("vista");
    if (isMobileFeedView(vista)) setMview(vista);
    else if (PRESET_MVIEW[q.get("opcion") ?? ""]) setMview(PRESET_MVIEW[q.get("opcion") ?? ""]);
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "hib-feed") set(!!e.data.on);
      if (e.data?.type === "hib-mview" && isMobileFeedView(e.data.view)) { setMview(e.data.view); setLiveOpen(false); }
      if (e.data?.type === "hib-preset" && PRESET_MVIEW[e.data.id]) { setMview(PRESET_MVIEW[e.data.id]); setLiveOpen(false); }
    };
    window.addEventListener("message", onMessage);
    // Dentro del teléfono de la vista mobile: avisa que ya escucha para recibir el estado de los controles.
    if (window.parent !== window) window.parent.postMessage({ type: "hib-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const goTab = (t: "home" | "feed") => { setTab(t); window.scrollTo(0, 0); };
  const xbar = !feedMode && mview === "tabs";
  const [barHidden, setBarHidden] = useState(false);
  useEffect(() => {
    if (!xbar) { setBarHidden(false); return; }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY, d = y - last;
      if (y < 64) setBarHidden(false);
      else if (d > 6) setBarHidden(true);
      else if (d < -6) setBarHidden(false);
      if (Math.abs(d) > 6) last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [xbar]);
  const openLive = (on: boolean) => { setLiveOpen(on); window.scrollTo(0, 0); };
  // `live`: false cuando la pestaña «En vivo» ya lo dice, para no repetir la etiqueta en la cabecera del feed.
  // Feed a pantalla completa estilo X. En «Pestañas arriba» sin cabecera: las pestañas ya dicen dónde estás.
  const feed = (sub: boolean, live = true, head = true) => (
    <main className={styles.feedView} data-sub={sub || undefined} aria-label="Feed de VMC ahora"><VmcAhora view="timeline" live={live} x head={head} /></main>
  );
  // Contenido del móvil según el modo: Feed (barra inferior) manda; si no, la variante elegida en los controles.
  let mobileBody: JSX.Element;
  if (feedMode) mobileBody = tab === "feed" ? feed(false) : <HomeIndexBlock hideFeed />;
  else if (mview === "tabs") {
    mobileBody = (
      <>
        {/* Pestañas de X («Para ti / Siguiendo»): texto centrado, la activa en negrita con su línea redondeada del ancho del texto. */}
        <nav className={styles.toptabs} aria-label="Inicio o VMC ahora">
          <button type="button" aria-current={!liveOpen ? "page" : undefined} onClick={() => openLive(false)}><span>Inicio</span></button>
          <button type="button" aria-current={liveOpen ? "page" : undefined} onClick={() => openLive(true)}><span><i aria-hidden />En vivo</span></button>
        </nav>
        {liveOpen
          ? <main className={styles.feedPage} aria-label="Feed de VMC ahora"><VmcAhora view="timeline" live={false} x head={false} page /></main>
          : <HomeIndexBlock hideFeed />}
      </>
    );
  } else if (mview === "ticker") {
    mobileBody = liveOpen ? (
      <>
        <div className={styles.backbar}>
          <button type="button" onClick={() => openLive(false)}>
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M12.5 5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Inicio
          </button>
        </div>
        {feed(true)}
      </>
    ) : <HomeIndexBlock hideFeed onOpenFeed={() => openLive(true)} />;
  } else mobileBody = mview === "slot" ? <HomeIndexBlock feedSlot /> : mview === "more" ? <HomeIndexBlock feedMore /> : <HomeIndexBlock />;

  useEffect(() => {
    const resize = () => setSidebarHeight(Math.max(720, window.innerHeight));
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <>
      <div className={styles.desktopShell} data-testid="home-desktop-canvas" data-collapsed={collapsed || undefined}>
        <Header width="100%" />
        <aside className={styles.sidebarRail} aria-label="Navegación de VMC">
          <Sidebar defaultActiveId="hoy" height={sidebarHeight} contentHeight={sidebarHeight} headerHeight={64} logo={<BrandLogo />}
            collapsed={collapsed} onCollapsedChange={setCollapsed} />
        </aside>
        <div className={styles.mainColumn}>
          <HomeIndexBlock />
        </div>
        {/* Laptop / celular (iPhone 14 Pro), sobre Opción A / B. Solo en escritorio. */}
        <DevicePreview />
      </div>

      {adSlots.map((el, i) => createPortal(
        <div className={styles.sideAd} aria-label="Publicidad"><iframe src={sideAd.src} title={sideAd.title} loading="lazy" /></div>, el, `side-ad-${i}`))}
      {/* Móvil y tablet: drawer de Concorde con hamburguesa + logo en el header y el mismo bloque en una columna. */}
      <div className={styles.mobileShell} data-feedmode={feedMode || undefined} data-xbar={xbar || undefined} data-xhide={(xbar && barHidden) || undefined}>
        <SidebarMobile open={menuOpen} onOpenChange={setMenuOpen}>
          <Header width="100%" logo={
            <div className={styles.mobileBrand}>
              <SidebarMenuButton onClick={() => setMenuOpen(true)} expanded={menuOpen} />
              <img className={styles.mobileLogo} src="/producto/index/assets/brand/logo-voyager.svg" alt="VMC Subastas" />
            </div>
          } />
          {mobileBody}
        </SidebarMobile>
        {feedMode ? (
          <nav className={styles.tabbar} aria-label="Secciones">
            <button type="button" className={styles.tab} aria-label="Inicio" aria-current={tab === "home" ? "page" : undefined} onClick={() => goTab("home")}><HomeIcon on={tab === "home"} /></button>
            <button type="button" className={styles.tab} aria-label="Feed · VMC ahora" aria-current={tab === "feed" ? "page" : undefined} onClick={() => goTab("feed")}>
              <FeedIcon on={tab === "feed"} /><i className={styles.tabLive} aria-hidden />
            </button>
          </nav>
        ) : null}
      </div>
      <style>{NO_SCROLLBARS}</style>
    </>
  );
}
