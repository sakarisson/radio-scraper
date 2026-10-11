import * as ui from "@/styles/ui.css";
import { SkeletonBlock, SkeletonRows, SkeletonSectionTitle } from "./Skeleton";

/** Shared loading state for artist, song and station pages. */
export function DetailSkeleton() {
  return (
    <>
      <div className={ui.crumbs}>
        <SkeletonBlock width={80} height={18} />
      </div>
      <section className={ui.intro.detail}>
        <SkeletonBlock width="min(480px, 100%)" height={72} />
        <div className={ui.introStats}>
          <div className={ui.stats}>
            <SkeletonBlock width={100} height={60} />
            <SkeletonBlock width={100} height={60} />
          </div>
        </div>
      </section>
      <section className={ui.section.sm}>
        <SkeletonSectionTitle />
        <SkeletonBlock height={8} />
      </section>
      <section className={ui.section.lg}>
        <SkeletonSectionTitle />
        <SkeletonRows count={10} padding={14} />
      </section>
    </>
  );
}
