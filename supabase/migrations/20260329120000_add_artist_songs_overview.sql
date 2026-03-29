create or replace function artist_songs_overview(p_artist_id bigint)
returns table (
  song_id bigint,
  title text,
  play_count bigint,
  first_played timestamptz,
  last_played timestamptz
)
language sql
stable
set search_path = ''
as $$
  select
    s.id as song_id,
    s.title,
    count(p.id) as play_count,
    min(p.time_played) as first_played,
    max(p.time_played) as last_played
  from public.songs s
  inner join public.plays p on p.song_id = s.id
  where s.artist_id = p_artist_id
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by s.id, s.title
  order by play_count desc, s.title asc;
$$;
