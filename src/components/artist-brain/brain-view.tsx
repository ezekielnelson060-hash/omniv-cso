"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getArtistBrain, saveArtistBrain } from "@/lib/db/profile";
import type { ArtistBrain, CareerStage } from "@/types";
import { Brain, Loader2, Check, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-omniv-text-muted">
        <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
        Loading Artist Brain…
      </div>
    );
  }

  if (!brain) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-omniv-text-secondary">
          No Artist Brain yet. Complete onboarding first.
        </p>
        <Link href="/onboarding" className="mt-4 inline-block">
          <Button size="sm">Start onboarding</Button>
        </Link>
      </Card>
    );
  }

  const field =
    "w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3.5 py-2.5 text-sm text-omniv-text outline-none transition focus:border-omniv-gold/50 focus:ring-1 focus:ring-omniv-gold/30";
  const labelCls =
    "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-omniv-text-muted";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-omniv-gold/20 bg-omniv-gold/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-omniv-gold/15">
            <Brain className="h-5 w-5 text-omniv-gold" />
          </div>
          <div>
            <Badge variant="gold">Editable memory</Badge>
            <p className="mt-1.5 text-sm text-omniv-text-secondary">
              Every change rewires scores, Opportunity Feed, and Ziki. Save when
              you update positioning.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/ziki">
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Ask Ziki
            </Button>
          </Link>
          <Button size="sm" onClick={() => void onSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving
              </>
            ) : saved ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Saved
              </>
            ) : (
              "Save Brain"
            )}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Identity</h2>
          <div>
            <label className={labelCls}>Stage name</label>
            <input
              className={field}
              value={brain.stageName || brain.name}
              onChange={(e) => {
                patch("stageName", e.target.value);
                patch("name", e.target.value);
              }}
              placeholder="How the industry should say your name"
            />
          </div>
          <div>
            <label className={labelCls}>Genre (comma-separated)</label>
            <input
              className={field}
              value={listToText(brain.genre)}
              onChange={(e) => patch("genre", textToList(e.target.value))}
              placeholder="Afrobeats, Alté, Amapiano"
            />
          </div>
          <div>
            <label className={labelCls}>Career stage</label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => patch("careerStage", s.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition",
                    brain.careerStage === s.id
                      ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                      : "border-omniv-border text-omniv-text-muted hover:border-omniv-gold/30"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Music style</label>
            <textarea
              className={cn(field, "min-h-[72px] resize-y")}
              value={brain.musicStyle}
              onChange={(e) => patch("musicStyle", e.target.value)}
              placeholder="Tempo, mood, production character"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Positioning</h2>
          <div>
            <label className={labelCls}>Brand voice</label>
            <textarea
              className={cn(field, "min-h-[72px] resize-y")}
              value={brain.brandVoice}
              onChange={(e) => patch("brandVoice", e.target.value)}
              placeholder="How you speak on and off record"
            />
          </div>
          <div>
            <label className={labelCls}>Visual identity</label>
            <textarea
              className={cn(field, "min-h-[72px] resize-y")}
              value={brain.visualIdentity}
              onChange={(e) => patch("visualIdentity", e.target.value)}
              placeholder="Palette, framing, references"
            />
          </div>
          <div>
            <label className={labelCls}>Target audience</label>
            <textarea
              className={cn(field, "min-h-[72px] resize-y")}
              value={brain.targetAudience}
              onChange={(e) => patch("targetAudience", e.target.value)}
              placeholder="Who should care first"
            />
          </div>
          <div>
            <label className={labelCls}>Content style</label>
            <input
              className={field}
              value={brain.contentStyle}
              onChange={(e) => patch("contentStyle", e.target.value)}
              placeholder="Documentary, performance, lifestyle…"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Strategy</h2>
          <div>
            <label className={labelCls}>Goals (comma-separated)</label>
            <textarea
              className={cn(field, "min-h-[72px] resize-y")}
              value={listToText(brain.goals)}
              onChange={(e) => patch("goals", textToList(e.target.value))}
              placeholder="Playlist growth, sold-out room, sync"
            />
          </div>
          <div>
            <label className={labelCls}>Strengths</label>
            <input
              className={field}
              value={listToText(brain.strengths)}
              onChange={(e) => patch("strengths", textToList(e.target.value))}
            />
          </div>
          <div>
            <label className={labelCls}>Gaps to close</label>
            <input
              className={field}
              value={listToText(brain.weaknesses)}
              onChange={(e) => patch("weaknesses", textToList(e.target.value))}
            />
          </div>
          <div>
            <label className={labelCls}>Peers / competitors</label>
            <input
              className={field}
              value={listToText(brain.competitors)}
              onChange={(e) => patch("competitors", textToList(e.target.value))}
              placeholder="Acts in your lane"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Notes</h2>
          <div>
            <label className={labelCls}>Private strategy notes</label>
            <textarea
              className={cn(field, "min-h-[160px] resize-y")}
              value={brain.notes}
              onChange={(e) => patch("notes", e.target.value)}
              placeholder="Context Ziki should always remember"
            />
          </div>
          <p className="text-[11px] text-omniv-text-muted">
            Last saved {brain.lastUpdated || "—"}
          </p>
        </section>
      </div>

      <div className="flex justify-end gap-2 border-t border-omniv-border pt-4">
        <Button variant="outline" size="sm" onClick={() => void onSave()} disabled={saving}>
          {saving ? "Saving…" : "Save Artist Brain"}
        </Button>
      </div>
    </div>
  );
}
