"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Film, Sparkles, Loader2, Upload } from "lucide-react";

const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "X"];

export function IntelligencePanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [studio, setStudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          notes: `Generate platform-native content system for: ${brief}. Platform: ${platform}`,
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
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-omniv-gold/15">
            <Film className="h-5 w-5 text-omniv-gold" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Analyse your content</h2>
            <p className="text-sm text-omniv-text-secondary">
              Upload a clip or describe it — personalized scores, not sample demos
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
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="gap-2"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {busy ? "Analysing…" : "Upload & analyse"}
          </Button>
        </div>
        {fileName && (
          <p className="mt-2 font-data text-[11px] text-omniv-text-muted">
            {fileName}
          </p>
        )}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Context: hook idea, target audience, campaign…"
          className="mt-3 w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
        />
      </Card>

      {error && <p className="text-xs text-omniv-danger">{error}</p>}

      {result && (
        <Card className="animate-fade-in-up border-omniv-gold/20 p-5">
          <Badge variant="gold">Content intelligence</Badge>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-omniv-text-secondary">
            {result}
          </pre>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="text-sm font-medium">Content Studio</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={
                platform === p
                  ? "rounded-full border border-omniv-gold/40 bg-omniv-gold/10 px-3 py-1 text-xs text-omniv-gold"
                  : "rounded-full border border-omniv-border px-3 py-1 text-xs text-omniv-text-muted"
              }
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Release title or topic"
          />
          <Button onClick={() => void genStudio()} disabled={busy || !brief.trim()} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </Button>
        </div>
        {studio && (
          <pre className="mt-4 whitespace-pre-wrap rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated p-4 text-xs text-omniv-text-secondary">
            {studio}
          </pre>
        )}
      </Card>
    </div>
  );
}
