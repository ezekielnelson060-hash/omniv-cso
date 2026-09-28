/**
 * Saved collections — personal library folders (V1 local).
 */

export type Collection = {
  id: string;
  name: string;
  /** publication/entity keys: kind:type:slug */
  items: string[];
  createdAt: number;
};

const KEY = "omniv_collections";

function readAll(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: Collection[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 40)));
}

export function listCollections(): Collection[] {
  return readAll();
}

export function createCollection(name: string): Collection {
  const c: Collection = {
    id: `col_${Date.now().toString(36)}`,
    name: name.trim().slice(0, 48) || "Untitled",
    items: [],
    createdAt: Date.now(),
  };
  writeAll([c, ...readAll()]);
  return c;
}

export function deleteCollection(id: string) {
  writeAll(readAll().filter((c) => c.id !== id));
}

export function renameCollection(id: string, name: string) {
  const nextName = name.trim().slice(0, 48);
  if (!nextName) return;
  const list = readAll();
  const c = list.find((x) => x.id === id);
  if (!c) return;
  c.name = nextName;
  writeAll(list);
}

export function addToCollection(collectionId: string, itemKey: string) {
  const list = readAll();
  const c = list.find((x) => x.id === collectionId);
  if (!c) return;
  if (!c.items.includes(itemKey)) c.items.unshift(itemKey);
  c.items = c.items.slice(0, 100);
  writeAll(list);
}

export function removeFromCollection(collectionId: string, itemKey: string) {
  const list = readAll();
  const c = list.find((x) => x.id === collectionId);
  if (!c) return;
  c.items = c.items.filter((k) => k !== itemKey);
  writeAll(list);
}

export function itemKey(
  kind: "entity" | "publication",
  type: string,
  slug: string
) {
  return `${kind}:${type}:${slug}`;
}
