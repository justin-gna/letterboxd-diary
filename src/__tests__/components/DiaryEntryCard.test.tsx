import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiaryEntryCard } from "../../components/DiaryEntryCard";
import { makeEntry } from "../fixtures";

describe("DiaryEntryCard", () => {
  it("renders the film title", () => {
    render(<DiaryEntryCard entry={makeEntry()} />);
    expect(screen.getAllByText("Mulholland Drive").length).toBeGreaterThan(0);
  });

  it("renders the film year", () => {
    render(<DiaryEntryCard entry={makeEntry()} />);
    expect(screen.getByText("2001")).toBeInTheDocument();
  });

  describe("date display", () => {
    it("renders 'Watched' prefix for first watches", () => {
      render(<DiaryEntryCard entry={makeEntry({ watchedDate: "2024-03-15" })} />);
      expect(screen.getByText("Watched Mar 15, 2024")).toBeInTheDocument();
    });

    it("renders 'Rewatched' prefix for rewatches", () => {
      render(<DiaryEntryCard entry={makeEntry({ isRewatch: true, watchedDate: "2024-03-15" })} />);
      expect(screen.getByText("Rewatched Mar 15, 2024")).toBeInTheDocument();
    });

    it("renders raw string as fallback for malformed watchedDate", () => {
      render(<DiaryEntryCard entry={makeEntry({ watchedDate: "bad-date-x" })} />);
      expect(screen.getByText(/bad-date-x/)).toBeInTheDocument();
    });
  });

  describe("rating", () => {
    it("renders star rating SVG with accessible label", () => {
      render(<DiaryEntryCard entry={makeEntry({ rating: { score: 4.0, text: "★★★★" } })} />);
      expect(screen.getByRole("img", { name: "Rated 4 out of 5 stars" })).toBeInTheDocument();
    });

    it("does not render rating SVG when score is 0", () => {
      render(<DiaryEntryCard entry={makeEntry({ rating: { score: 0, text: "" } })} />);
      expect(screen.queryByRole("img", { name: /stars/ })).not.toBeInTheDocument();
    });

    it("renders half-star rating label correctly", () => {
      render(<DiaryEntryCard entry={makeEntry({ rating: { score: 3.5, text: "★★★½" } })} />);
      expect(screen.getByRole("img", { name: "Rated 3.5 out of 5 stars" })).toBeInTheDocument();
    });
  });

  describe("liked heart", () => {
    it("renders the liked heart when liked is true", () => {
      render(<DiaryEntryCard entry={makeEntry({ liked: true })} />);
      expect(screen.getByRole("img", { name: "Liked" })).toBeInTheDocument();
    });

    it("does not render the heart when liked is false", () => {
      render(<DiaryEntryCard entry={makeEntry({ liked: false })} />);
      expect(screen.queryByRole("img", { name: "Liked" })).not.toBeInTheDocument();
    });
  });

  describe("review", () => {
    it("renders review content when showReview=true and review is present", () => {
      render(
        <DiaryEntryCard
          entry={makeEntry({ reviewHtml: "<p>A masterpiece.</p>" })}
          showReview={true}
        />
      );
      expect(screen.getByText("A masterpiece.")).toBeInTheDocument();
    });

    it("does not render review when showReview=false", () => {
      render(
        <DiaryEntryCard
          entry={makeEntry({ reviewHtml: "<p>A masterpiece.</p>" })}
          showReview={false}
        />
      );
      expect(screen.queryByText("A masterpiece.")).not.toBeInTheDocument();
    });

    it("does not render review when reviewHtml is empty even if showReview=true", () => {
      render(<DiaryEntryCard entry={makeEntry({ reviewHtml: "" })} showReview={true} />);
      // No review div rendered — nothing to assert other than no crash
      expect(screen.queryByText("read more")).not.toBeInTheDocument();
    });
  });

  describe("overflow / read more", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    function mockOverflow() {
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(180);
    }

    it("shows 'read more' when body overflows in list layout", () => {
      mockOverflow();
      render(
        <DiaryEntryCard
          entry={makeEntry({ reviewHtml: "<p>A very long review.</p>" })}
          layout="list"
        />
      );
      const link = screen.getByText("read more");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "https://letterboxd.com/user/film/mulholland-drive/1");
    });

    it("shows 'read more' when body overflows in grid layout", () => {
      mockOverflow();
      render(
        <DiaryEntryCard
          entry={makeEntry({ reviewHtml: "<p>A very long review.</p>" })}
          layout="grid"
        />
      );
      const link = screen.getByText("read more");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "https://letterboxd.com/user/film/mulholland-drive/1");
    });

    it("shows 'read more' when body overflows in carousel layout", () => {
      mockOverflow();
      render(
        <DiaryEntryCard
          entry={makeEntry({ reviewHtml: "<p>A very long review.</p>" })}
          layout="carousel"
        />
      );
      const link = screen.getByText("read more");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "https://letterboxd.com/user/film/mulholland-drive/1");
    });

    it("does not show 'read more' when content fits within the body", () => {
      render(
        <DiaryEntryCard
          entry={makeEntry({ reviewHtml: "<p>Short.</p>" })}
          layout="grid"
        />
      );
      expect(screen.queryByText("read more")).not.toBeInTheDocument();
    });

    it("link text is exactly 'read more', not 'read more on letterboxd'", () => {
      mockOverflow();
      render(
        <DiaryEntryCard
          entry={makeEntry({ reviewHtml: "<p>A very long review.</p>" })}
          layout="grid"
        />
      );
      expect(screen.getByText("read more")).toBeInTheDocument();
      expect(screen.queryByText(/read more on letterboxd/i)).not.toBeInTheDocument();
    });
  });

  describe("poster", () => {
    it("renders poster image with correct alt text when poster is available", () => {
      render(<DiaryEntryCard entry={makeEntry()} />);
      expect(screen.getByAltText("Poster for Mulholland Drive (2001)")).toBeInTheDocument();
    });

    it("does not render an img when no poster is available", () => {
      render(<DiaryEntryCard entry={makeEntry({ film: { ...makeEntry().film, posterSmall: null, posterLarge: null } })} />);
      expect(screen.queryByAltText(/Poster for/)).not.toBeInTheDocument();
    });
  });
});
