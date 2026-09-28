/**
 * User interest vector — onboarding seed + behavior updates (V2).
 * Stored locally until user interest table ships.
 */

const KEY = "omniv_interests";
const DONE_KEY = "omniv_interests_done";

export const INTEREST_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Technology",
    items: ["AI", "Robotics", "Infrastructure", "Software", "Energy"],
  },
  {
    label: "Business",
    items: ["Startups", "Investing", "Markets", "Entrepreneurship", "Product"],
  },
  {
    label: "Culture",
    items: ["Music", "Film", "Art", "Fashion", "Design"],
  },
  {
    label: "World",
    items: ["Politics", "Geopolitics", "Science", "History", "Climate"],
  },
  {
    label: "Africa",
    items: ["Nigeria", "Ghana", "Kenya", "African technology", "African business"],
  },
];

export const ALL_INTERESTS = INTEREST_GROUPS.flatMap((g) => g.items);

export function readInterests(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeInterests(interests: string[]) {
  if (typeof window === "undefined") return;
  const unique = [...new Set(interests.map((s) => s.trim()).filter(Boolean))];
  localStorage.setItem(KEY, JSON.stringify(unique.slice(0, 20)));
  localStorage.setItem(DONE_KEY, "1");
}

export function hasCompletedInterests(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(DONE_KEY) === "1" || readInterests().length > 0;
}

/** Alias used by the V2 home feed to describe an initialized explorer vector. */
export function interestsChosen(): boolean {
  return hasCompletedInterests();
}

/** Score 0–1 for how well a publication matches interest tags */
export function interestMatchScore(
  tags: string[],
  category: string | undefined,
  interests: string[]
): number {
  if (!interests.length) return 0.35; // cold start neutral
  const hay = [...tags, category || ""].map((t) => t.toLowerCase());
  let hits = 0;
  for (const interest of interests) {
    const needle = interest.toLowerCase();
    if (hay.some((h) => h.includes(needle) || needle.includes(h))) hits += 1;
  }
  return Math.min(1, hits / Math.max(2, Math.min(interests.length, 5)));
}
