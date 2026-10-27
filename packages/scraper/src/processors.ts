import { PlayingEvent } from './types';

// Stations sometimes send the same name with different spacing ("Marius DC,
// Swangah" with two spaces) or accents in a different Unicode form. Clean
// them up so each name is stored only once. Keep in step with clean_name()
// in the clean_whitespace migration.
export const cleanName = (str: string) =>
  str.normalize('NFC').replace(/\s+/g, ' ').trim();

export const processPlayingEvent = (event: PlayingEvent) => {
  if (!event) return null;

  const artist = cleanName(event.artist);
  const title = cleanName(event.title);

  return { ...event, artist, title };
};
