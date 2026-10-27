import "server-only";
import { cacheLife } from "next/cache";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { faroeMonthStart } from "./time";

// Every exported function here is cached with "use cache". The cache lifetimes
// ("live", "stats", "archive") are defined in next.config.js.

let _supabase: SupabaseClient | null = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  _supabase = createClient(supabaseUrl, supabaseKey);
  return _supabase;
}

/** Escape LIKE wildcards so `ilike` only does a case-insensitive match. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Site-wide totals

type StationStats = { stationId: number; slug: string; playCount: number };

/** Music plays per station, from the station_play_stats materialized view. */
async function getStationStats(): Promise<StationStats[]> {
  const { data, error } = await getSupabase()
    .from("station_play_stats")
    .select("station_id, slug, play_count");

  if (error) throw error;
  return (data ?? []).map((row) => ({
    stationId: row.station_id,
    slug: row.slug,
    playCount: row.play_count,
  }));
}

export async function getTotalPlayCount() {
  "use cache";
  cacheLife("stats");

  const stations = await getStationStats();
  return stations.reduce((sum, s) => sum + s.playCount, 0);
}

export async function getStats() {
  "use cache";
  cacheLife("stats");

  const [artists, songs, playCount] = await Promise.all([
    // Akas are other spellings of an artist, not artists of their own
    getSupabase()
      .from("artists")
      .select("*", { count: "exact", head: true })
      .is("canonical_artist_id", null),
    getSupabase()
      .from("songs")
      .select("*", { count: "exact", head: true }),
    getTotalPlayCount(),
  ]);

  if (artists.error) throw artists.error;
  if (songs.error) throw songs.error;

  return {
    artistCount: artists.count ?? 0,
    songCount: songs.count ?? 0,
    playCount,
  };
}

export async function getEarliestPlayDate() {
  "use cache";
  cacheLife("archive");

  const { data, error } = await getSupabase()
    .from("plays")
    .select("time_played")
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: true })
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) return null;
  return data[0].time_played as string;
}

// ---------------------------------------------------------------------------
// Recent plays

export async function getRecentPlays(limit: number) {
  "use cache";
  cacheLife("live");

  const { data, error } = await getSupabase()
    .from("plays")
    .select(
      `
      id,
      time_played,
      songs!inner (
        title,
        artists!inner ( name )
      ),
      stations!inner ( slug )
    `
    )
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((play: any) => ({
    id: play.id as number,
    artist: play.songs.artists.name as string,
    title: play.songs.title as string,
    time_played: play.time_played as string,
    station: play.stations.slug as string,
  }));
}

export async function getLatestPlayPerStation() {
  "use cache";
  cacheLife("live");

  const { data: stations, error: stationsError } = await getSupabase()
    .from("stations")
    .select("id, slug");

  if (stationsError) throw stationsError;
  if (!stations || stations.length === 0) return [];

  const results = await Promise.all(
    stations.map(async (station) => {
      const { data, error } = await getSupabase()
        .from("plays")
        .select(
          `
          time_played,
          songs!inner (
            title,
            artists!inner ( name )
          )
        `
        )
        .eq("station_id", station.id)
        .eq("is_deleted", false)
        .eq("is_likely_not_music", false)
        .order("time_played", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const play = data[0] as any;
      return {
        station: station.slug as string,
        title: play.songs.title as string,
        artist: play.songs.artists.name as string,
        time_played: play.time_played as string,
      };
    })
  );

  return results.filter((r) => r !== null);
}

// ---------------------------------------------------------------------------
// Stations

export async function getAllStationSlugs() {
  "use cache";
  cacheLife("stats");

  const { data, error } = await getSupabase()
    .from("stations")
    .select("slug")
    .order("slug");

  if (error) throw error;
  return (data ?? []).map((s) => s.slug as string);
}

export async function getStations() {
  "use cache";
  cacheLife("live");

  const [stats, latest] = await Promise.all([
    getStationStats(),
    getLatestPlayPerStation(),
  ]);

  return stats.map((station) => {
    const play = latest.find((l) => l.station === station.slug);
    return {
      slug: station.slug,
      playCount: station.playCount,
      latestSong: play
        ? { title: play.title, artist: play.artist, time_played: play.time_played }
        : null,
    };
  });
}

export async function getStation(slug: string) {
  "use cache";
  cacheLife("stats");

  const { data, error } = await getSupabase()
    .from("station_play_stats")
    .select("station_id, slug, play_count")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.station_id as number,
    slug: data.slug as string,
    playCount: data.play_count as number,
  };
}

