import Link from "next/link";
import {
  getTopArtistsForMonth,
  getTopSongsForMonth,
} from "@/utils/database";
import * as styles from "@/styles/charts.css";
import { strings } from "@/utils/strings";

export async function ChartResults({
  year,
  month,
  selectedSlugs,
}: {
  year: number;
  month: number;
  selectedSlugs?: string[];
}) {
  const [topArtists, topSongs] = await Promise.all([
    getTopArtistsForMonth(year, month, 10, selectedSlugs),
    getTopSongsForMonth(year, month, 10, selectedSlugs),
  ]);

  if (topArtists.length === 0 && topSongs.length === 0) {
    return (
      <div className={styles.emptyState}>{strings.noDataForMonth}</div>
    );
  }

  return (
    <div className={styles.listsGrid}>
      <div className={styles.listSection}>
        <h2 className={styles.listHeading}>{strings.topArtists}</h2>
        <div className={styles.rankedList}>
          {topArtists.map((artist, i) => (
            <div key={artist.name} className={styles.rankedItem}>
              <span className={styles.rankNumber}>{i + 1}</span>
              <div className={styles.rankInfo}>
                <Link
                  href={`/artists/${artist.name}`}
                  className={styles.rankName}
                >
                  {artist.name}
                </Link>
              </div>
              <span className={styles.rankCount}>
                {artist.playCount} {strings.playsLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.listSection}>
        <h2 className={styles.listHeading}>{strings.topSongs}</h2>
        <div className={styles.rankedList}>
          {topSongs.map((song, i) => (
            <div
              key={`${song.title}-${song.artist}`}
              className={styles.rankedItem}
            >
              <span className={styles.rankNumber}>{i + 1}</span>
              <div className={styles.rankInfo}>
                <Link
                  href={`/artists/${song.artist}/${encodeURIComponent(song.title)}`}
                  className={styles.rankName}
                >
                  {song.title}
                </Link>
                <div className={styles.rankArtist}>
                  <Link
                    href={`/artists/${song.artist}`}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {song.artist}
                  </Link>
                </div>
              </div>
              <span className={styles.rankCount}>
                {song.playCount} {strings.playsLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
