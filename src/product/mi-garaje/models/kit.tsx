"use client";

/**
 * Piezas compartidas por los modelos A/B/C: datos de ejemplo, chrome de navegación
 * (Header + Sidebar de Concorde) y piezas PROPUESTAS que no existen en Concorde
 * (VehicleRow, StatusTag, Thumbs, Chevron, Skeleton). Caso para revisar con Julio.
 */
import { useState } from "react";
import type { JSX, ReactNode } from "react";
import Header from "@/src/product/mi-garaje/concorde/bloques/header/desktop/Header";
import { NotifBand, NotifFloat, NotifHeader, NotifProvider } from "./Notifs";
import Sidebar, { type SidebarNavItem } from "@/src/product/mi-garaje/concorde/bloques/sidebar/desktop/Sidebar";
import SidebarMobile, { SidebarMenuButton } from "@/src/product/mi-garaje/concorde/bloques/sidebar/mobile/SidebarMobile";
import TodayIcon from "@/src/product/mi-garaje/concorde/components/TodayIcon";
import OfferIcon from "@/src/product/mi-garaje/concorde/components/OfferIcon";
import CategoryIcon from "@/src/product/mi-garaje/concorde/components/CategoryIcon";
import BusinessIcon from "@/src/product/mi-garaje/concorde/components/BusinessIcon";
import AvatarZone from "@/src/product/mi-garaje/concorde/components/AvatarZone";
import StarIcon from "@/src/product/mi-garaje/concorde/components/StarIcon";
import InfoIcon from "@/src/product/mi-garaje/concorde/components/InfoIcon";
import ProfileButton from "@/src/product/mi-garaje/concorde/components/ProfileButton";
import TabSelector from "@/src/product/mi-garaje/concorde/components/TabSelector";
import Button from "@/src/product/mi-garaje/concorde/components/Button";

// ─── Datos de ejemplo ────────────────────────────────────────────────────────
export type Tone = "live" | "negotiable" | "vault" | "neutral" | "urgent";
export type Item = {
  id: string; name: string; year: number; plate: string; photo: string;
  status: string; tone: Tone; detail: string; cta: string; deadline?: string; urgent?: boolean; isNew?: boolean; group?: string;
};
export type SectionId = "negociaciones" | "participaciones" | "compras" | "publicaciones" | "valorizaciones";
export type Section = { id: SectionId; title: string; hint: string; summary: string; empty: string; emptyCta?: string; groups?: string[]; items: Item[] };
export type ModelProps = { withNews: boolean; isEmpty: boolean; isLoading: boolean };

