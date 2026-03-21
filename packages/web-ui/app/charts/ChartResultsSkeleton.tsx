import * as styles from "@/styles/charts.css";
import * as skeleton from "@/styles/loading.css";
import { strings } from "@/utils/strings";

function SkeletonRankedList({ count }: { count: number }) {
  return (
    <div className={styles.rankedList}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.rankedItem}>
          <span className={styles.rankNumber} style={{ opacity: 0.3 }}>
            {i + 1}
          </span>
          <div className={styles.rankInfo}>
            <div
              className={skeleton.skeletonRow}
              style={{
                width: `${55 + Math.round(Math.sin(i * 2.3) * 25)}%`,
                marginBottom: 0,
              }}
            />
          </div>
          <div
            className={skeleton.skeletonCell}
            style={{ width: "48px", flexShrink: 0 }}
          />
        </div>
      ))}
    </div>
  );
}

export function ChartResultsSkeleton() {
  return (
    <div className={styles.listsGrid}>
      <div className={styles.listSection}>
        <h2 className={styles.listHeading}>{strings.topArtists}</h2>
        <SkeletonRankedList count={10} />
      </div>
      <div className={styles.listSection}>
        <h2 className={styles.listHeading}>{strings.topSongs}</h2>
        <SkeletonRankedList count={10} />
      </div>
    </div>
  );
}
