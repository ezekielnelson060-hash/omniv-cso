/**
 * Omniv discovery engine — long-term discoverability.
 *
 * A publication stays eligible after its first day of attention.
 * Ranking blends five signals so older, relevant work can surface again
 * when a reader’s context makes it valuable.
 *
 * Signals:
 *  - Relevance: match to interests, search, or a related publication
 *  - Quality: useful structure / insight proxy (heat ceiling, body depth)
 *  - Freshness: time decay (not a hard cutoff)
 *  - Engagement: sustained attention (heat / saves proxy)
 *  - Discovery opportunity: under-exposed relative to relevance
 */

import type { Publication } from "./types";

export type DiscoveryContext = {
  /** Reader interest tags (onboarding + behavior) */
  interests?: string[];
  /** Optional topical anchor (search query or related article) */
  anchor?: {
    title?: string;
    tags?: string[];
    category?: string;
    summary?: string;
    type?: string;
  };
  now?: number;
};

function tokensFrom(...parts: (string | string[] | undefined | null)[]): string[] {
  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (Array.isArray(part)) {
      for (const p of part) out.push(...tokensFrom(p));
      continue;
    }
    const cleaned = String(part)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);
    out.push(...cleaned);
  }
  return [...new Set(out)];
}

function pubTokens(p: Publication): string[] {
  return tokensFrom(
    p.title,
    p.summary,
    p.category,
    p.tags,
    p.type,
    (p as { publisherName?: string }).publisherName
  );
}

/** Jaccard-ish overlap 0–1 */
export function topicalOverlap(
  a: string[],
  b: string[]
): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  // soft partial matches (substring)
  if (inter === 0) {
    for (const x of A) {
      for (const y of B) {
        if (x.includes(y) || y.includes(x)) inter += 0.35;
      }
    }
  }
  const union = A.size + B.size - inter;
  if (union <= 0) return 0;
  return Math.min(1, inter / Math.max(3, Math.min(union, 12)));
}

function ageDays(p: Publication, now: number): number {
  const ts = p.publishedAt ? Date.parse(p.publishedAt) : NaN;
  if (!Number.isFinite(ts)) return 30;
  return Math.max(0, (now - ts) / 86_400_000);
}

/** Relevance 0–1 */
export function relevanceScore(p: Publication, ctx: DiscoveryContext = {}): number {
  const tokens = pubTokens(p);
  let score = 0;
  let parts = 0;

  if (ctx.interests?.length) {
    const interestTokens = tokensFrom(ctx.interests);
    score += topicalOverlap(tokens, interestTokens);
    parts += 1;
  }

  if (ctx.anchor) {
    const anchorTokens = tokensFrom(
      ctx.anchor.title,
      ctx.anchor.tags,
      ctx.anchor.category,
      ctx.anchor.summary,
      ctx.anchor.type
    );
    score += topicalOverlap(tokens, anchorTokens);
    parts += 1;
  }

  if (parts === 0) {
    // No context — mild bias to tagged, categorized work
    return Math.min(0.35, (p.tags?.length || 0) * 0.08 + (p.category ? 0.12 : 0));
  }
  return Math.min(1, score / parts);
}

/** Quality proxy 0–1 — depth + sustained heat, not pure virality */
export function qualityScore(p: Publication): number {
  const heat = Math.min(1, (p.heat ?? 0) / 100);
  const body =
    typeof (p as { body?: string }).body === "string"
      ? (p as { body: string }).body
      : p.summary || "";
  const plain = body.replace(/<[^>]+>/g, " ");
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  const depth = Math.min(1, words / 800); // ~800 words ≈ full piece
  const hasTags = (p.tags?.length || 0) > 0 ? 0.1 : 0;
  const hasSummary = (p.summary || "").length > 40 ? 0.1 : 0;
  return Math.min(1, heat * 0.45 + depth * 0.35 + hasTags + hasSummary);
}

/** Freshness 0–1 — exponential decay; never hard-kills old work */
export function freshnessScore(p: Publication, now = Date.now()): number {
  const days = ageDays(p, now);
  // Half-life ~21 days; floor so evergreen can still compete
  return Math.max(0.12, Math.exp(-days / 21));
}

/** Engagement 0–1 */
export function engagementScore(p: Publication): number {
  return Math.min(1, (p.heat ?? 0) / 100);
}

/**
 * Discovery opportunity: high when relevant but not already saturated
 * (older + relevant + modest heat = second chance).
 */
export function opportunityScore(
  p: Publication,
  relevance: number,
  now = Date.now()
): number {
  const days = ageDays(p, now);
  const ageBoost = days > 7 ? Math.min(1, (days - 7) / 60) : 0;
  const underExposed = 1 - Math.min(1, (p.heat ?? 0) / 80);
  return Math.min(1, relevance * 0.55 + ageBoost * 0.25 + underExposed * 0.2);
}

