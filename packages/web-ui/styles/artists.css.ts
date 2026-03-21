import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const header = style({
  marginBottom: vars.space["6"],
});

export const resultCount = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  marginTop: vars.space["1"],
});

export const searchForm = style({
  marginBottom: vars.space["6"],
});

export const searchInput = style({
  width: "100%",
  padding: `${vars.space["3"]} ${vars.space["4"]}`,
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.bgSurface,
  color: vars.color.textPrimary,
  outline: "none",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
  "::placeholder": {
    color: vars.color.textMuted,
  },
  ":focus": {
    borderColor: vars.color.accent,
    boxShadow: `0 0 0 3px ${vars.color.accentLight}`,
  },
});

export const emptyState = style({
  textAlign: "center",
  padding: `${vars.space["12"]} 0`,
  color: vars.color.textSecondary,
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.base,
});

// Featured section
export const featuredSection = style({
  marginBottom: vars.space["8"],
});

export const featuredHeader = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: vars.space["4"],
});

export const featuredTitle = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  letterSpacing: "-0.02em",
});

export const featuredMonthLabel = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
});

export const featuredGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space["4"],
  "@media": {
    "(min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const featuredCard = style({
  backgroundColor: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space["4"],
});

export const featuredList = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
});

export const featuredItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space["3"],
  padding: `${vars.space["2"]} 0`,
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const featuredRank = style({
  fontSize: vars.fontSize["2xl"],
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.border,
  minWidth: "28px",
  textAlign: "right",
  lineHeight: 1,
});

export const featuredName = style({
  flex: 1,
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  fontWeight: 500,
  color: vars.color.textPrimary,
  textDecoration: "none",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accent,
  },
});

export const featuredCount = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textSecondary,
  backgroundColor: vars.color.bgHover,
  padding: `${vars.space["1"]} ${vars.space["2"]}`,
  borderRadius: vars.radius.sm,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

// Leaderboard section
export const leaderboardHeader = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: vars.space["4"],
});

export const leaderboardTitle = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  letterSpacing: "-0.02em",
});

export const leaderboardCount = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
});

export const leaderboardList = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
});

export const leaderboardRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space["3"],
  padding: `${vars.space["3"]} ${vars.space["2"]}`,
  borderBottom: `1px solid ${vars.color.border}`,
  textDecoration: "none",
  transition: "background-color 150ms ease",
  ":hover": {
    backgroundColor: vars.color.bgHover,
  },
  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const leaderboardRank = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textMuted,
  minWidth: "32px",
  textAlign: "right",
  flexShrink: 0,
});

export const leaderboardName = style({
  flex: 1,
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  fontWeight: 500,
  color: vars.color.textPrimary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const leaderboardPlayCount = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textSecondary,
  whiteSpace: "nowrap",
  flexShrink: 0,
});
