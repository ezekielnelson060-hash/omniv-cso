"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const STORIES = [
  {
    kicker: "Sunday with Ziki",
    title: "One move. Not a feed.",
    body: "Open Omniv → check opportunities → see the ranked move → tap to execute. This week's move might be: draft a pitch to a Berlin venue.",
    cta: "Open Moves",
    href: "/notifications",
  },
  {
    kicker: "The fan gate",
    title: "Every fan becomes data you own.",
    body: "Fan enters email → picks a city → marks would attend → you see the tier upgrade. Stop renting the audience.",
    cta: "Command Center",
    href: "/crm",
  },
  {
    kicker: "0 → first cash",
    title: "Eleven days is possible.",
    body: "Day 1 upload · Day 3 fans in a city · Day 7 open a room · Day 11 tickets + tips. Your turn?",
    cta: "Start the challenge",
    href: "/crm",
  },
  {
    kicker: "Before → after",
    title: "Know what to do this week.",
    body: "Before: I don't know what to do. After: open a room in Accra. Pitch Netflix. Drop Friday.",
    cta: "Talk to Ziki",
    href: "/ziki",
  },
  {
    kicker: "48-hour room",
    title: "Scan · city · room · share · report.",
    body: "Ziki already looks for fans waiting in a city, a track that fits a trend, and the optimal window this month.",
    cta: "Opportunities",
    href: "/opportunities",
  },
] as const;

const STORAGE_KEY = "omniv_stories_dismissed_v1";

export function StorySlides({ force = false }: { force?: boolean }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (force) {
      setOpen(true);
      return;
    }
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [force]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* soft */
    }
    setOpen(false);
  }

  if (!open) return null;

  const s = STORIES[i];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-3 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-omniv-border bg-omniv-card shadow-2xl">
        <div className="flex items-center justify-between px-4 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
            {s.kicker}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1.5 text-omniv-text-muted hover:bg-white/5"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 pb-2 pt-1">
          <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-omniv-text-secondary">
            {s.body}
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 px-4 py-2">
          {STORIES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-5 bg-omniv-gold" : "w-1.5 bg-omniv-border"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-omniv-border px-4 py-3">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 shrink-0 rounded-xl p-0"
            disabled={i === 0}
            onClick={() => setI((x) => Math.max(0, x - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Link href={s.href} className="min-w-0 flex-1" onClick={dismiss}>
            <Button size="sm" className="h-9 w-full rounded-xl text-[12px]">
              {s.cta}
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 shrink-0 rounded-xl p-0"
            disabled={i === STORIES.length - 1}
            onClick={() => setI((x) => Math.min(STORIES.length - 1, x + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="w-full pb-3 text-center text-[11px] text-omniv-text-muted"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
