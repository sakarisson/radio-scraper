import Link from "next/link";
import * as styles from "@/styles/header.css";
import { strings } from "@/utils/strings";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.siteName}>
          {strings.siteName}
        </Link>
        <nav className={styles.nav}>
          <Link href="/artists" className={styles.navLink}>
            {strings.navArtists}
          </Link>
        </nav>
      </div>
    </header>
  );
}
