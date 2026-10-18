import { connection } from "next/server";
import { getEarliestPlayDate } from "@/utils/database";
import * as styles from "@/styles/layout.css";
import { strings } from "@/utils/strings";
import { monthYear } from "@/utils/format";

export async function Footer() {
  // Keep database reads out of the build; the date itself is cached.
  await connection();
  const earliest = await getEarliestPlayDate();
  const since = earliest ? monthYear(earliest) : null;

  return (
    <footer className={styles.footer}>
      <span>{strings.siteName}</span>
      <span>{strings.footerText(since)}</span>
    </footer>
  );
}
