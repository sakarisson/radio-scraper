-- Flag historical plays from "Aldan Hitt Radio" and "Tíðindir á Alduni" as non-music.
-- These are news broadcasts and jingles that were inserted before the ad detection
-- patterns were deployed (March 17-19, 2026).

UPDATE plays
SET is_likely_not_music = true
WHERE is_likely_not_music = false
  AND song_id IN (
    SELECT s.id
    FROM songs s
    JOIN artists a ON a.id = s.artist_id
    WHERE a.name IN ('Aldan Hitt Radio', 'Tíðindir á Alduni')
  );
