import type { MetadataRoute } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/p/",
          "/research/",
          "/music/",
          "/video/",
          "/product/",
          "/event/",
          "/opportunity/",
          "/e/",
          "/explore/",
          "/home",
          "/search",
        ],
        disallow: [
          "/api/",
          "/accounts",
          "/activity",
          "/activate",
          "/admin",
          "/analytics",
          "/artist-brain",
          "/catalogue",
          "/content",
          "/crm",
          "/dashboard",
          "/discover",
          "/g/",
          "/help",
          "/label",
          "/login",
          "/notifications",
          "/onboarding",
          "/drafts",
          "/following",
          "/followers",
          "/saved",
          "/opportunities",
          "/pricing",
          "/promote",
          "/publish",
          "/publications",
          "/profile",
          "/settings",
          "/signup",
          "/verify",
          "/leads",
          "/ziki",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
