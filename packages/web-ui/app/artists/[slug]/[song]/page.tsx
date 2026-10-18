import { z } from "zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSongPlays,
  getSongPlayCount,
  getSongPlayRange,
  getSongStationBreakdown,
  getSongDailyPlays,
} from "@/utils/database";
import format from "date-fns/format";
import * as styles from "@/styles/artist-detail.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { clockTime, formatNumber, relativeTime } from "@/utils/format";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Pagination } from "@/app/components/Pagination";
import { StationLink } from "@/app/components/Station";
import { StationSplit } from "@/app/components/StationSplit";
import { Stats } from "@/app/components/Stats";
import { PlayCalendar } from "@/app/components/PlayCalendar";

const PAGE_SIZE = 50;

const paramsSchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  })
  .optional();

type Play = { id: number; time_played: string; station: string };

function groupByMonth(plays: Play[]) {
  const groups: { key: string; label: string; plays: Play[] }[] = [];
  for (const play of plays) {
    const date = new Date(play.time_played);
    const key = format(date, "yyyy-MM");
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: format(date, "MMMM yyyy"), plays: [] };
      groups.push(group);
    }
    group.plays.push(play);
  }
  return groups;
}

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { slug: string; song: string };
  searchParams?: unknown;
}) {
  const artistName = decodeURIComponent(params.slug);
  const songTitle = decodeURIComponent(params.song);
  const parsed = paramsSchema.safeParse(searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const offset = page * PAGE_SIZE;

  const [
    plays,
    totalCount,
    playRange,
    stationBreakdown,
    dailyPlays,
  ] = await Promise.all([
    getSongPlays(artistName, songTitle, offset, PAGE_SIZE),
    getSongPlayCount(artistName, songTitle),
    getSongPlayRange(artistName, songTitle),
    getSongStationBreakdown(artistName, songTitle),
    getSongDailyPlays(artistName, songTitle),
  ]);

  if (plays === null || totalCount === null) {
    notFound();
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const artistHref = `/artists/${params.slug}`;
  const months = groupByMonth(plays);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/artists", label: strings.artists },
          { href: artistHref, label: artistName },
        ]}
      />

      <section className={ui.intro.detail}>
        <h1 className={ui.display.lg}>{songTitle}</h1>
        <Link href={artistHref} className={styles.subtitle}>
          {artistName}
        </Link>
        <div className={ui.introStats}>
          <Stats
            items={[
              { value: formatNumber(totalCount), label: strings.plays },
              ...(playRange
                ? [
                    {
                      value: relativeTime(playRange.firstPlayed),
                      label: strings.firstPlayed,
                    },
                    {
                      value: relativeTime(playRange.lastPlayed),
                      label: strings.lastPlayed,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </section>

      {dailyPlays && (
        <section className={ui.section.sm}>
          <PlayCalendar daily={dailyPlays} />
        </section>
      )}

      {stationBreakdown && stationBreakdown.length > 0 && (
        <section className={ui.section.sm}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{strings.playsByStation}</h2>
          </div>
          <StationSplit breakdown={stationBreakdown} />
        </section>
      )}

      <section className={ui.section.lg}>
        <h2 className={ui.sectionTitle}>{strings.playHistory}</h2>
        <div className={styles.history}>
          {months.map((month) => (
            <div key={month.key} className={styles.historyMonth}>
              <div className={styles.historyLabel}>
                <span className={styles.historyMonthName}>{month.label}</span>
                <span className={ui.aside}>
                  {formatNumber(month.plays.length)}{" "}
                  {month.plays.length === 1 ? strings.play : strings.playsLabel}
                </span>
              </div>
              <div className={styles.historyPlays}>
                {month.plays.map((play) => (
                  <div
                    key={play.id}
                    className={`${styles.historyPlay} ${ui.row}`}
                  >
                    <span className={styles.historyDay}>
                      {format(new Date(play.time_played), "MMM d")}
                    </span>
                    <span className={styles.historyTime}>
                      {clockTime(play.time_played)}
                    </span>
                    <StationLink station={play.station} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`${artistHref}/${params.song}`}
          prevLabel={strings.newerPlays}
          nextLabel={strings.olderPlays}
        />
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
