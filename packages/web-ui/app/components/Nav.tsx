"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import * as styles from "@/styles/layout.css";
import type { Lang } from "@/utils/i18n";
import { routes } from "@/utils/routes";
import { strings } from "@/utils/strings";

export function NavLinks({
  lang,
  section,
}: {
  lang: Lang;
  section: string | null;
}) {
  const s = strings[lang];
  const r = routes(lang);
  const items = [
    { key: "artists", href: r.artists, label: s.navArtists },
    { key: "charts", href: r.charts, label: s.navCharts },
    { key: "stations", href: r.stations, label: s.navStations },
  ];

  return (
    <>
      {items.map(({ key, href, label }) => {
        const active = section === key;
        return (
          <Link
            key={key}
            href={href}
            className={styles.navLink[active ? "active" : "idle"]}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function Nav({ lang }: { lang: Lang }) {
  return <NavLinks lang={lang} section={useSelectedLayoutSegment()} />;
}
