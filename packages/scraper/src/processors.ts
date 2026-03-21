import { PlayingEvent } from './types';

const trimWhitespace = (str: string) => str.trim();

export const processPlayingEvent = (event: PlayingEvent) => {
  if (!event) return null;

  const artist = trimWhitespace(event.artist);
  const title = trimWhitespace(event.title);

  return { ...event, artist, title };
};
