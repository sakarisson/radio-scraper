const PHONE_NUMBER = /\d{6,}/;
const WEB_DOMAIN = /\.(fo|dk|com|net|org|is)\b/i;
const TLF = /\btlf\b/i;
const STATION_NAMES = /\b(alduni|kringvarp|rás?\s*2|sjey)\b/i;
const STATION_NAMES_ARTIST_ONLY = /\b(aldan|kvf|kvf2)\b/i;
const RELIGIOUS_READINGS = /\b(bíbliulestur|dagsins\s+orð)\b/i;
const DATE_IN_TITLE = /\d{2}\.\d{2}\.\d{2,4}/;
const ELECTION = /\bvalevni\b/i;
const FESTIVAL_PROMO = /\bsummarfestival/i;

export const isLikelyNotMusic = (artist: string, title: string): boolean => {
  if (artist.toLowerCase() === 'artist' && title.toLowerCase() === 'title') return true;
  if (DATE_IN_TITLE.test(title)) return true;
  if (STATION_NAMES_ARTIST_ONLY.test(artist)) return true;
  const combined = `${artist} ${title}`;
  return (
    PHONE_NUMBER.test(combined) ||
    WEB_DOMAIN.test(combined) ||
    TLF.test(combined) ||
    STATION_NAMES.test(combined) ||
    ELECTION.test(combined) ||
    FESTIVAL_PROMO.test(combined) ||
    RELIGIOUS_READINGS.test(combined)
  );
};
