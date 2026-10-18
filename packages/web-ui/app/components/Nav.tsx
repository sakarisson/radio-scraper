"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as styles from "@/styles/layout.css";
import { strings } from "@/utils/strings";

const items = [
  { href: "/artists", label: strings.navArtists },
  { href: "/charts", label: strings.navCharts },
  { href: "/stations", label: strings.navStations },
];

/** The nav links, with the one for the current section highlighted. */
export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <>
      {items.map(({ href, label }) => {
        const active =
          pathname !== null &&
          (pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
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

export function Nav() {
  return <NavLinks pathname={usePathname()} />;
}
