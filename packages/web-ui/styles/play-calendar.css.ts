import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const GAP = "3px";

// Keeps the page from scrolling sideways on phones; the calendar scrolls
// instead. RTL makes it start scrolled to the most recent weeks.
export const scroller = style({
  overflowX: "auto",
  direction: "rtl",
});

export const body = style({
  direction: "ltr",
  minWidth: "560px",
  display: "grid",
  gridTemplateColumns: "28px minmax(0, 1fr)",
  gridTemplateRows: "auto auto",
  columnGap: "6px",
  rowGap: "4px",
  fontSize: "11px",
  color: vars.color.muted,
});

export const months = style({
  gridColumn: 2,
  gridRow: 1,
  display: "grid",
  columnGap: GAP,
  lineHeight: 1,
});

export const monthLabel = style({
  whiteSpace: "nowrap",
});

export const weekdays = style({
  gridColumn: 1,
  gridRow: 2,
  display: "grid",
  gridTemplateRows: "repeat(7, 1fr)",
  rowGap: GAP,
  alignItems: "center",
  lineHeight: 1,
});

export const cells = style({
  gridColumn: 2,
  gridRow: 2,
  display: "grid",
  gridTemplateRows: "repeat(7, auto)",
  gridAutoFlow: "column",
  gap: GAP,
});

const cellBase = style({
  aspectRatio: "1",
  borderRadius: "2px",
});

export const cell = styleVariants({
  // Days outside the tracked range (before tracking began, or in the future)
  none: [cellBase],
  0: [cellBase, { background: vars.color.soft }],
  1: [cellBase, { background: vars.color.heat1 }],
  2: [cellBase, { background: vars.color.heat2 }],
  3: [cellBase, { background: vars.color.heat3 }],
  4: [cellBase, { background: vars.color.heat4 }],
});

export const hoverable = style({
  ":hover": {
    outline: `1px solid ${vars.color.ink}`,
    outlineOffset: "1px",
  },
});

export const legend = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "8px 16px",
  paddingTop: "16px",
  fontSize: "13px",
  color: vars.color.muted,
});

export const legendItem = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
});

export const legendSwatch = style({
  width: "11px",
  height: "11px",
});
