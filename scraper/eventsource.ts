import EventSource from "eventsource";
import { z } from "zod";

const evtSource = new EventSource("https://netvarp.kringvarp.fo:80/sse");

const schema = z.object({
  radiotext: z.object({
    artist: z.string().optional(),
    title: z.string().optional(),
  }),
});

evtSource.onmessage = (event) => {
  const parsed = schema.parse(JSON.parse(event.data));

  if (!parsed.radiotext.artist || !parsed.radiotext.title) {
    return;
  }
  console.log(parsed.radiotext);
};
