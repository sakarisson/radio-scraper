import { z } from "zod";
import Link from "next/link";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
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
    songs: z.enum(["all"]).optional(),
  })
  .optional();

const sortOptions = [
  { key: "recent", label: "sortLastPlayed" },
  { key: "plays", label: "sortMostPlayed" },
] as const;

/** Songs shown before "Show all", so the sections below stay reachable */
const SONGS_SHOWN = 15;

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

/** A row of the songs table: a name, then plays, first and last played. */
function PlaysRow({
  name,
  playCount,
  maxPlays,
  firstPlayed,
  lastPlayed,
  lang,
}: {
  name: React.ReactNode;
  playCount: number;
  maxPlays: number;
  firstPlayed: string;
  lastPlayed: string;
  lang: Lang;
}) {
  return (
    <div className={`${styles.songRow} ${ui.row}`}>
      {name}
      <div className={styles.playsCell}>
        <span className={styles.playsNumber}>
          {formatNumber(playCount, lang)}
        </span>
        <div className={`${ui.thinTrack} ${styles.playsTrack}`}>
          <div
            className={ui.thinFill}
            style={{ width: `${(playCount / maxPlays) * 100}%` }}
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
  );
}

/** The column labels above a songs table */
function PlaysHeader({ first, lang }: { first: string; lang: Lang }) {
  const s = strings[lang];
  return (
    <div className={`${styles.songHeader} ${ui.row}`}>
      <span>{first}</span>
      <span>{s.plays}</span>
      <span className={styles.hideMedium}>{s.firstPlayed}</span>
      <span className={styles.hideNarrow}>{s.lastPlayed}</span>
    </div>
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
  const showAllSongs = parsed.success && parsed.data?.songs === "all";

  const artist = await getArtistPage(artistName);
  if (artist === null) {
    notFound();
  }
  // Another spelling of an artist: show the artist's own page
  if (artist.redirectTo !== null) {
    redirect(r.artist(artist.redirectTo));
  }

  const {
    akaNames,
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
  const shownSongs = showAllSongs ? songs : songs.slice(0, SONGS_SHOWN);
  const maxSongPlays = Math.max(1, ...songs.map((s) => s.playCount));
  // Combined credits ("Eivør og Pætur") and songs where they're a guest
  // ("Træ (saman við Eivør)") are different things, so they're listed apart
  const credits = collaborations.filter((c) => c.songTitle === null);
  const guestSongs = collaborations.filter(
    (c): c is typeof c & { songTitle: string } => c.songTitle !== null
  );
  const maxCreditPlays = Math.max(1, ...credits.map((c) => c.playCount));
  const maxGuestPlays = Math.max(1, ...guestSongs.map((c) => c.playCount));
  const credit = creditSegments(artistName, members);
  const artistHref = r.artist(artistName);

  function pageHref(next: { sort?: typeof sort; all?: boolean }) {
    const query = new URLSearchParams();
    const nextSort = next.sort ?? sort;
    if (nextSort !== "recent") query.set("sort", nextSort);
    if (next.all ?? showAllSongs) query.set("songs", "all");
    const qs = query.toString();
    return qs ? `${artistHref}?${qs}` : artistHref;
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
        {akaNames.length > 0 && (
          <p className={styles.akas}>
            <span className={ui.muted}>{s.alsoSpelled}</span>
            <span>{akaNames.join(" · ")}</span>
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
                  href={pageHref({ sort: key })}
                  scroll={false}
                  className={ui.segment[sort === key ? "active" : "idle"]}
                  aria-current={sort === key ? "true" : undefined}
                >
                  {s[label]}
                </Link>
              ))}
            </div>
          </div>
          <PlaysHeader first={s.title} lang={lang} />
          {shownSongs.map(
            ({ songId, title, playCount, firstPlayed, lastPlayed }) => (
              <PlaysRow
                key={songId}
                name={
                  <Link
                    href={r.song(artistName, title)}
                    className={styles.songTitle}
                  >
                    {title}
                  </Link>
                }
                playCount={playCount}
                maxPlays={maxSongPlays}
                firstPlayed={firstPlayed}
                lastPlayed={lastPlayed}
                lang={lang}
              />
            )
          )}
          {songs.length > SONGS_SHOWN && (
            <div className={`${styles.moreSongs} ${ui.row}`}>
              <Link href={pageHref({ all: !showAllSongs })} scroll={false}>
                {showAllSongs
                  ? s.showFewerSongs
                  : s.showAllSongs(formatNumber(songs.length, lang))}
              </Link>
            </div>
          )}
        </section>
      )}

      {credits.length > 0 && (
        <section className={ui.section.lg}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{s.creditedTogether}</h2>
            <span className={ui.muted}>{s.collaborationsHint}</span>
          </div>
          <PlaysHeader first={s.artist} lang={lang} />
          {credits.map(({ creditName, playCount, firstPlayed, lastPlayed }) => (
            <PlaysRow
              key={creditName}
              name={
                <Link href={r.artist(creditName)} className={styles.songTitle}>
                  {creditName}
                </Link>
              }
              playCount={playCount}
              maxPlays={maxCreditPlays}
              firstPlayed={firstPlayed}
              lastPlayed={lastPlayed}
              lang={lang}
            />
          ))}
        </section>
      )}

      {guestSongs.length > 0 && (
        <section className={ui.section.lg}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{s.guestOn}</h2>
            <span className={ui.muted}>{s.collaborationsHint}</span>
          </div>
          <PlaysHeader first={s.title} lang={lang} />
          {guestSongs.map(
            ({ creditName, songTitle, playCount, firstPlayed, lastPlayed }) => (
              <PlaysRow
                key={`${creditName}/${songTitle}`}
                name={
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
                }
                playCount={playCount}
                maxPlays={maxGuestPlays}
                firstPlayed={firstPlayed}
                lastPlayed={lastPlayed}
                lang={lang}
              />
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
