"use client";

import { useEffect, useState } from "react";
import { SaveButton } from "@/components/discovery/save-button";
import {
  isLiked,
  getLocalLikeCount,
  toggleLocalLike,
} from "@/lib/discovery/local-likes";
import { timeAgo } from "@/lib/discovery/time-ago";
import { recordSignal } from "@/lib/discovery/signals";

/**
 * Engagement bar — matches mockup:
 * left: ♥ like + count · comments
 * right: bookmark save · relative time
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
  tags = [],
  category,
}: {
  slug: string;
  type: string;
  title: string;
  publishedAt?: string | null;
  initialLikes?: number;
  initialComments?: number;
  compact?: boolean;
  showTime?: boolean;
  tags?: string[];
  category?: string;
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
        if (typeof data.liked === "boolean") {
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
        if (local.liked) recordSignal("like", tags, category);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setLiked(Boolean(data.liked));
        if (typeof data.count === "number") setCount(data.count);
        if (data.liked !== isLiked(slug)) {
          toggleLocalLike(slug, type, count);
        }
        if (data.liked) recordSignal("like", tags, category);
      } else {
        const local = toggleLocalLike(slug, type, count);
        setLiked(local.liked);
        setCount(local.count);
        if (local.liked) recordSignal("like", tags, category);
      }
    } catch {
      const local = toggleLocalLike(slug, type, count);
      setLiked(local.liked);
      setCount(local.count);
      if (local.liked) recordSignal("like", tags, category);
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

      {initialComments > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[12px] font-medium tabular-nums text-zinc-500">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              strokeLinejoin="round"
            />
          </svg>
          {initialComments}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1">
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
