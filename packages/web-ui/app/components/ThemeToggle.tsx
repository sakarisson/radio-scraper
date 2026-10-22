"use client";

import * as styles from "@/styles/layout.css";
import { strings } from "@/utils/strings";
import type { Lang } from "@/utils/i18n";
import { THEME_STORAGE_KEY } from "@/utils/theme";

function currentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle({ lang }: { lang: Lang }) {
  const s = strings[lang];

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }

  return (
    <button type="button" onClick={toggle} className={styles.themeToggle}>
      <span className={styles.showWhenLight}>{s.themeDark}</span>
      <span className={styles.showWhenDark}>{s.themeLight}</span>
    </button>
  );
}
