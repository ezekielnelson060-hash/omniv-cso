/**
 * Publication ranking for For You / Explore.
 * Combines heat, recency, interest overlap, and type affinity.
 */

import type { Publication } from "./types";

export type RankContext = {
  interests?: string[];
  followedPublisherIds?: string[];
  followedPublisherNames?: string[];
  mutedSlugs?: string[];
  preferredTypes?: string[];
  now?: number;
};

function daysSince(iso: string | undefined, now: number): number {
  if (!iso) return 365;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 365;
  return Math.max(0, (now - t) / 86_400_000);
}

function interestOverlap(pub: Publication, interests: string[]): number {
  if (!interests.length) return 0;
  const hay = [
    ...(pub.tags || []),
    pub.category || "",
    pub.type || "",
    pub.title || "",
  ]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const raw of interests) {
    const i = raw.toLowerCase().trim();
    if (!i) continue;
    if (hay.includes(i)) score += 4;
    else if (
      i.length > 3 &&
      hay.split(/\s+/).some((t) => t.startsWith(i.slice(0, 4)))
    )
      score += 1;
  }
  return score;
}

/**
 * Higher is better. Use for sorting For You / related lists.
 */
export function rankScore(pub: Publication, ctx: RankContext = {}): number {
  const now = ctx.now ?? Date.now();
  const ageDays = daysSince(pub.publishedAt, now);
  const heat = Number(pub.heat || 0);

  // Recency: full weight under 2 days, fades over ~30 days
  const recency = Math.max(0, 1 - ageDays / 30) * 25;

  // Heat (capped)
  const heatScore = Math.min(40, heat * 0.35);

  // Interest match
  const interest = interestOverlap(pub, ctx.interests || []);

  // Follow boost
  let follow = 0;
  const pid = (pub.publisherId || "").toLowerCase();
  const pname = (pub.publisherName || "").toLowerCase();
  if (ctx.followedPublisherIds?.some((id) => id.toLowerCase() === pid))
    follow += 18;
  if (ctx.followedPublisherNames?.some((n) => n.toLowerCase() === pname))
    follow += 12;

  // Type preference (e.g. user watches a lot of video)
  let typeBoost = 0;
  if (ctx.preferredTypes?.includes(pub.type)) typeBoost = 6;

  // Soft penalty for very old low-heat items
  const stalePenalty = ageDays > 90 && heat < 15 ? -8 : 0;

  return recency + heatScore + interest + follow + typeBoost + stalePenalty;
}

export function rankPublications(
  pubs: Publication[],
  ctx: RankContext = {},
  limit = 40
): Publication[] {
  const muted = new Set((ctx.mutedSlugs || []).map((s) => s.toLowerCase()));
  return [...pubs]
    .filter((p) => !muted.has(p.slug.toLowerCase()))
    .map((p) => ({ p, s: rankScore(p, ctx) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}
