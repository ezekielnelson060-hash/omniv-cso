"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reportTemplates, type ReportType } from "@/data/phase6";
import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function ReportsPanel() {
  const [selected, setSelected] = useState<ReportType>("artist");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function generate() {
    setBusy(true);
    setDone(false);
    await new Promise((r) => setTimeout(r, 1600));
    setBusy(false);
    setDone(true);
  }

  const tpl = reportTemplates.find((t) => t.id === selected)!;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reportTemplates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setSelected(t.id);
              setDone(false);
            }}
            className={cn(
              "card-elevated p-4 text-left transition-all",
              selected === t.id && "border-omniv-gold/40 glow-gold"
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-omniv-gold" />
              <p className="text-sm font-medium text-omniv-text">{t.name}</p>
            </div>
            <p className="text-xs leading-relaxed text-omniv-text-secondary">
              {t.description}
            </p>
            <p className="mt-2 text-[11px] text-omniv-text-muted">{t.pages}</p>
          </button>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="gold">PDF export</Badge>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              {tpl.name}
            </h2>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {tpl.description}. Executive-ready layout with scores, charts, and
              Ziki recommendations.
            </p>
          </div>
          <Button
            onClick={() => void generate()}
            disabled={busy}
            className="gap-2 shrink-0"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {busy ? "Generating…" : "Generate PDF"}
          </Button>
        </div>

        {busy && (
          <p className="mt-4 text-xs text-omniv-text-muted">
            Composing briefing pages · embedding sparklines · applying brand
            system…
          </p>
        )}

        {done && !busy && (
          <div className="animate-fade-in-up mt-6 rounded-[var(--radius-lg)] border border-omniv-gold/25 bg-omniv-gold/5 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-omniv-success" />
              <div>
                <p className="text-sm font-medium text-omniv-text">
                  Report ready (preview)
                </p>
                <p className="mt-1 text-xs text-omniv-text-secondary">
                  omniv-{selected}-report-{new Date().toISOString().slice(0, 10)}.pdf
                </p>
                <ul className="mt-3 space-y-1 text-xs text-omniv-text-muted">
                  <li>· Cover + executive summary</li>
                  <li>· Score cards & period compare</li>
                  <li>· Opportunity ranking</li>
                  <li>· Ziki recommendations with confidence</li>
                  <li>· Next 14-day action plan</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Regenerate with Ziki
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
