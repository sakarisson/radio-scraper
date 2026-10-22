import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getAllStationSlugs, getEarliestPlayDate } from "@/utils/database";
import { faroeParts } from "@/utils/time";
import * as styles from "@/styles/charts.css";
import * as ui from "@/styles/ui.css";
import { capitalize } from "@/utils/format";
import { getLastCompletedMonth, MONTH_NAMES } from "@/utils/months";
import { StationDot } from "@/app/components/Station";
import { stationName } from "@/utils/stations";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
import { strings } from "@/utils/strings";
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

/** Months counted from year 0, so two months compare with < and >. */
function monthIndex(year: number, month: number) {
  return year * 12 + (month - 1);
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
  basePath: string,
  year: number,
  month: number,
  stations: string | undefined
) {
  const params = new URLSearchParams();
  params.set("month", formatMonthParam(year, month));
  if (stations) params.set("stations", stations);
  return `${basePath}?${params.toString()}`;
}

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Render per request: the page shows times relative to now. The data
  // itself is cached.
  await connection();
  const lang = await getLang();
  const s = strings[lang];
  const chartsPath = routes(lang).charts;
  const parsed = paramsSchema.safeParse(await searchParams);
  const monthParam = parsed.success ? parsed.data?.month : undefined;
  const stationsParam = parsed.success ? parsed.data?.stations : undefined;
  const { year, month } = parseMonth(monthParam);

  const [allSlugs, earliestPlay] = await Promise.all([
    getAllStationSlugs(),
    getEarliestPlayDate(),
  ]);
  const selectedSlugs = stationsParam
    ? stationsParam.split(",").filter((s) => allSlugs.includes(s))
    : undefined;

  // Only months with data have charts. Without this limit the month links
  // let crawlers page back through empty months forever.
  const lastCompleted = getLastCompletedMonth();
  const firstMonth = earliestPlay ? faroeParts(earliestPlay) : lastCompleted;
  const current = monthIndex(year, month);
  if (
    monthParam &&
    (month < 1 ||
      month > 12 ||
      current < monthIndex(firstMonth.year, firstMonth.month) ||
      current > monthIndex(lastCompleted.year, lastCompleted.month))
  ) {
    notFound();
  }

  const prev = getPrevMonth(year, month);
  const next = getNextMonth(year, month);
  const isBeforeFirstPrev =
    monthIndex(prev.year, prev.month) <
    monthIndex(firstMonth.year, firstMonth.month);
  const isFutureNext =
    monthIndex(next.year, next.month) >
    monthIndex(lastCompleted.year, lastCompleted.month);

  const currentStationsParam = selectedSlugs?.length
    ? selectedSlugs.join(",")
    : undefined;

  const suspenseKey = `${year}-${month}-${currentStationsParam ?? "all"}`;

  return (
    <>
      <section className={`${ui.intro.page} ${styles.header}`}>
        <div>
          <span className={ui.eyebrow}>
            {s.charts}
          </span>
          <div className={styles.monthPicker}>
            {isBeforeFirstPrev ? (
              <span className={styles.monthNav.disabled} aria-hidden>
                &#8249;
              </span>
            ) : (
              <Link
                href={buildChartsHref(
                  chartsPath,
                  prev.year,
                  prev.month,
                  currentStationsParam
                )}
                className={styles.monthNav.enabled}
              >
                <span aria-hidden>&#8249;</span>
                <span className={ui.visuallyHidden}>
                  {s.previousMonth}
                </span>
              </Link>
            )}
            <h1 className={ui.display.md}>
              {capitalize(`${MONTH_NAMES[lang][month - 1]} ${year}`)}
            </h1>
            {isFutureNext ? (
              <span className={styles.monthNav.disabled} aria-hidden>
                &#8250;
              </span>
            ) : (
              <Link
                href={buildChartsHref(
                  chartsPath,
                  next.year,
                  next.month,
                  currentStationsParam
                )}
                className={styles.monthNav.enabled}
              >
                <span aria-hidden>&#8250;</span>
                <span className={ui.visuallyHidden}>
                  {s.nextMonth}
                </span>
              </Link>
            )}
          </div>
        </div>

        <div className={styles.filters}>
          <Link
            href={buildChartsHref(chartsPath, year, month, undefined)}
            className={styles.filter[!currentStationsParam ? "active" : "idle"]}
            scroll={false}
          >
            <span
              className={ui.dot.sm}
              style={{ background: vars.color.ink }}
            />
            {s.allStations}
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
                href={buildChartsHref(chartsPath, year, month, nextSlugs)}
                className={styles.filter[isActive ? "active" : "idle"]}
                scroll={false}
                // Every combination and order of stations is a separate URL,
                // so crawlers shouldn't follow these
                rel="nofollow"
              >
                <StationDot station={slug} size="sm" />
                {stationName(slug)}
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
