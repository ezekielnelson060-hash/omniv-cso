"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Loader2, Download } from "lucide-react";

type ReportType =
  | "investor"
  | "artist"
  | "campaign"
  | "monthly"
  | "label";

const TEMPLATES: { id: ReportType; title: string; blurb: string }[] = [
  { id: "investor", title: "Investor", blurb: "Traction, risk, ask" },
  { id: "artist", title: "Artist", blurb: "Week + next move" },
  { id: "campaign", title: "Campaign", blurb: "Spend vs signal" },
  { id: "monthly", title: "Monthly growth", blurb: "30-day rollup" },
  { id: "label", title: "Label", blurb: "Roster cross-cut" },
];

export function ReportsPanel() {
  const [busy, setBusy] = useState<ReportType | null>(null);

  async function generate(id: ReportType) {
    setBusy(id);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Report failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `omniv-${id}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-omniv-text-muted">
        PDF briefs from your brain and scores. Not generic templates.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Card key={t.id} className="flex flex-col p-3">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-omniv-gold" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{t.title}</p>
                <p className="text-[10px] text-omniv-text-muted">{t.blurb}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 gap-1 text-[11px]"
              disabled={busy === t.id}
              onClick={() => void generate(t.id)}
            >
              {busy === t.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              PDF
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
