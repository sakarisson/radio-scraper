import { z } from "zod";

const url = "https://public.radio.co/api/v2/s4d14b9fcc/track/current";

const schema = z.object({
  data: z.object({
    title: z.string(),
    start_time: z.string(),
  }),
});

const getSong = async () => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const init = async () => {
  const song = await getSong();
  const parsed = schema.parse(song);
};

init();
