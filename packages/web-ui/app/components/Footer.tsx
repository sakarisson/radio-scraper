import { connection } from "next/server";
import { getEarliestPlayDate } from "@/utils/database";
import * as styles from "@/styles/layout.css";
import { monthYear } from "@/utils/format";
import { getLang } from "@/utils/lang";
import { strings } from "@/utils/strings";

export async function Footer() {
  // Keep database reads out of the build; the date itself is cached.
  await connection();
  const [earliest, lang] = await Promise.all([getEarliestPlayDate(), getLang()]);
  const s = strings[lang];

  return (
    <footer className={styles.footer}>
      <span>{s.siteName}</span>
      <span>{s.footerText(earliest ? monthYear(earliest, lang) : null)}</span>
    </footer>
  );
}
