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
      publications: await listLivePublications(supabase, 200),
    };
  } catch {
    return { entities: SEED_ENTITIES, publications: SEED_PUBLICATIONS };
  }
}

/** Public routes only — auth, checkout, and application surfaces stay out of the index. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { entities, publications } = await getPublicData();
  const staticRoutes = [
    { path: "/", changeFrequency: "daily" as const, priority: 1 },
    { path: "/home", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/explore", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/publish", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/verify", changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...entities.map((entity) => ({
      url: `${baseUrl}${entityPath(entity)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...publications.map((publication) => ({
      url: `${baseUrl}${publicationPath(publication)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...DISCOVERY_CATEGORIES.map((category) => ({
      url: `${baseUrl}/explore/${category.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
