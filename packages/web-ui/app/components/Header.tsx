import Link from "next/link";
import * as styles from "@/styles/layout.css";
import { strings } from "@/utils/strings";
import { Nav } from "./Nav";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoDot} />
        {strings.siteName}
      </Link>
      <nav className={styles.nav}>
        <Nav />
        <ThemeToggle />
      </nav>
    </header>
  );
}
