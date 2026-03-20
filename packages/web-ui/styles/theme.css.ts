import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    bgPage: "#f1f5f9",
    bgSurface: "#ffffff",
    bgHover: "#e2e8f0",
    border: "#cbd5e1",
    accent: "#2563eb",
    accentHover: "#1d4ed8",
    accentLight: "#eff6ff",
    bgDark: "#0f172a",
    textOnDark: "#f8fafc",
  },
  space: {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px",
    "12": "48px",
    "16": "64px",
  },
  font: {
    body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "ui-monospace, Menlo, Monaco, 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },
});
