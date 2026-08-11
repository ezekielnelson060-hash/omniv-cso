import type { MetadataRoute } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://www.omniv.media"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/crm",
          "/dashboard",
          "/settings",
          "/ziki",
          "/notifications",
          "/opportunities",
          "/catalogue",
          "/content",
          "/analytics",
          "/artist-brain",
          "/label",
          "/reports",
          "/admin",
          "/onboarding",
          "/activate",
          "/release-simulator",
          "/discover",
          "/help",
          "/g/",
          "/tip/",
          "/f/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
