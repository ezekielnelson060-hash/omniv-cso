"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  formatListeners,
  mockManagers,
  mockRoster,
} from "@/data/crm";
import { cn, scoreColor } from "@/lib/utils";
import {
  Building2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export function LabelPanel() {
  const totalListeners = mockRoster.reduce((a, r) => a + r.monthlyListeners, 0);
  const avgScore = Math.round(
    mockRoster.reduce((a, r) => a + r.score, 0) / mockRoster.length
  );
  const sorted = [...mockRoster].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="glass-gold glow-gold rounded-[var(--radius-xl)] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-omniv-gold/20">
            <Building2 className="h-5 w-5 text-omniv-gold" />
          </div>
          <div>
            <Badge variant="gold">Label portfolio</Badge>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Blackwave Records
            </h2>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Portfolio overview across managers and artists — growth, comparison,
              and AI insights
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Artists
          </p>
          <p className="mt-1 text-2xl font-semibold">{mockRoster.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Managers
          </p>
          <p className="mt-1 text-2xl font-semibold">{mockManagers.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Combined listeners
          </p>
          <p className="mt-1 text-2xl font-semibold text-omniv-gold">
            {formatListeners(totalListeners)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Avg artist score
          </p>
          <p className={cn("mt-1 text-2xl font-semibold", scoreColor(avgScore))}>
            {avgScore}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-omniv-gold" />
            <h3 className="text-sm font-medium text-omniv-text">Managers</h3>
          </div>
          <div className="space-y-2">
            {mockManagers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated/50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-omniv-text">{m.name}</p>
                  <p className="text-[11px] text-omniv-text-muted">
                    {m.artists} artists
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-omniv-success">
                  <TrendingUp className="h-3.5 w-3.5" />+{m.growth}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-omniv-gold" />
            <h3 className="text-sm font-medium text-omniv-text">
              Artist comparison
            </h3>
          </div>
          <div className="space-y-3">
            {sorted.map((a) => (
              <div key={a.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-omniv-text-secondary">{a.name}</span>
                  <span className={cn("font-medium", scoreColor(a.score))}>
                    {a.score} · {formatListeners(a.monthlyListeners)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-omniv-gold transition-all"
                    style={{ width: `${a.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium text-omniv-text">
          Campaign overview
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              name: "Afterglow rollout",
              artist: "NOVA HEX",
              status: "Active",
              progress: 62,
            },
            {
              name: "Night Run EP",
              artist: "Ash Circuit",
              status: "Pre-save",
              progress: 38,
            },
            {
              name: "Mira recovery",
              artist: "Mira Sol",
              status: "Planning",
              progress: 15,
            },
          ].map((c) => (
            <div
              key={c.name}
              className="rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated/40 p-3"
            >
              <p className="text-sm font-medium text-omniv-text">{c.name}</p>
              <p className="text-[11px] text-omniv-text-muted">
                {c.artist} · {c.status}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-omniv-gold"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-omniv-gold/20 bg-omniv-gold/5 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium text-omniv-text">AI label insights</h3>
        </div>
        <ul className="space-y-2 text-sm leading-relaxed text-omniv-text-secondary">
          <li>
            · Portfolio momentum is positive overall; Ash Circuit and NOVA HEX
            are the growth engines this quarter.
          </li>
          <li>
            · Mira Sol is the primary risk node — prioritise recovery campaign
            before the next roster review.
          </li>
          <li>
            · Manager growth is healthy; Alex Chen’s book is outperforming —
            consider capacity for one more developing act.
          </li>
        </ul>
      </Card>
    </div>
  );
}
