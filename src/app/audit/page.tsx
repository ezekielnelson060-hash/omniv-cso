"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight } from "lucide-react";
import type { AuditPayload } from "@/types";

export default function AuditEntryPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as {
        slug?: string;
        payload?: AuditPayload;
        error?: string;
        ephemeral?: boolean;
      };
      if (!res.ok || !data.payload) {
        setError(data.error || "Scan failed");
        return;
      }
      if (data.slug && !data.ephemeral) {
        router.push(`/audit/${data.slug}`);
        return;
      }
      sessionStorage.setItem(
        `omniv_audit_${data.slug}`,
        JSON.stringify(data.payload)
      );
      router.push(`/audit/${data.slug}`);
    } catch {
      setError("Could not reach the audit engine");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-omniv-black text-omniv-text">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-omniv-gold/15 text-sm font-bold text-omniv-gold">
            O
          </div>
          <span className="text-sm font-semibold tracking-tight">Omniv</span>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
          Free relevance audit
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Know where you are leaking.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-omniv-text-secondary">
          Paste a Spotify artist link or YouTube channel. In under a minute we
          return a one-page score from public signals — reach, revenue path, and
          momentum. No login.
        </p>

        <form onSubmit={run} className="mt-10 space-y-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://open.spotify.com/artist/… or youtube.com/@…"
            className="h-12 rounded-2xl border-omniv-border bg-omniv-card px-4 text-sm"
          />
          <Button
            type="submit"
            disabled={busy || !url.trim()}
            className="h-12 w-full gap-2 rounded-2xl text-sm font-semibold sm:w-auto sm:px-8"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning public signals…
              </>
            ) : (
              <>
                Run free audit
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>

        <p className="mt-8 text-[11px] text-omniv-text-muted">
          Public data only. Not Spotify for Artists. Not private revenue. Built
          to surface the gap — then Omniv holds the weekly move.
        </p>
      </main>
    </div>
  );
}
