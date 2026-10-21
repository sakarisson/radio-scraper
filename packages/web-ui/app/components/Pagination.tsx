import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { T } from "./T";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
  prevLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
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

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams,
  prevLabel = <T>{(s) => s.previousPage}</T>,
  nextLabel = <T>{(s) => s.nextPage}</T>,
}: Props) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className={ui.pagination}>
      <span>
        <T>{(s) => s.pageOf(currentPage + 1, totalPages)}</T>
      </span>
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
