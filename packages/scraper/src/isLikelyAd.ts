const PHONE_NUMBER = /\d{6,}/;
const WEB_DOMAIN = /\.(fo|dk|com|net|org|is)\b/i;
const TLF = /\btlf\b/i;
const STATION_NAMES = /\b(kvf|kvf2|aldan|alduni|kringvarp|rás?\s*2)\b/i;

export const isLikelyAdByText = (artist: string, title: string): boolean => {
  if (artist.toLowerCase() === 'artist' && title.toLowerCase() === 'title') return true;
  const combined = `${artist} ${title}`;
  return (
    PHONE_NUMBER.test(combined) ||
    WEB_DOMAIN.test(combined) ||
    TLF.test(combined) ||
    STATION_NAMES.test(combined)
  );
};
