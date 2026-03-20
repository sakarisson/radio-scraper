import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const container = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: `${vars.space["16"]} 0`,
});

export const code = style({
  fontSize: vars.fontSize["3xl"],
  fontFamily: vars.font.body,
  fontWeight: 700,
  color: vars.color.textMuted,
  marginBottom: vars.space["2"],
});

export const message = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  marginBottom: vars.space["8"],
});

export const homeLink = style({
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.accent,
  textDecoration: "none",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accentHover,
  },
});
