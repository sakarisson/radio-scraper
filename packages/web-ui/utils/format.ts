import type { Lang } from "./i18n";
import { MONTH_NAMES } from "./months";
import { faroeParts } from "./time";

/** "1,234,567" in English, "1.234.567" in Faroese */
export function formatNumber(n: number, lang: Lang) {
  return n.toLocaleString(lang);
}

export function formatShare(part: number, total: number) {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : "0%";
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

/** The largest whole unit that fits the distance from now to `date`. */
function distanceFromNow(date: string | Date) {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  const [unit, size] =
    UNITS.find(([, size]) => Math.abs(seconds) >= size) ?? UNITS[UNITS.length - 1];
  return { value: Math.round(seconds / size), unit };
}

const relativeFormats = (lang: Lang) => ({
  long: new Intl.RelativeTimeFormat(lang, { numeric: "always" }),
  short: new Intl.RelativeTimeFormat(lang, { numeric: "always", style: "short" }),
  auto: new Intl.RelativeTimeFormat(lang, { numeric: "auto" }),
});
const RELATIVE = { en: relativeFormats("en"), fo: relativeFormats("fo") };

/** "31 min. ago", "12 hours ago" / "31 min. síðan", "12 tímar síðan" */
export function timeAgo(date: string | Date, lang: Lang) {
  const { value, unit } = distanceFromNow(date);
  const style = unit === "minute" || unit === "second" ? "short" : "long";
  return RELATIVE[lang][style].format(value, unit);
}

/** "Yesterday", "3 years ago" / "Í gjár", "3 ár síðan" */
export function relativeTime(date: string | Date, lang: Lang) {
  const { value, unit } = distanceFromNow(date);
  return capitalize(RELATIVE[lang].auto.format(value, unit));
}

const pad = (n: number) => String(n).padStart(2, "0");
const shortMonth = (month: number, lang: Lang) =>
  MONTH_NAMES[lang][month - 1].slice(0, 3);

// Everything below is in Faroese time.

/** "11:55" */
export function clockTime(date: string | Date) {
  const p = faroeParts(date);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * "Oct 11" / "11. okt", with the year added when it isn't the current one
 */
export function shortDate(date: string | Date, lang: Lang) {
  const p = faroeParts(date);
  const month = shortMonth(p.month, lang);
  const dayMonth = lang === "fo" ? `${p.day}. ${month}` : `${month} ${p.day}`;
  return p.year === faroeParts(new Date()).year
    ? dayMonth
    : `${dayMonth} ${p.year}`;
}

/** "Oct 11, 11:55" / "11. okt, 11:55" */
export function playTime(date: string | Date, lang: Lang) {
  return `${shortDate(date, lang)}, ${clockTime(date)}`;
}

/** "Oct 11, 2025 at 11:55" / "11. okt 2025 kl. 11:55" */
export function fullDateTime(date: string | Date, lang: Lang) {
  const p = faroeParts(date);
  const month = shortMonth(p.month, lang);
  return lang === "fo"
    ? `${p.day}. ${month} ${p.year} kl. ${clockTime(date)}`
    : `${month} ${p.day}, ${p.year} at ${clockTime(date)}`;
}

/** "October 2025" / "oktober 2025" */
export function monthYear(date: string | Date, lang: Lang) {
  const p = faroeParts(date);
  return `${MONTH_NAMES[lang][p.month - 1]} ${p.year}`;
}

const NUMBER_WORDS: Record<Lang, string[]> = {
  en: [
    "zero", "one", "two", "three", "four", "five",
    "six", "seven", "eight", "nine", "ten",
  ],
  // Feminine forms, to agree with "rás" (station).
  fo: [
    "null", "ein", "tvær", "tríggjar", "fýra", "fimm",
    "seks", "sjey", "átta", "níggju", "tíggju",
  ],
};

export function countWord(n: number, lang: Lang) {
  return NUMBER_WORDS[lang][n] ?? formatNumber(n, lang);
}
