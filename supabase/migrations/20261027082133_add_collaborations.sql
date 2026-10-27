-- Collaborations: artists credited together ("Faroe5 og Marius DC") and
-- guests named in song titles ("Frøknur (við Sakaris)").
--
-- These never change play counts. A combined credit stays its own artist,
-- and a song with a guest still belongs to the credited artist. They only
-- let each artist's page link to the collaborations they're part of.

-- Names are matched ignoring case, spaces and punctuation, so "Faroe5"
-- finds "FAROE5" and "Jay Z" finds "JAY-Z". "&" and "," are kept, so a part
-- like "jazzygold & Ayphin" doesn't match the credit "jazzygold, Ayphin"
-- and gets split into the two artists instead.
create or replace function artist_match_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(lower(p_name), '[^[:alnum:]&,]', '', 'g');
$$;

create index if not exists artists_match_key_idx
  on artists (public.artist_match_key(name));

-- The artist a name refers to, or null. An exact match (ignoring case and
-- extra spaces) beats a looser one, so "FAROE5" finds "FAROE5" rather than
-- "FAROE 5". Names with the key p_exclude_key never match: a credit must
-- not resolve to itself, or to another spelling of itself.
create or replace function match_artist(p_name text, p_exclude_key text default null)
returns bigint
language sql
stable
set search_path = ''
as $$
  select a.id
  from public.artists a
  where public.artist_match_key(a.name) = public.artist_match_key(p_name)
    and public.artist_match_key(p_name) <> ''
    and public.artist_match_key(p_name) is distinct from p_exclude_key
  order by
    lower(regexp_replace(trim(a.name), '\s+', ' ', 'g'))
      = lower(regexp_replace(trim(p_name), '\s+', ' ', 'g')) desc,
    a.id
  limit 1;
$$;

-- The artists named in a credit, in order, or null unless every name is a
-- known artist. That rule keeps band names whole: "Danny & the Veetos" isn't
-- split because "the Veetos" isn't an artist.
--
-- Strong separators ("," "feat." "ft." "x" "vs." "saman við") are split
-- first. Weak ones ("&" "og" "and" "+") are only split inside a part that
-- isn't itself an artist, so "Flemming & Vinmenn feat. Kristina Bærendsen"
-- keeps the band together. A bare "við" isn't a separator: it's part of
-- many Faroese names.
create or replace function resolve_artist_names(p_names text, p_exclude_key text default null)
returns bigint[]
language sql
stable
set search_path = ''
as $$
  with strong as (
    select s.i, s.part, public.match_artist(s.part, p_exclude_key) as whole
    from (
      select
        t.i,
        trim(regexp_replace(trim(t.part), '^(feat\.?|ft\.?|featuring|&|og|and)\s+', '', 'i')) as part
      from regexp_split_to_table(
        regexp_replace(p_names, '[][()]', ' ', 'g'),
        '\s*,\s*|\s+(feat\.?|ft\.?|featuring|x|vs\.?|saman\s+við)\s+',
        'i'
      ) with ordinality as t(part, i)
    ) s
    where s.part <> ''
  ),
  names as (
    select st.i, 0::bigint as j, st.whole as id
    from strong st
    where st.whole is not null
    union all
    select st.i, w.j, public.match_artist(trim(w.part), p_exclude_key)
    from strong st
    cross join lateral regexp_split_to_table(st.part, '\s+(&|og|and|\+)\s+', 'i')
      with ordinality as w(part, j)
    where st.whole is null
      and trim(w.part) <> ''
  )
  select case when count(*) > 0 and bool_and(id is not null)
    then array_agg(id order by i, j)
  end
  from names;
$$;

-- The guest named in a song title, or null: "Frøknur (við Sakaris)",
-- "Camping (feat. Árni Andreasen)", "Forever feat. Jazzygold".
--
-- "við", "med" and "with" are also everyday words, so they only count
-- inside brackets and before a capitalised name: "Kom heim við mær" and
-- "I will captain (við intro)" have no guest.
create or replace function song_title_guest(p_title text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(coalesce(
    (regexp_match(p_title, '[[(]\s*(feat\.?|ft\.?|featuring)\s+([^])]+)[])]', 'i'))[2],
    (regexp_match(
      p_title,
      '[[(]\s*([Ss]aman\s+við|[Vv]ið|[Mm]ed|[Ww]ith)\s+([[:upper:]][^])]*)[])]'
    ))[2],
    (regexp_match(p_title, '\s(feat\.?|ft\.?|featuring)\s+([^[(]+)', 'i'))[2]
  ));
$$;

-- Combined credits and the artists in them:
-- "Faroe5 og Marius DC" -> FAROE5 (1), Marius DC (2)
create materialized view if not exists artist_members as
  select distinct on (a.id, m.member_id)
    a.id as artist_id,
    m.member_id,
    m.position::int as position
  from public.artists a
  cross join lateral (
    select public.resolve_artist_names(a.name, public.artist_match_key(a.name)) as ids
  ) r
  cross join lateral unnest(r.ids) with ordinality as m(member_id, position)
  where (select count(distinct x) from unnest(r.ids) as x) > 1
  order by a.id, m.member_id, m.position;

-- Required for refresh concurrently
create unique index if not exists artist_members_pkey_idx
  on artist_members (artist_id, member_id);

create index if not exists artist_members_member_id_idx
  on artist_members (member_id);

-- Songs and the guests named in their titles:
-- "Frøknur (við Sakaris)" by BYRTA -> SAKARIS
--
-- A guest who is already part of the credit is left out, so "Fortnight
-- (feat. Post Malone)" by "Taylor Swift, Post Malone" isn't listed twice.
-- Refresh this after artist_members.
create materialized view if not exists song_features as
  select distinct on (s.id, g.artist_id)
    s.id as song_id,
    g.artist_id,
    g.position::int as position
  from public.songs s
  join public.artists a on a.id = s.artist_id
  cross join lateral (select public.song_title_guest(s.title) as guest) t
  cross join lateral unnest(
    public.resolve_artist_names(t.guest, public.artist_match_key(a.name))
  ) with ordinality as g(artist_id, position)
  where t.guest is not null
    and g.artist_id <> s.artist_id
    and not exists (
      select 1
      from public.artist_members am
      where am.artist_id = s.artist_id
        and am.member_id = g.artist_id
    )
  order by s.id, g.artist_id, g.position;

create unique index if not exists song_features_pkey_idx
  on song_features (song_id, artist_id);

create index if not exists song_features_artist_id_idx
  on song_features (artist_id);

-- Materialized views don't support RLS. Keep them as locked down as the
-- tables: only the service role (used by the web UI) can read them.
revoke all on artist_members from anon, authenticated;
revoke all on song_features from anon, authenticated;

-- New artists and songs show up all the time, but collaborations don't need
-- to appear within minutes. Hourly, in order, since song_features reads
-- artist_members.
select cron.schedule(
  'refresh-collaborations',
  '17 * * * *',
  $$
    refresh materialized view concurrently public.artist_members;
    refresh materialized view concurrently public.song_features;
  $$
);
