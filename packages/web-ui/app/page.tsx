import Link from "next/link";
import { getStats, getRecentPlays } from "@/utils/database";
import { heading } from "@/styles/typography.css";
import * as styles from "@/styles/home.css";
import { StationBadge } from "./components/StationBadge";
import { link } from "@/styles/typography.css";
import { strings } from "@/utils/strings";
import format from "date-fns/format";

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export default async function Home() {
  const [stats, recentPlays] = await Promise.all([
    getStats(),
    getRecentPlays(10),
  ]);

  return (
    <div>
      <div className={styles.hero}>
        <h1 className={heading}>{strings.siteName}</h1>
        <p className={styles.subtitle}>{strings.homeSubtitle}</p>
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

      <Link href="/artists" className={styles.ctaLink}>
        {strings.browseAllArtists}
      </Link>
    </div>
  );
}

export const dynamic = "force-dynamic";
