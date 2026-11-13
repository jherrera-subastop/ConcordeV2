"use client";

import { useEffect, useState } from "react";
import type { JSX, ReactNode } from "react";
import Header from "@/src/product/mi-garaje/concorde/bloques/header/desktop/Header";
import Sidebar, { type SidebarNavItem } from "@/src/product/mi-garaje/concorde/bloques/sidebar/desktop/Sidebar";
import SidebarMobile, { SidebarMenuButton } from "@/src/product/mi-garaje/concorde/bloques/sidebar/mobile/SidebarMobile";
import Button from "@/src/product/mi-garaje/concorde/components/Button";
import CardTitle from "@/src/product/mi-garaje/concorde/components/CardTitle";
import OfferCard from "@/src/product/mi-garaje/concorde/components/OfferCard";
import ProfileButton from "@/src/product/mi-garaje/concorde/components/ProfileButton";
import TodayIcon from "@/src/product/mi-garaje/concorde/components/TodayIcon";
import OfferIcon from "@/src/product/mi-garaje/concorde/components/OfferIcon";
import CategoryIcon from "@/src/product/mi-garaje/concorde/components/CategoryIcon";
import BusinessIcon from "@/src/product/mi-garaje/concorde/components/BusinessIcon";
import WalletBalanceCard from "@/src/product/mi-garaje/concorde/components/WalletBalanceCard";
import ActivityCard from "@/src/product/mi-garaje/concorde/components/ActivityCard";
import Input from "@/src/product/mi-garaje/concorde/components/Input";
import TabSelector from "@/src/product/mi-garaje/concorde/components/TabSelector";
import BidMessage from "@/src/product/mi-garaje/concorde/components/BidMessage";
import BadgeStatus from "@/src/product/mi-garaje/concorde/components/BadgeStatus";

/**
 * Isolated composition for UX review. No API, live account data or business actions.
 * DS internals remain unchanged. Local CSS controls only root sizing and layout.
 * Vehicle photos/names are local VMC reference assets, not the user's inventory.
 * Example statuses and wallet amounts come from Fernando's supplied mockups.
 */
const PRIMARY: SidebarNavItem[] = [
  { id: "garaje", label: "Mi Garaje", icon: (state) => <TodayIcon size={22} state={state} /> },
  { id: "hoy", label: "Hoy", icon: (state) => <TodayIcon size={22} state={state} /> },
  { id: "oferta", label: "Tipo de oferta", icon: (state) => <OfferIcon size={22} state={state} />,
    subitems: [{ id: "en-vivo", label: "En Vivo" }, { id: "negociable", label: "Negociable" }] },
  { id: "categoria", label: "Categoría", icon: (state) => <CategoryIcon size={22} state={state} /> },
  { id: "empresas", label: "Empresas", icon: (state) => <BusinessIcon size={22} state={state} /> },
  { id: "vende", label: "Vende tu auto", icon: (state) => <OfferIcon size={22} state={state} /> },
];

const PHOTOS = {
  corolla: { name: "Toyota Corolla", imageSrc: "/producto-assets/mi-garaje/garage-reference/toyota-corolla.jpeg" },
  etios: { name: "Toyota Etios", imageSrc: "/producto-assets/mi-garaje/garage-reference/toyota-etios.jpeg" },
};

function Brand(): JSX.Element {
  return <img src="/producto-assets/mi-garaje/garage-reference/logo-vmc.svg" alt="VMC Subastas" width={90} height={38} />;
}

function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }): JSX.Element {
  return <div className="garage-review__heading">
    <CardTitle title={title} subtitle={subtitle ?? ""} titleSize={22} subtitleSize={14} />
    {action ? <div className="garage-review__link">{action}</div> : null}
  </div>;
}

function ReferenceVehicle({ photo, state, description, action }: {
  photo: keyof typeof PHOTOS; state: string; description?: string; action?: string;
}): JSX.Element {
  const vehicle = PHOTOS[photo];
  return <div className="garage-review__vehicle">
    <OfferCard {...vehicle} year="Foto de referencia" variant="negotiable" size="full"
      imageAlt={`${vehicle.name}, fotografía de referencia de VMC`}
      className="garage-review__offer" interactive={false} liked={false} />
    <div className="garage-review__vehicle-context">
      <p><strong>{state}</strong></p>
      {description ? <p>{description}</p> : null}
      {action ? <ProfileButton>{action}</ProfileButton> : null}
    </div>
  </div>;
}

