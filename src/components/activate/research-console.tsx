"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type Step = {
  id: string;
  label: string;
  status: "done" | "active" | "pending" | "warn";
  detail?: string;
};

type Summary = {
  artistName: string;
  careerStage: string | null;
  bigDream: string | null;
  tracks: number;
  releases: number;
  fans: number;
  avgPopularity: number | null;
  pendingAgent: number;
  gaps: string[];
  nextMove: string;
  findings: string[];
};

const FALLBACK_LABELS = [
  "fetching your Omniv profile…",
  "reading Artist Brain…",
  "scanning catalogue (tracks + releases)…",
  "checking owned fans + DSP snapshots…",
  "ranking Agent proposals…",
  "sealing operating brief…",
];

/**
 * Explee-style progressive research console.
 * Runs real /api/activate/research, then reveals next move.
 */
export function ResearchConsole({
  onDone,
  autoStart = true,
}: {
  onDone?: () => void;
  autoStart?: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );
  const [visible, setVisible] = useState<Step[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setPhase("running");
    setError(null);
    setSummary(null);
    setVisible(
      FALLBACK_LABELS.map((label, i) => ({
        id: `p${i}`,
        label,
        status: i === 0 ? "active" : "pending",
      }))
    );

    let i = 0;
    const tick = window.setInterval(() => {
      i = Math.min(i + 1, FALLBACK_LABELS.length - 1);
      setVisible((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status:
            idx < i ? "done" : idx === i ? "active" : ("pending" as const),
        }))
      );
    }, 420);

    try {
      const res = await fetch("/api/activate/research", { method: "POST" });
      window.clearInterval(tick);
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error || "Research failed — sign in and try again");
        setPhase("error");
        return;
      }
      const data = (await res.json()) as {
        steps: Step[];
        summary: Summary;
      };

      setVisible([]);
      for (let n = 0; n < (data.steps || []).length; n++) {
        const slice: Step[] = data.steps.slice(0, n + 1).map((s, idx, arr) => ({
          ...s,
          status: (idx < arr.length - 1
            ? s.status === "warn"
              ? "warn"
              : "done"
            : s.status === "warn"
              ? "warn"
              : "active") as Step["status"],
        }));
        setVisible(slice);
        await new Promise((r) => setTimeout(r, 280));
      }
      setVisible(
        (data.steps || []).map((s) => ({
          ...s,
          status: (s.status === "warn" ? "warn" : "done") as Step["status"],
        }))
      );
      setSummary(data.summary);
      setPhase("done");
      onDone?.();
    } catch {
      window.clearInterval(tick);
      setError("Network error");
      setPhase("error");
    }
  }

  useEffect(() => {
    if (autoStart) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
          Activate
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          1 · Research your project
        </h1>
        <p className="mt-1 text-[12px] text-omniv-text-muted">
          Omniv reads what you already put in — brain, catalogue, fans, DSP —
          then names the next confirmable move.
        </p>
      </div>

      <div className="rounded-2xl border border-omniv-border bg-omniv-black/80 p-4 font-mono text-[12px] leading-relaxed">
        {visible.map((s) => (
          <div key={s.id} className="flex items-start gap-2 py-0.5">
            <span className="mt-0.5 w-4 shrink-0 text-center">
              {s.status === "done" && (
                <Check className="inline h-3 w-3 text-emerald-400" />
              )}
              {s.status === "warn" && (
                <span className="text-amber-400">!</span>
              )}
              {s.status === "active" && (
                <Loader2 className="inline h-3 w-3 animate-spin text-omniv-gold" />
              )}
              {s.status === "pending" && (
                <span className="text-omniv-text-muted">·</span>
              )}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  s.status === "active" && "text-omniv-text",
                  s.status === "done" && "text-omniv-text-muted",
                  s.status === "warn" && "text-amber-400/90",
                  s.status === "pending" && "text-omniv-text-muted/50"
                )}
              >
                {s.label}
              </p>
              {s.detail && s.status !== "pending" && (
                <p className="text-[11px] text-omniv-gold/80">{s.detail}</p>
              )}
            </div>
          </div>
        ))}
        {phase === "running" && visible.length === 0 && (
          <p className="text-omniv-text-muted">starting…</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-400">
          {error}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => void run()}
          >
            Retry
          </button>
        </p>
      )}

      {phase === "done" && summary && (
        <div className="space-y-4 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/5 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
              Operating brief
            </p>
            <p className="mt-1 text-sm font-medium">{summary.artistName}</p>
            {summary.bigDream && (
              <p className="mt-1 text-[12px] text-omniv-text-secondary">
                Dream: {summary.bigDream}
              </p>
            )}
          </div>
          <ul className="space-y-1 text-[12px] text-omniv-text-muted">
            {summary.findings.slice(0, 6).map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
          <div className="rounded-xl border border-omniv-border bg-omniv-black/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
              Next move
            </p>
            <p className="mt-0.5 text-sm font-medium text-omniv-gold">
              {summary.nextMove}
            </p>
          </div>
          {summary.gaps.length > 0 && (
            <p className="text-[11px] text-omniv-text-muted">
              Gaps: {summary.gaps.join(" · ")}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              className="gap-1.5"
              onClick={() => router.push("/opportunities")}
            >
              Open Opportunities <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/crm")}
            >
              Command Center
            </Button>
            <Button variant="outline" onClick={() => router.push("/ziki")}>
              Talk to Ziki
            </Button>
          </div>
        </div>
      )}

      {phase === "idle" && (
        <Button onClick={() => void run()}>Start research</Button>
      )}
    </div>
  );
}
