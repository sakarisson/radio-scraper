import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const medium = "(max-width: 760px)";
const narrow = "(max-width: 480px)";

export const subtitle = style({
  display: "inline-block",
  marginTop: "16px",
  fontSize: "22px",
  color: vars.color.muted,
});

/* Songs table */

const songGrid = style({
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 2.2fr) minmax(120px, 1fr) minmax(0, 0.8fr) minmax(0, 0.8fr)",
  gap: "24px",
  "@media": {
    [medium]: {
      gridTemplateColumns: "minmax(0, 2fr) minmax(100px, 1fr) minmax(0, 1fr)",
      gap: "16px",
    },
    [narrow]: {
      gridTemplateColumns: "minmax(0, 1fr) auto",
    },
  },
});

export const songHeader = style([
  songGrid,
  {
    padding: "12px 0",
    fontSize: "13px",
    color: vars.color.muted,
  },
]);

export const songRow = style([
  songGrid,
  {
    alignItems: "center",
    padding: "14px 0",
    fontSize: "15px",
  },
]);

export const songTitle = style({
  fontSize: "16px",
  fontWeight: 500,
  overflowWrap: "anywhere",
});

export const hideMedium = style({
  "@media": { [medium]: { display: "none" } },
});

export const hideNarrow = style({
  "@media": { [narrow]: { display: "none" } },
});

export const playsCell = style({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

export const playsNumber = style({
  minWidth: "36px",
});

export const playsTrack = style({
  flex: 1,
  "@media": { [narrow]: { display: "none" } },
});

/* Recent plays */

export const playRow = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) 100px minmax(0, 1fr)",
  gap: "24px",
  alignItems: "baseline",
  padding: "14px 0",
  fontSize: "15px",
  "@media": {
    [narrow]: {
      gridTemplateColumns: "minmax(0, 1fr) auto",
      gap: "4px 16px",
    },
  },
});

export const playWhen = style({
  color: vars.color.muted,
  "@media": {
    [narrow]: { gridColumn: "1 / -1", fontSize: "14px" },
  },
});

/* Song play history */

export const history = style({
  display: "flex",
  flexDirection: "column",
  gap: "48px",
  paddingTop: "32px",
});

export const historyMonth = style({
  display: "grid",
  gridTemplateColumns: "minmax(140px, 200px) minmax(0, 1fr)",
  gap: "32px",
  alignItems: "start",
  "@media": {
    [medium]: {
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: "16px",
    },
  },
});

export const historyLabel = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  position: "sticky",
  top: "24px",
  "@media": { [medium]: { position: "static" } },
});

export const historyMonthName = style({
  fontSize: "20px",
  fontWeight: 500,
  letterSpacing: "-0.01em",
});

export const historyPlays = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  columnGap: "32px",
});

export const historyPlay = style({
  display: "flex",
  alignItems: "baseline",
  gap: "12px",
  padding: "12px 0",
  fontSize: "15px",
});

export const historyDay = style({
  width: "52px",
});

export const historyTime = style({
  width: "52px",
  color: vars.color.muted,
});
