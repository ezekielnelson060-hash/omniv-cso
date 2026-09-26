"use client";

import { useEffect, useState } from "react";
import { SaveButton } from "@/components/discovery/save-button";
import {
  isLiked,
  getLocalLikeCount,
  toggleLocalLike,
} from "@/lib/discovery/local-likes";
import { timeAgo } from "@/lib/discovery/time-ago";

/**
 * Engagement bar — matches mockup:
 * left: ♥ like + count · comments
 * right: bookmark save · relative time
 * Used on home feed, explore cards, entity latest, publication page.
 */
export function PublicationActions({
  slug,
  type,
  title,
  publishedAt,
  initialLikes = 0,
  initialComments = 0,
  compact = false,
  showTime = true,
}: {
  slug: string;
  type: string;
  title: string;
  publishedAt?: string | null;
  initialLikes?: number;
  initialComments?: number;
  compact?: boolean;
  showTime?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ago, setAgo] = useState("");

  useEffect(() => {
    setAgo(timeAgo(publishedAt));
    const id = window.setInterval(() => setAgo(timeAgo(publishedAt)), 60_000);
    return () => window.clearInterval(id);
  }, [publishedAt]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/discovery/like?slug=${encodeURIComponent(slug)}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (typeof data.count === "number") {
          setCount(Math.max(data.count, getLocalLikeCount(slug, initialLikes)));
        } else {
          setCount(getLocalLikeCount(slug, initialLikes));
        }
        if (data.auth) {
          setLiked(Boolean(data.liked));
        } else {
          setLiked(isLiked(slug));
        }
      } catch {
        if (!cancelled) {
          setLiked(isLiked(slug));
          setCount(getLocalLikeCount(slug, initialLikes));
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, initialLikes]);

  async function onLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/discovery/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type }),
      });
      if (res.status === 401) {
        const local = toggleLocalLike(slug, type, count);
        setLiked(local.liked);
        setCount(local.count);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setLiked(Boolean(data.liked));
        if (typeof data.count === "number") setCount(data.count);
        if (data.liked !== isLiked(slug)) {
          toggleLocalLike(slug, type, count);
        }
      } else {
        const local = toggleLocalLike(slug, type, count);
        setLiked(local.liked);
        setCount(local.count);
      }
    } catch {
      const local = toggleLocalLike(slug, type, count);
      setLiked(local.liked);
      setCount(local.count);
    } finally {
      setBusy(false);
    }
  }

  const displayCount =
    count >= 1000
      ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`
      : count > 0
        ? String(count)
        : "";

  return (
    <div
      className={`flex items-center gap-0.5 ${compact ? "" : "pt-1"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Like — mockup heart */}
      <button
        type="button"
        onClick={onLike}
        disabled={!ready || busy}
        aria-label={liked ? "Unlike" : "Like"}
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[12px] font-medium tabular-nums transition active:scale-95 ${
          liked
            ? "text-rose-400"
            : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.75"
          className="shrink-0"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            strokeLinejoin="round"
          />
        </svg>
        {displayCount ? <span>{displayCount}</span> : null}
      </button>

      {/* Comments — visual parity with mockup */}
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[12px] font-medium tabular-nums text-zinc-500"
        title="Comments"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="shrink-0"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            strokeLinejoin="round"
          />
        </svg>
        {initialComments > 0 ? <span>{initialComments}</span> : null}
      </span>

      <div className="ml-auto flex items-center gap-0.5">
        <SaveButton
          kind="publication"
          type={type}
          slug={slug}
          name={title}
          pubType={type}
          variant="icon"
        />
        {showTime && ago ? (
          <span className="px-1.5 text-[11px] text-zinc-600">{ago}</span>
        ) : null}
      </div>
    </div>
  );
}
