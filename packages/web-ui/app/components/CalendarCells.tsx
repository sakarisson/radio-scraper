import * as styles from "@/styles/play-calendar.css";
import { formatNumber } from "@/utils/format";
import type { Lang } from "@/utils/i18n";
import { MONTH_NAMES } from "@/utils/months";
import { strings } from "@/utils/strings";

export type Level = keyof typeof styles.cell;

// Spelled out rather than left to Intl, since browsers don't all have
// Faroese date names.
const WEEKDAYS: Record<Lang, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fo: ["sun.", "mán.", "týs.", "mik.", "hós.", "frí.", "ley."],
};

/** "Sat, Oct 11, 2025" / "ley. 11. okt 2025" for a "YYYY-MM-DD" key */
function calendarDate(key: string, lang: Lang) {
  const date = new Date(`${key}T00:00:00Z`);
  const weekday = WEEKDAYS[lang][date.getUTCDay()];
  const month = MONTH_NAMES[lang][date.getUTCMonth()].slice(0, 3);
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return lang === "fo"
    ? `${weekday} ${day}. ${month} ${year}`
    : `${weekday}, ${month} ${day}, ${year}`;
}

/** "3 plays · Sat, Oct 11, 2025" / "3 spælingar · ley. 11. okt 2025" */
function tooltip(count: number, key: string, lang: Lang) {
  const s = strings[lang];
  const date = calendarDate(key, lang);
  const plays = count === 1 ? s.play : s.playsLabel;
  const n = count === 0 ? s.noPlays : formatNumber(count, lang);
  return `${n} ${plays} · ${date}`;
}

export function CalendarCells({
  days,
  columns,
  summary,
  lang,
}: {
  days: { key: string; count: number; level: Level }[];
  columns: React.CSSProperties;
  summary: string;
  lang: Lang;
}) {
  return (
    <div
      className={styles.cells}
      style={columns}
      role="img"
      aria-label={summary}
    >
      {days.map(({ key, count, level }) =>
        level === "none" ? (
          <div key={key} className={styles.cell.none} />
        ) : (
          <div
            key={key}
            className={`${styles.cell[level]} ${styles.hoverable}`}
            title={tooltip(count, key, lang)}
          />
        )
      )}
    </div>
  );
}
