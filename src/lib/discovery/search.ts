import type { DiscoveryEntity, Publication } from "./types";

export type DiscoverySearchResult =
  | { kind: "publication"; item: Publication; score: number; typeLabel: string }
  | { kind: "entity"; item: DiscoveryEntity; score: number; typeLabel: string };

function resultName(result: DiscoverySearchResult) {
  return result.kind === "entity" ? result.item.name : result.item.title;
}

function scoreText(query: string, fields: string[], popularity = 0) {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return 0;
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const primary = (fields[0] || "").toLowerCase();
  const haystack = fields.join(" ").toLowerCase();
  let score = 0;

  // Exact / phrase
  if (primary === normalized) score += 40;
  else if (primary.startsWith(normalized)) score += 22;
  else if (primary.includes(normalized)) score += 14;
  if (haystack.includes(normalized)) score += 10;

  // Token coverage
  let tokenHits = 0;
  for (const token of tokens) {
    if (primary.includes(token)) {
      score += 5;
      tokenHits += 1;
    } else if (haystack.includes(token)) {
      score += 2;
      tokenHits += 1;
    }
  }
  if (tokens.length > 1 && tokenHits === tokens.length) score += 8;

  // Popularity soft boost
  score += Math.min(6, Math.round(popularity / 15));
  return score;
}

export function searchDiscovery(
  query: string,
  publications: Publication[],
  entities: DiscoveryEntity[],
  limit = 24,
  opts?: { type?: string }
): DiscoverySearchResult[] {
  if (!query.trim()) return [];
  const typeFilter = opts?.type?.toLowerCase();

  let pubs = publications;
  if (typeFilter && typeFilter !== "all") {
    pubs = pubs.filter((p) => p.type === typeFilter);
  }

  const publicationResults: DiscoverySearchResult[] = pubs
    .map((publication) => ({
      kind: "publication" as const,
      item: publication,
      score: scoreText(
        query,
        [
          publication.title,
          publication.summary,
          publication.excerpt || "",
          publication.body || "",
          publication.category || "",
          publication.tags.join(" "),
          publication.publisherName || "",
          ...(publication.entityRefs || []).map((ref) => ref.label),
        ],
        publication.heat
      ),
      typeLabel: publication.type,
    }))
    .filter((result) => result.score > 0);

  const entityResults: DiscoverySearchResult[] =
    typeFilter &&
    !["person", "company", "artist", "organization", "all"].includes(typeFilter)
      ? []
      : entities
          .map((entity) => ({
            kind: "entity" as const,
            item: entity,
            score: scoreText(
              query,
              [
                entity.name,
                entity.tagline,
                entity.about,
                entity.location || "",
                entity.tags.join(" "),
              ],
              entity.heat
            ),
            typeLabel: entity.type,
          }))
          .filter((result) => result.score > 0);

  return [...publicationResults, ...entityResults]
    .sort(
      (a, b) => b.score - a.score || resultName(a).localeCompare(resultName(b))
    )
    .slice(0, limit);
}
