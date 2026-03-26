/** Star rating on a 0–5 scale, half-star increments */
export interface Rating {
  /** Numeric score, e.g. 3.5 */
  score: number;
  /** Display text, e.g. "★★★½" */
  text: string;
}

/** Core film data from RSS + optional TMDB enrichment */
export interface Film {
  title: string;
  year: string;
  /** Letterboxd URL for the film page */
  letterboxdUrl: string;
  /** TMDB movie ID extracted from RSS (e.g. "12345") */
  tmdbId: string | null;
  /** Small poster from RSS feed */
  posterSmall: string | null;
  /** High-res poster URL from TMDB (enriched) */
  posterLarge: string | null;
  /** Backdrop image URL from TMDB (enriched) */
  backdrop: string | null;
  /** Genre names from TMDB (enriched) */
  genres: string[];
  /** Runtime in minutes from TMDB (enriched) */
  runtime: number | null;
}

/** A single diary entry */
export interface DiaryEntry {
  film: Film;
  rating: Rating;
  /** Date the film was watched (ISO 8601 string, e.g. "2025-03-20") */
  watchedDate: string;
  /** Date the entry was published to Letterboxd */
  publishedDate: string;
  /** Review text (HTML from RSS, may be empty string if no review) */
  reviewHtml: string;
  /** Whether this is a rewatch */
  isRewatch: boolean;
  /** Whether the review contains spoilers */
  hasSpoilers: boolean;
  /** Whether the user liked/hearted the film on Letterboxd */
  liked: boolean;
  /** Direct Letterboxd URL to this diary entry */
  entryUrl: string;
}

/** Response shape from the Cloudflare Worker proxy */
export interface DiaryResponse {
  entries: DiaryEntry[];
  /** ISO timestamp of when this data was last fetched from Letterboxd */
  lastFetched: string;
  /** Username the feed belongs to */
  username: string;
}

/** Parameters for querying diary entries on the client side */
export interface DiaryQueryParams {
  /** Max number of entries to return */
  count?: number;
  /** Minimum star rating to include (e.g. 3.0) */
  minRating?: number;
  /** Only include entries that have review text */
  reviewsOnly?: boolean;
  /** Filter to a specific year (e.g. "2025") */
  year?: string;
}
