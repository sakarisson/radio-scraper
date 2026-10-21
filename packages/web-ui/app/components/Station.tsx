import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { stationColor, stationName } from "@/utils/stations";

export function StationDot({
  station,
  size = "xs",
}: {
  station: string;
  size?: keyof typeof ui.dot;
}) {
  return (
    <span
      className={ui.dot[size]}
      style={{ background: stationColor(station) }}
      aria-hidden
    />
  );
}

/** Small muted "● KVF" label linking to the station. */
export function StationLink({ station }: { station: string }) {
  return (
    <Link href={`/stations/${station}`} className={ui.stationLabel}>
      <StationDot station={station} />
      {stationName(station)}
    </Link>
  );
}
