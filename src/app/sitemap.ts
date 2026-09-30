import type { MetadataRoute } from "next";
import { SEED_ENTITIES, SEED_PUBLICATIONS } from "@/lib/discovery/seed";
import { entityPath, publicationPath } from "@/lib/discovery/types";
import {
  listDiscoveryEntities,
  listLivePublications,
} from "@/lib/discovery/db";
import { DISCOVERY_CATEGORIES } from "@/lib/discovery/seo";

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
).replace(/\/$/, "");

async function getPublicData() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    return {
      entities: await listDiscoveryEntities(supabase),
      publications: await listLivePublications(supabase, 500),
    };
  } catch {
    return { entities: SEED_ENTITIES, publications: SEED_PUBLICATIONS };
  }
}

/**
 * Dynamic public sitemap — publications, entities, explore categories.
 * Auth/app surfaces stay out of the index (see robots.ts).
 * Updates whenever public content is listed from the live DB + seed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { entities, publications } = await getPublicData();

  const staticRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/home", changeFrequency: "daily", priority: 0.95 },
    { path: "/explore", changeFrequency: "daily", priority: 0.95 },
    { path: "/search", changeFrequency: "daily", priority: 0.8 },
  ];

  const pubEntries = publications.map((publication) => {
    const lastMod = publication.updatedAt || publication.publishedAt;
    return {
      url: `${baseUrl}${publicationPath(publication)}`,
      lastModified: lastMod ? new Date(lastMod) : now,
      changeFrequency: "weekly" as const,
      priority:
        publication.type === "research" || publication.type === "article"
          ? 0.8
          : 0.75,
    };
  });

  const entityEntries = entities.map((entity) => ({
    url: `${baseUrl}${entityPath(entity)}`,
    lastModified: entity.publishedAt
      ? new Date(entity.publishedAt)
      : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryEntries = DISCOVERY_CATEGORIES.map((category) => ({
    url: `${baseUrl}/explore/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...entityEntries,
    ...pubEntries,
    ...categoryEntries,
  ];
}
