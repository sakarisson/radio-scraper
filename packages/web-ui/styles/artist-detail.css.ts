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

/* Links inside running text, like the members of "Faroe5 og Marius DC" */

export const inlineLink = style({
  textDecorationLine: "underline",
  textDecorationColor: vars.color.line,
  textDecorationThickness: "max(1px, 0.05em)",
  textUnderlineOffset: "0.15em",
  ":hover": {
    textDecorationColor: "currentColor",
    textDecorationThickness: "max(1px, 0.05em)",
    textUnderlineOffset: "0.15em",
  },
});

/* Other spellings of the artist, under the name */

export const akas = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px 12px",
  marginTop: "16px",
  fontSize: "15px",
  overflowWrap: "anywhere",
});

/* First play, under the intro stats */

export const firstPlay = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "6px 16px",
  marginTop: "32px",
  fontSize: "15px",
});

export const firstPlaySong = style({
  fontWeight: 500,
  overflowWrap: "anywhere",
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

export const moreSongs = style({
  padding: "14px 0",
  fontSize: "15px",
  fontWeight: 500,
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

/* Song page recent plays */

export const songPlays = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gridAutoFlow: "column",
  columnGap: "64px",
  "@media": {
    [medium]: {
      gridTemplateColumns: "minmax(0, 1fr)",
      gridAutoFlow: "row",
    },
  },
});

export const songPlay = style({
  display: "grid",
  gridTemplateColumns: "auto 48px auto minmax(0, 1fr)",
  gap: "16px",
  alignItems: "baseline",
  padding: "14px 0",
  fontSize: "15px",
});

export const songPlayDay = style({
  minWidth: "64px",
  whiteSpace: "nowrap",
});

export const songPlayTime = style({
  color: vars.color.muted,
});

export const songPlayAgo = style({
  justifySelf: "end",
  color: vars.color.muted,
  whiteSpace: "nowrap",
});
