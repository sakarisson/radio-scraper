-- Akas: different spellings of the same artist. "Eivør Pálsdóttir" and
-- "Eivör Pálsdóttir" are both Eivør. Each spelling keeps its own row, as the
-- stations wrote it, and points to the canonical artist it's an aka of.
-- Pages and charts will count an artist's akas as the artist.

alter table artists
  add column if not exists canonical_artist_id bigint references artists(id);

create index if not exists artists_canonical_artist_id_idx
  on artists (canonical_artist_id)
  where canonical_artist_id is not null;

-- One level only: an aka points straight to a canonical artist, which is
-- never an aka itself. Finding an artist's canonical artist is then always
-- coalesce(canonical_artist_id, id).
create or replace function check_canonical_artist()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.canonical_artist_id is null then
    return new;
  end if;

  -- One change at a time, so two transactions can't each pass the checks
  -- below and together make a loop (a -> b and b -> a)
  perform pg_advisory_xact_lock(hashtext('artists.canonical_artist_id'));

  if new.canonical_artist_id = new.id then
    raise exception 'Artist % can''t be an aka of itself', new.id;
  end if;

  if exists (
    select 1 from public.artists
    where id = new.canonical_artist_id and canonical_artist_id is not null
  ) then
    raise exception 'Artist % is an aka itself. Point to its canonical artist instead.',
      new.canonical_artist_id;
  end if;

  if exists (select 1 from public.artists where canonical_artist_id = new.id) then
    raise exception 'Artist % has akas of its own. Point those to the new canonical artist first.',
      new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists artists_check_canonical on artists;
create trigger artists_check_canonical
  before insert or update of canonical_artist_id on artists
  for each row execute function check_canonical_artist();

-- Pairs that look alike but are different artists, like "Jan Zachariassen"
-- and "Josef Zachariassen", so the aka audit doesn't suggest them again
create table if not exists artist_aka_rejections (
  artist_id bigint not null references artists(id) on delete cascade,
  other_artist_id bigint not null references artists(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (artist_id, other_artist_id),
  check (artist_id < other_artist_id)
);

-- Same as every other table: only the service role can read or write it
alter table artist_aka_rejections enable row level security;
