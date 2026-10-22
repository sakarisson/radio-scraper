import { lang as langParam } from "next/root-params";
import { DEFAULT_LANG, isLang, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const lang = await langParam();
  return isLang(lang) ? lang : DEFAULT_LANG;
}
