"use client";

import { useEffect, useState } from "react";
import { SaveButton } from "@/components/discovery/save-button";
import {
  isLiked,
  getLocalLikeCount,
  toggleLocalLike,
} from "@/lib/discovery/local-likes";
import { timeAgo } from "@/lib/discovery/time-ago";

export function PublicationActions({
  slug,
  type,
  title,
  publishedAt,
  initialLikes = 0,
  compact = false,
}: {
  slug: string;
  type: string;
  title: string;
  publishedAt?: string | null;
  initialLikes?: number;
  compact?: boolean;
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
        // keep local in sync
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

  return (
    <div
      className={`flex items-center gap-1 ${compact ? "pt-1" : "pt-2"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onLike}
        disabled={!ready || busy}
        aria-label={liked ? "Unlike" : "Like"}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] transition ${
          liked
            ? "text-rose-400"
            : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M12 21s-6.5-4.35-9.2-8.2C1.1 10.4 1.4 6.8 4.2 5.1 6.3 3.8 8.9 4.3 12 7c3.1-2.7 5.7-3.2 7.8-1.9 2.8 1.7 3.1 5.3 1.4 7.7C18.5 16.65 12 21 12 21z"
            strokeLinejoin="round"
          />
        </svg>
        <span className="tabular-nums">{count > 0 ? count : ""}</span>
      </button>

      <div className="-ml-0.5">
        <SaveButton
          kind="publication"
          type={type}
          slug={slug}
          name={title}
          pubType={type}
          variant="icon"
        />
      </div>

      {ago ? (
        <span className="ml-auto text-[11px] text-zinc-600">{ago}</span>
      ) : null}
    </div>
  );
}
