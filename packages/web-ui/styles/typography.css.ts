import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const heading = style({
  fontSize: vars.fontSize["3xl"],
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.textPrimary,
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
});

export const headingLg = style({
  fontSize: vars.fontSize["2xl"],
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  lineHeight: 1.3,
  letterSpacing: "-0.02em",
});

export const body = style({
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.textPrimary,
  lineHeight: 1.5,
});

export const bodySmall = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  lineHeight: 1.5,
});

export const mono = style({
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.sm,
});

export const link = style({
  color: vars.color.accent,
  textDecoration: "none",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accentHover,
    textDecoration: "underline",
  },
});
