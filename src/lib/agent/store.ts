import type { AgentProposal } from "@/lib/agent/types";

const KEY = "omniv_agent_proposals_v1";

export function loadProposals(): AgentProposal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as AgentProposal[];
  } catch {
    return [];
  }
}

function save(list: AgentProposal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 40)));
  try {
    window.dispatchEvent(new CustomEvent("omniv-agent", { detail: list }));
  } catch {
    /* ignore */
  }
}

export function setProposals(list: AgentProposal[]) {
  save(list);
}

export function upsertProposals(incoming: AgentProposal[]) {
  const existing = loadProposals();
  const byId = new Map(existing.map((p) => [p.id, p]));
  for (const p of incoming) {
    const prev = byId.get(p.id);
    // Server closed status always wins (survives localStorage clears)
    if (p.status === "done" || p.status === "dismissed") {
      byId.set(p.id, p);
      continue;
    }
    // Don't resurrect a locally confirmed/dismissed item as pending
    if (prev?.status === "done" || prev?.status === "dismissed") continue;
    byId.set(p.id, p);
  }
  const merged = Array.from(byId.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  save(merged);
  return merged;
}

export function markProposal(
  id: string,
  status: "done" | "dismissed" | "pending"
) {
  const list = loadProposals().map((p) =>
    p.id === id ? { ...p, status } : p
  );
  save(list);
  return list;
}

export function pendingCount(): number {
  return loadProposals().filter((p) => p.status === "pending").length;
}
