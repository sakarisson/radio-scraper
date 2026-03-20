import { z } from "zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStationPlays,
  getStationPlayCount,
  getTopArtistsForStation,
} from "@/utils/database";
import format from "date-fns/format";
import { heading } from "@/styles/typography.css";
import * as styles from "@/styles/station-detail.css";
import { strings } from "@/utils/strings";
import { Pagination } from "@/app/artists/components/Pagination";

const PAGE_SIZE = 50;

const paramsSchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  })
  .optional();

export default async function StationDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: unknown;
}) {
  const slug = decodeURIComponent(params.slug);
  const parsed = paramsSchema.safeParse(searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const offset = page * PAGE_SIZE;

  const [plays, totalCount, topArtists] = await Promise.all([
    getStationPlays(slug, offset, PAGE_SIZE),
    getStationPlayCount(slug),
    getTopArtistsForStation(slug),
  ]);

  if (plays === null || totalCount === null) {
    notFound();
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <Link href="/stations" className={styles.backLink}>
        {strings.allStations}
      </Link>

      <div className={styles.headerRow}>
        <h1 className={heading} style={{ textTransform: "uppercase" }}>
          {slug}
        </h1>
        <span className={styles.playCount}>
          {totalCount.toLocaleString("en-US")} {strings.playsLabel}
        </span>
      </div>

      <div className={styles.columns}>
        <div>
          <h2 className={styles.sectionHeading}>{strings.recentPlays}</h2>
          <div className={styles.playList}>
            {plays.map((play) => (
              <div key={play.id} className={styles.playItem}>
                <div className={styles.playInfo}>
                  <Link
                    href={`/artists/${play.artist}/${encodeURIComponent(play.title)}`}
                    className={styles.playTitle}
                  >
                    {play.title}
                  </Link>
                  <Link
                    href={`/artists/${play.artist}`}
                    className={styles.playArtist}
                  >
                    {play.artist}
                  </Link>
                </div>
                <span className={styles.playTime}>
                  {format(new Date(play.time_played), "MMM d, HH:mm")}
                </span>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/stations/${slug}`}
          />
        </div>

        {topArtists.length > 0 && (
          <div>
            <h2 className={styles.sectionHeading}>
              {strings.topArtistsForStation}
            </h2>
            <div className={styles.topArtistList}>
              {topArtists.map((artist, i) => (
                <div key={artist.name} className={styles.topArtistItem}>
                  <span className={styles.topArtistRank}>{i + 1}</span>
                  <Link
                    href={`/artists/${artist.name}`}
                    className={styles.topArtistName}
                  >
                    {artist.name}
                  </Link>
                  <span className={styles.topArtistCount}>
                    {artist.playCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
