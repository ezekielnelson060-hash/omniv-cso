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
import { Bell, Loader2, Sparkles, Zap, X } from "lucide-react";

export function NotificationsPanel() {
  const router = useRouter();
  const [items, setItems] = useState<AgentProposal[]>([]);
  const [narrative, setNarrative] = useState("");
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  useEffect(() => {
    if (loadProposals().filter((p) => p.status === "pending").length === 0) {
      void scan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function execute(p: AgentProposal) {
    setBusyId(p.id);
    try {
      const t = p.action.type;
      const payload = p.action.payload || {};

      if (t === "CREATE_TASK") {
        await fetch("/api/agent/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: t, title: p.title, payload }),
        });
      }

      if (t === "OPEN_ZIKI" || t === "DRAFT_OUTREACH") {
        stashAct({
          title: p.title,
          summary: p.body,
          why: "Agent proposal",
          expectedOutcome: "Confirmed execution",
          category: "Agent",
        });
        if (payload.q) {
          router.push(`/ziki?q=${encodeURIComponent(payload.q)}`);
        } else {
          router.push("/ziki");
        }
      } else if (t === "CREATE_ROOM") {
        try {
          const res = await fetch("/api/agent/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "CREATE_ROOM",
              title: p.title,
              payload,
            }),
          });
          const data = (await res.json()) as {
            route?: string;
            gatheringId?: string;
          };
          if (data.route) {
            router.push(data.route);
          } else {
            router.push(
              payload.city
                ? `/crm?city=${encodeURIComponent(payload.city)}`
                : "/crm"
            );
          }
        } catch {
          router.push("/crm");
        }
      } else if (t === "OPEN_CRM") {
        router.push(
          payload.city
            ? `/crm?city=${encodeURIComponent(payload.city)}`
            : "/crm"
        );
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
      }

      markProposal(p.id, "done");
      void persistStatus(p.id, "done");
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

  /** Keep server agent_inbox in sync so confirms survive localStorage clears. */
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

  const pending = items.filter((p) => p.status === "pending");
  const done = items.filter((p) => p.status === "done").slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
            Agent
          </p>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            Inbox
          </h1>
          <p className="mt-0.5 max-w-lg text-[11px] text-omniv-text-muted">
            Sense → rank → draft. You confirm. One confirmed move beats ten
            unread tips.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold">{pending.length} pending</Badge>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={scanning}
            onClick={() => void scan()}
          >
            {scanning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Scan now
          </Button>
        </div>
      </div>

      {narrative && (
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
      </div>

      {pending.length === 0 && !scanning && (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Bell className="h-8 w-8 text-omniv-text-muted" />
          <p className="text-sm text-omniv-text-secondary">
            No pending agent moves. Scan after catalogue upload or Settings
            update.
          </p>
          <Button size="sm" onClick={() => void scan()} className="mt-1">
            Run agent scan
          </Button>
        </Card>
      )}

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
        "p-3 transition",
        p.impact === "high" && "border-omniv-gold/30"
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
            <Badge variant="outline" className="text-[9px]">
              {p.impact} impact
            </Badge>
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-omniv-text">
            {p.title}
          </h3>
          <p className="mt-1 whitespace-pre-line text-[12px] leading-snug text-omniv-text-muted">
            {p.body.slice(0, 280)}
            {p.body.length > 280 ? "…" : ""}
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
          className="h-8 gap-1.5 text-[11px]"
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
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[11px]"
          onClick={onDismiss}
        >
          Not now
        </Button>
      </div>
    </Card>
  );
}
