"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Circle, Zap } from "lucide-react";

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
    title: "Report back",
    href: "/ziki",
    doneKey: "omniv_challenge_report",
  },
] as const;

export function RoomChallenge({
  onOpenRooms,
}: {
  onOpenRooms?: () => void;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});

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
  }, []);

  function mark(id: string, key: string) {
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* soft */
    }
    setDone((d) => ({ ...d, [id]: true }));
  }

  const count = STEPS.filter((s) => done[s.id]).length;

  return (
    <Card className="overflow-hidden border-omniv-gold/30 bg-gradient-to-br from-omniv-gold/10 via-omniv-card to-omniv-black/40 p-4">
      <div className="flex items-start gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/20">
          <Zap className="h-4 w-4 text-omniv-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            48-hour room challenge
          </p>
          <p className="mt-0.5 text-[13px] font-semibold tracking-tight">
            Who&apos;s in?
          </p>
          <p className="mt-1 text-[12px] leading-snug text-omniv-text-secondary">
            Scan → top city → open a room → share the link → tell Ziki what
            happened. {count}/{STEPS.length} done.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {STEPS.map((s, i) => {
          const isDone = done[s.id];
          return (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-xl border border-omniv-border/80 bg-omniv-black/30 px-2.5 py-2"
            >
              <button
                type="button"
                className="shrink-0 text-omniv-gold"
                onClick={() => mark(s.id, s.doneKey)}
                aria-label={isDone ? "Done" : "Mark done"}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4 opacity-50" />
                )}
              </button>
              <span
                className={`min-w-0 flex-1 text-[12px] ${
                  isDone ? "text-omniv-text-muted line-through" : "text-omniv-text"
                }`}
              >
                <span className="text-omniv-text-muted">{i + 1}.</span> {s.title}
              </span>
              {s.id === "room" && onOpenRooms ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 shrink-0 rounded-lg px-2 text-[10px]"
                  onClick={() => {
                    onOpenRooms();
                    mark(s.id, s.doneKey);
                  }}
                >
                  Open
                </Button>
              ) : (
                <Link href={s.href}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 shrink-0 rounded-lg px-2 text-[10px]"
                    onClick={() => mark(s.id, s.doneKey)}
                  >
                    Go
                  </Button>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
