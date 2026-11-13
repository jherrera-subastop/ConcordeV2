import { Button } from "@/src/product/index/adapter";

import styles from "./HomeOpportunityHero.module.css";

type HomeOpportunityHeroProps = Readonly<{ imageSrc: string; imageAlt: string }>;

export default function HomeOpportunityHero({ imageSrc, imageAlt }: HomeOpportunityHeroProps) {
  return (
    <section className={styles.root} aria-labelledby="home-title" data-testid="home-featured-opportunity">
      <div className={styles.media} data-testid="home-featured-asset">
        <img src={imageSrc} alt={imageAlt} />
      </div>
      <div className={styles.mediaShade} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>VMC Subastas</p>
        <h1 id="home-title">Encuentra tu próxima oportunidad en subasta</h1>
        <p className={styles.description}>Vehículos, maquinaria, equipos y más. Explora lotes por modalidad, categoría o empresa.</p>
        <Button variant="primary">Explorar lotes</Button>
      </div>
      <span className={styles.mediaLabel}>Oportunidades reales, grandes resultados</span>
      <button className={`${styles.heroControl} ${styles.heroControlLeft}`} type="button" aria-label="Ver oportunidad anterior">‹</button>
      <button className={`${styles.heroControl} ${styles.heroControlRight}`} type="button" aria-label="Ver oportunidad siguiente">›</button>
      <ul className={styles.benefits} aria-label="Beneficios de VMC">
        <li>Activos verificados por empresas</li>
        <li>Proceso transparente y seguro</li>
        <li>Oportunidades todos los días</li>
      </ul>
    </section>
  );
}
