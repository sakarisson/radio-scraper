-- The number of songs, counted the way song pages count them: one per
-- title, ignoring case, per canonical artist. "Bara 1 spæl" by FAROE5 and
-- by FAROE 5 is one song.
create or replace function song_count()
returns bigint
language sql
stable
set search_path = ''
as $$
  select count(*)
  from (
    select distinct coalesce(a.canonical_artist_id, a.id), lower(s.title)
    from public.songs s
    join public.artists a on a.id = s.artist_id
  ) songs;
$$;
