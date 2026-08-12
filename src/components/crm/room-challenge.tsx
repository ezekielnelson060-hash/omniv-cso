"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Circle, Zap, X } from "lucide-react";

const STEPS = [
  {
    id: "scan",
    title: "Scan your artist brain",
    href: "/activate",
    doneKey: "omniv_challenge_scan",
  },
  {
    id: "city",
    title: "Find your top city",
    href: "/crm?tab=home",
    doneKey: "omniv_challenge_city",
  },
  {
    id: "room",
    title: "Open a room",
    href: "/crm?focus=room",
    doneKey: "omniv_challenge_room",
  },
  {
    id: "share",
    title: "Share the link",
    href: "/crm?tab=rooms",
    doneKey: "omniv_challenge_share",
  },
  {
    id: "report",
    title: "Report back to Ziki",
    href: "/ziki",
    doneKey: "omniv_challenge_report",
  },
] as const;

const DISMISS_KEY = "omniv_challenge_dismissed";

/** Optional first-week checklist. Hides when dismissed or all steps done. */
export function RoomChallenge({
  onOpenRooms,
}: {
  onOpenRooms?: () => void;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const s of STEPS) {
      try {
        next[s.id] = localStorage.getItem(s.doneKey) === "1";
      } catch {
        next[s.id] = false;
      }
    }
    setDone(next);
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      const allDone = STEPS.every((s) => next[s.id]);
      setHidden(dismissed || allDone);
    } catch {
      setHidden(false);
    }
  }, []);

  function mark(id: string, key: string) {
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* soft */
    }
    setDone((d) => {
      const next = { ...d, [id]: true };
      if (STEPS.every((s) => next[s.id])) {
        try {
          localStorage.setItem(DISMISS_KEY, "1");
        } catch {
          /* soft */
        }
        setHidden(true);
      }
      return next;
    });
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* soft */
    }
    setHidden(true);
  }

  if (hidden) return null;

  const count = STEPS.filter((s) => done[s.id]).length;

  return (
    <Card className="overflow-hidden border-omniv-gold/30 bg-gradient-to-br from-omniv-gold/10 via-omniv-card to-omniv-black/40 p-4">
      <div className="flex items-start gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/20">
          <Zap className="h-4 w-4 text-omniv-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              First room · optional
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md p-1 text-omniv-text-muted hover:bg-omniv-elevated"
              aria-label="Dismiss checklist"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-0.5 text-[13px] font-semibold tracking-tight">
            Get one room live this week
          </p>
          <p className="mt-1 text-[12px] leading-snug text-omniv-text-secondary">
            Optional checklist — scan → city → open room → share → tell Ziki.
            Do it once, then it goes away. {count}/{STEPS.length} done.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {STEPS.map((s, i) => {
          const isDone = !!done[s.id];
          return (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-xl border border-omniv-border/60 bg-omniv-black/20 px-3 py-2"
            >
              {isDone ? (
                <Check className="h-4 w-4 shrink-0 text-omniv-gold" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-omniv-text-muted" />
              )}
              <span className="min-w-0 flex-1 text-[12px]">
                {i + 1}. {s.title}
              </span>
              {s.id === "room" && onOpenRooms ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() => {
                    mark(s.id, s.doneKey);
                    onOpenRooms();
                  }}
                >
                  Open
                </Button>
              ) : (
                <Link
                  href={s.href}
                  onClick={() => mark(s.id, s.doneKey)}
                  className="inline-flex h-7 items-center rounded-md border border-omniv-border px-2.5 text-[11px] font-medium text-omniv-text-secondary hover:border-omniv-gold/40 hover:text-omniv-gold"
                >
                  Go
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
