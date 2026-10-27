-- Count each artist's akas as the artist. The canonical artist's totals,
-- songs, calendar, station split, chart positions and collaborations
-- include the plays credited to its other spellings. (The web app sends
-- an aka's page to its canonical artist.)
--
-- A song likewise means every song with that title, ignoring case, by the
-- artist or one of its akas: "Bara 1 spæl" by FAROE5 and by FAROE 5 is one
-- song.

-- The canonical artist and all its akas, given any one of them. A family
-- is a handful of rows; "rows 3" tells the planner so, or it scans every
-- play instead of using the indexes.
create or replace function artist_family(p_artist_id bigint)
returns table (id bigint)
language sql
stable
rows 3
set search_path = ''
as $$
  with c as (
    select coalesce(a.canonical_artist_id, a.id) as id
    from public.artists a
    where a.id = p_artist_id
  )
  select a.id
  from public.artists a, c
  where a.id = c.id or a.canonical_artist_id = c.id;
$$;

-- The song and the same title by the artist's akas, given any one of them
create or replace function song_family(p_song_id bigint)
returns table (id bigint)
language sql
stable
rows 3
set search_path = ''
as $$
  select s.id
  from public.songs base
  cross join lateral public.artist_family(base.artist_id) f
  join public.songs s on s.artist_id = f.id
  where base.id = p_song_id
    and lower(s.title) = lower(base.title);
$$;

-- Totals per canonical artist. Akas have no row of their own.
drop materialized view if exists artist_play_stats;

create materialized view artist_play_stats as
  select
    c.id as artist_id,
    c.name as artist_name,
    count(*) as play_count,
    min(p.time_played) as first_played,
    max(p.time_played) as last_played
  from plays p
  join songs s on s.id = p.song_id
  join artists a on a.id = s.artist_id
  join artists c on c.id = coalesce(a.canonical_artist_id, a.id)
  where p.is_deleted = false
    and p.is_likely_not_music = false
  group by c.id, c.name;

create unique index if not exists artist_play_stats_artist_id_idx
  on artist_play_stats (artist_id);

create index if not exists artist_play_stats_leaderboard_idx
  on artist_play_stats (play_count desc, artist_name);

revoke all on artist_play_stats from anon, authenticated;

-- Searching finds an artist by any of its spellings, so "Eivör" finds Eivør
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
  where p_search is null
    or s.artist_id in (
      select coalesce(a.canonical_artist_id, a.id)
      from public.artists a
      where a.name ilike '%' || p_search || '%'
    )
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
  where p_search is null
    or s.artist_id in (
      select coalesce(a.canonical_artist_id, a.id)
      from public.artists a
      where a.name ilike '%' || p_search || '%'
    );
$$;

-- Artist page

create or replace function artist_station_breakdown(p_artist_id bigint)
returns table (slug text, play_count bigint)
language sql
stable
set search_path = ''
as $$
  select st.slug, count(*) as play_count
  from public.plays p
  join public.songs s on s.id = p.song_id
  join public.stations st on st.id = p.station_id
  where s.artist_id in (select f.id from public.artist_family(p_artist_id) f)
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by st.slug
  order by play_count desc;
$$;

-- One row per title. The spelling and song id shown are the most played
-- ones.
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
  with per_song as (
    select
      s.id,
      s.title,
      count(p.id) as plays,
      min(p.time_played) as first_played,
      max(p.time_played) as last_played
    from public.songs s
    join public.plays p on p.song_id = s.id
    where s.artist_id in (select f.id from public.artist_family(p_artist_id) f)
      and p.is_deleted = false
      and p.is_likely_not_music = false
    group by s.id, s.title
  )
  select
    (array_agg(id order by plays desc, id))[1] as song_id,
    (array_agg(title order by plays desc, id))[1] as title,
    sum(plays)::bigint as play_count,
    min(first_played) as first_played,
    max(last_played) as last_played
  from per_song
  group by lower(title)
  order by play_count desc, title asc;
$$;

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
    where s.artist_id in (select f.id from public.artist_family(p_artist_id) f)
      and p.is_deleted = false
      and p.is_likely_not_music = false
    group by 1
  ) d;
$$;

-- Song page

create or replace function song_station_breakdown(p_song_id bigint)
returns table (slug text, play_count bigint)
language sql
stable
set search_path = ''
as $$
  select st.slug, count(*) as play_count
  from public.plays p
  join public.stations st on st.id = p.station_id
  where p.song_id in (select f.id from public.song_family(p_song_id) f)
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by st.slug
  order by play_count desc;
