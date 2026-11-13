"use client";

/** FeaturedCard: carta destacada que se inclina hacia el mouse, con brillo holográfico y LightBar abajo.
 *  Solo depende de React, featured-card.css y LightBar (light-bar.css). */
import { useId, useState } from "react";
import type { CSSProperties, JSX, PointerEvent, ReactNode } from "react";
import { LightBar } from "./LightBar";
import "./featured-card.css";

/** Íconos de la carta (trazo 2, color heredado). Puedes usarlos en `chips` y `stats`. */
export const CardIcons = {
  gear: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  fuel: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3M7 8h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  gauge: <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M4 17a8 8 0 1 1 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 15l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  seats: <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-2.5-4.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  pin: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="10" r="2" fill="currentColor" /></svg>,
  clock: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 8v4l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
};
/** Condición del bien que se muestra como pill sobre la foto. */
export type Condition = "basic" | "seminuevo" | "operativo" | "inoperativo" | "siniestrado";
export const CONDITIONS: Record<Condition, { label: string; icon?: "user" | "sparkle" | "power" | "wrench" | "info" }> = {
  basic: { label: "Basic", icon: "user" }, seminuevo: { label: "Seminuevo", icon: "sparkle" }, operativo: { label: "Operativo", icon: "power" },
  inoperativo: { label: "Inoperativo", icon: "wrench" }, siniestrado: { label: "Siniestrado", icon: "info" },
};
export const ConditionPill = ({ kind }: { kind: Condition }): JSX.Element => {
  const c = CONDITIONS[kind];
  // Basic (publicación de usuario): solo el ícono; al pasar el mouse se extiende y dice «Basic».
  if (kind === "basic") return <span className="vfc-pill vfc-pill--basic" tabIndex={0} role="img" aria-label="Publicación Basic: vendedor usuario" title="Basic">{PillIcons.user}<b>{c.label}</b></span>;
  return <span className={`vfc-pill vfc-pill--${kind}`}>{c.icon ? PillIcons[c.icon] : null}{c.label}</span>;
};
export const PillIcons = {
  camera: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>,
  star: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor" /></svg>,
  live: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>,
  tag: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>,
  user: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="8" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.8" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" /></svg>,
  sparkle: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z" fill="currentColor" /></svg>,
  power: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M12 2.5v9M18.4 6.6a9 9 0 1 1-12.8 0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>,
  wrench: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>,
  info: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><path d="M12 11v5.5M12 7.6v.01" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" /></svg>,
  hands: <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M2 12l4-4 4 2 3-2 4 1 5 3-4 5-3-1-3 2-3-2-3 1z" fill="#00A8AB" opacity="0.9" /><path d="M9 12l2 2M12 11l2 2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></svg>,
};