export type ScoredPublication = {
  publication: Publication;
  score: number;
  signals: {
    relevance: number;
    quality: number;
    freshness: number;
    engagement: number;
    opportunity: number;
  };
};

/**
 * Composite discovery score.
 * Recent content is not automatic winner; popularity is not the only quality signal.
 */
export function discoveryScore(
  p: Publication,
  ctx: DiscoveryContext = {}
): ScoredPublication {
  const now = ctx.now ?? Date.now();
  const relevance = relevanceScore(p, ctx);
  const quality = qualityScore(p);
  const freshness = freshnessScore(p, now);
  const engagement = engagementScore(p);
  const opportunity = opportunityScore(p, relevance, now);

  // Weights tuned for “second chance” without drowning new work
  const score =
    relevance * 0.34 +
    quality * 0.18 +
    freshness * 0.16 +
    engagement * 0.14 +
    opportunity * 0.18;

  return {
    publication: p,
    score,
    signals: { relevance, quality, freshness, engagement, opportunity },
  };
}

export function rankForDiscovery(
  publications: Publication[],
  ctx: DiscoveryContext = {},
  limit = 24
): Publication[] {
  return publications
    .map((p) => discoveryScore(p, ctx))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.publication);
}

/** Related publications for article footers / Keep exploring */
export function relatedPublications(
  current: Publication,
  pool: Publication[],
  limit = 8
): Publication[] {
  const others = pool.filter(
    (p) => p.id !== current.id && p.slug !== current.slug
  );
  return rankForDiscovery(
    others,
    {
      anchor: {
        title: current.title,
        tags: current.tags,
        category: current.category,
        summary: current.summary,
        type: current.type,
      },
    },
    limit
  );
}

/**
 * Evergreen / worth rediscovering: prefer older, relevant, quality work
 * that is not already at the top of heat charts.
 */
export function evergreenPublications(
  pool: Publication[],
  ctx: DiscoveryContext = {},
  limit = 8
): Publication[] {
  const now = ctx.now ?? Date.now();
  const candidates = pool.filter((p) => ageDays(p, now) >= 5);
  const source = candidates.length >= 3 ? candidates : pool;

  return source
    .map((p) => {
      const base = discoveryScore(p, { ...ctx, now });
      // Extra weight on opportunity + quality for this shelf
      const score =
        base.score * 0.55 +
        base.signals.opportunity * 0.25 +
        base.signals.quality * 0.2;
      return { publication: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.publication);
}

/** Human-readable reason for why something resurfaced */
export function rediscoveryReason(
  p: Publication,
  ctx: DiscoveryContext = {}
): string {
  const { signals } = discoveryScore(p, ctx);
  if (signals.relevance > 0.55 && signals.opportunity > 0.45) {
    return "Still relevant to what people are exploring now.";
  }
  if (signals.quality > 0.55 && ageDays(p, ctx.now ?? Date.now()) > 14) {
    return "Worth rediscovering — strong work that stays useful.";
  }
  if (ctx.anchor && signals.relevance > 0.4) {
    return "Connected to what you are reading.";
  }
  if (signals.engagement > 0.5) {
    return "Readers keep coming back to this.";
  }
  return "Eligible for discovery beyond its first week.";
}

/** Entity topical tokens for overlap with a publication */
function entityTokens(e: {
  name?: string;
  tagline?: string;
  about?: string;
  type?: string;
  tags?: string[];
  location?: string;
}): string[] {
  return tokensFrom(
    e.name,
    e.tagline,
    e.about,
    e.type,
    e.tags,
    e.location
  );
}

/**
 * Related entities for publication footers — rank by topical alignment
 * with the current publication (title, tags, category, summary, type).
 * Prefer entities that share topic language over random network samples.
 */
export function relatedEntities<
  T extends {
    id: string;
    name?: string;
    tagline?: string;
    about?: string;
    type?: string;
    tags?: string[];
    location?: string;
    heat?: number;
  }
>(current: Publication, pool: T[], limit = 6): T[] {
  const anchor = tokensFrom(
    current.title,
    current.summary,
    current.category,
    current.tags,
    current.type,
    (current as { publisherName?: string }).publisherName
  );
  const publisherId = (current as { publisherId?: string }).publisherId;

  return pool
    .map((e) => {
      const overlap = topicalOverlap(anchor, entityTokens(e));
      // Soft boost for same publisher entity; never invent relevance
      const samePublisher =
        publisherId && (e as { id?: string }).id === publisherId ? 0.15 : 0;
      const heatNudge = Math.min(0.08, ((e.heat ?? 0) / 100) * 0.08);
      const score = overlap + samePublisher + heatNudge;
      return { entity: e, score, overlap };
    })
    .filter((x) => x.overlap > 0.02 || x.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entity);
}
