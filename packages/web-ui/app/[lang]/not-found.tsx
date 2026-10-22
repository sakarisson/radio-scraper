import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { getLang } from "@/utils/lang";
import { routes } from "@/utils/routes";
import { strings } from "@/utils/strings";

export default async function NotFound() {
  const lang = await getLang();
  const s = strings[lang];
  return (
    <section className={ui.intro.page}>
      <span className={ui.eyebrow}>{s.notFoundCode}</span>
      <h1 className={ui.display.md}>{s.notFoundMessage}</h1>
      <div className={ui.section.sm}>
        <Link href={routes(lang).home} className={ui.pill.enabled}>
          {s.goBackHome}
        </Link>
      </div>
    </section>
  );
}
