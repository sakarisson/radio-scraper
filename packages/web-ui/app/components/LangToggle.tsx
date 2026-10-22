"use client";

import Link from "next/link";
import { useSearchParams, useSelectedLayoutSegments } from "next/navigation";
import * as styles from "@/styles/layout.css";
import type { Lang } from "@/utils/i18n";
import { pathInLang, routes } from "@/utils/routes";

const OTHER: Record<Lang, Lang> = { fo: "en", en: "fo" };

const LABEL: Record<Lang, string> = { en: "English", fo: "Føroyskt" };

export function LangLink({ lang, href }: { lang: Lang; href?: string }) {
  const other = OTHER[lang];
  return (
    <Link
      href={href ?? routes(other).home}
      hrefLang={other}
      lang={other}
      className={styles.themeToggle}
    >
      {LABEL[other]}
    </Link>
  );
}

export function LangToggle({ lang }: { lang: Lang }) {
  const other = OTHER[lang];
  const path = pathInLang(useSelectedLayoutSegments(), other);
  const query = useSearchParams().toString();
  return <LangLink lang={lang} href={query ? `${path}?${query}` : path} />;
}
