import * as ui from "@/styles/ui.css";
import { SkeletonBlock, SkeletonRows } from "@/app/components/Skeleton";
import { getLang } from "@/utils/lang";
import { strings } from "@/utils/strings";

export default async function Loading() {
  const s = strings[await getLang()];
  return (
    <section className={ui.intro.page}>
      <span className={ui.eyebrow}>{s.stationsTitle}</span>
      <SkeletonBlock width="min(700px, 100%)" height={112} />
      <div style={{ padding: "56px 0 24px" }}>
        <SkeletonBlock height={8} />
      </div>
      <SkeletonRows count={4} height={60} padding={32} />
    </section>
  );
}
