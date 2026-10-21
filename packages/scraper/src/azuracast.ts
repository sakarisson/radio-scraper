import { z } from 'zod';
import { PlayingEvent } from './types';

// Public AzuraCast server hosting Norðlýsið, FM98,7 and a few others.
const AZURACAST_BASE_URL = 'https://liveradio.stream.fo';

// Studio software on these stations sometimes puts a playlist/show name in the
// artist field and "Artist - Title" in the title field, e.g.
// { artist: 'PoppList3', title: 'Enekk - Eru tit til' }.
const PLAYLIST_ARTISTS = /^(popplist\d*|blanda)$/i;

// Untagged files show up as "Track 6" and similar.
const PLACEHOLDER_TITLE = /^track\s*\d+$/i;

const schema = z.object({
  live: z.object({
    is_live: z.boolean(),
    streamer_name: z.string().nullish(),
  }),
  now_playing: z
    .object({
      played_at: z.number(),
      streamer: z.string().nullish(),
      playlist: z.string().nullish(),
      song: z.object({
        artist: z.string().nullish(),
        title: z.string().nullish(),
      }),
    })
    .nullish(),
});

// Metadata arrives with non-ASCII characters escaped as "%uXXXX" (e.g.
// "Fr%u00e6ndur"). "%ufffd" means the character was already lost upstream and
// decodes to U+FFFD, which we keep so the raw intent stays visible.
export const decodePercentU = (str: string) =>
  str.replace(/%u([0-9a-f]{4})/gi, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );

// Some tags carry junk after a NUL byte, e.g. "I Am\u0000n" or
// "Magni Christiansen\u0000t". Everything from the NUL on is garbage.
const truncateAtNul = (str: string) => str.split('\u0000')[0];

// eslint-disable-next-line no-control-regex
const stripControlChars = (str: string) => str.replace(/[\u0000-\u001f\u007f]/g, '');

// Latin-1/UTF-8 text misread as UTF-16 turns into CJK/Hangul characters, e.g.
// "Gospel Tónar 2" → "潇灳汥吠돃慮⁲2". These fields are unusable.
const MISDECODED_UTF16 = /[\u3400-\u9fff\uac00-\ud7af]/;

const clean = (str: string | null | undefined) =>
  stripControlChars(truncateAtNul(decodePercentU(str ?? '')))
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeAzuraCastSong = (
  rawArtist: string | null | undefined,
  rawTitle: string | null | undefined
): { artist: string; title: string } | null => {
  let artist = clean(rawArtist);
  let title = clean(rawTitle);

  if (MISDECODED_UTF16.test(artist) || MISDECODED_UTF16.test(title)) return null;

  if (PLAYLIST_ARTISTS.test(artist)) {
    const separator = title.indexOf(' - ');
    if (separator === -1) return null;
    artist = title.slice(0, separator).trim();
    title = title.slice(separator + 3).trim();
  }

  if (!artist || !title) return null;
  if (PLACEHOLDER_TITLE.test(title)) return null;

  return { artist, title };
};

export const fetchAzuraCast = async (shortcode: string): Promise<PlayingEvent> => {
  const url = `${AZURACAST_BASE_URL}/api/nowplaying/${encodeURIComponent(shortcode)}`;
  const data = await fetch(url).then((response) => {
    if (!response.ok) throw new Error(`AzuraCast ${shortcode}: HTTP ${response.status}`);
    return response.json();
  });

  const parsed = schema.parse(data);
  const nowPlaying = parsed.now_playing;
  if (!nowPlaying) return null;

  const song = normalizeAzuraCastSong(nowPlaying.song.artist, nowPlaying.song.title);
  if (!song) return null;

  // Keep only the relevant part of the response; song_history and station
  // details are repeated on every poll.
  const rawData = { live: data.live, now_playing: data.now_playing };

  return { ...song, rawData };
};
