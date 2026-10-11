import { Suspense } from "react";
import Link from "next/link";
import { z } from "zod";
import { getAllStationSlugs } from "@/utils/database";
import * as styles from "@/styles/charts.css";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import format from "date-fns/format";
import { getLastCompletedMonth } from "@/utils/months";
import { StationDot } from "../components/Station";
import { vars } from "@/styles/theme.css";
import { ChartResults } from "./ChartResults";
import { ChartResultsSkeleton } from "./ChartResultsSkeleton";

const paramsSchema = z
  .object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
    stations: z.string().optional(),
  })
  .optional();

function parseMonth(param: string | undefined) {
  if (!param) {
    return getLastCompletedMonth();
  }
  const [y, m] = param.split("-").map(Number);
  return { year: y, month: m };
}

function formatMonthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getPrevMonth(year: number, month: number) {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

function getNextMonth(year: number, month: number) {
  return month === 12
    ? { year: year + 1, month: 1 }
    : { year, month: month + 1 };
}

function buildChartsHref(
  year: number,
  month: number,
  stations: string | undefined
) {
  const params = new URLSearchParams();
  params.set("month", formatMonthParam(year, month));
  if (stations) params.set("stations", stations);
  return `/charts?${params.toString()}`;
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams?: unknown;
}) {
  const parsed = paramsSchema.safeParse(searchParams);
  const monthParam = parsed.success ? parsed.data?.month : undefined;
  const stationsParam = parsed.success ? parsed.data?.stations : undefined;
  const { year, month } = parseMonth(monthParam);

  const allSlugs = await getAllStationSlugs();
  const selectedSlugs = stationsParam
    ? stationsParam.split(",").filter((s) => allSlugs.includes(s))
    : undefined;

  const prev = getPrevMonth(year, month);
  const next = getNextMonth(year, month);
  const lastCompleted = getLastCompletedMonth();
  const isFutureNext =
    next.year > lastCompleted.year ||
    (next.year === lastCompleted.year && next.month > lastCompleted.month);

  const monthDisplay = format(new Date(year, month - 1), "MMMM yyyy");

  const currentStationsParam = selectedSlugs?.length
    ? selectedSlugs.join(",")
    : undefined;

  const suspenseKey = `${year}-${month}-${currentStationsParam ?? "all"}`;

  return (
    <>
      <section className={`${ui.intro.page} ${styles.header}`}>
        <div>
          <span className={ui.eyebrow}>{strings.charts}</span>
          <div className={styles.monthPicker}>
            <Link
              href={buildChartsHref(prev.year, prev.month, currentStationsParam)}
              className={styles.monthNav.enabled}
              aria-label={strings.previousMonth}
            >
              &#8249;
            </Link>
            <h1 className={ui.display.md}>{monthDisplay}</h1>
            {isFutureNext ? (
              <span className={styles.monthNav.disabled} aria-hidden>
                &#8250;
              </span>
            ) : (
              <Link
                href={buildChartsHref(
                  next.year,
                  next.month,
                  currentStationsParam
                )}
                className={styles.monthNav.enabled}
                aria-label={strings.nextMonth}
              >
                &#8250;
              </Link>
            )}
          </div>
        </div>

        <div className={styles.filters}>
          <Link
            href={buildChartsHref(year, month, undefined)}
            className={styles.filter[!currentStationsParam ? "active" : "idle"]}
            scroll={false}
          >
            <span
              className={ui.dot.sm}
              style={{ background: vars.color.ink }}
            />
            {strings.allStations}
          </Link>
          {allSlugs.map((slug) => {
            const isActive = selectedSlugs?.includes(slug) ?? false;
            let nextSlugs: string | undefined;
            if (isActive) {
              const remaining = selectedSlugs!.filter((s) => s !== slug);
              nextSlugs =
                remaining.length > 0 ? remaining.join(",") : undefined;
            } else {
              nextSlugs = selectedSlugs?.length
                ? [...selectedSlugs, slug].join(",")
                : slug;
            }
            return (
              <Link
                key={slug}
                href={buildChartsHref(year, month, nextSlugs)}
                className={styles.filter[isActive ? "active" : "idle"]}
                scroll={false}
              >
                <StationDot station={slug} size="sm" />
                {slug}
              </Link>
            );
          })}
        </div>
      </section>

      <section className={ui.section.md}>
        <Suspense key={suspenseKey} fallback={<ChartResultsSkeleton />}>
          <ChartResults
            year={year}
            month={month}
            selectedSlugs={selectedSlugs}
          />
        </Suspense>
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
