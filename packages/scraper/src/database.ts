import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { and, desc, eq } from 'drizzle-orm';

const db = new Database('database.sqlite');

const drizzledb = drizzle(db);

const artistsDrizzleSchema = sqliteTable('artists', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
});

const songsDrizzleSchema = sqliteTable('songs', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  artistId: integer('artist_id').notNull(),
});

const stationsDrizzleSchema = sqliteTable('stations', {
  id: integer('id').primaryKey(),
  slug: text('slug').notNull(),
});

const playsDrizzleSchema = sqliteTable('plays', {
  id: integer('id').primaryKey(),
  songId: integer('song_id').notNull(),
  stationId: integer('station_id').notNull(),
  timePlayed: text('time_played').default('datetime("now")'),
});

const rawPlayDataDrizzleSchema = sqliteTable('raw_play_data', {
  id: integer('id').primaryKey(),
  playId: integer('play_id').notNull(),
  rawData: text('raw_data').notNull(),
});

const getOrCreateArtistId = (artistName: string) => {
  const data = drizzledb
    .select()
    .from(artistsDrizzleSchema)
    .where(eq(artistsDrizzleSchema.name, artistName))
    .get();

  if (data) {
    return data.id;
  }

  const definitelyArtist = drizzledb
    .insert(artistsDrizzleSchema)
    .values({ name: artistName })
    .run();

  return definitelyArtist.lastInsertRowid as number;
};

type GetOrCreateSongId = {
  songName: string;
  artistId: number;
};

const getOrCreateSongId = ({ songName, artistId }: GetOrCreateSongId) => {
  const data = drizzledb
    .select()
    .from(songsDrizzleSchema)
    .where(
      and(
        eq(songsDrizzleSchema.title, songName),
        eq(songsDrizzleSchema.artistId, artistId)
      )
    )
    .get();

  if (data) {
    return data.id;
  }

  const createdRow = drizzledb
    .insert(songsDrizzleSchema)
    .values({ title: songName, artistId })
    .run();

  return createdRow.lastInsertRowid as number;
};

const getOrCreateStationId = (stationSlug: string) => {
  const data = drizzledb
    .select()
    .from(stationsDrizzleSchema)
    .where(eq(stationsDrizzleSchema.slug, stationSlug))
    .get();

  if (data) {
    return data.id;
  }

  const createdRow = drizzledb
    .insert(stationsDrizzleSchema)
    .values({
      slug: stationSlug,
    })
    .run();

  return createdRow.lastInsertRowid as number;
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
      time_played timestamp default (datetime('now'))
    );
    create table if not exists raw_play_data (
      id integer primary key,
      play_id integer not null references plays(id),
      raw_data blob not null
    );
  `);
};

export const getMostRecentPlay = (stationSlug: string) => {
  const data = drizzledb
    .select({
      artist: artistsDrizzleSchema.name,
      title: songsDrizzleSchema.title,
    })
    .from(playsDrizzleSchema)
    .fullJoin(
      songsDrizzleSchema,
      eq(playsDrizzleSchema.songId, songsDrizzleSchema.id)
    )
    .fullJoin(
      artistsDrizzleSchema,
      eq(songsDrizzleSchema.artistId, artistsDrizzleSchema.id)
    )
    .fullJoin(
      stationsDrizzleSchema,
      eq(playsDrizzleSchema.stationId, stationsDrizzleSchema.id)
    )
    .where(eq(stationsDrizzleSchema.slug, stationSlug))
    .orderBy(desc(playsDrizzleSchema.id))
    .limit(1)
    .get();

  if (data) {
    return data;
  }

  return null;
};

type InsertRawData = {
  playId: number;
  rawData: unknown;
};

export const insertRawData = ({ playId, rawData }: InsertRawData) => {
  const info = drizzledb
    .insert(rawPlayDataDrizzleSchema)
    .values({
      playId,
      rawData: JSON.stringify(rawData),
    })
    .run();

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

  const createdRow = drizzledb
    .insert(playsDrizzleSchema)
    .values({
      songId,
      stationId,
    })
    .run();

  return createdRow.lastInsertRowid as number;
};
