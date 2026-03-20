import { z } from "zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSongPlays,
  getSongPlayCount,
  getSongStationBreakdown,
} from "@/utils/database";
import format from "date-fns/format";
import { heading } from "@/styles/typography.css";
import * as styles from "@/styles/artist-detail.css";
import { strings } from "@/utils/strings";
import { StationBadge } from "@/app/components/StationBadge";
import { Pagination } from "../../components/Pagination";

const PAGE_SIZE = 50;

const paramsSchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  })
  .optional();

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { slug: string; song: string };
  searchParams?: unknown;
}) {
  const artistName = decodeURIComponent(params.slug);
  const songTitle = decodeURIComponent(params.song);
  const parsed = paramsSchema.safeParse(searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const offset = page * PAGE_SIZE;

  const [plays, totalCount, stationBreakdown] = await Promise.all([
    getSongPlays(artistName, songTitle, offset, PAGE_SIZE),
    getSongPlayCount(artistName, songTitle),
    getSongStationBreakdown(artistName, songTitle),
  ]);

  if (plays === null || totalCount === null) {
    notFound();
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function formatDate(dateStr: string) {
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
  }

  return (
    <div>
      <Link href={`/artists/${params.slug}`} className={styles.backLink}>
        {strings.backToArtist(artistName)}
      </Link>

      <div className={styles.headerRow}>
        <h1 className={heading}>{songTitle}</h1>
        <span className={styles.playCount}>
          {totalCount.toLocaleString("en-US")}{" "}
          {totalCount === 1 ? strings.play : strings.playsLabel}
        </span>
      </div>

      {stationBreakdown && stationBreakdown.length > 0 && (
        <div className={styles.stationBreakdown}>
          {stationBreakdown.map(({ station, playCount }) => (
            <div key={station} className={styles.stationBreakdownItem}>
              <StationBadge station={station} />
              <span className={styles.playCount}>{playCount}</span>
            </div>
          ))}
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>{strings.station}</th>
            <th className={styles.th}>{strings.timePlayed}</th>
          </tr>
        </thead>
        <tbody>
          {plays.map(({ time_played, station, id }) => (
            <tr key={id}>
              <td className={styles.td}>
                <StationBadge station={station} />
              </td>
              <td className={styles.tdTime}>{formatDate(time_played)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.mobileList}>
        {plays.map(({ time_played, station, id }) => (
          <div key={id} className={styles.mobileCard}>
            <div className={styles.mobileMeta}>
              <StationBadge station={station} />
              <span>{formatDate(time_played)}</span>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/artists/${params.slug}/${params.song}`}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
