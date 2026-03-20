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
