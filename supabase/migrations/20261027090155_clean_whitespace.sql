-- Clean up artist names and song titles that differ only in spacing or
-- Unicode form, and merge the duplicates that leaves.
--
-- Stations sometimes send "Marius DC,  Swangah" (two spaces) or "á" as "a"
-- plus a combining accent. The scraper stored each spelling as its own
-- artist or song, so the same name showed up twice with its plays split
-- between the two. The scraper now cleans names the same way (cleanName in
-- packages/scraper/src/processors.ts).

-- Same as cleanName: Unicode NFC, each run of whitespace becomes one space,
-- and no space at either end. The character class matches JavaScript's \s.
create function pg_temp.clean_name(p_name text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(
    normalize(p_name, NFC),
    '[\s\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+',
    ' ',
    'g'
  ));
$$;

-- Artists with the same cleaned name are merged into one. The one already
-- spelled cleanly is kept, otherwise the oldest.
create temp table artist_map as
  select
    id,
    clean_name,
    first_value(id) over (
      partition by clean_name
      order by (name = clean_name) desc, id
    ) as keeper_id
  from (select id, name, pg_temp.clean_name(name) as clean_name from artists) a;

-- Songs with the same cleaned title by the same (merged) artist are merged
-- the same way.
create temp table song_map as
  select
    id,
    artist_id,
    clean_title,
    first_value(id) over (
      partition by artist_id, clean_title
      order by (title = clean_title and original_artist_id = artist_id) desc, id
    ) as keeper_id
  from (
    select
      s.id,
      s.title,
      s.artist_id as original_artist_id,
      am.keeper_id as artist_id,
      pg_temp.clean_name(s.title) as clean_title
    from songs s
    join artist_map am on am.id = s.artist_id
  ) s;

-- Move plays onto the songs that are kept, then remove the empty duplicates
update plays p
set song_id = sm.keeper_id
from song_map sm
where p.song_id = sm.id
  and sm.id <> sm.keeper_id;

delete from songs s
using song_map sm
where s.id = sm.id
  and sm.id <> sm.keeper_id;

update songs s
set artist_id = sm.artist_id, title = sm.clean_title
from song_map sm
where s.id = sm.id
  and (s.artist_id <> sm.artist_id or s.title <> sm.clean_title);

delete from artists a
using artist_map am
where a.id = am.id
  and am.id <> am.keeper_id;

update artists a
set name = am.clean_name
from artist_map am
where a.id = am.id
  and a.name <> am.clean_name;

-- Show the merged totals right away instead of after the next scheduled
-- refresh
refresh materialized view artist_play_stats;

drop table artist_map, song_map;
drop function pg_temp.clean_name(text);
