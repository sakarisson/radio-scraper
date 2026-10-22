import * as styles from "@/styles/charts.css";
import * as ui from "@/styles/ui.css";
import { SkeletonRows } from "@/app/components/Skeleton";
import { getLang } from "@/utils/lang";
import { strings } from "@/utils/strings";

export async function ChartResultsSkeleton() {
  const s = strings[await getLang()];
  return (
    <div className={styles.columns}>
      {(["topArtists", "topSongs"] as const).map((key) => (
        <div key={key}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>
              {s[key]}
            </h2>
          </div>
          <SkeletonRows count={10} height={36} />
        </div>
      ))}
    </div>
  );
}
