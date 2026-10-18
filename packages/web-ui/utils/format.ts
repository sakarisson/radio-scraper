import formatDistanceToNow from "date-fns/formatDistanceToNow";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import { MONTH_NAMES } from "./months";
import { faroeParts } from "./time";

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export function formatShare(part: number, total: number) {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : "0%";
}

/** "31 min ago", "12 hours ago" */
export function timeAgo(date: string | Date) {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true })
    .replace(/\bminutes?\b/, "min")
    .replace(/\bseconds?\b/, "sec");
}

/** "About 12 hours ago", "Almost 3 years ago" */
export function relativeTime(date: string | Date) {
  const s = formatDistanceToNow(new Date(date), { addSuffix: true });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const pad = (n: number) => String(n).padStart(2, "0");
const shortMonth = (month: number) => MONTH_NAMES[month - 1].slice(0, 3);

// Everything below is in Faroese time.

/** "11:55" */
export function clockTime(date: string | Date) {
  const p = faroeParts(date);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** "Oct 11, 11:55", with the year added when it isn't the current one */
export function playTime(date: string | Date) {
  const p = faroeParts(date);
  const day =
    p.year === faroeParts(new Date()).year
      ? `${shortMonth(p.month)} ${p.day}`
      : `${shortMonth(p.month)} ${p.day} ${p.year}`;
  return `${day}, ${clockTime(date)}`;
}

/** "Oct 11, 2025 at 11:55" */
export function fullDateTime(date: string | Date) {
  const p = faroeParts(date);
  return `${shortMonth(p.month)} ${p.day}, ${p.year} at ${clockTime(date)}`;
}

/** "October 2025" */
export function monthYear(date: string | Date) {
  const p = faroeParts(date);
  return `${MONTH_NAMES[p.month - 1]} ${p.year}`;
}

const numberWords = [
  "zero", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten",
];

export function countWord(n: number) {
  return numberWords[n] ?? formatNumber(n);
}
