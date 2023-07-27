import EventSource from "eventsource";
import { z } from "zod";
import { saveEventToCache } from "./business/operations";

const evtSource = new EventSource("https://netvarp.kringvarp.fo:80/sse");

const schema = z.object({
  radiotext: z.object({
    artist: z.string().optional(),
    title: z.string().optional(),
  }),
});

evtSource.onmessage = (event) => {
  const parsed = schema.parse(JSON.parse(event.data));

  // const parsed = {
  //   radiotext: {
  //     artist: "Eivør",
  //     title: "Í Tokuni",
  //   },
  // };

  if (!parsed.radiotext.artist || !parsed.radiotext.title) {
    return;
  }

  saveEventToCache({
    station: "ras2",
    artist: parsed.radiotext.artist,
    title: parsed.radiotext.title,
  });
};
