import { vars } from "@/styles/theme.css";

// Display name and color hue per station slug. The order here is the order
// stations are listed in.
const stations: Record<string, { name: string; hue: number }> = {
  ras2: { name: "Rás 2", hue: 20 },
  kvf: { name: "KVF", hue: 245 },
  kvf2: { name: "KVF2", hue: 175 },
  sjey: { name: "SJEY", hue: 95 },
  nordlysid: { name: "Norðlýsið", hue: 320 },
  fm987: { name: "FM98,7", hue: 135 },
};

const order = Object.keys(stations);

/** The station's proper name, e.g. "nordlysid" → "Norðlýsið". Falls back to the slug. */
export function stationName(slug: string) {
  return stations[slug]?.name ?? slug;
}

export function stationColor(slug: string) {
  const hue = stations[slug]?.hue;
  return hue === undefined ? vars.color.muted : `oklch(0.68 0.1 ${hue})`;
}

export function compareStations(a: string, b: string) {
  const ai = order.indexOf(a);
  const bi = order.indexOf(b);
  if (ai === -1 && bi === -1) return a.localeCompare(b);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
}

// A station whose latest play is older than this is probably not being
// scraped right now, so it is shown dimmed.
const STALE_AFTER_MS = 3 * 60 * 60 * 1000;

export function isStale(lastPlayed: string) {
  return Date.now() - new Date(lastPlayed).getTime() > STALE_AFTER_MS;
}
