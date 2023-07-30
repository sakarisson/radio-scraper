import { z } from 'zod';
import EventSource from 'eventsource';
import { PlayingEvent, StationSlug } from './types';

export const stationConfigs: Array<{
  fetchData: () => Promise<PlayingEvent>;
  slug: StationSlug;
}> = [
  {
    slug: 'ras2',
    fetchData: async () => {
      const url = process.env.STATION_URL_RAS_2;

      const data = await fetch(url).then((response) => response.json());

      const schema = z.object({
        data: z.object({
          title: z.string(),
        }),
      });

      const parsed = schema.parse(data);

      return {
        artist: parsed.data.title.split(' - ')[0],
        title: parsed.data.title.split(' - ')[1],
      };
    },
  },
  {
    slug: 'kvf',
    fetchData: async () => {
      const evtSource = new EventSource(process.env.STATION_URL_KVF);

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
          } = schema.parse(event.data);

          if (!artist || !title) {
            reject(new Error('No artist or title'));
          } else {
            resolve({
              artist,
              title,
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