$$;

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
    where p.song_id in (select f.id from public.song_family(p_song_id) f)
      and p.is_deleted = false
      and p.is_likely_not_music = false
    group by 1
  ) d;
$$;

-- Charts

create or replace function top_artists_for_month(
  start_date timestamptz,
  end_date timestamptz,
  result_limit int default 10,
  filter_station_ids bigint[] default null
)
returns table (name text, play_count bigint)
language sql
stable
set search_path = ''
as $$
  select c.name, count(*) as play_count
  from public.plays p
  join public.songs s on s.id = p.song_id
  join public.artists a on a.id = s.artist_id
  join public.artists c on c.id = coalesce(a.canonical_artist_id, a.id)
  where p.time_played >= start_date
    and p.time_played < end_date
    and p.is_deleted = false
    and p.is_likely_not_music = false
    and (filter_station_ids is null or p.station_id = any(filter_station_ids))
  group by c.id, c.name
  order by play_count desc
  limit result_limit;
$$;

create or replace function top_artists_for_station(p_station_id bigint, result_limit int default 10)
returns table (name text, play_count bigint)
language sql
stable
set search_path = ''
as $$
  select c.name, count(*) as play_count
  from public.plays p
  join public.songs s on s.id = p.song_id
  join public.artists a on a.id = s.artist_id
  join public.artists c on c.id = coalesce(a.canonical_artist_id, a.id)
  where p.station_id = p_station_id
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by c.id, c.name
  order by play_count desc
  limit result_limit;
$$;

-- The title shown is the spelling played most that month
create or replace function top_songs_for_month(
  start_date timestamptz,
  end_date timestamptz,
  result_limit int default 10,
  filter_station_ids bigint[] default null
)
returns table (title text, artist_name text, play_count bigint)
language sql
stable
set search_path = ''
as $$
  select
    mode() within group (order by s.title) as title,
    c.name as artist_name,
    count(*) as play_count
  from public.plays p
  join public.songs s on s.id = p.song_id
  join public.artists a on a.id = s.artist_id
  join public.artists c on c.id = coalesce(a.canonical_artist_id, a.id)
  where p.time_played >= start_date
    and p.time_played < end_date
    and p.is_deleted = false
    and p.is_likely_not_music = false
    and (filter_station_ids is null or p.station_id = any(filter_station_ids))
  group by c.id, c.name, lower(s.title)
  order by play_count desc
  limit result_limit;
$$;

-- Collaborations, by canonical artist on both sides: "Eivør Pálsdóttir &
-- DR Big Band" counts for Eivør, and a combined credit spelled two ways is
-- listed once.

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
  with family as (
    select f.id from public.artist_family(p_artist_id) f
  ),
  credits as (
    select distinct coalesce(c.canonical_artist_id, c.id) as credit_id
    from public.artist_members am
    join public.artists c on c.id = am.artist_id
    where am.member_id in (select id from family)
  )
  select
    ps.artist_name as credit_name,
    null::text as song_title,
    ps.play_count,
    ps.first_played,
    ps.last_played
  from credits cr
  join public.artist_play_stats ps on ps.artist_id = cr.credit_id
  where cr.credit_id not in (select id from family)
  union all
  select
    ca.name,
    mode() within group (order by s.title),
    count(p.id),
    min(p.time_played),
    max(p.time_played)
  from public.song_features sf
  join public.songs s on s.id = sf.song_id
  join public.artists a on a.id = s.artist_id
  join public.artists ca on ca.id = coalesce(a.canonical_artist_id, a.id)
  join public.plays p on p.song_id = s.id
  where sf.artist_id in (select id from family)
    and ca.id not in (select id from family)
    and p.is_deleted = false
    and p.is_likely_not_music = false
  group by ca.id, ca.name, lower(s.title)
  order by play_count desc, credit_name, song_title;
$$;

-- Members and guests by their canonical names
create or replace function artist_credit_members(p_artist_id bigint)
returns table (name text)
language sql
stable
set search_path = ''
as $$
  select c.name
  from public.artist_members am
  join public.artists m on m.id = am.member_id
  join public.artists c on c.id = coalesce(m.canonical_artist_id, m.id)
  where am.artist_id = p_artist_id
  group by c.id, c.name
  order by min(am.position);
$$;

create or replace function song_guests(p_song_id bigint)
returns table (name text)
language sql
stable
set search_path = ''
as $$
  select c.name
  from public.song_features sf
  join public.artists g on g.id = sf.artist_id
  join public.artists c on c.id = coalesce(g.canonical_artist_id, g.id)
  where sf.song_id in (select f.id from public.song_family(p_song_id) f)
  group by c.id, c.name
  order by min(sf.position);
$$;
