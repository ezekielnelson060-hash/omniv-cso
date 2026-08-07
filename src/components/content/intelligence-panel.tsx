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
    <div className="space-y-3">
      <Card className="p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15">
            <Film className="h-4 w-4 text-omniv-gold" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Analyse content</h2>
            <p className="text-[11px] text-omniv-text-muted">
              Upload or describe — personalized, not sample demos
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
            className="h-8 gap-1 text-[11px]"
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
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Context: hook, audience, campaign…"
          className="mt-2 w-full rounded-lg border border-omniv-border bg-omniv-elevated px-2.5 py-1.5 text-[13px] focus-gold"
        />
      </Card>

      {error && <p className="text-xs text-omniv-danger">{error}</p>}

      {result && (
        <Card className="border-omniv-gold/20 p-3">
          <Badge variant="gold">Intelligence</Badge>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px] leading-snug text-omniv-text-secondary">
            {result}
          </pre>
        </Card>
      )}

      <Card className="p-3">
        <h3 className="text-[13px] font-medium">Studio</h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={
                platform === p
                  ? "rounded-full border border-omniv-gold/40 bg-omniv-gold/10 px-2.5 py-0.5 text-[10px] text-omniv-gold"
                  : "rounded-full border border-omniv-border px-2.5 py-0.5 text-[10px] text-omniv-text-muted"
              }
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-1.5 sm:flex-row">
          <Input
            className="h-8 text-xs"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Release title or topic"
          />
          <Button
            size="sm"
            className="h-8 gap-1 text-[11px]"
            onClick={() => void genStudio()}
            disabled={busy || !brief.trim()}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </Button>
        </div>
        {studio && (
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-omniv-border bg-omniv-elevated p-2.5 text-[11px] text-omniv-text-secondary">
            {studio}
          </pre>
        )}
      </Card>
    </div>
  );
}
