import Link from "next/link";
import { z } from "zod";
import {
  getTopArtistsForMonth,
  getTopSongsForMonth,
  getAllStationSlugs,
} from "@/utils/database";
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
    stations: z.string().optional(),
  })
  .optional();

function getLastCompletedMonth() {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed, so this is already "previous month"
  if (month === 0) {
    return { year: now.getFullYear() - 1, month: 12 };
  }
  return { year: now.getFullYear(), month };
}

function parseMonth(param: string | undefined) {
  if (!param) {
    return getLastCompletedMonth();
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

function buildChartsHref(
  year: number,
  month: number,
  stations: string | undefined
) {
  const params = new URLSearchParams();
  params.set("month", formatMonthParam(year, month));
  if (stations) params.set("stations", stations);
  return `/charts?${params.toString()}`;
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams?: unknown;
}) {
  const parsed = paramsSchema.safeParse(searchParams);
  const monthParam = parsed.success ? parsed.data?.month : undefined;
  const stationsParam = parsed.success ? parsed.data?.stations : undefined;
  const { year, month } = parseMonth(monthParam);

  const allSlugs = await getAllStationSlugs();
  const selectedSlugs = stationsParam
    ? stationsParam.split(",").filter((s) => allSlugs.includes(s))
    : undefined;

  const [topArtists, topSongs] = await Promise.all([
    getTopArtistsForMonth(year, month, 10, selectedSlugs),
    getTopSongsForMonth(year, month, 10, selectedSlugs),
  ]);

  const prev = getPrevMonth(year, month);
  const next = getNextMonth(year, month);
  const lastCompleted = getLastCompletedMonth();
  const isLastCompleted =
    year === lastCompleted.year && month === lastCompleted.month;
  const isFutureNext =
    next.year > lastCompleted.year ||
    (next.year === lastCompleted.year && next.month > lastCompleted.month);

  const monthDate = new Date(year, month - 1);
  const monthDisplay = format(monthDate, "MMMM yyyy");

  const currentStationsParam = selectedSlugs
    ? selectedSlugs.join(",")
    : undefined;

  return (
    <div>
      <h1 className={heading}>{strings.charts}</h1>

      <div className={styles.monthPicker}>
        <Link
          href={buildChartsHref(prev.year, prev.month, currentStationsParam)}
          className={styles.monthNav}
        >
          &#8249;
        </Link>
        <span
          className={`${styles.monthLabel} ${isLastCompleted ? styles.currentMonth : ""}`}
        >
          {monthDisplay}
        </span>
        {isFutureNext ? (
          <span className={styles.monthNavDisabled}>&#8250;</span>
        ) : (
          <Link
            href={buildChartsHref(
              next.year,
              next.month,
              currentStationsParam
            )}
            className={styles.monthNav}
          >
            &#8250;
          </Link>
        )}
      </div>

      <div className={styles.stationFilter}>
        <span className={styles.filterLabel}>{strings.filterByStation}</span>
        <Link
          href={buildChartsHref(year, month, undefined)}
          className={`${styles.filterChip} ${!selectedSlugs ? styles.filterChipActive : ""}`}
        >
          {strings.allStationsLabel}
        </Link>
        {allSlugs.map((slug) => {
          const isActive = selectedSlugs?.includes(slug) ?? false;
          let nextSlugs: string | undefined;
          if (isActive) {
            const remaining = selectedSlugs!.filter((s) => s !== slug);
            nextSlugs = remaining.length > 0 ? remaining.join(",") : undefined;
          } else {
            nextSlugs = selectedSlugs
              ? [...selectedSlugs, slug].join(",")
              : slug;
          }
          return (
            <Link
              key={slug}
              href={buildChartsHref(year, month, nextSlugs)}
              className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
            >
              {slug}
            </Link>
          );
        })}
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
                <div
                  key={`${song.title}-${song.artist}`}
                  className={styles.rankedItem}
                >
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
