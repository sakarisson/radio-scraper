import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { stationColor } from "@/utils/stations";
import { formatNumber, formatShare } from "@/utils/format";
import { StationDot } from "./Station";
import { T } from "./T";

export function SplitBar({
  items,
}: {
  items: { station: string; playCount: number }[];
}) {
  return (
    <div className={ui.splitBar} aria-hidden>
      {items.map(({ station, playCount }) => (
        <div
          key={station}
          className={ui.splitSegment}
          style={{ flex: playCount, background: stationColor(station) }}
        />
      ))}
    </div>
  );
}

/** Proportional bar plus a legend, e.g. for an artist's plays per station. */
export function StationSplit({
  breakdown,
}: {
  breakdown: { station: string; playCount: number }[];
}) {
  const items = [...breakdown].sort((a, b) => b.playCount - a.playCount);
  const total = items.reduce((sum, s) => sum + s.playCount, 0);

  return (
    <>
      <SplitBar items={items} />
      <div className={ui.splitLegend}>
        {items.map(({ station, playCount }) => (
          <Link
            key={station}
            href={`/stations/${station}`}
            className={ui.splitLegendItem}
          >
            <StationDot station={station} size="sm" />
            <span className={ui.strong}>{station}</span>
            <span className={ui.muted}>
              <T>{(_, lang) => formatNumber(playCount, lang)}</T> &middot;{" "}
              {formatShare(playCount, total)}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
