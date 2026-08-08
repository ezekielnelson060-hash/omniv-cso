import type { ArtistBrain, CatalogueRelease } from "@/types";

export type CalendarWindow = {
  id: string;
  weekLabel: string;
  startIso: string;
  score: number;
  verdict: "Go" | "Caution" | "Hold";
  reasons: string[];
  culturalHooks: string[];
};

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function weekLabel(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Predictive windows from calendar + catalogue. Model guidance, not private DSP. */
export function buildPredictiveReleaseCalendar(
  brain: ArtistBrain | null,
  releases: CatalogueRelease[] = [],
  from = new Date()
): CalendarWindow[] {
  const genre = brain?.genre?.filter((g) => g && g !== "TBD")[0] || "indie";
  const stage = brain?.careerStage || "emerging";
  const scheduled = releases.filter((r) => r.status === "scheduled");
  const windows: CalendarWindow[] = [];

  for (let w = 1; w <= 8; w++) {
    const start = addDays(from, w * 7);
    const day = start.getDay();
    const month = start.getMonth();
    const reasons: string[] = [];
    const culturalHooks: string[] = [];
    let score = 55;

    if (day === 5) {
      score += 12;
      reasons.push("Friday-aligned week — standard global consumption spike");
    } else if (day === 4) {
      score += 6;
      reasons.push("Thursday edge — good for soft launch / content priming");
    } else {
      score -= 4;
      reasons.push("Off-Friday alignment — needs stronger content runway");
    }

    if (month === 11) {
      score -= 10;
      reasons.push("December clutter — attention expensive");
      culturalHooks.push("Year-end playlists war");
    }
    if (month === 0) {
      score += 4;
      culturalHooks.push("New year intention traffic");
    }
    if (month >= 5 && month <= 7) {
      score += 3;
      culturalHooks.push("Summer listening outdoor / travel");
    }

    if (stage === "emerging") {
      score += 2;
      reasons.push("Emerging: prioritize owned list conversion over chart noise");
    }
    if (stage === "breakthrough") {
      score += 5;
      reasons.push("Breakthrough stage can absorb more competitive weeks");
    }

    if (scheduled.length > 0) {
      score -= 8;
      reasons.push(
        `${scheduled.length} scheduled release(s) in catalogue — avoid stacking`
      );
    }

    culturalHooks.push(`${genre} micro-moments — verify with Ziki live search`);

    let verdict: CalendarWindow["verdict"] = "Caution";
    if (score >= 70) verdict = "Go";
    else if (score < 50) verdict = "Hold";

    windows.push({
      id: `w${w}-${start.toISOString().slice(0, 10)}`,
      weekLabel: weekLabel(start),
      startIso: start.toISOString(),
      score: Math.max(0, Math.min(100, Math.round(score))),
      verdict,
      reasons,
      culturalHooks,
    });
  }

  return windows.sort((a, b) => b.score - a.score);
}
