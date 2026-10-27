import Link from "next/link";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getSongPage } from "@/utils/database";
import * as styles from "@/styles/artist-detail.css";
import * as ui from "@/styles/ui.css";
import {
  clockTime,
  formatNumber,
  relativeTime,
  shortDate,
  timeAgo,
} from "@/utils/format";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
import { strings } from "@/utils/strings";
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

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string; song: string }>;
}) {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const lang = await getLang();
  const s = strings[lang];
  const r = routes(lang);
  const { slug, song } = await params;
  const artistName = decodeURIComponent(slug);
  const songTitle = decodeURIComponent(song);

  const page = await getSongPage(artistName, songTitle);
  if (page === null) {
    notFound();
  }
  // Credited to another spelling of an artist: show it under the artist
  if (page.redirectTo !== null) {
    redirect(r.song(page.redirectTo, songTitle));
  }

  const {
    plays,
    totalCount,
    playRange,
    stationBreakdown,
    dailyPlays,
    members,
    guests,
  } = page;
  const artistHref = r.artist(artistName);
  const credit = creditSegments(artistName, members);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: r.artists, label: s.artists },
          { href: artistHref, label: artistName },
        ]}
      />

      <section className={ui.intro.detail}>
        <h1 className={ui.display.lg}>{songTitle}</h1>
        <p className={styles.subtitle}>
          {credit ? (
            <CreditLinks segments={credit} lang={lang} />
          ) : (
            <Link href={artistHref} className={styles.inlineLink}>
              {artistName}
            </Link>
          )}
          {guests.length > 0 && (
            <>
              {` · ${s.featuring} `}
              <ArtistList names={guests} lang={lang} />
            </>
          )}
        </p>
        <div className={ui.introStats}>
          <Stats
            items={[
              {
                value: formatNumber(totalCount, lang),
                label: s.plays,
              },
              ...(playRange
                ? [
                    {
                      value: relativeTime(playRange.firstPlayed, lang),
                      label: s.firstPlayed,
                    },
                    {
                      value: relativeTime(playRange.lastPlayed, lang),
                      label: s.lastPlayed,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </section>

      <section className={ui.section.sm}>
        <PlayCalendar daily={dailyPlays} />
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

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>
            {s.recentPlays}
          </h2>
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
                {shortDate(play.time_played, lang)}
              </span>
              <span className={styles.songPlayTime}>
                {clockTime(play.time_played)}
              </span>
              <StationLink station={play.station} />
              <span className={styles.songPlayAgo}>
                {timeAgo(play.time_played, lang)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
