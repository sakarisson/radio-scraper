import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const hero = style({
  display: "flex",
  flexDirection: "column",
  gap: "56px",
  padding: "72px 0 96px",
  "@media": {
    "(max-width: 640px)": {
      gap: "40px",
      padding: "40px 0 64px",
    },
  },
});

export const heroTitle = style({
  maxWidth: "820px",
  fontSize: "clamp(38px, 7vw, 60px)",
  fontWeight: 300,
  lineHeight: 1.05,
  letterSpacing: "-0.035em",
  textWrap: "balance",
});

export const stationCards = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
});

export const stationCard = style({
  display: "flex",
  flexDirection: "column",
  gap: "28px",
  padding: "24px",
  minHeight: "200px",
  "@media": {
    "(max-width: 640px)": {
      minHeight: "160px",
    },
  },
});

export const stale = style({
  opacity: 0.55,
});

export const stationCardHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: 500,
});

export const stationCardAgo = style({
  marginLeft: "auto",
  fontWeight: 400,
  color: vars.color.muted,
});

export const stationCardBody = style({
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const stationCardSong = style({
  fontSize: "21px",
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: "-0.015em",
  textWrap: "pretty",
  overflowWrap: "anywhere",
});

export const columns = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
  gap: "80px",
  paddingTop: "96px",
  "@media": {
    "(max-width: 640px)": {
      gap: "64px",
      paddingTop: "64px",
    },
  },
});

export const listRow = style({
  display: "grid",
  gap: "16px",
  alignItems: "baseline",
  padding: "18px 0",
});

export const recentRow = style([
  listRow,
  { gridTemplateColumns: "56px minmax(0, 1fr) auto" },
]);

export const rankRow = style([
  listRow,
  { gridTemplateColumns: "32px minmax(0, 1fr) auto" },
]);

export const rowMeta = style({
  fontSize: "14px",
  color: vars.color.muted,
});

export const rowStation = style({
  fontSize: "13px",
});
