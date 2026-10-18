import { z } from "zod";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  getStation,
  getStationPlays,
  getTotalPlayCount,
} from "@/utils/database";
import * as styles from "@/styles/stations.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { formatNumber, formatShare, playTime, timeAgo } from "@/utils/format";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Pagination } from "@/app/components/Pagination";
import { StationDot } from "@/app/components/Station";
import { Stats } from "@/app/components/Stats";
import { isStale } from "@/utils/stations";

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
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const parsed = paramsSchema.safeParse(await searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const offset = page * PAGE_SIZE;

  const station = await getStation(slug);
  if (station === null) {
    notFound();
  }

  const [plays, allPlaysCount, latest] = await Promise.all([
    getStationPlays(station.id, offset, PAGE_SIZE),
    getTotalPlayCount(),
    page === 0 ? null : getStationPlays(station.id, 0, 1),
  ]);

  const totalCount = station.playCount;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const latestPlay = page === 0 ? plays[0] : latest?.[0];

  const songHref = (artist: string, title: string) =>
    `/artists/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const artistHref = (artist: string) =>
    `/artists/${encodeURIComponent(artist)}`;

  return (
    <>
      <Breadcrumbs items={[{ href: "/stations", label: strings.stationsTitle }]} />

      <section className={ui.intro.detail}>
        <div className={styles.titleRow}>
          <StationDot station={slug} size="lg" />
          <h1 className={ui.display.lg}>{slug}</h1>
        </div>
        <div className={ui.introStats}>
          <Stats
            items={[
              { value: formatNumber(totalCount), label: strings.plays },
              {
                value: formatShare(totalCount, allPlaysCount),
                label: strings.ofAllPlays,
              },
            ]}
          />
        </div>
      </section>

      {latestPlay && (
        <section className={ui.section.sm}>
          <div
            className={`${styles.latestCard} ${ui.softCard} ${isStale(latestPlay.time_played) ? styles.stale : ""}`}
          >
            <span className={ui.aside}>
              {strings.lastPlayedCard(timeAgo(latestPlay.time_played))}
            </span>
            <div className={ui.itemText} style={{ gap: 6 }}>
              <Link
                href={songHref(latestPlay.artist, latestPlay.title)}
                className={styles.latestSong}
              >
                {latestPlay.title}
              </Link>
              <Link
                href={artistHref(latestPlay.artist)}
                className={styles.latestArtist}
              >
                {latestPlay.artist}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>{strings.recentPlaysOn(slug)}</h2>
        </div>
        {plays.map((play) => (
          <div key={play.id} className={`${styles.playRow} ${ui.row}`}>
            <span className={ui.aside}>{playTime(play.time_played)}</span>
            <div className={ui.itemText}>
              <Link
                href={songHref(play.artist, play.title)}
                className={ui.itemTitle}
              >
                {play.title}
              </Link>
              <Link href={artistHref(play.artist)} className={ui.itemSub}>
                {play.artist}
              </Link>
            </div>
          </div>
        ))}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/stations/${rawSlug}`}
          prevLabel={strings.newerPlays}
          nextLabel={strings.olderPlays}
        />
      </section>
    </>
  );
}
