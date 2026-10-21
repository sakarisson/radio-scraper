import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  getStation,
  getStationPlays,
  getTotalPlayCount,
} from "@/utils/database";
import * as styles from "@/styles/stations.css";
import * as ui from "@/styles/ui.css";
import { T } from "@/app/components/T";
import { formatNumber, formatShare, playTime, timeAgo } from "@/utils/format";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { StationDot } from "@/app/components/Station";
import { Stats } from "@/app/components/Stats";
import { isStale } from "@/utils/stations";

// Only the most recent plays are listed, with no paging back through
// history, so the full play log can't be scraped page by page.
const RECENT_PLAYS = 50;

export default async function StationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const station = await getStation(slug);
  if (station === null) {
    notFound();
  }

  const [plays, allPlaysCount] = await Promise.all([
    getStationPlays(station.id, RECENT_PLAYS),
    getTotalPlayCount(),
  ]);

  const totalCount = station.playCount;
  const latestPlay = plays[0];

  const songHref = (artist: string, title: string) =>
    `/artists/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const artistHref = (artist: string) =>
    `/artists/${encodeURIComponent(artist)}`;

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/stations", label: <T>{(s) => s.stationsTitle}</T> },
        ]}
      />

      <section className={ui.intro.detail}>
        <div className={styles.titleRow}>
          <StationDot station={slug} size="lg" />
          <h1 className={ui.display.lg}>{slug}</h1>
        </div>
        <div className={ui.introStats}>
          <Stats
            items={[
              {
                value: <T>{(_, lang) => formatNumber(totalCount, lang)}</T>,
                label: <T>{(s) => s.plays}</T>,
              },
              {
                value: formatShare(totalCount, allPlaysCount),
                label: <T>{(s) => s.ofAllPlays}</T>,
              },
            ]}
          />
        </div>
      </section>

      {latestPlay && (
        <section className={ui.section.sm}>
          <div
            className={`${styles.latestCard} ${ui.softCard} ${isStale(latestPlay.time_played) ? styles.stale : ""}`}
          >
            <span className={ui.aside}>
              <T>
                {(s, lang) =>
                  s.lastPlayedCard(timeAgo(latestPlay.time_played, lang))
                }
              </T>
            </span>
            <div className={ui.itemText} style={{ gap: 6 }}>
              <Link
                href={songHref(latestPlay.artist, latestPlay.title)}
                className={styles.latestSong}
              >
                {latestPlay.title}
              </Link>
              <Link
                href={artistHref(latestPlay.artist)}
                className={styles.latestArtist}
              >
                {latestPlay.artist}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>
            <T>{(s) => s.recentPlaysOn(slug)}</T>
          </h2>
        </div>
        {plays.map((play) => (
          <div key={play.id} className={`${styles.playRow} ${ui.row}`}>
            <span className={ui.aside}>
              <T>{(_, lang) => playTime(play.time_played, lang)}</T>
            </span>
            <div className={ui.itemText}>
              <Link
                href={songHref(play.artist, play.title)}
                className={ui.itemTitle}
              >
                {play.title}
              </Link>
              <Link href={artistHref(play.artist)} className={ui.itemSub}>
                {play.artist}
              </Link>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
