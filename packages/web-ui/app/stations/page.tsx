import Link from "next/link";
import { getEarliestPlayDate, getStations } from "@/utils/database";
import * as styles from "@/styles/stations.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import {
  countWord,
  formatNumber,
  formatShare,
  monthYear,
  timeAgo,
} from "@/utils/format";
import { StationDot } from "../components/Station";
import { SplitBar } from "../components/StationSplit";

export default async function StationsPage() {
  const [unsorted, earliest] = await Promise.all([
    getStations(),
    getEarliestPlayDate(),
  ]);

  const stations = [...unsorted].sort((a, b) => b.playCount - a.playCount);
  const total = stations.reduce((sum, s) => sum + s.playCount, 0);
  const since = earliest ? monthYear(earliest) : "the start";

  return (
    <section className={ui.intro.page}>
      <span className={ui.eyebrow}>{strings.stationsTitle}</span>
      <h1 className={`${ui.display.md} ${styles.summary}`}>
        {strings.stationsSummary(
          formatNumber(total),
          countWord(stations.length),
          since
        )}
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
            {station.slug}
          </span>
          <span className={styles.stationPlays}>
            <span>{formatNumber(station.playCount)}</span>
            <span className={styles.small}>
              {strings.playsShare(formatShare(station.playCount, total))}
            </span>
          </span>
          {station.latestSong && (
            <span className={styles.stationLatest}>
              <span className={styles.small}>
                {strings.lastPlayedAgo(timeAgo(station.latestSong.time_played))}
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

export const dynamic = "force-dynamic";
