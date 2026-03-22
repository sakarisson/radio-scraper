import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const badgeBase = style({
  display: "inline-block",
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.body,
  fontWeight: 600,
  padding: `${vars.space["1"]} ${vars.space["2"]}`,
  borderRadius: vars.radius.sm,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  lineHeight: 1,
  whiteSpace: "nowrap",
});

const stationColors: Record<string, { bg: string; color: string }> = {
  kvf: { bg: "#edf3f7", color: "#3a6580" },
  ras2: { bg: "#f5f0ea", color: "#7a6548" },
  lindin: { bg: "#edf5ef", color: "#4a7a5a" },
  sjey: { bg: "#f0edf5", color: "#5a4a7a" },
  default: { bg: vars.color.bgHover, color: vars.color.textSecondary },
};

export const badge = styleVariants(stationColors, (colors) => [
  badgeBase,
  { backgroundColor: colors.bg, color: colors.color },
]);
