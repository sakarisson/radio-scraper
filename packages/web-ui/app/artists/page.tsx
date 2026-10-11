import { z } from "zod";
import Link from "next/link";
import {
  getTopArtistsForMonth,
  getTopArtistsAllTime,
  getArtistCountWithPlays,
} from "@/utils/database";
import * as styles from "@/styles/artists.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { formatNumber } from "@/utils/format";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 30;

type Props = {
  searchParams?: unknown;
};

const paramsSchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    q: z.string().optional(),
  })
  .optional();

export default async function ArtistsPage(props: Props) {
  const parsed = paramsSchema.safeParse(props.searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const query = parsed.success ? parsed.data?.q?.trim() || undefined : undefined;
  const offset = page * PAGE_SIZE;
  const isSearching = !!query;

  const now = new Date();

  const [leaderboard, matchingCount, totalCount, trending] = await Promise.all([
    getTopArtistsAllTime(offset, PAGE_SIZE, query),
    getArtistCountWithPlays(query),
    isSearching ? getArtistCountWithPlays() : null,
    isSearching
      ? Promise.resolve([])
      : getTopArtistsForMonth(now.getFullYear(), now.getMonth() + 1, 5),
  ]);

  const totalPages = Math.ceil(matchingCount / PAGE_SIZE);

  return (
    <>
      <section className={ui.intro.page}>
        <span className={ui.eyebrow}>{strings.artists}</span>
        <h1 className={ui.display.md}>
          {strings.artistCount(formatNumber(totalCount ?? matchingCount))}
        </h1>
      </section>

      {trending.length > 0 && (
        <section className={ui.section.md}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>{strings.trending}</h2>
          </div>
          <div className={styles.trendingGrid}>
            {trending.map((artist, i) => (
              <Link
                key={artist.name}
                href={`/artists/${encodeURIComponent(artist.name)}`}
                className={`${styles.trendingCard} ${ui.softCard} ${ui.blockLink}`}
              >
                <span className={styles.small}>{i + 1}</span>
                <span>
                  <span className={styles.trendingName}>{artist.name}</span>
                  <span className={styles.small}>
                    {formatNumber(artist.playCount)} {strings.playsLabel}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={ui.section.lg}>
        <div className={ui.sectionHeader} style={{ alignItems: "center" }}>
          <h2 className={ui.sectionTitle}>
            {query ? strings.resultsFor(query) : strings.allArtistsByPlays}
          </h2>
          <form action="/artists" method="GET" role="search">
            <input
              type="search"
              name="q"
              aria-label={strings.searchArtistsPlaceholder}
              placeholder={strings.searchArtistsPlaceholder}
              defaultValue={query ?? ""}
              className={ui.searchInput}
            />
          </form>
        </div>

        {leaderboard.length > 0 ? (
          <div className={styles.leaderboard}>
            {leaderboard.map((artist, i) => (
              <Link
                href={`/artists/${encodeURIComponent(artist.name)}`}
                key={artist.id}
                className={`${styles.leaderboardRow} ${ui.row} ${ui.blockLink}`}
              >
                <span className={styles.small}>
                  {formatNumber(offset + i + 1)}
                </span>
                <span className={styles.leaderboardName}>{artist.name}</span>
                <span className={styles.small}>
                  {formatNumber(artist.playCount)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className={ui.emptyState}>
            {query
              ? strings.noArtistsFoundMatching(query)
              : strings.noArtistsFound}
          </p>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/artists"
          extraParams={{ q: query }}
        />
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
