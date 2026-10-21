import Link from "next/link";
import { connection } from "next/server";
import { getEarliestPlayDate, getStations } from "@/utils/database";
import * as styles from "@/styles/stations.css";
import * as ui from "@/styles/ui.css";
import { T } from "../components/T";
import {
  countWord,
  formatNumber,
  formatShare,
  monthYear,
  timeAgo,
} from "@/utils/format";
import { StationDot } from "../components/Station";
import { SplitBar } from "../components/StationSplit";
import { stationName } from "@/utils/stations";

export default async function StationsPage() {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const [unsorted, earliest] = await Promise.all([
    getStations(),
    getEarliestPlayDate(),
  ]);

  const stations = [...unsorted].sort((a, b) => b.playCount - a.playCount);
  const total = stations.reduce((sum, s) => sum + s.playCount, 0);

  return (
    <section className={ui.intro.page}>
      <span className={ui.eyebrow}>
        <T>{(s) => s.stationsTitle}</T>
      </span>
      <h1 className={`${ui.display.md} ${styles.summary}`}>
        <T>
          {(s, lang) =>
            s.stationsSummary(
              formatNumber(total, lang),
              countWord(stations.length, lang),
              earliest ? monthYear(earliest, lang) : null
            )
          }
        </T>
      </h1>

      <div className={styles.splitWrap}>
        <SplitBar
          items={stations.map((s) => ({
            station: s.slug,
            playCount: s.playCount,
          }))}
        />
      </div>

      {stations.map((station) => (
        <Link
          key={station.slug}
          href={`/stations/${station.slug}`}
          className={`${styles.stationRow} ${ui.row}`}
        >
          <span className={styles.stationName}>
            <StationDot station={station.slug} size="md" />
            {stationName(station.slug)}
          </span>
          <span className={styles.stationPlays}>
            <span>
              <T>{(_, lang) => formatNumber(station.playCount, lang)}</T>
            </span>
            <span className={styles.small}>
              <T>
                {(s) => s.playsShare(formatShare(station.playCount, total))}
              </T>
            </span>
          </span>
          {station.latestSong && (
            <span className={styles.stationLatest}>
              <span className={styles.small}>
                <T>
                  {(s, lang) =>
                    s.lastPlayedAgo(timeAgo(station.latestSong!.time_played, lang))
                  }
                </T>
              </span>
              <span className={styles.stationLatestSong}>
                {station.latestSong.title}
              </span>
              <span className={styles.stationLatestArtist}>
                {station.latestSong.artist}
              </span>
            </span>
          )}
          <span className={styles.arrow} aria-hidden>
            &rarr;
          </span>
        </Link>
      ))}
    </section>
  );
}
