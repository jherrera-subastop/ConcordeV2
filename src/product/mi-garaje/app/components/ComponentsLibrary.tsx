"use client";

/**
 * /components: componentes de Mi Garaje para copiar a otro proyecto (mismo formato que /components de vmc-index-lab).
 * Cada sección: guía, vista en escritorio y en móvil, cómo usarlo (archivos + ejemplo + código) y sus propiedades.
 * El código de ./lib lo lee page.tsx al compilar.
 */
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import { PublicationBadge, PublicationPin, type PublicationStatus } from "./lib/PublicationBadge";
import { DropModal } from "./lib/DropModal";
import PublicationFlow, { NO_DEAL_NOTE, TIME_OUT_NOTE } from "./PublicationFlow";
import QrRecibeOfertas from "./QrRecibeOfertas";
import QrSection from "./QrSection";

export type LibSources = Record<string, string>;
type Prop = [name: string, type: string, def: string, desc: string];
type File = { name: string; code: string };

// ── Piezas de la página ─────────────────────────────────────────────────────────
function copy(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select();
  try { document.execCommand("copy"); } finally { t.remove(); }
  return Promise.resolve();
}

function Code({ usage, files }: { usage: string; files: File[] }): JSX.Element {
  const tabs = [{ name: "Ejemplo", code: usage }, ...files];
  const [tab, setTab] = useState(0);
  const [done, setDone] = useState(false);
  const cur = tabs[tab];
  return <div className="cx-code">
    <div className="cx-code__bar">
      <div className="cx-code__tabs" role="tablist" aria-label="Archivos">
        {tabs.map((t, i) => <button key={t.name} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{t.name}</button>)}
      </div>
      <button type="button" className="cx-code__copy" onClick={() => copy(cur.code).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}>{done ? "Copiado" : "Copiar"}</button>
    </div>
    <pre><code>{cur.code.split("\n").map((l, i) => <span key={i}>{l}{"\n"}</span>)}</code></pre>
  </div>;
}

function Props({ rows }: { rows: Prop[] }): JSX.Element {
  return <div className="cx-table"><table>
    <thead><tr><th>Propiedad</th><th>Tipo</th><th>Por defecto</th><th>Qué hace</th></tr></thead>
    <tbody>{rows.map(([n, t, d, x]) => <tr key={n}><td><code>{n}</code></td><td><code>{t}</code></td><td>{d === "—" ? "—" : <code>{d}</code>}</td><td>{x}</td></tr>)}</tbody>
  </table></div>;
}

/** iPhone 14 Pro (pantalla 393 × 852, marco 11, isla 126 × 37, barra de estado 54), dibujado a tamaño real y mostrado al 72 %. */
const PHONE_SCALE = 0.72;
function Phone({ children }: { children: ReactNode }): JSX.Element {
  return <div className="cx-phone-wrap" style={{ "--s": PHONE_SCALE } as CSSProperties}>
    <div className="cx-phone"><div className="cx-phone__screen">
      <span className="cx-phone__island" aria-hidden />
      <div className="cx-phone__status" aria-hidden><span>9:41</span><span className="cx-phone__icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="#fff" strokeOpacity="0.4" /><rect x="2" y="2" width="20" height="9" rx="2.5" fill="#fff" /></svg>
      </span></div>
      <div className="cx-phone__page">{children}</div>
      <span className="cx-phone__home" aria-hidden />
    </div></div>
  </div>;
}

function Preview({ desktop, mobile, width }: { desktop: ReactNode; mobile?: ReactNode; width?: number }): JSX.Element {
  return <div className="cx-views">
    <div className="cx-view">
      <span className="cx-view__label">{mobile ? "Escritorio" : "Vista"}</span>
      <div className="cx-view__box"><div style={width ? { width } : undefined}>{desktop}</div></div>
    </div>
    {mobile ? <div className="cx-view cx-view--phone">
      <span className="cx-view__label">Móvil</span>
      <div className="cx-view__box cx-view__box--phone"><Phone>{mobile}</Phone></div>
    </div> : null}
  </div>;
}

