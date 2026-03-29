import { z } from "zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArtistPlays,
  getArtistPlayCount,
  getArtistStationBreakdown,
  getArtistSongsOverview,
} from "@/utils/database";
import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
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

  const [plays, totalCount, stationBreakdown, songsOverview] =
    await Promise.all([
      getArtistPlays(artistName, offset, PAGE_SIZE),
      getArtistPlayCount(artistName),
      getArtistStationBreakdown(artistName),
      getArtistSongsOverview(artistName),
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

      {songsOverview && songsOverview.length > 0 && (
        <div>
          <h2 className={styles.sectionHeading}>
            {strings.songs} ({songsOverview.length})
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>{strings.title}</th>
                <th className={styles.thRight}>{strings.plays}</th>
                <th className={styles.th}>First played</th>
                <th className={styles.th}>Last played</th>
              </tr>
            </thead>
            <tbody>
              {[...songsOverview]
                .sort(
                  (a, b) =>
                    new Date(b.lastPlayed).getTime() -
                    new Date(a.lastPlayed).getTime()
                )
                .map(
                  ({ songId, title, playCount, firstPlayed, lastPlayed }) => (
                    <tr key={songId}>
                      <td className={styles.td}>
                        <Link
                          href={`/artists/${params.slug}/${encodeURIComponent(title)}`}
                          className={styles.songLink}
                        >
                          {title}
                        </Link>
                      </td>
                      <td className={styles.tdRight}>
                        {playCount.toLocaleString("en-US")}
                      </td>
                      <td
                        className={styles.tdTime}
                        title={format(
                          new Date(firstPlayed),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      >
                        {formatDistanceToNow(new Date(firstPlayed), {
                          addSuffix: true,
                        })}
                      </td>
                      <td
                        className={styles.tdTime}
                        title={format(
                          new Date(lastPlayed),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      >
                        {formatDistanceToNow(new Date(lastPlayed), {
                          addSuffix: true,
                        })}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>

          <div className={styles.mobileList}>
            {[...songsOverview]
              .sort(
                (a, b) =>
                  new Date(b.lastPlayed).getTime() -
                  new Date(a.lastPlayed).getTime()
              )
              .map(
                ({ songId, title, playCount, firstPlayed, lastPlayed }) => (
                  <div key={songId} className={styles.mobileCard}>
                    <Link
                      href={`/artists/${params.slug}/${encodeURIComponent(title)}`}
                      className={styles.mobileTitle}
                    >
                      {title}
                    </Link>
                    <div className={styles.mobileMeta}>
                      <span>
                        {playCount.toLocaleString("en-US")}{" "}
                        {playCount === 1 ? strings.play : strings.playsLabel}
                      </span>
                      <span
                        title={`${format(new Date(firstPlayed), "MMM d, yyyy")} – ${format(new Date(lastPlayed), "MMM d, yyyy")}`}
                      >
                        {formatDistanceToNow(new Date(lastPlayed), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      )}

      <h2 className={styles.sectionHeading}>Recent plays</h2>

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
              <td className={styles.td}>
                <Link
                  href={`/artists/${params.slug}/${encodeURIComponent(title)}`}
                  className={styles.songLink}
                >
                  {title}
                </Link>
              </td>
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
            <Link
              href={`/artists/${params.slug}/${encodeURIComponent(title)}`}
              className={styles.mobileTitle}
            >
              {title}
            </Link>
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
