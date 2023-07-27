import { sql } from "@vercel/postgres";
import { kv } from "@vercel/kv";
import { stationConfigs } from "./utils";
import { PlayingEvent, StationSlug } from "./types";
import dotenv from "dotenv";
import { cachedEvent } from "./schema";

dotenv.config();

const getStationCacheKey = (station: StationSlug) => `${station}-cache`;

const getMostRecentEventFromCache = async (station: StationSlug) => {
  const key = getStationCacheKey(station);

  const mostRecent = await kv.lindex(key, 0);

  const parsed = cachedEvent.parse(mostRecent);

  if (!parsed) {
    return null;
  }

  return parsed;
};

export const saveEventToCache = async ({
  station,
  artist,
  title,
  played_at = new Date().toISOString(),
}: {
  station: StationSlug;
  artist: string;
  title: string;
  played_at?: string;
}) => {
  const key = getStationCacheKey(station);
  const value = { artist, title, played_at };

  await kv.lpush(key, value);
};

const getOrCreateArtistId = async (artistName: string): Promise<number> => {
  const {
    rows: [maybeArtist],
  } = await sql`select * from artists where name = ${artistName}`;

  if (maybeArtist) {
    return maybeArtist.id;
  }

  const {
    rows: [definitelyArtist],
  } = await sql`insert into artists (name) values (${artistName}) returning *`;

  return definitelyArtist.id;
};

export const getOrCreateSongId = async ({
  songName,
  artistId,
}: {
  songName: string;
  artistId: number;
}): Promise<number> => {
  const {
    rows: [maybeSong],
  } =
    await sql`select * from songs where title = ${songName} and artist_id = ${artistId}`;

  if (maybeSong) {
    return maybeSong.id;
  }

  const {
    rows: [definitelySong],
  } =
    await sql`insert into songs (title, artist_id) values (${songName}, ${artistId}) returning *`;

  return definitelySong.id;
};

const getStationId = async (stationSlug: string): Promise<number> => {
  const {
    rows: [station],
  } = await sql`select * from stations where slug = ${stationSlug}`;

  return station.id;
};

const getMostRecentSongId = async (
  stationId: number,
): Promise<number | null> => {
  const {
    rows: [maybePlay],
  } =
    await sql`select * from plays where station_id=${stationId} order by id desc limit 1`;

  return maybePlay?.song_id ?? null;
};

const run = async ({
  slug,
  convert,
  url,
}: {
  url: string;
  convert: (data: unknown) => PlayingEvent;
  slug: StationSlug;
}) => {
  const stationId = await getStationId(slug);

  const mostRecentValue = await getMostRecentEventFromCache(slug);

  const response = await fetch(url);
  const data = await response.json();
  const normalized = convert(data);

  if (
    mostRecentValue &&
    mostRecentValue.artist === normalized.artist &&
    mostRecentValue.title === normalized.title
  ) {
    console.log("Song found in cache");
  } else {
    await saveEventToCache({
      station: slug,
      artist: normalized.artist,
      title: normalized.title,
    });
    console.log("Saved to cache");
  }

  return;

  const artistId = await getOrCreateArtistId(normalized.artist);

  const songId = await getOrCreateSongId({
    songName: normalized.title,
    artistId,
  });

  if (mostRecentValue === null) {
    const mostRecentSongInStation = await getMostRecentSongId(stationId);

    if (mostRecentSongInStation === songId) {
      throw "Song found in database, not adding to database";
    }
  }

  await sql`insert into plays (song_id, station_id, played_at) values (${songId}, ${stationId}, now())`;

  return `Added ${normalized.artist} - ${normalized.title} to the database`;
};

run(stationConfigs[0]);

export const updateSongs = () =>
  Promise.all(stationConfigs.map((stationData) => run(stationData)));

export const setupDatabase = async () => {
  await sql`create table if not exists stations (
    id serial primary key,
    slug varchar(255) not null unique
  )`;

  await sql`create table if not exists artists (
    id serial primary key,
    name varchar(255) not null unique
  )`;

  await sql`create table if not exists songs (
    id serial primary key,
    title varchar(255) not null,
    artist_id integer references artists(id)
  )`;

  await sql`create table if not exists plays (
    id serial primary key,
    song_id integer references songs(id),
    station_id integer references stations(id),
    played_at timestamp not null
  )`;

  // await sql`insert into stations (slug) values ${stationConfigs
  //   .map((config) => `('${config.slug}')`)
  //   .join(", ")} on conflict do nothing;`;
};

// setupDatabase();
