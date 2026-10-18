import * as styles from "@/styles/play-calendar.css";
import * as ui from "@/styles/ui.css";
import { formatNumber } from "@/utils/format";
import { strings } from "@/utils/strings";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", ""];

type Level = keyof typeof styles.cell;

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

function tooltip(count: number, day: Date) {
  const date = day.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const plays = count === 1 ? strings.play : strings.playsLabel;
  return `${count === 0 ? "No" : formatNumber(count)} ${plays} · ${date}`;
}

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

  const days: { key: string; date: Date; count: number; level: Level }[] = [];
  const monthColumns: { label: string; column: number }[] = [];
  let total = 0;

  for (let t = start.getTime(), i = 0; t <= lastSunday; t += DAY_MS, i++) {
    const date = new Date(t);
    const key = toKey(date);
    const inRange = key >= firstDay && key <= today;
    const count = daily[key] ?? 0;
    if (inRange) total += count;
    days.push({ key, date, count, level: inRange ? levelFor(levels, count) : "none" });
    if (inRange && (date.getUTCDate() === 1 || key === firstDay)) {
      monthColumns.push({
        label: MONTHS[date.getUTCMonth()],
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
  const summary = strings.playsInPastYear(formatNumber(total), total === 1);

  return (
    <>
      <div className={ui.sectionHeader}>
        <h2 className={ui.sectionTitle}>{strings.playsPerDay}</h2>
        <span className={ui.aside}>{summary}</span>
      </div>
      <div className={styles.scroller}>
        <div className={styles.body}>
          <div className={styles.months} style={columns} aria-hidden>
            {monthColumns.map(({ label, column }) => (
              <span
                key={column}
                className={styles.monthLabel}
                style={{ gridColumn: column, gridRow: 1 }}
              >
                {label}
              </span>
            ))}
          </div>
          <div className={styles.weekdays} aria-hidden>
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div
            className={styles.cells}
            style={columns}
            role="img"
            aria-label={summary}
          >
            {days.map(({ key, date, count, level }) =>
              level === "none" ? (
                <div key={key} className={styles.cell.none} />
              ) : (
                <div
                  key={key}
                  className={`${styles.cell[level]} ${styles.hoverable}`}
                  title={tooltip(count, date)}
                />
              )
            )}
          </div>
        </div>
      </div>
      <div className={styles.legend}>
        <span>{strings.playsPerDayLegend}</span>
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
