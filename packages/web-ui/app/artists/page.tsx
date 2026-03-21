import { z } from "zod";
import Link from "next/link";
import {
  getTopArtistsForMonth,
  getTopArtistsAllTime,
  getArtistCountWithPlays,
} from "@/utils/database";
import { heading } from "@/styles/typography.css";
import * as styles from "@/styles/artists.css";
import { strings } from "@/utils/strings";
import { Pagination } from "./components/Pagination";

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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function ArtistsPage(props: Props) {
  const parsed = paramsSchema.safeParse(props.searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const query = parsed.success ? parsed.data?.q : undefined;
  const offset = page * PAGE_SIZE;
  const isSearching = !!query;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [leaderboard, totalCount, featuredArtists] = await Promise.all([
    getTopArtistsAllTime(offset, PAGE_SIZE, query),
    getArtistCountWithPlays(query),
    isSearching
      ? Promise.resolve([])
      : getTopArtistsForMonth(currentYear, currentMonth, 5),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <h1 className={heading}>{strings.artists}</h1>

      {!isSearching && featuredArtists.length > 0 && (
        <div className={styles.featuredSection}>
          <div className={styles.featuredHeader}>
            <span className={styles.featuredTitle}>Top this month</span>
            <span className={styles.featuredMonthLabel}>
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </span>
          </div>
          <div className={styles.featuredGrid}>
            <div className={styles.featuredCard}>
              <div className={styles.featuredList}>
                {featuredArtists.slice(0, 3).map((artist, i) => (
                  <div key={artist.name} className={styles.featuredItem}>
                    <span className={styles.featuredRank}>{i + 1}</span>
                    <Link
                      href={`/artists/${artist.name}`}
                      className={styles.featuredName}
                    >
                      {artist.name}
                    </Link>
                    <span className={styles.featuredCount}>
                      {artist.playCount.toLocaleString("en-US")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {featuredArtists.length > 3 && (
              <div className={styles.featuredCard}>
                <div className={styles.featuredList}>
                  {featuredArtists.slice(3).map((artist, i) => (
                    <div key={artist.name} className={styles.featuredItem}>
                      <span className={styles.featuredRank}>{i + 4}</span>
                      <Link
                        href={`/artists/${artist.name}`}
                        className={styles.featuredName}
                      >
                        {artist.name}
                      </Link>
                      <span className={styles.featuredCount}>
                        {artist.playCount.toLocaleString("en-US")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.leaderboardHeader}>
        <span className={styles.leaderboardTitle}>
          All artists
        </span>
        <span className={styles.leaderboardCount}>
          {totalCount.toLocaleString("en-US")}
        </span>
      </div>

      <form action="/artists" method="GET" className={styles.searchForm}>
        <input
          type="search"
          name="q"
          placeholder={strings.searchArtistsPlaceholder}
          defaultValue={query ?? ""}
          className={styles.searchInput}
        />
      </form>

      {leaderboard.length > 0 ? (
        <div className={styles.leaderboardList}>
          {leaderboard.map((artist, i) => (
            <Link
              href={`/artists/${artist.name}`}
              key={artist.id}
              className={styles.leaderboardRow}
            >
              <span className={styles.leaderboardRank}>
                {(offset + i + 1).toLocaleString("en-US")}
              </span>
              <span className={styles.leaderboardName}>{artist.name}</span>
              <span className={styles.leaderboardPlayCount}>
                {artist.playCount.toLocaleString("en-US")}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {query
            ? strings.noArtistsFoundMatching(query)
            : strings.noArtistsFound}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/artists"
        extraParams={query ? { q: query } : undefined}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
