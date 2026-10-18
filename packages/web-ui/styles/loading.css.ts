import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

export const block = style({
  background: vars.color.soft,
  borderRadius: "4px",
  animation: `${pulse} 1.6s ease-in-out infinite`,
});

const grow = keyframes({
  "0%": { transform: "scaleX(0)" },
  "100%": { transform: "scaleX(0.9)" },
});

const appear = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

/** Top-of-page bar shown while navigating between pages. */
export const progress = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: "3px",
  background: vars.color.ink,
  transformOrigin: "left",
  // Wait a moment before showing, so instant navigations don't flash.
  opacity: 0,
  animation: `${appear} 150ms ease-out 120ms forwards, ${grow} 8s cubic-bezier(0.1, 0.6, 0.3, 1) 120ms forwards`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transform: "none",
      animation: `${appear} 150ms ease-out 120ms forwards, ${pulse} 1.6s ease-in-out 270ms infinite`,
    },
  },
});
