import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { SkeletonBlock, SkeletonRows } from "../components/Skeleton";

export default function Loading() {
  return (
    <section className={ui.intro.page}>
      <span className={ui.eyebrow}>{strings.stationsTitle}</span>
      <SkeletonBlock width="min(700px, 100%)" height={112} />
      <div style={{ padding: "56px 0 24px" }}>
        <SkeletonBlock height={8} />
      </div>
      <SkeletonRows count={4} height={60} padding={32} />
    </section>
  );
}
