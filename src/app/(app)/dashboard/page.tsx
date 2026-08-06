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
        <div className="flex items-center gap-2 py-24 text-sm text-omniv-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Command Center
            </h1>
            <Badge variant="gold">{name}</Badge>
          </div>
          <p className="max-w-xl text-sm text-omniv-text-secondary">
            We see where you stand. One move this week. Everything else is noise
            until this lands.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/opportunities">
            <Button variant="outline" size="sm" className="gap-1.5">
              See what we ranked
            </Button>
          </Link>
          <Link href="/ziki">
            <Button size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Talk to Ziki
            </Button>
          </Link>
        </div>
      </div>

      <section className="mb-6 rounded-[var(--radius-xl)] border border-omniv-gold/30 bg-gradient-to-b from-omniv-gold/10 to-transparent p-5 md:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          You are not skipping this
        </p>
        {top ? (
          <>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-omniv-text md:text-xl">
              {top.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-omniv-text-secondary">
              {top.summary || top.why}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-omniv-text-muted">
              {top.timeWindow && <span>{top.timeWindow}</span>}
              <span>{top.confidence}% confidence</span>
              <span>{top.impact} impact</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  runCommand(
                    `Help me execute this opportunity:\n\n${top.title}\n${top.summary || ""}\n\nWhy: ${top.why}\nExpected: ${top.expectedOutcome}\nGive a concrete 7-day plan.`
                  )
                }
              >
                Do this now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Link href="/opportunities">
                <Button variant="outline" size="sm">
                  Show the rest
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-lg font-semibold">We cannot rank an empty brain</h2>
            <p className="mt-2 text-sm text-omniv-text-secondary">
              Genre, stage, and the dream. Lock them or stay generic.
            </p>
            <Link href="/artist-brain" className="mt-4 inline-block">
              <Button size="sm">Fill what we need</Button>
            </Link>
          </>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">When you stall</h2>
          <p className="text-[11px] text-omniv-text-muted">
            We already know your profile
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {COMMANDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => runCommand(c.prompt)}
              className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card px-3.5 py-3 text-left transition hover:border-omniv-gold/40 hover:bg-omniv-gold/5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-omniv-gold/10 text-omniv-gold">
                <c.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-omniv-text group-hover:text-omniv-gold">
                  {c.label}
                </span>
                <span className="block truncate text-[11px] text-omniv-text-muted">
                  Open with us
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3">
          <h2 className="text-sm font-semibold tracking-tight">Where you stand</h2>
          <p className="mt-0.5 text-xs text-omniv-text-secondary">{narrative}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: "Overall", value: s.overall },
            { label: "Motion", value: s.momentum },
            { label: "Audience", value: s.audienceHealth },
            { label: "Content", value: s.contentHealth },
            { label: "Release", value: s.releaseReadiness },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-4"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-1 font-data text-2xl font-semibold tabular-nums",
                  scoreTone(item.value)
                )}
              >
                {item.value}
                <span className="text-sm font-normal text-omniv-text-muted">/100</span>
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-omniv-gold/80"
                  style={{ width: `${Math.min(100, item.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-omniv-text-muted">
          Softest point:{" "}
          <span className="text-omniv-text-secondary">
            {gaps[0]?.key} ({gaps[0]?.value})
          </span>
          . Fix this first.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Next on your list</h2>
            <p className="text-sm text-omniv-text-secondary">Ranked from what you locked in</p>
          </div>
          <Link href="/opportunities">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {recs.slice(0, 3).map((r, i) => (
            <RecommendationCard key={r.id} recommendation={r} index={i} />
          ))}
          {recs.length === 0 && (
            <div className="rounded-[var(--radius-lg)] border border-omniv-border p-6 text-sm text-omniv-text-secondary">
              Nothing to rank yet. Lock genre, stage, and the dream.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
