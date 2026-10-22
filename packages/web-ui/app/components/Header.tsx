import { Suspense } from "react";
import Link from "next/link";
import * as styles from "@/styles/layout.css";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
import { strings } from "@/utils/strings";
import { LangLink, LangToggle } from "./LangToggle";
import { Nav, NavLinks } from "./Nav";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const lang = await getLang();
  return (
    <header className={styles.header}>
      <Link href={routes(lang).home} className={styles.logo}>
        <span className={styles.logoDot} />
        {strings[lang].siteName}
      </Link>
      <nav className={styles.nav}>
        {/* The current page isn't known when the page shell is prerendered,
            so the shell shows the links without a highlight */}
        <Suspense fallback={<NavLinks lang={lang} section={null} />}>
          <Nav lang={lang} />
        </Suspense>
        <Suspense fallback={<LangLink lang={lang} />}>
          <LangToggle lang={lang} />
        </Suspense>
        <ThemeToggle lang={lang} />
      </nav>
    </header>
  );
}
