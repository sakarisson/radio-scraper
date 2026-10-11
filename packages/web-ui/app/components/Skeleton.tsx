import * as skeleton from "@/styles/loading.css";
import * as ui from "@/styles/ui.css";

export function SkeletonBlock({
  width = "100%",
  height,
}: {
  width?: number | string;
  height: number | string;
}) {
  return <div className={skeleton.block} style={{ width, height }} />;
}

/** Varied but stable widths so skeleton rows don't look like a barcode. */
function rowWidth(i: number) {
  return `${55 + Math.round(Math.sin(i * 2.3) * 25)}%`;
}

export function SkeletonRows({
  count,
  height = 18,
  padding = 18,
}: {
  count: number;
  height?: number;
  padding?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={ui.row} style={{ padding: `${padding}px 0` }}>
          <div
            className={skeleton.block}
            style={{ width: rowWidth(i), height }}
          />
        </div>
      ))}
    </>
  );
}

export function SkeletonSectionTitle() {
  return (
    <div className={ui.sectionHeader}>
      <SkeletonBlock width={120} height={18} />
    </div>
  );
}
