/**
 * One-time migration script: SQLite -> Supabase
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SQLITE_PATH=./database.sqlite \
 *   npx ts-node src/migrate.ts
 */

import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';

const sqlitePath = process.env.SQLITE_PATH ?? 'database.sqlite';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const sqlite = new Database(sqlitePath, { readonly: true });
const supabase = createClient(supabaseUrl, supabaseKey);

const BATCH_SIZE = 500;

async function insertInBatches<T>(
  table: string,
  rows: T[]
): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(batch);
    if (error) throw new Error(`Failed inserting into ${table}: ${error.message}`);
    console.log(`  ${table}: inserted ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`);
  }
}

async function resetSequence(table: string): Promise<void> {
  const { error } = await supabase.rpc('reset_sequence', { table_name: table });
  if (error) throw new Error(`Failed to reset sequence for ${table}: ${error.message}`);
}

async function migrate() {
  console.log(`Reading from SQLite: ${sqlitePath}`);

  const artists = sqlite.prepare('select * from artists').all();
  const songs = sqlite.prepare('select * from songs').all();
  const stations = sqlite.prepare('select * from stations').all();
  const plays = sqlite.prepare('select * from plays').all();
  const rawPlays = sqlite.prepare('select * from raw_play_data').all() as Array<{
    id: number;
    play_id: number;
    raw_data: Buffer;
  }>;

  console.log(`Found: ${artists.length} artists, ${songs.length} songs, ${stations.length} stations, ${plays.length} plays, ${rawPlays.length} raw_play_data rows`);
  console.log('Migrating...');

  await insertInBatches('artists', artists);
  await insertInBatches('songs', songs);
  await insertInBatches('stations', stations);
  await insertInBatches('plays', plays);

  const rawPlaysFormatted = rawPlays.map((row) => ({
    id: row.id,
    play_id: row.play_id,
    raw_data: JSON.parse(row.raw_data.toString()),
  }));
  await insertInBatches('raw_play_data', rawPlaysFormatted);

  // Reset sequences so new inserts get correct IDs
  console.log('Resetting sequences...');
  for (const table of ['artists', 'songs', 'stations', 'plays', 'raw_play_data']) {
    await resetSequence(table);
  }

  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
