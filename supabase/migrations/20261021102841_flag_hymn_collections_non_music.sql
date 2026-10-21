-- SJEY sends the name of a hymn collection as the artist ("Syng mín sál",
-- "Syng mín sál b") instead of a performer. Flag those plays as non-music,
-- matching the scraper's HYMN_COLLECTIONS_ARTIST_ONLY rule.
--
-- artist_play_stats and station_play_stats pick this up on their next
-- five-minute refresh.

UPDATE plays
SET is_likely_not_music = true
FROM songs s
JOIN artists a ON a.id = s.artist_id
WHERE plays.song_id = s.id
  AND plays.is_likely_not_music = false
  AND a.name ~* '^syng\s+mín\s+sál\M';
