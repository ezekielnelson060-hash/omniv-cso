/**
 * City demand brief — how many would show up, ticket, venue size.
 * Format: "[City]: 80 fans, 15% intent-to-attend, optimal ticket $5, recommended venue: 50-cap coffee shop."
 */

export type FanCityRow = {
  city: string;
  count: number;
  wouldAttend?: number;
};

export type CityDemandBrief = {
  city: string;
  fans: number;
  intentPct: number;
  addressable: number;
  optimalTicketUsd: number;
  recommendedCap: number;
  venueLabel: string;
  line: string;
  expectedRevenueUsd: number;
};

function venueForCapacity(cap: number): string {
  if (cap <= 25) return `${cap}-cap living-room / café corner`;
  if (cap <= 50) return `${cap}-cap coffee shop`;
  if (cap <= 100) return `${cap}-cap bar / listening room`;
  if (cap <= 200) return `${cap}-cap club`;
  return `${cap}-cap hall`;
}

function ticketForDemand(addressable: number, fans: number): number {
  if (addressable >= 80) return 12;
  if (addressable >= 40) return 8;
  if (addressable >= 20) return 5;
  if (addressable >= 10) return 5;
  if (fans >= 30) return 5;
  if (fans >= 10) return 3;
  return 0;
}

export function briefForCity(row: FanCityRow): CityDemandBrief {
  const fans = Math.max(0, row.count);
  const ready = Math.max(0, row.wouldAttend ?? 0);
  let intentPct = fans > 0 ? Math.round((ready / fans) * 100) : 0;
  if (fans >= 5 && ready === 0) intentPct = 12;
  if (fans > 0 && ready === 0 && fans < 5) intentPct = 20;

  const addressable = Math.max(
    ready,
    Math.round((fans * intentPct) / 100)
  );

  const optimalTicketUsd = ticketForDemand(addressable, fans);
  let recommendedCap = Math.max(
    15,
    Math.min(
      200,
      Math.round(addressable * 0.85) || Math.round(fans * 0.4) || 20
    )
  );
  const steps = [15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200];
  recommendedCap =
    steps.find((s) => s >= recommendedCap) || recommendedCap;

  const venueLabel = venueForCapacity(recommendedCap);
  const expectedRevenueUsd =
    optimalTicketUsd > 0
      ? Math.round(Math.min(addressable, recommendedCap) * optimalTicketUsd)
      : 0;

  const ticketBit =
    optimalTicketUsd > 0
      ? `optimal ticket $${optimalTicketUsd}`
      : "start free + tip jar";

  const line = `${row.city}: ${fans} fans, ${intentPct}% intent-to-attend, ${ticketBit}, recommended venue: ${venueLabel}.`;

  return {
    city: row.city,
    fans,
    intentPct,
    addressable,
    optimalTicketUsd,
    recommendedCap,
    venueLabel,
    line,
    expectedRevenueUsd,
  };
}

export function rankCityBriefs(
  rows: FanCityRow[],
  limit = 5
): CityDemandBrief[] {
  return rows
    .filter((r) => r.city && r.count > 0)
    .map(briefForCity)
    .sort(
      (a, b) =>
        b.addressable - a.addressable ||
        b.fans - a.fans ||
        b.intentPct - a.intentPct
    )
    .slice(0, limit);
}
