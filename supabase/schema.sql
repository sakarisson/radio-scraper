create table if not exists artists (
  id bigserial primary key,
  name text not null unique
);

create table if not exists songs (
  id bigserial primary key,
  title text not null,
  artist_id bigint not null references artists(id),
  unique(title, artist_id)
);

create table if not exists stations (
  id bigserial primary key,
  slug text not null unique
);

create table if not exists plays (
  id bigserial primary key,
  song_id bigint not null references songs(id),
  station_id bigint not null references stations(id),
  time_played timestamptz default now(),
  is_deleted boolean default false
);

create table if not exists raw_play_data (
  id bigserial primary key,
  play_id bigint not null references plays(id),
  raw_data jsonb not null
);

-- Used by the migration script to reset sequences after bulk insert with explicit IDs
create or replace function reset_sequence(table_name text)
returns void language plpgsql as $$
begin
  execute format(
    'select setval(pg_get_serial_sequence(%L, ''id''), coalesce(max(id), 0) + 1, false) from %I',
    table_name, table_name
  );
end;
$$;
