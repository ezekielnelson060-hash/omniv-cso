"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink, CircleDollarSign } from "lucide-react";

const KEY = "omniv_royalty_checklist_v1";

type ItemId =
  | "soundexchange"
  | "mlc"
  | "pro"
  | "songtrust"
  | "distributor";

const ITEMS: {
  id: ItemId;
  title: string;
  why: string;
  href: string;
  cta: string;
}[] = [
  {
    id: "soundexchange",
    title: "SoundExchange",
    why: "Pays you for non-interactive plays (SiriusXM, Pandora radio, webcasters) on the recording. Free. Spotify does not pay this.",
    href: "https://www.soundexchange.com",
    cta: "Register",
  },
  {
    id: "mlc",
    title: "The MLC",
    why: "US streaming mechanicals for the song (composition). Free. 100% of collected royalties to you.",
    href: "https://www.themlc.com",
    cta: "Join free",
  },
  {
    id: "pro",
    title: "PRO (ASCAP / BMI / SESAC)",
    why: "Performance royalties when the song is played publicly — radio, venues, interactive streams. Pick one primary US PRO.",
    href: "https://www.ascap.com",
    cta: "ASCAP",
  },
  {
    id: "songtrust",
    title: "Songtrust (optional)",
    why: "Global publishing admin when your local PRO isn’t enough. You keep 100% of rights; they take a commission on what they collect.",
    href: "https://www.songtrust.com",
    cta: "Learn more",
  },
  {
    id: "distributor",
    title: "Distributor for masters",
    why: "Spotify / Apple payouts for the recording go through a distributor (DistroKid, TuneCore, etc.). Omniv is not that.",
    href: "https://distrokid.com",
    cta: "DistroKid",
  },
];

export function RoyaltyChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* soft */
    }
  }, []);

  function toggle(id: ItemId) {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* soft */
      }
      return next;
    });
  }

  const completed = ITEMS.filter((i) => done[i.id]).length;

  return (
    <Card className="border-omniv-border p-4 sm:p-5">
      <div className="flex items-start gap-2">
        <CircleDollarSign className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold">Royalty checklist</p>
          <p className="mt-0.5 text-[12px] text-omniv-text-secondary">
            Omniv grows demand, tips, and rooms. These collect money platforms
            already owe you. {completed}/{ITEMS.length} done.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {ITEMS.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-omniv-border bg-omniv-elevated/40 px-3 py-2.5"
          >
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={Boolean(done[item.id])}
                onChange={() => toggle(item.id)}
                className="mt-1"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[13px] font-medium">{item.title}</span>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-[11px] text-omniv-gold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.cta}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-omniv-text-muted">
                  {item.why}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}
