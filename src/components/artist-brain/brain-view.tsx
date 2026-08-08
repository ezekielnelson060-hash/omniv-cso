"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getArtistBrain, saveArtistBrain } from "@/lib/db/profile";
import type { ArtistBrain, CareerStage } from "@/types";
import {
  Brain,
  Loader2,
  Check,
  MessageSquare,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrainJourney } from "@/components/artist-brain/brain-journey";

const STAGES: { id: CareerStage; label: string }[] = [
  { id: "emerging", label: "Emerging" },
  { id: "developing", label: "Developing" },
  { id: "breakthrough", label: "Breakthrough" },
  { id: "established", label: "Established" },
  { id: "legacy", label: "Legacy" },
];

const emptyBrain = (): ArtistBrain => ({
  name: "",
  stageName: "",
  genre: [],
  subGenre: [],
  musicStyle: "",
  brandVoice: "",
  visualIdentity: "",
  targetAudience: "",
  careerStage: "emerging",
  strengths: [],
  weaknesses: [],
  goals: [],
  bigDream: "",
  pastReleases: [],
  contentStyle: "",
  competitors: [],
  notes: "",
  lastUpdated: new Date().toISOString().slice(0, 10),
});

function listToText(arr: string[]) {
  return (arr || []).join(", ");
}
function textToList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-omniv-text-muted">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="block text-[11px] text-omniv-text-muted/80">{hint}</span>
      ) : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-omniv-border bg-omniv-black/40 px-3 py-2.5 text-sm text-omniv-text placeholder:text-omniv-text-muted/50 focus-gold";

export function BrainView() {
  const [brain, setBrain] = useState<ArtistBrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const b = await getArtistBrain();
        if (!cancelled) setBrain(b || emptyBrain());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function patch<K extends keyof ArtistBrain>(key: K, value: ArtistBrain[K]) {
    setBrain((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function onSave() {
    if (!brain) return;
    setSaving(true);
    setError(null);
    const payload: ArtistBrain = {
      ...brain,
      name: brain.stageName || brain.name || "Artist",
      bigDream: brain.bigDream?.trim() || brain.goals?.[0] || "",
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    const res = await saveArtistBrain(payload);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "Could not save");
      return;
    }
    setBrain(payload);
    setSaved(true);
  }

  if (loading || !brain) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-omniv-text-muted">
        <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
        Loading Artist Brain…
      </div>
    );
  }

  const dream =
    brain.bigDream?.trim() ||
    brain.goals?.[0] ||
    "Name the career image you refuse to dilute.";

  const zikiHref = `/ziki?q=${encodeURIComponent(
    `Hold my Big Dream and give me this week's highest-impact moves toward it: ${dream}`
  )}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
            Strategy
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Brain className="h-4 w-4 text-omniv-gold" />
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">
              Artist Brain
            </h1>
          </div>
          <p className="mt-1 max-w-md text-[12px] text-omniv-text-secondary">
            Operating picture for Ziki and Command Center. Vague brain, vague
            moves.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={zikiHref}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Walk the dream in Ziki
            </Button>
          </Link>
          <Button size="sm" onClick={() => void onSave()} disabled={saving}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
            <span className="ml-1">{saved ? "Saved" : "Save brain"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      <Card className="relative overflow-hidden border-omniv-gold/25 bg-gradient-to-br from-omniv-gold/[0.07] via-omniv-card to-omniv-card p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-omniv-gold/10 blur-3xl" />
        <div className="flex items-center gap-2 text-omniv-gold">
          <Target className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            Big Dream
          </span>
        </div>
        <p className="mt-3 text-[15px] font-medium leading-relaxed tracking-tight text-omniv-text">
          {dream}
        </p>
        <textarea
          className={cn(inputClass, "mt-4 min-h-[88px] resize-y")}
          value={brain.bigDream || ""}
          placeholder="e.g. Headlining 2k rooms across West Africa within 24 months while owning my masters and a direct fan list of 50k."
          onChange={(e) => patch("bigDream", e.target.value)}
        />
      </Card>

      <BrainJourney brain={brain} dream={dream} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Stage name">
          <input
            className={inputClass}
            value={brain.stageName || brain.name}
            onChange={(e) => {
              patch("stageName", e.target.value);
              patch("name", e.target.value);
            }}
          />
        </Field>
        <Field label="Career stage">
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => patch("careerStage", s.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  brain.careerStage === s.id
                    ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                    : "border-omniv-border text-omniv-text-muted hover:border-omniv-gold/30"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Genre" hint="Comma-separated">
          <input
            className={inputClass}
            value={listToText(brain.genre)}
            onChange={(e) => patch("genre", textToList(e.target.value))}
          />
        </Field>
        <Field label="Music style">
          <input
            className={inputClass}
            value={brain.musicStyle}
            onChange={(e) => patch("musicStyle", e.target.value)}
          />
        </Field>
        <Field label="Brand voice">
          <input
            className={inputClass}
            value={brain.brandVoice}
            onChange={(e) => patch("brandVoice", e.target.value)}
          />
        </Field>
        <Field label="Target audience">
          <input
            className={inputClass}
            value={brain.targetAudience}
            onChange={(e) => patch("targetAudience", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Near-term goals"
        hint="Supporting targets under the Big Dream (comma-separated)"
      >
        <textarea
          className={cn(inputClass, "min-h-[72px] resize-y")}
          value={listToText(brain.goals)}
          onChange={(e) => patch("goals", textToList(e.target.value))}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Strengths" hint="Comma-separated">
          <textarea
            className={cn(inputClass, "min-h-[72px] resize-y")}
            value={listToText(brain.strengths)}
            onChange={(e) => patch("strengths", textToList(e.target.value))}
          />
        </Field>
        <Field label="Gaps" hint="What a manager would fix first">
          <textarea
            className={cn(inputClass, "min-h-[72px] resize-y")}
            value={listToText(brain.weaknesses)}
            onChange={(e) => patch("weaknesses", textToList(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Notes for Ziki">
        <textarea
          className={cn(inputClass, "min-h-[88px] resize-y")}
          value={brain.notes}
          onChange={(e) => patch("notes", e.target.value)}
          placeholder="Catalogue context, team, constraints, non-negotiables…"
        />
      </Field>

      <div className="flex items-center justify-between border-t border-omniv-border pt-4">
        <Badge variant="outline" className="text-[10px]">
          Updated {brain.lastUpdated}
        </Badge>
        <Button onClick={() => void onSave()} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save Artist Brain"}
        </Button>
      </div>
    </div>
  );
}
