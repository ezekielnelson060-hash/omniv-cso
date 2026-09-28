"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicationCard } from "@/components/discovery/publication-card";
import { InterestPicker } from "@/components/discovery/interest-picker";
import {
  moreLikeThis,
  lessLikeThis,
  mutePublisher,
  isPublicationMuted,
  recommendationReason,
} from "@/lib/discovery/recommend";
import { interestMatchScore, readInterests, interestsChosen } from "@/lib/discovery/interests";
import {
  signalBoost,
  risingScore,
  trendingScore,
} from "@/lib/discovery/signals";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import type { Publication } from "@/lib/discovery/types";

type FollowRow = {
  slug: string;
  name: string;
  type?: string;
};

type Tab = "for-you" | "following" | "trending" | "rising" | "new";

type Props = {
  tab: Tab;
  publications: Publication[];
  dimension?: string;
};

export function HomeFeedClient({
  tab,
  publications,
  dimension = "all",
}: Props) {
  const [follows, setFollows] = useState<FollowRow[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestsDone, setInterestsDone] = useState(true);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [serverWeights, setServerWeights] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setInterests(readInterests());
        setInterestsDone(interestsChosen());
        const res = await fetch("/api/discovery/follow");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.follows)) {
          setFollows(
            data.follows.map(
              (f: { slug?: string; name?: string; type?: string }) => ({
                slug: String(f.slug || ""),
                name: String(f.name || ""),
                type: f.type,
              })
            )
          );
        }
        try {
          const sRes = await fetch("/api/discovery/signals");
          const sData = await sRes.json();
          if (
            !cancelled &&
            sData.weights &&
            typeof sData.weights === "object"
          ) {
            setServerWeights(sData.weights as Record<string, number>);
          }
        } catch {
          /* signals optional */
        }
      } catch {
        /* guest */
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
      return [...list]
        .map((p) => ({ p, score: trendingScore(p) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 18)
        .map((x) => x.p);
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
      const localBehavior = signalBoost(p.tags || [], p.category);
      let serverBehavior = 0;
      if (Object.keys(serverWeights).length) {
        const topics = [...(p.tags || []), p.category || ""].map((x) =>
          (x || "").toLowerCase()
        );
        let sum = 0;
        let n = 0;
        for (const t of topics) {
          if (!t) continue;
          for (const [k, v] of Object.entries(serverWeights)) {
            if (t.includes(k) || k.includes(t)) {
              sum += v;
              n += 1;
            }
          }
        }
        if (n) serverBehavior = Math.max(0, Math.min(1, (sum / n + 1) / 4));
      }
      const behavior = Math.max(localBehavior, serverBehavior);
      const velocity = risingScore(p);
      const score =
        interest * 0.32 +
        heat * 0.18 +
        behavior * 0.28 +
        velocity * 0.17 +
        0.05;
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
  }, [tab, publications, follows, interests, dimension, tick, serverWeights]);

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
            className="h-36 animate-pulse rounded-2xl bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (tab === "following" && !follows.length) {
    return (
      <div className="rounded-2xl bg-white/[0.03] px-5 py-10 text-center ring-1 ring-white/[0.06]">
        <p className="text-[15px] font-medium text-white">Following is empty</p>
        <p className="mt-2 text-[13px] text-zinc-500">
          Follow entities so their publications land here.
        </p>
        <Link
          href="/explore"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
        >
          Explore
        </Link>
      </div>
    );
  }

  if (!interestsDone && tab === "for-you") {
    return (
      <div className="space-y-4">
        <p className="text-[14px] text-zinc-400">
          Pick a few interests so For You isn't random.
        </p>
        <InterestPicker
          onDone={() => {
            setInterests(readInterests());
            setInterestsDone(true);
            setTick((n) => n + 1);
          }}
        />
      </div>
    );
  }

  if (!items.length) {
    return <HomeEmptyState tab={tab} />;
  }

  return (
    <div className="space-y-4">
      {tab === "trending" && (
        <p className="text-[12px] text-zinc-500">
          Ranked by engagement velocity — heat weighted by recency.
        </p>
      )}
      {items.map((pub) => {
        const reason = recommendationReason(pub, tab, interests);
        return (
          <div key={pub.id}>
            <PublicationCard pub={pub} />
            {reason && (
              <p className="mt-1.5 px-1 text-[11px] text-zinc-600">{reason}</p>
            )}
            {tab === "for-you" && (
              <div className="mt-1.5 flex gap-2 px-1">
                <button
                  type="button"
                  onClick={() => onFeedback(pub, "more")}
                  className="text-[11px] text-zinc-600 hover:text-omniv-gold"
                >
                  More like this
                </button>
                <button
                  type="button"
                  onClick={() => onFeedback(pub, "less")}
                  className="text-[11px] text-zinc-600 hover:text-zinc-400"
                >
                  Less
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HomeEmptyState({ tab }: { tab: Tab }) {
  const copy: Record<Tab, { title: string; body: string; href: string }> = {
    "for-you": {
      title: "Nothing ranked yet",
      body: "Explore and engage so For You can learn.",
      href: "/explore",
    },
    following: {
      title: "No posts from people you follow",
      body: "Find entities worth following on Explore.",
      href: "/explore",
    },
    trending: {
      title: "No trending signals yet",
      body: "Heat builds as explorers like and save.",
      href: "/explore",
    },
    rising: {
      title: "Nothing rising right now",
      body: "Fresh publications with early heat show up here.",
      href: "/publish",
    },
    new: {
      title: "No new publications",
      body: "Be the first to publish something worth discovering.",
      href: "/publish",
    },
  };
  const c = copy[tab];
  return (
    <div className="rounded-2xl bg-white/[0.03] px-5 py-10 text-center ring-1 ring-white/[0.06]">
      <p className="text-[15px] font-medium text-white">{c.title}</p>
      <p className="mt-2 text-[13px] text-zinc-500">{c.body}</p>
      <Link
        href={c.href}
        className="mt-5 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
      >
        Continue
      </Link>
    </div>
  );
}
