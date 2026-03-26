import { useRef, useEffect, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import type { DiaryEntry } from "../lib/types";
import styles from "./DiaryEntryCard.module.css";

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  showReview?: boolean;
  layout?: "grid" | "list" | "carousel";
}

const STAR_PATH =
  "M7.89 1.2c-.34-.95-1.47-.92-1.78 0L4.97 5h-3.9C-.05 5-.39 6.15.53 6.85L3.63 9l-1.18 4.11c-.35 1.13.52 1.8 1.44 1.1L7 11.83l3.11 2.38c.92.7 1.79.03 1.44-1.1L10.37 9l3.1-2.15c.92-.7.58-1.85-.54-1.85H9.08z";

const HALF_PATH =
  "M.25 14.25h1.5L12.25.75h-1.5zm1.5-6.75H3.5V.75H2.04L.25 1.95v1.48l1.5-.93zm5.91 6.75H13v-1.5h-2.5l1.11-.87c.8-.77 1.22-1.5 1.22-2.4 0-1.21-.72-2.07-2.34-2.07-1.6 0-2.6.87-2.68 2.49h1.62c.1-.82.44-1.16.99-1.16.53 0 .8.3.8.82 0 .59-.44 1.17-1.13 1.88L7.66 14z";

const HEART_PATH =
  "M10.52.5C8.73.5 7 2.42 7 2.42S5.27.5 3.48.5C1.7.5 0 1.3 0 3.66 0 5.33 1.75 6.8 1.75 6.8L7 11.5l5.25-4.7S14 5.33 14 3.66C14 1.3 12.3.5 10.52.5";

function RatingStars({ score }: { score: number }) {
  const wholeStars = Math.floor(score);
  const hasHalf = score % 1 !== 0;
  const svgWidth = Math.ceil(score) * 16;

  return (
    <svg
      width={svgWidth}
      height="15"
      viewBox={`0 0 ${svgWidth} 15`}
      style={{ height: "0.84em", width: "auto", verticalAlign: "middle" }}
      role="img"
      aria-label={`Rated ${score} out of 5 stars`}
    >
      {Array.from({ length: wholeStars }, (_, i) => (
        <path key={i} transform={`translate(${i * 16}, 0)`} fillRule="evenodd" fill="#00e054" d={STAR_PATH} />
      ))}
      {hasHalf && (
        <path transform={`translate(${wholeStars * 16}, 0)`} fill="#00e054" d={HALF_PATH} />
      )}
    </svg>
  );
}

function LikedHeart() {
  return (
    <svg
      width="14"
      height="12"
      viewBox="0 0 14 12"
      style={{ height: "0.84em", width: "auto", verticalAlign: "middle" }}
      role="img"
      aria-label="Liked"
    >
      <path fillRule="evenodd" fill="#ff8000" d={HEART_PATH} />
    </svg>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts.map(Number);
  const monthName = MONTHS[month - 1];
  if (!monthName) return dateStr;
  return `${monthName} ${day}, ${year}`;
}

export function DiaryEntryCard({ entry, showReview = true, layout }: DiaryEntryCardProps) {
  const { film, rating, watchedDate, reviewHtml, isRewatch, liked } = entry;
  const poster = film.posterLarge ?? film.posterSmall;
  const hasReview = showReview && reviewHtml !== "";
  const datePrefix = isRewatch ? "Rewatched" : "Watched";

  const cleanHtml = useMemo(
    () =>
      typeof window !== "undefined"
        ? DOMPurify.sanitize(reviewHtml)
        : reviewHtml,
    [reviewHtml]
  );

  const reviewRef = useRef<HTMLDivElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = reviewRef.current;
    if (!el) return;
    const check = () => setIsClamped(el.scrollHeight > el.clientHeight);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [reviewHtml]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const [isBodyOverflowing, setIsBodyOverflowing] = useState(false);

  useEffect(() => {
    if (layout !== "list") {
      setIsBodyOverflowing(false);
      return;
    }
    const el = bodyRef.current;
    if (!el) return;
    const check = () => setIsBodyOverflowing(el.scrollHeight > el.clientHeight);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [layout]);

  const posterSrcSet = film.tmdbId && film.posterLarge
    ? [
        film.posterLarge.replace(/\/w\d+\//, "/w185/") + " 185w",
        film.posterLarge.replace(/\/w\d+\//, "/w342/") + " 342w",
        film.posterLarge + " 500w",
      ].join(", ")
    : undefined;

  return (
    <div className={styles.card}>
      <a
        href={film.letterboxdUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.poster}
        aria-label={`${film.title} (${film.year}) on Letterboxd`}
      >
        {poster ? (
          <img
            src={poster}
            srcSet={posterSrcSet}
            sizes="160px"
            alt={`Poster for ${film.title} (${film.year})`}
            className={styles.posterImg}
            loading="lazy"
          />
        ) : (
          <div className={styles.posterPlaceholder}>{film.title}</div>
        )}
      </a>

      <div ref={bodyRef} className={layout === "list" ? `${styles.body} ${styles.bodyList}` : styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{film.title}</span>
          {film.year && <>{" "}<span className={styles.year}>{film.year}</span></>}
        </div>

        <div className={styles.ratingRow}>
          {rating.score > 0 && <RatingStars score={rating.score} />}
          {liked && <LikedHeart />}
        </div>

        <span className={styles.date}>
          {datePrefix} {formatDate(watchedDate)}
        </span>

        {hasReview && (
          <>
            <div
              ref={reviewRef}
              className={styles.review}
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
            {isClamped && (
              <a
                href={entry.entryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.readMore}
              >
                [read more on letterboxd]
              </a>
            )}
          </>
        )}
        {isBodyOverflowing && (
          <a
            href={entry.entryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.listOverflowReadMore}
          >
            read more on letterboxd
          </a>
        )}
      </div>
    </div>
  );
}
