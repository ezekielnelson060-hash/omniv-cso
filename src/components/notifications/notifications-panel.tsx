"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgentProposal } from "@/lib/agent/types";
import {
  loadProposals,
  markProposal,
  replacePendingFromScan,
  purgeInternalPending,
  isOutsideSignal,
  clearStalePending,
  purgeNonMusicMarketPending,
} from "@/lib/agent/store";
import { runAgentScan } from "@/lib/agent/scan";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { listCatalogueReleases } from "@/lib/catalogue/db";
import { listCatalogueTracks } from "@/lib/catalogue/tracks";
import { completedIds } from "@/lib/opportunity-progress";
import { stashAct } from "@/lib/ziki-memory";
import { Loader2, Sparkles, Zap, X } from "lucide-react";

type InboxFilter = "all" | "outside" | "internal";

/** Turn bare URLs in agent body into tappable links (no extra row). */
function linkifyBody(text: string): ReactNode {
  const re = /https?:\/\/[^\s)\]"']+/gi;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    let url = match[0];
    let trail = "";
    while (/[.,;:!?]$/.test(url)) {
      trail = url.slice(-1) + trail;
      url = url.slice(0, -1);
    }
    nodes.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-medium text-omniv-gold underline-offset-2 hover:underline"
      >
        {url}
      </a>
    );
    if (trail) nodes.push(trail);
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : text;
}

