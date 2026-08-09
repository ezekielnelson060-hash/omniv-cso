"use client";

import { useEffect, useState } from "react";
import { pendingCount, upsertProposals } from "@/lib/agent/store";
import type { AgentProposal } from "@/lib/agent/types";

export function useAgentPending(): number {
  const [n, setN] = useState(0);

  useEffect(() => {
    const refresh = () => setN(pendingCount());
    refresh();
    const on = () => refresh();
    window.addEventListener("omniv-agent", on);
    const poll = window.setInterval(async () => {
      try {
        const res = await fetch("/api/agent/inbox");
        if (!res.ok) return;
        const data = (await res.json()) as { proposals?: AgentProposal[] };
        if (data.proposals?.length) {
          upsertProposals(data.proposals);
          refresh();
        }
      } catch {
        /* ignore */
      }
    }, 60000);
    return () => {
      window.removeEventListener("omniv-agent", on);
      window.clearInterval(poll);
    };
  }, []);

  return n;
}

export function AgentNavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-omniv-gold px-1 text-[9px] font-bold text-black">
      {count > 9 ? "9+" : count}
    </span>
  );
}
