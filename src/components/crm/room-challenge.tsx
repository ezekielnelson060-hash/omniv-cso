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
    href: "/opportunities",
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
    href: "/crm?focus=room",
    doneKey: "omniv_challenge_share",
  },
  {
    id: "report",
    title: "Report back",
    href: "/crm?tab=money",
    doneKey: "omniv_challenge_report",
  },
];

const DISMISS_KEY = "omniv_challenge_dismissed";

export function RoomChallenge() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
        return;
      }
      const map: Record<string, boolean> = {};
      for (const s of STEPS) {
        map[s.id] = localStorage.getItem(s.doneKey) === "1";
      }
      setDone(map);
      setDismissed(false);
    } catch {
      setDismissed(false);
    }
  }, []);

  const count = STEPS.filter((s) => done[s.id]).length;
  if (dismissed || count >= STEPS.length) return null;

  function mark(id: string, key: string) {
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* soft */
    }
    setDone((d) => ({ ...d, [id]: true }));
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* soft */
    }
    setDismissed(true);
  }

  return (
    <Card className="relative border-omniv-gold/25 bg-omniv-gold/5 p-4">
      <button
        type="button"
        className="absolute right-2 top-2 rounded-md p-1 text-omniv-text-muted hover:bg-omniv-card"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-center gap-2 pr-6">
        <Zap className="h-4 w-4 text-omniv-gold" />
        <p className="text-[13px] font-semibold">48-hour room challenge</p>
        <span className="text-[11px] text-omniv-text-muted">
          {count}/{STEPS.length}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-omniv-text-secondary">
        Optional. One room this week beats another dashboard.
      </p>
      <ul className="mt-3 space-y-2">
        {STEPS.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            {done[s.id] ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-omniv-text-muted" />
            )}
            <Link
              href={s.href}
              className="flex-1 text-[12px] font-medium text-omniv-text hover:text-omniv-gold"
              onClick={() => mark(s.id, s.doneKey)}
            >
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-8 w-full text-[11px]"
        onClick={dismiss}
      >
        Not now
      </Button>
    </Card>
  );
}
