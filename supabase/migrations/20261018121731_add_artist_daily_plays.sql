-- Plays per day for an artist, keyed by Faroese local date ("2025-10-12": 3).
-- Same shape as song_daily_plays: a single jsonb object so that artists with
-- more than 1000 days of plays aren't truncated by PostgREST's max-rows.
create or replace function artist_daily_plays(p_artist_id bigint)
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
    join public.songs s on s.id = p.song_id
    where s.artist_id = p_artist_id
      and p.is_deleted = false
      and p.is_likely_not_music = false
    group by 1
  ) d;
$$;
