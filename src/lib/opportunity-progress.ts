/** Client-side opportunity progress — completed IDs reshape ranking + Ziki context */

export type OppProgress = {
  completed: Record<string, number>;
  dismissed: Record<string, number>;
};

const KEY = "omniv_opp_progress_v1";

export function loadOppProgress(): OppProgress {
  if (typeof window === "undefined") return { completed: {}, dismissed: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<OppProgress>;
    return {
      completed: raw.completed || {},
      dismissed: raw.dismissed || {},
    };
  } catch {
    return { completed: {}, dismissed: {} };
  }
}

function save(p: OppProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  try {
    window.dispatchEvent(new CustomEvent("omniv-opp-progress", { detail: p }));
  } catch {
    /* ignore */
  }
}

export function markOpportunityDone(id: string) {
  const p = loadOppProgress();
  p.completed[id] = Date.now();
  delete p.dismissed[id];
  save(p);
  return p;
}

export function markOpportunityDismissed(id: string) {
  const p = loadOppProgress();
  p.dismissed[id] = Date.now();
  save(p);
  return p;
}

export function reopenOpportunity(id: string) {
  const p = loadOppProgress();
  delete p.completed[id];
  delete p.dismissed[id];
  save(p);
  return p;
}

export function isOpportunityDone(id: string, p?: OppProgress) {
  return Boolean((p || loadOppProgress()).completed[id]);
}

export function completedIds(p?: OppProgress): string[] {
  return Object.keys((p || loadOppProgress()).completed);
}

export function opportunityProgressForZiki(): string {
  const p = loadOppProgress();
  const done = Object.entries(p.completed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, at]) => `${id} (done ${new Date(at).toISOString().slice(0, 10)})`);
  if (!done.length) return "No opportunities marked done yet.";
  return `Opportunities the artist marked DONE (do not re-push these as #1 unless they reopen): ${done.join("; ")}`;
}
