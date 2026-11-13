/** OfferTypeCards: tarjetas de tipo de oferta. Al pasar el mouse crecen, se desenfocan y muestran un botón.
 *  Solo depende de React y offer-type-cards.css. */
import type { CSSProperties, JSX, MouseEvent, ReactNode } from "react";
import "./offer-type-cards.css";

export type OfferTone = "live" | "negotiable";

/** Colores de cada modalidad. Para una modalidad nueva, pasa `colors` en el item con la misma forma. */
export const OFFER_COLORS: Record<OfferTone, { bg: string; shade: string; glow: string; ink: string }> = {
  negotiable: {
    bg: "linear-gradient(135deg, #12C6CF 0%, #2F8FD4 35%, #5A3FD8 70%, #3B1FA8 100%)",
    shade: "linear-gradient(90deg, rgba(0,150,160,0.96) 0%, rgba(40,120,205,0.82) 34%, rgba(95,60,215,0.25) 68%, rgba(95,60,215,0.05) 100%)",
    glow: "rgba(90,70,215,0.45)", ink: "#00777A",
  },
  live: {
    bg: "linear-gradient(135deg, #FFB25E 0%, #FF8F2E 30%, #EF6A1C 65%, #B83A00 100%)",
    shade: "linear-gradient(90deg, rgba(225,95,20,0.96) 0%, rgba(240,120,40,0.82) 34%, rgba(255,140,50,0.25) 68%, rgba(255,140,50,0.05) 100%)",
    glow: "rgba(255,130,40,0.45)", ink: "#C2410C",
  },
};

const LiveDot = () => <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>;
const TagIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>;

export type OfferTypeItem = {
  tone: OfferTone;
  /** Texto de la pill (p. ej. "Recibe ofertas"). */
  title: string;
  text: string;
  /** Texto del botón de vidrio que aparece al pasar el mouse. */
  cta: string;
  /** Foto del auto a la derecha (opcional: sin foto queda el degradado solo). */
  image?: string;
  href?: string;
  onClick?: () => void;
  /** Ícono propio para la pill (por defecto: punto en vivo o etiqueta). */
  icon?: ReactNode;
  /** Colores propios (por defecto los de `tone`). */
  colors?: Partial<(typeof OFFER_COLORS)[OfferTone]>;
};

export function OfferTypeCards({ items, className = "" }: { items: OfferTypeItem[]; className?: string }): JSX.Element {
  return (
    <div className={`vot${className ? ` ${className}` : ""}`}>
      <div className="vot__grid">
        {items.map((t) => {
          const c = { ...OFFER_COLORS[t.tone], ...t.colors };
          const click = (e: MouseEvent<HTMLAnchorElement>) => { if (t.onClick) { if (!t.href) e.preventDefault(); t.onClick(); } };
          return (
            <a key={t.title} href={t.href ?? "#"} onClick={click} className="vot__card" aria-label={`${t.title}: ${t.cta}`}
              style={{ background: c.bg, "--vot-glow": c.glow, "--vot-ink": c.ink } as CSSProperties}>
              {t.image ? <>
                <span className="vot__img" aria-hidden><img src={t.image} alt="" /></span>
                <span className="vot__shade" aria-hidden style={{ background: c.shade }} />
              </> : null}
              <span className="vot__light" aria-hidden />
              <span className="vot__body">
                <span className="vot__pill">{t.icon ?? (t.tone === "live" ? <LiveDot /> : <TagIcon />)}{t.title}</span>
                <span className="vot__text">{t.text}</span>
              </span>
              <span className="vot__cta" aria-hidden>{t.cta}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default OfferTypeCards;
