import { showInLang } from "@/styles/i18n.css";
import { LANGS, type Lang } from "@/utils/i18n";
import { strings, type Strings } from "@/utils/strings";

/**
 * Renders text in every language, and CSS shows the one the visitor picked.
 * This keeps pages prerenderable and cacheable, with no flash of the wrong
 * language. For attributes (title, aria-label…), use `Localized` instead.
 *
 *   <T>{(s) => s.artists}</T>
 *   <T>{(s, lang) => s.lastPlayedAgo(timeAgo(date, lang))}</T>
 */
export function T({
  children,
}: {
  children: (s: Strings, lang: Lang) => React.ReactNode;
}) {
  return (
    <>
      {LANGS.map((lang) => (
        <span key={lang} lang={lang} className={showInLang[lang]}>
          {children(strings[lang], lang)}
        </span>
      ))}
    </>
  );
}
