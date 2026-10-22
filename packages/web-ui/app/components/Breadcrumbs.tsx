import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { getLang } from "@/utils/lang";
import { strings } from "@/utils/strings";

export async function Breadcrumbs({
  items,
}: {
  items: { href: string; label: React.ReactNode }[];
}) {
  const s = strings[await getLang()];
  return (
    <nav className={ui.crumbs} aria-label={s.breadcrumb}>
      {items.map(({ href, label }) => (
        <span key={href} className={ui.crumb}>
          <Link href={href}>{label}</Link>
          <span aria-hidden>/</span>
        </span>
      ))}
    </nav>
  );
}
