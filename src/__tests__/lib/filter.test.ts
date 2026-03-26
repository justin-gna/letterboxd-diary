import { describe, it, expect } from "vitest";
import { filterEntries } from "../../lib/filter";
import { makeEntry } from "../fixtures";

describe("filterEntries", () => {
  it("returns all entries when no params provided", () => {
    const entries = [makeEntry(), makeEntry()];
    expect(filterEntries(entries, {})).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(filterEntries([], { minRating: 3 })).toEqual([]);
  });

  describe("minRating", () => {
    it("keeps entries at or above the threshold", () => {
      const entries = [
        makeEntry({ rating: { score: 2.0, text: "★★" } }),
        makeEntry({ rating: { score: 3.0, text: "★★★" } }),
        makeEntry({ rating: { score: 4.5, text: "★★★★½" } }),
      ];
      expect(filterEntries(entries, { minRating: 3.0 })).toHaveLength(2);
    });

    it("excludes entries strictly below the threshold", () => {
      const entries = [makeEntry({ rating: { score: 1.5, text: "★½" } })];
      expect(filterEntries(entries, { minRating: 2.0 })).toHaveLength(0);
    });

    it("includes entries exactly at the threshold", () => {
      const entries = [makeEntry({ rating: { score: 3.5, text: "★★★½" } })];
      expect(filterEntries(entries, { minRating: 3.5 })).toHaveLength(1);
    });
  });

  describe("reviewsOnly", () => {
    it("keeps only entries with non-empty reviewHtml", () => {
      const entries = [
        makeEntry({ reviewHtml: "" }),
        makeEntry({ reviewHtml: "<p>Great film</p>" }),
        makeEntry({ reviewHtml: "" }),
      ];
      expect(filterEntries(entries, { reviewsOnly: true })).toHaveLength(1);
    });

    it("does not filter when reviewsOnly is false", () => {
      const entries = [
        makeEntry({ reviewHtml: "" }),
        makeEntry({ reviewHtml: "<p>Review</p>" }),
      ];
      expect(filterEntries(entries, { reviewsOnly: false })).toHaveLength(2);
    });
  });

  describe("year", () => {
    it("keeps entries matching the given year", () => {
      const entries = [
        makeEntry({ watchedDate: "2023-12-01" }),
        makeEntry({ watchedDate: "2024-01-15" }),
        makeEntry({ watchedDate: "2024-06-30" }),
      ];
      expect(filterEntries(entries, { year: "2024" })).toHaveLength(2);
    });

    it("returns empty when no entries match the year", () => {
      const entries = [makeEntry({ watchedDate: "2023-05-10" })];
      expect(filterEntries(entries, { year: "2025" })).toHaveLength(0);
    });
  });

  describe("count", () => {
    it("limits results to count", () => {
      const entries = [makeEntry(), makeEntry(), makeEntry(), makeEntry()];
      expect(filterEntries(entries, { count: 2 })).toHaveLength(2);
    });

    it("returns all entries when count exceeds length", () => {
      const entries = [makeEntry(), makeEntry()];
      expect(filterEntries(entries, { count: 10 })).toHaveLength(2);
    });

    it("preserves entry order after slicing", () => {
      const a = makeEntry({ film: { ...makeEntry().film, title: "A" } });
      const b = makeEntry({ film: { ...makeEntry().film, title: "B" } });
      const c = makeEntry({ film: { ...makeEntry().film, title: "C" } });
      const result = filterEntries([a, b, c], { count: 2 });
      expect(result[0].film.title).toBe("A");
      expect(result[1].film.title).toBe("B");
    });
  });

  describe("combined filters", () => {
    it("applies all active filters then count", () => {
      const entries = [
        makeEntry({ rating: { score: 4.5, text: "★★★★½" }, reviewHtml: "<p>Great</p>", watchedDate: "2024-03-01" }),
        makeEntry({ rating: { score: 4.5, text: "★★★★½" }, reviewHtml: "<p>Also great</p>", watchedDate: "2024-04-01" }),
        makeEntry({ rating: { score: 2.0, text: "★★" }, reviewHtml: "<p>Meh</p>", watchedDate: "2024-05-01" }),
        makeEntry({ rating: { score: 4.5, text: "★★★★½" }, reviewHtml: "", watchedDate: "2024-06-01" }),
      ];
      const result = filterEntries(entries, {
        minRating: 4.0,
        reviewsOnly: true,
        year: "2024",
        count: 1,
      });
      expect(result).toHaveLength(1);
      expect(result[0].rating.score).toBe(4.5);
      expect(result[0].reviewHtml).not.toBe("");
    });
  });
});
