-- Merge duplicate artists and songs that differ only by letter casing.
-- Keeps the lowest-id row as canonical and reassigns all related records.

BEGIN;

-- Step 1: Reassign songs from duplicate artists to canonical (lowest id) artist
WITH canonical AS (
  SELECT min(id) AS keep_id, lower(name) AS normalized
  FROM artists
  GROUP BY lower(name)
  HAVING count(*) > 1
),
duplicates AS (
  SELECT a.id AS dup_id, c.keep_id
  FROM artists a
  JOIN canonical c ON lower(a.name) = c.normalized
  WHERE a.id != c.keep_id
)
UPDATE songs
SET artist_id = d.keep_id
FROM duplicates d
WHERE songs.artist_id = d.dup_id;

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

-- Step 3: Reassign plays from duplicate songs to canonical (lowest id) song
WITH canonical_songs AS (
  SELECT min(id) AS keep_id, lower(title) AS normalized, artist_id
  FROM songs
  GROUP BY lower(title), artist_id
  HAVING count(*) > 1
),
dup_songs AS (
  SELECT s.id AS dup_id, cs.keep_id
  FROM songs s
  JOIN canonical_songs cs ON lower(s.title) = cs.normalized AND s.artist_id = cs.artist_id
  WHERE s.id != cs.keep_id
)
UPDATE plays
SET song_id = ds.keep_id
FROM dup_songs ds
WHERE plays.song_id = ds.dup_id;

-- Step 4: Delete now-empty duplicate songs
WITH canonical_songs AS (
  SELECT min(id) AS keep_id, lower(title) AS normalized, artist_id
  FROM songs
  GROUP BY lower(title), artist_id
  HAVING count(*) > 1
)
DELETE FROM songs s
USING canonical_songs cs
WHERE lower(s.title) = cs.normalized
  AND s.artist_id = cs.artist_id
  AND s.id != cs.keep_id;

COMMIT;