function Section({ id, name, tag, summary, guide, preview, files, usage, props }: {
  id: string; name: string; tag: string; summary: string; guide?: ReactNode; preview: ReactNode; files: File[]; usage: string; props: Prop[];
}): JSX.Element {
  return <section id={id} className="cx-sec" aria-labelledby={`${id}-t`}>
    <header className="cx-sec__head"><h2 id={`${id}-t`}>{name}</h2><code>{tag}</code></header>
    <p className="cx-sum">{summary}</p>
    {guide}
    {preview}
    <h3>Cómo usarlo</h3>
    <ol className="cx-steps">
      <li>Copia {files.length === 1 ? "este archivo" : "estos archivos"} en una misma carpeta:<span className="cx-files">{files.map((f) => <code key={f.name}>{f.name}</code>)}</span></li>
      <li>Impórtalo y pásale tus datos, como en el ejemplo.</li>
    </ol>
    <Code usage={usage} files={files} />
    <h3>Propiedades</h3>
    <Props rows={props} />
  </section>;
}

// ── Badges de Mis publicaciones ──
const PUB_ROWS: { photo: string; name: string; meta: string; status: PublicationStatus; proposals?: number; deal?: boolean }[] = [
  { photo: "swift", name: "Suzuki Swift 2020", meta: "No se recibió ninguna oferta", status: "desierta", deal: true },
  { photo: "etios", name: "Toyota Etios 2020", meta: "Enviada a revisión", status: "revision" },
  { photo: "accent", name: "Hyundai Accent 2018", meta: "Publicado: 28/10/2026", status: "publicada" },
  { photo: "picanto", name: "Kia Picanto 2021", meta: "Publicado: 27/10/2026", status: "negociacion", proposals: 3 },
  { photo: "rio", name: "Kia Rio 2021", meta: "Acuerdo por US$ 12,500", status: "subaschat", deal: true },
  { photo: "nivus", name: "Volkswagen Nivus 2022", meta: "Vendido en VMC", status: "vendido", deal: true },
  { photo: "hilux", name: "Toyota Hilux 2020", meta: NO_DEAL_NOTE, status: "no-concretada", deal: true },
  { photo: "mazda3", name: "Mazda 3 2018", meta: TIME_OUT_NOTE, status: "no-concretada", deal: true },
];
const PubList = () => <div className="cx-pubs">{PUB_ROWS.map((r) => <div key={r.name} className="cx-pub">
  <img src={`/producto-assets/mi-garaje/garage-photos/${r.photo}/1.jpg`} alt="" />
  <span className="cx-pub__main"><b>{r.status === "desierta" ? <PublicationPin /> : null}{r.name}</b><small className={r.deal ? "is-deal" : undefined}>{r.meta}</small></span>
  <span className="cx-pub__side"><PublicationBadge status={r.status} />{r.proposals ? <small>Propuestas <b>{r.proposals}</b></small> : null}</span>
</div>)}</div>;

const USE_PUB = `import { PublicationBadge, PublicationPin } from "./PublicationBadge";

<PublicationBadge status="revision" />       // En revisión
<PublicationBadge status="publicada" />      // Publicada
<PublicationBadge status="negociacion" />    // En negociación
<PublicationBadge status="subaschat" />      // SubasChat
<PublicationBadge status="vendido" />        // Venta exitosa
<PublicationBadge status="no-concretada" />  // No concretada
<PublicationBadge status="desierta" />       // Desierta

// Las desiertas van fijadas arriba de la lista, con chincheta antes del nombre
<b><PublicationPin />Suzuki Swift 2020</b>

// En la fila, a la derecha; con propuestas, el número va arriba del badge
<span className="fila__derecha">
  <small>Propuestas <b>3</b></small>
  <PublicationBadge status="negociacion" />
</span>`;

const USE_QR_CARD = `"use client";
import { useRef } from "react";
import { QrCard, printA4 } from "./QrCard"; // necesita qrcode-generator: npm install qrcode-generator

export function QrDelVehiculo() {
  const card = useRef<HTMLDivElement>(null);
  return <>
    {/* value: el link de la publicación del vehículo */}
    <QrCard ref={card} value="https://www.vmcsubastas.com" />
    {/* Para imprimir sin color: tone="negro" o tone="blanco" */}
    <button onClick={() => card.current && printA4(card.current)}>Imprimir en A4</button>
  </>;
}`;

