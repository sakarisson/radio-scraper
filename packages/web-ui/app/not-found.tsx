import Link from "next/link";
import * as styles from "@/styles/not-found.css";
import { strings } from "@/utils/strings";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.code}>{strings.notFoundCode}</div>
      <p className={styles.message}>{strings.notFoundMessage}</p>
      <Link href="/" className={styles.homeLink}>
        {strings.goBackHome}
      </Link>
    </div>
  );
}
