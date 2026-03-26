import type { DiaryEntry, DiaryQueryParams } from "./types";

export function filterEntries(
  entries: DiaryEntry[],
  params: DiaryQueryParams
): DiaryEntry[] {
  let result = entries;

  if (params.minRating !== undefined) {
    const min = params.minRating;
    result = result.filter((e) => e.rating.score >= min);
  }

  if (params.reviewsOnly) {
    result = result.filter((e) => e.reviewHtml !== "");
  }

  if (params.year !== undefined) {
    const year = params.year;
    result = result.filter((e) => e.watchedDate.startsWith(year));
  }

  if (params.count !== undefined) {
    result = result.slice(0, params.count);
  }

  return result;
}
