import type {
  DiscoveryEntity,
  EntityReference,
  Publication,
} from "./types";

export type DiscoveryGraph = {
  entities: DiscoveryEntity[];
  publications: Publication[];
};

export type RecommendationSignals = {
  followedEntityKeys?: Set<string>;
  savedPublicationSlugs?: Set<string>;
  savedEntityKeys?: Set<string>;
  now?: Date;
};

export type ScoredPublication = {
  publication: Publication;
  score: number;
  reasons: string[];
};

function key(type: string, slug: string) {
  return `${type.toLowerCase()}:${slug.toLowerCase()}`;
}

function entityKeys(publication: Publication): Set<string> {
  const keys = new Set<string>();
  const publisher = publication.publisherId;
  if (publisher) keys.add(`id:${publisher}`);
  for (const ref of publication.entityRefs || []) {
    keys.add(key(ref.type, ref.slug));
    if (ref.id) keys.add(`id:${ref.id}`);
  }
  return keys;
}

function tags(publication: Publication): Set<string> {
  return new Set((publication.tags || []).map((tag) => tag.toLowerCase().trim()).filter(Boolean));
}

function overlap<T>(a: Set<T>, b: Set<T>) {
  let count = 0;
  for (const item of a) if (b.has(item)) count += 1;
  return count;
}

function freshnessScore(publishedAt: string, now: Date) {
  const timestamp = new Date(publishedAt).getTime();
  if (!Number.isFinite(timestamp)) return 0;
  const ageDays = Math.max(0, (now.getTime() - timestamp) / 86_400_000);
  return Math.max(0, Math.round(10 * Math.exp(-ageDays / 45)));
}

function popularityScore(heat?: number) {
  return Math.max(0, Math.min(10, Math.round((heat || 0) / 10)));
}

export function getEntityReferences(
  publication: Publication,
  entities: DiscoveryEntity[]
): DiscoveryEntity[] {
  const refs = publication.entityRefs || [];
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const byKey = new Map(entities.map((entity) => [key(entity.type, entity.slug), entity]));
  const found: DiscoveryEntity[] = [];
  const seen = new Set<string>();
  const add = (entity?: DiscoveryEntity) => {
    if (entity && !seen.has(entity.id)) {
      seen.add(entity.id);
      found.push(entity);
    }
  };
  add(byId.get(publication.publisherId));
  for (const ref of refs) add((ref.id && byId.get(ref.id)) || byKey.get(key(ref.type, ref.slug)));
  return found;
}

export function getRelatedEntities(
  entity: DiscoveryEntity,
  graph: DiscoveryGraph,
  limit = 8
): DiscoveryEntity[] {
  const sourceTags = new Set(entity.tags.map((tag) => tag.toLowerCase()));
  return graph.entities
    .filter((candidate) => candidate.id !== entity.id)
    .map((candidate) => {
      const sharedTags = overlap(sourceTags, new Set(candidate.tags.map((tag) => tag.toLowerCase())));
      const sharedPublications = graph.publications.filter((publication) => {
        const refs = getEntityReferences(publication, graph.entities).map((ref) => ref.id);
        return refs.includes(entity.id) && refs.includes(candidate.id);
      }).length;
      return { candidate, score: sharedPublications * 8 + sharedTags * 5 + popularityScore(candidate.heat) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map((item) => item.candidate);
}

export function recommendPublications(
  source: Publication | null,
  graph: DiscoveryGraph,
  signals: RecommendationSignals = {},
  limit = 6
): ScoredPublication[] {
  const now = signals.now || new Date();
  const sourceEntities = source ? entityKeys(source) : new Set<string>();
  const sourceTags = source ? tags(source) : new Set<string>();
  const sourceRelatedIds = new Set(source?.relatedPublicationIds || []);

  return graph.publications
    .filter((candidate) => candidate.id !== source?.id && candidate.status !== "draft" && candidate.status !== "archived")
    .map((candidate) => {
      const candidateEntities = entityKeys(candidate);
      const candidateTags = tags(candidate);
      const sharedEntities = overlap(sourceEntities, candidateEntities);
      const sharedTags = overlap(sourceTags, candidateTags);
      const sameCategory = source?.category && candidate.category && source.category.toLowerCase() === candidate.category.toLowerCase();
      const followedEntity = [...candidateEntities].some((candidateKey) => signals.followedEntityKeys?.has(candidateKey));
      const savedEntity = [...candidateEntities].some((candidateKey) => signals.savedEntityKeys?.has(candidateKey));
      const savedContent = signals.savedPublicationSlugs?.has(candidate.slug);
      const reasons: string[] = [];
      let score = 0;
      if (sourceRelatedIds.has(candidate.id) || sourceRelatedIds.has(candidate.slug)) { score += 20; reasons.push("directly related"); }
      if (sharedEntities) { score += sharedEntities * 12; reasons.push("shared entity"); }
      if (sharedTags) { score += Math.min(20, sharedTags * 4); reasons.push("shared topic"); }
      if (sameCategory) { score += 6; reasons.push("same category"); }
      if (followedEntity) { score += 10; reasons.push("from a followed entity"); }
      if (savedEntity || savedContent) { score += 7; reasons.push("connected to something you saved"); }
      score += freshnessScore(candidate.publishedAt, now);
      score += popularityScore(candidate.heat);
      return { publication: candidate, score, reasons };
    })
    .sort((a, b) => b.score - a.score || b.publication.publishedAt.localeCompare(a.publication.publishedAt) || a.publication.title.localeCompare(b.publication.title))
    .slice(0, limit);
}

export function recommendForEntity(
  entity: DiscoveryEntity,
  graph: DiscoveryGraph,
  signals: RecommendationSignals = {},
  limit = 6
): ScoredPublication[] {
  const source: Publication = {
    id: `entity:${entity.id}`,
    type: "article",
    slug: `entity-${entity.slug}`,
    title: entity.name,
    summary: entity.tagline,
    publisherId: entity.id,
    tags: entity.tags,
    publishedAt: entity.publishedAt,
    heat: entity.heat,
    entityRefs: [{ id: entity.id, type: entity.type, slug: entity.slug, label: entity.name }],
  };
  return recommendPublications(source, graph, signals, limit);
}

export function entityReference(
  entity: DiscoveryEntity
): EntityReference {
  return { id: entity.id, type: entity.type, slug: entity.slug, label: entity.name };
}