/** SubasCoin: la gema que acompaña al precio. */
export function SubasCoin({ size = 28 }: { size?: number }): JSX.Element {
  const uid = `vfc-coin${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={Math.round(size * 30 / 28)} viewBox="30 199 28 30" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <defs>
        <linearGradient id={`${uid}-d`} gradientUnits="userSpaceOnUse" x1="32" y1="215.5" x2="55.12" y2="228.11">
          <stop stopColor="#00A7A8" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#300089" />
        </linearGradient>
        <linearGradient id={`${uid}-ds`} gradientUnits="userSpaceOnUse" x1="32" y1="215.5" x2="55.12" y2="228.11">
          <stop stopColor="#73DFDF" /><stop offset="0.28" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="0.875" stopColor="#452AA2" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${uid}-c`} gradientUnits="userSpaceOnUse" x1="36.01" y1="199.59" x2="51.99" y2="222.41">
          <stop stopColor="#00ABAD" /><stop offset="0.4" stopColor="#86A4E4" /><stop offset="0.75" stopColor="#4C1EBC" /><stop offset="1" stopColor="#31008A" />
        </linearGradient>
        <linearGradient id={`${uid}-cg`} gradientUnits="userSpaceOnUse" x1="44" y1="203" x2="44" y2="219">
          <stop stopColor="#ffffff" stopOpacity="0.45" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-cb`} gradientUnits="userSpaceOnUse" x1="36.01" y1="199.59" x2="51.99" y2="222.41">
          <stop stopColor="#44D6D6" /><stop offset="0.207" stopColor="#E4EEFF" stopOpacity="0.5" /><stop offset="0.495" stopColor="#567CD3" /><stop offset="1" stopColor="#3D0D9E" />
        </linearGradient>
      </defs>
      <path d="M44 215.5L56 221L44 226.5L32 221L44 215.5Z" fill={`url(#${uid}-d)`} />
      <path d="M44 215.5L56 221L44 226.5L32 221L44 215.5" stroke={`url(#${uid}-ds)`} strokeWidth="2" strokeLinejoin="round" />
      <rect x="34" y="201" width="20" height="20" rx="10" fill={`url(#${uid}-c)`} />
      <rect x="36" y="203" width="16" height="16" rx="8" fill={`url(#${uid}-cg)`} />
      <rect x="35" y="202" width="18" height="18" rx="9" stroke={`url(#${uid}-cb)`} strokeWidth="2" />
      <path d="M44 206.417V215.583" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46.0833 208.083H42.9583C42.1535 208.083 41.5 208.737 41.5 209.542C41.5 210.347 42.1535 211 42.9583 211H45.0417C45.8465 211 46.5 211.653 46.5 212.458C46.5 213.263 45.8465 213.917 45.0417 213.917H41.5" stroke="#ffffff" strokeOpacity="0.92" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Favorito: corazón con borde degradado lila; activo, relleno morado con un pequeño rebote. */
export function LikeButton({ name, on, onToggle, size = 30 }: { name: string; on: boolean; onToggle: () => void; size?: number }): JSX.Element {
  const [pop, setPop] = useState(false);
  return (
    <button type="button" className={`vfc-like${on ? " vfc-like--on" : ""}${pop ? " vfc-like--pop" : ""}`} style={{ width: size, height: size }} aria-label={`Agregar a favoritos: ${name}`} aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); onToggle(); setPop(true); }} onAnimationEnd={() => setPop(false)}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff" stroke={on ? "#ffffff" : "#5a35c2"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

export type CardItem = { icon?: ReactNode; label: string };

export type FeaturedCardProps = {
  image: string;
  title: string;
  /** Debajo del nombre, p. ej. "2022 · Hatchback". */
  subtitle?: string;
  /** live = subasta (naranja, precio); negotiable = Recibe propuestas (turquesa). */
  tone?: "live" | "negotiable";
  /** Pill "Destacado". */
  featured?: boolean;
  /** Pill "En vivo" (solo con tone="live"). */
  live?: boolean;
  /** Total de fotos del contador "1/12". */
  photos?: number;
  /** Etiquetas con borde (transmisión, combustible…). */
  chips?: CardItem[];
  /** Datos en dos columnas (km, asientos o ciudad…). */
  stats?: CardItem[];
  priceLabel?: string;
  price?: string;
  /** Texto en negociable. */
  offerText?: string;
  /** Grados máximos de inclinación (12 = como el Index; 0 = sin inclinar). */
  tilt?: number;
  /** La foto crece para llenar el alto (cuando le das `height`). */
  fillMedia?: boolean;
  width?: number | string;
  height?: number | string;
  liked?: boolean;
  onLikeChange?: (liked: boolean) => void;
  onClick?: () => void;
  /** Condición del bien: pill extra (basic, seminuevo, operativo, inoperativo, siniestrado). */
  condition?: Condition | Condition[];
  /** Cómo se muestra «Recibe propuestas» en tone="negotiable". "pill" = badge sobre la foto (opción 1). "texto" = sin badge; el texto de abajo dice «Recibe propuestas» (opción 2). */
  offerStyle?: "pill" | "texto";
  /** Dónde va la condición: "foto" = pill sobre la foto; "texto" = bajo el título (Basic siempre va en la foto). */
  conditionIn?: "foto" | "texto";
};