function FrameContent({ navigate }: { navigate: (view: View) => void }): JSX.Element {
  const [participation, setParticipation] = useState(1);
  return <main id="mi-garaje" className="garage-review__content">
    <div className="garage-review__intro">
      <CardTitle title="Mi Garaje" subtitle="Tus vehículos y procesos, en un solo lugar." titleSize={34} subtitleSize={16} />
      <nav className="garage-review__utilities" aria-label="Cuenta e historial">
        <ProfileButton>Mi perfil</ProfileButton>
        <ProfileButton>Historial</ProfileButton>
      </nav>
    </div>

    <div className="garage-review__overview">
      <section className="garage-review__start" aria-label="Publicar o valorizar">
        <CardTitle title="Publica o valoriza" subtitle="Elige cómo continuar con tu vehículo." titleSize={22} subtitleSize={15} />
        <div className="garage-review__primary-actions">
          <Button variant="primary">Publicar</Button>
          <Button variant="secondary-sm" onClick={() => navigate("valorizar")}>Valorizar</Button>
        </div>
        <ProfileButton onClick={() => navigate("mis-valorizaciones")}>Mis valorizaciones</ProfileButton>
      </section>

      <div id="wallet"><WalletBalanceCard title="Mi Wallet" subasCoins=">S< 1,250" saldo="US$ 320.00" className="garage-review__wallet-card" /></div>
    </div>

    <div className="garage-review__work">
      <section id="publicaciones" className="garage-review__section" aria-label="Mis publicaciones">
        <SectionHeading title="Mis publicaciones" subtitle="2 publicaciones de ejemplo" action={<ProfileButton>Ver todas</ProfileButton>} />
        <div className="garage-review__vehicles">
          <ReferenceVehicle photo="corolla" state="Publicada" action="Ver publicación" />
          <ReferenceVehicle photo="etios" state="En revisión" action="Ver publicación" />
        </div>
      </section>

      <section id="participaciones" className="garage-review__section" aria-label="Mis participaciones">
        <SectionHeading title="Mis participaciones" subtitle="Actividad de procesos · ejemplo" />
        <div className="garage-review__participation-tabs"><TabSelector options={["En vivo · 1", "Mis negociaciones · 2"]} value={participation} onChange={setParticipation} aria-label="Tipo de participación" /></div>
        {participation === 1 ? <div className="garage-review__negotiations" role="tabpanel" aria-label="Mis negociaciones">
          <div><BidMessage side="received" type="vault">Nueva propuesta recibida</BidMessage></div>
          <div className="garage-review__negotiation-row">
            <div><strong>Toyota Corolla</strong><p>Propuesta recibida · vence hoy</p></div>
            <Button variant="secondary-sm">Responder</Button>
          </div>
          <div className="garage-review__negotiation-row">
            <div><strong>Toyota Etios</strong><p>Contraoferta enviada</p><p>Esperando respuesta</p></div>
            <ProfileButton>Ver negociación</ProfileButton>
          </div>
          <small>Propuesta visual de llegada y estado de una negociación.</small>
        </div> : <div className="garage-review__negotiations" role="tabpanel" aria-label="En vivo">
          <div><BadgeStatus variant="live" /></div>
          <p>1 participación en vivo de ejemplo.</p>
          <p>La Sala en Vivo se abre como pantalla aparte.</p>
          <div><ProfileButton>Ir a la Sala en Vivo</ProfileButton></div>
        </div>}
      </section>
    </div>

    <div className="garage-review__continuity">
      <section id="compras" className="garage-review__section" aria-label="Mis compras">
        <SectionHeading title="Mis compras" subtitle="Tus procesos de compra" />
        <p>Consulta el estado de tus compras y continúa cada proceso.</p>
        <div className="garage-review__section-links">
          <ProfileButton>Ver mis compras</ProfileButton>
          <ProfileButton>Historial de compras</ProfileButton>
        </div>
      </section>
      <section aria-label="Tu actividad actual"><ActivityCard title="Tu actividad" won="—" consignments="—" purchases="—" rejected="—" className="garage-review__activity-card" /></section>
    </div>

    <footer className="garage-review__note"><small>Vista de ejemplo para revisión. Fotografías de referencia VMC y estados ilustrativos del mockup; no representan tu cuenta.</small></footer>
  </main>;
}

type View = "mi-garaje" | "valorizar" | "resultado-avt" | "mis-valorizaciones" | "detalle-avt";
const VIEWS: View[] = ["mi-garaje", "valorizar", "resultado-avt", "mis-valorizaciones", "detalle-avt"];

