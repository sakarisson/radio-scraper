export const strings = {
  siteName: "Faroese Radio",
  siteDescription:
    "A historical record of songs played on Faroese radio stations",
  homeSubtitle:
    "A historical record of every song played on Faroese radio stations.",
  browseAllArtists: "Browse all artists →",
  recentPlays: "Recent plays",
  artists: "Artists",
  songs: "Songs",
  plays: "Plays",
  searchArtistsPlaceholder: "Search artists...",
  noArtistsFound: "No artists found",
  noArtistsFoundMatching: (query: string) =>
    `No artists found matching "${query}"`,
  allArtists: "← All artists",
  play: "play",
  playsLabel: "plays",
  title: "Title",
  station: "Station",
  timePlayed: "Time played",
  previousPage: "← Previous",
  nextPage: "Next →",
  pageOf: (current: number, total: number) =>
    `Page ${current} of ${total}`,
  notFoundCode: "404",
  notFoundMessage: "This page could not be found.",
  goBackHome: "Go back home",
  navArtists: "Artists",
} as const;
