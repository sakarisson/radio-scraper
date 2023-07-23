import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

type PlayingEvent = {
  artist: string;
  title: string;
};

type StationSlug = "ras2";

export const unnamedThing: {
  [key in StationSlug]: {
    url: string;
    convert: (data: unknown) => PlayingEvent;
  };
} = {
  ras2: {
    url: process.env.STATION_URL_RAS_2,
    convert: (data) => {
      const schema = z.object({
        data: z.object({
          title: z.string(),
          start_time: z.string(),
        }),
      });

      const parsed = schema.parse(data);

      return {
        artist: parsed.data.title.split(" - ")[0],
        title: parsed.data.title.split(" - ")[1],
      };
    },
  },
};
