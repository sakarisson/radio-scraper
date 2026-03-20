import { badge } from "@/styles/station-badge.css";

const knownStations = new Set(Object.keys(badge).filter((k) => k !== "default"));

export function StationBadge({ station }: { station: string }) {
  const key = knownStations.has(station) ? station : "default";
  return <span className={badge[key]}>{station}</span>;
}
