import { BadgeStatus, CardTitle } from "@/src/product/index/adapter";

import styles from "./ActivityFeedPanel.module.css";

type ActivityItem = Readonly<{
  status: "live" | "proxima";
  label: string;
  title: string;
  detail: string;
  imageSrc: string;
}>;

export default function ActivityFeedPanel({ items }: Readonly<{ items: readonly ActivityItem[] }>) {
  return (
    <aside className={styles.root} aria-label="Actividad de la plataforma" data-testid="home-activity">
      <div className={styles.heading}>
        <CardTitle title="Actividad de la plataforma" subtitle="Lo que está pasando ahora" titleSize={15} subtitleSize={12} />
      </div>
      <ol className={styles.feed}>
        {items.map((item) => (
          <li className={styles.item} key={item.title}>
            <img src={item.imageSrc} alt="" />
            <div className={styles.itemCopy}>
              <span className={styles.status}><BadgeStatus variant={item.status} label={item.label} /></span>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
