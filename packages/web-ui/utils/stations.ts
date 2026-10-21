import { vars } from "@/styles/theme.css";

const hues: Record<string, number> = {
  ras2: 20,
  kvf: 245,
  kvf2: 175,
  sjey: 95,
  nordlysid: 320,
  fm987: 135,
};

const order = Object.keys(hues);

export function stationColor(slug: string) {
  const hue = hues[slug];
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
