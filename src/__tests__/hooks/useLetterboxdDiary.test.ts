import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUseSWR = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  }))
);

vi.mock("swr", () => ({ default: mockUseSWR }));

import { useLetterboxdDiary } from "../../hooks/useLetterboxdDiary";

const BASE_URL = "https://worker.example.com/api";

describe("useLetterboxdDiary", () => {
  beforeEach(() => {
    mockUseSWR.mockClear();
  });

  describe("buildUrl", () => {
    it("passes null to SWR when apiUrl is empty string", () => {
      renderHook(() => useLetterboxdDiary({ apiUrl: "" }));
      expect(mockUseSWR).toHaveBeenLastCalledWith(null, expect.any(Function), expect.any(Object));
    });

    it("passes null to SWR when apiUrl is not a valid URL", () => {
      renderHook(() => useLetterboxdDiary({ apiUrl: "not-a-valid-url" }));
      expect(mockUseSWR).toHaveBeenLastCalledWith(null, expect.any(Function), expect.any(Object));
    });

    it("passes base URL to SWR when no query params are set", () => {
      renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL }));
      expect(mockUseSWR).toHaveBeenLastCalledWith(BASE_URL, expect.any(Function), expect.any(Object));
    });

    it("appends count param", () => {
      renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL, count: 5 }));
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        `${BASE_URL}?count=5`,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("appends minRating param", () => {
      renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL, minRating: 3.5 }));
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        `${BASE_URL}?minRating=3.5`,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("appends reviewsOnly param", () => {
      renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL, reviewsOnly: true }));
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        `${BASE_URL}?reviewsOnly=true`,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("appends year param", () => {
      renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL, year: "2024" }));
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        `${BASE_URL}?year=2024`,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("appends all params when all are provided", () => {
      renderHook(() =>
        useLetterboxdDiary({ apiUrl: BASE_URL, count: 3, minRating: 4, year: "2024", reviewsOnly: true })
      );
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        expect.stringContaining("count=3"),
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        expect.stringContaining("minRating=4"),
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        expect.stringContaining("year=2024"),
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockUseSWR).toHaveBeenLastCalledWith(
        expect.stringContaining("reviewsOnly=true"),
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe("return value", () => {
    it("returns empty entries and no error when SWR has no data", () => {
      const { result } = renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL }));
      expect(result.current.entries).toEqual([]);
      expect(result.current.error).toBeUndefined();
      expect(result.current.lastFetched).toBeUndefined();
      expect(result.current.username).toBeUndefined();
    });

    it("exposes a refresh function", () => {
      const { result } = renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL }));
      expect(result.current.refresh).toBeInstanceOf(Function);
    });

    it("calls SWR mutate when refresh is invoked", () => {
      const mutate = vi.fn();
      mockUseSWR.mockReturnValueOnce({ data: undefined, error: undefined, isLoading: false, mutate });
      const { result } = renderHook(() => useLetterboxdDiary({ apiUrl: BASE_URL }));
      result.current.refresh();
      expect(mutate).toHaveBeenCalledOnce();
    });
  });
});
