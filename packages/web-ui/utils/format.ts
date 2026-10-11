import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";

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

/** "Oct 11, 11:55", with the year added when it isn't the current one */
export function playTime(date: string | Date) {
  const d = new Date(date);
  return d.getFullYear() === new Date().getFullYear()
    ? format(d, "MMM d, HH:mm")
    : format(d, "MMM d yyyy, HH:mm");
}

export function clockTime(date: string | Date) {
  return format(new Date(date), "HH:mm");
}

const numberWords = [
  "zero", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten",
];

export function countWord(n: number) {
  return numberWords[n] ?? formatNumber(n);
}