export function FeaturedCard({
  image, title, subtitle, tone = "live", featured = false, live = tone === "live", photos, chips = [], stats = [],
  offerStyle = "pill", priceLabel = "Precio base", price, offerText = offerStyle === "texto" ? "Recibe propuestas" : "Haz tu oferta", tilt = 12, fillMedia = false,
  width = "100%", height = "auto", liked, onLikeChange, onClick, condition, conditionIn = "foto",
}: FeaturedCardProps): JSX.Element {
  // Publicación de usuario (basic): siempre «Recibe propuestas».
  const conds: Condition[] = condition ? (Array.isArray(condition) ? condition : [condition]) : [];
  if (conds.includes("basic")) { tone = "negotiable"; live = false; }
  const condInText: Condition[] = conditionIn === "texto" ? conds.filter((c) => c !== "basic") : [];
  const condInPhoto = conds.filter((c) => !condInText.includes(c));
  const [likedLocal, setLikedLocal] = useState(false);
  const isLiked = liked ?? likedLocal;
  const toggleLike = () => { const v = !isLiked; setLikedLocal(v); onLikeChange?.(v); };

  // El foil y el reflejo siguen al puntero (--mx, --my) y la carta se inclina hacia él (--rx, --ry).
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${Math.round(x * 100)}%`); el.style.setProperty("--my", `${Math.round(y * 100)}%`);
    el.style.setProperty("--rx", `${((0.5 - y) * tilt * 0.83).toFixed(2)}deg`); el.style.setProperty("--ry", `${((x - 0.5) * tilt).toFixed(2)}deg`);
  };
  const onLeave = (e: PointerEvent<HTMLElement>) => { for (const k of ["--mx", "--my", "--rx", "--ry"]) e.currentTarget.style.removeProperty(k); };

  return (
    <article className={`vfc vfc--${tone}`} style={{ width, height } as CSSProperties} aria-label={`${title}${subtitle ? ` · ${subtitle}` : ""}`}
      onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick}>
      <div className="vfc-media" style={fillMedia ? { flex: 1, minHeight: 120 } : undefined}>
        <img src={image} alt="" />
        <span className="vfc-pills">
          {featured ? <span className="vfc-pill vfc-pill--featured">{PillIcons.star}Destacado</span> : null}
          {tone === "live" ? (live ? <span className="vfc-pill vfc-pill--live">{PillIcons.live}En vivo</span> : null)
            : offerStyle === "pill" ? <span className="vfc-pill vfc-pill--negotiable">{PillIcons.tag}Recibe propuestas</span> : null}
          {condInPhoto.map((c) => <ConditionPill key={c} kind={c} />)}
        </span>
        <span className="vfc-likepos"><LikeButton name={title} on={isLiked} onToggle={toggleLike} /></span>
        {photos ? <span className="vfc-count">{PillIcons.camera}1/{photos}</span> : null}
        <span className="vfc-dots" aria-hidden><i /><i /><i /><i /></span>
      </div>
      <div className="vfc-body" style={fillMedia ? { flex: "none" } : undefined}>
        <div><p className="vfc-name">{title}</p>{subtitle ? <p className="vfc-sub">{subtitle}</p> : null}{condInText.length ? <span className="vfc-cond">{condInText.map((c) => <ConditionPill key={c} kind={c} />)}</span> : null}</div>
        {chips.length ? <div className="vfc-chips">{chips.map((c) => <span key={c.label} className="vfc-chip">{c.icon}{c.label}</span>)}</div> : null}
        {stats.length ? <div className="vfc-stats">{stats.map((s) => <span key={s.label}>{s.icon}{s.label}</span>)}</div> : null}
        <span className="vfc-spacer" />
        {tone === "live"
          ? <div className="vfc-pricerow"><SubasCoin size={28} /><div><p className="vfc-label">{priceLabel}</p><p className="vfc-price">{price ?? "Por definir"}</p></div></div>
          : <span className="vfc-offer">{PillIcons.hands}{offerText}</span>}
      </div>
      <LightBar tone={tone} />
      <span className="vfc-holo" aria-hidden />
      <span className="vfc-glare" aria-hidden />
    </article>
  );
}

export default FeaturedCard;
