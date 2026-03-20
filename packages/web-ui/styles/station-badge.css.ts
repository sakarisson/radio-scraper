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
  kvf: { bg: "#e8f0fe", color: "#1a56db" },
  ras2: { bg: "#fef3e2", color: "#b45309" },
  lindin: { bg: "#e6f9ed", color: "#16803c" },
  default: { bg: vars.color.bgHover, color: vars.color.textSecondary },
};

export const badge = styleVariants(stationColors, (colors) => [
  badgeBase,
  { backgroundColor: colors.bg, color: colors.color },
]);
