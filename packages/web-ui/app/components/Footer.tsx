import { getEarliestPlayDate } from "@/utils/database";
import * as styles from "@/styles/layout.css";
import { strings } from "@/utils/strings";
import format from "date-fns/format";

export async function Footer() {
  const earliest = await getEarliestPlayDate();
  const dateStr = earliest
    ? format(new Date(earliest), "MMMM yyyy")
    : "the beginning";

  return (
    <footer className={styles.footer}>
      <span>{strings.siteName}</span>
      <span>{strings.footerText(dateStr)}</span>
    </footer>
  );
}
