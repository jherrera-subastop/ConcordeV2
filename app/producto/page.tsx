import Image from "next/image";
import Header from "@/app/_components/Header";
import catalog from "@/public/producto/registry.json";
import styles from "./catalog.module.css";
const previews: Record<string, number> = {index:6,"detalle-basic":3,"mi-garaje":2,publicacion:4,valorizacion:5,publicaciones:8,ganaya:0,"ganaya-vendedor":1};
export default function Page() {
  return <div className={styles.shell}>
    <div className={styles.navigation}><Header active="producto" /></div>
    <main className={styles.main}>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>VOYAGER × CONCORDE</p><h1>El producto, en un solo lugar.</h1><p className={styles.intro}>Explora las pantallas actuales de VMC y elige una base real para tu próximo diseño.</p><a className={styles.heroLink} href="#pantallas">Explorar pantallas <span aria-hidden="true">↓</span></a></div>
        <div className={styles.summary}><strong>{catalog.screens.length}</strong><span>pantallas de referencia</span><div>Desktop + mobile</div><small>Integración local · En revisión</small></div>
      </section>
      <section id="pantallas" aria-labelledby="screens-title">
        <div className={styles.sectionHeading}><div><h2 id="screens-title">Pantallas de producto</h2><p>Abre el flujo completo o compara sus tamaños.</p></div><a href="/producto/registry.json">Fuentes y versiones ↗</a></div>
        <div className={styles.grid}>{catalog.screens.map((screen, index) => <article className={styles.card} key={screen.id}>
          <a href={screen.route} className={styles.preview} aria-label={`Abrir ${screen.name}`}><div className={styles.browserBar}><span/><span/><span/><small>VMC · {screen.name}</small></div><Image src={`/producto/previews/${previews[screen.id]}.png`} alt={`Vista de referencia de ${screen.name}`} width={1440} height={900} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" loading={index<3?"eager":"lazy"}/><span className={styles.previewLabel}>Captura del prototipo</span></a>
          <div className={styles.cardBody}><div className={styles.cardTop}><span className={styles.number}>{String(index+1).padStart(2,"0")}</span><span className={styles.badge}>En revisión</span></div><h3>{screen.name}</h3><p className={styles.description}>{screen.useFor}</p><div className={styles.actions}><a className={styles.primary} href={screen.route}>Abrir pantalla <span aria-hidden="true">↗</span></a><a className={styles.secondary} href={`/producto/revisar?pantalla=${screen.id}`}>Comparar tamaños</a></div><details className={styles.details}><summary>Procedencia de esta versión</summary><p>{screen.source}</p><code>{screen.revision}</code></details></div>
        </article>)}</div>
      </section>
      <section className={styles.components}><div><p className={styles.eyebrow}>PIEZAS REUTILIZABLES</p><h2>Componentes de producto</h2><p>Incorporados con su fuente original. Aún pendientes de normalizar en el catálogo común.</p></div><div className={styles.componentList}>{catalog.components.map(c=><details key={c.name}><summary>{c.name}<span aria-hidden="true">＋</span></summary><code>{c.entry}</code></details>)}</div></section>
      <footer className={styles.note}><strong>Una referencia de diseño, no una operación real.</strong><p>Estas vistas conservan sus fuentes y estados de prototipo. Voyager define el sistema; Concorde reúne su implementación. Las versiones anteriores siguen disponibles en <a href="/blocks">Bloques</a>.</p></footer>
    </main>
  </div>;
}