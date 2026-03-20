import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.4 },
});

const skeleton = style({
  backgroundColor: vars.color.border,
  borderRadius: vars.radius.sm,
  animation: `${pulse} 1.5s ease-in-out infinite`,
});

export const skeletonHeading = style([
  skeleton,
  { height: "2rem", width: "200px", marginBottom: vars.space["6"] },
]);

export const skeletonSearch = style([
  skeleton,
  {
    height: "44px",
    width: "100%",
    borderRadius: vars.radius.md,
    marginBottom: vars.space["6"],
  },
]);

export const skeletonRow = style([
  skeleton,
  {
    height: "1.25rem",
    marginBottom: vars.space["3"],
    borderRadius: vars.radius.sm,
  },
]);

export const skeletonStatGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: vars.space["4"],
  marginBottom: vars.space["12"],
});

export const skeletonStatCard = style([
  skeleton,
  {
    height: "96px",
    borderRadius: vars.radius.md,
  },
]);

export const skeletonBack = style([
  skeleton,
  { height: "1rem", width: "100px", marginBottom: vars.space["6"] },
]);

export const skeletonTableRow = style({
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1.5fr",
  gap: vars.space["3"],
  padding: `${vars.space["3"]} 0`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const skeletonCell = style([
  skeleton,
  { height: "1rem" },
]);
