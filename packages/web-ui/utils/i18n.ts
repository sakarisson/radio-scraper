export type Lang = "fo" | "en";

export const LANGS: Lang[] = ["fo", "en"];

/** Shown until a visitor picks a language. */
export const DEFAULT_LANG: Lang = "fo";

export const LANG_STORAGE_KEY = "lang";

/** Fired on `window` when the visitor switches language. */
export const LANG_CHANGE_EVENT = "langchange";

export function isLang(value: unknown): value is Lang {
  return value === "fo" || value === "en";
}

// Runs before first paint (see layout.tsx) so a stored choice doesn't flash.
export const langInitScript = `try{var l=localStorage.getItem("${LANG_STORAGE_KEY}");if(l==="fo"||l==="en"){document.documentElement.dataset.lang=l;document.documentElement.lang=l}}catch(e){}`;
