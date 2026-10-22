import * as styles from "@/styles/artists.css";
import * as ui from "@/styles/ui.css";
import {
  SkeletonBlock,
  SkeletonRows,
  SkeletonSectionTitle,
} from "@/app/components/Skeleton";
import { getLang } from "@/utils/lang";
import { strings } from "@/utils/strings";

export default async function Loading() {
  const s = strings[await getLang()];
  return (
    <>
      <section className={ui.intro.page}>
        <span className={ui.eyebrow}>{s.artists}</span>
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
