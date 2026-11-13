import { Button } from "@/src/product/index/adapter";

import styles from "./HomeCampaignBanner.module.css";

export default function HomeCampaignBanner({ imageSrc }: Readonly<{ imageSrc: string }>) {
  return (
    <section className={styles.root} aria-label="Descubre lotes de maquinaria">
      <div className={styles.copy}>
        <p>DESCUBRE MÁS</p>
        <h2>Maquinaria que mueve tu negocio</h2>
        <span>Equipos industriales, vehículos y más de empresas confiables en un solo lugar.</span>
        <Button variant="primary">Ver lotes de maquinaria</Button>
      </div>
      <div className={styles.media}><img src={imageSrc} alt="Maquinaria de ejemplo" /></div>
      <ul className={styles.points}>
        <li>Activos de empresas de confianza</li>
        <li>Equipos verificados y listos para operar</li>
        <li>Oportunidades para hacer crecer tu negocio</li>
      </ul>
    </section>
  );
}
