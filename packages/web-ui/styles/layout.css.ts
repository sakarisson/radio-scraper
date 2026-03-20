import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const root = style({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

export const content = style({
  width: "100%",
  maxWidth: "860px",
  marginLeft: "auto",
  marginRight: "auto",
  padding: `${vars.space["8"]} ${vars.space["4"]}`,
  "@media": {
    "(min-width: 640px)": {
      padding: `${vars.space["8"]} ${vars.space["6"]}`,
    },
  },
});
