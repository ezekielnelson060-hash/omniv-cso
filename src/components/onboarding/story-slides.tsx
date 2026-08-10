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
  const who = opts.stageName?.trim() || "you";

  const moveExample = city
    ? `Open a room in ${city}, text the list in room chat, share the tip link.`
    : dream
      ? `One proof step toward "${dream.slice(0, 56)}${dream.length > 56 ? "…" : ""}" — grounded in your market, not a random foreign venue.`
      : "Upload a track, share Fan Gate, open a room when a city shows fans.";

  return [
    {
      kicker: "48-hour challenge",
      title: "City · room · share · cash signal",
      body: `In 48 hours: (1) share Fan Gate (2) see top city (3) open a room (4) share the link in chat (5) report back. ${moveExample}`,
      cta: "Start in Rooms",
      href: "/crm?focus=room",
    },
    {
      kicker: "Moves",
      title: "One action. Not a feed.",
      body: `Open Moves → top card → tap the button → do that one thing. For ${who}: ${moveExample}`,
      cta: "Open Moves",
      href: "/notifications",
    },
    {
      kicker: "Fan Gate",
      title: "Every fan becomes data you own",
      body: "They enter email → pick a city → mark would attend. You see the list and city heat. Stop renting the audience.",
      cta: "Open Fans",
      href: "/crm",
    },
    {
      kicker: "Get paid",
      title: "About 90% to your account",
      body: "Settings → Get paid → bank → turn on auto-pay. Tickets and tips split without payment codes.",
      cta: "Get paid",
      href: "/settings",
    },
    {
      kicker: "With Ziki",
      title: "Ask for the next step only",
      body: dream
        ? `Tell Ziki your goal and demand one concrete action for today — city, message, or link. Goal: "${dream.slice(0, 48)}${dream.length > 48 ? "…" : ""}".`
        : "Ask Ziki: What is the one thing I do today? Refuse long strategy. Demand a button you can press.",
      cta: "Talk to Ziki",
      href: "/ziki",
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

  const s = stories[i];

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
