"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  Loader2,
  Target,
  Calendar,
  FileText,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import {
  computeScoresFromBrain,
  buildRecommendationsFromBrain,
  overallNarrative,
} from "@/lib/strategy/scores";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { ArtistBrain, ArtistScore, AIRecommendation } from "@/types";

const COMMANDS = [
  {
    id: "priority",
    label: "What you should do now",
    prompt:
      "You are watching my profile. Tell me the single move I must make this week. No alternatives.",
    icon: Target,
  },
  {
    id: "release",
    label: "Would you release?",
    prompt:
      "Look at my readiness. Would you let me release this cycle? Go, Caution, or Hold — and why.",
    icon: Calendar,
  },
  {
    id: "content",
    label: "What ships this week",
    prompt:
      "You know my stage and surfaces. Tell me exactly what content ships this week and why that, not more.",
    icon: FileText,
  },
  {
    id: "plan",
    label: "Lock the next 7 days",
    prompt:
      "Build a 7-day execution plan for my top priority only. Cut everything else.",
    icon: Zap,
  },
];

function scoreTone(v: number) {
  if (v >= 70) return "text-omniv-gold";
  if (v >= 45) return "text-amber-400";
  return "text-rose-400";
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [brain, setBrain] = useState<ArtistBrain | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scores, setScores] = useState<ArtistScore | null>(null);
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [name, setName] = useState("your project");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
        if (cancelled) return;
        const plats = p?.platforms || [];
        const display =
          b?.stageName || b?.name || p?.full_name || "your project";
        setName(display);
        setBrain(b);
        setPlatforms(plats);
        setScores(computeScoresFromBrain(b, plats));
        setRecs(buildRecommendationsFromBrain(b, plats));
        track("command_center_view", {
          has_brain: Boolean(b?.name),
          platforms: plats.length,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function runCommand(prompt: string) {
    track("command_center_command", { prompt: prompt.slice(0, 40) });
    router.push(`/ziki?q=${encodeURIComponent(prompt)}`);
  }

  if (loading || !scores) {
    return (
      <AppShell>
        <div className="flex items-center gap-2 py-10 text-xs text-omniv-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
          Reading your week…
        </div>
      </AppShell>
    );
  }

  const s = scores;
  const top = recs[0];
  const narrative = overallNarrative(s, brain);
  const gaps = [
    { key: "Release pressure", value: s.releaseReadiness },
    { key: "Content pulse", value: s.contentHealth },
    { key: "Audience hold", value: s.audienceHealth },
    { key: "Forward motion", value: s.momentum },
  ].sort((a, b) => a.value - b.value);

  return (
    <AppShell>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
              Command
            </p>
            <Badge variant="gold">{name}</Badge>
          </div>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            Center
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link href="/opportunities">
            <Button variant="outline" size="sm" className="h-7 text-[11px]">
              Ranked
            </Button>
          </Link>
          <Link href="/ziki">
            <Button size="sm" className="h-7 gap-1 text-[11px]">
              <MessageSquare className="h-3 w-3" />
              Ziki
            </Button>
          </Link>
        </div>
      </div>

      <section className="mb-3 rounded-xl border border-omniv-gold/30 bg-gradient-to-b from-omniv-gold/10 to-transparent p-3.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          This week
        </p>
        {top ? (
          <>
            <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-omniv-text">
              {top.title}
            </h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-snug text-omniv-text-muted">
              {top.summary || top.why}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-omniv-text-muted">
              {top.timeWindow && <span>{top.timeWindow}</span>}
              <span>{top.confidence}% conf</span>
              <span>{top.impact} impact</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Button
                size="sm"
                className="h-7 gap-1 text-[11px]"
                onClick={() =>
                  runCommand(
                    `Help me execute this opportunity:\n\n${top.title}\n${top.summary || ""}\n\nWhy: ${top.why}\nExpected: ${top.expectedOutcome}\nGive a concrete 7-day plan.`
                  )
                }
              >
                Do this now
                <ArrowRight className="h-3 w-3" />
              </Button>
              <Link href="/opportunities">
                <Button variant="outline" size="sm" className="h-7 text-[11px]">
                  All ranked
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-1 text-[15px] font-semibold">Empty brain</h2>
            <p className="mt-1 text-[12px] text-omniv-text-muted">
              Genre, stage, dream. Lock them or stay generic.
            </p>
            <Link href="/artist-brain" className="mt-2 inline-block">
              <Button size="sm" className="h-7 text-[11px]">
                Fill brain
              </Button>
            </Link>
          </>
        )}
      </section>

      <section className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold tracking-tight">Commands</h2>
          <p className="text-[10px] text-omniv-text-muted">Opens Ziki</p>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {COMMANDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => runCommand(c.prompt)}
              className="group flex items-center gap-2 rounded-lg border border-omniv-border bg-omniv-card px-2.5 py-2 text-left transition hover:border-omniv-gold/40 hover:bg-omniv-gold/5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-omniv-gold/10 text-omniv-gold">
                <c.icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-medium text-omniv-text group-hover:text-omniv-gold">
                  {c.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-3">
        <div className="mb-1.5">
          <h2 className="text-[12px] font-semibold tracking-tight">Stand</h2>
          <p className="text-[10px] text-omniv-text-muted">{narrative}</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-5">
          {[
            { label: "Overall", value: s.overall },
            { label: "Motion", value: s.momentum },
            { label: "Audience", value: s.audienceHealth },
            { label: "Content", value: s.contentHealth },
            { label: "Release", value: s.releaseReadiness },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-omniv-border bg-omniv-card p-2.5"
            >
              <p className="text-[9px] font-medium uppercase tracking-wider text-omniv-text-muted">
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 font-data text-lg font-semibold tabular-nums",
                  scoreTone(item.value)
                )}
              >
                {item.value}
                <span className="text-[10px] font-normal text-omniv-text-muted">
                  /100
                </span>
              </p>
              <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-omniv-gold/80"
                  style={{ width: `${Math.min(100, item.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-omniv-text-muted">
          Softest:{" "}
          <span className="text-omniv-text-secondary">
            {gaps[0]?.key} ({gaps[0]?.value})
          </span>
          . Fix first.
        </p>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold tracking-tight">Next</h2>
          <Link href="/opportunities">
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
              All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          {recs.slice(0, 3).map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} />
          ))}
          {recs.length === 0 && (
            <div className="rounded-lg border border-omniv-border p-3 text-xs text-omniv-text-muted">
              Nothing ranked. Lock genre, stage, dream.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
