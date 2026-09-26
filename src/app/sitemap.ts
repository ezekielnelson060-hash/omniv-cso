import type { MetadataRoute } from "next";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import { entityPath, publicationPath } from "@/lib/discovery/types";
import { listDiscoveryEntities, listLivePublications } from "@/lib/discovery/db";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media").replace(/\/$/, "");

async function getPublicData() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    return {
      entities: await listDiscoveryEntities(supabase),
      publications: await listLivePublications(supabase, 200),
    };
  } catch {
    return { entities: SEED_ENTITIES, publications: [] };
  }
}

/** Public routes only — auth, checkout, and application surfaces stay out of the index. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { entities, publications } = await getPublicData();
  const staticRoutes = [
    { path: "/", changeFrequency: "daily" as const, priority: 1 },
    { path: "/explore", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/partners", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.2 },
  ];
  const blogSlugs = [
    "you-dont-need-more-fans",
    "how-to-find-your-best-fan-city",
    "how-many-fans-to-sell-out-a-show",
    "how-to-host-your-first-listening-party",
    "how-to-build-an-owned-fanbase",
    "ai-tools-for-musicians-what-ai-should-do",
    "make-money-without-only-streaming",
  ];
  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route.path}`, lastModified: now, changeFrequency: route.changeFrequency, priority: route.priority })),
    ...entities.map((entity) => ({ url: `${baseUrl}${entityPath(entity)}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...publications.map((publication) => ({ url: `${baseUrl}${publicationPath(publication)}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.75 })),
    ...blogSlugs.map((slug) => ({ url: `${baseUrl}/blog/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
