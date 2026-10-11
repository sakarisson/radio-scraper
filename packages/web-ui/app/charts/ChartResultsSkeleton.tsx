import * as styles from "@/styles/charts.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { SkeletonRows } from "../components/Skeleton";

export function ChartResultsSkeleton() {
  return (
    <div className={styles.columns}>
      {[strings.topArtists, strings.topSongs].map((title) => (
        <div key={title}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{title}</h2>
          </div>
          <SkeletonRows count={10} height={36} />
        </div>
      ))}
    </div>
  );
}
