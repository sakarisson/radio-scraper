import { z } from "zod";
import Link from "next/link";
import { searchArtists, getArtistCount, getArtistPlayCounts } from "@/utils/database";
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

export default async function ArtistsPage(props: Props) {
  const parsed = paramsSchema.safeParse(props.searchParams);
  const page = parsed.success ? parsed.data?.page ?? 0 : 0;
  const query = parsed.success ? parsed.data?.q : undefined;
  const offset = page * PAGE_SIZE;

  const [artists, totalCount] = await Promise.all([
    searchArtists(query, offset, PAGE_SIZE),
    getArtistCount(query),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const artistIds = artists?.map((a) => a.id) ?? [];
  const playCounts = artistIds.length > 0 ? await getArtistPlayCounts(artistIds) : {};

  return (
    <div>
      <h1 className={heading}>{strings.artists}</h1>

      <form action="/artists" method="GET" className={styles.searchForm}>
        <input
          type="search"
          name="q"
          placeholder={strings.searchArtistsPlaceholder}
          defaultValue={query ?? ""}
          className={styles.searchInput}
        />
      </form>

      {artists && artists.length > 0 ? (
        <div className={styles.artistList}>
          {artists.map(({ id, name }) => (
            <Link href={`/artists/${name}`} key={id} className={styles.artistRow}>
              <span className={styles.artistName}>{name}</span>
              {playCounts[id] != null && playCounts[id] > 0 && (
                <span className={styles.playCountBadge}>
                  {playCounts[id].toLocaleString("en-US")} {strings.playsLabel}
                </span>
              )}
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
