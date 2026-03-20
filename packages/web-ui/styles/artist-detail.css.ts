import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const backLink = style({
  display: "inline-flex",
  alignItems: "center",
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  textDecoration: "none",
  marginBottom: vars.space["6"],
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accent,
  },
});

export const headerRow = style({
  display: "flex",
  alignItems: "baseline",
  gap: vars.space["3"],
  marginBottom: vars.space["6"],
  flexWrap: "wrap",
});

export const playCount = style({
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
});

export const stationBreakdown = style({
  display: "flex",
  gap: vars.space["3"],
  marginBottom: vars.space["6"],
  flexWrap: "wrap",
});

export const stationBreakdownItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space["2"],
});

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
  "@media": {
    "(max-width: 639px)": {
      display: "none",
    },
  },
});

export const th = style({
  textAlign: "left",
  padding: `${vars.space["2"]} ${vars.space["3"]}`,
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textSecondary,
  borderBottom: `2px solid ${vars.color.border}`,
});

export const td = style({
  padding: `${vars.space["3"]}`,
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.textPrimary,
  borderBottom: `1px solid ${vars.color.border}`,
  verticalAlign: "middle",
});

export const tdTime = style([
  td,
  {
    fontSize: vars.fontSize.sm,
    color: vars.color.textSecondary,
    whiteSpace: "nowrap",
  },
]);

export const mobileList = style({
  display: "none",
  flexDirection: "column",
  gap: vars.space["3"],
  "@media": {
    "(max-width: 639px)": {
      display: "flex",
    },
  },
});

export const mobileCard = style({
  backgroundColor: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space["4"],
});

export const songLink = style({
  color: vars.color.textPrimary,
  textDecoration: "none",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accent,
  },
});

export const mobileTitle = style({
  display: "block",
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  fontWeight: 500,
  color: vars.color.textPrimary,
  textDecoration: "none",
  marginBottom: vars.space["1"],
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accent,
  },
});

export const mobileMeta = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space["2"],
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
});
