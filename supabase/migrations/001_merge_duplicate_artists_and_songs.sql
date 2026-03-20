-- Merge duplicate artists and songs that differ only by letter casing.
-- Keeps the lowest-id row as canonical and reassigns all related records.
--
-- A naive UPDATE songs SET artist_id = canonical_id fails when the canonical
-- artist already owns a song with the same title (violates UNIQUE(title, artist_id)).
-- This script handles that by merging plays into the existing song first.

BEGIN;

-- Step 1: Merge songs from duplicate artists into canonical (lowest-id) artists.
-- For each duplicate artist's song:
--   - If the canonical artist already has a song with the same title,
--     reassign plays to that existing song and delete the duplicate song.
--   - Otherwise, reassign the song to the canonical artist.
DO $$
DECLARE
  dup RECORD;
  canonical_song_id bigint;
BEGIN
  FOR dup IN
    SELECT s.id AS song_id, s.title, c.keep_id AS canonical_artist_id
    FROM (
      SELECT min(id) AS keep_id, lower(name) AS normalized
      FROM artists
      GROUP BY lower(name)
      HAVING count(*) > 1
    ) c
    JOIN artists a ON lower(a.name) = c.normalized AND a.id != c.keep_id
    JOIN songs s ON s.artist_id = a.id
  LOOP
    -- Check if the canonical artist already has a song with this title
    SELECT id INTO canonical_song_id
    FROM songs
    WHERE artist_id = dup.canonical_artist_id
      AND lower(title) = lower(dup.title)
    LIMIT 1;

    IF canonical_song_id IS NOT NULL THEN
      -- Merge: reassign plays to the existing song, then delete the duplicate
      UPDATE plays SET song_id = canonical_song_id WHERE song_id = dup.song_id;
      DELETE FROM raw_play_data WHERE play_id IN (
        SELECT id FROM plays WHERE song_id = dup.song_id
      );
      DELETE FROM songs WHERE id = dup.song_id;
    ELSE
      -- No conflict: just reassign the song to the canonical artist
      UPDATE songs SET artist_id = dup.canonical_artist_id WHERE id = dup.song_id;
    END IF;
  END LOOP;
END
$$;

-- Step 2: Delete now-empty duplicate artists
WITH canonical AS (
  SELECT min(id) AS keep_id, lower(name) AS normalized
  FROM artists
  GROUP BY lower(name)
  HAVING count(*) > 1
)
DELETE FROM artists a
USING canonical c
WHERE lower(a.name) = c.normalized
  AND a.id != c.keep_id;

-- Step 3: Merge duplicate songs within the same artist (same title, same artist_id).
-- This handles cases where an artist had multiple song rows differing only by title casing.
DO $$
DECLARE
  dup RECORD;
  canonical_song_id bigint;
BEGIN
  FOR dup IN
    SELECT s.id AS song_id, cs.keep_id
    FROM (
      SELECT min(id) AS keep_id, lower(title) AS normalized, artist_id
      FROM songs
      GROUP BY lower(title), artist_id
      HAVING count(*) > 1
    ) cs
    JOIN songs s ON lower(s.title) = cs.normalized
      AND s.artist_id = cs.artist_id
      AND s.id != cs.keep_id
  LOOP
    canonical_song_id := dup.keep_id;
    UPDATE plays SET song_id = canonical_song_id WHERE song_id = dup.song_id;
    DELETE FROM raw_play_data WHERE play_id IN (
      SELECT id FROM plays WHERE song_id = dup.song_id
    );
    DELETE FROM songs WHERE id = dup.song_id;
  END LOOP;
END
$$;

COMMIT;
