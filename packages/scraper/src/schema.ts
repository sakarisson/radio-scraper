import { z } from 'zod';

export const artistRow = z.object({
  id: z.number(),
  name: z.string(),
});

export const songRow = z.object({
  id: z.number(),
  title: z.string(),
  artist_id: z.number(),
});

export const stationRow = z.object({
  id: z.number(),
  slug: z.string(),
});
