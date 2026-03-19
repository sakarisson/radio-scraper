import { createClient } from '@supabase/supabase-js';
import { isLikelyAdByText } from './isLikelyAd';

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
    .eq('name', artistName)
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
    .eq('title', songName)
    .eq('artist_id', artistId)
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

const getOrCreateStationId = async (stationSlug: string): Promise<number> => {
  const { data: existing } = await supabase
    .from('stations')
    .select('id')
    .eq('slug', stationSlug)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('stations')
    .insert({ slug: stationSlug })
    .select('id')
    .single();

  if (error || !created) throw error ?? new Error('Failed to create station');
  return created.id;
};

export const getMostRecentPlay = async (stationSlug: string) => {
  const { data: station } = await supabase
    .from('stations')
    .select('id')
    .eq('slug', stationSlug)
    .single();

  if (!station) return null;

  const { data: play } = await supabase
    .from('plays')
    .select('id, song_id')
    .eq('station_id', station.id)
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (!play) return null;

  const { data: song } = await supabase
    .from('songs')
    .select('title, artist_id')
    .eq('id', play.song_id)
    .single();

  if (!song) return null;

  const { data: artist } = await supabase
    .from('artists')
    .select('name')
    .eq('id', song.artist_id)
    .single();

  return {
    id: play.id,
    title: song.title,
    artist: artist?.name ?? '',
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

  const likelyAd = isLikelyAdByText(artistName, songName);

  const { data, error } = await supabase
    .from('plays')
    .insert({ song_id: songId, station_id: stationId, is_likely_ad: likelyAd })
    .select('id, time_played')
    .single();

  if (error || !data) throw error ?? new Error('Failed to insert play');

  // Retroactively flag the previous play on this station if it was ≤ 60s ago (RAS2 only)
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
    await supabase.from('plays').update({ is_likely_ad: true }).eq('id', prev.id);
  }
};

// No-op: schema is managed in Supabase dashboard via supabase/schema.sql
export const setupDatabase = () => {};
