import type { DiaryEntry } from "../lib/types";

export function makeEntry(overrides?: Partial<DiaryEntry>): DiaryEntry {
  return {
    film: {
      title: "Mulholland Drive",
      year: "2001",
      letterboxdUrl: "https://letterboxd.com/film/mulholland-drive",
      tmdbId: "1018",
      posterSmall: "https://example.com/poster-small.jpg",
      posterLarge: "https://image.tmdb.org/t/p/w500/poster.jpg",
      backdrop: null,
      genres: ["Drama", "Mystery"],
      runtime: 147,
    },
    rating: { score: 5.0, text: "★★★★★" },
    watchedDate: "2024-03-15",
    publishedDate: "2024-03-16",
    reviewHtml: "",
    isRewatch: false,
    hasSpoilers: false,
    liked: false,
    entryUrl: "https://letterboxd.com/user/film/mulholland-drive/1",
    ...overrides,
  };
}
