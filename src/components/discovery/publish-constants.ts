import type { PublicationType } from "@/lib/discovery/types";
import { PUBLICATION_LABELS } from "@/lib/discovery/types";

export const DRAFT_KEY = "omniv-create-draft";

export const GROUPS: { label: string; types: PublicationType[] }[] = [
  { label: "Content", types: ["article", "music", "video", "research"] },
  { label: "Things", types: ["product", "event", "file", "image"] },
  { label: "Signals", types: ["announcement", "opportunity"] },
];

export const TYPE_ICONS: Record<PublicationType, string> = {
  article: "📄",
  music: "♪",
  video: "▶",
  research: "▣",
  product: "◇",
  event: "📅",
  opportunity: "◎",
  announcement: "📣",
  file: "📁",
  image: "▧",
};

export const TYPE_INDEX: Record<PublicationType, number> = {
  article: 1,
  music: 2,
  video: 3,
  research: 4,
  product: 5,
  event: 6,
  announcement: 7,
  opportunity: 8,
  file: 9,
  image: 10,
};

export const TYPE_HEADLINES: Partial<
  Record<PublicationType, { title: string; sub: string }>
> = {
  article: { title: "Write an article", sub: "Long-form thinking worth discovering." },
  music: {
    title: "Publish a release",
    sub: "Song as a discovery gateway — not just a stream link.",
  },
  video: {
    title: "Publish a video",
    sub: "Context, chapters, and related world around the watch.",
  },
  research: {
    title: "Share research",
    sub: "Reports and findings the network can build on.",
  },
  product: {
    title: "List a product",
    sub: "Something people can discover and reach out about.",
  },
  event: {
    title: "Publish an event",
    sub: "Shows, launches, and gatherings with a place on the map.",
  },
  opportunity: {
    title: "Post an opportunity",
    sub: "Roles, partnerships, and open calls.",
  },
  announcement: {
    title: "Make an announcement",
    sub: "News that should travel with your identity.",
  },
  file: {
    title: "Share a file",
    sub: "Documents and assets people can find and save.",
  },
  image: {
    title: "Publish imagery",
    sub: "Visual work as a first-class publication.",
  },
};

export const inputCls =
  "mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40";
export const labelCls = "text-[12px] font-medium text-zinc-400";

export type Draft = {
  pubType: PublicationType;
  title: string;
  summary: string;
  subtitle: string;
  body: string;
  publisherName: string;
  tags: string;
  meta: string;
  ctaHref: string;
  genre: string;
  releaseDate: string;
  priceMode: "paid" | "contact";
  category: string;
  relatedEntities: string;
  seoTitle: string;
  seoDescription: string;
  eventDate: string;
  eventTime: string;
  location: string;
  oppType: string;
  deadline: string;
  requirements: string;
  coverUrl: string | null;
  mediaUrl: string | null;
  scheduledAt?: string;
};

export { PUBLICATION_LABELS };
