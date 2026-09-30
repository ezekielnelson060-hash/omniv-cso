/**
 * Omniv SEO architecture helpers.
 * Public publications are real, crawlable pages — not SPA-only content.
 * Designed for discoverability by search engines; does not guarantee rankings.
 */

import type { Metadata } from "next";
import {
  PUBLICATION_LABELS,
  publicationPath,
  publicationCanonicalUrl,
  entityPath,
  type Publication,
  type PublicationType,
  type DiscoveryEntity,
} from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";

export const DISCOVERY_CATEGORIES = [
  { slug: "world", label: "World", description: "Reporting and analysis about the forces shaping countries, diplomacy, and global affairs." },
  { slug: "power", label: "Power", description: "The institutions, alliances, and decisions that determine who can shape what happens next." },
  { slug: "technology", label: "Technology", description: "The companies, systems, and infrastructure changing how the world works." },
  { slug: "money", label: "Money", description: "Trade, capital, industry, and the economic systems behind public life." },
  { slug: "africa", label: "Africa", description: "Ideas, people, companies, and systems shaping Africa and its future." },
  { slug: "history", label: "History", description: "The events and patterns that make the present easier to understand." },
  { slug: "people", label: "People", description: "The people, institutions, and decisions behind consequential stories." },
  { slug: "research", label: "Research", description: "Evidence-led work that explains a system, not just a headline." },
  { slug: "explained", label: "Explained", description: "Clear, source-checked explanations of complex systems and turning points." },
] as const;

export function getDiscoveryCategory(slug: string) {
  return DISCOVERY_CATEGORIES.find((category) => category.slug === slug.toLowerCase());
}

const ORIGIN = () =>
  (process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media").replace(/\/$/, "");

/** Clamp description to a useful meta length. */
export function seoDescriptionFrom(
  ...candidates: (string | null | undefined)[]
): string {
  for (const c of candidates) {
    const t = (c || "").replace(/\s+/g, " ").trim();
    if (t.length >= 40) return t.slice(0, 160);
  }
  for (const c of candidates) {
    const t = (c || "").replace(/\s+/g, " ").trim();
    if (t.length > 0) return t.slice(0, 160);
  }
  return "Discover this publication on Omniv — the discovery network for the real world.";
}

/** Auto-generate SEO fields when a publisher publishes. */
export function buildPublicationSeo(input: {
  type: PublicationType | string;
  title: string;
  summary?: string;
  excerpt?: string;
  body?: string;
  tags?: string[];
  publisherName?: string;
  slug: string;
  coverUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}) {
  const typeLabel =
    PUBLICATION_LABELS[input.type as PublicationType] || "Publication";
  const seoTitle =
    (input.seoTitle || "").trim() ||
    `${input.title}`.slice(0, 70);
  const seoDescription = seoDescriptionFrom(
    input.seoDescription,
    input.excerpt,
    input.summary,
    input.body
  );
  const path = publicationPath({
    slug: input.slug,
    type: input.type as PublicationType,
  });
  const origin = ORIGIN();
  const canonicalUrl =
    (input.canonicalUrl || "").trim() || `${origin}${path}`;
  const ogImage =
    input.coverUrl ||
    coverFor(input.slug) ||
    `${origin}/opengraph-image`;
  const keywords = [
    typeLabel,
    input.publisherName,
    ...(input.tags || []),
  ]
    .filter(Boolean)
    .map((k) => String(k).trim())
    .filter((k) => k.length > 1)
    .slice(0, 12);

  return {
    seoTitle,
    seoDescription,
    canonicalUrl,
    path,
    ogImage,
    keywords,
    typeLabel,
  };
}

/** Next.js Metadata for a public publication page. */
export function publicationMetadata(p: Publication): Metadata {
  const origin = ORIGIN();
  const seo = buildPublicationSeo({
    type: p.type,
    title: p.title,
    summary: p.summary,
    excerpt: p.excerpt,
    body: p.body,
    tags: p.tags,
    publisherName: p.publisherName,
    slug: p.slug,
    coverUrl: p.coverUrl,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    canonicalUrl: p.canonicalUrl,
  });
  const url = seo.canonicalUrl;

  return {
    title: seo.seoTitle,
    description: seo.seoDescription,
    keywords: seo.keywords,
    metadataBase: new URL(origin),
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: seo.seoTitle,
      description: seo.seoDescription,
      url,
      type: "article",
      siteName: "Omniv",
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: p.title }],
      publishedTime: p.publishedAt || undefined,
      modifiedTime: p.updatedAt || p.publishedAt || undefined,
      authors: p.publisherName ? [p.publisherName] : undefined,
      tags: p.tags?.length ? p.tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: "@omniv",
      creator: "@omniv",
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [seo.ogImage],
    },
  };
}

/** Next.js Metadata for a public entity page. */
export function entityMetadata(e: DiscoveryEntity): Metadata {
  const origin = ORIGIN();
  const path = entityPath(e);
  const url = `${origin}${path}`;
  const title = e.name;
  const description = seoDescriptionFrom(e.tagline, e.about);
  const image =
    e.avatarUrl || e.coverUrl || coverFor(e.slug) || `${origin}/opengraph-image`;

  return {
    title,
    description,
    keywords: [e.type, e.name, e.location, ...(e.tags || [])].filter(Boolean) as string[],
    metadataBase: new URL(origin),
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: "Omniv",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@omniv",
      title,
      description,
      images: [image],
    },
  };
}

/** schema.org JSON-LD for a publication. */
export function publicationJsonLd(p: Publication, origin = ORIGIN()) {
  const url = publicationCanonicalUrl(p, origin);
  const image =
    p.coverUrl || coverFor(p.slug) || `${origin}/opengraph-image`;
  const typeMap: Record<string, string> = {
    article: "Article",
    announcement: "Article",
    research: "ScholarlyArticle",
    music: "MusicRecording",
    video: "VideoObject",
    product: "Product",
    event: "Event",
    opportunity: "Article",
    file: "DigitalDocument",
    image: "ImageObject",
  };
  const schemaType = typeMap[p.type] || "CreativeWork";

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: p.title,
    name: p.title,
    description: p.seoDescription || p.excerpt || p.summary,
    url,
    datePublished: p.publishedAt || undefined,
    dateModified: p.updatedAt || p.publishedAt || undefined,
    author: {
      "@type": "Organization",
      name: p.publisherName || "Publisher",
    },
    publisher: {
      "@type": "Organization",
      name: "Omniv",
      url: origin,
    },
    image,
    keywords: p.tags?.join(", ") || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  if (p.type === "product") {
    base["@type"] = "Product";
    base.name = p.title;
  }
  if (p.type === "event") {
    base["@type"] = "Event";
    base.name = p.title;
    base.startDate = p.publishedAt;
  }

  return base;
}

/** Product copy: discoverable ≠ ranking guarantee. */
export const SEO_DISCOVERABILITY_NOTE =
  "Public Omniv pages are designed to be discoverable by search engines. Publishing does not guarantee rankings.";
