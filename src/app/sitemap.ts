import type { MetadataRoute } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
).replace(/\/$/, "");

/** Public routes only — auth app surfaces stay out of the index. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const blogSlugs = [
    "you-dont-need-more-fans",
    "how-to-find-your-best-fan-city",
    "how-many-fans-to-sell-out-a-show",
    "how-to-host-your-first-listening-party",
    "how-to-build-an-owned-fanbase",
    "ai-tools-for-musicians-what-ai-should-do",
    "make-money-without-only-streaming",
  ];

  const blogRoutes = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/audit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/data-deletion`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...blogRoutes,
  ];
}
