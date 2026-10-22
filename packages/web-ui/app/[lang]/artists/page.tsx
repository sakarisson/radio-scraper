import { z } from "zod";
import Link from "next/link";
import { connection } from "next/server";
import {
  getTopArtistsForMonth,
  getTopArtistsAllTime,
  getArtistCountWithPlays,
} from "@/utils/database";
import * as styles from "@/styles/artists.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
import { formatNumber } from "@/utils/format";
import { getCurrentMonth } from "@/utils/months";
import { Pagination } from "@/app/components/Pagination";

const PAGE_SIZE = 30;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const paramsSchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    q: z.string().optional(),
  })
  .optional();

export default async function ArtistsPage(props: Props) {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const lang = await getLang();
  const s = strings[lang];
  const r = routes(lang);
  const parsed = paramsSchema.safeParse(await props.searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const query = parsed.success ? parsed.data?.q?.trim() || undefined : undefined;
  const offset = page * PAGE_SIZE;
  const isSearching = !!query;

  const now = getCurrentMonth();

  const [leaderboard, matchingCount, totalCount, trending] = await Promise.all([
    getTopArtistsAllTime(offset, PAGE_SIZE, query),
    getArtistCountWithPlays(query),
    isSearching ? getArtistCountWithPlays() : null,
    isSearching
      ? Promise.resolve([])
      : getTopArtistsForMonth(now.year, now.month, 5),
  ]);

  const totalPages = Math.ceil(matchingCount / PAGE_SIZE);

  return (
    <>
      <section className={ui.intro.page}>
        <span className={ui.eyebrow}>
          {s.artists}
        </span>
        <h1 className={ui.display.md}>
          {s.artistCount(formatNumber(totalCount ?? matchingCount, lang))}
        </h1>
      </section>

      {trending.length > 0 && (
        <section className={ui.section.md}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>
              {s.trending}
            </h2>
          </div>
          <div className={styles.trendingGrid}>
            {trending.map((artist, i) => (
              <Link
                key={artist.name}
                href={r.artist(artist.name)}
                className={`${styles.trendingCard} ${ui.softCard} ${ui.blockLink}`}
              >
                <span className={styles.small}>{i + 1}</span>
                <span>
                  <span className={styles.trendingName}>{artist.name}</span>
                  <span className={styles.small}>
                    {`${formatNumber(artist.playCount, lang)} ${s.playsLabel}`}
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
            {(query ? s.resultsFor(query) : s.allArtistsByPlays)}
          </h2>
          <form action={r.artists} method="GET" role="search">
            <input
              type="search"
              name="q"
              defaultValue={query ?? ""}
              className={ui.searchInput}
              aria-label={s.searchArtistsPlaceholder}
              placeholder={s.searchArtistsPlaceholder}
            />
          </form>
        </div>

        {leaderboard.length > 0 ? (
          <div className={styles.leaderboard}>
            {leaderboard.map((artist, i) => (
              <Link
                href={r.artist(artist.name)}
                key={artist.id}
                className={`${styles.leaderboardRow} ${ui.row} ${ui.blockLink}`}
              >
                <span className={styles.small}>
                  {formatNumber(offset + i + 1, lang)}
                </span>
                <span className={styles.leaderboardName}>{artist.name}</span>
                <span className={styles.small}>
                  {formatNumber(artist.playCount, lang)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className={ui.emptyState}>
            {query ? s.noArtistsFoundMatching(query) : s.noArtistsFound}
          </p>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={r.artists}
          extraParams={{ q: query }}
        />
      </section>
    </>
  );
}
