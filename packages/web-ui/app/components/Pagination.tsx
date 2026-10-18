import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
  prevLabel?: string;
  nextLabel?: string;
};

function buildHref(
  basePath: string,
  page: number,
  extraParams?: Record<string, string | undefined>
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

/** Previous/next links for pages addressed by cursor rather than number. */
export function CursorPagination({
  prevHref,
  nextHref,
  prevLabel = strings.previousPage,
  nextLabel = strings.nextPage,
}: {
  prevHref: string | null;
  nextHref: string | null;
  prevLabel?: string;
  nextLabel?: string;
}) {
  if (!prevHref && !nextHref) return null;

  return (
    <div className={ui.pagination}>
      <span />
      <div className={ui.paginationButtons}>
        {prevHref ? (
          <Link href={prevHref} className={ui.pill.enabled}>
            {prevLabel}
          </Link>
        ) : (
          <span className={ui.pill.disabled}>{prevLabel}</span>
        )}
        {nextHref ? (
          <Link href={nextHref} className={ui.pill.enabled}>
            {nextLabel}
          </Link>
        ) : (
          <span className={ui.pill.disabled}>{nextLabel}</span>
        )}
      </div>
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams,
  prevLabel = strings.previousPage,
  nextLabel = strings.nextPage,
}: Props) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className={ui.pagination}>
      <span>{strings.pageOf(currentPage + 1, totalPages)}</span>
      <div className={ui.paginationButtons}>
        {hasPrev ? (
          <Link
            href={buildHref(basePath, currentPage - 1, extraParams)}
            className={ui.pill.enabled}
          >
            {prevLabel}
          </Link>
        ) : (
          <span className={ui.pill.disabled}>{prevLabel}</span>
        )}
        {hasNext ? (
          <Link
            href={buildHref(basePath, currentPage + 1, extraParams)}
            className={ui.pill.enabled}
          >
            {nextLabel}
          </Link>
        ) : (
          <span className={ui.pill.disabled}>{nextLabel}</span>
        )}
      </div>
    </div>
  );
}
