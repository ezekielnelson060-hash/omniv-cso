"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FeedFeaturedCard,
  FeedCompactCard,
  FeedCard,
} from "@/components/discovery/feed-card";
import { readInterests, interestMatchScore, hasCompletedInterests } from "@/lib/discovery/interests";
import { signalBoost, risingScore } from "@/lib/discovery/signals";
import { readFollows, type FollowedRef } from "@/lib/discovery/local-graph";
import type { Publication } from "@/lib/discovery/types";
import { SEED_ENTITIES } from "@/lib/discovery/seed";

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
            data.follows.map((f: { type: string; slug: string; name?: string }) => ({
              type: f.type,
              slug: f.slug,
              name: f.name || f.slug,
            }))
          );
        }
      } catch {
        /* local follows already set */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    const list = [...publications];
    if (tab === "new") {
      return list
        .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
        .slice(0, 18);
    }
    if (tab === "trending") {
      return list.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0)).slice(0, 18);
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
    // For You — interest + behavior signals + heat + type diversity
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
      if (diverse.length >= 16) break;
    }
    return diverse.length >= 4 ? diverse : scored.slice(0, 16).map((x) => x.p);
  }, [tab, publications, follows, interests]);

  const featured = items[0];
  const rest = items.slice(1);

  if (!ready) {
    return (
      <div className="space-y-3 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tab === "for-you" && !interestsDone && (
        <Link
          href="/onboarding?step=interests"
          className="flex items-center justify-between rounded-2xl bg-omniv-gold/10 px-4 py-3.5 ring-1 ring-omniv-gold/25 transition hover:bg-omniv-gold/15"
        >
          <div>
            <p className="text-[14px] font-semibold text-white">
              Shape your For You feed
            </p>
            <p className="text-[12px] text-zinc-400">
              Pick interests — Omniv learns from what you choose
            </p>
          </div>
          <span className="text-omniv-gold">→</span>
        </Link>
      )}

      {featured && <FeedFeaturedCard pub={featured} showExplore />}

      {rest.map((pub) =>
        COMPACT.has(pub.type) ? (
          <FeedCompactCard key={pub.id} pub={pub} />
        ) : (
          <FeedCard key={pub.id} pub={pub} />
        )
      )}

      {items.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-[14px] text-zinc-500">
            {tab === "following"
              ? "Follow entities to fill this feed."
              : "Nothing here yet."}
          </p>
          <Link
            href={tab === "following" ? "/explore" : "/publish"}
            className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
          >
            {tab === "following" ? "Explore entities" : "Publish something"}
          </Link>
        </div>
      )}
    </div>
  );
}
