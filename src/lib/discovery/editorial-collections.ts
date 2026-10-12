/**
 * Editorial topic collections — curated discovery lenses.
 * Older and newer work both qualify when they match the collection keywords.
 * Ranking uses the evergreen discovery engine (not publish date alone).
 */

import type { Publication } from "./types";
import { rankForDiscovery } from "./evergreen";

export type EditorialCollection = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
};

export const EDITORIAL_COLLECTIONS: EditorialCollection[] = [
  {
    id: "ai-infrastructure",
    title: "AI & infrastructure",
    description: "Models, chips, power, and the systems underneath AI.",
    keywords: [
      "ai",
      "artificial intelligence",
      "infrastructure",
      "data centre",
      "data center",
      "semiconductor",
      "chip",
      "gpu",
      "nvidia",
      "compute",
    ],
  },
  {
    id: "africa-tech",
    title: "Africa & technology",
    description: "Builders, markets, and tech across African economies.",
    keywords: [
      "africa",
      "african",
      "nigeria",
      "ghana",
      "kenya",
      "lagos",
      "startup",
      "fintech",
    ],
  },
  {
    id: "energy-power",
    title: "Energy & power",
    description: "Electricity, grids, climate, and industrial power.",
    keywords: [
      "energy",
      "electricity",
      "power",
      "grid",
      "solar",
      "climate",
      "oil",
      "gas",
    ],
  },
  {
    id: "geopolitics",
    title: "Geopolitics & order",
    description: "States, strategy, and the contests that reshape markets.",
    keywords: [
      "china",
      "taiwan",
      "japan",
      "united states",
      "geopolitics",
      "diplomacy",
      "trade",
      "war",
    ],
  },
  {
    id: "research-deep",
    title: "Deep research",
    description: "Longer investigations and research-grade publishing.",
    keywords: ["research", "investigation", "study", "analysis", "report"],
  },
];

function matchesCollection(p: Publication, col: EditorialCollection): boolean {
  const hay = [p.title, p.summary, p.category, p.type, ...(p.tags || [])]
    .join(" ")
    .toLowerCase();
  return col.keywords.some((k) => hay.includes(k.toLowerCase()));
}

export function publicationsForCollection(
  col: EditorialCollection,
  pool: Publication[],
  limit = 8
): Publication[] {
  const matched = pool.filter((p) => matchesCollection(p, col));
  if (!matched.length) return [];
  return rankForDiscovery(
    matched,
    {
      anchor: {
        title: col.title,
        summary: col.description,
        tags: col.keywords,
      },
    },
    limit
  );
}

export function editorialCollectionsWithItems(
  pool: Publication[],
  limitPer = 5
): { collection: EditorialCollection; items: Publication[] }[] {
  return EDITORIAL_COLLECTIONS.map((collection) => ({
    collection,
    items: publicationsForCollection(collection, pool, limitPer),
  })).filter((row) => row.items.length > 0);
}
