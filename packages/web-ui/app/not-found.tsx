import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";

export default function NotFound() {
  return (
    <section className={ui.intro.page}>
      <span className={ui.eyebrow}>{strings.notFoundCode}</span>
      <h1 className={ui.display.md}>{strings.notFoundMessage}</h1>
      <div className={ui.section.sm}>
        <Link href="/" className={ui.pill.enabled}>
          {strings.goBackHome}
        </Link>
      </div>
    </section>
  );
}
