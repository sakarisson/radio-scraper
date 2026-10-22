import * as ui from "@/styles/ui.css";
import { ChartResultsSkeleton } from "./ChartResultsSkeleton";
import { SkeletonBlock } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <>
      <section className={ui.intro.page}>
        <span className={ui.eyebrow}>&nbsp;</span>
        <SkeletonBlock width={360} height={56} />
      </section>
      <section className={ui.section.md}>
        <ChartResultsSkeleton />
      </section>
    </>
  );
}
