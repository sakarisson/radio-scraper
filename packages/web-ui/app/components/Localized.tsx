"use client";

import { createElement } from "react";
import type { Lang } from "@/utils/i18n";
import { useLang } from "./useLang";

type Attributes = React.AllHTMLAttributes<HTMLElement>;

/**
 * An element with attributes in the visitor's language, for text that CSS
 * can't switch, like `title`, `aria-label` and `placeholder`. They start in
 * the default language and update right after hydration.
 */
export function Localized({
  as,
  props,
  byLang,
  children,
}: {
  as: "span" | "nav" | "input";
  props?: Attributes;
  byLang: Record<Lang, Attributes>;
  children?: React.ReactNode;
}) {
  const lang = useLang();
  return createElement(as, { ...props, ...byLang[lang] }, children);
}
