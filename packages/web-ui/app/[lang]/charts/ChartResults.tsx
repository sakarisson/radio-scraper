import Link from "next/link";
import {
  getTopArtistsForMonth,
  getTopSongsForMonth,
} from "@/utils/database";
import * as styles from "@/styles/charts.css";
import * as ui from "@/styles/ui.css";
import { formatNumber } from "@/utils/format";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
import { strings } from "@/utils/strings";

type Row = {
  key: string;
  name: string;
  href: string;
  artist?: { name: string; href: string };
  playCount: number;
};

async function RankedList({
  title,
  rows,
}: {
  title: React.ReactNode;
  rows: Row[];
}) {
  const lang = await getLang();
  const s = strings[lang];
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
            {`${formatNumber(row.playCount, lang)} ${s.playsLabel}`}
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
  const lang = await getLang();
  const s = strings[lang];
  const r = routes(lang);
  const [topArtists, topSongs] = await Promise.all([
    getTopArtistsForMonth(year, month, 10, selectedSlugs),
    getTopSongsForMonth(year, month, 10, selectedSlugs),
  ]);

  if (topArtists.length === 0 && topSongs.length === 0) {
    return (
      <p className={ui.emptyState}>
        {s.noDataForMonth}
      </p>
    );
  }

  return (
    <div className={styles.columns}>
      <RankedList
        title={s.topArtists}
        rows={topArtists.map((artist) => ({
          key: artist.name,
          name: artist.name,
          href: r.artist(artist.name),
          playCount: artist.playCount,
        }))}
      />
      <RankedList
        title={s.topSongs}
        rows={topSongs.map((song) => ({
          key: `${song.title}-${song.artist}`,
          name: song.title,
          href: r.song(song.artist, song.title),
          artist: { name: song.artist, href: r.artist(song.artist) },
          playCount: song.playCount,
        }))}
      />
    </div>
  );
}
