import { style, styleVariants } from "@vanilla-extract/css";

// Text is rendered in every language and these show the chosen one, driven by
// the `data-lang` attribute on <html> so it is right on first paint, without
// waiting for React. No attribute means Faroese, the default.
// `display: contents` keeps the wrapper out of the layout.
export const showInLang = styleVariants({
  fo: {
    display: "contents",
    selectors: { ':root[data-lang="en"] &': { display: "none" } },
  },
  en: {
    display: "none",
    selectors: { ':root[data-lang="en"] &': { display: "contents" } },
  },
});

/** Read by screen readers, but not shown. */
export const visuallyHidden = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
});
