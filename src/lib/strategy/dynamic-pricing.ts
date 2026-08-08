/** Demand-based ticket suggestion with floor/ceiling. */
export function suggestTicketPrice(input: {
  baseCents: number;
  rsvpCount: number;
  capacity: number;
  superfanShare?: number;
  floorCents?: number;
  ceilingCents?: number;
}): {
  suggestedCents: number;
  demandScore: number;
  rationale: string;
} {
  const cap = Math.max(1, input.capacity);
  const fill = input.rsvpCount / cap;
  let demand = Math.round(fill * 70 + (input.superfanShare || 0) * 30);
  demand = Math.max(0, Math.min(100, demand));

  let mult = 1;
  if (fill > 0.8) mult = 1.25;
  else if (fill > 0.5) mult = 1.1;
  else if (fill < 0.15) mult = 0.85;

  let suggested = Math.round(input.baseCents * mult);
  const floor = input.floorCents ?? Math.round(input.baseCents * 0.7);
  const ceil = input.ceilingCents ?? Math.round(input.baseCents * 1.5);
  suggested = Math.max(floor, Math.min(ceil, suggested));

  const rationale =
    fill > 0.8
      ? "High fill rate — room can support a premium without killing demand"
      : fill < 0.15
        ? "Slow fill — softer price or free + tip jar may convert better"
        : "Mid velocity — hold base price; push owned-list invites";

  return { suggestedCents: suggested, demandScore: demand, rationale };
}
