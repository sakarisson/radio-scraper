import { z } from 'zod';
import { PlayingEvent } from './types';

// FM98,7 (Klaksvík) on the public AzuraCast server at liveradio.stream.fo.
// Its tags are a mix of old 30-character ID3v1 fields and newer tags, so the
// cleanup here is more aggressive than for other stations.
const NOW_PLAYING_URL = 'https://liveradio.stream.fo/api/nowplaying/fm98,7';

// Untagged files show up as "Track 6" and similar.
const PLACEHOLDER_TITLE = /^track\s*\d+$/i;

// Artist fields that are just a track number, e.g. "4" or "(4)".
const NUMERIC_ARTIST = /^[\d\s().,-]+$/;

const schema = z.object({
  now_playing: z
    .object({
      song: z.object({
        artist: z.string().nullish(),
        title: z.string().nullish(),
      }),
    })
    .nullish(),
});

// Metadata arrives with non-ASCII characters escaped as "%uXXXX" (e.g.
// "Fr%u00e6ndur"). "%ufffd" means the character was already lost upstream and
// decodes to U+FFFD, which we keep.
const decodePercentU = (str: string) =>
  str.replace(/%u([0-9a-f]{4})/gi, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );

// Some tags carry junk after a NUL byte, e.g. "Magni Christiansen\u0000t".
const truncateAtNul = (str: string) => str.split('\u0000')[0];

// eslint-disable-next-line no-control-regex
const stripControlChars = (str: string) => str.replace(/[\u0000-\u001f\u007f]/g, '');

// Latin-1/UTF-8 text misread as UTF-16 turns into CJK/Hangul characters, e.g.
// "Gospel Tónar 2" → "潇灳汥吠돃慮⁲2". These fields are unusable.
const MISDECODED_UTF16 = /[㐀-鿿가-힯]/;

const clean = (str: string | null | undefined) =>
  stripControlChars(truncateAtNul(decodePercentU(str ?? '')))
    .replace(/\s+/g, ' ')
    .trim();

const cleanTitle = (input: string) => {
  let title = input;

  // Two tag values joined by "; ". The second is usually the truncated,
  // garbled ID3v1 copy: "Ein hvíla trygg; Ein hvÃ­la trygg".
  const [first] = title.split('; ');
  if (first.trim()) title = first.trim();

  // "Title / (Album) / Year" or "Title / Album / Year / Genre: Pop". Only
  // strip when the last part looks like a year (or there's a genre), since
  // real titles can contain " / ".
  const parts = title.split(' / ');
  if (
    parts.length > 1 &&
    (/\(?\d{4}/.test(parts[parts.length - 1]) ||
      title.includes('Genre:') ||
      parts[1].startsWith('('))
  ) {
    title = parts[0];
  }

  return (
    title
      // Leading track number: "09 - Gud gev mær føtur", or a stray "- ".
      .replace(/^\d{2} - /, '')
      .replace(/^- /, '')
      // Album name cut off by the 30-character limit: "... - (Kom".
      .replace(/ - \([^)]*$/, '')
      // Leftover trailing slash: "Brotin / Brotin / 2000/".
      .replace(/\s*\/\s*$/, '')
      .trim()
  );
};

export const normalizeFm987Song = (
  rawArtist: string | null | undefined,
  rawTitle: string | null | undefined
): { artist: string; title: string } | null => {
  const artist = clean(rawArtist);
  const rawCleanTitle = clean(rawTitle);

  if (MISDECODED_UTF16.test(artist) || MISDECODED_UTF16.test(rawCleanTitle)) return null;
  if (!artist || NUMERIC_ARTIST.test(artist)) return null;
  if (PLACEHOLDER_TITLE.test(rawCleanTitle)) return null;

  const title = cleanTitle(rawCleanTitle);
  if (!title) return null;

  return { artist, title };
};

export const fetchFm987 = async (): Promise<PlayingEvent> => {
  const data = await fetch(NOW_PLAYING_URL).then((response) => {
    if (!response.ok) throw new Error(`fm987: HTTP ${response.status}`);
    return response.json();
  });

  const nowPlaying = schema.parse(data).now_playing;
  if (!nowPlaying) return null;

  const song = normalizeFm987Song(nowPlaying.song.artist, nowPlaying.song.title);
  if (!song) return null;

  // Keep the untouched AzuraCast fields so names can be fixed up later.
  // song_history and station details are repeated on every poll, so skip them.
  const rawData = { live: data.live, now_playing: data.now_playing };

  return { ...song, rawData };
};
