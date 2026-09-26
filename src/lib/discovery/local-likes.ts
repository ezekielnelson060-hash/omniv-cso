const LIKE_KEY = "omniv_likes";
const COUNT_KEY = "omniv_like_counts";

type LikeRef = { slug: string; type: string };

function readList(): LikeRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKE_KEY);
    return raw ? (JSON.parse(raw) as LikeRef[]) : [];
  } catch {
    return [];
  }
}

function writeList(items: LikeRef[]) {
  localStorage.setItem(LIKE_KEY, JSON.stringify(items.slice(0, 500)));
}

function readCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COUNT_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeCounts(c: Record<string, number>) {
  localStorage.setItem(COUNT_KEY, JSON.stringify(c));
}

export function isLiked(slug: string): boolean {
  return readList().some((x) => x.slug === slug);
}

export function getLocalLikeCount(slug: string, base = 0): number {
  const counts = readCounts();
  return Math.max(base, counts[slug] ?? base);
}

/** Toggle local like; returns { liked, count } */
export function toggleLocalLike(
  slug: string,
  type: string,
  baseCount = 0
): { liked: boolean; count: number } {
  const list = readList();
  const counts = readCounts();
  const i = list.findIndex((x) => x.slug === slug);
  const current = counts[slug] ?? baseCount;

  if (i >= 0) {
    list.splice(i, 1);
    writeList(list);
    counts[slug] = Math.max(0, current - 1);
    writeCounts(counts);
    return { liked: false, count: counts[slug] };
  }

  list.unshift({ slug, type });
  writeList(list);
  counts[slug] = current + 1;
  writeCounts(counts);
  return { liked: true, count: counts[slug] };
}
