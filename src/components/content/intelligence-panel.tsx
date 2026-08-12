"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Film,
  Sparkles,
  Loader2,
  Upload,
  Music2,
  Clapperboard,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "X"];

type TrendSound = {
  id: string;
  label: string;
  why: string;
  platform: string;
  action: string;
};

type TabId = "trends" | "analyse" | "studio";

export function IntelligencePanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabId>("trends");
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [studio, setStudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sounds, setSounds] = useState<TrendSound[]>([]);
  const [genreLabel, setGenreLabel] = useState("");
  const [trendNote, setTrendNote] = useState("");
  const [loadingTrends, setLoadingTrends] = useState(true);

  const loadTrends = useCallback(async () => {
    setLoadingTrends(true);
    try {
      const res = await fetch("/api/content/trending");
      const data = (await res.json()) as {
        sounds?: TrendSound[];
        genre?: string[];
        note?: string;
      };
      setSounds(data.sounds || []);
      setGenreLabel((data.genre || []).slice(0, 2).join(" · ") || "Your style");
      setTrendNote(data.note || "");
    } catch {
      setSounds([]);
    } finally {
      setLoadingTrends(false);
    }
  }, []);

  useEffect(() => {
    void loadTrends();
  }, [loadTrends]);

  async function analyse(file?: File | null) {
    const name = file?.name || fileName || brief || "content-piece";
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "content",
          fileName: name,
          fileType: file?.type || "video",
          notes: [notes, brief].filter(Boolean).join(" | "),
          platform,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) setError(data.error || "Analysis failed");
      else setResult(data.text || "");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function genStudio() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "content",
          fileName: brief || "studio-brief",
          notes: `Generate platform-native content system for: ${brief || "this week's release push"}. Platform: ${platform}. Include: 3 hook scripts (15s), 3 captions (soft CTA), 1 duet angle, BPM/sound guidance for ${genreLabel || "my genre"}.`,
          platform,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) setError(data.error || "Generate failed");
      else setStudio(data.text || "");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 -mx-3 border-b border-omniv-border/80 bg-omniv-black/95 px-3 py-2.5 backdrop-blur-md sm:-mx-4 sm:px-4 md:mx-0 md:rounded-2xl md:border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              Content
            </p>
            <p className="text-[13px] font-semibold tracking-tight">
              Sounds · hooks · ship
            </p>
          </div>
          <Link
            href="/release-simulator"
            className="text-[11px] font-medium text-omniv-gold"
          >
            Release →
          </Link>
        </div>
        <div className="mt-2.5 flex gap-1 overflow-x-auto pb-0.5">
          {(
            [
              { id: "trends" as const, label: "Trending" },
              { id: "analyse" as const, label: "Analyse" },
              { id: "studio" as const, label: "Studio" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
                tab === item.id
                  ? "bg-omniv-gold text-omniv-black"
                  : "border border-omniv-border bg-omniv-card/50 text-omniv-text-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-omniv-danger">{error}</p>}

      {tab === "trends" && (
        <div className="space-y-3">
          <Card className="border-omniv-gold/20 bg-omniv-gold/5 p-3.5">
            <div className="flex items-start gap-2">
              <Music2 className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
              <div>
                <p className="text-[13px] font-semibold">
                  Sounds for {genreLabel || "your lane"}
                </p>
                <p className="mt-1 text-[12px] text-omniv-text-secondary">
                  Matched to Artist Brain genre/style so clips pull the right
                  fans — not random viral noise.
                </p>
              </div>
            </div>
          </Card>

          {loadingTrends ? (
            <p className="flex items-center gap-2 text-[12px] text-omniv-text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading angles…
            </p>
          ) : (
            sounds.map((s) => (
              <Card key={s.id} className="p-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="gold">{s.platform}</Badge>
                  <span className="text-[13px] font-semibold">{s.label}</span>
                </div>
                <p className="mt-2 text-[12px] leading-snug text-omniv-text-secondary">
                  {s.why}
                </p>
                <p className="mt-2 text-[11px] font-medium text-omniv-gold">
                  → {s.action}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-lg text-[11px]"
                    onClick={() => {
                      setTab("studio");
                      setBrief(
                        `${s.label} for ${genreLabel || "my genre"} on ${s.platform}. ${s.why} Action: ${s.action}`
                      );
                    }}
                  >
                    Write scripts
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg text-[11px]"
                    asChild
                  >
                    <Link href="/release-simulator">Lock release date</Link>
                  </Button>
                  {s.id === "release-tease" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg text-[11px]"
                      asChild
                    >
                      <Link href="/crm?tab=money">Tip link</Link>
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))
          )}

          {trendNote && (
            <p className="text-[10px] text-omniv-text-muted">{trendNote}</p>
          )}

          <Button
            className="h-10 w-full gap-1.5 rounded-xl"
            onClick={() => {
              setTab("studio");
              setBrief(
                `Hooks and captions for ${genreLabel || "my genre"} this week`
              );
            }}
          >
            <Clapperboard className="h-4 w-4" />
            Generate this week’s scripts
          </Button>
        </div>
      )}

      {tab === "analyse" && (
        <div className="space-y-3">
          <Card className="p-3.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15">
                <Film className="h-4 w-4 text-omniv-gold" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold">Analyse a clip</h2>
                <p className="text-[11px] text-omniv-text-muted">
                  Hook strength, clarity, CTA — for the platform you post on
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="video/*,image/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFileName(f.name);
                    void analyse(f);
                  }
                }}
              />
              <Button
                size="sm"
                className="h-9 gap-1 rounded-xl text-[11px]"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {busy ? "Analysing…" : "Upload"}
              </Button>
            </div>
            {fileName && (
              <p className="mt-1.5 font-data text-[10px] text-omniv-text-muted">
                {fileName}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px]",
                    platform === p
                      ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                      : "border-omniv-border text-omniv-text-muted"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Context: hook, audience, campaign…"
              className="mt-2 w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-[13px] focus-gold"
            />
            <Button
              className="mt-2 h-9 rounded-xl"
              variant="outline"
              disabled={busy}
              onClick={() => void analyse(null)}
            >
              Analyse description
            </Button>
          </Card>

          {result && (
            <Card className="border-omniv-gold/20 p-3.5">
              <Badge variant="gold">Intelligence</Badge>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px] leading-snug text-omniv-text-secondary">
                {result}
              </pre>
            </Card>
          )}
        </div>
      )}

      {tab === "studio" && (
        <div className="space-y-3">
          <Card className="p-3.5">
            <h3 className="text-[13px] font-semibold">Studio brief</h3>
            <p className="mt-1 text-[11px] text-omniv-text-muted">
              Get scripts, captions, and duet angles — then shoot.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px]",
                    platform === p
                      ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                      : "border-omniv-border text-omniv-text-muted"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              placeholder="e.g. Tease new single, soft tip CTA…"
              className="mt-2 w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-[13px] focus-gold"
            />
            <Button
              className="mt-2 h-10 w-full gap-1.5 rounded-xl"
              disabled={busy}
              onClick={() => void genStudio()}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate system
            </Button>
          </Card>

          {studio && (
            <Card className="border-omniv-gold/20 p-3.5">
              <Badge variant="gold">Studio pack</Badge>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px] leading-snug text-omniv-text-secondary">
                {studio}
              </pre>
              <p className="mt-3 text-[11px] text-omniv-text-muted">
                Next: shoot one clip today. Soft tip or room link only on the last post.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/release-simulator">
                  <Button
                    variant="outline"
                    className="h-9 w-full gap-1 rounded-xl text-[12px]"
                  >
                    Lock a release date
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Link href="/crm?tab=money" className="flex-1">
                    <Button variant="outline" className="h-9 w-full rounded-xl text-[12px]">
                      Tip link
                    </Button>
                  </Link>
                  <Link href="/crm?tab=rooms" className="flex-1">
                    <Button variant="outline" className="h-9 w-full rounded-xl text-[12px]">
                      Open room
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
