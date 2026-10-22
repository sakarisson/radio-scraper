import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
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
export async function StationLink({ station }: { station: string }) {
  const lang = await getLang();
  return (
    <Link href={routes(lang).station(station)} className={ui.stationLabel}>
      <StationDot station={station} />
      {stationName(station)}
    </Link>
  );
}
