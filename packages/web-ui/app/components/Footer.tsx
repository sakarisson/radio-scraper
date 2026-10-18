import { getEarliestPlayDate } from "@/utils/database";
import * as styles from "@/styles/layout.css";
import { strings } from "@/utils/strings";
import { monthYear } from "@/utils/format";

export async function Footer() {
  const earliest = await getEarliestPlayDate();
  const dateStr = earliest ? monthYear(earliest) : "the beginning";

  return (
    <footer className={styles.footer}>
      <span>{strings.siteName}</span>
      <span>{strings.footerText(dateStr)}</span>
    </footer>
  );
}
