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

export async function getArtists(offset: number, limit: number) {
  const { data, error } = await getSupabase()
    .from("artists")
    .select("id, name")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getArtistPlays(artistName: string) {
  // First find the artist by name (case-insensitive)
  const { data: artist, error: artistError } = await getSupabase()
    .from("artists")
    .select("id")
    .ilike("name", artistName)
    .single();

  if (artistError) throw artistError;

  // Get all plays for this artist's songs, joining through songs -> plays -> stations
  const { data, error } = await getSupabase()
    .from("plays")
    .select(
      `
      id,
      time_played,
      is_deleted,
      is_likely_not_music,
      songs!inner (
        title,
        artist_id,
        artists!inner ( name )
      ),
      stations!inner ( slug )
    `
    )
    .eq("songs.artist_id", artist.id)
    .eq("is_deleted", false)
    .eq("is_likely_not_music", false)
    .order("time_played", { ascending: false });

  if (error) throw error;

  return data.map((play: any) => ({
    id: play.id,
    artist: (play.songs as any).artists.name,
    title: (play.songs as any).title,
    time_played: play.time_played,
    station: (play.stations as any).slug,
  }));
}
