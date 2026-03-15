import 'dotenv/config';

import {
  getMostRecentPlay,
  insertPlay,
  insertRawData,
  setupDatabase,
} from './database';
import { fetchers } from './fetchers';
import { processPlayingEvent } from './processors';

setupDatabase();

const scrape = () =>
  Promise.allSettled(
    fetchers.map(async (fetcher) => {
      try {
        const { slug, fetchData } = fetcher;
        const { artist, title, rawData } = await fetchData().then(
          processPlayingEvent
        );

        const mostRecentPlay = await getMostRecentPlay(slug);

        if (
          mostRecentPlay &&
          mostRecentPlay.artist === artist &&
          mostRecentPlay.title === title
        ) {
          return;
        }

        const currentTimeFormatted = new Date().toISOString();

        console.log(
          `New play on ${slug}: ${artist} - ${title} (${currentTimeFormatted})`
        );

        const playId = await insertPlay({
          artistName: artist,
          songName: title,
          stationSlug: slug,
        });

        await insertRawData({ playId, rawData });
      } catch (error) {
        // console.error(
        //   `Error fetching data for station ${fetcher.slug}`,
        //   error
        // );
      }
    })
  );

scrape();
setInterval(scrape, 10 * 1000);
