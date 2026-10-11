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
