-- Top artists all time, sorted by play count, with optional search and pagination
create or replace function top_artists_all_time(
  p_limit int default 30,
  p_offset int default 0,
  p_search text default null
)
returns table(artist_id bigint, artist_name text, play_count bigint)
language sql stable
as $$
  select a.id as artist_id, a.name as artist_name, count(*) as play_count
  from plays p
  join songs s on s.id = p.song_id
  join artists a on a.id = s.artist_id
  where p.is_deleted = false
    and p.is_likely_not_music = false
    and (p_search is null or a.name ilike '%' || p_search || '%')
  group by a.id, a.name
  order by play_count desc
  limit p_limit
  offset p_offset;
$$;

-- Count of artists that have at least one play, with optional search
create or replace function artist_count_with_plays(
  p_search text default null
)
returns bigint
language sql stable
as $$
  select count(distinct a.id)
  from plays p
  join songs s on s.id = p.song_id
  join artists a on a.id = s.artist_id
  where p.is_deleted = false
    and p.is_likely_not_music = false
    and (p_search is null or a.name ilike '%' || p_search || '%');
$$;
