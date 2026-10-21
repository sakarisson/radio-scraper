"use client";

import { useEffect } from "react";
import * as styles from "@/styles/layout.css";
import { showInLang } from "@/styles/i18n.css";
import { LANG_CHANGE_EVENT, LANG_STORAGE_KEY, type Lang } from "@/utils/i18n";
import { strings } from "@/utils/strings";
import { useLang } from "./useLang";

export function LangToggle() {
  const lang = useLang();

  // The tab title comes from the page metadata, which is in the default
  // language and can be written after hydration, so keep correcting it.
  useEffect(() => {
    const title = strings[lang].siteName;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [lang]);

  function toggle() {
    const next: Lang = lang === "en" ? "fo" : "en";
    document.documentElement.dataset.lang = next;
    document.documentElement.lang = next;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
  }

  // The label names the language you'd switch *to*, in that language.
  return (
    <button type="button" onClick={toggle} className={styles.themeToggle}>
      <span className={showInLang.fo} lang="en">
        English
      </span>
      <span className={showInLang.en} lang="fo">
        Føroyskt
      </span>
    </button>
  );
}
