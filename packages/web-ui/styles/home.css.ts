import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const hero = style({
  backgroundColor: vars.color.accentLight,
  margin: `-${vars.space["8"]} -${vars.space["4"]} ${vars.space["12"]} -${vars.space["4"]}`,
  padding: `${vars.space["12"]} ${vars.space["4"]}`,
  borderBottom: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  "@media": {
    "(min-width: 640px)": {
      margin: `-${vars.space["8"]} -${vars.space["6"]} ${vars.space["12"]} -${vars.space["6"]}`,
      padding: `${vars.space["12"]} ${vars.space["6"]}`,
    },
  },
});

export const heroTitle = style({
  fontSize: vars.fontSize["3xl"],
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.textPrimary,
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
});

export const subtitle = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  marginTop: vars.space["2"],
});

export const sectionHeading = style({
  fontSize: vars.fontSize.xl,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  marginBottom: vars.space["4"],
  letterSpacing: "-0.02em",
});

export const stationCards = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space["4"],
  marginBottom: vars.space["12"],
  "@media": {
    "(min-width: 640px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
});

export const stationCard = style({
  backgroundColor: vars.color.bgSurface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space["4"],
  borderLeft: `4px solid ${vars.color.accent}`,
  minWidth: 0,
  transition: "box-shadow 150ms ease, transform 150ms ease",
  ":hover": {
    boxShadow: "0 2px 8px rgba(26, 35, 50, 0.08)",
    transform: "translateY(-1px)",
  },
});

export const stationCardKvf = style({
  borderLeftColor: "#4a7c9b",
});

export const stationCardRas2 = style({
  borderLeftColor: "#8b7355",
});

export const stationCardLindin = style({
  borderLeftColor: "#5a8a6a",
});

export const stationCardSjey = style({
  borderLeftColor: "#7a5a8a",
});

export const stationName = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.color.textMuted,
  marginBottom: vars.space["2"],
});

export const stationSong = style({
  display: "block",
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

export const stationArtist = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.accent,
  textDecoration: "none",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accentHover,
  },
});

export const stationTime = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  color: vars.color.textMuted,
  marginTop: vars.space["2"],
});

export const statsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: vars.space["4"],
  marginBottom: vars.space["12"],
  "@media": {
    "(max-width: 479px)": {
      gridTemplateColumns: "1fr",
    },
  },
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
  display: "block",
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.textPrimary,
  textDecoration: "none",
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accent,
  },
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

export const ctaRow = style({
  display: "flex",
  gap: vars.space["6"],
  flexWrap: "wrap",
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
