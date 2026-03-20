import Link from "next/link";
import { z } from "zod";
import { getTopArtistsForMonth, getTopSongsForMonth } from "@/utils/database";
import { heading } from "@/styles/typography.css";
import * as styles from "@/styles/charts.css";
import { strings } from "@/utils/strings";
import format from "date-fns/format";

const paramsSchema = z
  .object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
  })
  .optional();

function parseMonth(param: string | undefined) {
  const now = new Date();
  if (!param) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const [y, m] = param.split("-").map(Number);
  return { year: y, month: m };
}

function formatMonthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getPrevMonth(year: number, month: number) {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

function getNextMonth(year: number, month: number) {
  return month === 12
    ? { year: year + 1, month: 1 }
    : { year, month: month + 1 };
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams?: unknown;
}) {
  const parsed = paramsSchema.safeParse(searchParams);
  const monthParam = parsed.success ? parsed.data?.month : undefined;
  const { year, month } = parseMonth(monthParam);

  const [topArtists, topSongs] = await Promise.all([
    getTopArtistsForMonth(year, month),
    getTopSongsForMonth(year, month),
  ]);

  const prev = getPrevMonth(year, month);
  const next = getNextMonth(year, month);
  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;
  const isFutureNext =
    next.year > now.getFullYear() ||
    (next.year === now.getFullYear() && next.month > now.getMonth() + 1);

  const monthDate = new Date(year, month - 1);
  const monthDisplay = format(monthDate, "MMMM yyyy");

  return (
    <div>
      <h1 className={heading}>{strings.charts}</h1>

      <div className={styles.monthPicker}>
        <Link
          href={`/charts?month=${formatMonthParam(prev.year, prev.month)}`}
          className={styles.monthNav}
        >
          &#8249;
        </Link>
        <span
          className={`${styles.monthLabel} ${isCurrentMonth ? styles.currentMonth : ""}`}
        >
          {monthDisplay}
        </span>
        {isFutureNext ? (
          <span className={styles.monthNavDisabled}>&#8250;</span>
        ) : (
          <Link
            href={`/charts?month=${formatMonthParam(next.year, next.month)}`}
            className={styles.monthNav}
          >
            &#8250;
          </Link>
        )}
      </div>

      {topArtists.length === 0 && topSongs.length === 0 ? (
        <div className={styles.emptyState}>{strings.noDataForMonth}</div>
      ) : (
        <div className={styles.listsGrid}>
          <div className={styles.listSection}>
            <h2 className={styles.listHeading}>{strings.topArtists}</h2>
            <div className={styles.rankedList}>
              {topArtists.map((artist, i) => (
                <div key={artist.name} className={styles.rankedItem}>
                  <span className={styles.rankNumber}>{i + 1}</span>
                  <div className={styles.rankInfo}>
                    <Link
                      href={`/artists/${artist.name}`}
                      className={styles.rankName}
                    >
                      {artist.name}
                    </Link>
                  </div>
                  <span className={styles.rankCount}>
                    {artist.playCount} {strings.playsLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.listSection}>
            <h2 className={styles.listHeading}>{strings.topSongs}</h2>
            <div className={styles.rankedList}>
              {topSongs.map((song, i) => (
                <div key={`${song.title}-${song.artist}`} className={styles.rankedItem}>
                  <span className={styles.rankNumber}>{i + 1}</span>
                  <div className={styles.rankInfo}>
                    <div className={styles.rankName}>{song.title}</div>
                    <div className={styles.rankArtist}>
                      <Link
                        href={`/artists/${song.artist}`}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        {song.artist}
                      </Link>
                    </div>
                  </div>
                  <span className={styles.rankCount}>
                    {song.playCount} {strings.playsLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
