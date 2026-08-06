"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { StudioText } from "@/components/ui/studio-text";

const TYPES = [
  { id: "instagram_caption", label: "Instagram captions" },
  { id: "tiktok_script", label: "TikTok / Reels script" },
  { id: "email_subject", label: "Email subjects" },
  { id: "email_body", label: "Email body" },
  { id: "bio_cta", label: "Bio CTA" },
  { id: "release_announcement", label: "Release pack" },
  { id: "story_sequence", label: "Stories sequence" },
] as const;

export function ContentGenerator({ artistName }: { artistName?: string }) {
  const [type, setType] = useState<string>("instagram_caption");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setErr(null);
    setOut(null);
    try {
      const res = await fetch("/api/ziki/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          brief: brief || undefined,
          artistName,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) setErr(data.error || "Failed");
      else setOut(data.text || "");
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-omniv-gold" />
        <h3 className="text-sm font-medium">Ziki content studio</h3>
      </div>
      <p className="mb-4 text-xs text-omniv-text-secondary">
        Generate captions, scripts, and email copy grounded in your strategy voice.
      </p>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={
              type === t.id
                ? "rounded-full border border-omniv-gold/40 bg-omniv-gold/10 px-3 py-1 text-[11px] text-omniv-gold"
                : "rounded-full border border-omniv-border px-3 py-1 text-[11px] text-omniv-text-muted hover:border-omniv-gold/30"
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Input
          placeholder="Brief: e.g. new single drop Friday, Afrobeats, Lagos"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
      </div>
      <Button
        size="sm"
        className="mt-3 gap-1.5"
        disabled={busy}
        onClick={() => void generate()}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {busy ? "Generating…" : "Generate with Ziki"}
      </Button>
      {err && <p className="mt-2 text-xs text-omniv-danger">{err}</p>}
      {out && (
        <div className="mt-4 rounded-xl border border-omniv-gold/20 bg-omniv-gold/5 p-4">
          <StudioText text={out} />
        </div>
      )}
    </Card>
  );
}
