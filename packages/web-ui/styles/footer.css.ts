import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const footer = style({
  marginTop: "auto",
  borderTop: `1px solid ${vars.color.border}`,
  padding: `${vars.space["6"]} ${vars.space["4"]}`,
  textAlign: "center",
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.body,
  color: vars.color.textMuted,
  "@media": {
    "(min-width: 640px)": {
      padding: `${vars.space["6"]} ${vars.space["6"]}`,
    },
  },
});
