-- One page of a station's music plays, newest first, for cursor-based paging.
--
-- Paging with OFFSET made deep pages scan every row before them (0.7s+ near
-- the end of ras2). Instead, a page starts from a cursor play:
--   * no cursor:          the newest p_limit plays
--   * p_before_id = X:    the p_limit plays just older than play X
--   * p_after_id = X:     the p_limit plays just newer than play X
-- Plays are ordered by (time_played, id), since a few plays on the same
-- station share a timestamp.
--
-- The extra `time_played <=` / `>=` conditions are implied by the row
-- comparisons, but let Postgres start the index scan at the cursor instead
-- of filtering its way there from the newest play.
create or replace function station_plays_page(
  p_station_id bigint,
  p_limit int default 50,
  p_before_id bigint default null,
  p_after_id bigint default null
)
returns table(id bigint, time_played timestamptz, title text, artist_name text)
language plpgsql
stable
set search_path = ''
as $$
declare
  cursor_time timestamptz;
begin
  if p_after_id is not null then
    select p.time_played into cursor_time from public.plays p where p.id = p_after_id;

    return query
      select page.id, page.time_played, page.title, page.artist_name
      from (
        select p.id, p.time_played, s.title, a.name as artist_name
        from public.plays p
        join public.songs s on s.id = p.song_id
        join public.artists a on a.id = s.artist_id
        where p.station_id = p_station_id
          and p.is_deleted = false
          and p.is_likely_not_music = false
          and p.time_played >= cursor_time
          and (p.time_played, p.id) > (cursor_time, p_after_id)
        order by p.time_played asc, p.id asc
        limit p_limit
      ) page
      order by page.time_played desc, page.id desc;

  elsif p_before_id is not null then
    select p.time_played into cursor_time from public.plays p where p.id = p_before_id;

    return query
      select p.id, p.time_played, s.title, a.name as artist_name
      from public.plays p
      join public.songs s on s.id = p.song_id
      join public.artists a on a.id = s.artist_id
      where p.station_id = p_station_id
        and p.is_deleted = false
        and p.is_likely_not_music = false
        and p.time_played <= cursor_time
        and (p.time_played, p.id) < (cursor_time, p_before_id)
      order by p.time_played desc, p.id desc
      limit p_limit;

  else
    return query
      select p.id, p.time_played, s.title, a.name as artist_name
      from public.plays p
      join public.songs s on s.id = p.song_id
      join public.artists a on a.id = s.artist_id
      where p.station_id = p_station_id
        and p.is_deleted = false
        and p.is_likely_not_music = false
      order by p.time_played desc, p.id desc
      limit p_limit;
  end if;
end;
$$;
