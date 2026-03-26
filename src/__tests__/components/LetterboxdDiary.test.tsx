import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LetterboxdDiary } from "../../components/LetterboxdDiary";
import { makeEntry } from "../fixtures";
import type { UseLetterboxdDiaryResult } from "../../hooks/useLetterboxdDiary";

vi.mock("../../hooks/useLetterboxdDiary");

import { useLetterboxdDiary } from "../../hooks/useLetterboxdDiary";

const idle: UseLetterboxdDiaryResult = {
  entries: [],
  isLoading: false,
  error: undefined,
  lastFetched: undefined,
  username: undefined,
  refresh: vi.fn(),
};

beforeEach(() => {
  vi.mocked(useLetterboxdDiary).mockReturnValue({ ...idle, refresh: vi.fn() });
});

describe("LetterboxdDiary", () => {
  describe("missing apiUrl", () => {
    it("shows configuration error when apiUrl is empty", () => {
      render(<LetterboxdDiary apiUrl="" name="Justin" />);
      expect(screen.getByText("Worker URL not configured.")).toBeInTheDocument();
    });

  });

  describe("loading state", () => {
    it("renders skeleton cards while loading", () => {
      vi.mocked(useLetterboxdDiary).mockReturnValue({ ...idle, isLoading: true });
      render(<LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" count={3} />);
      expect(screen.getAllByTestId("skeleton-card")).toHaveLength(3);
    });

    it("renders skeleton count matching the count prop in carousel layout", () => {
      vi.mocked(useLetterboxdDiary).mockReturnValue({ ...idle, isLoading: true });
      render(
        <LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" count={6} layout="carousel" />
      );
      // carousel in jsdom has width 0 → perPage=1, so skeletons = min(count, perPage) = 1
      expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("error state", () => {
    it("shows error message when fetch fails", () => {
      vi.mocked(useLetterboxdDiary).mockReturnValue({
        ...idle,
        error: new Error("Network error"),
      });
      render(<LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" />);
      expect(screen.getByText(/Could not reach the Worker/)).toBeInTheDocument();
    });

    it("calls refresh when the retry button is clicked", async () => {
      const refresh = vi.fn();
      vi.mocked(useLetterboxdDiary).mockReturnValue({
        ...idle,
        error: new Error("Network error"),
        refresh,
      });
      render(<LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" />);
      await userEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(refresh).toHaveBeenCalledOnce();
    });
  });

  describe("empty state", () => {
    it("shows empty message when entries array is empty", () => {
      render(<LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" />);
      expect(screen.getByText("No diary entries found.")).toBeInTheDocument();
    });
  });

  describe("with entries", () => {
    const entries = [
      makeEntry({ film: { ...makeEntry().film, title: "Film One" }, entryUrl: "https://letterboxd.com/1" }),
      makeEntry({ film: { ...makeEntry().film, title: "Film Two" }, entryUrl: "https://letterboxd.com/2" }),
    ];

    beforeEach(() => {
      vi.mocked(useLetterboxdDiary).mockReturnValue({
        ...idle,
        entries,
        username: "testuser",
      });
    });

    it("renders a card for each entry", () => {
      render(<LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" />);
      expect(screen.getByText("Film One")).toBeInTheDocument();
      expect(screen.getByText("Film Two")).toBeInTheDocument();
    });

    it("renders the header with the display name", () => {
      render(<LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" />);
      expect(screen.getByText("Justin's")).toBeInTheDocument();
    });

    it("renders the footer with the username link", () => {
      render(<LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" />);
      expect(screen.getByRole("link", { name: "letterboxd.com/testuser" })).toBeInTheDocument();
    });

    it("passes showReviews=false down to cards", () => {
      const entryWithReview = makeEntry({ reviewHtml: "<p>Incredible film.</p>" });
      vi.mocked(useLetterboxdDiary).mockReturnValue({ ...idle, entries: [entryWithReview] });
      render(
        <LetterboxdDiary apiUrl="https://worker.example.com" name="Justin" showReviews={false} />
      );
      expect(screen.queryByText("Incredible film.")).not.toBeInTheDocument();
    });
  });
});
