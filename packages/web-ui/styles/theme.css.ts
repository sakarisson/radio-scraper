import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from "@vanilla-extract/css";

export const vars = createThemeContract({
  color: {
    bg: null,
    ink: null,
    muted: null,
    line: null,
    soft: null,
  },
  font: {
    body: null,
  },
});

const light = {
  bg: "oklch(0.975 0.005 230)",
  ink: "oklch(0.24 0.02 240)",
  muted: "oklch(0.5 0.02 240)",
  line: "oklch(0.89 0.01 235)",
  soft: "oklch(0.945 0.008 230)",
};

const dark = {
  bg: "oklch(0.2 0.015 240)",
  ink: "oklch(0.94 0.008 230)",
  muted: "oklch(0.7 0.015 235)",
  line: "oklch(0.32 0.015 240)",
  soft: "oklch(0.24 0.016 240)",
};

createGlobalTheme(":root", vars, {
  color: light,
  font: {
    body: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
});

// An explicit choice (set by ThemeToggle) wins; otherwise follow the OS.
globalStyle(':root[data-theme="dark"]', {
  vars: assignVars(vars.color, dark),
});

globalStyle(':root:not([data-theme="light"])', {
  "@media": {
    "(prefers-color-scheme: dark)": {
      vars: assignVars(vars.color, dark),
    },
  },
});

globalStyle("body", {
  backgroundColor: vars.color.bg,
  color: vars.color.ink,
  fontFamily: vars.font.body,
  fontFeatureSettings: "'tnum'",
  transition: "background-color 300ms, color 300ms",
});

globalStyle("a:hover", {
  textDecoration: "underline",
  textUnderlineOffset: "4px",
  textDecorationThickness: "1px",
});

globalStyle(":focus-visible", {
  outline: `2px solid ${vars.color.ink}`,
  outlineOffset: "2px",
  borderRadius: "2px",
});

globalStyle("input::placeholder", {
  color: "inherit",
  opacity: 0.55,
});
