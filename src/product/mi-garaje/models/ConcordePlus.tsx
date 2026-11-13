"use client";

/**
 * Modelo 4 · Concorde+ — propone AMPLIAR el design system pensando en la experiencia.
 * Piezas nuevas (ver /ds): GarageHero, RiskMeter, WalletGlass, ActionTile, LiveNowCard,
 * TaskCard, Countdown, RoleFilter, VehicleRow + ProgressSteps (de 1B).
 * Lenguaje: el gradiente vault profundo y las superficies glass que Concorde ya usa en la Sala,
 * llevados al hub para que «tu espacio» se sienta parte de la subasta, no un formulario de cuenta.
 */
import { useState } from "react";
import type { JSX } from "react";
import Button from "@/src/product/mi-garaje/concorde/components/Button";
import ProfileButton from "@/src/product/mi-garaje/concorde/components/ProfileButton";
import BadgeStatus from "@/src/product/mi-garaje/concorde/components/BadgeStatus";
import TabSelector from "@/src/product/mi-garaje/concorde/components/TabSelector";
import AvatarZone from "@/src/product/mi-garaje/concorde/components/AvatarZone";
import StarIcon from "@/src/product/mi-garaje/concorde/components/StarIcon";
import CheckIcon from "@/src/product/mi-garaje/concorde/components/CheckIcon";
import { Chrome, PHOTO } from "./kit";
import { ROLE, VehicleRow, data, pendingOf, plural, type Pending, type Sec } from "./Garaje";
import { Countdown, RiskMeter } from "./plus-parts";
import "./kit.css";
import "./garaje.css";
import "./concorde-plus.css";

function PlusIcon(): JSX.Element {
  return <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>;
}
function GaugeIcon(): JSX.Element {
  return <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4.5 17a8 8 0 1 1 15 0" /><path d="M12 13l3.5-3.5" /><circle cx="12" cy="13" r="1.2" fill="currentColor" /></svg>;
}

// ─── GarageHero = saludo + estado + riesgo/puntos + WalletGlass + ActionTiles ──
function GarageHero({ pending, loading }: { pending: Pending[]; loading: boolean }): JSX.Element {
  const n = pending.length;
  return <section className="cp-hero" aria-labelledby="cp-hello">
    <div className="cp-hero__who">
      <div className="cp-hero__hello"><AvatarZone size={44} /><div>
        <h1 id="cp-hello">Mi Garaje</h1>
        <p>¡Hola, ZAEX5G! {loading ? "Revisando tus procesos…" : n ? <>Tienes <b>{n} {n === 1 ? "cosa" : "cosas"}</b> por atender.</> : <>Todo al día.</>}</p>
      </div></div>
      <div className="cp-hero__stats">
        <RiskMeter level={0} />
        <span className="cp-points"><StarIcon size="sm" /><b>500</b> Puntos VMC</span>
      </div>
      <nav className="cp-hero__links" aria-label="Cuenta"><a href="#">Tu perfil</a><a href="#">Historial</a><a href="#">SubasPass</a></nav>
    </div>

    <div className="cp-wallet" aria-label="Mi Wallet">
      <div className="cp-wallet__top"><b>Mi Wallet</b><a href="#">Transacciones</a></div>
      <dl><div><dt>SubasCoins</dt><dd><small>&gt;S&lt; </small>1,250</dd></div><div><dt>Saldo</dt><dd>US$ 320.00</dd></div></dl>
      <Button variant="outline">Adquiere SubasCoins</Button>
    </div>

    <div className="cp-tiles">
      <button type="button" className="cp-tile cp-tile--publish"><PlusIcon /><span><b>Publicar</b><small>Vende tu vehículo</small></span></button>
      <button type="button" className="cp-tile cp-tile--value"><GaugeIcon /><span><b>Valorizar</b><small>Conoce su precio justo</small></span></button>
      <p>Los dos empiezan con la valorización de tu vehículo. Desde el resultado eliges guardar o publicar.</p>
    </div>
  </section>;
}

