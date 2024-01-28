import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  justifyContent: "center",
});

export const content = style({
  width: "100%",
  maxWidth: "800px",
  padding: "0 16px",
});
