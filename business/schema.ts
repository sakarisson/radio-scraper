import { z } from "zod";

export const cachedEvent = z
  .object({
    artist: z.string(),
    title: z.string(),
    played_at: z.string(),
  })
  .nullable();
