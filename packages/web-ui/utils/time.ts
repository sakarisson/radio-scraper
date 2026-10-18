/**
 * All dates on the site are shown in Faroese time, whatever the server's or
 * the visitor's time zone is.
 */
export const FAROE_TZ = "Atlantic/Faroe";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: FAROE_TZ,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

export type FaroeParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Calendar and clock fields of `date` as seen in the Faroe Islands. */
export function faroeParts(date: string | Date): FaroeParts {
  const parts: Record<string, number> = {};
  for (const p of partsFormatter.formatToParts(new Date(date))) {
    if (p.type !== "literal") parts[p.type] = Number(p.value);
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** UTC ISO timestamp of midnight on the 1st of the month, Faroese time. */
export function faroeMonthStart(year: number, month: number) {
  const utcMidnight = Date.UTC(year, month - 1, 1);
  // Offset of Faroese time from UTC at that moment (0 or +1 hour).
  // Clocks change at 01:00 UTC on a Sunday, never on the 1st at midnight.
  const p = faroeParts(new Date(utcMidnight));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const offset = asUtc - utcMidnight;
  return new Date(utcMidnight - offset).toISOString();
}
