import Link from "next/link";
import { connection } from "next/server";
import {
  getStats,
  getRecentPlays,
  getLatestPlayPerStation,
  getTopSongsForMonth,
} from "@/utils/database";
import * as styles from "@/styles/home.css";
import * as ui from "@/styles/ui.css";
import { Stats } from "./components/Stats";
import { StationDot, StationLink } from "./components/Station";
import { strings } from "@/utils/strings";
import { clockTime, formatNumber, timeAgo } from "@/utils/format";
import { getLastCompletedMonth, MONTH_NAMES } from "@/utils/months";
import { compareStations, isStale } from "@/utils/stations";

export default async function Home() {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const chartMonth = getLastCompletedMonth();
  const [stats, recentPlays, latestPerStation, topSongs] = await Promise.all([
    getStats(),
    getRecentPlays(5),
    getLatestPlayPerStation(),
    getTopSongsForMonth(chartMonth.year, chartMonth.month, 5),
  ]);

  const stations = [...latestPerStation].sort((a, b) =>
    compareStations(a.station, b.station)
  );

  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{strings.homeTitle}</h1>
        <Stats
          items={[
            { value: formatNumber(stats.artistCount), label: strings.artists },
            { value: formatNumber(stats.songCount), label: strings.songs },
            { value: formatNumber(stats.playCount), label: strings.plays },
          ]}
        />
      </section>

      <section>
        <div className={ui.sectionHeader} style={{ paddingBottom: 24 }}>
          <h2 className={ui.sectionTitle}>{strings.lastPlayed}</h2>
          <span className={ui.aside}>{strings.lastPlayedHint}</span>
        </div>
        <div className={styles.stationCards}>
          {stations.map((play) => (
            <div
              key={play.station}
              className={[
                styles.stationCard,
                ui.softCard,
                isStale(play.time_played) ? styles.stale : "",
              ].join(" ")}
            >
              <div className={styles.stationCardHeader}>
                <StationDot station={play.station} size="sm" />
                <Link
                  href={`/stations/${play.station}`}
                  className={styles.stationCardLink}
                >
                  {play.station}
                </Link>
                <span className={styles.stationCardAgo}>
                  {timeAgo(play.time_played)}
                </span>
              </div>
              <div className={styles.stationCardBody}>
                <Link
                  href={`/artists/${encodeURIComponent(play.artist)}/${encodeURIComponent(play.title)}`}
                  className={`${styles.stationCardSong} ${styles.stationCardInnerLink}`}
                >
                  {play.title}
                </Link>
                <Link
                  href={`/artists/${encodeURIComponent(play.artist)}`}
                  className={`${ui.itemSub} ${styles.stationCardInnerLink}`}
                >
                  {play.artist}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.columns}>
        <div>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{strings.recentPlays}</h2>
            <Link href="/artists" className={ui.aside}>
              {strings.browseAllArtists}
            </Link>
          </div>
          {recentPlays.map((play) => (
            <div key={play.id} className={`${styles.recentRow} ${ui.row}`}>
              <span className={styles.rowMeta}>
                {clockTime(play.time_played)}
              </span>
              <div className={ui.itemText}>
                <Link
                  href={`/artists/${encodeURIComponent(play.artist)}/${encodeURIComponent(play.title)}`}
                  className={ui.itemTitle}
                >
                  {play.title}
                </Link>
                <Link
                  href={`/artists/${encodeURIComponent(play.artist)}`}
                  className={ui.itemSub}
                >
                  {play.artist}
                </Link>
              </div>
              <span className={styles.rowStation}>
                <StationLink station={play.station} />
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>
              {strings.topSongsOfMonth(MONTH_NAMES[chartMonth.month - 1])}
            </h2>
            <Link href="/charts" className={ui.aside}>
              {strings.monthlyCharts}
            </Link>
          </div>
          {topSongs.length === 0 && (
            <p className={ui.emptyState}>{strings.noDataForMonth}</p>
          )}
          {topSongs.map((song, i) => (
            <div
              key={`${song.title}-${song.artist}`}
              className={`${styles.rankRow} ${ui.row}`}
            >
              <span className={styles.rowMeta}>{i + 1}</span>
              <div className={ui.itemText}>
                <Link
                  href={`/artists/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
                  className={ui.itemTitle}
                >
                  {song.title}
                </Link>
                <Link
                  href={`/artists/${encodeURIComponent(song.artist)}`}
                  className={ui.itemSub}
                >
                  {song.artist}
                </Link>
              </div>
              <span className={styles.rowMeta}>
                {formatNumber(song.playCount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
