import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    textPrimary: "#1a1a2e",
    textSecondary: "#555770",
    textMuted: "#8a8da0",
    bgPage: "#f8f9fb",
    bgSurface: "#ffffff",
    bgHover: "#f0f1f5",
    border: "#e2e4ea",
    accent: "#4a6fa5",
    accentHover: "#3d5d8a",
    accentLight: "#eef2f8",
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
