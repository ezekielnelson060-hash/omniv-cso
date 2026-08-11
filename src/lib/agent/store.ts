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
    if (p.status === "done" || p.status === "dismissed") {
      byId.set(p.id, p);
      continue;
    }
    if (prev?.status === "done" || prev?.status === "dismissed") continue;
    byId.set(p.id, p);
  }
  const merged = Array.from(byId.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  save(merged);
  return merged;
}

/** After Scan now: install new set; keep closed history + webhook signals. */
export function replacePendingFromScan(incoming: AgentProposal[]) {
  const existing = loadProposals();
  const kept = existing.filter(
    (p) =>
      p.status === "done" ||
      p.status === "dismissed" ||
      (p.status === "pending" &&
        typeof p.id === "string" &&
        p.id.startsWith("webhook-"))
  );
  const byId = new Map<string, AgentProposal>();
  for (const p of kept) byId.set(p.id, p);
  for (const p of incoming) byId.set(p.id, p);
  const final = Array.from(byId.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  save(final);
  return final;
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

export function clearStalePending() {
  const list = loadProposals().filter(
    (p) =>
      p.status !== "pending" ||
      p.id.startsWith("setup-") ||
      p.id.startsWith("room-") ||
      p.id.startsWith("dream-") ||
      p.id.startsWith("webhook-")
  );
  save(list);
  return list;
}
