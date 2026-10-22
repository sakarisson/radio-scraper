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
import { Stats } from "@/app/components/Stats";
import { StationDot, StationLink } from "@/app/components/Station";
import { clockTime, formatNumber, timeAgo } from "@/utils/format";
import { getLastCompletedMonth, MONTH_NAMES } from "@/utils/months";
import { compareStations, isStale, stationName } from "@/utils/stations";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
import { strings } from "@/utils/strings";

export default async function Home() {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const lang = await getLang();
  const s = strings[lang];
  const r = routes(lang);
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
        <h1 className={styles.heroTitle}>
          {s.homeTitle}
        </h1>
        <Stats
          items={[
            {
              value: formatNumber(stats.artistCount, lang),
              label: s.artists,
            },
            {
              value: formatNumber(stats.songCount, lang),
              label: s.songs,
            },
            {
              value: formatNumber(stats.playCount, lang),
              label: s.plays,
            },
          ]}
        />
      </section>

      <section>
        <div className={ui.sectionHeader} style={{ paddingBottom: 24 }}>
          <h2 className={ui.sectionTitle}>
            {s.lastPlayed}
          </h2>
          <span className={ui.aside}>
            {s.lastPlayedHint}
          </span>
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
                  href={r.station(play.station)}
                  className={styles.stationCardLink}
                >
                  {stationName(play.station)}
                </Link>
                <span className={styles.stationCardAgo}>
                  {timeAgo(play.time_played, lang)}
                </span>
              </div>
              <div className={styles.stationCardBody}>
                <Link
                  href={r.song(play.artist, play.title)}
                  className={`${styles.stationCardSong} ${styles.stationCardInnerLink}`}
                >
                  {play.title}
                </Link>
                <Link
                  href={r.artist(play.artist)}
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
            <h2 className={ui.sectionTitle}>
              {s.recentPlays}
            </h2>
            <Link href={r.artists} className={ui.aside}>
              {s.browseAllArtists}
            </Link>
          </div>
          {recentPlays.map((play) => (
            <div key={play.id} className={`${styles.recentRow} ${ui.row}`}>
              <span className={styles.rowMeta}>
                {clockTime(play.time_played)}
              </span>
              <div className={ui.itemText}>
                <Link
                  href={r.song(play.artist, play.title)}
                  className={ui.itemTitle}
                >
                  {play.title}
                </Link>
                <Link
                  href={r.artist(play.artist)}
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
              {s.topSongsOfMonth(MONTH_NAMES[lang][chartMonth.month - 1])}
            </h2>
            <Link href={r.charts} className={ui.aside}>
              {s.monthlyCharts}
            </Link>
          </div>
          {topSongs.length === 0 && (
            <p className={ui.emptyState}>
              {s.noDataForMonth}
            </p>
          )}
          {topSongs.map((song, i) => (
            <div
              key={`${song.title}-${song.artist}`}
              className={`${styles.rankRow} ${ui.row}`}
            >
              <span className={styles.rowMeta}>{i + 1}</span>
              <div className={ui.itemText}>
                <Link
                  href={r.song(song.artist, song.title)}
                  className={ui.itemTitle}
                >
                  {song.title}
                </Link>
                <Link
                  href={r.artist(song.artist)}
                  className={ui.itemSub}
                >
                  {song.artist}
                </Link>
              </div>
              <span className={styles.rowMeta}>
                {formatNumber(song.playCount, lang)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
