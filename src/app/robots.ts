import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/accounts",
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
          "/opportunities",
          "/pricing",
          "/promote",
          "/publish",
          "/release-simulator",
          "/reports",
          "/settings",
          "/signup",
          "/verify",
          "/ziki",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
