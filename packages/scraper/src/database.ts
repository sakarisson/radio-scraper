import { createClient } from '@supabase/supabase-js';
import { isLikelyNotMusic } from './isLikelyAd';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const getOrCreateArtistId = async (artistName: string): Promise<number> => {
  const { data: existing } = await supabase
    .from('artists')
    .select('id')
    .ilike('name', artistName)
    .limit(1)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('artists')
    .insert({ name: artistName })
    .select('id')
    .single();

  if (error || !created) throw error ?? new Error('Failed to create artist');
  return created.id;
};

const getOrCreateSongId = async ({
  songName,
  artistId,
}: {
  songName: string;
  artistId: number;
}): Promise<number> => {
  const { data: existing } = await supabase
    .from('songs')
    .select('id')
    .ilike('title', songName)
    .eq('artist_id', artistId)
    .limit(1)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('songs')
    .insert({ title: songName, artist_id: artistId })
    .select('id')
    .single();

  if (error || !created) throw error ?? new Error('Failed to create song');
  return created.id;
};

// Stations are never renamed or removed, so their ids can be remembered for
// the life of the process instead of looked up on every scrape.
const stationIds = new Map<string, number>();

const findStationId = async (stationSlug: string): Promise<number | null> => {
  const cached = stationIds.get(stationSlug);
  if (cached !== undefined) return cached;

  const { data: existing } = await supabase
    .from('stations')
    .select('id')
    .eq('slug', stationSlug)
    .single();

  if (!existing) return null;
  stationIds.set(stationSlug, existing.id);
  return existing.id;
};

const getOrCreateStationId = async (stationSlug: string): Promise<number> => {
  const existing = await findStationId(stationSlug);
  if (existing !== null) return existing;

  const { data: created, error } = await supabase
    .from('stations')
    .insert({ slug: stationSlug })
    .select('id')
    .single();

  if (error || !created) throw error ?? new Error('Failed to create station');
  stationIds.set(stationSlug, created.id);
  return created.id;
};

export const getMostRecentPlay = async (stationSlug: string) => {
  const stationId = await findStationId(stationSlug);
  if (stationId === null) return null;

  const { data: play } = await supabase
    .from('plays')
    .select('id, songs!inner ( title, artists!inner ( name ) )')
    .eq('station_id', stationId)
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (!play) return null;

  const song = play.songs as unknown as {
    title: string;
    artists: { name: string };
  };

  return {
    id: play.id,
    title: song.title,
    artist: song.artists.name,
    station_slug: stationSlug,
  };
};

type InsertRawData = {
  playId: number;
  rawData: unknown;
};

export const insertRawData = async ({ playId, rawData }: InsertRawData) => {
  const { error } = await supabase
    .from('raw_play_data')
    .insert({ play_id: playId, raw_data: rawData });

  if (error) throw error;
};

type CreatePlay = {
  songName: string;
  artistName: string;
  stationSlug: string;
};

export const insertPlay = async ({
  songName,
  artistName,
  stationSlug,
}: CreatePlay): Promise<number> => {
  const artistId = await getOrCreateArtistId(artistName);
  const songId = await getOrCreateSongId({ songName, artistId });
  const stationId = await getOrCreateStationId(stationSlug);

  const likelyNotMusic = isLikelyNotMusic(artistName, songName);

  const { data, error } = await supabase
    .from('plays')
    .insert({ song_id: songId, station_id: stationId, is_likely_not_music: likelyNotMusic })
    .select('id, time_played')
    .single();

  if (error || !data) throw error ?? new Error('Failed to insert play');

  // Retroactively flag plays on this station by duration heuristic (RAS2 only)
  if (stationSlug === 'ras2') {
    await flagPreviousPlayIfShort({ stationId, currentTimePlayed: data.time_played, currentPlayId: data.id });
  }

  return data.id;
};

const flagPreviousPlayIfShort = async ({
  stationId,
  currentTimePlayed,
  currentPlayId,
}: {
  stationId: number;
  currentTimePlayed: string;
  currentPlayId: number;
}): Promise<void> => {
  const { data: prev } = await supabase
    .from('plays')
    .select('id, time_played')
    .eq('station_id', stationId)
    .neq('id', currentPlayId)
    .order('time_played', { ascending: false })
    .limit(1)
    .single();

  if (!prev) return;

  const gapSeconds = (new Date(currentTimePlayed).getTime() - new Date(prev.time_played).getTime()) / 1000;

  if (gapSeconds <= 90) {
    // Previous play lasted ≤90s — likely not a song
    await supabase.from('plays').update({ is_likely_not_music: true }).eq('id', prev.id);
  } else if (gapSeconds >= 900) {
    // Previous play lasted ≥15 min — likely a programme, not a song
    await supabase.from('plays').update({ is_likely_not_music: true }).eq('id', prev.id);
  }
};

// No-op: schema is managed in Supabase dashboard via supabase/schema.sql
export const setupDatabase = () => {};
