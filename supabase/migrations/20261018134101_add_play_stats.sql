-- Precomputed play totals per artist and per station.
--
-- The artists leaderboard, the artist count, and the station play counts all
-- aggregated every music play (~620k rows) on every page view, taking 0.5-2s
-- each. These change slowly, so they are kept in materialized views and
-- refreshed every five minutes instead.

create materialized view if not exists artist_play_stats as
  select
    a.id as artist_id,
    a.name as artist_name,
    count(*) as play_count,
    min(p.time_played) as first_played,
    max(p.time_played) as last_played
  from plays p
  join songs s on s.id = p.song_id
  join artists a on a.id = s.artist_id
  where p.is_deleted = false
    and p.is_likely_not_music = false
  group by a.id, a.name;

-- Required for refresh concurrently
create unique index if not exists artist_play_stats_artist_id_idx
  on artist_play_stats (artist_id);

-- Leaderboard order
create index if not exists artist_play_stats_leaderboard_idx
  on artist_play_stats (play_count desc, artist_name);

-- Left join so a station without music plays still shows up with 0
create materialized view if not exists station_play_stats as
  select
    st.id as station_id,
    st.slug,
    count(p.id) as play_count
  from stations st
  left join plays p
    on p.station_id = st.id
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by st.id, st.slug;

create unique index if not exists station_play_stats_station_id_idx
  on station_play_stats (station_id);

-- Materialized views don't support RLS. Keep them as locked down as the
-- tables: only the service role (used by the web UI) can read them.
revoke all on artist_play_stats from anon, authenticated;
revoke all on station_play_stats from anon, authenticated;

-- Concurrent refreshes don't block readers. cron.schedule replaces an
-- existing job with the same name, so this is safe to run again.
select cron.schedule(
  'refresh-play-stats',
  '*/5 * * * *',
  $$
    refresh materialized view concurrently public.artist_play_stats;
    refresh materialized view concurrently public.station_play_stats;
  $$
);

-- Read the leaderboard from the precomputed totals. Same signature and
-- result shape as before, plus a name tiebreak so pages don't overlap when
-- artists have the same number of plays.
create or replace function top_artists_all_time(
  p_limit int default 30,
  p_offset int default 0,
  p_search text default null
)
returns table(artist_id bigint, artist_name text, play_count bigint)
language sql
stable
set search_path = ''
as $$
  select s.artist_id, s.artist_name, s.play_count
  from public.artist_play_stats s
  where p_search is null or s.artist_name ilike '%' || p_search || '%'
  order by s.play_count desc, s.artist_name asc
  limit p_limit
  offset p_offset;
$$;

create or replace function artist_count_with_plays(
  p_search text default null
)
returns bigint
language sql
stable
set search_path = ''
as $$
  select count(*)
  from public.artist_play_stats s
  where p_search is null or s.artist_name ilike '%' || p_search || '%';
$$;
