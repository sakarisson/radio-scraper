import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const trendingGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  paddingTop: "8px",
  "@media": {
    "(max-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
});

export const trendingCard = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: "32px",
  padding: "20px",
});

export const trendingName = style({
  display: "block",
  fontSize: "19px",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  lineHeight: 1.2,
  overflowWrap: "anywhere",
  marginBottom: "4px",
});

export const leaderboard = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))",
  columnGap: "64px",
});

export const leaderboardRow = style({
  display: "grid",
  gridTemplateColumns: "48px minmax(0, 1fr) auto",
  gap: "16px",
  alignItems: "baseline",
  padding: "16px 0",
});

export const leaderboardName = style({
  fontSize: "17px",
  fontWeight: 500,
  overflowWrap: "anywhere",
});

export const small = style({
  fontSize: "14px",
  color: vars.color.muted,
});
