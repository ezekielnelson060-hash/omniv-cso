"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Story = {
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
};

const STORAGE_KEY = "omniv_stories_dismissed_v2";

function buildStories(opts: {
  city?: string | null;
  dream?: string | null;
  stageName?: string | null;
}): Story[] {
  const city = opts.city?.trim() || null;
  const dream = opts.dream?.trim() || null;

  const moveExample = city
    ? `Open a room in ${city}, text the list in room chat, share the tip link.`
    : dream
      ? `One proof step toward "${dream.slice(0, 56)}${dream.length > 56 ? "…" : ""}" — grounded in your market, not a random foreign venue.`
      : "Upload a track, share Fan Gate, open a room when a city shows fans.";

  return [
    {
      kicker: "Demand",
      title: "Don't guess the market. Verify it.",
      body: `Omniv looks for where people actually concentrate — not just followers. ${city ? `Your signals already point toward ${city}.` : "Share Fan Gate and connect platforms so the map gets real."}`,
      cta: "Open Fans",
      href: "/crm",
    },
    {
      kicker: "Verify",
      title: "Evidence over vibes",
      body: "Streams and views are attention. Demand is who would show up, buy a ticket, or join your list. We rank cities by how strong that evidence looks.",
      cta: "See Moves",
      href: "/notifications",
    },
    {
      kicker: "Act",
      title: "Cheapest proof: open a room",
      body: `${moveExample} One paid room teaches more than another month of posting.`,
      cta: "Start in Rooms",
      href: "/crm?focus=room",
    },
    {
      kicker: "Own",
      title: "Every fan becomes data you control",
      body: "Fan Gate: email → city → would attend. Platforms can change. Your list and intent data stay with you.",
      cta: "Fan Gate",
      href: "/crm",
    },
    {
      kicker: "Get paid",
      title: "Tips and tickets when demand is real",
      body: "Settings → Get paid. When the room fills or fans tip, money lands without payment codes.",
      cta: "Get paid",
      href: "/settings",
    },
  ];
}

export function StorySlides({
  force = false,
  city = null,
  dream = null,
  stageName = null,
}: {
  force?: boolean;
  city?: string | null;
  dream?: string | null;
  stageName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const stories = buildStories({ city, dream, stageName });

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

  const s = stories[i]!;

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
        <div className="px-5 pb-2 pt-2">
          <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
          <p className="mt-2 text-[14px] leading-snug text-omniv-text-secondary">
            {s.body}
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {stories.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full ${
                  idx === i ? "w-5 bg-omniv-gold" : "w-1.5 bg-omniv-border"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pb-4 pt-2">
          <button
            type="button"
            disabled={i === 0}
            onClick={() => setI((x) => Math.max(0, x - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-omniv-border disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <Link href={s.href} className="flex-1" onClick={dismiss}>
            <Button className="h-11 w-full rounded-full text-[14px]">
              {s.cta}
            </Button>
          </Link>
          <button
            type="button"
            disabled={i >= stories.length - 1}
            onClick={() => setI((x) => Math.min(stories.length - 1, x + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-omniv-border disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="w-full pb-4 text-center text-[12px] text-omniv-text-muted"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
