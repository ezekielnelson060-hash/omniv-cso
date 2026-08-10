"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgentProposal } from "@/lib/agent/types";
import {
  loadProposals,
  markProposal,
  upsertProposals,
} from "@/lib/agent/store";
import { runAgentScan } from "@/lib/agent/scan";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { listCatalogueReleases } from "@/lib/catalogue/db";
import { listCatalogueTracks } from "@/lib/catalogue/tracks";
import { completedIds } from "@/lib/opportunity-progress";
import { stashAct } from "@/lib/ziki-memory";
import { Loader2, Sparkles, Zap, X } from "lucide-react";

type InboxFilter = "all" | "outside" | "internal";

export function NotificationsPanel() {
  const router = useRouter();
  const [items, setItems] = useState<AgentProposal[]>([]);
  const [narrative, setNarrative] = useState("");
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [lastMsg, setLastMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setItems(loadProposals());
  }, []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener("omniv-agent", on);
    return () => window.removeEventListener("omniv-agent", on);
  }, [refresh]);

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch("/api/agent/scan", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as {
          proposals?: AgentProposal[];
          narrative?: string;
        };
        if (data.proposals?.length) {
          upsertProposals(data.proposals);
          setNarrative(data.narrative || "");
          refresh();
          return;
        }
      }
      const [brain, profile, releases, tracks] = await Promise.all([
        getArtistBrain(),
        getProfile(),
        listCatalogueReleases(),
        listCatalogueTracks(),
      ]);
      const links = profile?.social_links || {};
      const linkedSurfaces =
        Object.values(links).filter((u) => (u || "").trim().length > 8).length ||
        (profile?.platforms || []).length;
      const result = runAgentScan({
        brain,
        releases,
        tracks,
        platforms: profile?.platforms || [],
        linkedSurfaces,
        completedOppIds: completedIds(),
      });
      upsertProposals(result.proposals);
      setNarrative(result.narrative);
      refresh();
    } finally {
      setScanning(false);
    }
  }

  async function execute(p: AgentProposal) {
    setBusyId(p.id);
    setLastMsg(null);
    try {
      const t = p.action.type;
      const payload = p.action.payload || {};
      let serverMsg: string | null = null;

      if (t === "OPEN_ZIKI") {
        stashAct({
          title: p.title,
          summary: p.body.slice(0, 280),
          why: "Agent confirmed this move",
          expectedOutcome: "Clear next action",
          category: p.source,
        });
        if (payload.q) {
          try {
            sessionStorage.setItem("omniv-ziki-seed", payload.q);
          } catch {
            /* soft */
          }
        }
        router.push("/ziki");
      } else if (
        t === "CREATE_TASK" ||
        t === "CREATE_ROOM" ||
        t === "DRAFT_OUTREACH" ||
        t === "REFRESH_METRICS"
      ) {
        const res = await fetch("/api/agent/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: t,
            title: p.title,
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
        serverMsg = data.message || null;
        if (data.stash) {
          stashAct(data.stash);
        } else if (data.draft) {
          stashAct({
            title: p.title,
            summary: data.draft.slice(0, 280),
            why: "Outreach draft from Agent",
            expectedOutcome: "Send a note that earns a reply",
            category: "outreach",
          });
        }
        if (data.route) router.push(data.route);
      } else if (t === "OPEN_CRM") {
        router.push("/crm");
      } else if (t === "OPEN_SETTINGS") {
        router.push("/settings");
      } else if (t === "OPEN_CATALOGUE") {
        router.push("/catalogue");
      } else if (t === "OPEN_OPPORTUNITIES") {
        router.push("/opportunities");
      } else if (t === "OPEN_RELEASE") {
        router.push("/release-simulator");
      } else if (t === "OPEN_DISCOVER") {
        router.push("/discover");
      } else if (t === "OPEN_REPORTS") {
        router.push("/reports");
      } else if (t === "MARK_OPP_DONE" && payload.id) {
        const { markOpportunityDone } = await import(
          "@/lib/opportunity-progress"
        );
        markOpportunityDone(payload.id);
        serverMsg = "Opportunity marked done";
      } else {
        try {
          const res = await fetch("/api/agent/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: t, title: p.title, payload }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          serverMsg = data.message || null;
        } catch {
          /* soft */
        }
      }

      markProposal(p.id, "done");
      void persistStatus(p.id, "done");
      setLastMsg(serverMsg || `Confirmed: ${p.action.label}`);
      try {
        const { track } = await import("@/lib/analytics");
        track("agent_confirm", {
          action: p.action.type,
          source: p.source,
          proposal_id: p.id,
        });
      } catch {
        /* soft */
      }
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  function dismiss(id: string) {
    markProposal(id, "dismissed");
    void persistStatus(id, "dismissed");
    refresh();
  }

  async function persistStatus(
    id: string,
    status: "done" | "dismissed" | "pending"
  ) {
    try {
      await fetch("/api/agent/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      /* optimistic local already applied */
    }
  }

  const pendingAll = items.filter((p) => p.status === "pending");
  const outsideCount = pendingAll.filter((p) => p.source === "webhook").length;
  const internalCount = pendingAll.length - outsideCount;
  const pending = pendingAll.filter((p) => {
    if (filter === "outside") return p.source === "webhook";
    if (filter === "internal") return p.source !== "webhook";
    return true;
  });
  const done = items.filter((p) => p.status === "done").slice(0, 5);

  const emptyCopy =
    filter === "outside"
      ? "No outside signals yet. Partner webhooks (distro, playlist, sync) land here."
      : filter === "internal"
        ? "No internal moves pending. Scan after catalogue upload or Settings update."
        : "No pending agent moves. Scan after catalogue upload or Settings update.";

  return (
    <div className="space-y-4">
      <div className="relative -mx-3 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/12 via-omniv-gold/8 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-3 px-3 pb-4 pt-1 sm:px-4 md:px-5 md:pt-4">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
              Agent
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              Inbox
            </h1>
            <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
              Sense → rank → draft. You confirm. One confirmed move beats ten
              unread tips.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">{pendingAll.length} pending</Badge>
            <Button
              className="h-10 gap-1.5 rounded-xl"
              variant="outline"
              disabled={scanning}
              onClick={() => void scan()}
            >
              {scanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Scan now
            </Button>
          </div>
        </div>
      </div>

      {lastMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300">
          {lastMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: "all" as const, label: "All", n: pendingAll.length },
            { id: "outside" as const, label: "Outside", n: outsideCount },
            { id: "internal" as const, label: "Internal", n: internalCount },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
              filter === tab.id
                ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                : "border-omniv-border text-omniv-text-muted hover:border-omniv-gold/30 hover:text-omniv-text"
            )}
          >
            {tab.label}
            <span className="ml-1 opacity-70">{tab.n}</span>
          </button>
        ))}
      </div>

      {narrative && filter !== "outside" && (
        <Card className="border-omniv-gold/20 bg-omniv-gold/5 p-3">
          <p className="text-[12px] leading-relaxed text-omniv-text-secondary">
            {narrative}
          </p>
        </Card>
      )}

      <div className="space-y-2">
        {pending.map((p) => (
          <ProposalCard
            key={p.id}
            p={p}
            busy={busyId === p.id}
            onExecute={() => void execute(p)}
            onDismiss={() => dismiss(p.id)}
          />
        ))}
        {!pending.length && (
          <p className="rounded-2xl border border-dashed border-omniv-border px-4 py-8 text-center text-[12px] text-omniv-text-muted">
            {emptyCopy}
          </p>
        )}
      </div>

      {done.length > 0 && (
        <div className="pt-2">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            Confirmed
          </p>
          {done.map((p) => (
            <div
              key={p.id}
              className="mb-1 rounded-lg border border-omniv-border/60 px-3 py-2 text-[12px] text-omniv-text-muted line-through opacity-70"
            >
              {p.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalCard({
  p,
  busy,
  onExecute,
  onDismiss,
}: {
  p: AgentProposal;
  busy: boolean;
  onExecute: () => void;
  onDismiss: () => void;
}) {
  const urgencyTone =
    p.urgency === "now"
      ? "text-rose-400 border-rose-500/30"
      : p.urgency === "today"
        ? "text-amber-400 border-amber-500/30"
        : "text-omniv-text-muted border-omniv-border";

  return (
    <Card
      className={cn(
        "rounded-2xl p-3.5 transition",
        p.impact === "high" &&
          "border-omniv-gold/30 shadow-[0_8px_24px_-16px_rgba(212,175,55,0.35)]"
      )}
    >
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                urgencyTone
              )}
            >
              {p.urgency}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px]",
                p.source === "webhook" && "border-omniv-gold/40 text-omniv-gold"
              )}
            >
              {p.source === "webhook" ? "outside" : p.source}
            </Badge>
            <span className="text-[10px] text-omniv-text-muted">{p.impact}</span>
          </div>
          <p className="text-[14px] font-semibold tracking-tight">{p.title}</p>
          <p className="mt-1 whitespace-pre-wrap text-[12px] leading-snug text-omniv-text-muted">
            {p.body.slice(0, 320)}
            {p.body.length > 320 ? "…" : ""}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="text-omniv-text-muted hover:text-omniv-text"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="h-9 gap-1.5 rounded-xl"
          disabled={busy}
          onClick={onExecute}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Zap className="h-3.5 w-3.5" />
          )}
          {p.action.label}
        </Button>
      </div>
    </Card>
  );
}
