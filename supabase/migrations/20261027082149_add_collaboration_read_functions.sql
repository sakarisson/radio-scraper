-- Read functions for collaborations on the artist and song pages. See
-- 20261027082133_add_collaborations.sql for how they're found.

-- Collaborations an artist is part of: combined credits they're a member of
-- ("Faroe5 og Marius DC") and songs where they're the guest ("Frøknur (við
-- Sakaris)"). The plays stay with the credited artist; these only show up
-- as links. Ones without music plays are left out.
create or replace function artist_collaborations(p_artist_id bigint)
returns table (
  credit_name text,
  song_title text,
  play_count bigint,
  first_played timestamptz,
  last_played timestamptz
)
language sql
stable
set search_path = ''
as $$
  select
    ps.artist_name as credit_name,
    null::text as song_title,
    ps.play_count,
    ps.first_played,
    ps.last_played
  from public.artist_members am
  join public.artist_play_stats ps on ps.artist_id = am.artist_id
  where am.member_id = p_artist_id
  union all
  select a.name, s.title, count(p.id), min(p.time_played), max(p.time_played)
  from public.song_features sf
  join public.songs s on s.id = sf.song_id
  join public.artists a on a.id = s.artist_id
  join public.plays p on p.song_id = s.id
  where sf.artist_id = p_artist_id
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by a.name, s.title
  order by play_count desc, credit_name, song_title;
$$;

-- The artists in a combined credit, in the order they're named
create or replace function artist_credit_members(p_artist_id bigint)
returns table (name text)
language sql
stable
set search_path = ''
as $$
  select a.name
  from public.artist_members am
  join public.artists a on a.id = am.member_id
  where am.artist_id = p_artist_id
  order by am.position;
$$;

-- The guests named in a song's title, in the order they're named
create or replace function song_guests(p_song_id bigint)
returns table (name text)
language sql
stable
set search_path = ''
as $$
  select a.name
  from public.song_features sf
  join public.artists a on a.id = sf.artist_id
  where sf.song_id = p_song_id
  order by sf.position;
$$;
