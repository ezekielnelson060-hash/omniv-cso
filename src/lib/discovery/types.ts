export type EntityType =
  | "person"
  | "artist"
  | "company"
  | "brand"
  | "product"
  | "project"
  | "organization"
  | "place";

export type PublicationType =
  | "article"
  | "music"
  | "video"
  | "image"
  | "file"
  | "research"
  | "announcement"
  | "event"
  | "opportunity"
  | "product";

export const PUBLICATION_TYPES: PublicationType[] = [
  "article",
  "music",
  "video",
  "image",
  "file",
  "research",
  "announcement",
  "event",
  "opportunity",
  "product",
];

export const ENTITY_LABELS: Record<string, string> = {
  person: "Person",
  artist: "Artist",
  company: "Company",
  brand: "Brand",
  product: "Product",
  project: "Project",
  organization: "Organization",
  place: "Place",
};

export const PUBLICATION_LABELS: Record<PublicationType, string> = {
  article: "Article",
  music: "Music",
  video: "Video",
  image: "Image",
  file: "File",
  research: "Research",
  announcement: "Announcement",
  event: "Event",
  opportunity: "Opportunity",
  product: "Product",
};

export type DiscoveryEntity = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  handle?: string;
  about?: string;
  location?: string;
  website?: string;
  tags?: string[];
  verified?: boolean;
  coverUrl?: string;
  avatarUrl?: string;
  heat?: number;
};

export type EntityReference = {
  type?: string;
  slug: string;
  label?: string;
};

export type ArticleSource = {
  label: string;
  href?: string;
};

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: number }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "callout"; title?: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "entity-reference"; slug: string; label: string; entityType?: string };

export type Publication = {
  id: string;
  type: PublicationType;
  slug: string;
  title: string;
  summary: string;
  body?: string;
  subtitle?: string;
  excerpt?: string;
  content?: ArticleContentBlock[];
  entityRefs?: EntityReference[];
  relatedPublicationIds?: string[];
  sources?: ArticleSource[];
  readingTime?: number;
  whatThisMeans?: string;
  questionNobodyAsks?: string;
  status?: "draft" | "published" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  updatedAt?: string;
  /** publisher entity id */
  publisherId: string;
  publisherName?: string;
  category?: string;
  location?: string;
  tags: string[];
  /** e.g. "8 min read", "PDF · 42 pages", "Single" */
  meta?: string;
  cta?: { label: string; href: string };
  publishedAt: string;
  heat?: number;
  coverUrl?: string;
  mediaUrl?: string;
};

export function entityPath(e: Pick<DiscoveryEntity, "type" | "slug">) {
  return `/e/${e.type}/${e.slug}`;
}

export function publicationPath(p: Pick<Publication, "slug">) {
  return `/p/${p.slug}`;
}

export const EXPLORE_FILTERS = [
  { label: "Companies", href: "/explore?publisher=company" },
  { label: "People", href: "/explore?publisher=person" },
  { label: "Artists", href: "/explore?publisher=artist" },
  { label: "Projects", href: "/explore?publisher=project" },
];
