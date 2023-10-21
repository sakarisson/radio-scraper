import { getMostRecentPlay, insertPlay, setupDatabase } from './database';
import { fetchers } from './fetchers';
import dotenv from 'dotenv';

dotenv.config();

setupDatabase();

const scrape = () =>
  Promise.allSettled(
    fetchers.map(async (fetcher) => {
      const { slug, fetchData } = fetcher;
      const { artist, title } = await fetchData();

      const mostRecentPlay = getMostRecentPlay(slug);

      if (
        mostRecentPlay &&
        mostRecentPlay.artist === artist &&
        mostRecentPlay.title === title
      ) {
        return;
      }

      insertPlay({
        artistName: artist,
        songName: title,
        stationSlug: slug,
      });
    })
  );

// run scrape every 30 seconds
setInterval(scrape, 30 * 1000);