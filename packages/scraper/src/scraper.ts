import 'dotenv/config';
import http from 'http';

import {
  getMostRecentPlay,
  insertPlay,
  insertRawData,
  setupDatabase,
} from './database';
import { fetchers } from './fetchers';
import { processPlayingEvent } from './processors';

setupDatabase();

const port = process.env.PORT ?? 8080;
http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(port);

const scrape = () =>
  Promise.allSettled(
    fetchers.map(async (fetcher) => {
      try {
        const { slug, fetchData } = fetcher;
        const result = await fetchData().then(processPlayingEvent);

        if (!result) return;

        const { artist, title, rawData } = result;

        const mostRecentPlay = await getMostRecentPlay(slug);

        if (
          mostRecentPlay &&
          mostRecentPlay.artist.toLowerCase() === artist.toLowerCase() &&
          mostRecentPlay.title.toLowerCase() === title.toLowerCase()
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
        console.error(
          `Error fetching data for station ${fetcher.slug}`,
          error
        );
      }
    })
  );

scrape();
setInterval(scrape, 10 * 1000);