export function sections({ withNews, isEmpty }: ModelProps): Section[] {
  const s: Section[] = [
    { id: "negociaciones", title: "Mis negociaciones", hint: "Ofertas recibidas y enviadas",
      summary: withNews ? "1 por responder · vence hoy" : "2 esperando respuesta",
      empty: "Cuando recibas o envíes una oferta en una publicación negociable, la seguirás aquí.", items: [
      ...(withNews ? [{ id: "n0", name: "Toyota Corolla", year: 2019, plate: "BXT-231", photo: "corolla" as const, status: "Propuesta recibida", tone: "negotiable" as Tone,
        detail: "Te ofrecen US$ 9,800", deadline: "Vence hoy 23:59", cta: "Responder", urgent: true, isNew: true }] : []),
      { id: "n1", name: "Toyota Etios", year: 2020, plate: "AEU-804", photo: "etios", status: "Esperando respuesta", tone: "neutral", detail: "Contraoferta enviada · US$ 7,200", cta: "Ver" },
      { id: "n2", name: "Kia Rio", year: 2021, plate: "CDF-112", photo: "corolla", status: "Esperando respuesta", tone: "neutral", detail: "Propuesta enviada · US$ 8,100", cta: "Ver" },
    ] },
    { id: "participaciones", title: "Mis participaciones", hint: "Subastas en las que consignaste", summary: "1 en vivo ahora",
      empty: "Cuando consignes para participar en una subasta, la verás aquí.", groups: ["En vivo", "Rechazadas"], items: [
      { id: "p1", name: "Hyundai Accent", year: 2018, plate: "F4K-220", photo: "etios", status: "En vivo", tone: "live", detail: "Sala abierta", deadline: "Cierra en 00:42:10", cta: "Ir a la Sala", urgent: true, group: "En vivo" },
      { id: "p2", name: "Nissan Versa", year: 2017, plate: "ABC-901", photo: "corolla", status: "Rechazada", tone: "neutral", detail: "Consignación devuelta a tu Wallet", cta: "Ver", group: "Rechazadas" },
    ] },
    { id: "compras", title: "Mis compras", hint: "Subastas ganadas y su proceso", summary: "1 pago pendiente",
      empty: "Las subastas que ganes aparecerán aquí con su proceso de compra.", groups: ["En proceso", "Historial"], items: [
      { id: "c1", name: "Kia Rio", year: 2021, plate: "CDF-112", photo: "etios", status: "Pago pendiente", tone: "vault", detail: "Ganada el 07/10", deadline: "Paga hasta el 12/10", cta: "Continuar", urgent: true, group: "En proceso" },
      { id: "c2", name: "Suzuki Swift", year: 2016, plate: "D2E-554", photo: "corolla", status: "Entregado", tone: "neutral", detail: "Compra completada el 21/09", cta: "Ver", group: "Historial" },
    ] },
    { id: "publicaciones", title: "Mis publicaciones", hint: "Tus vehículos a la venta", summary: "1 pendiente de aprobación",
      empty: "Publica tu vehículo: primero lo valorizas y luego completas fotos y descripción.", emptyCta: "Publicar", items: [
      { id: "u1", name: "Volkswagen Nivus", year: 2022, plate: "BXT-231", photo: "corolla", status: "Pendiente de aprobación", tone: "vault", detail: "Pago recibido · VMC la revisa", cta: "Ver" },
      { id: "u2", name: "Toyota Hilux", year: 2020, plate: "AEU-804", photo: "etios", status: "Publicada", tone: "negotiable", detail: "Negociable · 2 ofertas recibidas", cta: "Ver" },
    ] },
    { id: "valorizaciones", title: "Mis valorizaciones", hint: "Guardadas desde Valorizar", summary: "Última: Toyota Corolla · 09/10",
      empty: "Valoriza tu vehículo y guarda el resultado para consultarlo o publicarlo después.", emptyCta: "Valorizar", items: [
      { id: "v1", name: "Toyota Corolla", year: 2019, plate: "BXT-231", photo: "corolla", status: "Guardada", tone: "neutral", detail: "Precio justo US$ 10,400 · 09/10/2026", cta: "Ver" },
    ] },
  ];
  return isEmpty ? s.map((x) => ({ ...x, items: [], summary: "Sin actividad" })) : s;
}

// Fotos de ejemplo «subidas por el usuario» (Wikimedia Commons, licencias CC; ver public/producto-assets/mi-garaje/garage-photos/CREDITOS.json).
export const PHOTO_COUNT: Record<string, number> = {"corolla": 3, "etios": 2, "hilux": 3, "picanto": 4, "rio": 4, "accent": 4, "nivus": 4, "versa": 3, "swift": 4, "sentra": 3, "mazda3": 4, "sail": 4};
export const photosOf = (slug: string): string[] => Array.from({ length: PHOTO_COUNT[slug] ?? 1 }, (_, i) => `/producto-assets/mi-garaje/garage-photos/${slug}/${i + 1}.jpg`);
export const PHOTO: Record<string, string> = new Proxy({}, { get: (_, slug: string) => `/producto-assets/mi-garaje/garage-photos/${slug}/1.jpg` });
export const newsCount = (s: Section) => s.items.filter((i) => i.isNew).length;
export const urgentItems = (all: Section[]) => all.flatMap((s) => s.items.filter((i) => i.urgent).map((i) => ({ ...i, section: s.title })));
export const ctaVariant = (t: Tone) => (t === "live" ? "primary" : t === "negotiable" ? "negotiable" : "secondary-sm") as "primary" | "negotiable" | "secondary-sm";

