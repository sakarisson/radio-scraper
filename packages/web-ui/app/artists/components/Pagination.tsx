import Link from "next/link";
import * as styles from "@/styles/pagination.css";
import { strings } from "@/utils/strings";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
};

function buildHref(
  basePath: string,
  page: number,
  extraParams?: Record<string, string>
) {
  const params = new URLSearchParams();
  if (page > 0) params.set("page", String(page));
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams,
}: Props) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className={styles.pagination}>
      {hasPrev ? (
        <Link
          href={buildHref(basePath, currentPage - 1, extraParams)}
          className={styles.pageLink}
        >
          {strings.previousPage}
        </Link>
      ) : (
        <span className={styles.pageLinkDisabled}>{strings.previousPage}</span>
      )}
      <span className={styles.pageInfo}>
        {strings.pageOf(currentPage + 1, totalPages)}
      </span>
      {hasNext ? (
        <Link
          href={buildHref(basePath, currentPage + 1, extraParams)}
          className={styles.pageLink}
        >
          {strings.nextPage}
        </Link>
      ) : (
        <span className={styles.pageLinkDisabled}>{strings.nextPage}</span>
      )}
    </div>
  );
}
