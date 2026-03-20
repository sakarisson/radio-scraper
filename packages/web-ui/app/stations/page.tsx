import Link from "next/link";
import { getStations } from "@/utils/database";
import { heading } from "@/styles/typography.css";
import * as styles from "@/styles/stations.css";
import { strings } from "@/utils/strings";

export default async function StationsPage() {
  const stations = await getStations();

  return (
    <div>
      <h1 className={heading}>{strings.stationsTitle}</h1>

      <div className={styles.stationGrid}>
        {stations.map((station) => (
          <Link
            key={station.slug}
            href={`/stations/${station.slug}`}
            className={styles.stationCard}
          >
            <div className={styles.stationSlug}>{station.slug}</div>
            <div className={styles.stationMeta}>
              {station.playCount.toLocaleString("en-US")} {strings.totalPlays}
            </div>
            {station.latestSong && (
              <div className={styles.stationLatest}>
                <span className={styles.stationLatestTitle}>
                  {station.latestSong.title}
                </span>{" "}
                &mdash; {station.latestSong.artist}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
