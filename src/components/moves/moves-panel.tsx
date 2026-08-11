"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgentProposal } from "@/lib/agent/types";
import { Loader2, Sparkles, Zap, Check } from "lucide-react";

/** Moves = precision plan. Agent = intelligence inbox. */
export function MovesPanel() {
  const router = useRouter();
  const [items, setItems] = useState<AgentProposal[]>([]);
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const loadDone = useCallback(() => {
    try {
      const raw = localStorage.getItem("omniv_moves_done_v1");
      if (raw) setDoneIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* soft */
    }
  }, []);

  const persistDone = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(
        "omniv_moves_done_v1",
        JSON.stringify([...ids].slice(0, 80))
      );
    } catch {
      /* soft */
    }
  }, []);

  const refresh = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/agent/scan", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as {
          proposals?: AgentProposal[];
          narrative?: string;
        };
        setItems(
          (data.proposals || []).filter((p) => p.source !== "webhook")
        );
        setNarrative(data.narrative || "");
      }
    } catch {
      /* soft */
    } finally {
      setScanning(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDone();
    void refresh();
  }, [loadDone, refresh]);

  function markDone(id: string) {
    const next = new Set(doneIds);
    next.add(id);
    setDoneIds(next);
    persistDone(next);
  }

  async function runStep(p: AgentProposal) {
    setBusyId(p.id);
    try {
      const t = p.action.type;
      const payload = p.action.payload || {};

      if (
        t === "CREATE_ROOM" ||
        t === "CREATE_TASK" ||
        t === "DRAFT_OUTREACH" ||
        t === "REFRESH_METRICS"
      ) {
        const res = await fetch("/api/agent/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: t, title: p.title, payload }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          route?: string;
        };
        markDone(p.id);
        if (data.route) router.push(data.route);
        else if (t === "CREATE_ROOM") router.push("/crm?focus=room");
        return;
      }

      if (t === "OPEN_ZIKI") {
        if (payload.q) {
          try {
            sessionStorage.setItem("omniv-ziki-seed", payload.q);
          } catch {
            /* soft */
          }
        }
        markDone(p.id);
        router.push("/ziki");
        return;
      }

      if (t === "OPEN_CRM") {
        const focus = payload.focus || "";
        if (focus === "room")
          router.push(
            `/crm?focus=room${payload.city ? `&city=${encodeURIComponent(payload.city)}` : ""}`
          );
        else if (focus === "money") router.push("/crm?tab=money");
        else if (focus === "fans") router.push("/crm?tab=fans");
        else router.push("/crm");
        markDone(p.id);
        return;
      }

      const routes: Record<string, string> = {
        OPEN_SETTINGS: "/settings",
        OPEN_CATALOGUE: "/catalogue",
        OPEN_RELEASE: "/release-simulator",
        OPEN_CONTENT: "/content",
        OPEN_LABEL: "/label",
        OPEN_DISCOVER: "/discover",
        OPEN_REPORTS: "/reports",
        OPEN_OPPORTUNITIES: "/opportunities",
      };
      router.push(routes[t] || "/crm");
      markDone(p.id);
    } finally {
      setBusyId(null);
    }
  }

  const active = items.filter((p) => !doneIds.has(p.id));
  const completed = items.filter((p) => doneIds.has(p.id));

  return (
    <div className="space-y-4">
      <div className="relative -mx-3 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/12 via-omniv-gold/8 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-3 px-3 pb-4 pt-1 sm:px-4 md:px-5 md:pt-4">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
              Moves
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              This week's plan
            </h1>
            <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
              Precision steps only. Agent is intelligence — Moves is what you
              execute, in order.
            </p>
          </div>
          <Button
            className="h-10 gap-1.5 rounded-xl"
            variant="outline"
            disabled={scanning}
            onClick={() => void refresh()}
          >
            {scanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Refresh plan
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

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-omniv-gold" />
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {active.map((p, idx) => (
            <Card
              key={p.id}
              className={cn(
                "rounded-2xl p-3.5",
                idx === 0 &&
                  "border-omniv-gold/40 shadow-[0_8px_24px_-16px_rgba(212,175,55,0.4)]"
              )}
            >
              <div className="flex gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                    idx === 0
                      ? "bg-omniv-gold text-omniv-black"
                      : "border border-omniv-border text-omniv-text-muted"
                  )}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    {idx === 0 && (
                      <Badge variant="gold" className="text-[9px]">
                        do first
                      </Badge>
                    )}
                    <span className="text-[10px] text-omniv-text-muted">
                      {p.urgency}
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold tracking-tight">
                    {p.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-omniv-text-muted">
                    {p.body.slice(0, 220)}
                    {p.body.length > 220 ? "…" : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="h-9 gap-1.5 rounded-xl"
                      disabled={busyId === p.id}
                      onClick={() => void runStep(p)}
                    >
                      {busyId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Zap className="h-3.5 w-3.5" />
                      )}
                      {p.action.label}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl"
                      onClick={() => markDone(p.id)}
                    >
                      Mark done
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {!active.length && (
            <p className="rounded-2xl border border-dashed border-omniv-border px-4 py-10 text-center text-[12px] text-omniv-text-muted">
              Plan clear. Refresh after you upload a track, share Fan Gate, or
              update your goal.
            </p>
          )}
        </div>
      )}

      {completed.length > 0 && (
        <div className="pt-2">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            Done this session
          </p>
          {completed.map((p) => (
            <div
              key={p.id}
              className="mb-1 flex items-center gap-2 rounded-lg border border-omniv-border/60 px-3 py-2 text-[12px] text-omniv-text-muted"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="line-through opacity-80">{p.title}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-omniv-text-muted">
        Outside signals and confirm chips live in{" "}
        <button
          type="button"
          className="text-omniv-gold underline-offset-2 hover:underline"
          onClick={() => router.push("/notifications")}
        >
          Agent
        </button>
        .
      </p>
    </div>
  );
}
