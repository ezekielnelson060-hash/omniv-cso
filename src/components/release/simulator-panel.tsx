"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  simulateRelease,
  simulationToPrompt,
  type ReleaseWindowInput,
  type SimulationResult,
} from "@/lib/strategy/release-simulator";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import { addTasksFromChecklist } from "@/lib/execution-tasks";
import { track } from "@/lib/analytics";
import { stashAct } from "@/lib/ziki-memory";
import type { ArtistBrain } from "@/types";
import {
  Rocket,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function defaultDate(daysAhead: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export function SimulatorPanel() {
  const router = useRouter();
  const [brain, setBrain] = useState<ArtistBrain | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [positioning, setPositioning] = useState("");
  const [market, setMarket] = useState("");
  const [releaseDate, setReleaseDate] = useState(defaultDate(21));
  const [alternateDate, setAlternateDate] = useState(defaultDate(35));
  const [contentReady, setContentReady] = useState(false);
  const [ownedListReady, setOwnedListReady] = useState(false);
  const [playlistPitchReady, setPlaylistPitchReady] = useState(false);
  const [budgetBand, setBudgetBand] =
    useState<ReleaseWindowInput["budgetBand"]>("low");
  const [competingNoise, setCompetingNoise] =
    useState<ReleaseWindowInput["competingNoise"]>("normal");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [b, p] = await Promise.all([getArtistBrain(), getProfile()]);
      setBrain(b);
      setPlatforms(p?.platforms || []);
      if (b?.name && !title) setTitle(b.stageName || b.name);
      if (b?.genre?.[0] && b.genre[0] !== "TBD" && !positioning) {
        setPositioning(
          `${b.genre.filter((g) => g !== "TBD").join(" / ")} for listeners who want ${b.musicStyle?.slice(0, 40) || "the real thing"}`
        );
      }
    })();
  }, []);

  async function run() {
    setBusy(true);
    setError(null);
    setBriefing(null);
    try {
      const input: ReleaseWindowInput = {
        title: title || brain?.stageName || "Untitled release",
        genre: brain?.genre?.filter((g) => g !== "TBD").join(" / "),
        primaryMarket: market || "Primary market TBD",
        releaseDate,
        alternateDate: alternateDate || undefined,
        positioning:
          positioning ||
          "Positioning not set — simulator will penalise vague story",
        contentReady,
        ownedListReady,
        playlistPitchReady,
        budgetBand,
        competingNoise,
        platforms,
        notes,
      };

      const sim = simulateRelease(input, brain);
      setResult(sim);
      track("release_simulate", {
        verdict: sim.primary.verdict,
        overall: sim.primary.overall,
        has_alternate: Boolean(sim.alternate),
      });

      // Optional Ziki narrative on top of deterministic scores
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "release",
            fileName: input.title,
            notes: simulationToPrompt(sim, input),
            artistName: sim.artistName,
          }),
        });
        const data = (await res.json()) as { text?: string };
        if (res.ok && data.text) setBriefing(data.text);
      } catch {
        /* scores still useful without narrative */
      }
    } catch {
      setError("Simulation failed");
    } finally {
      setBusy(false);
    }
  }

  function saveChecklist() {
    if (!result) return;
    addTasksFromChecklist(result.checklist, "release");
    track("release_checklist_saved", { n: result.checklist.length });
  }

  function sendToZiki() {
    if (!result) return;
    stashAct({
      title: `Release plan: ${title || result.artistName}`,
      summary: result.recommendation,
      why: result.primary.blockers.join(" · ") || result.primary.reasons.join(" · "),
      expectedOutcome: `Verdict ${result.primary.verdict} · score ${result.primary.overall}`,
      category: "Release",
    });
    track("release_to_ziki", { verdict: result.primary.verdict });
    router.push("/ziki");
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omniv-gold/15">
            <Rocket className="h-5 w-5 text-omniv-gold" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Stress-test the window
            </h2>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Compare two dates before you spend the cycle. Scores use your
              Artist Brain + readiness flags — not vibes.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Release title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Single / EP name"
          />
          <Input
            label="Primary market"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="Lagos · London · Accra · Global EN"
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-omniv-text-secondary">
              Positioning (one sharp sentence)
            </label>
            <textarea
              value={positioning}
              onChange={(e) => setPositioning(e.target.value)}
              rows={2}
              className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
              placeholder="Who it’s for and why it belongs this week"
            />
          </div>
          <Input
            label="Primary drop date"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
          <Input
            label="Alternate date"
            type="date"
            value={alternateDate}
            onChange={(e) => setAlternateDate(e.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Toggle
            label="Content pack ready"
            on={contentReady}
            set={setContentReady}
          />
          <Toggle
            label="Fan gate / owned list ready"
            on={ownedListReady}
            set={setOwnedListReady}
          />
          <Toggle
            label="Playlist pitch list ready"
            on={playlistPitchReady}
            set={setPlaylistPitchReady}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Select
            label="Budget band"
            value={budgetBand}
            onChange={(v) => setBudgetBand(v as ReleaseWindowInput["budgetBand"])}
            options={[
              { value: "none", label: "No paid" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
          <Select
            label="Calendar density (your estimate)"
            value={competingNoise}
            onChange={(v) =>
              setCompetingNoise(v as ReleaseWindowInput["competingNoise"])
            }
            options={[
              { value: "quiet", label: "Quiet week" },
              { value: "normal", label: "Normal" },
              { value: "crowded", label: "Crowded / big drops" },
            ]}
          />
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Constraints, features, features embargo, tour tie-in…"
          className="mt-3 w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
        />

        <Button
          className="mt-4 gap-2"
          disabled={busy || !releaseDate}
          onClick={() => void run()}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          {busy ? "Running simulation…" : "Simulate release windows"}
        </Button>
        {error && <p className="mt-2 text-xs text-omniv-danger">{error}</p>}
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="grid gap-3 md:grid-cols-2">
            <WindowCard score={result.primary} />
            {result.alternate && <WindowCard score={result.alternate} />}
          </div>

          <Card className="border-omniv-gold/25 bg-omniv-gold/5 p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-gold">
              Recommendation · {result.confidence}% model confidence
            </p>
            <p className="mt-2 text-sm leading-relaxed text-omniv-text">
              {result.recommendation}
            </p>
            <p className="mt-2 text-xs text-omniv-text-secondary">
              {result.spendWarning}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium">Pre-flight checklist</p>
            <ul className="mt-3 space-y-2">
              {result.checklist.map((c) => (
                <li
                  key={c}
                  className="flex gap-2 text-sm text-omniv-text-secondary"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-omniv-gold" />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={saveChecklist}>
                <ListTodo className="h-3.5 w-3.5" />
                Save as tasks
              </Button>
              <Button size="sm" className="gap-1.5" onClick={sendToZiki}>
                <MessageSquare className="h-3.5 w-3.5" />
                Open in Ziki
              </Button>
            </div>
          </Card>

          {briefing && (
            <Card className="border-omniv-gold/20 p-5">
              <Badge variant="gold">Ziki briefing</Badge>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-omniv-text-secondary">
                {briefing}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function WindowCard({
  score,
}: {
  score: SimulationResult["primary"];
}) {
  const color =
    score.verdict === "Go"
      ? "text-emerald-400"
      : score.verdict === "Hold"
        ? "text-red-400"
        : "text-omniv-gold";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-omniv-text-muted">{score.label}</p>
          <p className="font-data text-sm text-omniv-text">{score.date}</p>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-semibold", color)}>{score.overall}</p>
          <Badge
            variant={
              score.verdict === "Go"
                ? "success"
                : score.verdict === "Hold"
                  ? "outline"
                  : "gold"
            }
          >
            {score.verdict}
          </Badge>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric label="Readiness" value={score.readiness} />
        <Metric label="Timing" value={score.timing} />
        <Metric label="Position" value={score.positioning} />
      </div>
      {score.blockers[0] && (
        <p className="mt-3 text-xs text-omniv-text-secondary">
          <span className="text-omniv-gold">Blocker:</span> {score.blockers[0]}
        </p>
      )}
      {score.reasons[0] && !score.blockers[0] && (
        <p className="mt-3 flex gap-1.5 text-xs text-omniv-text-secondary">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-omniv-gold" />
          {score.reasons[0]}
        </p>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-omniv-border bg-omniv-elevated/50 px-2 py-2">
      <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
        {label}
      </p>
      <p className="font-data text-sm font-medium text-omniv-text">{value}</p>
    </div>
  );
}

function Toggle({
  label,
  on,
  set,
}: {
  label: string;
  on: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      className={cn(
        "rounded-xl border px-3 py-3 text-left text-xs transition-colors",
        on
          ? "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold"
          : "border-omniv-border text-omniv-text-secondary hover:border-omniv-gold/25"
      )}
    >
      {label}
      <span className="mt-1 block font-data text-[10px] opacity-70">
        {on ? "YES" : "NO"}
      </span>
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-omniv-text-secondary">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
