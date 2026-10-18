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
import { CursorPagination } from "@/app/components/Pagination";
import { StationDot } from "@/app/components/Station";
import { Stats } from "@/app/components/Stats";
import { isStale } from "@/utils/stations";

const PAGE_SIZE = 50;

const playId = z.string().regex(/^\d+$/).transform(Number).optional();

// Pages are addressed by a neighbouring play: ?before=<id> for older plays,
// ?after=<id> for newer ones. See getStationPlays.
const paramsSchema = z
  .object({ before: playId, after: playId })
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
  const cursor = (parsed.success && parsed.data) || {};

  const station = await getStation(slug);
  if (station === null) {
    notFound();
  }

  const isFirstPage = cursor.before === undefined && cursor.after === undefined;
  const [page, allPlaysCount, firstPage] = await Promise.all([
    getStationPlays(station.id, PAGE_SIZE, cursor),
    getTotalPlayCount(),
    isFirstPage ? null : getStationPlays(station.id, PAGE_SIZE),
  ]);

  const { plays } = page;
  const totalCount = station.playCount;
  const latestPlay = (firstPage ?? page).plays[0];

  const basePath = `/stations/${rawSlug}`;
  const newerHref =
    page.newerCursor === null ? null : `${basePath}?after=${page.newerCursor}`;
  const olderHref =
    page.olderCursor === null ? null : `${basePath}?before=${page.olderCursor}`;

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
        <CursorPagination
          prevHref={newerHref}
          nextHref={olderHref}
          prevLabel={strings.newerPlays}
          nextLabel={strings.olderPlays}
        />
      </section>
    </>
  );
}
