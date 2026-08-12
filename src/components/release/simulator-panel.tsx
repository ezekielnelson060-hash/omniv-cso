"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Loader2,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { stashAct } from "@/lib/ziki-memory";

type SimResult = {
  window?: string;
  score?: number;
  reasons?: string[];
  checklist?: string[];
  culturalHooks?: string[];
  startIso?: string | null;
  title?: string;
  genre?: string;
};

export function SimulatorPanel() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("omniv_last_release_sim");
      if (raw) setResult(JSON.parse(raw));
      const ch = localStorage.getItem("omniv_release_checklist");
      if (ch) setChecked(JSON.parse(ch));
    } catch {
      /* soft */
    }
  }, []);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/release/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled",
          genre: genre.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Simulate failed");
        return;
      }
      setResult(data);
      setChecked({});
      try {
        localStorage.setItem("omniv_last_release_sim", JSON.stringify(data));
        localStorage.removeItem("omniv_release_checklist");
      } catch {
        /* soft */
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  function toggleCheck(i: number) {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try {
        localStorage.setItem("omniv_release_checklist", JSON.stringify(next));
      } catch {
        /* soft */
      }
      return next;
    });
  }

  function sendToZiki() {
    if (!result) return;
    stashAct({
      title: title || result.title || "Release plan",
      summary: result.window || "Release window",
      why: (result.reasons || []).slice(0, 2).join("; ") || "Simulated window",
      expectedOutcome: "Ship content runway before drop date",
      category: "release",
    });
    window.location.href = "/ziki";
  }

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = result?.checklist?.length || 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 text-omniv-gold" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold">Score a release window</p>
            <p className="mt-1 text-[12px] text-omniv-text-secondary">
              Get a date range, then work the checklist day by day — content
              first, drop second.
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Input
            placeholder="Track or project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Genre / style (optional)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          {error && <p className="text-xs text-omniv-danger">{error}</p>}
          <Button
            className="h-10 w-full gap-1.5 rounded-xl"
            disabled={busy}
            onClick={() => void run()}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Simulate release
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="border-omniv-gold/20 p-4">
          <Badge variant="gold">Window</Badge>
          <p className="mt-2 text-[15px] font-semibold">
            {result.window || "See checklist"}
          </p>
          {typeof result.score === "number" && (
            <p className="mt-1 text-[12px] text-omniv-text-muted">
              Score {result.score}/100
            </p>
          )}
          {result.reasons && result.reasons.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-4 text-[12px] text-omniv-text-secondary">
              {result.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {result.culturalHooks && result.culturalHooks.length > 0 && (
            <p className="mt-2 text-[11px] text-omniv-text-muted">
              Hooks: {result.culturalHooks.slice(0, 2).join(" · ")}
            </p>
          )}

          {result.checklist && result.checklist.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-omniv-text-muted">
                  Content runway
                </p>
                <span className="text-[11px] text-omniv-text-muted">
                  {doneCount}/{total}
                </span>
              </div>
              <ul className="mt-2 space-y-2">
                {result.checklist.map((c, i) => (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => toggleCheck(i)}
                      className="flex w-full items-start gap-2 rounded-xl border border-omniv-border bg-omniv-card/40 px-2.5 py-2 text-left text-[12px] transition hover:border-omniv-gold/30"
                    >
                      <CheckCircle2
                        className={
                          checked[i]
                            ? "mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                            : "mt-0.5 h-4 w-4 shrink-0 text-omniv-text-muted"
                        }
                      />
                      <span
                        className={
                          checked[i]
                            ? "text-omniv-text-muted line-through"
                            : "text-omniv-text-secondary"
                        }
                      >
                        {c}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5" onClick={sendToZiki}>
              <MessageSquare className="h-3.5 w-3.5" /> Open in Ziki
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/content">Shoot content</Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/crm?tab=fans">Fan Gate</Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/crm?tab=money">Tip link</Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/crm?tab=rooms">Open room</Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/catalogue">Catalogue</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
