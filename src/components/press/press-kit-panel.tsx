"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, Copy, Check } from "lucide-react";

export function PressKitPanel() {
  const [opportunity, setOpportunity] = useState("");
  const [target, setTarget] = useState("blog");
  const [md, setMd] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/press-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity: opportunity || "Press / booking one-sheet",
          target,
        }),
      });
      const data = (await res.json()) as {
        markdown?: string;
        error?: string;
      };
      if (!res.ok) {
        setErr(data.error || "Failed");
        return;
      }
      setMd(data.markdown || "");
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-omniv-gold" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Press kit
          </p>
          <p className="text-[11px] text-omniv-text-muted">
            Auto one-sheet from Artist Brain — festivals, blogs, radio, sync.
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Opportunity (e.g. Afrochella 2026)"
          value={opportunity}
          onChange={(e) => setOpportunity(e.target.value)}
          className="h-8"
        />
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-8 rounded-lg border border-omniv-border bg-omniv-card px-2 text-xs"
        >
          <option value="blog">Blog / press</option>
          <option value="festival">Festival</option>
          <option value="radio">Radio</option>
          <option value="sync">Sync / supervisor</option>
          <option value="booking">Booking agency</option>
        </select>
      </div>
      <Button
        size="sm"
        className="mt-2 h-8 gap-1.5"
        disabled={busy}
        onClick={() => void generate()}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        Generate kit
      </Button>
      {err && <p className="mt-2 text-xs text-rose-400">{err}</p>}
      {md && (
        <div className="mt-3">
          <div className="mb-1 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[10px]"
              onClick={() => void copy()}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copy
            </Button>
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-omniv-border bg-omniv-black/40 p-3 text-[11px] leading-relaxed text-omniv-text-secondary">
            {md}
          </pre>
        </div>
      )}
    </Card>
  );
}
