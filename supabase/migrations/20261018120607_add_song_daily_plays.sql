-- Plays per day for a song, keyed by Faroese local date ("2025-10-12": 3).
-- Returned as a single jsonb object rather than a set of rows so that songs
-- with more than 1000 days of plays aren't truncated by PostgREST's max-rows.
create or replace function song_daily_plays(p_song_id bigint)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(day, play_count), '{}'::jsonb)
  from (
    select
      (p.time_played at time zone 'Atlantic/Faroe')::date as day,
      count(*) as play_count
    from public.plays p
    where p.song_id = p_song_id
      and p.is_deleted = false
      and p.is_likely_not_music = false
    group by 1
  ) d;
$$;
