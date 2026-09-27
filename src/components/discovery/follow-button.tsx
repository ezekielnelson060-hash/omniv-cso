"use client";

import { useEffect, useState } from "react";
import { isFollowing, toggleFollow } from "@/lib/discovery/local-graph";
import {
  DEFAULT_PREFS,
  getFollowPrefs,
  PREF_LABELS,
  removeFollowPrefs,
  setFollowPrefs,
  type FollowPrefs,
} from "@/lib/discovery/follow-prefs";
import { pushMyActivity } from "@/lib/discovery/my-activity";
import { recordSignal } from "@/lib/discovery/signals";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefs, setPrefs] = useState<FollowPrefs>({ ...DEFAULT_PREFS });

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
        setPrefs(getFollowPrefs(type, slug));
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
    if (next) {
      recordSignal("follow", [type, name, slug].filter(Boolean));
    }
    try {
      pushMyActivity({
        kind: next ? "followed" : "unfollowed",
        title: next ? `Followed ${name}` : `Unfollowed ${name}`,
        subtitle: type,
        href: `/e/${type}/${slug}`,
      });
    } catch {
      /* ignore */
    }
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
        if (next) {
          setPrefs(getFollowPrefs(type, slug));
          setSheetOpen(true);
        } else {
          removeFollowPrefs(type, slug);
        }
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
        if (next) {
          setPrefs(getFollowPrefs(type, slug));
          setSheetOpen(true);
        } else {
          removeFollowPrefs(type, slug);
        }
      } else {
        const next = toggleFollow({ type, slug, name, id });
        setFollowing(next);
        notify(next);
        if (next) setSheetOpen(true);
      }
    } catch {
      const next = toggleFollow({ type, slug, name, id });
      setFollowing(next);
      notify(next);
      if (next) setSheetOpen(true);
    } finally {
      setBusy(false);
    }
  }

  function togglePref(key: keyof FollowPrefs) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "everything" && next.everything) {
        next.publications = true;
        next.research = true;
        next.products = true;
        next.opportunities = true;
      }
      setFollowPrefs(type, slug, next);
      return next;
    });
  }

  function saveAndClose() {
    setFollowPrefs(type, slug, prefs);
    setSheetOpen(false);
  }

  return (
    <>
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

      {sheetOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close"
            onClick={saveAndClose}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-[#0c0c0c] px-5 pb-8 pt-5 shadow-2xl ring-1 ring-white/10 sm:rounded-3xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
            <p className="text-[17px] font-semibold text-white">
              Follow {name}
            </p>
            <p className="mt-1 text-[13px] text-zinc-500">
              What do you want to hear about?
            </p>

            <ul className="mt-5 space-y-1">
              {PREF_LABELS.map(({ key, label }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => togglePref(key)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-white/[0.04]"
                  >
                    <span className="text-[14px] text-zinc-200">{label}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        prefs[key]
                          ? "border-omniv-gold bg-omniv-gold text-black"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {prefs[key] ? "✓" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={saveAndClose}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
            >
              Done
            </button>

            {following && (
              <button
                type="button"
                onClick={() => {
                  setSheetOpen(false);
                  void onClick();
                }}
                className="mt-3 w-full text-center text-[13px] text-zinc-500 hover:text-zinc-300"
              >
                Unfollow
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
