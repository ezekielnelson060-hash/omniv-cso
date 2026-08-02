"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { CheckCircle2, Loader2, Unlock } from "lucide-react";

function GateInner() {
  const params = useParams();
  const search = useSearchParams();
  const slug = String(params.slug || "").toLowerCase();
  const source = search.get("source") || "bio_link";

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const [artistName, setArtistName] = useState(
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );

  useEffect(() => {
    if (slug) track("fan_gate_view", { slug, source }, `/f/${slug}`);
  }, [slug, source]);

  const headline = useMemo(
    () => `Unlock exclusive updates from ${artistName}`,
    [artistName]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !consent) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fans/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistSlug: slug,
          email: email.trim(),
          consent: true,
          source,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reward?: string | null;
        artist?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not save — try again");
        setBusy(false);
        return;
      }
      if (data.artist) setArtistName(data.artist);
      setReward(data.reward || null);
      setDone(true);
    } catch {
      setError("Network error — try again");
    }
    setBusy(false);
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-omniv-black px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <p className="mt-3 font-data text-[10px] uppercase tracking-[0.18em] text-omniv-gold">
            Fan access
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-omniv-text">
            {artistName}
          </h1>
          <p className="mt-2 text-sm text-omniv-text-secondary">{headline}</p>
        </div>

        {!done ? (
          <form
            onSubmit={submit}
            className="rounded-2xl border border-omniv-border bg-omniv-card/90 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur"
          >
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-omniv-text-secondary">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-omniv-border accent-omniv-gold"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={busy}
              />
              <span>
                I agree to receive updates from {artistName}. I can unsubscribe
                anytime. (Required for privacy compliance.)
              </span>
            </label>
            {error && (
              <p className="mt-3 text-xs text-omniv-danger">{error}</p>
            )}
            <Button
              type="submit"
              className="mt-5 w-full gap-2"
              disabled={busy || !email.trim() || !consent}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Unlocking…
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Unlock access
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-[10px] text-omniv-text-muted">
              Powered by Omniv · source: {source}
            </p>
          </form>
        ) : (
          <div className="rounded-2xl border border-omniv-gold/30 bg-omniv-card p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-omniv-gold" />
            <h2 className="mt-3 text-lg font-semibold">You're in</h2>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Thanks — {artistName} has your email for exclusive drops.
            </p>
            {reward && (
              <div className="mt-4 rounded-xl border border-omniv-border bg-omniv-elevated px-4 py-3 text-left text-sm">
                <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                  Your unlock
                </p>
                <p className="mt-1 break-all text-omniv-gold">{reward}</p>
              </div>
            )}
            {!reward && (
              <p className="mt-4 text-xs text-omniv-text-muted">
                Watch your inbox for the next release and live dates.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FanGatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-omniv-black text-sm text-omniv-text-muted">
          Loading…
        </div>
      }
    >
      <GateInner />
    </Suspense>
  );
}
