-- Top artists for a given month, optionally filtered by station IDs
create or replace function top_artists_for_month(
  start_date timestamptz,
  end_date timestamptz,
  result_limit int default 10,
  filter_station_ids bigint[] default null
)
returns table(name text, play_count bigint)
language sql stable
as $$
  select a.name, count(*) as play_count
  from plays p
  join songs s on s.id = p.song_id
  join artists a on a.id = s.artist_id
  where p.time_played >= start_date
    and p.time_played < end_date
    and p.is_deleted = false
    and p.is_likely_not_music = false
    and (filter_station_ids is null or p.station_id = any(filter_station_ids))
  group by a.name
  order by play_count desc
  limit result_limit;
$$;

-- Top songs for a given month, optionally filtered by station IDs
create or replace function top_songs_for_month(
  start_date timestamptz,
  end_date timestamptz,
  result_limit int default 10,
  filter_station_ids bigint[] default null
)
returns table(title text, artist_name text, play_count bigint)
language sql stable
as $$
  select s.title, a.name as artist_name, count(*) as play_count
  from plays p
  join songs s on s.id = p.song_id
  join artists a on a.id = s.artist_id
  where p.time_played >= start_date
    and p.time_played < end_date
    and p.is_deleted = false
    and p.is_likely_not_music = false
    and (filter_station_ids is null or p.station_id = any(filter_station_ids))
  group by s.title, a.name
  order by play_count desc
  limit result_limit;
$$;

-- Top artists for a station (all time)
create or replace function top_artists_for_station(
  p_station_id bigint,
  result_limit int default 10
)
returns table(name text, play_count bigint)
language sql stable
as $$
  select a.name, count(*) as play_count
  from plays p
  join songs s on s.id = p.song_id
  join artists a on a.id = s.artist_id
  where p.station_id = p_station_id
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by a.name
  order by play_count desc
  limit result_limit;
$$;

-- Station breakdown for a song
create or replace function song_station_breakdown(
  p_song_id bigint
)
returns table(slug text, play_count bigint)
language sql stable
as $$
  select st.slug, count(*) as play_count
  from plays p
  join stations st on st.id = p.station_id
  where p.song_id = p_song_id
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by st.slug
  order by play_count desc;
$$;

-- Station breakdown for an artist
create or replace function artist_station_breakdown(
  p_artist_id bigint
)
returns table(slug text, play_count bigint)
language sql stable
as $$
  select st.slug, count(*) as play_count
  from plays p
  join songs s on s.id = p.song_id
  join stations st on st.id = p.station_id
  where s.artist_id = p_artist_id
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by st.slug
  order by play_count desc;
$$;

-- Play counts for a list of artist IDs
create or replace function artist_play_counts(
  p_artist_ids bigint[]
)
returns table(artist_id bigint, play_count bigint)
language sql stable
as $$
  select s.artist_id, count(*) as play_count
  from plays p
  join songs s on s.id = p.song_id
  where s.artist_id = any(p_artist_ids)
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by s.artist_id;
$$;
