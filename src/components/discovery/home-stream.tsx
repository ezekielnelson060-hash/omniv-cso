"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicationCard } from "@/components/discovery/publication-card";
import { InterestPicker } from "@/components/discovery/interest-picker";
import { RecommendationReason } from "@/components/discovery/recommendation-reason";
import {
  moreLikeThis,
  lessLikeThis,
  mutePublisher,
  isPublicationMuted,
  recommendationReason,
} from "@/lib/discovery/recommend";
import {
  interestMatchScore,
  readInterests,
  interestsChosen,
} from "@/lib/discovery/interests";
import {
  signalBoost,
  risingScore,
  trendingScore,
  readTopSignalTopics,
} from "@/lib/discovery/signals";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import { entityPath } from "@/lib/discovery/types";
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

export function HomeStream({
  tab,
  publications,
  dimension = "all",
}: Props) {
  const [follows, setFollows] = useState<FollowRow[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestsDone, setInterestsDone] = useState(true);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(12);
  const [serverWeights, setServerWeights] = useState<Record<string, number>>({});
  const [publicationMomentum, setPublicationMomentum] = useState<
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
          if (!cancelled && sData.weights && typeof sData.weights === "object") {
            setServerWeights(sData.weights as Record<string, number>);
          }
          if (
            !cancelled &&
            sData.publicationMomentum &&
            typeof sData.publicationMomentum === "object"
          ) {
            setPublicationMomentum(
              sData.publicationMomentum as Record<string, number>
            );
          }
        } catch {
          /* optional */
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

  useEffect(() => {
    setVisible(12);
  }, [tab, dimension]);

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
        .slice(0, 48);
    }
    if (tab === "trending") {
      return [...list]
        .map((p) => ({
          p,
          score:
            trendingScore(p) * 0.55 +
            (publicationMomentum[p.slug] || 0) * 0.45,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 48)
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
        .slice(0, 48);
    }
    if (tab === "rising") {
      return [...list]
        .map((p) => ({
          p,
          score:
            risingScore(p) * 0.55 +
            (publicationMomentum[p.slug] || 0) * 0.45,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 48)
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
      const velocity =
        risingScore(p) * 0.55 + (publicationMomentum[p.slug] || 0) * 0.45;
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
      if (typeCount < 5) diverse.push(p);
      if (diverse.length >= 48) break;
    }
    return diverse.length ? diverse : scored.slice(0, 48).map((x) => x.p);
  }, [
    tab,
    publications,
    follows,
    interests,
    dimension,
    tick,
    serverWeights,
    publicationMomentum,
  ]);

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

  const streamSlice = items.slice(0, visible);

  return (
    <div className="space-y-3">
      {streamSlice.map((pub, i) => {
        const reason = recommendationReason(pub, tab, interests);
        const tags = [...(pub.tags || []), pub.category || ""]
          .map((x) => (x || "").toLowerCase())
          .filter(Boolean);
        let relatedEntity = null as (typeof SEED_ENTITIES)[number] | null;
        if (tab === "for-you" && i > 0 && i % 3 === 2) {
          relatedEntity =
            SEED_ENTITIES.find((e) => {
              const hay = `${e.name} ${e.type} ${e.tagline || ""}`.toLowerCase();
              return tags.some(
                (t) => t.length > 2 && hay.includes(t.slice(0, 5))
              );
            }) ||
            SEED_ENTITIES[i % SEED_ENTITIES.length] ||
            null;
        }
        return (
          <div key={pub.id} className="space-y-3">
            <div>
              <PublicationCard pub={pub} />
              {tab === "for-you" && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 px-1">
                  {reason && <RecommendationReason reason={reason} />}
                  {reason && (
                    <span className="text-[11px] text-zinc-700" aria-hidden>
                      ·
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onFeedback(pub, "more")}
                    className="text-[11px] text-zinc-600 hover:text-omniv-gold"
                  >
                    More like this
                  </button>
                  <span className="text-[11px] text-zinc-700" aria-hidden>
                    ·
                  </span>
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
            {relatedEntity && (
              <Link
                href={entityPath(relatedEntity)}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06] transition hover:bg-white/[0.05] hover:ring-omniv-gold/25"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15 text-[14px] font-semibold text-omniv-gold">
                  {relatedEntity.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-white">
                    {relatedEntity.name}
                  </p>
                  <p className="truncate text-[12px] capitalize text-zinc-500">
                    {relatedEntity.type}
                    {relatedEntity.tagline
                      ? ` · ${relatedEntity.tagline}`
                      : ""}
                  </p>
                </div>
                <span className="text-zinc-600">→</span>
              </Link>
            )}
          </div>
        );
      })}
      {visible < items.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => Math.min(v + 12, items.length))}
          className="mt-2 w-full rounded-2xl bg-white/[0.04] py-3.5 text-[13px] font-medium text-zinc-300 ring-1 ring-white/[0.08] transition hover:bg-white/[0.07] hover:text-white"
        >
          Show more · {items.length - visible} left
        </button>
      )}
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
