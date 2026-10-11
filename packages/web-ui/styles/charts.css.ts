import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const header = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "32px",
});

export const monthPicker = style({
  display: "flex",
  alignItems: "center",
  gap: "24px",
  "@media": {
    "(max-width: 640px)": { gap: "16px" },
  },
});

const monthNavBase = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  border: `1px solid ${vars.color.line}`,
  fontSize: "24px",
  lineHeight: 1,
  color: vars.color.ink,
  ":hover": { textDecoration: "none" },
});

export const monthNav = styleVariants({
  enabled: [monthNavBase, { ":hover": { borderColor: vars.color.ink } }],
  disabled: [monthNavBase, { opacity: 0.3 }],
});

export const filters = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  fontSize: "14px",
});

const filterBase = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 14px",
  borderRadius: "999px",
  border: `1px solid ${vars.color.line}`,
  color: vars.color.ink,
  ":hover": { textDecoration: "none", borderColor: vars.color.ink },
});

export const filter = styleVariants({
  idle: [filterBase],
  active: [
    filterBase,
    { background: vars.color.soft, borderColor: vars.color.ink },
  ],
});

export const columns = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(380px, 100%), 1fr))",
  gap: "80px",
  "@media": {
    "(max-width: 640px)": { gap: "64px" },
  },
});

export const rankRow = style({
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr) 80px",
  gap: "16px",
  alignItems: "center",
  padding: "16px 0",
});

export const rankBody = style({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: 0,
});

export const rankMeta = style({
  fontSize: "14px",
  color: vars.color.muted,
});

export const rankPlays = style([rankMeta, { textAlign: "right" }]);
