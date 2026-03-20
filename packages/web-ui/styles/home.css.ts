import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const hero = style({
  marginBottom: vars.space["12"],
});

export const subtitle = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  marginTop: vars.space["2"],
});

export const statsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: vars.space["4"],
  marginBottom: vars.space["12"],
});

export const statCard = style({
  backgroundColor: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space["6"],
  textAlign: "center",
});

export const statValue = style({
  fontSize: vars.fontSize["3xl"],
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.textPrimary,
  lineHeight: 1,
});

export const statLabel = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  marginTop: vars.space["1"],
});

export const sectionHeading = style({
  fontSize: vars.fontSize.xl,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  marginBottom: vars.space["4"],
});

export const recentList = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
  marginBottom: vars.space["8"],
});

export const recentItem = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space["3"],
  padding: `${vars.space["3"]} 0`,
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const recentInfo = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space["1"],
  minWidth: 0,
  flex: 1,
});

export const recentTitle = style({
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.textPrimary,
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const recentMeta = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space["2"],
  fontSize: vars.fontSize.sm,
  color: vars.color.textSecondary,
  fontFamily: vars.font.body,
});

export const recentRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space["3"],
  flexShrink: 0,
});

export const recentTime = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  color: vars.color.textMuted,
  whiteSpace: "nowrap",
});

export const ctaLink = style({
  display: "inline-flex",
  alignItems: "center",
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.accent,
  textDecoration: "none",
  fontWeight: 500,
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accentHover,
  },
});
