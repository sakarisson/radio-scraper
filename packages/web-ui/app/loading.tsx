import * as styles from "@/styles/home.css";
import * as ui from "@/styles/ui.css";
import {
  SkeletonBlock,
  SkeletonRows,
  SkeletonSectionTitle,
} from "./components/Skeleton";

export default function Loading() {
  return (
    <>
      <section className={styles.hero}>
        <SkeletonBlock width="min(640px, 100%)" height={120} />
        <div className={ui.stats}>
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonBlock key={i} width={100} height={60} />
          ))}
        </div>
      </section>

      <section>
        <SkeletonSectionTitle />
        <div className={styles.stationCards}>
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonBlock key={i} height={120} />
          ))}
        </div>
      </section>

      <section className={styles.columns}>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i}>
            <SkeletonSectionTitle />
            <SkeletonRows count={5} height={36} padding={14} />
          </div>
        ))}
      </section>
    </>
  );
}
