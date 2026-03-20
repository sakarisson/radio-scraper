import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const header = style({
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: vars.color.bgSurface,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const headerInner = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  maxWidth: "860px",
  marginLeft: "auto",
  marginRight: "auto",
  padding: `${vars.space["3"]} ${vars.space["4"]}`,
  "@media": {
    "(min-width: 640px)": {
      padding: `${vars.space["3"]} ${vars.space["6"]}`,
    },
  },
});

export const siteName = style({
  fontSize: vars.fontSize.lg,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textPrimary,
  textDecoration: "none",
  ":hover": {
    color: vars.color.accent,
  },
  transition: "color 150ms ease",
});

export const nav = style({
  display: "flex",
  gap: vars.space["4"],
});

export const navLink = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textSecondary,
  textDecoration: "none",
  transition: "color 150ms ease",
  ":hover": {
    color: vars.color.accent,
  },
});
