export type Lang = "fo" | "en";

export const LANGS: Lang[] = ["fo", "en"];

export const DEFAULT_LANG: Lang = "fo";

export function isLang(value: unknown): value is Lang {
  return value === "fo" || value === "en";
}
