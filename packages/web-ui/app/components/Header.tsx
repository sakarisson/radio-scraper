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
          <Link href="/charts" className={styles.navLink}>
            {strings.navCharts}
          </Link>
          <Link href="/stations" className={styles.navLink}>
            {strings.navStations}
          </Link>
        </nav>
      </div>
    </header>
  );
}
