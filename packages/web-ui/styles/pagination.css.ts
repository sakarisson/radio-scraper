import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const pagination = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space["4"],
  padding: `${vars.space["6"]} 0`,
});

export const pageInfo = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
});

export const pageLink = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.accent,
  textDecoration: "none",
  padding: `${vars.space["2"]} ${vars.space["3"]}`,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  transition: "all 150ms ease",
  ":hover": {
    backgroundColor: vars.color.accentLight,
    borderColor: vars.color.accent,
  },
});

export const pageLinkDisabled = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textMuted,
  padding: `${vars.space["2"]} ${vars.space["3"]}`,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  cursor: "default",
  opacity: 0.5,
});