const USE_DROP = `import { useState } from "react";
import { DropModal } from "./DropModal";

const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Dar de baja</button>
{open ? <DropModal name="Suzuki Swift 2020" photo="/fotos/swift.jpg" note="No se recibió ninguna oferta"
  onClose={() => setOpen(false)}
  onConfirm={(motivo) => { setOpen(false); darDeBaja(motivo); }} /> : null}`;

/** Botón para abrir el modal de ejemplo. */
function DropDemo(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState("");
  return <div className="cx-drop"><button type="button" onClick={() => { setDone(""); setOpen(true); }}>Abrir el modal</button>{done ? <small>Motivo elegido: {done}</small> : null}
    {open ? <DropModal name="Suzuki Swift 2020" photo="/producto-assets/mi-garaje/garage-photos/swift/1.jpg" note="No se recibió ninguna oferta" onClose={() => setOpen(false)} onConfirm={(r) => { setOpen(false); setDone(r); }} /> : null}</div>;
}

const NAV = [["flujo-publicacion", "Flujo de una publicación"], ["badges-publicaciones", "Badges de publicaciones"], ["modal-baja", "Modal de dar de baja"], ["qr", "QR"], ["qr-oferta", "QR Recibe ofertas"]] as const;

export default function ComponentsLibrary({ sources }: { sources: LibSources }): JSX.Element {
  const f = (name: string): File => ({ name, code: sources[name] ?? "" });
  return <div className="cx">
    <style>{PAGE_CSS}</style>
    <aside className="cx-nav">
      <p className="cx-nav__k">Mi Garaje</p>
      <h1>Componentes</h1>
      <nav>{NAV.map(([id, name]) => <a key={id} href={`#${id}`}>{name}</a>)}</nav>
      <Link className="cx-nav__back" href="/producto/mi-garaje/m/vmc">Volver a Mi Garaje</Link>
    </aside>
    <main className="cx-main">
      <PublicationFlow />

      <Section id="badges-publicaciones" name="Badges de Mis publicaciones" tag="PublicationBadge"
        summary="Dicen en qué etapa está cada publicación del vendedor."
        preview={<Preview width={435} desktop={<PubList />} mobile={<PubList />} />}
        files={[f("PublicationBadge.tsx"), f("publication-badge.css")]} usage={USE_PUB}
        props={[
          ["status", "\"revision\" | \"publicada\" | \"negociacion\" | \"subaschat\" | \"vendido\" | \"no-concretada\" | \"desierta\"", "—", "Etapa de la publicación"],
          ["label", "string", "—", "Texto propio (por defecto el de la etapa)"],
        ]} />

      <Section id="modal-baja" name="Modal de dar de baja" tag="DropModal"
        summary="Confirma antes de dar de baja. Cancelar es el botón grande; Dar de baja se activa al elegir el motivo."
        preview={<DropDemo />}
        files={[f("DropModal.tsx"), f("drop-modal.css")]} usage={USE_DROP}
        props={[
          ["name", "string", "—", "Nombre del vehículo"], ["photo", "string", "—", "Foto del vehículo"], ["note", "string", "—", "Lo que dice hoy la fila"],
          ["onConfirm", "(motivo: string) => void", "—", "Se llama con el motivo elegido"], ["onClose", "() => void", "—", "Cancelar, Esc o clic fuera"],
        ]} />

      <QrSection />

      <Section id="qr-oferta" name="QR Recibe ofertas" tag="QrCard"
        summary="Tarjeta con el QR del vehículo que recibe ofertas, lista para imprimir en A4."
        preview={<QrRecibeOfertas />}
        files={[f("QrCard.tsx"), f("qr-card.css"), f("QrCode.tsx")]} usage={USE_QR_CARD}
        props={[
          ["value", "string", "—", "Link que abre el QR: el de la publicación del vehículo"],
          ["hook", "string", "\"¡Hey, tú!\"", "Texto de arriba"], ["label", "string", "\"Este vehículo recibe ofertas\"", "Texto de abajo"],
          ["logoSrc", "string", "\"/producto-assets/mi-garaje/garage-reference/logo-vmc.svg\"", "Ruta del logo, en blanco"], ["tone", "\"color\" | \"negro\" | \"blanco\"", "\"color\"", "Negro y blanco son para imprimir sin color"], ["size", "number", "200", "Ancho en px; todo escala con él"],
          ["ref", "Ref<HTMLDivElement>", "—", "La tarjeta, para pasársela a printA4 e imprimirla en A4"],
        ]} />
    </main>
  </div>;
}