function AvtFrames({ view, saved, navigate, save }: { view: View; saved: boolean; navigate: (view: View) => void; save: () => void }): JSX.Element {
  const titles: Record<View,string> = { "mi-garaje":"Mi Garaje", valorizar:"Valorizar", "resultado-avt":"Resultado AVT", "mis-valorizaciones":"Mis valorizaciones", "detalle-avt":"Detalle AVT" };
  const back: View = view === "detalle-avt" ? "mis-valorizaciones" : "mi-garaje";
  return <main className="garage-review__content garage-review__avt">
    <div className="garage-review__intro">
      <CardTitle title={titles[view]} subtitle={view === "detalle-avt" ? "Valorización guardada" : "Consulta y guarda el valor de tu vehículo"} titleSize={30} subtitleSize={16} />
      <ProfileButton onClick={() => navigate(back)}>{back === "mi-garaje" ? "Volver a Mi Garaje" : "Mis valorizaciones"}</ProfileButton>
    </div>
    {view === "valorizar" ? <div className="garage-review__avt-grid">
      <form className="garage-review__avt-form" onSubmit={(event) => { event.preventDefault(); navigate("resultado-avt"); }}>
        <SectionHeading title="Datos del vehículo" />
        <label className="garage-review__field">Vehículo<Input defaultValue="Toyota Corolla" readOnly aria-label="Vehículo de referencia" className="garage-review__input" /></label>
        <p>Información requerida por AVT</p>
        <Input placeholder="Datos por confirmar con AVT" readOnly aria-label="Campos requeridos por AVT, pendientes de validar" className="garage-review__input" />
        <div><Button variant="primary" type="submit">Ver resultado de ejemplo</Button></div>
      </form>
      <div className="garage-review__avt-description">
        <CardTitle title="Un resultado para consultar" subtitle="Guarda tu valorización en Mi Garaje." titleSize={22} subtitleSize={16} />
        <p>La valorización te permite revisar una referencia de valor para tu vehículo.</p>
      </div>
    </div> : view === "mis-valorizaciones" ? <section className="garage-review__section">
      <SectionHeading title="Valorizaciones guardadas" subtitle={saved ? "1 resultado en esta sesión de revisión" : "Vista de ejemplo del listado"} action={<ProfileButton onClick={() => navigate("valorizar")}>Valorizar</ProfileButton>} />
      <div className="garage-review__saved-row">
        <CardTitle title="Toyota Corolla" subtitle="Valorización AVT · ejemplo" titleSize={22} subtitleSize={14} />
        <div><p>Valor referencial</p><strong>US$ —</strong></div>
        <ProfileButton onClick={() => navigate("detalle-avt")}>Ver Detalle AVT</ProfileButton>
      </div>
    </section> : <div className="garage-review__avt-grid">
      <section className="garage-review__section">
        <CardTitle title="Toyota Corolla" subtitle={view === "detalle-avt" ? "Resultado guardado en Mis valorizaciones" : "Resultado de ejemplo"} titleSize={26} subtitleSize={16} />
        <dl className="garage-review__avt-data"><div><dt>Valor referencial</dt><dd><strong>US$ —</strong></dd></div><div><dt>Fecha de valorización</dt><dd>—</dd></div></dl>
        <p>La referencia y la fecha se mostrarán con el resultado de AVT.</p>
        {view === "resultado-avt" ? <div className="garage-review__primary-actions"><Button variant="primary" onClick={save}>Guardar</Button><ProfileButton onClick={() => navigate("valorizar")}>Volver a Valorizar</ProfileButton></div> : <div className="garage-review__section-links"><ProfileButton onClick={() => navigate("mis-valorizaciones")}>Volver a mis valorizaciones</ProfileButton></div>}
      </section>
      <section className="garage-review__section">
        <SectionHeading title="Datos de la valorización" />
        <dl className="garage-review__avt-data"><div><dt>Vehículo</dt><dd>Toyota Corolla</dd></div><div><dt>Información enviada a AVT</dt><dd>Campos pendientes de confirmar</dd></div></dl>
      </section>
    </div>}
    <footer className="garage-review__note"><small>Frame de revisión Stage 1. Importes, fecha y campos AVT quedan sin completar para no inventar una valorización. Guardar solo cambia el estado de esta vista local.</small></footer>
  </main>;
}

export default function FrameMiGarajeReview(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [view, setView] = useState<View>("mi-garaje");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => { const hash = window.location.hash.slice(1) as View; setView(VIEWS.includes(hash) ? hash : "mi-garaje"); };
    sync(); window.addEventListener("hashchange",sync);
    return () => window.removeEventListener("hashchange",sync);
  }, []);
  const navigate = (next: View) => { window.location.hash = next; setView(next); window.scrollTo(0,0); };
  return <SidebarMobile logo={<Brand />} primaryItems={PRIMARY} defaultActiveId="garaje"
    open={open} onOpenChange={setOpen} closeOnItemClick>
    <div className="garage-review__shell">
      <aside className="garage-review__sidebar">
        <Sidebar logo={<Brand />} primaryItems={PRIMARY} defaultActiveId="garaje" height="100%" contentHeight={920} headerHeight={64} collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </aside>
      <div className="garage-review__main">
        <div className="garage-review__desktop-header"><Header width="100%" username="Cuenta" /></div>
        <div className="garage-review__mobile-header"><Header width="100%" compact username="Cuenta"
          logo={<div className="garage-review__brand"><SidebarMenuButton onClick={() => setOpen(true)} expanded={open} /><Brand /></div>} /></div>
        {view === "mi-garaje" ? <FrameContent navigate={navigate} /> : <AvtFrames view={view} saved={saved} navigate={navigate} save={() => { setSaved(true); navigate("mis-valorizaciones"); }} />}
      </div>
    </div>
  </SidebarMobile>;
}
