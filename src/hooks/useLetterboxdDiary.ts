import useSWR from "swr";
import type { DiaryQueryParams, DiaryResponse } from "../lib/types";

export interface UseLetterboxdDiaryOptions extends DiaryQueryParams {
  apiUrl: string;
}

export interface UseLetterboxdDiaryResult {
  entries: DiaryResponse["entries"];
  isLoading: boolean;
  error: Error | undefined;
  lastFetched: string | undefined;
  username: string | undefined;
  refresh: () => void;
}

async function fetcher(url: string): Promise<DiaryResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<DiaryResponse>;
}

function buildUrl(options: UseLetterboxdDiaryOptions): string | null {
  const { apiUrl, count, minRating, reviewsOnly, year } = options;
  if (!apiUrl) return null;
  let url: URL;
  try {
    url = new URL(apiUrl);
  } catch {
    return null;
  }
  if (count !== undefined) url.searchParams.set("count", String(count));
  if (minRating !== undefined) url.searchParams.set("minRating", String(minRating));
  if (reviewsOnly !== undefined) url.searchParams.set("reviewsOnly", String(reviewsOnly));
  if (year !== undefined) url.searchParams.set("year", year);
  return url.toString();
}

export function useLetterboxdDiary(
  options: UseLetterboxdDiaryOptions
): UseLetterboxdDiaryResult {
  const url = buildUrl(options);

  const { data, error, isLoading, mutate } = useSWR<DiaryResponse>(url, fetcher, {
    refreshInterval: 3_600_000,
    revalidateOnFocus: true,
    dedupingInterval: 60_000,
  });

  return {
    entries: data?.entries ?? [],
    isLoading,
    error: error as Error | undefined,
    lastFetched: data?.lastFetched,
    username: data?.username,
    refresh: () => { void mutate(); },
  };
}
