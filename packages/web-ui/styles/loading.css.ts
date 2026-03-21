import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const shimmer = keyframes({
  "0%": { backgroundPosition: "-200% 0" },
  "100%": { backgroundPosition: "200% 0" },
});

const skeleton = style({
  borderRadius: vars.radius.sm,
  background: `linear-gradient(90deg, ${vars.color.border} 25%, ${vars.color.bgHover} 50%, ${vars.color.border} 75%)`,
  backgroundSize: "200% 100%",
  animation: `${shimmer} 1.8s ease-in-out infinite`,
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
