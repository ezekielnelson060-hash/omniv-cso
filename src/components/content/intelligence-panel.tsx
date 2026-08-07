"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";

export function IntelligencePanel() {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ziki/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() || undefined, note: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }
      setResult(data.text || data.analysis || JSON.stringify(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="flex items-center gap-1.5 text-omniv-gold">
          <Sparkles className="h-3.5 w-3.5" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
            Scan
          </p>
        </div>
        <p className="mt-1 text-[11px] text-omniv-text-muted">
          Paste a post, video, or brief. Get a personalized read tied to your brain.
        </p>
        <div className="mt-2 space-y-2">
          <Input
            className="h-8 text-xs"
            placeholder="URL (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What you are testing…"
            className="w-full resize-none rounded-lg border border-omniv-border bg-omniv-card px-2.5 py-2 text-[13px] focus-gold"
          />
          <Button
            size="sm"
            className="h-8 gap-1 text-[11px]"
            disabled={busy || (!url.trim() && !note.trim())}
            onClick={() => void run()}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Analyze
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="border-rose-500/30 p-3 text-xs text-rose-300">{error}</Card>
      )}
      {result && (
        <Card className="border-omniv-gold/20 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Result
          </p>
          <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12px] leading-snug text-omniv-text-secondary">
            {result}
          </pre>
        </Card>
      )}
    </div>
  );
}
