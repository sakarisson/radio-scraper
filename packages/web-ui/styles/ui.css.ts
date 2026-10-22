import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const narrow = "(max-width: 640px)";

/* Page intros */

export const intro = styleVariants({
  // Top-level pages (artists, charts, stations)
  page: { paddingTop: "72px", "@media": { [narrow]: { paddingTop: "40px" } } },
  // Detail pages, which sit below breadcrumbs
  detail: { paddingTop: "24px" },
});

export const eyebrow = style({
  display: "block",
  fontSize: "15px",
  color: vars.color.muted,
  marginBottom: "16px",
});

const displayBase = style({
  fontWeight: 300,
  lineHeight: 1,
  textWrap: "balance",
});

export const display = styleVariants({
  md: [
    displayBase,
    { fontSize: "clamp(40px, 7vw, 56px)", letterSpacing: "-0.035em" },
  ],
  lg: [
    displayBase,
    { fontSize: "clamp(44px, 9vw, 72px)", letterSpacing: "-0.04em" },
  ],
});

/* Sections */

export const section = styleVariants({
  sm: { paddingTop: "56px" },
  md: { paddingTop: "72px", "@media": { [narrow]: { paddingTop: "56px" } } },
  lg: { paddingTop: "80px", "@media": { [narrow]: { paddingTop: "64px" } } },
});

export const sectionHeader = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "12px 16px",
  paddingBottom: "16px",
});

export const sectionTitle = style({
  fontSize: "15px",
  fontWeight: 500,
});

export const aside = style({
  fontSize: "14px",
  color: vars.color.muted,
});

/* Stats */

export const stats = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "32px 64px",
  "@media": { [narrow]: { gap: "24px 40px" } },
});

// Spacing between a detail page's title and its stats
export const introStats = style({
  paddingTop: "40px",
  "@media": { [narrow]: { paddingTop: "32px" } },
});

export const stat = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const statValue = style({
  fontSize: "32px",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  "@media": { [narrow]: { fontSize: "26px" } },
});

export const statLabel = style({
  fontSize: "14px",
  color: vars.color.muted,
});

/* Lists */

export const row = style({
  borderTop: `1px solid ${vars.color.line}`,
});

export const itemText = style({
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  minWidth: 0,
});

export const itemTitle = style({
  fontSize: "17px",
  fontWeight: 500,
  lineHeight: 1.3,
  overflowWrap: "anywhere",
});

export const itemSub = style({
  fontSize: "15px",
  color: vars.color.muted,
  overflowWrap: "anywhere",
});

export const muted = style({
  color: vars.color.muted,
});

export const emptyState = style([
  row,
  {
    padding: "24px 0",
    fontSize: "15px",
    color: vars.color.muted,
  },
]);

/* Links */

// For links wrapping a whole card or row, where an underline would be noise.
export const blockLink = style({
  ":hover": { textDecoration: "none" },
});

/* Station markers */

const dotBase = style({
  display: "inline-block",
  flexShrink: 0,
  borderRadius: "50%",
});

export const dot = styleVariants({
  xs: [dotBase, { width: "6px", height: "6px" }],
  sm: [dotBase, { width: "8px", height: "8px" }],
  md: [dotBase, { width: "10px", height: "10px" }],
  lg: [dotBase, { width: "18px", height: "18px" }],
});

export const stationLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  color: vars.color.muted,
});

/* Cards */

export const softCard = style({
  background: vars.color.soft,
  borderRadius: "4px",
});

/* Bars */

export const splitBar = style({
  display: "flex",
  height: "8px",
  gap: "3px",
});

export const splitSegment = style({
  borderRadius: "4px",
  minWidth: "4px",
});

export const splitLegend = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "12px 32px",
  paddingTop: "16px",
  fontSize: "15px",
});

export const splitLegendItem = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export const strong = style({
  fontWeight: 500,
});

export const thinTrack = style({
  height: "2px",
  background: vars.color.line,
  borderRadius: "2px",
});

export const thinFill = style({
  height: "2px",
  background: vars.color.ink,
  borderRadius: "2px",
});

/* Controls */

const pillBase = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  padding: "8px 16px",
  border: `1px solid ${vars.color.line}`,
  borderRadius: "999px",
  background: "none",
  whiteSpace: "nowrap",
});

export const pill = styleVariants({
  enabled: [
    pillBase,
    {
      color: vars.color.ink,
      ":hover": { textDecoration: "none", borderColor: vars.color.ink },
    },
  ],
  disabled: [pillBase, { color: vars.color.muted, opacity: 0.4 }],
});

export const segmented = style({
  display: "flex",
  gap: "4px",
  padding: "3px",
  border: `1px solid ${vars.color.line}`,
  borderRadius: "999px",
  fontSize: "14px",
});

const segmentBase = style({
  padding: "6px 14px",
  borderRadius: "999px",
  ":hover": { textDecoration: "none" },
});

export const segment = styleVariants({
  idle: [segmentBase, { color: vars.color.muted }],
  active: [segmentBase, { background: vars.color.ink, color: vars.color.bg }],
});

export const searchInput = style({
  fontSize: "15px",
  width: "260px",
  maxWidth: "100%",
  padding: "10px 16px",
  border: `1px solid ${vars.color.line}`,
  borderRadius: "999px",
  background: "transparent",
  color: vars.color.ink,
  outline: "none",
  ":focus": { borderColor: vars.color.ink },
});

/* Navigation helpers */

export const crumbs = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  paddingTop: "40px",
  fontSize: "15px",
  color: vars.color.muted,
  "@media": { [narrow]: { paddingTop: "24px" } },
});

export const crumb = style({
  display: "flex",
  gap: "8px",
});

export const pagination = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  paddingTop: "32px",
  fontSize: "14px",
  color: vars.color.muted,
});

export const paginationButtons = style({
  display: "flex",
  gap: "8px",
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
