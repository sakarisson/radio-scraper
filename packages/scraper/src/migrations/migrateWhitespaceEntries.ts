import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH ?? 'database.sqlite', {
  verbose: console.log,
});

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
