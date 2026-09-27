/**
 * Lightweight recommendation reasons + feedback controls (V1).
 * Client-side until interest graph is server-backed.
 */

import { readInterests, writeInterests } from "./interests";
import { readFollows } from "./local-graph";
import { SEED_ENTITIES } from "./seed";
import type { Publication } from "./types";

const MUTE_TOPICS_KEY = "omniv_mute_topics";
const MUTE_PUBS_KEY = "omniv_mute_publishers";
const LESS_KEY = "omniv_less_like";
const MORE_KEY = "omniv_more_like";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify([...new Set(items)].slice(0, 80)));
}

export function getMutedTopics(): string[] {
  return readList(MUTE_TOPICS_KEY);
}

export function getMutedPublishers(): string[] {
  return readList(MUTE_PUBS_KEY);
}

export function muteTopic(topic: string) {
  writeList(MUTE_TOPICS_KEY, [...getMutedTopics(), topic.toLowerCase()]);
}

export function mutePublisher(idOrSlug: string) {
  writeList(MUTE_PUBS_KEY, [...getMutedPublishers(), idOrSlug.toLowerCase()]);
}

export function moreLikeThis(pub: Publication) {
  const tags = [...(pub.tags || []), pub.category].filter(Boolean) as string[];
  const interests = readInterests();
  writeInterests([...interests, ...tags].slice(0, 20));
  const more = readList(MORE_KEY);
  writeList(MORE_KEY, [...more, pub.slug]);
}

export function lessLikeThis(pub: Publication) {
  const tags = (pub.tags || []).map((t) => t.toLowerCase());
  const interests = readInterests().filter(
    (i) => !tags.some((t) => t.includes(i.toLowerCase()) || i.toLowerCase().includes(t))
  );
  writeInterests(interests);
  const less = readList(LESS_KEY);
  writeList(LESS_KEY, [...less, pub.slug]);
  if (pub.tags?.[0]) muteTopic(pub.tags[0]);
}

export function isPublicationMuted(pub: Publication): boolean {
  const mutedTopics = getMutedTopics();
  const mutedPubs = getMutedPublishers();
  if (mutedPubs.includes((pub.publisherId || "").toLowerCase())) return true;
  if (mutedPubs.includes((pub.publisherName || "").toLowerCase())) return true;
  const tags = [...(pub.tags || []), pub.category || ""].map((t) => t.toLowerCase());
  if (tags.some((t) => mutedTopics.some((m) => t.includes(m) || m.includes(t)))) return true;
  if (readList(LESS_KEY).includes(pub.slug)) return true;
  return false;
}

/** Human-readable reason for Why am I seeing this? */
export function recommendationReason(
  pub: Publication,
  tab: string,
  interests: string[]
): string {
  if (tab === "following") {
    const name = pub.publisherName || "someone you follow";
    return `Because you follow ${name}.`;
  }
  if (tab === "trending") {
    return "Gaining attention across the network right now.";
  }
  if (tab === "rising") {
    return "Accelerating fast — rising on Omniv.";
  }
  if (tab === "new") {
    return "Fresh publication on the network.";
  }

  // For You
  const follows = readFollows();
  const publisher = SEED_ENTITIES.find((e) => e.id === pub.publisherId);
  const name = pub.publisherName || publisher?.name;
  if (name && follows.some((f) => f.name.toLowerCase() === name.toLowerCase() || f.slug === publisher?.slug)) {
    return `Because you follow ${name}.`;
  }

  const hay = [...(pub.tags || []), pub.category || ""].map((t) => t.toLowerCase());
  const matched = interests.filter((i) => {
    const n = i.toLowerCase();
    return hay.some((h) => h.includes(n) || n.includes(h));
  });
  if (matched.length >= 2) {
    return `Recommended because you're into ${matched.slice(0, 2).join(" and ")}.`;
  }
  if (matched.length === 1) {
    return `Matches your interest in ${matched[0]}.`;
  }
  if ((pub.heat ?? 0) > 70) {
    return "Popular with explorers on Omniv.";
  }
  return "Picked for you to discover something new.";
}

export const TRENDING_DIMENSIONS = [
  { id: "all", label: "Global" },
  { id: "Technology", label: "Technology" },
  { id: "Africa", label: "Africa" },
  { id: "Business", label: "Business" },
  { id: "Music", label: "Music" },
  { id: "Research", label: "Research" },
  { id: "AI", label: "AI" },
] as const;
