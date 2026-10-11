-- Until now the only indexes were primary keys and unique constraints, so most
-- queries against plays (~800k rows) were sequential scans. This was exhausting
-- the project's Disk IO budget.

-- Scraper: getMostRecentPlay (filter by station, order by id desc)
create index if not exists plays_station_id_id_idx
  on plays (station_id, id desc);

-- Scraper: flagPreviousPlayIfShort, and the hourly no-writes check
-- (filter by station, order by time_played desc)
create index if not exists plays_station_id_time_played_idx
  on plays (station_id, time_played desc);

-- song_station_breakdown, artist_songs_overview, and joins from songs to plays
create index if not exists plays_song_id_idx
  on plays (song_id);

-- top_artists_for_month / top_songs_for_month (time range over music plays)
create index if not exists plays_music_time_played_idx
  on plays (time_played)
  where is_deleted = false and is_likely_not_music = false;

-- Artist pages, artist_station_breakdown, artist_play_counts
create index if not exists songs_artist_id_idx
  on songs (artist_id);

-- Foreign key lookups from plays to raw_play_data
create index if not exists raw_play_data_play_id_idx
  on raw_play_data (play_id);

-- The scraper looks up artists and songs with ILIKE, and top_artists_all_time
-- searches with ILIKE '%term%'. Btree indexes can't serve ILIKE; trigram
-- indexes can.
create extension if not exists pg_trgm with schema extensions;

create index if not exists artists_name_trgm_idx
  on artists using gin (name extensions.gin_trgm_ops);

create index if not exists songs_title_trgm_idx
  on songs using gin (title extensions.gin_trgm_ops);
