"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AuditPayload } from "@/types";
import { Loader2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ScoreRing({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 65
      ? "text-omniv-gold"
      : value >= 40
        ? "text-amber-400"
        : "text-rose-400";
  return (
    <div className="rounded-2xl border border-omniv-border bg-omniv-card p-4 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-data text-3xl font-semibold tabular-nums",
          tone
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function AuditResultPage() {
  const params = useParams();
  const slug = String(params.id || "");
  const [payload, setPayload] = useState<AuditPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/audit?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = (await res.json()) as { payload: AuditPayload };
          if (!cancelled) setPayload(data.payload);
          return;
        }
        const raw = sessionStorage.getItem(`omniv_audit_${slug}`);
        if (raw && !cancelled) setPayload(JSON.parse(raw) as AuditPayload);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function share() {
    const link = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${payload?.artistName} · Omniv audit`,
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-omniv-black text-sm text-omniv-text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-omniv-gold" />
        Opening audit…
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-omniv-black px-5 text-center">
        <p className="text-sm text-omniv-text-secondary">Audit not found.</p>
        <Link href="/audit">
          <Button size="sm">Run a new scan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-omniv-black text-omniv-text">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-omniv-gold/15 text-sm font-bold text-omniv-gold">
            O
          </div>
          <span className="text-sm font-semibold">Omniv</span>
        </Link>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={share}>
          <Share2 className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Share"}
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-28">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
          Relevance audit · public signals
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          {payload.artistName}
        </h1>
        <p className="mt-1 truncate text-xs text-omniv-text-muted">
          {payload.sourceUrl}
        </p>

        <div className="mt-8 flex items-end gap-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              Overall
            </p>
            <p className="font-data text-5xl font-semibold tabular-nums text-omniv-gold">
              {payload.overall}
              <span className="text-lg text-omniv-text-muted">/100</span>
            </p>
          </div>
          {payload.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payload.thumbnail}
              alt=""
              className="h-20 w-20 rounded-xl border border-omniv-border object-cover"
            />
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <ScoreRing label="Reach" value={payload.reach} />
          <ScoreRing label="Revenue path" value={payload.revenue} />
          <ScoreRing label="Momentum" value={payload.momentum} />
        </div>

        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold tracking-tight">Where you leak</h2>
          {payload.findings.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border border-omniv-border bg-omniv-card p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
                {f.severity}
              </p>
              <p className="mt-1 text-sm font-medium">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-omniv-text-secondary">
                {f.detail}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/5 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Next move
          </p>
          <p className="mt-2 text-sm leading-relaxed text-omniv-text">
            {payload.nextMove}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/onboarding">
              <Button size="sm">Claim this in Omniv</Button>
            </Link>
            <Link href="/audit">
              <Button size="sm" variant="outline">
                Scan another link
              </Button>
            </Link>
          </div>
        </section>

        <p className="mt-8 text-[11px] leading-relaxed text-omniv-text-muted">
          {payload.disclaimer}
        </p>
      </main>
    </div>
  );
}
