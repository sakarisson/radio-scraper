import {
  getMostRecentPlay,
  insertPlay,
  insertRawData,
  setupDatabase,
} from './database';
import { fetchers } from './fetchers';
import dotenv from 'dotenv';

dotenv.config();

setupDatabase();

const scrape = () =>
  Promise.allSettled(
    fetchers.map(async (fetcher) => {
      const { slug, fetchData } = fetcher;
      const { artist, title, rawData } = await fetchData();

      const mostRecentPlay = getMostRecentPlay(slug);

      if (
        mostRecentPlay &&
        mostRecentPlay.artist === artist &&
        mostRecentPlay.title === title
      ) {
        return;
      }

      console.log(`New play on ${slug}: ${artist} - ${title}`);

      const playId = insertPlay({
        artistName: artist,
        songName: title,
        stationSlug: slug,
      });

      insertRawData({ playId, rawData });
    })
  );

scrape();
setInterval(scrape, 10 * 1000);
