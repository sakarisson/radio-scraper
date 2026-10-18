-- Pin the search_path of the remaining functions that didn't set one, so
-- they can't be made to resolve tables from another schema (Supabase
-- security advisor: function_search_path_mutable). Their bodies use
-- unqualified table names, so pin it to public, as with reset_sequence.
alter function top_artists_for_month(timestamptz, timestamptz, int, bigint[]) set search_path = public;
alter function top_songs_for_month(timestamptz, timestamptz, int, bigint[]) set search_path = public;
alter function top_artists_for_station(bigint, int) set search_path = public;
alter function song_station_breakdown(bigint) set search_path = public;
alter function artist_station_breakdown(bigint) set search_path = public;
alter function artist_play_counts(bigint[]) set search_path = public;
