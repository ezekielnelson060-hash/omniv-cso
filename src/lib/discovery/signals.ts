/**
 * Explorer signal graph — every action teaches Omniv.
 * V1: local weights that bias For You. V2: server interest table.
 */

const KEY = "omniv_signal_weights";
const EVENTS_KEY = "omniv_signal_events";

export type SignalKind =
  | "view"
  | "open"
  | "like"
  | "save"
  | "follow"
  | "share"
  | "search"
  | "complete"
  | "contact"
  | "skip";

const WEIGHTS: Record<SignalKind, number> = {
  view: 0.05,
  open: 0.35,
  like: 0.55,
  save: 1.0,
  follow: 1.2,
  share: 0.9,
  search: 0.7,
  complete: 0.85,
  contact: 1.1,
  skip: -0.25,
};

type WeightMap = Record<string, number>;

function readWeights(): WeightMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeWeights(w: WeightMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(w));
}

/** Boost topic tags from a publication interaction */
export function recordSignal(
  kind: SignalKind,
  tags: string[] = [],
  category?: string
) {
  if (typeof window === "undefined") return;
  const delta = WEIGHTS[kind] ?? 0.1;
  const w = readWeights();
  const topics = [...tags, category].filter(Boolean) as string[];
  for (const t of topics) {
    const key = t.toLowerCase().trim();
    if (!key) continue;
    w[key] = Math.max(-2, Math.min(5, (w[key] || 0) + delta));
  }
  writeWeights(w);

  try {
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
    if (Array.isArray(events)) {
      events.unshift({
        kind,
        tags: topics,
        at: Date.now(),
      });
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, 200)));
    }
  } catch {
    /* ignore */
  }

  // V2: best-effort server signal (authenticated explorers)
  try {
    void fetch("/api/discovery/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        tags: topics,
        category,
      }),
      keepalive: true,
    });
  } catch {
    /* offline / unauthenticated */
  }
}

/** Topic weight for ranking (0–1ish scaled) */
export function signalBoost(tags: string[], category?: string): number {
  const w = readWeights();
  if (!Object.keys(w).length) return 0;
  const topics = [...tags, category || ""].map((t) => t.toLowerCase());
  let sum = 0;
  let n = 0;
  for (const t of topics) {
    if (!t) continue;
    for (const [k, v] of Object.entries(w)) {
      if (t.includes(k) || k.includes(t)) {
        sum += v;
        n += 1;
      }
    }
  }
  if (!n) return 0;
  return Math.max(0, Math.min(1, (sum / n + 1) / 4));
}

/** Rising score: heat * freshness (velocity proxy until real events) */
export function risingScore(p: {
  heat?: number;
  publishedAt?: string;
}): number {
  const heat = Math.min(1, (p.heat ?? 0) / 100);
  const ts = p.publishedAt ? Date.parse(p.publishedAt) : 0;
  const ageHours = ts ? Math.max(0, (Date.now() - ts) / 3_600_000) : 72;
  const freshness = Math.exp(-ageHours / 36);
  const velocity = heat * freshness;
  return velocity * 0.65 + freshness * 0.25 + heat * 0.1;
}

/** Trending score: sustained engagement + mild freshness */
export function trendingScore(p: {
  heat?: number;
  publishedAt?: string;
}): number {
  const heat = Math.min(1, (p.heat ?? 0) / 100);
  const ts = p.publishedAt ? Date.parse(p.publishedAt) : 0;
  const ageDays = ts ? Math.max(0, (Date.now() - ts) / 86_400_000) : 14;
  const recency = Math.exp(-ageDays / 10);
  return heat * 0.75 + recency * 0.25;
}

export type SignalEvent = {
  kind: SignalKind;
  tags: string[];
  at: number;
};

export function getRecentSignals(limit = 100): SignalEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, limit) as SignalEvent[];
  } catch {
    return [];
  }
}

/** Qualified interactions — saves, follows, completes, contacts, shares */
export function countQualifiedInteractions(): number {
  const strong = new Set([
    "save",
    "follow",
    "complete",
    "contact",
    "share",
    "like",
  ]);
  return getRecentSignals(200).filter((e) => strong.has(e.kind)).length;
}
