-- The aka audit: artists that are probably other spellings of each other.
-- These only suggest. Akas are set by hand, after review.

create extension if not exists pg_trgm with schema extensions;

-- Ignores case, spaces and punctuation: "FAROE 5", "Faroe5" and "FAROE5"
-- get the same key.
create or replace function aka_spelling_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(lower(p_name), '[^[:alnum:]]', '', 'g');
$$;

-- Also ignores accents, "&" / "+" / "and" / "og" between names, and a
-- leading "The": "Herborg Torkilsdóttir" and "Herborg Torkilsdottir",
-- "Lív og Tróndur" and "Lív & Tróndur", "The Beatles" and "Beatles".
create or replace function aka_loose_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select public.aka_spelling_key(replace(
    translate(
      regexp_replace(
        regexp_replace(lower(p_name), '^the\s+', ''),
        '\s(&|\+|and|og)\s', ' ', 'g'
      ),
      'áàâäãåéèêëíìîïóòôöõøúùûüýÿðñç',
      'aaaaaaeeeeiiiioooooouuuuyydnc'
    ),
    'æ', 'ae'
  ));
$$;

-- Groups of artists that share a loose key but aren't all the same artist
-- yet. tier 1: only case, spaces or punctuation differ, so they're almost
-- certainly the same. tier 2: accents, connectors or "The" differ too, so
-- check them. A group is left out once every pair in it is linked or
-- rejected. The suggested canonical artist is the one with the most plays,
-- counting the akas it already has.
create or replace function artist_aka_candidates()
returns table (
  group_key text,
  tier int,
  artist_id bigint,
  name text,
  play_count bigint,
  canonical_artist_id bigint,
  suggested_canonical_id bigint,
  group_play_count bigint
)
language sql
stable
set search_path = ''
as $$
  with a as (
    select
      a.id,
      a.name,
      a.canonical_artist_id,
      coalesce(a.canonical_artist_id, a.id) as resolved_id,
      coalesce(ps.play_count, 0) as play_count,
      public.aka_spelling_key(a.name) as spelling_key,
      public.aka_loose_key(a.name) as loose_key
    from public.artists a
    left join public.artist_play_stats ps on ps.artist_id = a.id
  ),
  open_groups as (
    select g.loose_key
    from a g
    where g.loose_key <> ''
    group by g.loose_key
    having count(distinct g.resolved_id) > 1
  ),
  open_pairs as (
    select distinct x.loose_key
    from a x
    join a y on y.loose_key = x.loose_key and x.id < y.id
    join open_groups og on og.loose_key = x.loose_key
    where x.resolved_id <> y.resolved_id
      and not exists (
        select 1 from public.artist_aka_rejections r
        where r.artist_id = x.id and r.other_artist_id = y.id
      )
  ),
  totals as (
    select a.loose_key, a.resolved_id, sum(a.play_count) as plays
    from a
    join open_pairs op on op.loose_key = a.loose_key
    group by a.loose_key, a.resolved_id
  ),
  groups as (
    select
      t.loose_key,
      (array_agg(t.resolved_id order by t.plays desc, t.resolved_id))[1] as suggested_id,
      sum(t.plays) as group_plays
    from totals t
    group by t.loose_key
  ),
  tiers as (
    select a.loose_key, case when count(distinct a.spelling_key) = 1 then 1 else 2 end as tier
    from a
    join groups g on g.loose_key = a.loose_key
    group by a.loose_key
  )
  select
    a.loose_key,
    t.tier,
    a.id,
    a.name,
    a.play_count,
    a.canonical_artist_id,
    g.suggested_id,
    g.group_plays
  from a
  join groups g on g.loose_key = a.loose_key
  join tiers t on t.loose_key = a.loose_key
  order by g.group_plays desc, a.loose_key, a.play_count desc, a.id;
$$;

-- Pairs whose names are similar but not the same, which catches typos like
-- "Holgar Jacobnsen" for "Holgar Jacobsen". Many of these are different
-- people ("Jan" and "Josef Zachariassen"), so every pair needs a decision.
-- Only artists with at least p_min_plays music plays are compared.
create or replace function artist_aka_similar(
  p_min_plays int default 5,
  p_min_similarity real default 0.6
)
returns table (
  artist_id bigint,
  name text,
  play_count bigint,
  other_artist_id bigint,
  other_name text,
  other_play_count bigint,
  similarity real
)
language sql
stable
set search_path = ''
as $$
  with a as (
    select
      a.id,
      a.name,
      coalesce(a.canonical_artist_id, a.id) as resolved_id,
      ps.play_count,
      public.aka_loose_key(a.name) as loose_key,
      lower(a.name) as lowered
    from public.artists a
    join public.artist_play_stats ps on ps.artist_id = a.id
    where ps.play_count >= p_min_plays
  )
  select
    x.id,
    x.name,
    x.play_count,
    y.id,
    y.name,
    y.play_count,
    extensions.similarity(x.lowered, y.lowered)
  from a x
  join a y
    on x.id < y.id
    and left(x.loose_key, 1) = left(y.loose_key, 1)
    and abs(length(x.loose_key) - length(y.loose_key)) <= 3
  where x.loose_key <> y.loose_key
    and x.resolved_id <> y.resolved_id
    and extensions.similarity(x.lowered, y.lowered) >= p_min_similarity
    and not exists (
      select 1 from public.artist_aka_rejections r
      where r.artist_id = x.id and r.other_artist_id = y.id
    )
  order by x.play_count + y.play_count desc;
$$;
