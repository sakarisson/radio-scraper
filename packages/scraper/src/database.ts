import Database from 'better-sqlite3';
import { z } from 'zod';
import { artistRow, songRow, stationRow } from './schema';

const db = new Database('database.sqlite');

const getOrCreateArtistId = (artistName: string) => {
  const row = db
    .prepare('select * from artists where name = (?)')
    .get(artistName);

  const parsed = artistRow.safeParse(row);

  if (parsed.success) {
    return parsed.data.id;
  }

  const definitelyArtist = db
    .prepare('insert into artists (name) values (?)')
    .run(artistName);

  return definitelyArtist.lastInsertRowid;
};

type GetOrCreateSongId = {
  songName: string;
  artistId: number | bigint;
};

const getOrCreateSongId = ({ songName, artistId }: GetOrCreateSongId) => {
  const row = db
    .prepare('select * from songs where title = (?) and artist_id = (?)')
    .get(songName, artistId);

  const parsed = songRow.safeParse(row);

  if (parsed.success) {
    return parsed.data.id;
  }

  const createdRow = db
    .prepare('insert into songs (title, artist_id) values (?, ?)')
    .run(songName, artistId);

  return createdRow.lastInsertRowid;
};

const getOrCreateStationId = (stationSlug: string) => {
  const row = db
    .prepare('select * from stations where slug = (?)')
    .get(stationSlug);

  const parsed = stationRow.safeParse(row);

  if (parsed.success) {
    return parsed.data.id;
  }

  const createdRow = db
    .prepare('insert into stations (slug) values (?)')
    .run(stationSlug);

  return createdRow.lastInsertRowid;
};

export const setupDatabase = () => {
  db.exec(`
    create table if not exists artists (
      id integer primary key,
      name text not null
    );
    create table if not exists songs (
      id integer primary key,
      title text not null,
      artist_id integer not null references artists(id)
    );
    create table if not exists stations (
      id integer primary key,
      slug text not null
    );
    create table if not exists plays (
      id integer primary key,
      song_id integer not null references songs(id),
      station_id integer not null references stations(id),
      time_played timestamp default (datetime('now')),
      is_deleted boolean default false
    );
    create table if not exists raw_play_data (
      id integer primary key,
      play_id integer not null references plays(id),
      raw_data blob not null
    );  
  `);
};

export const getMostRecentPlay = (stationSlug: string) => {
  const playSchema = z.object({
    id: z.number(),
    title: z.string(),
    artist: z.string(),
    station_slug: z.string(),
  });

  const row = db
    .prepare(
      `
      select
        plays.id,
        songs.title,
        artists.name as artist,
        stations.slug as station_slug
      from plays
      join songs on songs.id = plays.song_id
      join artists on artists.id = songs.artist_id
      join stations on stations.id = plays.station_id
      where stations.slug = (?)
      order by plays.id desc
      limit 1
    `
    )
    .get(stationSlug);

  const parsed = playSchema.safeParse(row);

  if (parsed.success) {
    return parsed.data;
  }

  return null;
};

type InsertRawData = {
  playId: bigint | number;
  rawData: unknown;
};

export const insertRawData = ({ playId, rawData }: InsertRawData) => {
  // Convert JSON object to string, and then to a Buffer
  const rawDataBuffer = Buffer.from(JSON.stringify(rawData));

  // Use a prepared statement to insert the data
  const stmt = db.prepare(
    `INSERT INTO raw_play_data (play_id, raw_data) VALUES (?, ?)`
  );
  const info = stmt.run(playId, rawDataBuffer);

  return info;
};

type CreatePlay = {
  songName: string;
  artistName: string;
  stationSlug: string;
};

export const insertPlay = ({
  songName,
  artistName,
  stationSlug,
}: CreatePlay) => {
  const artistId = getOrCreateArtistId(artistName);
  const songId = getOrCreateSongId({ songName, artistId });
  const stationId = getOrCreateStationId(stationSlug);

  const createdRow = db
    .prepare('insert into plays (song_id, station_id) values (?, ?)')
    .run(songId, stationId);

  return createdRow.lastInsertRowid;
};
