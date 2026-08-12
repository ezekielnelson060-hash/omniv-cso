"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Check } from "lucide-react";
import Link from "next/link";

/**
 * Pulls public Spotify popularity into platform_metrics for this user.
 * Agent reads those rows as outside signals.
 */
export function DspMetricsRefresh({
  hasSpotifyLinks,
}: {
  hasSpotifyLinks?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/platform-metrics/refresh", {
        method: "POST",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        updated?: number;
        scanned?: number;
        skipped?: number;
        failed?: number;
      };
      if (!res.ok) {
        setErr(
          data.error ||
            "Could not refresh. Check Spotify keys or paste links in Catalogue."
        );
        return;
      }
      setMsg(
        `Updated ${data.updated ?? 0} of ${data.scanned ?? 0} linked releases. Open Agent to see outside scores.`
      );
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-omniv-gold/20 bg-omniv-gold/5 p-4">
      <p className="text-[13px] font-semibold">Spotify popularity</p>
      <p className="mt-1 text-[12px] text-omniv-text-secondary">
        Public score for releases with a Spotify link. Agent uses this as an
        outside signal — not private stream charts.
      </p>
      {!hasSpotifyLinks && (
        <p className="mt-2 text-[12px] text-omniv-text-muted">
          No Spotify URLs yet.{" "}
          <Link
            href="/catalogue"
            className="text-omniv-gold underline-offset-2 hover:underline"
          >
            Catalogue → add Spotify link
          </Link>
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="h-9 gap-1.5 rounded-xl"
          disabled={busy}
          onClick={() => void run()}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {busy ? "Pulling…" : "Pull popularity now"}
        </Button>
        <Button size="sm" variant="outline" className="h-9 rounded-xl" asChild>
          <Link href="/notifications">Open Agent</Link>
        </Button>
      </div>
      {msg && (
        <p className="mt-2 flex items-start gap-1.5 text-[12px] text-emerald-400">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {msg}
        </p>
      )}
      {err && <p className="mt-2 text-[12px] text-omniv-danger">{err}</p>}
    </Card>
  );
}
