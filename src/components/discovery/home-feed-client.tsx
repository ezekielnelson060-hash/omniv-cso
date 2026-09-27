"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FeedFeaturedCard,
  FeedCompactCard,
  FeedCard,
} from "@/components/discovery/feed-card";
import {
  readInterests,
  interestMatchScore,
  hasCompletedInterests,
} from "@/lib/discovery/interests";
import { signalBoost, risingScore } from "@/lib/discovery/signals";
import { readFollows, type FollowedRef } from "@/lib/discovery/local-graph";
import {
  recommendationReason,
  isPublicationMuted,
  moreLikeThis,
  lessLikeThis,
  mutePublisher,
  TRENDING_DIMENSIONS,
} from "@/lib/discovery/recommend";
import type { Publication } from "@/lib/discovery/types";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import { entityPath } from "@/lib/discovery/types";
import { HomeEmptyState } from "@/components/discovery/home-empty";

const COMPACT = new Set(["music", "product", "opportunity", "announcement"]);

type Tab = "for-you" | "following" | "trending" | "rising" | "new";

type Props = {
  tab: Tab;
  publications: Publication[];
};

export function HomeFeedClient({ tab, publications }: Props) {
  const [follows, setFollows] = useState<FollowedRef[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [interestsDone, setInterestsDone] = useState(true);
  const [dimension, setDimension] = useState("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setInterests(readInterests());
    setInterestsDone(hasCompletedInterests());
    setFollows(readFollows());
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/follow");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.follows) && data.follows.length) {
          setFollows(
            data.follows.map(
              (f: { type: string; slug: string; name?: string }) => ({
                type: f.type,
                slug: f.slug,
                name: f.name || f.slug,
              })
            )
          );
        }
      } catch {
        /* local follows */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const items = useMemo(() => {
    void tick;
    let list = publications.filter((p) => !isPublicationMuted(p));

    if (tab === "trending" && dimension !== "all") {
      const d = dimension.toLowerCase();
      list = list.filter((p) => {
        const hay = [...(p.tags || []), p.category || "", p.type].map((x) =>
          (x || "").toLowerCase()
        );
        return hay.some((h) => h.includes(d) || d.includes(h));
      });
    }

    if (tab === "new") {
      return list
        .sort((a, b) =>
          (b.publishedAt || "").localeCompare(a.publishedAt || "")
        )
        .slice(0, 18);
    }
    if (tab === "trending") {
      return list
        .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
        .slice(0, 18);
    }
    if (tab === "following") {
      if (!follows.length) return [];
      const followSlugs = new Set(follows.map((f) => f.slug.toLowerCase()));
      const followNames = new Set(
        follows.map((f) => (f.name || "").toLowerCase()).filter(Boolean)
      );
      const idToSlug = new Map(
        SEED_ENTITIES.map((e) => [e.id, e.slug.toLowerCase()])
      );
      return list
        .filter((p) => {
          const pubSlug = (
            (p as Publication & { publisherSlug?: string }).publisherSlug || ""
          ).toLowerCase();
          if (pubSlug && followSlugs.has(pubSlug)) return true;
          const mapped = p.publisherId
            ? idToSlug.get(p.publisherId)
            : undefined;
          if (mapped && followSlugs.has(mapped)) return true;
          if (p.publisherId && followSlugs.has(p.publisherId.toLowerCase()))
            return true;
          const name = (p.publisherName || "").toLowerCase();
          if (name && followNames.has(name)) return true;
          return follows.some(
            (f) =>
              name &&
              (name.includes(f.name.toLowerCase()) ||
                f.name.toLowerCase().includes(name))
          );
        })
        .sort((a, b) =>
          (b.publishedAt || "").localeCompare(a.publishedAt || "")
        )
        .slice(0, 18);
    }
    if (tab === "rising") {
      return [...list]
        .map((p) => ({ p, score: risingScore(p) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 18)
        .map((x) => x.p);
    }

    const scored = list.map((p) => {
      const interest = interestMatchScore(p.tags || [], p.category, interests);
      const heat = Math.min(1, (p.heat ?? 0) / 100);
      const behavior = signalBoost(p.tags || [], p.category);
      const score = interest * 0.4 + heat * 0.3 + behavior * 0.2 + 0.1;
      return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const diverse: Publication[] = [];
    for (const { p } of scored) {
      const typeCount = diverse.filter((x) => x.type === p.type).length;
      if (typeCount < 3) diverse.push(p);
      if (diverse.length >= 18) break;
    }
    return diverse.length ? diverse : scored.slice(0, 18).map((x) => x.p);
  }, [tab, publications, follows, interests, dimension, tick]);

  function onFeedback(
    pub: Publication,
    action: "more" | "less" | "mute-publisher"
  ) {
    if (action === "more") moreLikeThis(pub);
    if (action === "less") lessLikeThis(pub);
    if (action === "mute-publisher") {
      mutePublisher(pub.publisherId || pub.publisherName || "");
    }
    setInterests(readInterests());
    setTick((n) => n + 1);
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (tab === "following" && !follows.length) {
    const suggestions = SEED_ENTITIES.slice(0, 6);
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <p className="text-[15px] font-medium text-white">
          Follow people and entities you care about
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
          Following is chronological — only sources you choose. Start with a
          few below.
        </p>
        <div className="mt-5 space-y-3">
          {suggestions.map((e) => (
            <Link
              key={e.id}
              href={entityPath(e)}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
            >
              <div>
                <p className="text-[14px] font-medium text-white">{e.name}</p>
                <p className="text-[12px] text-zinc-500">
                  {e.tagline || e.type}
                </p>
              </div>
              <span className="text-[12px] font-medium text-omniv-gold">
                View
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/explore"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
        >
          Explore more
        </Link>
      </div>
    );
  }

  if (!interestsDone && tab === "for-you") {
    return (
      <div className="rounded-2xl border border-omniv-gold/20 bg-omniv-gold/5 p-6 text-center">
        <p className="text-[15px] font-medium text-white">
          Tell Omniv what to discover
        </p>
        <p className="mt-1.5 text-[13px] text-zinc-400">
          Pick a few interests so For You isn't random.
        </p>
        <Link
          href="/onboarding?step=interests"
          className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
        >
          Choose interests
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return <HomeEmptyState tab={tab} />;
  }

  return (
    <div className="space-y-4">
      {tab === "trending" && (
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TRENDING_DIMENSIONS.map((d) => {
            const active = dimension === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDimension(d.id)}
                className={`inline-flex h-7 shrink-0 items-center rounded-full px-3.5 text-[12px] font-medium transition ${
                  active
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      )}

      {items.map((pub, i) => {
        const reason = recommendationReason(pub, tab, interests);
        const feedback = (
          <FeedFeedback
            reason={reason}
            onMore={() => onFeedback(pub, "more")}
            onLess={() => onFeedback(pub, "less")}
            onMute={() => onFeedback(pub, "mute-publisher")}
          />
        );
        if (i === 0 && !COMPACT.has(pub.type)) {
          return (
            <div key={pub.id || pub.slug}>
              <FeedFeaturedCard pub={pub} showExplore />
              {feedback}
            </div>
          );
        }
        if (COMPACT.has(pub.type)) {
          return (
            <div key={pub.id || pub.slug}>
              <FeedCompactCard pub={pub} />
              {feedback}
            </div>
          );
        }
        return (
          <div key={pub.id || pub.slug}>
            <FeedCard pub={pub} />
            {feedback}
          </div>
        );
      })}
    </div>
  );
}

function FeedFeedback({
  reason,
  onMore,
  onLess,
  onMute,
}: {
  reason: string;
  onMore: () => void;
  onLess: () => void;
  onMute: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="-mt-1 mb-1 flex items-start justify-between gap-2 px-1">
      <p className="text-[11px] leading-snug text-zinc-600">{reason}</p>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-300"
          aria-label="Why am I seeing this"
        >
          <span className="text-[16px] leading-none">···</span>
        </button>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-[#121212] py-1 shadow-xl">
              <p className="border-b border-white/[0.06] px-3 py-2 text-[11px] leading-snug text-zinc-500">
                {reason}
              </p>
              <button
                type="button"
                className="block w-full px-3 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.06]"
                onClick={() => {
                  onMore();
                  setOpen(false);
                }}
              >
                More like this
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.06]"
                onClick={() => {
                  onLess();
                  setOpen(false);
                }}
              >
                Less like this
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2.5 text-left text-[13px] text-zinc-400 hover:bg-white/[0.06]"
                onClick={() => {
                  onMute();
                  setOpen(false);
                }}
              >
                Mute publisher
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
