"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pendingCount, upsertProposals, loadProposals } from "@/lib/agent/store";
import type { AgentProposal } from "@/lib/agent/types";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Polls global inbox + listens for omniv-agent.
 * Toast when pending rises; optional browser Notification when tab hidden.
 */
export function AgentLiveSignals() {
  const [toast, setToast] = useState<string | null>(null);
  const lastPending = useRef<number | null>(null);

  useEffect(() => {
    lastPending.current = pendingCount();

    async function hydrate() {
      try {
        const res = await fetch("/api/agent/inbox");
        if (!res.ok) return;
        const data = (await res.json()) as {
          proposals?: AgentProposal[];
        };
        if (!data.proposals?.length) return;
        const before = pendingCount();
        const beforeIds = new Set(
          loadProposals()
            .filter((p) => p.status === "pending")
            .map((p) => p.id)
        );
        upsertProposals(data.proposals);
        const after = pendingCount();
        const fresh = data.proposals.filter(
          (p) => p.status === "pending" && !beforeIds.has(p.id)
        );
        if (fresh.length > 0 && after >= before) {
          const top = fresh[0]!;
          setToast(
            fresh.length === 1
              ? top.title
              : `${fresh.length} new signals — ${top.title}`
          );
          if (
            typeof document !== "undefined" &&
            document.visibilityState === "hidden" &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification("Omniv Global", {
                body: top.title,
                tag: "omniv-global",
              });
            } catch {
              /* ignore */
            }
          }
        }
        lastPending.current = after;
      } catch {
        /* ignore */
      }
    }

    void hydrate();
    const t = window.setInterval(() => void hydrate(), 45000);
    const on = () => {
      const n = pendingCount();
      if (lastPending.current !== null && n > lastPending.current) {
        const pending = loadProposals().filter((p) => p.status === "pending");
        const top = pending[0];
        if (top) setToast(top.title);
      }
      lastPending.current = n;
    };
    window.addEventListener("omniv-agent", on);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("omniv-agent", on);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[80] max-w-sm",
        "rounded-xl border border-omniv-gold/30 bg-omniv-elevated/95 p-3 shadow-xl backdrop-blur"
      )}
      role="status"
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 text-omniv-gold">
          <Bell className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
            Global
          </p>
          <p className="text-[13px] font-medium leading-snug text-omniv-text">
            {toast}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Link
              href="/notifications"
              className="text-[11px] text-omniv-gold hover:underline"
              onClick={() => setToast(null)}
            >
              Open Global →
            </Link>
            {typeof Notification !== "undefined" &&
              Notification.permission === "default" && (
                <button
                  type="button"
                  className="text-[11px] text-omniv-text-muted hover:text-omniv-gold"
                  onClick={() => {
                    void Notification.requestPermission();
                  }}
                >
                  Enable alerts
                </button>
              )}
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="text-omniv-text-muted hover:text-omniv-text"
          onClick={() => setToast(null)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
