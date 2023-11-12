import Database from 'better-sqlite3';
import { z } from 'zod';
import { artistRow, songRow, stationRow } from './schema';

const db = new Database('database.sqlite', { verbose: console.log });

const softDeleteBadTimePlayed = () => {
  // Start a transaction
  const transaction = db.transaction(() => {
    // Step 1: Add is_deleted column
    db.prepare(
      `ALTER TABLE plays ADD COLUMN is_deleted BOOLEAN DEFAULT false`
    ).run();

    // Step 2: Find invalid entries
    const invalidPlays = db
      .prepare(
        `
      SELECT p.id, p.song_id, p.station_id, p.time_played, r.raw_data
      FROM plays p
      JOIN raw_play_data r ON p.id = r.play_id
      WHERE p.time_played = 'datetime("now")'
    `
      )
      .all();

    // Step 3: Update time_played where possible
    const updateStmt = db.prepare(
      `UPDATE plays SET time_played = ? WHERE id = ?`
    );
    invalidPlays.forEach((play) => {
      try {
        // @ts-expect-error
        const rawStartTime = JSON.parse(play.raw_data).data?.start_time;
        if (rawStartTime) {
          // Convert startTime to UTC format 'YYYY-MM-DD HH:MM:SS'
          const startTime = new Date(rawStartTime)
            .toISOString()
            .replace('T', ' ')
            .slice(0, 19);
          // @ts-expect-error
          updateStmt.run(startTime, play.id);
        } else {
          throw new Error('No start time available');
        }
      } catch (error) {
        // If there's an error (no start time available), we'll mark it for deletion
        console.log(
          // @ts-expect-error
          `No valid start time for play ID ${play.id}: ${error.message}`
        );
        db.prepare(`UPDATE plays SET is_deleted = true WHERE id = ?`).run(
          // @ts-expect-error
          play.id
        );
      }
    });

    // Step 4: Set is_deleted = true where not possible to update
    // This is handled in the catch block above
  });

  // Execute the transaction
  transaction();
};

function migrateWhitespaceEntries() {
  try {
    db.exec('BEGIN TRANSACTION;');

    db.prepare('UPDATE artists SET name = TRIM(name);').run();
    db.prepare('UPDATE songs SET title = TRIM(title);').run();

    // Update plays for songs
    db.prepare(
      `
          UPDATE plays
          SET song_id = (
              SELECT MIN(s.id)
              FROM songs s
              WHERE TRIM(s.title) = (
                  SELECT TRIM(s2.title)
                  FROM songs s2
                  WHERE s2.id = plays.song_id
              )
          )
          WHERE EXISTS (
              SELECT 1
              FROM songs s
              WHERE TRIM(s.title) = (
                  SELECT TRIM(s2.title)
                  FROM songs s2
                  WHERE s2.id = plays.song_id
              ) AND s.id != plays.song_id
          );
      `
    ).run();

    // Update songs for artists
    db.prepare(
      `
          UPDATE songs
          SET artist_id = (
              SELECT MIN(a.id)
              FROM artists a
              WHERE TRIM(a.name) = (
                  SELECT TRIM(a2.name)
                  FROM artists a2
                  WHERE a2.id = songs.artist_id
              )
          )
          WHERE EXISTS (
              SELECT 1
              FROM artists a
              WHERE TRIM(a.name) = (
                  SELECT TRIM(a2.name)
                  FROM artists a2
                  WHERE a2.id = songs.artist_id
              ) AND a.id != songs.artist_id
          );
      `
    ).run();

    // Delete duplicates in artists and songs
    db.prepare(
      `
          DELETE FROM artists
          WHERE id NOT IN (
              SELECT MIN(id)
              FROM artists
              GROUP BY TRIM(name)
          );
      `
    ).run();

    db.prepare(
      `
          DELETE FROM songs
          WHERE id NOT IN (
              SELECT MIN(id)
              FROM songs
              GROUP BY TRIM(title), artist_id
          );
      `
    ).run();

    db.exec('COMMIT;');
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    db.exec('ROLLBACK;');
  }
}
