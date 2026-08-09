import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentProposal } from "@/lib/agent/types";

/** Append one proposal to a user's agent_inbox (service role). Dedupes by id. */
export async function pushAgentProposal(
  admin: SupabaseClient,
  userId: string,
  proposal: AgentProposal
): Promise<void> {
  if (!userId) return;
  const { data: profile } = await admin
    .from("profiles")
    .select("agent_inbox")
    .eq("id", userId)
    .maybeSingle();

  const inbox = (profile?.agent_inbox || {}) as {
    proposals?: AgentProposal[];
    narrative?: string;
    scannedAt?: number;
  };
  const existing = Array.isArray(inbox.proposals) ? inbox.proposals : [];
  const filtered = existing.filter((p) => p.id !== proposal.id);
  const next = [proposal, ...filtered].slice(0, 40);

  await admin
    .from("profiles")
    .update({
      agent_inbox: {
        proposals: next,
        scannedAt: Date.now(),
        narrative:
          inbox.narrative ||
          "Live signal landed. Confirm one move when you are ready.",
      },
      agent_scanned_at: new Date().toISOString(),
    })
    .eq("id", userId);
}
