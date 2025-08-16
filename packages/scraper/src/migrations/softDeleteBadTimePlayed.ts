import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH ?? 'database.sqlite', {
  verbose: console.log,
});

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
