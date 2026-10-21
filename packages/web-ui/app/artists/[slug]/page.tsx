import { z } from "zod";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getArtistPage } from "@/utils/database";
import * as styles from "@/styles/artist-detail.css";
import * as ui from "@/styles/ui.css";
import type { Strings } from "@/utils/strings";
import { T } from "@/app/components/T";
import { Localized } from "@/app/components/Localized";
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

const paramsSchema = z
  .object({
    sort: z.enum(["recent", "plays"]).optional(),
  })
  .optional();

const sortOptions = [
  { key: "recent", label: (s: Strings) => s.sortLastPlayed },
  { key: "plays", label: (s: Strings) => s.sortMostPlayed },
] as const;

/** A muted span with the full date and time as a tooltip. */
function DateWithTooltip({
  date,
  className,
  children,
}: {
  date: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Localized
      as="span"
      props={{ className }}
      byLang={{
        fo: { title: fullDateTime(date, "fo") },
        en: { title: fullDateTime(date, "en") },
      }}
    >
      {children}
    </Localized>
  );
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const { slug } = await params;
  const artistName = decodeURIComponent(slug);
  const parsed = paramsSchema.safeParse(await searchParams);
  const sort = parsed.success ? parsed.data?.sort ?? "recent" : "recent";

  const artist = await getArtistPage(artistName);
  if (artist === null) {
    notFound();
  }

  const { plays, firstPlay, totalCount, stationBreakdown, dailyPlays } = artist;
  const songs = [...artist.songs].sort((a, b) =>
    sort === "plays"
      ? b.playCount - a.playCount
      : new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
  const maxSongPlays = Math.max(1, ...songs.map((s) => s.playCount));
  const artistHref = `/artists/${slug}`;

  function sortHref(key: (typeof sortOptions)[number]["key"]) {
    const qs = new URLSearchParams();
    if (key !== "recent") qs.set("sort", key);
    const s = qs.toString();
    return s ? `${artistHref}?${s}` : artistHref;
  }

  return (
    <>
      <Breadcrumbs
        items={[{ href: "/artists", label: <T>{(s) => s.artists}</T> }]}
      />

      <section className={ui.intro.detail}>
        <h1 className={ui.display.lg}>{artistName}</h1>
        <div className={ui.introStats}>
          <Stats
            items={[
              {
                value: <T>{(_, lang) => formatNumber(totalCount, lang)}</T>,
                label: <T>{(s) => s.plays}</T>,
              },
              {
                value: <T>{(_, lang) => formatNumber(songs.length, lang)}</T>,
                label: <T>{(s) => s.songs}</T>,
              },
            ]}
          />
        </div>
        {firstPlay && (
          <p className={styles.firstPlay}>
            <span className={ui.muted}>
              <T>{(s) => s.firstPlay}</T>
            </span>
            <Link
              href={`${artistHref}/${encodeURIComponent(firstPlay.title)}`}
              className={styles.firstPlaySong}
            >
              {firstPlay.title}
            </Link>
            <StationLink station={firstPlay.station} />
            <Localized
              as="span"
              props={{ className: ui.muted }}
              byLang={{
                fo: { title: relativeTime(firstPlay.time_played, "fo") },
                en: { title: relativeTime(firstPlay.time_played, "en") },
              }}
            >
              <T>{(_, lang) => fullDateTime(firstPlay.time_played, lang)}</T>
            </Localized>
          </p>
        )}
      </section>

      <section className={ui.section.sm}>
        <PlayCalendar daily={dailyPlays} scale="artist" />
      </section>

      {stationBreakdown.length > 0 && (
        <section className={ui.section.sm}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>
              <T>{(s) => s.playsByStation}</T>
            </h2>
          </div>
          <StationSplit breakdown={stationBreakdown} />
        </section>
      )}

      {songs.length > 0 && (
        <section className={ui.section.lg}>
          <div className={ui.sectionHeader} style={{ alignItems: "center" }}>
            <h2 className={ui.sectionTitle}>
              <T>{(s) => s.songs}</T>
            </h2>
            <div className={ui.segmented}>
              {sortOptions.map(({ key, label }) => (
                <Link
                  key={key}
                  href={sortHref(key)}
                  scroll={false}
                  className={ui.segment[sort === key ? "active" : "idle"]}
                  aria-current={sort === key ? "true" : undefined}
                >
                  <T>{label}</T>
                </Link>
              ))}
            </div>
          </div>
          <div className={`${styles.songHeader} ${ui.row}`}>
            <span>
              <T>{(s) => s.title}</T>
            </span>
            <span>
              <T>{(s) => s.plays}</T>
            </span>
            <span className={styles.hideMedium}>
              <T>{(s) => s.firstPlayed}</T>
            </span>
            <span className={styles.hideNarrow}>
              <T>{(s) => s.lastPlayed}</T>
            </span>
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
                  <T>{(_, lang) => formatNumber(playCount, lang)}</T>
                </span>
                <div className={`${ui.thinTrack} ${styles.playsTrack}`}>
                  <div
                    className={ui.thinFill}
                    style={{ width: `${(playCount / maxSongPlays) * 100}%` }}
                  />
                </div>
              </div>
              <DateWithTooltip
                date={firstPlayed}
                className={`${ui.muted} ${styles.hideMedium}`}
              >
                <T>{(_, lang) => relativeTime(firstPlayed, lang)}</T>
              </DateWithTooltip>
              <DateWithTooltip
                date={lastPlayed}
                className={`${ui.muted} ${styles.hideNarrow}`}
              >
                <T>{(_, lang) => relativeTime(lastPlayed, lang)}</T>
              </DateWithTooltip>
            </div>
          ))}
        </section>
      )}

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>
            <T>{(s) => s.recentPlays}</T>
          </h2>
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
            <span className={styles.playWhen}>
              <T>{(_, lang) => playTime(time_played, lang)}</T>
            </span>
          </div>
        ))}
      </section>
    </>
  );
}
