import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const monthPicker = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space["4"],
  marginBottom: vars.space["8"],
});

export const monthLabel = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  minWidth: "160px",
  textAlign: "center",
});

export const monthNav = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  backgroundColor: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  textDecoration: "none",
  transition: "all 150ms ease",
  ":hover": {
    backgroundColor: vars.color.bgHover,
    borderColor: vars.color.textMuted,
  },
});

export const monthNavDisabled = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  fontSize: vars.fontSize.lg,
  color: vars.color.textMuted,
  backgroundColor: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  opacity: 0.5,
  cursor: "default",
});

export const currentMonth = style({
  color: vars.color.accent,
});

export const listsGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space["8"],
  "@media": {
    "(min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});

export const listSection = style({
  backgroundColor: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space["4"],
  minWidth: 0,
});

export const listHeading = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  marginBottom: vars.space["4"],
  letterSpacing: "-0.02em",
});

export const rankedList = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
});

export const rankedItem = style({
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

export const rankNumber = style({
  fontSize: vars.fontSize["2xl"],
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.border,
  minWidth: "32px",
  textAlign: "right",
  lineHeight: 1,
});

export const rankInfo = style({
  flex: 1,
  minWidth: 0,
});

export const rankName = style({
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  fontWeight: 500,
  color: vars.color.textPrimary,
  textDecoration: "none",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accent,
  },
});

export const rankArtist = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
});

export const rankCount = style({
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

export const stationFilter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space["2"],
  marginBottom: vars.space["6"],
  flexWrap: "wrap",
});

export const filterLabel = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  marginRight: vars.space["1"],
});

export const filterChip = style({
  display: "inline-block",
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  padding: `${vars.space["1"]} ${vars.space["3"]}`,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.bgSurface,
  color: vars.color.textSecondary,
  textDecoration: "none",
  transition: "all 150ms ease",
  ":hover": {
    borderColor: vars.color.textMuted,
    backgroundColor: vars.color.bgHover,
  },
});

export const filterChipActive = style({
  backgroundColor: vars.color.bgDark,
  color: vars.color.textOnDark,
  borderColor: vars.color.bgDark,
  ":hover": {
    backgroundColor: vars.color.bgDark,
    borderColor: vars.color.bgDark,
  },
});

export const emptyState = style({
  textAlign: "center",
  padding: `${vars.space["12"]} 0`,
  color: vars.color.textSecondary,
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.base,
});
