import Link from "next/link";
import type { Lang } from "@/utils/i18n";
import { routes } from "@/utils/routes";
import * as styles from "@/styles/artist-detail.css";

type Segment = { text: string; artist?: string };

/**
 * Splits a combined credit into plain text and the members named in it:
 * "Faroe5 og Marius DC" -> "Faroe5" (FAROE5), " og ", "Marius DC" (Marius DC).
 * Null if a member can't be found in the text, e.g. when it's spelled
 * differently there.
 */
export function creditSegments(
  credit: string,
  members: string[]
): Segment[] | null {
  if (members.length === 0) return null;
  const haystack = credit.toLowerCase();
  if (haystack.length !== credit.length) return null;

  const segments: Segment[] = [];
  let at = 0;
  for (const member of members) {
    const needle = member.toLowerCase();
    const i = haystack.indexOf(needle, at);
    if (i === -1 || needle.length !== member.length) return null;
    if (i > at) segments.push({ text: credit.slice(at, i) });
    segments.push({ text: credit.slice(i, i + member.length), artist: member });
    at = i + member.length;
  }
  if (at < credit.length) segments.push({ text: credit.slice(at) });
  return segments;
}

/** A credit as written, with each member linked to their page. */
export function CreditLinks({
  segments,
  lang,
}: {
  segments: Segment[];
  lang: Lang;
}) {
  const r = routes(lang);
  return segments.map((segment, i) =>
    segment.artist ? (
      <Link key={i} href={r.artist(segment.artist)} className={styles.inlineLink}>
        {segment.text}
      </Link>
    ) : (
      segment.text
    )
  );
}

/** Linked artist names as a list: "A, B and C" or "A, B og C". */
export function ArtistList({ names, lang }: { names: string[]; lang: Lang }) {
  const r = routes(lang);
  const parts = new Intl.ListFormat(lang, { type: "conjunction" }).formatToParts(
    names
  );
  let index = 0;
  return parts.map((part, i) => {
    if (part.type !== "element") return part.value;
    const name = names[index++];
    return (
      <Link key={i} href={r.artist(name)} className={styles.inlineLink}>
        {part.value}
      </Link>
    );
  });
}