type StationPlay = {
  id: number;
  artist: string;
  title: string;
  time_played: string;
};

/** A station's most recent plays, newest first. */
export async function getStationPlays(
  stationId: number,
  limit: number
): Promise<StationPlay[]> {
  "use cache";
  cacheLife("live");

  const { data, error } = await getSupabase().rpc("station_plays_page", {
    p_station_id: stationId,
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    artist: row.artist_name,
    title: row.title,
    time_played: row.time_played,
  }));
}

// ---------------------------------------------------------------------------
// Artists

export async function getTopArtistsAllTime(
  offset: number,
  limit: number,
  search?: string
): Promise<{ id: number; name: string; playCount: number }[]> {
  "use cache";
  cacheLife("stats");

  const { data, error } = await getSupabase().rpc("top_artists_all_time", {
    p_limit: limit,
    p_offset: offset,
    p_search: search || null,
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.artist_id,
    name: row.artist_name,
    playCount: row.play_count,
  }));
}

export async function getArtistCountWithPlays(
  search?: string
): Promise<number> {
  "use cache";
  cacheLife("stats");

  const { data, error } = await getSupabase().rpc("artist_count_with_plays", {
    p_search: search || null,
  });

  if (error) throw error;
  return (data as number) ?? 0;
}

/** A canonical artist with its other spellings (akas). */
type ArtistFamily = {
  id: number;
  /** The artist's own id first, then its akas */
  familyIds: number[];
  akaNames: string[];
};

/**
 * The artist with this exact name. An aka resolves to the name of its
 * canonical artist instead, so its page can redirect there.
 */
async function findArtist(
  artistName: string
): Promise<ArtistFamily | { canonicalName: string } | null> {
  const { data, error } = await getSupabase()
    .from("artists")
    .select("id, canonical_artist_id")
    .eq("name", artistName)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (data.canonical_artist_id !== null) {
    const canonical = await getSupabase()
      .from("artists")
      .select("name")
      .eq("id", data.canonical_artist_id)
      .single();
    if (canonical.error) throw canonical.error;
    return { canonicalName: canonical.data.name as string };
  }

  const akas = await getSupabase()
    .from("artists")
    .select("id, name")
    .eq("canonical_artist_id", data.id)
    .order("name");
  if (akas.error) throw akas.error;

  return {
    id: data.id as number,
    familyIds: [data.id as number, ...akas.data.map((a) => a.id as number)],
    akaNames: akas.data.map((a) => a.name as string),
  };
}

async function getArtistPlays(
  artistIds: number[],
  limit: number,
  { oldestFirst = false }: { oldestFirst?: boolean } = {}
) {
  const { data, error } = await getSupabase()
    .from("plays")
    .select(
      `
      id,
      time_played,
      songs!inner ( title, artist_id ),
      stations!inner ( slug )
    `
    )
    .in("songs.artist_id", artistIds)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: oldestFirst })
    .limit(limit);

  if (error) throw error;

  return data.map((play: any) => ({
    id: play.id as number,
    title: play.songs.title as string,
    time_played: play.time_played as string,
    station: play.stations.slug as string,
  }));
}

async function getArtistPlayCount(artistIds: number[]) {
  const { count, error } = await getSupabase()
    .from("plays")
    .select("id, songs!inner(artist_id)", { count: "exact", head: true })
    .in("songs.artist_id", artistIds)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false);

  if (error) throw error;
  return count ?? 0;
}

