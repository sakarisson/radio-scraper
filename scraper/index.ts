import { z } from "zod";
import dotenv from "dotenv";
import { sql } from "@vercel/postgres";
import { kv } from "@vercel/kv";
import { unnamedThing } from "./utils";

dotenv.config();

const url = process.env.STATION_URL_RAS_2;

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

const getOrCreateSongId = async ({
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

const run = async (station: "ras2") => {
  const stationId = await getStationId(station);

  const mostRecentValue = await kv.get(`${station}-most-recent`);

  const response = await fetch(unnamedThing.ras2.url);
  const data = await response.json();
  const normalized = unnamedThing.ras2.convert(data);

  const nameAndTitle = `${normalized.artist} - ${normalized.title}`;

  await kv.set(`${station}-most-recent`, nameAndTitle, { ex: 120 });

  if (mostRecentValue === nameAndTitle) {
    console.log("Song found in cache, not adding to database");
    return;
  }

  const artistId = await getOrCreateArtistId(normalized.artist);

  const songId = await getOrCreateSongId({
    songName: normalized.title,
    artistId,
  });

  if (mostRecentValue === null) {
    const mostRecentSongInStation = await getMostRecentSongId(stationId);

    if (mostRecentSongInStation === songId) {
      console.log("Song found in database, not adding to database");
      return;
    }
  }

  await sql`insert into plays (song_id, station_id, played_at) values (${songId}, ${stationId}, now())`;

  console.log(
    `Added ${normalized.artist} - ${normalized.title} to the database`,
  );
};

run("ras2");

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
};

// setupDatabase();
