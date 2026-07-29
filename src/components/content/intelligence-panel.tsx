"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  analyseContent,
  generateStudio,
  predictViral,
  studioPlatforms,
} from "@/data/phase4";
import { Film, Sparkles, Loader2 } from "lucide-react";

export function IntelligencePanel() {
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyseContent> | null>(null);
  const [viral, setViral] = useState<ReturnType<typeof predictViral> | null>(null);
  const [studio, setStudio] = useState("");
  const [brief, setBrief] = useState("Afterglow");
  const [platform, setPlatform] = useState<string>("TikTok");

  async function analyse() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setAnalysis(analyseContent("studio-take.mp4"));
    setViral(predictViral("studio-take.mp4"));
    setBusy(false);
  }

  function gen() {
    setStudio(generateStudio(platform, brief).content);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-omniv-gold/15">
            <Film className="h-5 w-5 text-omniv-gold" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Analyse content</h2>
            <p className="text-sm text-omniv-text-secondary">
              Hooks, retention, viral prediction, studio copy
            </p>
          </div>
          <Button onClick={() => void analyse()} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Analysing…" : "Run sample analysis"}
          </Button>
        </div>
      </Card>

      {analysis && viral && (
        <div className="animate-fade-in-up grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <Badge variant="gold">Overall {analysis.overall}</Badge>
            <h3 className="mt-2 text-sm font-medium">Scores</h3>
            <ul className="mt-2 space-y-1 text-sm text-omniv-text-secondary">
              <li>Hook {analysis.hookScore} · Retention {analysis.retentionScore}</li>
              <li>Editing {analysis.editingScore} · Emotion {analysis.emotionScore}</li>
            </ul>
            <h3 className="mt-4 text-sm font-medium">Improvements</h3>
            <ul className="mt-1 space-y-1 text-xs text-omniv-text-secondary">
              {analysis.improvements.map((i) => (
                <li key={i}>· {i}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <Badge variant="gold">Viral {viral.overallViral}</Badge>
            <h3 className="mt-2 text-sm font-medium">Why</h3>
            <ul className="mt-1 space-y-1 text-xs text-omniv-text-secondary">
              {viral.why.map((w) => (
                <li key={w}>· {w}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-medium">Risks</h3>
            <ul className="mt-1 space-y-1 text-xs text-omniv-text-secondary">
              {viral.risks.map((w) => (
                <li key={w}>· {w}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <Card className="p-5">
        <h3 className="text-sm font-medium">Content Studio</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {studioPlatforms.map((p) => (
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
            placeholder="Release or topic"
          />
          <Button onClick={gen}>Generate</Button>
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
