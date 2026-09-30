/** Promote campaign config — budget = daily rate × duration (global distribution). */

export const PROMOTE_AUDIENCES = [
  "AI & Research",
  "Technology",
  "Business",
  "Founders",
  "Investors",
  "Creators",
  "Music",
  "Culture",
  "Media",
  "Policy",
  "Design",
  "Students",
] as const;

/** Worldwide first — Africa is an audience option, not the product identity. */
export const PROMOTE_REGIONS: { id: string; label: string; group: string }[] = [
  { id: "global", label: "Worldwide", group: "Global" },
  { id: "usa", label: "United States", group: "Americas" },
  { id: "uk", label: "United Kingdom", group: "Europe" },
  { id: "canada", label: "Canada", group: "Americas" },
  { id: "germany", label: "Germany", group: "Europe" },
  { id: "france", label: "France", group: "Europe" },
  { id: "europe", label: "Europe (all)", group: "Europe" },
  { id: "north-america", label: "North America", group: "Americas" },
  { id: "brazil", label: "Brazil", group: "Americas" },
  { id: "nigeria", label: "Nigeria", group: "Africa" },
  { id: "kenya", label: "Kenya", group: "Africa" },
  { id: "ghana", label: "Ghana", group: "Africa" },
  { id: "south-africa", label: "South Africa", group: "Africa" },
  { id: "egypt", label: "Egypt", group: "Africa" },
  { id: "africa", label: "Africa (all)", group: "Africa" },
  { id: "india", label: "India", group: "Asia & Pacific" },
  { id: "uae", label: "United Arab Emirates", group: "Asia & Pacific" },
  { id: "singapore", label: "Singapore", group: "Asia & Pacific" },
  { id: "australia", label: "Australia", group: "Asia & Pacific" },
  { id: "asia", label: "Asia (all)", group: "Asia & Pacific" },
];

export const PROMOTE_DAILY_RATES = [
  { id: "5", daily: 5, label: "$5/day" },
  { id: "10", daily: 10, label: "$10/day" },
  { id: "25", daily: 25, label: "$25/day" },
  { id: "50", daily: 50, label: "$50/day" },
] as const;

export const PROMOTE_DURATIONS = [
  { days: 1, label: "1 day" },
  { days: 3, label: "3 days" },
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
] as const;

export const PROMOTE_OBJECTIVES = [
  { id: "views", label: "More views" },
  { id: "readers", label: "More readers" },
  { id: "followers", label: "More followers" },
  { id: "visits", label: "More profile visits" },
  { id: "engagement", label: "More engagement" },
] as const;

export function estimatePromoteReach(daily: number, days: number) {
  const low = Math.round(daily * days * 180);
  const high = Math.round(daily * days * 420);
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
  return `${fmt(low)}–${fmt(high)} people`;
}

export function promoteTotal(daily: number, days: number) {
  return daily * days;
}
