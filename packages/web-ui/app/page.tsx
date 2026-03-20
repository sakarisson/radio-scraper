import Link from "next/link";
import { getStats, getRecentPlays, getLatestPlayPerStation } from "@/utils/database";
import * as styles from "@/styles/home.css";
import { StationBadge } from "./components/StationBadge";
import { link } from "@/styles/typography.css";
import { strings } from "@/utils/strings";
import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

const stationCardAccent: Record<string, string> = {
  kvf: styles.stationCardKvf,
  ras2: styles.stationCardRas2,
  lindin: styles.stationCardLindin,
};

export default async function Home() {
  const [stats, recentPlays, latestPerStation] = await Promise.all([
    getStats(),
    getRecentPlays(5),
    getLatestPlayPerStation(),
  ]);

  return (
    <div>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{strings.siteName}</h1>
        <p className={styles.subtitle}>{strings.homeSubtitle}</p>
      </div>

      <h2 className={styles.sectionHeading}>{strings.lastPlayed}</h2>
      <div className={styles.stationCards}>
        {latestPerStation.map((play) => (
          <div
            key={play.station}
            className={`${styles.stationCard} ${stationCardAccent[play.station] ?? ""}`}
          >
            <div className={styles.stationName}>{play.station}</div>
            <div className={styles.stationSong}>{play.title}</div>
            <Link
              href={`/artists/${play.artist}`}
              className={styles.stationArtist}
            >
              {play.artist}
            </Link>
            <div className={styles.stationTime}>
              {formatDistanceToNow(new Date(play.time_played), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {formatNumber(stats.artistCount)}
          </div>
          <div className={styles.statLabel}>{strings.artists}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {formatNumber(stats.songCount)}
          </div>
          <div className={styles.statLabel}>{strings.songs}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {formatNumber(stats.playCount)}
          </div>
          <div className={styles.statLabel}>{strings.plays}</div>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>{strings.recentPlays}</h2>
      <div className={styles.recentList}>
        {recentPlays.map((play) => (
          <div key={play.id} className={styles.recentItem}>
            <div className={styles.recentInfo}>
              <span className={styles.recentTitle}>{play.title}</span>
              <span className={styles.recentMeta}>
                <Link href={`/artists/${play.artist}`} className={link}>
                  {play.artist}
                </Link>
              </span>
            </div>
            <div className={styles.recentRight}>
              <StationBadge station={play.station} />
              <span className={styles.recentTime}>
                {format(new Date(play.time_played), "MMM d, HH:mm")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.ctaRow}>
        <Link href="/artists" className={styles.ctaLink}>
          {strings.browseAllArtists}
        </Link>
        <Link href="/charts" className={styles.ctaLink}>
          {strings.viewCharts}
        </Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
