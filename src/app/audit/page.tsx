"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";

export default function AuditPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Audit failed");
        return;
      }
      const slug = data.share_slug || data.id;
      if (slug) router.push(`/audit/${slug}`);
      else setError("No share link returned");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-omniv-black text-omniv-text">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Omniv" className="h-7 w-7 rounded-md" />
          <span className="text-sm font-semibold tracking-tight">Omniv</span>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="sm" className="h-8 text-[11px]">
            Sign in
          </Button>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          Free relevance audit
        </p>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight md:text-2xl">
          Know where you are leaking.
        </h1>
        <p className="mt-1.5 max-w-xl text-[12px] leading-snug text-omniv-text-muted">
          Spotify artist or YouTube channel. One-page score from public signals:
          reach, revenue path, momentum. No login.
        </p>

        <form onSubmit={run} className="mt-5 space-y-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://open.spotify.com/artist/… or youtube.com/@…"
            className="h-10 rounded-xl border-omniv-border bg-omniv-card px-3 text-sm"
          />
          <Button
            type="submit"
            disabled={busy || !url.trim()}
            className="h-10 w-full gap-1.5 rounded-xl text-[13px] font-semibold sm:w-auto sm:px-6"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning…
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

        <p className="mt-4 text-[10px] text-omniv-text-muted">
          Public data only. Not Spotify for Artists. Not private revenue.
        </p>
      </main>
    </div>
  );
}
