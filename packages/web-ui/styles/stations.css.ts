import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const medium = "(max-width: 760px)";

/* Stations index */

export const summary = style({
  maxWidth: "760px",
  lineHeight: 1.05,
});

export const splitWrap = style({
  padding: "56px 0 24px",
  "@media": { [medium]: { paddingTop: "40px" } },
});

export const stationRow = style({
  display: "grid",
  gridTemplateColumns:
    "minmax(120px, 0.6fr) minmax(140px, 0.7fr) minmax(0, 2fr) 24px",
  gridTemplateAreas: '"name plays latest arrow"',
  gap: "32px",
  alignItems: "baseline",
  padding: "32px 0",
  ":hover": { textDecoration: "none" },
  "@media": {
    [medium]: {
      gridTemplateColumns: "minmax(0, 1fr) auto",
      gridTemplateAreas: '"name plays" "latest latest"',
      gap: "16px 24px",
      padding: "24px 0",
    },
  },
});

export const stationName = style({
  gridArea: "name",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "28px",
  fontWeight: 500,
  letterSpacing: "-0.02em",
});

export const stationPlays = style({
  gridArea: "plays",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  fontSize: "20px",
  "@media": { [medium]: { textAlign: "right" } },
});

export const stationLatest = style({
  gridArea: "latest",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  minWidth: 0,
});

export const stationLatestSong = style({
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: 1.3,
  overflowWrap: "anywhere",
});

export const stationLatestArtist = style({
  fontSize: "16px",
  color: vars.color.muted,
});

export const arrow = style({
  gridArea: "arrow",
  fontSize: "20px",
  color: vars.color.muted,
  "@media": { [medium]: { display: "none" } },
});

export const small = style({
  fontSize: "14px",
  color: vars.color.muted,
});

/* Station detail */

export const titleRow = style({
  display: "flex",
  alignItems: "center",
  gap: "20px",
});

export const latestCard = style({
  display: "flex",
  flexDirection: "column",
  gap: "28px",
  padding: "32px",
  "@media": { [medium]: { padding: "24px" } },
});

export const stale = style({
  opacity: 0.55,
});

export const latestSong = style({
  alignSelf: "flex-start",
  fontSize: "32px",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
  overflowWrap: "anywhere",
  "@media": { [medium]: { fontSize: "26px" } },
});

export const latestArtist = style({
  alignSelf: "flex-start",
  fontSize: "18px",
  color: vars.color.muted,
});

export const playRow = style({
  display: "grid",
  gridTemplateColumns: "140px minmax(0, 1fr)",
  gap: "24px",
  alignItems: "baseline",
  padding: "16px 0",
  "@media": {
    [medium]: {
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: "4px",
    },
  },
});
