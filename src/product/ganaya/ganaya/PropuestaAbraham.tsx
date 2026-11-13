"use client";

/** Propuesta Abraham (12/11): misma ficha y mismo flujo Gana Ya, con la jerarquía y el copy de la
 *  investigación (docs/ganaya/PROPUESTA-ABRAHAM.md). Prototipo local; reglas de disponibilidad y costos son
 *  supuestos a validar con negocio, no reglas comerciales. */
import { useId } from "react";
import DetailCard from "@/src/product/ganaya/ganaya-reference/DetailCard";
import PriceIcon from "@/src/product/ganaya/ganaya-concorde/components/PriceIcon";
import GanaYaButton from "./GanaYaButton";
import { useWallet, balanceOf } from "./wallet";
import styles from "./PropuestaAbraham.module.css";

type PropuestaEstado = "disponible" | "iniciada";

export default function PropuestaAbraham({ variante = "separado", estado, price, base, fee, start, liked, onLikeChange, onGanaYa, onParticipate }: {
  variante?: "separado" | "juntos" | "minima"; estado: PropuestaEstado; price: string; base: string; fee: number; start: string;
  liked: boolean; onLikeChange: (v: boolean) => void;
  onGanaYa: () => void; onParticipate: () => void;
}) {
  const uid = useId();
  const wallet = useWallet();
  const balance = balanceOf(wallet);
  const faltan = Math.max(0, fee - balance);
  const head = { variant: "live" as const, startLabel: "Inicia", day: "LUNES 30", time: "10:04 am", views: 617, likes: liked ? 12 : 11, participants: 2, liked, onLikeChange, bannerText: "" };

  if (estado === "iniciada") return <div className={styles.stack}>
    <p className={styles.notice} role="status">Gana Ya ya no está disponible porque la subasta empezó.</p>
    <DetailCard {...head} startLabel="Inició" title="Subasta en vivo" ctaLabel="Participa" price={base} commission="Sin comisión" onParticipate={onParticipate} />
  </div>;

  /* Variante «botones juntos» (/ganaya/propuesta-abraham-juntos): mismo contenido, reordenado.
   * Opciones lado a lado para comparar → frase → botones agrupados en el mismo orden → una nota con saldo y plazo. */
  /* Variante «mínima» (/ganaya/propuesta-abraham-minima): los botones SON las opciones (patrón de selector de tarifa).
   * Cada uno dice acción + precio + una pista; la explicación queda detrás de «¿Qué es Gana Ya?» (revelación progresiva). */
  if (variante === "minima") return <div className={styles.card}>
    <DetailCard {...head} className={styles.headOnly} />
    <div className={`${styles.body} ${styles.minima}`}>
      <h2 className={styles.question}>¿Cómo quieres comprarlo?</h2>
      <div className={styles.tiles}>
        <GanaYaButton onClick={onGanaYa} className={styles.tileGy} aria-describedby={uid + "-gy-note"}>
          <span className={styles.tileText}><b>Gana Ya</b><small>Compra inmediata</small></span>
          <span className={styles.tilePrice}>{price}</span>
        </GanaYaButton>
        <button type="button" className={styles.tile} onClick={onParticipate}>
          <span className={styles.tileIcon} aria-hidden="true"><PriceIcon size="md" /></span>
          <span className={styles.tileText}><b>Participa</b><small>Subasta · precio base</small></span>
          <span className={styles.tilePrice}>{base}</span>
        </button>
      </div>
      <p id={uid + "-gy-note"} className={`${styles.deadline} ${faltan ? styles.warn : ""}`}>
        {faltan ? <>Te faltan &gt;S&lt; {faltan} para Gana Ya</> : <>Fee Gana Ya &gt;S&lt; {fee} · hasta el {start}</>}
      </p>
      <details className={styles.more}>
        <summary>¿Qué es Gana Ya?</summary>
        <p>Asegura tu oportunidad de compra a precio fijo, sin competir en la subasta.</p>
      </details>
    </div>
  </div>;

  if (variante === "juntos") return <div className={styles.card}>
    <DetailCard {...head} className={styles.headOnly} />
    <div className={styles.body}>
      <div className={styles.compare}>
        <section id={uid + "-gy"} className={`${styles.choice} ${styles.choiceGy}`} aria-label="Compra inmediata">
          <h2 className={styles.kicker}>Compra inmediata</h2>
          <p className={styles.amount}>{price}</p>
          <p className={styles.choiceMeta}><span>Precio fijo</span><span>Fee &gt;S&lt; {fee}</span></p>
        </section>
        <section id={uid + "-sub"} className={styles.choice} aria-label="Subasta en vivo">
          <h2 className={styles.kicker}>Subasta en vivo</h2>
          <p className={styles.amount}>{base}</p>
          <p className={styles.choiceMeta}><span>Precio base</span><span>Sin comisión</span></p>
        </section>
      </div>
      <p id={uid + "-gy-desc"} className={styles.desc}>Asegura tu oportunidad de compra a precio fijo, sin competir en la subasta.</p>
      <div className={styles.actions}>
        <GanaYaButton onClick={onGanaYa} aria-describedby={uid + "-gy " + uid + "-gy-desc " + uid + "-gy-note"} className={styles.primary} />
        <button type="button" className={styles.secondary} onClick={onParticipate} aria-describedby={uid + "-sub"}>Participa en la subasta</button>
      </div>
      <p id={uid + "-gy-note"} className={styles.deadline}>
        <span className={faltan ? styles.warn : undefined}>Tu saldo &gt;S&lt; {balance}{faltan ? ` · te faltan >S< ${faltan}` : " · alcanza"}</span><br />
        Gana Ya disponible hasta el {start}.
      </p>
    </div>
  </div>;

  return <div className={styles.card}>
    <DetailCard {...head} className={styles.headOnly} />
    <div className={styles.body}>
      <section className={styles.option} aria-labelledby={uid + "-gy"}>
        <h2 id={uid + "-gy"} className={styles.kicker}>Compra inmediata</h2>
        <GanaYaButton price={price} onClick={onGanaYa} aria-describedby={uid + "-gy-desc " + uid + "-gy-cost"} className={styles.primary} />
        <p id={uid + "-gy-desc"} className={styles.desc}>Asegura tu oportunidad de compra a precio fijo, sin competir en la subasta.</p>
        <dl id={uid + "-gy-cost"} className={styles.costs}>
          <div><dt>Fee de habilitación</dt><dd>&gt;S&lt; {fee}</dd></div>
          <div><dt>Tu saldo</dt><dd className={faltan ? styles.warn : styles.ok}>&gt;S&lt; {balance}{faltan ? ` · te faltan >S< ${faltan}` : " · alcanza"}</dd></div>
        </dl>
        <p className={styles.deadline}>Disponible hasta que inicie la subasta: {start}.</p>
      </section>

      <div className={styles.divider} role="separator"><span>o</span></div>

      <section className={styles.option} aria-labelledby={uid + "-sub"}>
        <h2 id={uid + "-sub"} className={styles.kicker}>Subasta en vivo</h2>
        <p className={styles.base}>Precio base <b>{base}</b> · Sin comisión</p>
        <button type="button" className={styles.secondary} onClick={onParticipate}>Participa en la subasta</button>
      </section>
    </div>
  </div>;
}
