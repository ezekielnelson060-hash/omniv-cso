/**
 * Rising topics — human labels + scored ranking for home "Rising now".
 */

export type RisingTopic = {
  key: string;
  label: string;
  score: number;
  /** 0–1 relative momentum for UI */
  momentum: number;
  source: "signals" | "publications" | "mixed";
};

/** artificial-intelligence → Artificial intelligence */
export function humanizeTopic(raw: string): string {
  const s = (raw || "").trim();
  if (!s) return "";
  const spaced = s
    .replace(/[_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return "";
  return spaced
    .split(" ")
    .map((w) => {
      if (w.length <= 2 && w === w.toUpperCase()) return w;
      if (/^(ai|ml|nft|dao|usa|uk|eu|un)$/i.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function normKey(raw: string): string {
  return (raw || "")
    .toLowerCase()
    .trim()
    .replace(/[_/]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Rank topics from publication tags (heat + mild freshness) and optional
 * signal momentum map (topic → weight from last 24–72h activity).
 */
export function rankRisingTopics(
  publications: {
    tags?: string[] | null;
    category?: string | null;
    heat?: number | null;
    publishedAt?: string | null;
  }[],
  signalMomentum: Record<string, number> = {},
  limit = 6
): RisingTopic[] {
  const scores = new Map<
    string,
    { pub: number; sig: number; labelRaw: string }
  >();

  const now = Date.now();

  for (const p of publications) {
    const heat = Math.min(1, Number(p.heat || 0) / 100);
    const ts = p.publishedAt ? Date.parse(p.publishedAt) : 0;
    const ageHours = ts ? Math.max(0, (now - ts) / 3_600_000) : 96;
    const freshness = Math.exp(-ageHours / 48);
    const pubWeight = heat * 0.55 + freshness * 0.45;

    const topics = [...(p.tags || []), p.category || ""].filter(Boolean);
    for (const t of topics) {
      const key = normKey(String(t));
      if (key.length < 3) continue;
      const cur = scores.get(key) || { pub: 0, sig: 0, labelRaw: String(t) };
      cur.pub += pubWeight;
      if (String(t).length > cur.labelRaw.length) cur.labelRaw = String(t);
      scores.set(key, cur);
    }
  }

  for (const [raw, weight] of Object.entries(signalMomentum)) {
    const key = normKey(raw);
    if (key.length < 3) continue;
    const cur = scores.get(key) || { pub: 0, sig: 0, labelRaw: raw };
    cur.sig += Math.max(0, Number(weight) || 0);
    scores.set(key, cur);
  }

  const ranked = [...scores.entries()]
    .map(([key, v]) => {
      // Signals dominate when present; publications fill cold start
      const score = v.sig > 0 ? v.sig * 0.7 + v.pub * 0.3 : v.pub;
      const source: RisingTopic["source"] =
        v.sig > 0 && v.pub > 0 ? "mixed" : v.sig > 0 ? "signals" : "publications";
      return {
        key,
        label: humanizeTopic(v.labelRaw || key),
        score,
        source,
        sig: v.sig,
        pub: v.pub,
      };
    })
    .filter((t) => t.label.length >= 2)
    .sort((a, b) => b.score - a.score);

  // Deduplicate near-identical labels
  const seen = new Set<string>();
  const unique: typeof ranked = [];
  for (const t of ranked) {
    const lk = t.label.toLowerCase();
    if (seen.has(lk)) continue;
    seen.add(lk);
    unique.push(t);
  }

  const max = unique[0]?.score || 1;
  return unique.slice(0, limit).map((t) => ({
    key: t.key,
    label: t.label,
    score: t.score,
    momentum: Math.max(0.08, Math.min(1, t.score / max)),
    source: t.source,
  }));
}

/** Hide section when ranking is empty or effectively static/weak */
export function shouldShowRising(topics: RisingTopic[]): boolean {
  if (topics.length < 2) return false;
  // Need at least some score differentiation or signal involvement
  const hasSignal = topics.some((t) => t.source !== "publications");
  const spread = topics[0]!.score - topics[topics.length - 1]!.score;
  if (hasSignal) return true;
  return topics[0]!.score > 0.15 && (topics.length >= 3 || spread > 0.02);
}
