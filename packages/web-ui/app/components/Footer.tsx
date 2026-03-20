import { getEarliestPlayDate } from "@/utils/database";
import * as styles from "@/styles/footer.css";
import { strings } from "@/utils/strings";
import format from "date-fns/format";

export async function Footer() {
  const earliest = await getEarliestPlayDate();
  const dateStr = earliest
    ? format(new Date(earliest), "MMMM yyyy")
    : "the beginning";

  return (
    <footer className={styles.footer}>{strings.footerText(dateStr)}</footer>
  );
}
