import { z } from "zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArtistPlays,
  getArtistPlayCount,
  getArtistStationBreakdown,
  getArtistSongsOverview,
  getArtistDailyPlays,
} from "@/utils/database";
import * as styles from "@/styles/artist-detail.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import {
  formatNumber,
  fullDateTime,
  playTime,
  relativeTime,
} from "@/utils/format";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { StationLink } from "@/app/components/Station";
import { StationSplit } from "@/app/components/StationSplit";
import { Stats } from "@/app/components/Stats";
import { PlayCalendar } from "@/app/components/PlayCalendar";

const RECENT_PLAYS = 10;

const paramsSchema = z
  .object({
    sort: z.enum(["recent", "plays"]).optional(),
  })
  .optional();

const sortOptions = [
  { key: "recent", label: strings.sortLastPlayed },
  { key: "plays", label: strings.sortMostPlayed },
] as const;

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: unknown;
}) {
  const artistName = decodeURIComponent(params.slug);
  const parsed = paramsSchema.safeParse(searchParams);
  const sort = parsed.success ? parsed.data?.sort ?? "recent" : "recent";

  const [
    plays,
    totalCount,
    stationBreakdown,
    songsOverview,
    dailyPlays,
  ] = await Promise.all([
    getArtistPlays(artistName, 0, RECENT_PLAYS),
    getArtistPlayCount(artistName),
    getArtistStationBreakdown(artistName),
    getArtistSongsOverview(artistName),
    getArtistDailyPlays(artistName),
  ]);

  if (plays === null || totalCount === null) {
    notFound();
  }

  const songs = [...(songsOverview ?? [])].sort((a, b) =>
    sort === "plays"
      ? b.playCount - a.playCount
      : new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
  const maxSongPlays = Math.max(1, ...songs.map((s) => s.playCount));
  const artistHref = `/artists/${params.slug}`;

  function sortHref(key: (typeof sortOptions)[number]["key"]) {
    const qs = new URLSearchParams();
    if (key !== "recent") qs.set("sort", key);
    const s = qs.toString();
    return s ? `${artistHref}?${s}` : artistHref;
  }

  return (
    <>
      <Breadcrumbs items={[{ href: "/artists", label: strings.artists }]} />

      <section className={ui.intro.detail}>
        <h1 className={ui.display.lg}>{artistName}</h1>
        <div className={ui.introStats}>
          <Stats
            items={[
              { value: formatNumber(totalCount), label: strings.plays },
              { value: formatNumber(songs.length), label: strings.songs },
            ]}
          />
        </div>
      </section>

      {dailyPlays && (
        <section className={ui.section.sm}>
          <PlayCalendar daily={dailyPlays} scale="artist" />
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

      {songs.length > 0 && (
        <section className={ui.section.lg}>
          <div className={ui.sectionHeader} style={{ alignItems: "center" }}>
            <h2 className={ui.sectionTitle}>{strings.songs}</h2>
            <div className={ui.segmented}>
              {sortOptions.map(({ key, label }) => (
                <Link
                  key={key}
                  href={sortHref(key)}
                  scroll={false}
                  className={ui.segment[sort === key ? "active" : "idle"]}
                  aria-current={sort === key ? "true" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className={`${styles.songHeader} ${ui.row}`}>
            <span>{strings.title}</span>
            <span>{strings.plays}</span>
            <span className={styles.hideMedium}>{strings.firstPlayed}</span>
            <span className={styles.hideNarrow}>{strings.lastPlayed}</span>
          </div>
          {songs.map(({ songId, title, playCount, firstPlayed, lastPlayed }) => (
            <div key={songId} className={`${styles.songRow} ${ui.row}`}>
              <Link
                href={`${artistHref}/${encodeURIComponent(title)}`}
                className={styles.songTitle}
              >
                {title}
              </Link>
              <div className={styles.playsCell}>
                <span className={styles.playsNumber}>
                  {formatNumber(playCount)}
                </span>
                <div className={`${ui.thinTrack} ${styles.playsTrack}`}>
                  <div
                    className={ui.thinFill}
                    style={{ width: `${(playCount / maxSongPlays) * 100}%` }}
                  />
                </div>
              </div>
              <span
                className={`${ui.muted} ${styles.hideMedium}`}
                title={fullDateTime(firstPlayed)}
              >
                {relativeTime(firstPlayed)}
              </span>
              <span
                className={`${ui.muted} ${styles.hideNarrow}`}
                title={fullDateTime(lastPlayed)}
              >
                {relativeTime(lastPlayed)}
              </span>
            </div>
          ))}
        </section>
      )}

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>{strings.recentPlays}</h2>
        </div>
        {plays.map(({ title, time_played, station, id }) => (
          <div key={id} className={`${styles.playRow} ${ui.row}`}>
            <Link
              href={`${artistHref}/${encodeURIComponent(title)}`}
              className={styles.songTitle}
            >
              {title}
            </Link>
            <StationLink station={station} />
            <span className={styles.playWhen}>{playTime(time_played)}</span>
          </div>
        ))}
      </section>
    </>
  );
}
