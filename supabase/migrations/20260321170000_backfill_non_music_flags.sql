-- Backfill is_likely_not_music for all historical plays using the same
-- detection patterns as the scraper's isLikelyNotMusic function.
-- This covers all data inserted before the detection was deployed (March 17, 2026).

UPDATE plays
SET is_likely_not_music = true
FROM songs s
JOIN artists a ON a.id = s.artist_id
WHERE plays.song_id = s.id
  AND plays.is_likely_not_music = false
  AND (
    -- Placeholder values
    (lower(a.name) = 'artist' AND lower(s.title) = 'title')
    -- Date in title (e.g. "21.03.2026")
    OR s.title ~ '\d{2}\.\d{2}\.\d{2,4}'
    -- Phone numbers (6+ digits)
    OR (a.name || ' ' || s.title) ~ '\d{6,}'
    -- Web domains
    OR (a.name || ' ' || s.title) ~* '\.(fo|dk|com|net|org|is)\y'
    -- "tlf" keyword
    OR (a.name || ' ' || s.title) ~* '\mtlf\M'
    -- Station names (unambiguous — check both artist and title)
    OR (a.name || ' ' || s.title) ~* '\m(alduni|kringvarp|rás\s*2)\M'
    -- Station names (ambiguous — only check artist to avoid false positives)
    OR a.name ~* '\m(aldan|kvf|kvf2)\M'
    -- Election content
    OR (a.name || ' ' || s.title) ~* '\mvalevni\M'
    -- Festival promos
    OR (a.name || ' ' || s.title) ~* '\msummarfestival'
  );
