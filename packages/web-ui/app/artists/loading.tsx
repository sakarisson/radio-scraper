import * as styles from "@/styles/artists.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import {
  SkeletonBlock,
  SkeletonRows,
  SkeletonSectionTitle,
} from "../components/Skeleton";

export default function Loading() {
  return (
    <>
      <section className={ui.intro.page}>
        <span className={ui.eyebrow}>{strings.artists}</span>
        <SkeletonBlock width={360} height={56} />
      </section>
      <section className={ui.section.md}>
        <SkeletonSectionTitle />
        <div className={styles.trendingGrid}>
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonBlock key={i} height={126} />
          ))}
        </div>
      </section>
      <section className={ui.section.lg}>
        <SkeletonSectionTitle />
        <div className={styles.leaderboard}>
          <div>
            <SkeletonRows count={8} padding={16} />
          </div>
          <div>
            <SkeletonRows count={8} padding={16} />
          </div>
        </div>
      </section>
    </>
  );
}
