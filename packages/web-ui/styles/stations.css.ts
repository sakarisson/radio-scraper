import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const stationGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space["4"],
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
  padding: vars.space["6"],
  textDecoration: "none",
  transition: "box-shadow 150ms ease, transform 150ms ease",
  display: "block",
  ":hover": {
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
    transform: "translateY(-1px)",
  },
});

export const stationSlug = style({
  fontSize: vars.fontSize["2xl"],
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.textPrimary,
  textTransform: "uppercase",
  letterSpacing: "-0.02em",
  marginBottom: vars.space["2"],
});

export const stationMeta = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  marginBottom: vars.space["3"],
});

export const stationLatest = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textMuted,
  borderTop: `1px solid ${vars.color.border}`,
  paddingTop: vars.space["3"],
});

export const stationLatestTitle = style({
  fontWeight: 500,
  color: vars.color.textPrimary,
});
