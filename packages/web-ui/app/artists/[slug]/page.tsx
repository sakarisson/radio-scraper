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
import * as styles from "@/styles/artist-detail.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { formatNumber, playTime, relativeTime } from "@/utils/format";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Pagination } from "@/app/components/Pagination";
import { StationLink } from "@/app/components/Station";
import { StationSplit } from "@/app/components/StationSplit";
import { Stats } from "@/app/components/Stats";

const PAGE_SIZE = 50;

const paramsSchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(["recent", "plays"]).optional(),
  })
  .optional();

const sortOptions = [
  { key: "recent", label: strings.sortLastPlayed },
  { key: "plays", label: strings.sortMostPlayed },
] as const;

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
  const sort = parsed.success ? parsed.data?.sort ?? "recent" : "recent";
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
  const songs = [...(songsOverview ?? [])].sort((a, b) =>
    sort === "plays"
      ? b.playCount - a.playCount
      : new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
  const maxSongPlays = Math.max(1, ...songs.map((s) => s.playCount));
  const artistHref = `/artists/${params.slug}`;

  function sortHref(key: (typeof sortOptions)[number]["key"]) {
    const qs = new URLSearchParams();
    if (key !== "recent") qs.set("sort", key);
    if (page > 0) qs.set("page", String(page));
    const s = qs.toString();
    return s ? `${artistHref}?${s}` : artistHref;
  }

  function fullDate(dateStr: string) {
    return format(new Date(dateStr), "MMM d, yyyy 'at' HH:mm");
  }

  return (
    <>
      <Breadcrumbs items={[{ href: "/artists", label: strings.artists }]} />

      <section className={ui.intro.detail}>
        <h1 className={ui.display.lg}>{artistName}</h1>
        <div className={ui.introStats}>
          <Stats
            items={[
              { value: formatNumber(totalCount), label: strings.plays },
              { value: formatNumber(songs.length), label: strings.songs },
            ]}
          />
        </div>
      </section>

      {stationBreakdown && stationBreakdown.length > 0 && (
        <section className={ui.section.sm}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{strings.playsByStation}</h2>
          </div>
          <StationSplit breakdown={stationBreakdown} />
        </section>
      )}

      {songs.length > 0 && (
        <section className={ui.section.lg}>
          <div className={ui.sectionHeader} style={{ alignItems: "center" }}>
            <h2 className={ui.sectionTitle}>{strings.songs}</h2>
            <div className={ui.segmented}>
              {sortOptions.map(({ key, label }) => (
                <Link
                  key={key}
                  href={sortHref(key)}
                  scroll={false}
                  className={ui.segment[sort === key ? "active" : "idle"]}
                  aria-current={sort === key ? "true" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className={`${styles.songHeader} ${ui.row}`}>
            <span>{strings.title}</span>
            <span>{strings.plays}</span>
            <span className={styles.hideMedium}>{strings.firstPlayed}</span>
            <span className={styles.hideNarrow}>{strings.lastPlayed}</span>
          </div>
          {songs.map(({ songId, title, playCount, firstPlayed, lastPlayed }) => (
            <div key={songId} className={`${styles.songRow} ${ui.row}`}>
              <Link
                href={`${artistHref}/${encodeURIComponent(title)}`}
                className={styles.songTitle}
              >
                {title}
              </Link>
              <div className={styles.playsCell}>
                <span className={styles.playsNumber}>
                  {formatNumber(playCount)}
                </span>
                <div className={`${ui.thinTrack} ${styles.playsTrack}`}>
                  <div
                    className={ui.thinFill}
                    style={{ width: `${(playCount / maxSongPlays) * 100}%` }}
                  />
                </div>
              </div>
              <span
                className={`${ui.muted} ${styles.hideMedium}`}
                title={fullDate(firstPlayed)}
              >
                {relativeTime(firstPlayed)}
              </span>
              <span
                className={`${ui.muted} ${styles.hideNarrow}`}
                title={fullDate(lastPlayed)}
              >
                {relativeTime(lastPlayed)}
              </span>
            </div>
          ))}
        </section>
      )}

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader}>
          <h2 className={ui.sectionTitle}>{strings.recentPlays}</h2>
        </div>
        {plays.map(({ title, time_played, station, id }) => (
          <div key={id} className={`${styles.playRow} ${ui.row}`}>
            <Link
              href={`${artistHref}/${encodeURIComponent(title)}`}
              className={styles.songTitle}
            >
              {title}
            </Link>
            <StationLink station={station} />
            <span className={styles.playWhen}>{playTime(time_played)}</span>
          </div>
        ))}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={artistHref}
          extraParams={{ sort: sort === "recent" ? undefined : sort }}
          prevLabel={strings.newerPlays}
          nextLabel={strings.olderPlays}
        />
      </section>
    </>
  );
}
