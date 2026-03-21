const PHONE_NUMBER = /\d{6,}/;
const WEB_DOMAIN = /\.(fo|dk|com|net|org|is)\b/i;
const TLF = /\btlf\b/i;
const STATION_NAMES = /\b(kvf|kvf2|aldan|alduni|kringvarp|rás?\s*2)\b/i;
const DATE_IN_TITLE = /\d{2}\.\d{2}\.\d{2,4}/;
const ELECTION = /\bvalevni\b/i;
const FESTIVAL_PROMO = /\bsummarfestival/i;

export const isLikelyNotMusic = (artist: string, title: string): boolean => {
  if (artist.toLowerCase() === 'artist' && title.toLowerCase() === 'title') return true;
  if (DATE_IN_TITLE.test(title)) return true;
  const combined = `${artist} ${title}`;
  return (
    PHONE_NUMBER.test(combined) ||
    WEB_DOMAIN.test(combined) ||
    TLF.test(combined) ||
    STATION_NAMES.test(combined) ||
    ELECTION.test(combined) ||
    FESTIVAL_PROMO.test(combined)
  );
};
