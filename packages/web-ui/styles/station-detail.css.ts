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

export const columns = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space["8"],
  "@media": {
    "(min-width: 640px)": {
      gridTemplateColumns: "2fr 1fr",
    },
  },
});

export const sectionHeading = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  marginBottom: vars.space["4"],
  letterSpacing: "-0.02em",
});

export const playList = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
});

export const playItem = style({
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

export const playInfo = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space["1"],
  minWidth: 0,
  flex: 1,
});

export const playTitle = style({
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  fontWeight: 500,
  color: vars.color.textPrimary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const playArtist = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.accent,
  textDecoration: "none",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accentHover,
  },
});

export const playTime = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  color: vars.color.textMuted,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

export const topArtistList = style({
  display: "flex",
  flexDirection: "column",
  gap: 0,
});

export const topArtistItem = style({
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

export const topArtistRank = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.textMuted,
  minWidth: "24px",
  textAlign: "right",
});

export const topArtistName = style({
  flex: 1,
  fontSize: vars.fontSize.sm,
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

export const topArtistCount = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.accent,
  backgroundColor: vars.color.accentLight,
  padding: `${vars.space["1"]} ${vars.space["2"]}`,
  borderRadius: vars.radius.sm,
  flexShrink: 0,
});
