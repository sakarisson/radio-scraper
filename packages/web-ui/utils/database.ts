import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

export async function getStats() {
  const [artists, songs, plays] = await Promise.all([
    getSupabase()
      .from("artists")
      .select("*", { count: "exact", head: true }),
    getSupabase()
      .from("songs")
      .select("*", { count: "exact", head: true }),
    getSupabase()
      .from("plays")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("is_likely_not_music", false),
  ]);

  return {
    artistCount: artists.count ?? 0,
    songCount: songs.count ?? 0,
    playCount: plays.count ?? 0,
  };
}

export async function getRecentPlays(limit: number) {
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
    id: play.id,
    artist: (play.songs as any).artists.name,
    title: (play.songs as any).title,
    time_played: play.time_played,
    station: (play.stations as any).slug,
  }));
}

export async function getLatestPlayPerStation() {
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
          id,
          time_played,
          songs!inner (
            title,
            artists!inner ( name )
          ),
          stations!inner ( slug )
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
        station: station.slug,
        title: play.songs.title,
        artist: play.songs.artists.name,
        time_played: play.time_played,
      };
    })
  );

  return results.filter(Boolean) as {
    station: string;
    title: string;
    artist: string;
    time_played: string;
  }[];
}

export async function getArtistCount(query?: string) {
  let q = getSupabase()
    .from("artists")
    .select("*", { count: "exact", head: true });

  if (query) {
    q = q.ilike("name", `%${query}%`);
  }

  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export async function searchArtists(
  query: string | undefined,
  offset: number,
  limit: number
) {
  let q = getSupabase()
    .from("artists")
    .select("id, name")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (query) {
    q = q.ilike("name", `%${query}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function findArtistId(artistName: string): Promise<number | null> {
  const { data: artist, error: artistError } = await getSupabase()
    .from("artists")
    .select("id")
    .eq("name", artistName)
    .single();

  if (artistError) {
    if (artistError.code === "PGRST116") return null;
    throw artistError;
  }
  return artist.id;
}

async function findSongId(
  artistName: string,
  songTitle: string
): Promise<number | null> {
  const artistId = await findArtistId(artistName);
  if (artistId === null) return null;

  const { data: song, error } = await getSupabase()
    .from("songs")
    .select("id")
    .eq("artist_id", artistId)
    .ilike("title", songTitle)
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return song.id;
}

export async function getSongPlayCount(artistName: string, songTitle: string) {
  const songId = await findSongId(artistName, songTitle);
  if (songId === null) return null;

  const { count, error } = await getSupabase()
    .from("plays")
    .select("*", { count: "exact", head: true })
    .eq("song_id", songId)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false);

  if (error) throw error;
  return count ?? 0;
}

export async function getSongPlays(
  artistName: string,
  songTitle: string,
  offset: number = 0,
  limit: number = 50
) {
  const songId = await findSongId(artistName, songTitle);
  if (songId === null) return null;

  const { data, error } = await getSupabase()
    .from("plays")
    .select(
      `
      id,
      time_played,
      stations!inner ( slug )
    `
    )
    .eq("song_id", songId)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map((play: any) => ({
    id: play.id,
    time_played: play.time_played,
    station: play.stations.slug,
  }));
}

export async function getSongStationBreakdown(
  artistName: string,
  songTitle: string
): Promise<{ station: string; playCount: number }[] | null> {
  const songId = await findSongId(artistName, songTitle);
  if (songId === null) return null;

  const { data, error } = await getSupabase().rpc("song_station_breakdown", {
    p_song_id: songId,
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    station: row.slug,
    playCount: row.play_count,
  }));
}

export async function getArtistStationBreakdown(
  artistName: string
): Promise<{ station: string; playCount: number }[] | null> {
  const artistId = await findArtistId(artistName);
  if (artistId === null) return null;

  const { data, error } = await getSupabase().rpc("artist_station_breakdown", {
    p_artist_id: artistId,
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    station: row.slug,
    playCount: row.play_count,
  }));
}

export async function getArtistPlayCount(artistName: string) {
  const artistId = await findArtistId(artistName);
  if (artistId === null) return null;

  const { count, error } = await getSupabase()
    .from("plays")
    .select("*, songs!inner(*)", { count: "exact", head: true })
    .eq("songs.artist_id", artistId)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false);

  if (error) throw error;
  return count ?? 0;
}

export async function getArtistPlays(
  artistName: string,
  offset: number = 0,
  limit: number = 50
) {
  const artistId = await findArtistId(artistName);
  if (artistId === null) return null;

  const { data, error } = await getSupabase()
    .from("plays")
    .select(
      `
      id,
      time_played,
      songs!inner (
        title,
        artist_id,
        artists!inner ( name )
      ),
      stations!inner ( slug )
    `
    )
    .eq("songs.artist_id", artistId)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map((play: any) => ({
    id: play.id,
    artist: (play.songs as any).artists.name,
    title: (play.songs as any).title,
    time_played: play.time_played,
    station: (play.stations as any).slug,
  }));
}

export async function getAllStationSlugs() {
  const { data, error } = await getSupabase()
    .from("stations")
    .select("slug")
    .order("slug");

  if (error) throw error;
  return (data ?? []).map((s) => s.slug);
}

async function resolveStationIds(slugs: string[]): Promise<number[]> {
  const { data, error } = await getSupabase()
    .from("stations")
    .select("id")
    .in("slug", slugs);

  if (error) throw error;
  return (data ?? []).map((s) => s.id);
}

export async function getTopArtistsForMonth(
  year: number,
  month: number,
  limit: number = 10,
  stationSlugs?: string[]
): Promise<{ name: string; playCount: number }[]> {
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01T00:00:00Z`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const startOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00Z`;

  const stationIds =
    stationSlugs && stationSlugs.length > 0
      ? await resolveStationIds(stationSlugs)
      : null;

  const { data, error } = await getSupabase().rpc("top_artists_for_month", {
    start_date: startOfMonth,
    end_date: startOfNextMonth,
    result_limit: limit,
    filter_station_ids: stationIds,
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
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01T00:00:00Z`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const startOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00Z`;

  const stationIds =
    stationSlugs && stationSlugs.length > 0
      ? await resolveStationIds(stationSlugs)
      : null;

  const { data, error } = await getSupabase().rpc("top_songs_for_month", {
    start_date: startOfMonth,
    end_date: startOfNextMonth,
    result_limit: limit,
    filter_station_ids: stationIds,
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    title: row.title,
    artist: row.artist_name,
    playCount: row.play_count,
  }));
}

export async function getStations() {
  const { data: stations, error } = await getSupabase()
    .from("stations")
    .select("id, slug");

  if (error) throw error;
  if (!stations) return [];

  const results = await Promise.all(
    stations.map(async (station) => {
      const [countResult, latestResult] = await Promise.all([
        getSupabase()
          .from("plays")
          .select("*", { count: "exact", head: true })
          .eq("station_id", station.id)
          .eq("is_deleted", false)
          .eq("is_likely_not_music", false),
        getSupabase()
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
          .limit(1),
      ]);

      if (countResult.error) throw countResult.error;
      if (latestResult.error) throw latestResult.error;

      const latest = latestResult.data?.[0] as any;
      return {
        slug: station.slug,
        playCount: countResult.count ?? 0,
        latestSong: latest
          ? {
              title: latest.songs.title,
              artist: latest.songs.artists.name,
              time_played: latest.time_played,
            }
          : null,
      };
    })
  );

  return results;
}

export async function getStationPlayCount(slug: string) {
  const { data: station } = await getSupabase()
    .from("stations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!station) return null;

  const { count, error } = await getSupabase()
    .from("plays")
    .select("*", { count: "exact", head: true })
    .eq("station_id", station.id)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false);

  if (error) throw error;
  return count ?? 0;
}

export async function getStationPlays(
  slug: string,
  offset: number = 0,
  limit: number = 50
) {
  const { data: station } = await getSupabase()
    .from("stations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!station) return null;

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
    .eq("station_id", station.id)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map((play: any) => ({
    id: play.id,
    artist: play.songs.artists.name,
    title: play.songs.title,
    time_played: play.time_played,
    station: play.stations.slug,
  }));
}

export async function getTopArtistsForStation(
  slug: string,
  limit: number = 10
): Promise<{ name: string; playCount: number }[]> {
  const { data: station } = await getSupabase()
    .from("stations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!station) return [];

  const { data, error } = await getSupabase().rpc("top_artists_for_station", {
    p_station_id: station.id,
    result_limit: limit,
  });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    name: row.name,
    playCount: row.play_count,
  }));
}

export async function getArtistPlayCounts(
  artistIds: number[]
): Promise<Record<number, number>> {
  if (artistIds.length === 0) return {};

  const { data, error } = await getSupabase().rpc("artist_play_counts", {
    p_artist_ids: artistIds,
  });

  if (error) throw error;

  const counts: Record<number, number> = {};
  for (const row of data ?? []) {
    counts[row.artist_id] = row.play_count;
  }

  return counts;
}

export async function getTopArtistsAllTime(
  offset: number,
  limit: number,
  search?: string
): Promise<{ id: number; name: string; playCount: number }[]> {
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
  const { data, error } = await getSupabase().rpc("artist_count_with_plays", {
    p_search: search || null,
  });

  if (error) throw error;
  return (data as number) ?? 0;
}

export async function getEarliestPlayDate() {
  const { data, error } = await getSupabase()
    .from("plays")
    .select("time_played")
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: true })
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) return null;
  return data[0].time_played;
}
