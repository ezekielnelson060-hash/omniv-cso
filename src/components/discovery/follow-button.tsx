"use client";

import { useEffect, useState } from "react";
import { isFollowing, toggleFollow } from "@/lib/discovery/local-graph";

export function FollowButton({
  type,
  slug,
  name,
  id,
}: {
  type: string;
  slug: string;
  name: string;
  id?: string;
}) {
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/follow");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.follows)) {
          setFollowing(
            data.follows.some(
              (x: { type: string; slug: string }) =>
                x.type === type && x.slug === slug
            )
          );
        } else {
          setFollowing(isFollowing(type, slug));
        }
      } catch {
        if (!cancelled) setFollowing(isFollowing(type, slug));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  function notify(next: boolean) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("omniv-follow-change", {
        detail: { type, slug, following: next },
      })
    );
  }

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/discovery/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug, name, id }),
      });
      if (res.status === 401) {
        const next = toggleFollow({ type, slug, name, id });
        setFollowing(next);
        notify(next);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        const next = Boolean(data.following);
        setFollowing(next);
        const local = isFollowing(type, slug);
        if (next !== local) {
          toggleFollow({ type, slug, name, id });
        }
        notify(next);
      } else {
        const next = toggleFollow({ type, slug, name, id });
        setFollowing(next);
        notify(next);
      }
    } catch {
      const next = toggleFollow({ type, slug, name, id });
      setFollowing(next);
      notify(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready || busy}
      className={`inline-flex h-10 min-w-[96px] items-center justify-center rounded-full px-5 text-[13px] font-semibold transition active:scale-[0.98] ${
        following
          ? "bg-transparent text-white ring-1 ring-white/20 hover:ring-white/35"
          : "bg-omniv-gold text-black hover:bg-omniv-gold/90"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
