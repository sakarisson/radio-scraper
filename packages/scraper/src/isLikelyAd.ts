// \b only knows ASCII letters, so it treats Faroese letters like "ð" and "ø"
// as gaps between words ("Dagsins orð" never matched /orð\b/). These
// boundaries count any Unicode letter or digit as part of a word.
const START = '(?<![\\p{L}\\p{N}_])';
const END = '(?![\\p{L}\\p{N}_])';
const words = (pattern: string) => new RegExp(`${START}(?:${pattern})${END}`, 'iu');

// Phone and account numbers, written together or in groups ("31 50 00")
const PHONE_NUMBER = /\d{6,}|\d{2,}(?: \d{2,}){2,}/;
const WEB_DOMAIN = new RegExp(`\\.(?:fo|dk|com|net|org|is)${END}`, 'iu');
const TLF = words('tlf');
// "Kringvarp" also covers "Kringvarpið", "Kringvarpinum" etc.
const STATION_NAMES = words('alduni|kringvarp\\p{L}*|r[aá]s\\s*2');
const STATION_NAMES_ARTIST_ONLY = words('aldan|kvf2?');
const RELIGIOUS_READINGS = words('bíbliulestur|dagsins\\s+orð');
// SJEY sends the name of a hymn collection as the artist ("Syng mín sál",
// "Syng mín sál b"), so these plays have no real performer.
const HYMN_COLLECTIONS_ARTIST_ONLY = new RegExp(`^syng\\s+mín\\s+sál${END}`, 'iu');
// SJEY talk programmes, sent with the programme as the artist. Matched on
// the whole name so that real artists with similar names aren't caught.
const PROGRAMMES_ARTIST_ONLY =
  /^(?:við\s+vegin|sono|new\s+life\s+without\s+borders|okkara\s+løta\s+til\s+øll|pais\s+fo|iktus|minnist\s+tú\s+ichtus|morgunsending)(?:\s*\(e\))?$/iu;
// "(e)" after a name marks a rerun ("endursending") of a programme
const RERUN_ARTIST = /\(e\)\s*$/i;
// Broadcasts: "Jólasending", "Endursending", "1. sending"
const BROADCAST = /\p{L}+sending|\d+\.\s*sending/iu;
// "21.03.2026" or "2026-03-21"
const DATE_IN_TITLE = /\d{2}\.\d{2}\.\d{2,4}|\d{4}-\d{2}-\d{2}/;
// Also "valevnið", "valevnini" etc.
const ELECTION = words('valevni\\p{L}*');
const FESTIVAL_PROMO = new RegExp(`${START}summarfestival`, 'iu');

export const isLikelyNotMusic = (artist: string, title: string): boolean => {
  if (artist.toLowerCase() === 'artist' && title.toLowerCase() === 'title') return true;
  if (DATE_IN_TITLE.test(title)) return true;
  if (STATION_NAMES_ARTIST_ONLY.test(artist)) return true;
  if (HYMN_COLLECTIONS_ARTIST_ONLY.test(artist)) return true;
  if (PROGRAMMES_ARTIST_ONLY.test(artist)) return true;
  if (RERUN_ARTIST.test(artist)) return true;
  const combined = `${artist} ${title}`;
  return (
    PHONE_NUMBER.test(combined) ||
    WEB_DOMAIN.test(combined) ||
    TLF.test(combined) ||
    STATION_NAMES.test(combined) ||
    ELECTION.test(combined) ||
    FESTIVAL_PROMO.test(combined) ||
    RELIGIOUS_READINGS.test(combined) ||
    BROADCAST.test(combined)
  );
};