export function NotificationsPanel() {
  const router = useRouter();
  const [items, setItems] = useState<AgentProposal[]>([]);
  const [narrative, setNarrative] = useState("");
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("outside");
  const [lastMsg, setLastMsg] = useState<string | null>(null);
  const [autoScanned, setAutoScanned] = useState(false);

  const refresh = useCallback(() => {
    setItems(loadProposals());
  }, []);

  useEffect(() => {
    clearStalePending();
    purgeNonMusicMarketPending();
    purgeInternalPending();
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
        if (Array.isArray(data.proposals)) {
          replacePendingFromScan(data.proposals);
          const outN = data.proposals.filter(isOutsideSignal).length;
          setNarrative(
            outN
              ? `Outside: ${outN} signal(s) from partners / metrics.`
              : "No new outside signals. Connect Partners or paste DSP links. Precision plan is in Moves."
          );
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
      replacePendingFromScan(result.proposals);
      const outN = result.proposals.filter(isOutsideSignal).length;
      setNarrative(
        outN
          ? `Outside: ${outN} signal(s).`
          : "No outside signals from local scan. Partner webhooks + DSP metrics feed Agent. Moves holds the plan."
      );
      refresh();
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    if (autoScanned) return;
    setAutoScanned(true);
    void scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          why: "Confirmed signal",
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
      } else if (t === "OPEN_CRM") {
        const focus = payload.focus || "";
        const city = payload.city
          ? `&city=${encodeURIComponent(String(payload.city))}`
          : "";
        if (focus === "room") router.push(`/crm?focus=room${city}`);
        else if (focus === "money") router.push("/crm?tab=money");
        else if (focus === "fans") router.push("/crm?tab=fans");
        else router.push("/crm");
      } else if (t === "OPEN_SETTINGS") {
        router.push("/settings");
      } else if (t === "OPEN_CATALOGUE") {
        router.push("/catalogue");
      } else if (t === "OPEN_OPPORTUNITIES") {
        router.push("/opportunities");
      } else if (t === "OPEN_RELEASE") {
        router.push("/release-simulator");
      } else if (t === "OPEN_CONTENT") {
        router.push("/content");
      } else if (t === "OPEN_LABEL") {
        router.push("/label");
      } else if (t === "OPEN_DISCOVER") {
        router.push("/discover");
      } else if (t === "OPEN_REPORTS") {
        router.push("/reports");
      } else if (t === "MARK_OPP_DONE" && payload.id) {
        const { markOpportunityDone } = await import(
          "@/lib/opportunity-progress"
        );
        markOpportunityDone(String(payload.id));
        serverMsg = "Marked done";
      } else {
        try {
          const res = await fetch("/api/agent/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: t, title: p.title, payload }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
            route?: string;
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
          if (data.stash) stashAct(data.stash);
          else if (data.draft) {
            stashAct({
              title: p.title,
              summary: data.draft.slice(0, 280),
              why: "Outreach draft",
              expectedOutcome: "Send a note that earns a reply",
              category: "outreach",
            });
          }
          if (data.route) router.push(data.route);
        } catch {
          serverMsg = "Action failed";
        }
      }

      markProposal(p.id, "done");
      setLastMsg(serverMsg || "Done");
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function dismiss(id: string) {
    markProposal(id, "dismissed");
    refresh();
    try {
      await fetch("/api/agent/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "dismissed" }),
      });
    } catch {
      /* optimistic */
    }
  }

  const pendingAll = items.filter((p) => p.status === "pending");
  const outsideCount = pendingAll.filter((p) => isOutsideSignal(p)).length;
  const internalCount = pendingAll.filter((p) => !isOutsideSignal(p)).length;
  const pending = pendingAll.filter((p) => {
    if (filter === "outside") return isOutsideSignal(p);
    if (filter === "internal") return !isOutsideSignal(p);
    return true;
  });
  const done = items.filter((p) => p.status === "done").slice(0, 5);

  const emptyCopy =
    filter === "outside"
      ? "No outside signals yet. Connect Partners in Settings or paste DSP links so popularity can rise here. Numbered execution stays in Moves."
      : filter === "internal"
        ? "Setup steps belong in Moves. Agent only keeps outside intelligence."
        : "Outside deals land here. Open Moves for the precision plan.";

  return (
    <div className="space-y-4">
      <div className="relative -mx-3 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-omniv-gold/5 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-3 px-3 pb-4 pt-1 sm:px-4 md:px-5 md:pt-4">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
              Agent
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              Intelligence
            </h1>
            <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
              Outside deals, partner alerts, metric rises. Precision plan is
              Moves — not here.
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
              Scan signals
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
                : "border-omniv-border text-omniv-text-muted"
            )}
          >
            {tab.label}
            <span className="ml-1 opacity-70">{tab.n}</span>
          </button>
        ))}
      </div>

      {narrative && (
        <Card className="border-omniv-gold/20 bg-omniv-gold/5 p-3">
          <p className="text-[12px] text-omniv-text-secondary">{narrative}</p>
        </Card>
      )}

      <div className="space-y-2">
        {pending.map((p) => (
          <Card key={p.id} className="relative p-3.5">
            <button
              type="button"
              className="absolute right-2 top-2 rounded-md p-1 text-omniv-text-muted hover:bg-omniv-card"
              onClick={() => void dismiss(p.id)}
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="mb-1.5 flex flex-wrap gap-1.5 pr-6">
              <span className="rounded-full bg-omniv-gold/10 px-2 py-0.5 text-[10px] font-medium text-omniv-gold">
                {p.urgency}
              </span>
              <span className="rounded-full border border-omniv-border px-2 py-0.5 text-[10px] text-omniv-text-muted">
                {isOutsideSignal(p) ? "outside" : p.source}
              </span>
            </div>
            <h3 className="text-[14px] font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-1 text-[12px] text-omniv-text-muted">
              {linkifyBody(p.body)}
            </p>
            <Button
              className="mt-3 h-9 gap-1.5 rounded-xl"
              disabled={busyId === p.id}
              onClick={() => void execute(p)}
            >
              {busyId === p.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              {p.action.label}
            </Button>
          </Card>
        ))}
        {!pending.length && (
          <Card className="p-4 text-[12px] text-omniv-text-muted">{emptyCopy}</Card>
        )}
      </div>

      {done.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-omniv-text-muted">
            Recent confirms
          </p>
          <ul className="space-y-1 text-[12px] text-omniv-text-muted">
            {done.map((p) => (
              <li key={p.id} className="truncate">
                ✓ {p.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
