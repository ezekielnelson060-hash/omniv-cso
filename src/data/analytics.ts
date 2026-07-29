/** Mock time-series for Historical Analytics */

export type AnalyticsRange = "daily" | "weekly" | "monthly" | "yearly";

export interface AnalyticsPoint {
  label: string;
  followers: number;
  streams: number;
  engagement: number;
  reach: number;
  posts: number;
  videos: number;
}

export interface PeriodCompare {
  metric: string;
  current: number;
  previous: number;
  deltaPct: number;
}

function seed(n: number, base: number, volatility: number) {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v = Math.max(0, v + (Math.sin(i * 0.7) * volatility + (i % 5) - 2));
    out.push(Math.round(v));
  }
  return out;
}

export function buildSeries(range: AnalyticsRange): AnalyticsPoint[] {
  const configs: Record<
    AnalyticsRange,
    { n: number; label: (i: number) => string; base: number }
  > = {
    daily: {
      n: 14,
      label: (i) => `D${i + 1}`,
      base: 4200,
    },
    weekly: {
      n: 12,
      label: (i) => `W${i + 1}`,
      base: 28000,
    },
    monthly: {
      n: 12,
      label: (i) =>
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]!,
      base: 110000,
    },
    yearly: {
      n: 5,
      label: (i) => String(2022 + i),
      base: 900000,
    },
  };

  const c = configs[range];
  const streams = seed(c.n, c.base, c.base * 0.04);
  const followers = seed(c.n, c.base * 0.35, c.base * 0.02);
  const engagement = seed(c.n, c.base * 0.08, c.base * 0.01);
  const reach = seed(c.n, c.base * 1.4, c.base * 0.06);
  const posts = seed(c.n, range === "daily" ? 3 : range === "weekly" ? 12 : 40, 2);
  const videos = seed(c.n, range === "daily" ? 1 : range === "weekly" ? 4 : 15, 1);

  return Array.from({ length: c.n }, (_, i) => ({
    label: c.label(i),
    followers: followers[i]!,
    streams: streams[i]!,
    engagement: engagement[i]!,
    reach: reach[i]!,
    posts: posts[i]!,
    videos: videos[i]!,
  }));
}

export function comparePeriods(series: AnalyticsPoint[]): PeriodCompare[] {
  if (series.length < 4) return [];
  const mid = Math.floor(series.length / 2);
  const prev = series.slice(0, mid);
  const curr = series.slice(mid);

  const sum = (arr: AnalyticsPoint[], key: keyof AnalyticsPoint) =>
    arr.reduce((a, p) => a + (typeof p[key] === "number" ? (p[key] as number) : 0), 0);

  const metrics: { metric: string; key: keyof AnalyticsPoint }[] = [
    { metric: "Streams", key: "streams" },
    { metric: "Followers gained", key: "followers" },
    { metric: "Engagement", key: "engagement" },
    { metric: "Reach", key: "reach" },
    { metric: "Posts", key: "posts" },
    { metric: "Videos", key: "videos" },
  ];

  return metrics.map(({ metric, key }) => {
    const current = sum(curr, key);
    const previous = sum(prev, key);
    const deltaPct =
      previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10;
    return { metric, current, previous, deltaPct };
  });
}

export function formatMetric(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}
