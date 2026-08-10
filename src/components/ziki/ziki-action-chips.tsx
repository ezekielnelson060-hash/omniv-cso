"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { stashAct } from "@/lib/ziki-memory";
import { cn } from "@/lib/utils";

export type ZikiActionChip = {
  type: string;
  label: string;
  city?: string;
  title?: string;
  id?: string;
  to?: string;
  topic?: string;
};

/** Same execution path as Agent Inbox confirm chips. */
export function ZikiActionChips({ actions }: { actions: ZikiActionChip[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  if (!actions?.length) return null;

  async function run(a: ZikiActionChip) {
    const type = a.type;
    const key = `${a.type}-${a.label}`;
    setBusy(key);
    setMsg(null);
    const payload: Record<string, string> = {};
    if (a.city) payload.city = a.city;
    if (a.title) payload.title = a.title;
    if (a.id) payload.id = a.id;
    if (a.to) payload.to = a.to;
    if (a.topic) payload.topic = a.topic;

    const serverTypes = new Set([
      "CREATE_ROOM",
      "CREATE_TASK",
      "DRAFT_OUTREACH",
      "REFRESH_METRICS",
      "MARK_OPP_DONE",
    ]);

    try {
      if (serverTypes.has(type)) {
        const res = await fetch("/api/agent/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            title: a.title || a.label,
            payload,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          route?: string;
          message?: string;
          draft?: string;
          stash?: {
            title: string;
            summary: string;
            why: string;
            expectedOutcome: string;
            category: string;
          };
        };
        if (data.stash) stashAct(data.stash);
        else if (data.draft) {
          stashAct({
            title: a.label,
            summary: data.draft.slice(0, 280),
            why: "Draft from Ziki chip",
            expectedOutcome: "Send a note that earns a reply",
            category: "outreach",
          });
        }
        if (type === "MARK_OPP_DONE" && a.id) {
          const { markOpportunityDone } = await import(
            "@/lib/opportunity-progress"
          );
          markOpportunityDone(a.id);
        }
        setMsg(data.message || "Done");
        if (data.route && type !== "DRAFT_OUTREACH") {
          router.push(data.route);
        } else if (type === "DRAFT_OUTREACH") {
          router.push("/ziki");
        }
        return;
      }

      if (type === "OPEN_CRM")
        router.push(
          a.city ? `/crm?city=${encodeURIComponent(a.city)}` : "/crm"
        );
      else if (type === "OPEN_CATALOGUE") router.push("/catalogue");
      else if (type === "OPEN_SETTINGS") router.push("/settings");
      else if (type === "OPEN_OPPORTUNITIES") router.push("/opportunities");
      else if (type === "OPEN_RELEASE") router.push("/release-simulator");
      else if (type === "OPEN_DISCOVER") router.push("/discover");
      else if (type === "OPEN_ZIKI") router.push("/ziki");
      else if (type === "MARK_OPP_DONE" && a.id) {
        const { markOpportunityDone } = await import(
          "@/lib/opportunity-progress"
        );
        markOpportunityDone(a.id);
        setMsg("Opportunity marked done");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {actions.map((a, i) => {
          const key = `${a.type}-${a.label}-${i}`;
          const isBusy = busy === `${a.type}-${a.label}`;
          return (
            <button
              key={key}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void run(a)}
              className={
                "inline-flex items-center gap-1 rounded-full border border-omniv-gold/35 bg-omniv-gold/10 px-2.5 py-1 text-[11px] font-medium text-omniv-gold transition hover:bg-omniv-gold/20 disabled:opacity-60"
              }
            >
              {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
              {a.label}
            </button>
          );
        })}
      </div>
      {msg && <p className="text-[10px] text-emerald-400/90">{msg}</p>}
    </div>
  );
}
