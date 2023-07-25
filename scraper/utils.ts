import dotenv from "dotenv";
import { z } from "zod";

import { PlayingEvent, StationSlug } from "./types";

dotenv.config();

export const stationConfigs: Array<{
  url: string;
  convert: (data: unknown) => PlayingEvent;
  slug: StationSlug;
}> = [
  {
    url: process.env.STATION_URL_RAS_2,
    convert: (data: unknown) => {
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
    slug: "ras2",
  },
];
