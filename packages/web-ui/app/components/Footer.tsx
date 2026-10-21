import { connection } from "next/server";
import { getEarliestPlayDate } from "@/utils/database";
import * as styles from "@/styles/layout.css";
import { T } from "./T";
import { monthYear } from "@/utils/format";

export async function Footer() {
  // Keep database reads out of the build; the date itself is cached.
  await connection();
  const earliest = await getEarliestPlayDate();

  return (
    <footer className={styles.footer}>
      <span>
        <T>{(s) => s.siteName}</T>
      </span>
      <span>
        <T>
          {(s, lang) =>
            s.footerText(earliest ? monthYear(earliest, lang) : null)
          }
        </T>
      </span>
    </footer>
  );
}
