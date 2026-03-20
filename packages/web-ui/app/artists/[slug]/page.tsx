import { z } from "zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistPlays, getArtistPlayCount } from "@/utils/database";
import format from "date-fns/format";
import { heading } from "@/styles/typography.css";
import * as styles from "@/styles/artist-detail.css";
import { strings } from "@/utils/strings";
import { StationBadge } from "@/app/components/StationBadge";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 50;

const paramsSchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  })
  .optional();

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: unknown;
}) {
  const artistName = decodeURIComponent(params.slug);
  const parsed = paramsSchema.safeParse(searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const offset = page * PAGE_SIZE;

  const [plays, totalCount] = await Promise.all([
    getArtistPlays(artistName, offset, PAGE_SIZE),
    getArtistPlayCount(artistName),
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
      <Link href="/artists" className={styles.backLink}>
        {strings.allArtists}
      </Link>

      <div className={styles.headerRow}>
        <h1 className={heading}>{artistName}</h1>
        <span className={styles.playCount}>
          {totalCount.toLocaleString("en-US")}{" "}
          {totalCount === 1 ? strings.play : strings.playsLabel}
        </span>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>{strings.title}</th>
            <th className={styles.th}>{strings.station}</th>
            <th className={styles.th}>{strings.timePlayed}</th>
          </tr>
        </thead>
        <tbody>
          {plays.map(({ title, time_played, station, id }) => (
            <tr key={id}>
              <td className={styles.td}>{title}</td>
              <td className={styles.td}>
                <StationBadge station={station} />
              </td>
              <td className={styles.tdTime}>{formatDate(time_played)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.mobileList}>
        {plays.map(({ title, time_played, station, id }) => (
          <div key={id} className={styles.mobileCard}>
            <div className={styles.mobileTitle}>{title}</div>
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
        basePath={`/artists/${params.slug}`}
      />
    </div>
  );
}
