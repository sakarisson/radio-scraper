import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

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
  transition: "border-color 150ms ease",
  "::placeholder": {
    color: vars.color.textMuted,
  },
  ":focus": {
    borderColor: vars.color.accent,
  },
});

export const artistList = style({
  display: "flex",
  flexDirection: "column",
});

export const artistRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${vars.space["3"]} ${vars.space["4"]}`,
  fontSize: vars.fontSize.base,
  fontFamily: vars.font.body,
  color: vars.color.textPrimary,
  textDecoration: "none",
  borderRadius: vars.radius.sm,
  transition: "background-color 150ms ease, transform 150ms ease",
  ":hover": {
    backgroundColor: vars.color.bgHover,
    transform: "translateX(2px)",
  },
});

export const artistName = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
});

export const playCountBadge = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  fontWeight: 600,
  color: vars.color.textMuted,
  flexShrink: 0,
  marginLeft: vars.space["3"],
});

export const emptyState = style({
  textAlign: "center",
  padding: `${vars.space["12"]} 0`,
  color: vars.color.textSecondary,
  fontFamily: vars.font.body,
  fontSize: vars.fontSize.base,
});
