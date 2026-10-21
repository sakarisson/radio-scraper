import Link from "next/link";
import {
  getTopArtistsForMonth,
  getTopSongsForMonth,
} from "@/utils/database";
import * as styles from "@/styles/charts.css";
import * as ui from "@/styles/ui.css";
import { T } from "../components/T";
import { formatNumber } from "@/utils/format";

type Row = {
  key: string;
  name: string;
  href: string;
  artist?: { name: string; href: string };
  playCount: number;
};

function RankedList({
  title,
  rows,
}: {
  title: React.ReactNode;
  rows: Row[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.playCount));
  return (
    <div>
      <div className={ui.sectionHeader}>
        <h2 className={ui.sectionTitle}>{title}</h2>
      </div>
      {rows.map((row, i) => (
        <div key={row.key} className={`${styles.rankRow} ${ui.row}`}>
          <span className={styles.rankMeta}>{i + 1}</span>
          <div className={styles.rankBody}>
            <div className={ui.itemText}>
              <Link href={row.href} className={ui.itemTitle}>
                {row.name}
              </Link>
              {row.artist && (
                <Link href={row.artist.href} className={ui.itemSub}>
                  {row.artist.name}
                </Link>
              )}
            </div>
            <div className={ui.thinTrack}>
              <div
                className={ui.thinFill}
                style={{ width: `${(row.playCount / max) * 100}%` }}
              />
            </div>
          </div>
          <span className={styles.rankPlays}>
            <T>
              {(s, lang) => `${formatNumber(row.playCount, lang)} ${s.playsLabel}`}
            </T>
          </span>
        </div>
      ))}
    </div>
  );
}

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
      <p className={ui.emptyState}>
        <T>{(s) => s.noDataForMonth}</T>
      </p>
    );
  }

  const artistHref = (name: string) => `/artists/${encodeURIComponent(name)}`;

  return (
    <div className={styles.columns}>
      <RankedList
        title={<T>{(s) => s.topArtists}</T>}
        rows={topArtists.map((artist) => ({
          key: artist.name,
          name: artist.name,
          href: artistHref(artist.name),
          playCount: artist.playCount,
        }))}
      />
      <RankedList
        title={<T>{(s) => s.topSongs}</T>}
        rows={topSongs.map((song) => ({
          key: `${song.title}-${song.artist}`,
          name: song.title,
          href: `${artistHref(song.artist)}/${encodeURIComponent(song.title)}`,
          artist: { name: song.artist, href: artistHref(song.artist) },
          playCount: song.playCount,
        }))}
      />
    </div>
  );
}
