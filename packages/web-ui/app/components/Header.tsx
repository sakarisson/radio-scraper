import { Suspense } from "react";
import Link from "next/link";
import * as styles from "@/styles/layout.css";
import { strings } from "@/utils/strings";
import { Nav, NavLinks } from "./Nav";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoDot} />
        {strings.siteName}
      </Link>
      <nav className={styles.nav}>
        {/* The current path isn't known when the page shell is prerendered,
            so the shell shows the links without a highlight */}
        <Suspense fallback={<NavLinks pathname={null} />}>
          <Nav />
        </Suspense>
        <ThemeToggle />
      </nav>
    </header>
  );
}
