import * as styles from "@/styles/play-calendar.css";
import * as ui from "@/styles/ui.css";
import { formatNumber } from "@/utils/format";
import type { Lang } from "@/utils/i18n";
import { MONTH_NAMES } from "@/utils/months";
import { strings } from "@/utils/strings";
import { T } from "./T";
import { CalendarCells, type Level } from "./CalendarCells";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS: Record<Lang, string[]> = {
  en: ["Mon", "", "Wed", "", "Fri", "", ""],
  fo: ["mán", "", "mik", "", "frí", "", ""],
};

type Levels = { level: Level; label: string; min: number }[];

// Fixed thresholds (rather than relative to each page's busiest day) so that
// colors mean the same thing on every song page, and on every artist page.
// Artists get a higher scale since their plays add up across all their songs.
const SCALES = {
  song: [
    { level: 4, label: "5+", min: 5 },
    { level: 3, label: "3–4", min: 3 },
    { level: 2, label: "2", min: 2 },
    { level: 1, label: "1", min: 1 },
  ],
  artist: [
    { level: 4, label: "10+", min: 10 },
    { level: 3, label: "6–9", min: 6 },
    { level: 2, label: "3–5", min: 3 },
    { level: 1, label: "1–2", min: 1 },
  ],
} satisfies Record<string, Levels>;

function levelFor(levels: Levels, count: number): Level {
  return levels.find((l) => count >= l.min)?.level ?? 0;
}

/** "YYYY-MM-DD" for an instant, as a date in the Faroe Islands. */
function faroeDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Faroe",
  }).format(new Date(date));
}

// Calendar dates are handled as UTC midnights so that day arithmetic is never
// shifted by the server's own time zone or by DST.
const toKey = (d: Date) => d.toISOString().slice(0, 10);
const fromKey = (key: string) => new Date(`${key}T00:00:00Z`);

/**
 * GitHub-style calendar of how often a song or artist was played each day over
 * the past year, one column per week (Monday to Sunday), ending today.
 */
export function PlayCalendar({
  daily,
  scale = "song",
}: {
  daily: Record<string, number>;
  scale?: keyof typeof SCALES;
}) {
  const levels: Levels = SCALES[scale];
  const today = faroeDate(new Date());
  const end = fromKey(today);
  const first = new Date(end);
  first.setUTCFullYear(first.getUTCFullYear() - 1);
  const firstDay = toKey(first);
  // Weeks start on Monday; getUTCDay() is 0 for Sunday.
  const start = new Date(first.getTime() - ((first.getUTCDay() + 6) % 7) * DAY_MS);
  const lastSunday = end.getTime() + ((7 - end.getUTCDay()) % 7) * DAY_MS;

  const days: { key: string; count: number; level: Level }[] = [];
  const monthColumns: { month: number; column: number }[] = [];
  let total = 0;

  for (let t = start.getTime(), i = 0; t <= lastSunday; t += DAY_MS, i++) {
    const date = new Date(t);
    const key = toKey(date);
    const inRange = key >= firstDay && key <= today;
    const count = daily[key] ?? 0;
    if (inRange) total += count;
    days.push({ key, count, level: inRange ? levelFor(levels, count) : "none" });
    if (inRange && (date.getUTCDate() === 1 || key === firstDay)) {
      monthColumns.push({
        month: date.getUTCMonth(),
        column: Math.floor(i / 7) + 1,
      });
    }
  }

  // Drop the label for a partial first month if it would collide with the next.
  if (monthColumns.length > 1 && monthColumns[1].column - monthColumns[0].column < 2) {
    monthColumns.shift();
  }

  const weeks = days.length / 7;
  const columns = { gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` };
  const summary = (lang: Lang) =>
    strings[lang].playsInPastYear(formatNumber(total, lang), total === 1);

  return (
    <>
      <div className={ui.sectionHeader}>
        <h2 className={ui.sectionTitle}>
          <T>{(s) => s.playsPerDay}</T>
        </h2>
        <span className={ui.aside}>
          <T>{(_, lang) => summary(lang)}</T>
        </span>
      </div>
      <div className={styles.scroller}>
        <div className={styles.body}>
          <div className={styles.months} style={columns} aria-hidden>
            {monthColumns.map(({ month, column }) => (
              <span
                key={column}
                className={styles.monthLabel}
                style={{ gridColumn: column, gridRow: 1 }}
              >
                <T>{(_, lang) => MONTH_NAMES[lang][month].slice(0, 3)}</T>
              </span>
            ))}
          </div>
          <div className={styles.weekdays} aria-hidden>
            {WEEKDAYS.fo.map((_, i) => (
              <span key={i}>
                <T>{(_, lang) => WEEKDAYS[lang][i]}</T>
              </span>
            ))}
          </div>
          <CalendarCells
            days={days}
            columns={columns}
            summary={{ fo: summary("fo"), en: summary("en") }}
          />
        </div>
      </div>
      <div className={styles.legend}>
        <span>
          <T>{(s) => s.playsPerDayLegend}</T>
        </span>
        {[...levels].reverse().map(({ level, label }) => (
          <span key={level} className={styles.legendItem}>
            <span className={`${styles.cell[level]} ${styles.legendSwatch}`} />
            {label}
          </span>
        ))}
      </div>
    </>
  );
}
