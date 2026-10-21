import Link from "next/link";
import * as ui from "@/styles/ui.css";
import { strings } from "@/utils/strings";
import { Localized } from "./Localized";

export function Breadcrumbs({
  items,
}: {
  items: { href: string; label: React.ReactNode }[];
}) {
  return (
    <Localized
      as="nav"
      props={{ className: ui.crumbs }}
      byLang={{
        fo: { "aria-label": strings.fo.breadcrumb },
        en: { "aria-label": strings.en.breadcrumb },
      }}
    >
      {items.map(({ href, label }) => (
        <span key={href} className={ui.crumb}>
          <Link href={href}>{label}</Link>
          <span aria-hidden>/</span>
        </span>
      ))}
    </Localized>
  );
}
