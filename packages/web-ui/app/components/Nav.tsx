"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as styles from "@/styles/layout.css";
import { T } from "./T";

const items = [
  { href: "/artists", label: <T>{(s) => s.navArtists}</T> },
  { href: "/charts", label: <T>{(s) => s.navCharts}</T> },
  { href: "/stations", label: <T>{(s) => s.navStations}</T> },
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
