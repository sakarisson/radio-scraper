import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSongPlays,
  getSongPlayCount,
  getSongPlayRange,
  getSongStationBreakdown,
  getSongDailyPlays,
} from "@/utils/database";
import * as styles from "@/styles/artist-detail.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import {
  clockTime,
  formatNumber,
  relativeTime,
  shortDate,
  timeAgo,
} from "@/utils/format";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { StationLink } from "@/app/components/Station";
import { StationSplit } from "@/app/components/StationSplit";
import { Stats } from "@/app/components/Stats";
import { PlayCalendar } from "@/app/components/PlayCalendar";

const RECENT_PLAYS = 10;

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string; song: string }>;
}) {
  const { slug, song } = await params;
  const artistName = decodeURIComponent(slug);
  const songTitle = decodeURIComponent(song);

  const [plays, totalCount, playRange, stationBreakdown, dailyPlays] =
    await Promise.all([
      getSongPlays(artistName, songTitle, 0, RECENT_PLAYS),
      getSongPlayCount(artistName, songTitle),
      getSongPlayRange(artistName, songTitle),
      getSongStationBreakdown(artistName, songTitle),
      getSongDailyPlays(artistName, songTitle),
    ]);

  if (plays === null || totalCount === null) {
    notFound();
  }

  const artistHref = `/artists/${slug}`;

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
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>{strings.recentPlays}</h2>
        </div>
        <div
          className={styles.songPlays}
          // Fill the first column before the second, so it reads top to bottom
          style={{
            gridTemplateRows: `repeat(${Math.ceil(plays.length / 2)}, auto)`,
          }}
        >
          {plays.map((play) => (
            <div key={play.id} className={`${styles.songPlay} ${ui.row}`}>
              <span className={styles.songPlayDay}>
                {shortDate(play.time_played)}
              </span>
              <span className={styles.songPlayTime}>
                {clockTime(play.time_played)}
              </span>
              <StationLink station={play.station} />
              <span className={styles.songPlayAgo}>
                {timeAgo(play.time_played)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
