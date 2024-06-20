-- Step 1: Add the `is_likely_ad` column if it doesn't exist
ALTER TABLE plays
ADD COLUMN is_likely_ad BOOLEAN DEFAULT false;

-- Step 2: Update `is_likely_ad` based on duration and artist name criteria for station `ras2`
WITH
  plays_with_next AS (
    SELECT
      plays.id,
      plays.song_id,
      plays.station_id,
      plays.time_played,
      LEAD (plays.time_played) OVER (
        PARTITION BY
          plays.station_id
        ORDER BY
          plays.time_played
      ) AS next_time_played
    FROM
      plays
      JOIN stations ON plays.station_id = stations.id
    WHERE
      stations.slug = 'ras2'
  ),
  plays_with_duration AS (
    SELECT
      plays_with_next.id,
      plays_with_next.song_id,
      plays_with_next.station_id,
      plays_with_next.time_played,
      plays_with_next.next_time_played,
      (
        JULIANDAY (plays_with_next.next_time_played) - JULIANDAY (plays_with_next.time_played)
      ) * 24 * 60 AS duration_minutes
    FROM
      plays_with_next
  )
UPDATE plays
SET
  is_likely_ad = 1
WHERE
  id IN (
    SELECT
      plays.id
    FROM
      plays_with_duration
      JOIN plays ON plays_with_duration.id = plays.id
      JOIN songs ON plays_with_duration.song_id = songs.id
      JOIN artists ON songs.artist_id = artists.id
    WHERE
      plays_with_duration.duration_minutes < 2
      OR artists.name LIKE '%rás 2%'
  );

-- Step 3: Update `is_likely_ad` based on specific title and artist criteria for station `ras2`
UPDATE plays
SET
  is_likely_ad = 1
WHERE
  song_id IN (
    SELECT
      songs.id
    FROM
      songs
      JOIN artists ON songs.artist_id = artists.id
      JOIN plays ON songs.id = plays.song_id
      JOIN stations ON plays.station_id = stations.id
    WHERE
      songs.title = 'Title'
      AND artists.name = 'Artist'
      AND stations.slug = 'ras2'
  );