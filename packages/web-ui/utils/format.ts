import { MONTH_NAMES } from "./months";
import { faroeParts } from "./time";

const LOCALE = "fo";

/** "1.234.567" */
export function formatNumber(n: number) {
  return n.toLocaleString(LOCALE);
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatShare(part: number, total: number) {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : "0%";
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

const longFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "always" });
const shortFormat = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: "always",
  style: "short",
});
const autoFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/** "31 min. síðan", "12 tímar síðan" */
export function timeAgo(date: string | Date) {
  const { value, unit } = distanceFromNow(date);
  const format = unit === "minute" || unit === "second" ? shortFormat : longFormat;
  return format.format(value, unit);
}

/** "12 tímar síðan", "Í gjár", "3 ár síðan" */
export function relativeTime(date: string | Date) {
  const { value, unit } = distanceFromNow(date);
  return capitalize(autoFormat.format(value, unit));
}

const pad = (n: number) => String(n).padStart(2, "0");
const shortMonth = (month: number) => MONTH_NAMES[month - 1].slice(0, 3);

// Everything below is in Faroese time.

/** "11:55" */
export function clockTime(date: string | Date) {
  const p = faroeParts(date);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** "11. okt", with the year added when it isn't the current one */
export function shortDate(date: string | Date) {
  const p = faroeParts(date);
  return p.year === faroeParts(new Date()).year
    ? `${p.day}. ${shortMonth(p.month)}`
    : `${p.day}. ${shortMonth(p.month)} ${p.year}`;
}

/** "11. okt, 11:55", with the year added when it isn't the current one */
export function playTime(date: string | Date) {
  return `${shortDate(date)}, ${clockTime(date)}`;
}

/** "11. okt 2025 kl. 11:55" */
export function fullDateTime(date: string | Date) {
  const p = faroeParts(date);
  return `${p.day}. ${shortMonth(p.month)} ${p.year} kl. ${clockTime(date)}`;
}

/** "oktober 2025" */
export function monthYear(date: string | Date) {
  const p = faroeParts(date);
  return `${MONTH_NAMES[p.month - 1]} ${p.year}`;
}

// Feminine forms, to agree with "støð" (station).
const numberWords = [
  "null", "ein", "tvær", "tríggjar", "fýra", "fimm",
  "seks", "sjey", "átta", "níggju", "tíggju",
];

export function countWord(n: number) {
  return numberWords[n] ?? formatNumber(n);
}
