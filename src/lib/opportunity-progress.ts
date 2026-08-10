/** Client-side opportunity progress — completed IDs reshape ranking + Ziki context.
 *  Also mirrors to server via /api/opportunity-progress when signed in.
 */

import { track } from "@/lib/analytics";

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

function mirrorServer(
  opportunityId: string,
  action: "done" | "dismiss" | "reopen"
) {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/opportunity-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, action }),
    });
  } catch {
    /* soft — local is source of truth for ranking this session */
  }
}

export function markOpportunityDone(id: string) {
  const p = loadOppProgress();
  p.completed[id] = Date.now();
  delete p.dismissed[id];
  save(p);
  track("opp_done", { opportunity_id: id });
  mirrorServer(id, "done");
  return p;
}

export function markOpportunityDismissed(id: string) {
  const p = loadOppProgress();
  p.dismissed[id] = Date.now();
  save(p);
  track("opp_dismissed", { opportunity_id: id });
  mirrorServer(id, "dismiss");
  return p;
}

export function reopenOpportunity(id: string) {
  const p = loadOppProgress();
  delete p.completed[id];
  delete p.dismissed[id];
  save(p);
  track("opp_reopen", { opportunity_id: id });
  mirrorServer(id, "reopen");
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
