import { z } from "zod";

import { PlayingEvent, StationSlug } from "./types";

export const stationConfigs: Array<{
  url: string;
  convert: (data: unknown) => PlayingEvent;
  slug: StationSlug;
}> = [
  {
    url: "https://public.radio.co/api/v2/s4d14b9fcc/track/current",
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
