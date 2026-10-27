import { z } from "zod";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getArtistPage } from "@/utils/database";
import * as styles from "@/styles/artist-detail.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import type { Lang } from "@/utils/i18n";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
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
import {
  ArtistList,
  CreditLinks,
  creditSegments,
} from "@/app/components/ArtistCredit";

const paramsSchema = z
  .object({
    sort: z.enum(["recent", "plays"]).optional(),
  })
  .optional();

const sortOptions = [
  { key: "recent", label: "sortLastPlayed" },
  { key: "plays", label: "sortMostPlayed" },
] as const;

/** A muted span with the full date and time as a tooltip. */
function DateWithTooltip({
  date,
  lang,
  className,
  children,
}: {
  date: string;
  lang: Lang;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span className={className} title={fullDateTime(date, lang)}>
      {children}
    </span>
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
  const lang = await getLang();
  const s = strings[lang];
  const r = routes(lang);
  const { slug } = await params;
  const artistName = decodeURIComponent(slug);
  const parsed = paramsSchema.safeParse(await searchParams);
  const sort = parsed.success ? parsed.data?.sort ?? "recent" : "recent";

  const artist = await getArtistPage(artistName);
  if (artist === null) {
    notFound();
  }

  const {
    plays,
    firstPlay,
    totalCount,
    stationBreakdown,
    dailyPlays,
    members,
    collaborations,
  } = artist;
  const songs = [...artist.songs].sort((a, b) =>
    sort === "plays"
      ? b.playCount - a.playCount
      : new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
  const maxSongPlays = Math.max(1, ...songs.map((s) => s.playCount));
  const maxCollabPlays = Math.max(1, ...collaborations.map((c) => c.playCount));
  const credit = creditSegments(artistName, members);
  const artistHref = r.artist(artistName);

  function sortHref(key: (typeof sortOptions)[number]["key"]) {
    return key === "recent" ? artistHref : `${artistHref}?sort=${key}`;
  }

  return (
    <>
      <Breadcrumbs items={[{ href: r.artists, label: s.artists }]} />

      <section className={ui.intro.detail}>
        <h1 className={ui.display.lg}>
          {credit ? <CreditLinks segments={credit} lang={lang} /> : artistName}
        </h1>
        {!credit && members.length > 0 && (
          <p className={styles.subtitle}>
            <ArtistList names={members} lang={lang} />
          </p>
        )}
        <div className={ui.introStats}>
          <Stats
            items={[
              {
                value: formatNumber(totalCount, lang),
                label: s.plays,
              },
              {
                value: formatNumber(songs.length, lang),
                label: s.songs,
              },
            ]}
          />
        </div>
        {firstPlay && (
          <p className={styles.firstPlay}>
            <span className={ui.muted}>
              {s.firstPlay}
            </span>
            <Link
              href={r.song(artistName, firstPlay.title)}
              className={styles.firstPlaySong}
            >
              {firstPlay.title}
            </Link>
            <StationLink station={firstPlay.station} />
            <span
              className={ui.muted}
              title={relativeTime(firstPlay.time_played, lang)}
            >
              {fullDateTime(firstPlay.time_played, lang)}
            </span>
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
              {s.playsByStation}
            </h2>
          </div>
          <StationSplit breakdown={stationBreakdown} />
        </section>
      )}

      {songs.length > 0 && (
        <section className={ui.section.lg}>
          <div className={ui.sectionHeader} style={{ alignItems: "center" }}>
            <h2 className={ui.sectionTitle}>
              {s.songs}
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
                  {s[label]}
                </Link>
              ))}
            </div>
          </div>
          <div className={`${styles.songHeader} ${ui.row}`}>
            <span>
              {s.title}
            </span>
            <span>
              {s.plays}
            </span>
            <span className={styles.hideMedium}>
              {s.firstPlayed}
            </span>
            <span className={styles.hideNarrow}>
              {s.lastPlayed}
            </span>
          </div>
          {songs.map(({ songId, title, playCount, firstPlayed, lastPlayed }) => (
            <div key={songId} className={`${styles.songRow} ${ui.row}`}>
              <Link
                href={r.song(artistName, title)}
                className={styles.songTitle}
              >
                {title}
              </Link>
              <div className={styles.playsCell}>
                <span className={styles.playsNumber}>
                  {formatNumber(playCount, lang)}
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
                lang={lang}
                className={`${ui.muted} ${styles.hideMedium}`}
              >
                {relativeTime(firstPlayed, lang)}
              </DateWithTooltip>
              <DateWithTooltip
                date={lastPlayed}
                lang={lang}
                className={`${ui.muted} ${styles.hideNarrow}`}
              >
                {relativeTime(lastPlayed, lang)}
              </DateWithTooltip>
            </div>
          ))}
        </section>
      )}

      {collaborations.length > 0 && (
        <section className={ui.section.lg}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{s.collaborations}</h2>
            <span className={ui.muted}>{s.collaborationsHint}</span>
          </div>
          <div className={`${styles.songHeader} ${ui.row}`}>
            <span />
            <span>{s.plays}</span>
            <span className={styles.hideMedium}>{s.firstPlayed}</span>
            <span className={styles.hideNarrow}>{s.lastPlayed}</span>
          </div>
          {collaborations.map(
            ({ creditName, songTitle, playCount, firstPlayed, lastPlayed }) => (
              <div
                key={`${creditName}/${songTitle ?? ""}`}
                className={`${styles.songRow} ${ui.row}`}
              >
                {songTitle === null ? (
                  <Link href={r.artist(creditName)} className={styles.songTitle}>
                    {creditName}
                  </Link>
                ) : (
                  <span className={ui.itemText}>
                    <Link
                      href={r.song(creditName, songTitle)}
                      className={styles.songTitle}
                    >
                      {songTitle}
                    </Link>
                    <Link href={r.artist(creditName)} className={ui.itemSub}>
                      {creditName}
                    </Link>
                  </span>
                )}
                <div className={styles.playsCell}>
                  <span className={styles.playsNumber}>
                    {formatNumber(playCount, lang)}
                  </span>
                  <div className={`${ui.thinTrack} ${styles.playsTrack}`}>
                    <div
                      className={ui.thinFill}
                      style={{ width: `${(playCount / maxCollabPlays) * 100}%` }}
                    />
                  </div>
                </div>
                <DateWithTooltip
                  date={firstPlayed}
                  lang={lang}
                  className={`${ui.muted} ${styles.hideMedium}`}
                >
                  {relativeTime(firstPlayed, lang)}
                </DateWithTooltip>
                <DateWithTooltip
                  date={lastPlayed}
                  lang={lang}
                  className={`${ui.muted} ${styles.hideNarrow}`}
                >
                  {relativeTime(lastPlayed, lang)}
                </DateWithTooltip>
              </div>
            )
          )}
        </section>
      )}

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>
            {s.recentPlays}
          </h2>
        </div>
        {plays.map(({ title, time_played, station, id }) => (
          <div key={id} className={`${styles.playRow} ${ui.row}`}>
            <Link
              href={r.song(artistName, title)}
              className={styles.songTitle}
            >
              {title}
            </Link>
            <StationLink station={station} />
            <span className={styles.playWhen}>
              {playTime(time_played, lang)}
            </span>
          </div>
        ))}
      </section>
    </>
  );
}