async function rpcRows<T>(fn: string, args: Record<string, unknown>) {
  const { data, error } = await getSupabase().rpc(fn, args);
  if (error) throw error;
  return (data ?? []) as T;
}

/**
 * Everything the artist page shows, counting the artist's akas as the
 * artist. For an aka, only the canonical artist's name to redirect to, and
 * null if there's no such artist.
 */
export async function getArtistPage(artistName: string) {
  "use cache";
  cacheLife("live");

  const artist = await findArtist(artistName);
  if (artist === null) return null;
  if ("canonicalName" in artist) return { redirectTo: artist.canonicalName };
  const { id: artistId, familyIds, akaNames } = artist;

  const [
    plays,
    firstPlays,
    totalCount,
    stations,
    songs,
    dailyPlays,
    members,
    collaborations,
  ] = await Promise.all([
    getArtistPlays(familyIds, 10),
    getArtistPlays(familyIds, 1, { oldestFirst: true }),
    getArtistPlayCount(familyIds),
    rpcRows<any[]>("artist_station_breakdown", { p_artist_id: artistId }),
    rpcRows<any[]>("artist_songs_overview", { p_artist_id: artistId }),
    rpcRows<Record<string, number>>("artist_daily_plays", {
      p_artist_id: artistId,
    }),
    getCreditMembers(artistId),
    rpcRows<any[]>("artist_collaborations", { p_artist_id: artistId }),
  ]);

  return {
    redirectTo: null,
    /** Other spellings stations have used for this artist */
    akaNames,
    plays,
    firstPlay: firstPlays[0] ?? null,
    totalCount,
    stationBreakdown: stations.map((row) => ({
      station: row.slug as string,
      playCount: row.play_count as number,
    })),
    songs: songs.map((row) => ({
      songId: row.song_id as number,
      title: row.title as string,
      playCount: row.play_count as number,
      firstPlayed: row.first_played as string,
      lastPlayed: row.last_played as string,
    })),
    /** Plays per Faroese local date, e.g. { "2025-10-12": 3 } */
    dailyPlays,
    /** For a combined credit like "Faroe5 og Marius DC", the artists in it */
    members,
    /**
     * Combined credits this artist is part of (songTitle is null), and songs
     * where they're the guest. Their plays aren't in this artist's totals.
     */
    collaborations: collaborations.map((row) => ({
      creditName: row.credit_name as string,
      songTitle: row.song_title as string | null,
      playCount: row.play_count as number,
      firstPlayed: row.first_played as string,
      lastPlayed: row.last_played as string,
    })),
  };
}

async function getCreditMembers(artistId: number) {
  const rows = await rpcRows<{ name: string }[]>("artist_credit_members", {
    p_artist_id: artistId,
  });
  return rows.map((row) => row.name);
}

// ---------------------------------------------------------------------------
// Songs

/**
 * The songs with this title, ignoring case, by the artist or one of its
 * akas. They count as one song. Same set as song_family() in the database.
 */
async function findSongIds(
  artistIds: number[],
  songTitle: string
): Promise<number[]> {
  const { data, error } = await getSupabase()
    .from("songs")
    .select("id")
    .in("artist_id", artistIds)
    .ilike("title", escapeLike(songTitle))
    .order("id");

  if (error) throw error;
  return data.map((row) => row.id as number);
}

/**
 * Everything the song page shows, counting the same title by the artist's
 * akas. For an aka, only the canonical artist's name to redirect to, and
 * null if there's no such song.
 */
