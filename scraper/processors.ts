import { PlayingEvent } from './types';

const trimWhitespace = (str: string) => str.replace(/\s+/g, ' ').trim();

export const processPlayingEvent = (event: PlayingEvent) => {
  const artist = trimWhitespace(event.artist);
  const title = trimWhitespace(event.title);

  return { ...event, artist, title };
};
