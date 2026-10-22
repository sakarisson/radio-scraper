import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { getLang } from "@/utils/lang";
import { strings } from "@/utils/strings";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
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

export async function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams,
}: Props) {
  if (totalPages <= 1) return null;
  const s = strings[await getLang()];

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className={ui.pagination}>
      <span>{s.pageOf(currentPage + 1, totalPages)}</span>
      <div className={ui.paginationButtons}>
        {hasPrev ? (
          <Link
            href={buildHref(basePath, currentPage - 1, extraParams)}
            className={ui.pill.enabled}
          >
            {s.previousPage}
          </Link>
        ) : (
          <span className={ui.pill.disabled}>{s.previousPage}</span>
        )}
        {hasNext ? (
          <Link
            href={buildHref(basePath, currentPage + 1, extraParams)}
            className={ui.pill.enabled}
          >
            {s.nextPage}
          </Link>
        ) : (
          <span className={ui.pill.disabled}>{s.nextPage}</span>
        )}
      </div>
    </div>
  );
}
