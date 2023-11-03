import { z } from 'zod';
import EventSource from 'eventsource';
import { PlayingEvent, StationSlug } from './types';

const ras2Url = process.env.STATION_URL_RAS_2;
const kvfUrl = process.env.STATION_URL_KVF;

if (!ras2Url || !kvfUrl) {
  throw new Error('Missing environment variables');
}

export const fetchers: Array<{
  fetchData: () => Promise<PlayingEvent>;
  slug: StationSlug;
}> = [
  {
    slug: 'ras2',
    fetchData: async () => {
      const data = await fetch(ras2Url).then((response) => response.json());

      const schema = z.object({
        data: z.object({
          title: z.string(),
        }),
      });

      const parsed = schema.safeParse(data);

      if (!parsed.success) {
        throw parsed.error;
      }

      const [artist, title] = parsed.data.data.title.split(' - ');

      const parsedAgain = z
        .object({
          artist: z.string(),
          title: z.string(),
        })
        .safeParse({
          artist,
          title,
        });

      if (!parsedAgain.success) {
        throw new Error('No artist or title');
      }

      return { ...parsedAgain.data, rawData: data };
    },
  },
  {
    slug: 'kvf',
    fetchData: async () => {
      const evtSource = new EventSource(kvfUrl);

      const schema = z.object({
        radiotext: z.object({
          artist: z.string().optional(),
          title: z.string().optional(),
        }),
      });

      return new Promise((resolve, reject) => {
        evtSource.onmessage = (event) => {
          const {
            radiotext: { artist, title },
          } = schema.parse(JSON.parse(event.data));

          if (!artist || !title) {
            reject(new Error('No artist or title'));
          } else {
            resolve({
              artist,
              title,
              rawData: event.data,
            });
          }

          evtSource.close();
        };
        evtSource.onerror = (err) => {
          reject(err);

          evtSource.close();
        };
      });
    },
  },
];
