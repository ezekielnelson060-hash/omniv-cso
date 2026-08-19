/**
 * Market Demand Score — verify where demand is real from owned fan signals.
 * DETECT (fans + city + intent) → VERIFY (score) → ACT (room brief) → MEASURE (later).
 */

import {
  briefForCity,
  rankCityBriefs,
  type CityDemandBrief,
  type FanCityRow,
} from "@/lib/strategy/city-demand";

export type MarketDemandLevel =
  | "verified"
  | "emerging"
  | "weak"
  | "insufficient";

export type CityMarketScore = CityDemandBrief & {
  /** 0–100 composite demand score */
  score: number;
  level: MarketDemandLevel;
  confidence: "high" | "medium" | "low";
  why: string[];
};

export type MarketDemandReport = {
  generatedAt: string;
  totalFans: number;
  fansWithCity: number;
  intentCount: number;
  cities: CityMarketScore[];
  top: CityMarketScore | null;
  recommendation: string;
  emptyReason?: string;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Score one city from owned fan counts + intent. */
export function scoreCity(row: FanCityRow): CityMarketScore {
  const brief = briefForCity(row);
  const fans = brief.fans;
  const ready = Math.max(0, row.wouldAttend ?? 0);
  const intentPct = brief.intentPct;
  const addressable = brief.addressable;

  const density = clamp(Math.log10(fans + 1) * 38);
  const intent = clamp(intentPct);
  const action = clamp(Math.log10(addressable + 1) * 42);
  let confidence: "high" | "medium" | "low" = "low";
  if (fans >= 40 && ready >= 8) confidence = "high";
  else if (fans >= 15 || ready >= 4) confidence = "medium";

  const score = clamp(density * 0.28 + intent * 0.37 + action * 0.35);

  let level: MarketDemandLevel = "insufficient";
  if (fans < 3 && ready < 2) level = "insufficient";
  else if (score >= 70 && addressable >= 15) level = "verified";
  else if (score >= 45 || addressable >= 8) level = "emerging";
  else level = "weak";

  const why: string[] = [];
  if (fans > 0) why.push(`${fans} fans tagged in this city`);
  if (ready > 0) why.push(`${ready} marked would attend`);
  else if (fans >= 5)
    why.push(
      "intent not captured yet — Fan Gate would attend raises score"
    );
  if (brief.optimalTicketUsd > 0) {
    why.push(
      `test a ${brief.recommendedCap}-cap room @ $${brief.optimalTicketUsd}`
    );
  } else {
    why.push("start free + tip jar until intent is clearer");
  }

  return {
    ...brief,
    score,
    level,
    confidence,
    why,
  };
}

export function buildMarketDemandReport(rows: FanCityRow[]): MarketDemandReport {
  const totalFans = rows.reduce((s, r) => s + r.count, 0);
  const fansWithCity = rows
    .filter((r) => r.city && r.city !== "Unknown")
    .reduce((s, r) => s + r.count, 0);
  const intentCount = rows.reduce((s, r) => s + (r.wouldAttend || 0), 0);

  const cities = rows
    .filter((r) => r.city && r.count > 0)
    .map(scoreCity)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.addressable - a.addressable ||
        b.fans - a.fans
    );

  const top = cities[0] || null;

  let recommendation: string;
  let emptyReason: string | undefined;

  if (!top || totalFans === 0) {
    emptyReason =
      "No fan cities yet. Share your Fan Gate link so people submit email + city + would attend.";
    recommendation =
      "Share Fan Gate → collect city + intent → re-run scan. Demand cannot be verified from followers alone.";
  } else if (top.level === "insufficient" || top.level === "weak") {
    recommendation = `Signals are thin in ${top.city}. Keep capturing fans with city + would attend, then test a small free room or tip link before spending on a large venue.`;
  } else if (top.level === "emerging") {
    recommendation = `${top.city} is emerging (${top.score}/100). Cheapest proof: open a ${top.recommendedCap}-cap room${top.optimalTicketUsd > 0 ? ` at $${top.optimalTicketUsd}` : " (free + tips)"}. Measure who shows up.`;
  } else {
    recommendation = `${top.city} shows verified demand (${top.score}/100, ${top.confidence} confidence). Act: ${top.recommendedCap}-cap room${top.optimalTicketUsd > 0 ? `, ~$${top.optimalTicketUsd} ticket` : ""}. Expected ballpark ~$${top.expectedRevenueUsd} if the room fills from known demand.`;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalFans,
    fansWithCity,
    intentCount,
    cities: cities.slice(0, 12),
    top,
    recommendation,
    emptyReason,
  };
}

/** Aggregate raw fan rows { city, would_attend } into FanCityRow[] */
export function aggregateFanCities(
  fans: { city?: string | null; would_attend?: boolean | null }[]
): FanCityRow[] {
  const map = new Map<string, { count: number; wouldAttend: number }>();
  for (const f of fans) {
    const city = (f.city || "").trim() || "Unknown";
    const cur = map.get(city) || { count: 0, wouldAttend: 0 };
    cur.count += 1;
    if (f.would_attend) cur.wouldAttend += 1;
    map.set(city, cur);
  }
  return [...map.entries()].map(([city, v]) => ({
    city,
    count: v.count,
    wouldAttend: v.wouldAttend,
  }));
}

export { rankCityBriefs, briefForCity };
