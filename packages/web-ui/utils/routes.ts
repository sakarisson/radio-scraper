import { LANGS, type Lang } from "./i18n";

const SECTIONS = ["artists", "charts", "stations"] as const;
type Section = (typeof SECTIONS)[number];

const SECTION_PATHS: Record<Lang, Record<Section, string>> = {
  fo: { artists: "tonleikarar", charts: "listar", stations: "rasir" },
  en: { artists: "artists", charts: "charts", stations: "stations" },
};

const HOME: Record<Lang, string> = { fo: "/", en: "/en" };

export function routes(lang: Lang) {
  const paths = SECTION_PATHS[lang];
  const artist = (name: string) =>
    `/${paths.artists}/${encodeURIComponent(name)}`;
  return {
    home: HOME[lang],
    artists: `/${paths.artists}`,
    artist,
    song: (artistName: string, title: string) =>
      `${artist(artistName)}/${encodeURIComponent(title)}`,
    charts: `/${paths.charts}`,
    stations: `/${paths.stations}`,
    station: (slug: string) => `/${paths.stations}/${encodeURIComponent(slug)}`,
  };
}

function findSection(path: string) {
  for (const lang of LANGS) {
    for (const section of SECTIONS) {
      if (SECTION_PATHS[lang][section] === path) return { lang, section };
    }
  }
  return null;
}

// Unknown paths, including the internal ones, end up at the 404 page.
export function internalPath(pathname: string) {
  if (pathname === "/") return "/fo";
  if (pathname === "/en") return "/en";
  const [first, ...rest] = pathname.slice(1).split("/");
  const match = findSection(first);
  if (match === null) return `/fo${pathname}`;
  return ["", match.lang, match.section, ...rest].join("/");
}

function decode(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function pathInLang(segments: string[], lang: Lang) {
  const [section, ...rest] = segments;
  if (!SECTIONS.includes(section as Section)) return HOME[lang];
  return [
    "",
    SECTION_PATHS[lang][section as Section],
    ...rest.map((s) => encodeURIComponent(decode(s))),
  ].join("/");
}
