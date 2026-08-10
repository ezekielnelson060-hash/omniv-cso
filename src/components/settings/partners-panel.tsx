"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PARTNERS, type PartnerDef } from "@/lib/partners";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Bell,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

const ARTIST_COPY: Record<
  string,
  { title: string; meaning: string; when: string }
> = {
  distro: {
    title: "Your distributor",
    meaning:
      "When a release goes live or pre-save opens, Omniv can ping you so you don't miss the day-one plan.",
    when: "Release is live · pre-save is open",
  },
  playlist: {
    title: "Playlists",
    meaning:
      "If you get added (or held) on a playlist, it shows up as a move — usually say thanks or follow up.",
    when: "Track added · pitch status changes",
  },
  curator: {
    title: "Curators & hosts",
    meaning:
      "Independent people who play or post your music. A yes becomes a clear next step in Moves.",
    when: "Someone accepts a pitch or books you",
  },
  sync: {
    title: "Sync & briefs",
    meaning:
      "Film, ads, games looking for music. Omniv drops the brief in Moves so you (or Ziki) can pitch the right track.",
    when: "A brief matches your sound",
  },
  spotify: {
    title: "Spotify",
    meaning:
      "Connect so Omniv can see popularity trends — better ranking on Opportunities, less guesswork.",
    when: "Once, in Settings",
  },
  flutterwave: {
    title: "Getting paid",
    meaning:
      "Tickets and tips go to your payout account. Set this once so money doesn't sit on the platform.",
    when: "Before your first paid room or tip link",
  },
  radio: {
    title: "Radio & press",
    meaning:
      "Airplay or a press hit can land as an alert so you reply while it's hot.",
    when: "Spin · interview · feature",
  },
};

export function PartnersPanel() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://www.omniv.media");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
    if (!isSupabaseConfigured()) return;
    void (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) setUserId(user.id);
      } catch {
        /* soft */
      }
    })();
  }, []);

  async function tryExample(p: PartnerDef) {
    if (p.path !== "webhook") {
      setMsg(
        p.path === "oauth"
          ? "Open Settings and connect Spotify — one tap, then you're done."
          : "Open Settings and add your payout details so tips and tickets reach you."
      );
      return;
    }
    setBusyId(p.id);
    setMsg(null);
    try {
      const res = await fetch("/api/partners/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: p.id }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        actionType?: string;
        hint?: string;
      };
      if (!res.ok) {
        setMsg(
          data.error?.includes("SECRET")
            ? "Example alerts aren't switched on for this server yet. Your team can turn them on — you don't need to fix this yourself."
            : data.error || data.hint || "Couldn't send the example. Try again."
        );
        return;
      }
      setMsg(
        "Example alert sent. Open Moves — you'll see a card you can confirm or dismiss. That's how real news will feel too."
      );
    } catch {
      setMsg("Network glitch. Try once more.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="mt-5 space-y-4 p-5">
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15">
          <Bell className="h-4 w-4 text-omniv-gold" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Industry alerts
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-omniv-text-secondary">
            When something happens outside Omniv — release live, playlist add,
            sync brief — it can show up in{" "}
            <Link href="/notifications" className="font-medium text-omniv-gold">
              Moves
            </Link>{" "}
            as a card. You confirm what to do next. No spreadsheet. No waiting
            until you notice three days late.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-omniv-gold/25 bg-omniv-gold/5 px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-omniv-gold">
          <Sparkles className="h-3.5 w-3.5" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">
            How it works for you
          </p>
        </div>
        <ol className="mt-2 space-y-1.5 text-[12px] text-omniv-text-secondary">
          <li>
            <span className="font-medium text-omniv-text">1.</span> News arrives
            (live release, playlist, brief…)
          </li>
          <li>
            <span className="font-medium text-omniv-text">2.</span> You get a
            card in Moves — one clear action
          </li>
          <li>
            <span className="font-medium text-omniv-text">3.</span> Tap confirm —
            draft the thank-you, open the room, update the catalogue
          </li>
        </ol>
        <Link href="/notifications" className="mt-3 inline-block">
          <Button size="sm" className="h-9 rounded-xl text-[12px]">
            Open Moves
          </Button>
        </Link>
      </div>

      {msg && (
        <p className="rounded-xl border border-omniv-border bg-omniv-card px-3 py-2 text-[12px] leading-snug text-omniv-text-secondary">
          {msg}
        </p>
      )}

      <ul className="space-y-2.5">
        {PARTNERS.map((p) => {
          const copy = ARTIST_COPY[p.id] || {
            title: p.name,
            meaning: p.blurb,
            when: p.docsHint,
          };
          return (
            <li
              key={p.id}
              className="rounded-2xl border border-omniv-border bg-omniv-black/20 px-3.5 py-3"
            >
              <p className="text-[13px] font-semibold tracking-tight">
                {copy.title}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-omniv-text-secondary">
                {copy.meaning}
              </p>
              <p className="mt-1.5 text-[10px] text-omniv-text-muted">
                Shows up when: {copy.when}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {p.path === "webhook" ? (
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 rounded-xl text-[12px]"
                    disabled={busyId === p.id}
                    onClick={() => void tryExample(p)}
                  >
                    {busyId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    See example in Moves
                  </Button>
                ) : (
                  <Link href="/settings">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl text-[12px]"
                    >
                      {p.path === "oauth" ? "Connect Spotify" : "Set up payout"}
                    </Button>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-omniv-border/80 px-3 py-2 text-left text-[11px] text-omniv-text-muted"
        onClick={() => setShowTech((v) => !v)}
      >
        <span>For your manager / developer (optional)</span>
        {showTech ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {showTech && (
        <div className="space-y-2 rounded-xl border border-omniv-border bg-omniv-elevated/50 px-3 py-2.5 text-[11px] text-omniv-text-muted">
          <p>
            Hook for tools that send events:{" "}
            <span className="break-all font-mono text-omniv-text-secondary">
              {origin}/api/agent/webhook
            </span>
          </p>
          {userId && (
            <p className="break-all font-mono">
              userId: {userId}{" "}
              <button
                type="button"
                className="text-omniv-gold"
                onClick={() => {
                  void navigator.clipboard.writeText(userId);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </p>
          )}
          <p>
            You never need this day to day. Only if a distributor or playlist
            tool is wiring alerts for you.
          </p>
        </div>
      )}
    </Card>
  );
}