const PAGE_CSS = `
.cx { min-height: 100vh; display: grid; grid-template-columns: 220px minmax(0, 1fr); background: #F4F2FA; color: #1B1340; font-family: var(--vmc-font-display); }
.cx-nav { position: sticky; top: 0; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; padding: 28px 16px; background: #2E0F70; color: #fff; }
.cx-nav__k { margin: 0; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; opacity: .7; }
.cx-nav h1 { margin: 0 0 16px; font-size: 22px; }
.cx-nav nav { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.cx-nav nav a { padding: 8px 12px; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; }
.cx-nav nav a:hover { background: rgba(255,255,255,.12); }
.cx-nav__back { margin-top: auto; padding: 8px 12px; color: #fff; font-size: 13px; text-decoration: none; opacity: .8; }
.cx-main { display: flex; flex-direction: column; gap: 24px; min-width: 0; padding: 32px clamp(16px, 4vw, 48px) 80px; }
.cx-sec { display: flex; flex-direction: column; gap: 16px; min-width: 0; padding: 28px; border: 1px solid #E6E1F5; border-radius: 20px; background: #fff; scroll-margin-top: 16px; }
.cx-sec__head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.cx-sec__head h2 { margin: 0; font-size: 22px; }
.cx-sec__head code { padding: 3px 10px; border-radius: 999px; background: #EFEAFD; color: #3D2299; font: 600 13px var(--vmc-font-mono); }
.cx-sum { margin: -6px 0 4px; font-size: 15px; line-height: 1.5; color: #4A4370; }
.cx-sec h3 { margin: 12px 0 0; font-size: 15px; }

/* Vista: escritorio y teléfono al lado (bajan si no entran) */
.cx-views { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px; }
.cx-view { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.cx-view--phone { flex: none; }
.cx-view__label { font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #6B6492; }
.cx-view__box { min-width: 0; max-width: 100%; padding: 24px; overflow-x: auto; border-radius: 16px; background: #F7F6FB; border: 1px solid #ECE8F7; }
.cx-view__box--phone { padding: 20px 24px; }
.cx-phone-wrap { width: calc(415px * var(--s)); height: calc(874px * var(--s)); }
.cx-phone { position: relative; box-sizing: border-box; width: 415px; height: 874px; padding: 11px; border-radius: 66px; background: #1B1A20;
  box-shadow: inset 0 0 0 2px #3C3A44, 0 0 0 1px #0B0B0F, 0 40px 90px -30px rgba(0,0,0,.45); transform: scale(var(--s)); transform-origin: 0 0; }
.cx-phone::before { content: ""; position: absolute; left: -3px; top: 168px; width: 3px; height: 150px; border-radius: 2px 0 0 2px;
  background: linear-gradient(#2A2930 0 20%, transparent 20% 33%, #2A2930 33% 63%, transparent 63% 70%, #2A2930 70%); }
.cx-phone::after { content: ""; position: absolute; right: -3px; top: 250px; width: 3px; height: 96px; border-radius: 0 2px 2px 0; background: #2A2930; }
.cx-phone__screen { position: relative; display: flex; flex-direction: column; width: 393px; height: 852px; overflow: hidden; border-radius: 55px; background: #2E0F70; }
.cx-phone__island { position: absolute; top: 11px; left: 50%; z-index: 2; width: 126px; height: 37px; margin-left: -63px; border-radius: 20px; background: #000; }
.cx-phone__status { flex: none; display: flex; align-items: center; justify-content: space-between; height: 54px; padding: 6px 30px 0 52px; color: #fff;
  font: 600 16px/1 -apple-system, "SF Pro Text", "Plus Jakarta Sans", system-ui, sans-serif; }
.cx-phone__icons { display: inline-flex; align-items: center; gap: 6px; }
.cx-phone__page { flex: 1; min-height: 0; overflow: auto; padding: 12px; background: #fff; }
.cx-phone__home { position: absolute; left: 50%; bottom: 8px; z-index: 2; width: 134px; height: 5px; margin-left: -67px; border-radius: 3px; background: rgba(20,17,43,.85); pointer-events: none; }

/* Fila de Mis publicaciones (medidas de Mi Garaje: foto 48 × 36, nombre 14 px, dato 12 px) */
.cx-pubs { display: grid; background: #fff; border-radius: 12px; }
.cx-pub { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px; }
.cx-pub img { width: 48px; height: 36px; border-radius: 6px; object-fit: cover; }
.cx-pub__main { display: grid; gap: 4px; min-width: 0; }
.cx-pub__main b { overflow: hidden; font-size: 14px; font-weight: 300; color: #191C1C; text-overflow: ellipsis; white-space: nowrap; }
.cx-pub__main small { font-size: 12px; font-weight: 300; line-height: 16.8px; color: #6B6878; }
.cx-pub__main small.is-deal { font-weight: 700; color: #191C1C; } /* dónde se vendió o el motivo: negro y en negrita */
.cx-pub__side { display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 4px; }
.cx-drop { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 20px; border: 1px solid #ECE8F7; border-radius: 14px; background: #fff; }
.cx-drop button { padding: 9px 18px; border: 0; border-radius: 999px; background: #3D2299; color: #fff; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; }
.cx-drop small { font-size: 13px; color: #6B6492; }
.cx-pub__side small { font-size: 12px; color: #6B6878; }
.cx-pub__side small b { margin-left: 4px; font-weight: 400; }

/* Cómo usarlo */
.cx-steps { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; line-height: 1.6; color: #3F3866; }
.cx-files { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.cx-steps code { padding: 2px 8px; border-radius: 6px; background: #F1EDFC; color: #3D2299; font: 600 12.5px var(--vmc-font-mono); white-space: nowrap; }
.cx-code { overflow: hidden; border-radius: 14px; background: #160A3A; }
.cx-code__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 8px 8px 10px; background: #21104F; }
.cx-code__tabs { display: flex; gap: 4px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.cx-code__tabs button { flex: none; padding: 7px 12px; border: 0; border-radius: 8px; background: transparent; color: rgba(255,255,255,.7); font: 600 12.5px var(--vmc-font-mono); cursor: pointer; }
.cx-code__tabs button:hover { color: #fff; }
.cx-code__tabs button[aria-selected="true"] { background: rgba(255,255,255,.12); color: #fff; }
.cx-code__copy { flex: none; padding: 7px 14px; border: 0; border-radius: 999px; background: #fff; color: #2E0F70; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.cx-code pre { margin: 0; max-height: 460px; overflow: auto; padding: 16px 16px 16px 0; color: #E9E4FF; font: 13px/1.65 var(--vmc-font-mono); counter-reset: ln; }
.cx-code code > span { display: block; padding-left: 52px; position: relative; white-space: pre; }
.cx-code code > span::before { counter-increment: ln; content: counter(ln); position: absolute; left: 0; width: 36px; text-align: right; color: rgba(255,255,255,.3); user-select: none; }

/* Propiedades */
.cx-table { overflow-x: auto; border: 1px solid #ECE8F7; border-radius: 14px; }
.cx-table table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.cx-table th, .cx-table td { padding: 10px 14px; text-align: left; vertical-align: top; border-bottom: 1px solid #F0EDF8; }
.cx-table tr:last-child td { border-bottom: 0; }
.cx-table th { background: #FAF9FE; font-size: 12px; font-weight: 700; color: #6B6492; white-space: nowrap; }
.cx-table td { color: #3F3866; line-height: 1.5; }
.cx-table td code { color: #3D2299; font: 600 12.5px var(--vmc-font-mono); white-space: nowrap; }

@media (max-width: 900px) {
  .cx { grid-template-columns: 1fr; }
  .cx-nav { position: sticky; top: 0; z-index: 10; height: auto; flex-direction: row; align-items: center; gap: 12px; padding: 12px 16px; overflow: hidden; }
  .cx-nav__k, .cx-nav__back { display: none; }
  .cx-nav h1 { margin: 0; font-size: 16px; flex: none; }
  .cx-nav nav { flex-direction: row; overflow-x: auto; scrollbar-width: none; }
  .cx-nav nav a { flex: none; padding: 6px 10px; font-size: 13px; }
  .cx-main { padding: 16px 12px 64px; }
  .cx-sec { padding: 18px 14px; scroll-margin-top: 64px; }
  .cx-view__box { padding: 16px; }
  .cx-table th:nth-child(3), .cx-table td:nth-child(3) { display: none; }
}
`;
