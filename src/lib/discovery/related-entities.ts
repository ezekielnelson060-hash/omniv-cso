/**
 * Rank discovery entities by topical overlap with a publication.
 */
import type { Publication } from "./types";
import { topicalOverlap } from "./evergreen";

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

function entityTokens(e: {
  name?: string;
  tagline?: string;
  about?: string;
  type?: string;
  tags?: string[];
  location?: string;
}): string[] {
  return tokensFrom(e.name, e.tagline, e.about, e.type, e.tags, e.location);
}

/**
 * Related entities for publication footers — rank by topical alignment
 * with the current publication (title, tags, category, summary, type).
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
