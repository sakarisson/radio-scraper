import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { T } from "@/app/components/T";

export default function NotFound() {
  return (
    <section className={ui.intro.page}>
      <span className={ui.eyebrow}><T>{(s) => s.notFoundCode}</T></span>
      <h1 className={ui.display.md}><T>{(s) => s.notFoundMessage}</T></h1>
      <div className={ui.section.sm}>
        <Link href="/" className={ui.pill.enabled}>
          <T>{(s) => s.goBackHome}</T>
        </Link>
      </div>
    </section>
  );
}