export async function getSongPage(artistName: string, songTitle: string) {
  "use cache";
  cacheLife("live");

  const artist = await findArtist(artistName);
  if (artist === null) return null;
  if ("canonicalName" in artist) return { redirectTo: artist.canonicalName };
  const songIds = await findSongIds(artist.familyIds, songTitle);
  if (songIds.length === 0) return null;
  const songId = songIds[0];

  const [recent, first, count, stations, dailyPlays, members, guests] =
    await Promise.all([
      getSupabase()
        .from("plays")
        .select("id, time_played, stations!inner ( slug )")
        .in("song_id", songIds)
        .eq("is_deleted", false)
        .eq("is_likely_not_music", false)
        .order("time_played", { ascending: false })
        .limit(10),
      getSupabase()
        .from("plays")
        .select("time_played")
        .in("song_id", songIds)
        .eq("is_deleted", false)
        .eq("is_likely_not_music", false)
        .order("time_played", { ascending: true })
        .limit(1),
      getSupabase()
        .from("plays")
        .select("id", { count: "exact", head: true })
        .in("song_id", songIds)
        .eq("is_deleted", false)
        .eq("is_likely_not_music", false),
      rpcRows<any[]>("song_station_breakdown", { p_song_id: songId }),
      rpcRows<Record<string, number>>("song_daily_plays", {
        p_song_id: songId,
      }),
      getCreditMembers(artist.id),
      rpcRows<{ name: string }[]>("song_guests", { p_song_id: songId }),
    ]);

  if (recent.error) throw recent.error;
  if (first.error) throw first.error;
  if (count.error) throw count.error;

  const plays = recent.data.map((play: any) => ({
    id: play.id as number,
    time_played: play.time_played as string,
    station: play.stations.slug as string,
  }));

  return {
    redirectTo: null,
    plays,
    totalCount: count.count ?? 0,
    playRange:
      plays.length > 0 && first.data.length > 0
        ? {
            firstPlayed: first.data[0].time_played as string,
            lastPlayed: plays[0].time_played,
          }
        : null,
    stationBreakdown: stations.map((row) => ({
      station: row.slug as string,
      playCount: row.play_count as number,
    })),
    /** Plays per Faroese local date, e.g. { "2025-10-12": 3 } */
    dailyPlays,
    /** For a combined credit like "Faroe5 og Marius DC", the artists in it */
    members,
    /** Guests named in the title, like Sakaris in "Frøknur (við Sakaris)" */
    guests: guests.map((row) => row.name),
  };
}

// ---------------------------------------------------------------------------
// Charts

/** A calendar month in Faroese time, as UTC timestamps [start, end). */
function faroeMonthRange(year: number, month: number) {
  const next =
    month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  return {
    start: faroeMonthStart(year, month),
    end: faroeMonthStart(next.year, next.month),
  };
}

/** Charts for a finished month never change, so keep them much longer. */
function cacheChart(end: string) {
  if (new Date(end).getTime() <= Date.now()) {
    cacheLife("archive");
  } else {
    cacheLife("stats");
  }
}

async function resolveStationIds(slugs?: string[]) {
  if (!slugs || slugs.length === 0) return null;

  const { data, error } = await getSupabase()
    .from("stations")
    .select("id")
    .in("slug", slugs);

  if (error) throw error;
  return (data ?? []).map((s) => s.id as number);
}

export async function getTopArtistsForMonth(
  year: number,
  month: number,
  limit: number = 10,
  stationSlugs?: string[]
): Promise<{ name: string; playCount: number }[]> {
  "use cache";
  const { start, end } = faroeMonthRange(year, month);
  cacheChart(end);

  const { data, error } = await getSupabase().rpc("top_artists_for_month", {
    start_date: start,
    end_date: end,
    result_limit: limit,
    filter_station_ids: await resolveStationIds(stationSlugs),
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    name: row.name,
    playCount: row.play_count,
  }));
}

export async function getTopSongsForMonth(
  year: number,
  month: number,
  limit: number = 10,
  stationSlugs?: string[]
): Promise<{ title: string; artist: string; playCount: number }[]> {
  "use cache";
  const { start, end } = faroeMonthRange(year, month);
  cacheChart(end);

  const { data, error } = await getSupabase().rpc("top_songs_for_month", {
    start_date: start,
    end_date: end,
    result_limit: limit,
    filter_station_ids: await resolveStationIds(stationSlugs),
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    title: row.title,
    artist: row.artist_name,
    playCount: row.play_count,
  }));
}
