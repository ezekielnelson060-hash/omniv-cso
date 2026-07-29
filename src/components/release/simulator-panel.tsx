"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { simulateRelease } from "@/data/phase4";
import { Rocket, Upload, Loader2 } from "lucide-react";

export function SimulatorPanel() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof simulateRelease> | null>(
    null
  );

  async function run(name: string) {
    setBusy(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(simulateRelease(name || "Afterglow.wav"));
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-omniv-gold/15">
            <Upload className="h-5 w-5 text-omniv-gold" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Upload unreleased media</h2>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Audio or video — commercial potential, timing, risk, full launch plan
            </p>
          </div>
          <Button
            onClick={() => void run("Afterglow-demo.wav")}
            disabled={busy}
            className="gap-2"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            {busy ? "Simulating…" : "Run sample simulation"}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="animate-fade-in-up space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="gold">{result.title}</Badge>
            <span className="text-xs text-omniv-text-muted">
              Best drop: {result.bestReleaseDate}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Commercial", result.commercialPotential],
              ["Viral", result.viralPotential],
              ["Playlist", result.playlistPotential],
              ["Risk", result.riskScore],
            ].map(([label, val]) => (
              <Card key={label as string} className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-omniv-gold">{val}</p>
              </Card>
            ))}
          </div>
          <Card className="p-5">
            <h3 className="text-sm font-medium">Timing rationale</h3>
            <p className="mt-2 text-sm text-omniv-text-secondary">
              {result.timingRationale}
            </p>
            <h3 className="mt-4 text-sm font-medium">Marketing</h3>
            <ul className="mt-2 space-y-1 text-sm text-omniv-text-secondary">
              {result.marketingStrategy.map((m) => (
                <li key={m}>· {m}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
