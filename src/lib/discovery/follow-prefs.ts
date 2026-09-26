/** Per-follow discovery subscription preferences */

export type FollowPrefKey =
  | "publications"
  | "research"
  | "products"
  | "opportunities"
  | "everything";

export type FollowPrefs = {
  publications: boolean;
  research: boolean;
  products: boolean;
  opportunities: boolean;
  everything: boolean;
};

const STORAGE_KEY = "omniv_follow_prefs";

export const DEFAULT_PREFS: FollowPrefs = {
  publications: true,
  research: true,
  products: true,
  opportunities: true,
  everything: false,
};

function prefKey(type: string, slug: string) {
  return `${type}:${slug}`;
}

function readAll(): Record<string, FollowPrefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FollowPrefs>) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, FollowPrefs>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getFollowPrefs(type: string, slug: string): FollowPrefs {
  const all = readAll();
  return all[prefKey(type, slug)] ?? { ...DEFAULT_PREFS };
}

export function setFollowPrefs(
  type: string,
  slug: string,
  prefs: FollowPrefs
) {
  const all = readAll();
  all[prefKey(type, slug)] = prefs;
  writeAll(all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omniv-follow-prefs", {
        detail: { type, slug, prefs },
      })
    );
  }
}

export function removeFollowPrefs(type: string, slug: string) {
  const all = readAll();
  delete all[prefKey(type, slug)];
  writeAll(all);
}

export const PREF_LABELS: { key: FollowPrefKey; label: string }[] = [
  { key: "publications", label: "New publications" },
  { key: "research", label: "Research" },
  { key: "products", label: "Products" },
  { key: "opportunities", label: "Opportunities" },
  { key: "everything", label: "Everything" },
];
