"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LANG, isLang, LANG_CHANGE_EVENT, type Lang } from "@/utils/i18n";

function subscribe(onChange: () => void) {
  window.addEventListener(LANG_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(LANG_CHANGE_EVENT, onChange);
}

function getLang(): Lang {
  const lang = document.documentElement.dataset.lang;
  return isLang(lang) ? lang : DEFAULT_LANG;
}

/**
 * The visitor's language. The server and the first client render use the
 * default, then it switches to the stored choice right after hydration.
 */
export function useLang() {
  return useSyncExternalStore(subscribe, getLang, () => DEFAULT_LANG);
}
