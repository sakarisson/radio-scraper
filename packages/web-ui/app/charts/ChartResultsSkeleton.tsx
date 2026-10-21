import * as styles from "@/styles/charts.css";
import * as ui from "@/styles/ui.css";
import { T } from "../components/T";
import { SkeletonRows } from "../components/Skeleton";

export function ChartResultsSkeleton() {
  return (
    <div className={styles.columns}>
      {(["topArtists", "topSongs"] as const).map((key) => (
        <div key={key}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>
              <T>{(s) => s[key]}</T>
            </h2>
          </div>
          <SkeletonRows count={10} height={36} />
        </div>
      ))}
    </div>
  );
}
