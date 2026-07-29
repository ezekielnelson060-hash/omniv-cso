"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getArtistBrain } from "@/lib/db/profile";
import type { ArtistBrain } from "@/types";
import { mockArtistBrain } from "@/data/mock";
import { Brain, Loader2 } from "lucide-react";

export function BrainView() {
  const [brain, setBrain] = useState<ArtistBrain | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const b = await getArtistBrain();
        if (!cancelled) setBrain(b);
      } catch {
        if (!cancelled) setBrain(mockArtistBrain);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !brain) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-omniv-text-muted">
        <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
        Loading Artist Brain…
      </div>
    );
  }

  const b = brain;

  return (
    <div className="space-y-6">
      <div className="glass-gold glow-gold rounded-[var(--radius-xl)] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-omniv-gold/20">
            <Brain className="h-5 w-5 text-omniv-gold" />
          </div>
          <div>
            <Badge variant="gold">Permanent memory</Badge>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {b.stageName ?? b.name}
            </h2>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {b.genre.join(" · ")} · {b.careerStage} · updated {b.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ["Music style", b.musicStyle],
          ["Brand voice", b.brandVoice],
          ["Visual identity", b.visualIdentity],
          ["Target audience", b.targetAudience],
          ["Content style", b.contentStyle],
          ["Notes", b.notes],
        ].map(([title, body]) => (
          <Card key={title as string} className="p-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-omniv-text-secondary">
              {body}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
            Strengths
          </h3>
          <ul className="space-y-1 text-sm text-omniv-text-secondary">
            {b.strengths.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
            Gaps
          </h3>
          <ul className="space-y-1 text-sm text-omniv-text-secondary">
            {b.weaknesses.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
            Goals
          </h3>
          <ul className="space-y-1 text-sm text-omniv-text-secondary">
            {b.goals.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