// ─── Piezas PROPUESTAS (no existen en Concorde; caso para Julio) ─────────────
/** Chevron en círculo, mismo trazo que ProfileButton. */
export function Chevron({ open }: { open?: boolean }): JSX.Element {
  return <svg className={`kit-chev${open ? " is-open" : ""}`} width="20" height="20" viewBox="0 0 20 20" aria-hidden>
    <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8.5 6.5 12 10l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

/** Estado en texto + color semántico (DESIGN.md: naranja = en vivo/urgencia, cyan = negociable, vault = resto). */
export function StatusTag({ tone, children }: { tone: Tone; children: ReactNode }): JSX.Element {
  return <span className={`kit-tag kit-tag--${tone}`}>{tone === "live" ? <i aria-hidden className="kit-tag__dot" /> : null}{children}</span>;
}

export function NewBadge({ n }: { n: number }): JSX.Element | null {
  return n ? <span className="kit-newbadge"><i aria-hidden />{n === 1 ? "1 nueva" : `${n} nuevas`}</span> : null;
}

/** Miniaturas apiladas: muestran que hay vehículos sin abrir la sección. */
export function Thumbs({ items, max = 3 }: { items: Item[]; max?: number }): JSX.Element | null {
  if (!items.length) return null;
  return <span className="kit-thumbs" aria-hidden>{items.slice(0, max).map((i) => <img key={i.id} src={PHOTO[i.photo]} alt="" width={28} height={28} />)}
    {items.length > max ? <b>+{items.length - max}</b> : null}</span>;
}

/** Fila compacta de vehículo; toda la fila es el destino, la acción urgente es el botón. */
export function VehicleRow({ item, compact }: { item: Item; compact?: boolean }): JSX.Element {
  return <article className={`kit-row${item.isNew ? " kit-row--new" : ""}${compact ? " kit-row--compact" : ""}`}>
    <img className="kit-row__photo" src={PHOTO[item.photo]} alt="" width={80} height={60} />
    <div className="kit-row__body">
      <div className="kit-row__title"><a href="#" className="kit-row__link">{item.name} {item.year}</a>{item.isNew ? <span className="kit-row__new">Nuevo</span> : null}</div>
      <span className="kit-row__meta">{item.detail}<span className="kit-row__plate"> · {item.plate}</span></span>
      <span className="kit-row__tags"><StatusTag tone={item.tone}>{item.status}</StatusTag>{item.deadline ? <StatusTag tone="urgent">{item.deadline}</StatusTag> : null}</span>
    </div>
    <div className="kit-row__action">{item.urgent ? <Button variant={ctaVariant(item.tone)}>{item.cta}</Button> : <ProfileButton>{item.cta}</ProfileButton>}</div>
  </article>;
}

export function SkeletonRows({ n = 2 }: { n?: number }): JSX.Element {
  return <div className="kit-skel" role="status" aria-label="Cargando">{Array.from({ length: n }, (_, i) => <div key={i} className="kit-skel__row"><i /><div><b /><b /></div></div>)}</div>;
}

/** Cuerpo común de una sección «Mis…»: pestañas, filas, vacío que enseña, carga. */
export function SectionBody({ section, max = 3, loading }: { section: Section; max?: number; loading?: boolean }): JSX.Element {
  const [tab, setTab] = useState(0);
  if (loading) return <SkeletonRows />;
  if (!section.items.length) return <div className="kit-empty"><p>{section.empty}</p>
    {section.emptyCta ? <Button variant={section.emptyCta === "Publicar" ? "primary" : "outline"}>{section.emptyCta}</Button> : null}</div>;
  const groups = section.groups;
  const items = groups ? section.items.filter((i) => i.group === groups[tab]) : section.items;
  return <div className="kit-body">
    {groups ? <TabSelector options={groups.map((g) => `${g} · ${section.items.filter((i) => i.group === g).length}`)} value={tab} onChange={setTab} aria-label={section.title} /> : null}
    <div className="kit-list">{items.slice(0, max).map((i) => <VehicleRow key={i.id} item={i} />)}</div>
    {section.items.length > max ? <ProfileButton>{`Ver las ${section.items.length}`}</ProfileButton> : null}
  </div>;
}

/** Perfil compacto: compone las mismas piezas que UserProfileCard (AvatarZone, StarIcon, InfoIcon, ProfileButton). */
export function CompactProfile({ inline }: { inline?: boolean }): JSX.Element {
  return <div className={`kit-profile${inline ? " kit-profile--inline" : ""}`}>
    <div className="kit-profile__hello"><AvatarZone size="md" /><strong>¡Hola, ZAEX5G!</strong></div>
    <dl className="kit-profile__stats">
      <div><dt>Riesgo del perfil</dt><dd className="kit-profile__risk">Muy bajo</dd></div>
      <div><dt>Puntos VMC</dt><dd><StarIcon size="sm" /> 500 pts <InfoIcon size={14} /></dd></div>
    </dl>
    <div className="kit-profile__links"><ProfileButton>Tu perfil</ProfileButton><ProfileButton>Historial</ProfileButton></div>
  </div>;
}

// ─── Chrome de navegación Concorde ──────────────────────────────────────────
// Mi Garaje no va en la barra lateral (27/10): se entra desde la cuenta del header; ningún ítem queda activo aquí.
const PRIMARY: SidebarNavItem[] = [
  { id: "hoy", label: "Hoy", icon: (state) => <TodayIcon size={22} state={state} /> },
  { id: "oferta", label: "Tipo de oferta", icon: (state) => <OfferIcon size={22} state={state} />,
    subitems: [{ id: "en-vivo", label: "En Vivo" }, { id: "negociable", label: "Negociable" }] },
  { id: "categoria", label: "Categoría", icon: (state) => <CategoryIcon size={22} state={state} /> },
  { id: "empresas", label: "Empresas", icon: (state) => <BusinessIcon size={22} state={state} /> },
];

function Brand(): JSX.Element {
  return <img src="/producto-assets/mi-garaje/garage-reference/logo-vmc.svg" alt="VMC Subastas" width={90} height={38} />;
}

/** vmc: maqueta de vmcsubastas.com (15/10, para montar el mock en las pruebas de backend): todo en 1024 px centrado sobre
 *  el violeta de VMC y la barra lateral expandida con su banner justo bajo el menú (contentHeight 730), como la home. */
export function Chrome({ children, vmc = false }: { children: ReactNode; vmc?: boolean }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(!vmc);
  // Maqueta VMC: capa de notificaciones (Notifs.tsx) en todas sus páginas, con su panel del lab.
  const shell = <SidebarMobile logo={<Brand />} primaryItems={PRIMARY} open={open} onOpenChange={setOpen} closeOnItemClick>
    <div className={`kit-shell${vmc ? " kit-shell--vmc" : ""}${vmc && collapsed ? " kit-shell--collapsed" : ""}`}>
      <aside className="kit-shell__sidebar">
        <Sidebar logo={<Brand />} primaryItems={PRIMARY} height="100%" contentHeight={vmc ? 790 : 866} headerHeight={vmc ? 56 : 64} collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </aside>
      <div className="kit-shell__main">
        <div className="kit-shell__desktop-header">
          {vmc && collapsed && <div className="kit-shell__collapsed-brand"><Brand /></div>}
          <Header width="100%" username="ZAEX5G" />
          {vmc ? <NotifHeader /> : null}
        </div>
        <div className="kit-shell__mobile-header"><Header width="100%" compact username="ZAEX5G"
          logo={<div className="kit-shell__brand"><SidebarMenuButton onClick={() => setOpen(true)} expanded={open} /><Brand /></div>} />{vmc ? <NotifHeader /> : null}</div>
        {vmc ? <><NotifBand /><NotifFloat /></> : null}
        {children}
      </div>
    </div>
  </SidebarMobile>;
  return vmc ? <NotifProvider>{shell}</NotifProvider> : shell;
}

/** PROPUESTA DS · Gallery: foto principal + tira de miniaturas (fotos subidas por el usuario). Flechas ← → navegan. */
export function Gallery({ slug, alt, height = 240 }: { slug: string; alt: string; height?: number }): JSX.Element {
  const list = photosOf(slug);
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => (x + d + list.length) % list.length);
  return <div className="kit-gal" onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}>
    <div className="kit-gal__main" style={{ height }}>
      <img src={list[i]} alt={`${alt} · foto ${i + 1} de ${list.length}`} />
      {list.length > 1 ? <>
        <button type="button" className="kit-gal__nav kit-gal__nav--prev" onClick={() => go(-1)} aria-label="Foto anterior"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <button type="button" className="kit-gal__nav kit-gal__nav--next" onClick={() => go(1)} aria-label="Foto siguiente"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <span className="kit-gal__count">{i + 1} / {list.length}</span>
      </> : null}
    </div>
    {list.length > 1 ? <div className="kit-gal__thumbs" role="tablist" aria-label="Fotos">{list.map((src, k) =>
      <button key={src} type="button" role="tab" aria-selected={k === i} aria-label={`Foto ${k + 1}`} onClick={() => setI(k)}><img src={src} alt="" /></button>)}</div> : null}
  </div>;
}
