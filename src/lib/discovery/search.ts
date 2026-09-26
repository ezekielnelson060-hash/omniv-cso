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
  const haystack = fields.join(" ").toLowerCase();
  let score = 0;
  if (haystack.includes(normalized)) score += 12;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 3;
  }
  if (fields[0]?.toLowerCase().startsWith(normalized)) score += 8;
  return score + Math.min(5, Math.round(popularity / 20));
}

export function searchDiscovery(
  query: string,
  publications: Publication[],
  entities: DiscoveryEntity[],
  limit = 24
): DiscoverySearchResult[] {
  if (!query.trim()) return [];
  const publicationResults: DiscoverySearchResult[] = publications
    .map((publication) => ({
      kind: "publication" as const,
      item: publication,
      score: scoreText(query, [
        publication.title,
        publication.summary,
        publication.body || "",
        publication.category || "",
        publication.tags.join(" "),
        ...(publication.entityRefs || []).map((ref) => ref.label),
      ], publication.heat),
      typeLabel: publication.type,
    }))
    .filter((result) => result.score > 0);
  const entityResults: DiscoverySearchResult[] = entities
    .map((entity) => ({
      kind: "entity" as const,
      item: entity,
      score: scoreText(query, [
        entity.name,
        entity.tagline,
        entity.about,
        entity.location || "",
        entity.tags.join(" "),
      ], entity.heat),
      typeLabel: entity.type,
    }))
    .filter((result) => result.score > 0);
  return [...publicationResults, ...entityResults]
    .sort((a, b) => b.score - a.score || resultName(a).localeCompare(resultName(b)))
    .slice(0, limit);
}