// ─── Ahora: LiveNowCard + TaskCards (PROPUESTA DS) ──
const T0 = Date.now();
const DEADLINE: Record<string, number> = { p1: T0 + 42 * 6e4, n0: T0 + 6.5 * 3.6e6, c1: T0 + 3 * 864e5 };
function NowStrip({ pending }: { pending: Pending[] }): JSX.Element {
  if (!pending.length) return <section className="cp-now cp-now--ok" aria-label="Pendientes"><CheckIcon size={22} /><p><b>Nada pendiente.</b> Cuando una subasta, una oferta o un pago necesiten tu respuesta, aparecerán aquí primero.</p></section>;
  return <section className="cp-now" aria-labelledby="cp-now">
    <h2 id="cp-now" className="cp-h2">Ahora</h2>
    <div className="cp-now__rail">
      {pending.map((r) => r.tone === "live"
        ? <article key={r.id} className="cp-live">
            <img src={PHOTO[r.photo]} alt="" width={320} height={150} />
            <div className="cp-live__glass">
              <div className="cp-live__top"><BadgeStatus variant="live" label="EN VIVO" /><Countdown to={DEADLINE[r.id]} label="Cierra en" /></div>
              <strong>{r.name} {r.year}</strong>
              <Button variant="primary">{r.nextCta}</Button>
            </div>
          </article>
        : <article key={r.id} className={`cp-task cp-task--${r.sec}`}>
            <div className="cp-task__head"><img src={PHOTO[r.photo]} alt="" width={56} height={44} /><div><small>{r.secTitle}</small><strong>{r.nextTitle}</strong></div></div>
            <p>{r.detail}</p>
            {r.sec === "compras" && r.steps ? <ol className="cp-steps">{r.steps.map((t, i) => <li key={t} className={i < (r.step ?? 0) ? "is-done" : i === r.step ? "is-now" : ""}>{t}</li>)}</ol> : null}
            <div className="cp-task__foot"><Countdown to={DEADLINE[r.id]} label={r.sec === "compras" ? "Paga en" : "Vence en"} />
              <Button variant={r.sec === "negociaciones" ? "negotiable" : "secondary-sm"}>{r.nextCta}</Button></div>
          </article>)}
    </div>
  </section>;
}

// ─── Tu actividad con RoleFilter (PROPUESTA): compras y ventas son dos roles distintos. ──
function Activity({ secs, loading }: { secs: Sec[]; loading: boolean }): JSX.Element {
  const [role, setRole] = useState(0);
  const want = [null, "compra", "vende"][role];
  const shown = secs.map((s) => ({ ...s, rows: want ? s.rows.filter((r) => ROLE[r.id] === want) : s.rows })).filter((s) => !want || s.rows.length);
  return <section className="cp-activity" aria-labelledby="cp-act">
    <div className="cp-activity__head">
      <h2 id="cp-act" className="cp-h2">Tu actividad</h2>
      <TabSelector options={["Todo", "Comprando", "Vendiendo"]} value={role} onChange={setRole} aria-label="Filtrar por rol" />
    </div>
    <div className="cp-sections">
      {shown.map((s) => {
        const news = s.rows.filter((r) => r.isNew).length;
        return <section key={s.id} className="cp-sec" aria-label={s.title}>
          <header><div><h3>{s.title}{news ? <span className="g-newcount">{news} nueva</span> : null}</h3>
            <p>{loading ? "Cargando…" : s.rows.length ? plural(s.rows.length, s.unit) : "Sin actividad todavía"}</p></div>
            {s.rows.length ? <ProfileButton>Ver todas</ProfileButton> : null}</header>
          {loading ? <div className="g-skel"><div><i /><b /><b /></div></div>
            : s.rows.length ? <div className="g-list">{s.rows.slice(0, 3).map((r) => <VehicleRow key={r.id} r={r} tracker />)}</div>
            : <div className="g-empty"><p>{s.empty}</p>{s.emptyCta ? <Button variant={s.emptyCta === "Publicar" ? "primary" : "outline"}>{s.emptyCta}</Button> : null}</div>}
        </section>;
      })}
    </div>
  </section>;
}

export default function ConcordePlus({ withNews, isEmpty, isLoading }: { withNews: boolean; isEmpty: boolean; isLoading: boolean }): JSX.Element {
  const secs = data(withNews).map((s) => (isEmpty ? { ...s, rows: [] } : s));
  const pending = isLoading ? [] : pendingOf(secs);
  return <Chrome>
    <main className="g-page cp">
      <GarageHero pending={pending} loading={isLoading} />
      {isLoading ? null : <NowStrip pending={pending} />}
      <Activity secs={secs} loading={isLoading} />
    </main>
  </Chrome>;
}
