import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const root = style({
  minHeight: "100vh",
});

export const container = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 40px 80px",
  "@media": {
    "(max-width: 640px)": {
      padding: "0 20px 56px",
    },
  },
});

export const header = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  padding: "32px 0",
  "@media": {
    "(max-width: 640px)": {
      padding: "24px 0",
    },
  },
});

export const logo = style({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "18px",
  fontWeight: 600,
  letterSpacing: "-0.01em",
});

export const logoDot = style({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: vars.color.ink,
});

export const nav = style({
  display: "flex",
  alignItems: "center",
  gap: "28px",
  fontSize: "15px",
  "@media": {
    "(max-width: 640px)": {
      gap: "20px",
    },
  },
});

const navLinkBase = style({
  padding: "6px 0",
  borderBottom: "1px solid transparent",
  ":hover": {
    textDecoration: "none",
    color: vars.color.ink,
  },
});

export const navLink = styleVariants({
  idle: [navLinkBase, { color: vars.color.muted }],
  active: [
    navLinkBase,
    { color: vars.color.ink, borderBottomColor: vars.color.ink },
  ],
});

export const themeToggle = style({
  fontSize: "13px",
  cursor: "pointer",
  padding: "7px 14px",
  border: `1px solid ${vars.color.line}`,
  borderRadius: "999px",
  background: "none",
  color: vars.color.muted,
  ":hover": {
    color: vars.color.ink,
  },
});

// The label shows the theme you'd switch *to*. Driven by the same selectors as
// the theme itself so it is right on first paint, without waiting for React.
export const showWhenLight = style({
  selectors: {
    ':root[data-theme="dark"] &': { display: "none" },
  },
  "@media": {
    "(prefers-color-scheme: dark)": {
      selectors: {
        ':root:not([data-theme="light"]) &': { display: "none" },
      },
    },
  },
});

export const showWhenDark = style({
  display: "none",
  selectors: {
    ':root[data-theme="dark"] &': { display: "inline" },
  },
  "@media": {
    "(prefers-color-scheme: dark)": {
      selectors: {
        ':root:not([data-theme="light"]) &': { display: "inline" },
      },
    },
  },
});

export const footer = style({
  marginTop: "120px",
  paddingTop: "24px",
  borderTop: `1px solid ${vars.color.line}`,
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "12px",
  fontSize: "14px",
  color: vars.color.muted,
  "@media": {
    "(max-width: 640px)": {
      marginTop: "80px",
    },
  },
});
