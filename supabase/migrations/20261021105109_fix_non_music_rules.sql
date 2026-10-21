-- Re-run the scraper's isLikelyNotMusic rules over existing plays after
-- fixing them:
--   * Faroese letters now count as part of a word ("Dagsins orð" was missed)
--   * "Ras 2" without the accent, "Kringvarpið" and "valevnið" are matched
--   * SJEY talk programmes, reruns marked "(e)", broadcasts ("Jólasending",
--     "1. sending") and ISO dates in titles are non-music
--   * Phone/account numbers written in groups ("9181 584 251 6") are matched
--   * "sjey" is no longer a station name rule: it's the Faroese word for
--     "seven", and only ever caught real songs
--
-- In Postgres, \m and \M are word boundaries that already treat Faroese
-- letters as letters. Keep this function in step with isLikelyAd.ts.

create function pg_temp.likely_not_music(artist text, title text)
returns boolean
language sql
immutable
as $$
  select
    (lower(artist) = 'artist' and lower(title) = 'title')
    or title ~ '\d{2}\.\d{2}\.\d{2,4}|\d{4}-\d{2}-\d{2}'
    or artist ~* '\m(aldan|kvf2?)\M'
    or artist ~* '^syng\s+mín\s+sál\M'
    or artist ~* '^(við\s+vegin|sono|new\s+life\s+without\s+borders|okkara\s+løta\s+til\s+øll|pais\s+fo|iktus|minnist\s+tú\s+ichtus|morgunsending)(\s*\(e\))?$'
    or artist ~* '\(e\)\s*$'
    or (artist || ' ' || title) ~ '\d{6,}|\d{2,}( \d{2,}){2,}'
    or (artist || ' ' || title) ~* '\.(fo|dk|com|net|org|is)\M'
    or (artist || ' ' || title) ~* '\mtlf\M'
    or (artist || ' ' || title) ~* '\m(alduni|kringvarp[[:alpha:]]*|r[aá]s\s*2)\M'
    or (artist || ' ' || title) ~* '\mvalevni'
    or (artist || ' ' || title) ~* '\msummarfestival'
    or (artist || ' ' || title) ~* '\m(bíbliulestur|dagsins\s+orð)\M'
    or (artist || ' ' || title) ~* '[[:alpha:]]+sending|\d+\.\s*sending'
$$;

-- Flag plays the old rules missed
UPDATE plays
SET is_likely_not_music = true
FROM songs s
JOIN artists a ON a.id = s.artist_id
WHERE plays.song_id = s.id
  AND plays.is_likely_not_music = false
  AND pg_temp.likely_not_music(a.name, s.title);

-- Unflag real songs that were only caught by the word "sjey". Rás 2 is left
-- alone: its plays can also be flagged for being very short or very long.
UPDATE plays
SET is_likely_not_music = false
FROM songs s
JOIN artists a ON a.id = s.artist_id
JOIN stations st ON st.slug <> 'ras2'
WHERE plays.song_id = s.id
  AND plays.station_id = st.id
  AND plays.is_likely_not_music = true
  AND (a.name || ' ' || s.title) ~* '\msjey\M'
  AND NOT pg_temp.likely_not_music(a.name, s.title);

drop function pg_temp.likely_not_music(text, text);
