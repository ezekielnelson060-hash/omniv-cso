"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Upload, Loader2 } from "lucide-react";

export function SimulatorPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(file?: File | null) {
    const name = file?.name || fileName || "unreleased-track";
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "release",
          fileName: name,
          fileType: file?.type || "audio/video",
          notes,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) setError(data.error || "Simulation failed");
      else setResult(data.text || "");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-omniv-gold/15">
            <Upload className="h-5 w-5 text-omniv-gold" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Upload unreleased media</h2>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Audio or video — Ziki builds a personalized launch briefing
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFileName(f.name);
                void run(f);
              }
            }}
          />
          <div className="flex flex-wrap justify-center gap-2">
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
              {busy ? "Simulating…" : "Choose file & simulate"}
            </Button>
            {fileName && !busy && (
              <Button
                variant="outline"
                onClick={() => void run()}
                className="gap-2"
              >
                <Rocket className="h-4 w-4" />
                Re-run on {fileName}
              </Button>
            )}
          </div>
          {fileName && (
            <p className="font-data text-[11px] text-omniv-text-muted">{fileName}</p>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Genre, target markets, release constraints…"
            className="mt-2 w-full max-w-md rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
          />
        </div>
      </Card>

      {error && <p className="text-xs text-omniv-danger">{error}</p>}

      {result && (
        <Card className="animate-fade-in-up border-omniv-gold/20 p-5">
          <Badge variant="gold">Release briefing</Badge>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-omniv-text-secondary">
            {result}
          </pre>
        </Card>
      )}
    </div>
  );
}
