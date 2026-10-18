import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";

export function Breadcrumbs({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={strings.breadcrumb} className={ui.crumbs}>
      {items.map(({ href, label }) => (
        <span key={href} className={ui.crumb}>
          <Link href={href}>{label}</Link>
          <span aria-hidden>/</span>
        </span>
      ))}
    </nav>
  );
}
