/**
 * Device-local discovery graph for V1.
 * Follow entities · Save publications/entities
 * Later: migrate to Supabase follows/saves tables.
 */

export type FollowedRef = {
  type: string;
  slug: string;
  name: string;
  id?: string;
};

export type SavedItem = {
  kind: "entity" | "publication";
  type: string;
  slug: string;
  name: string;
  /** publication type when kind=publication */
  pubType?: string;
};

const FOLLOW_KEY = "omniv_follows";
const SAVE_KEY = "omniv_saved";

function readJSON<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeJSON<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function readFollows(): FollowedRef[] {
  return readJSON<FollowedRef>(FOLLOW_KEY);
}

export function isFollowing(type: string, slug: string): boolean {
  return readFollows().some((x) => x.type === type && x.slug === slug);
}

export function toggleFollow(ref: FollowedRef): boolean {
  const list = readFollows();
  const i = list.findIndex((x) => x.type === ref.type && x.slug === ref.slug);
  if (i >= 0) {
    list.splice(i, 1);
    writeJSON(FOLLOW_KEY, list);
    return false;
  }
  list.unshift(ref);
  writeJSON(FOLLOW_KEY, list.slice(0, 200));
  return true;
}

export function readSaved(): SavedItem[] {
  const raw = readJSON<SavedItem | { type: string; slug: string; name: string }>(SAVE_KEY);
  // migrate legacy entity-only format
  return raw.map((x) => {
    if ("kind" in x && x.kind) return x as SavedItem;
    return {
      kind: "entity" as const,
      type: x.type,
      slug: x.slug,
      name: x.name,
    };
  });
}

export function isSaved(kind: "entity" | "publication", type: string, slug: string): boolean {
  return readSaved().some(
    (x) => x.kind === kind && x.type === type && x.slug === slug
  );
}

export function toggleSave(item: SavedItem): boolean {
  const list = readSaved();
  const i = list.findIndex(
    (x) => x.kind === item.kind && x.type === item.type && x.slug === item.slug
  );
  if (i >= 0) {
    list.splice(i, 1);
    writeJSON(SAVE_KEY, list);
    return false;
  }
  list.unshift(item);
  writeJSON(SAVE_KEY, list.slice(0, 200));
  return true;
}
