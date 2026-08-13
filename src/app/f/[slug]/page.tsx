"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";

function GateInner() {
  const params = useParams();
  const search = useSearchParams();
  const slug = String(params.slug || "").toLowerCase();
  const source = search.get("source") || "bio_link";

  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [wouldAttend, setWouldAttend] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const [artistName, setArtistName] = useState("…");
  const [tagline, setTagline] = useState(
    "Hear about new music and shows near you first."
  );

  useEffect(() => {
    if (slug) track("fan_gate_view", { slug, source }, `/f/${slug}`);
  }, [slug, source]);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      try {
        const res = await fetch(
          `/api/roster/public?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          stageName?: string;
          gateTagline?: string | null;
        };
        if (data.stageName) setArtistName(data.stageName);
        if (data.gateTagline?.trim()) setTagline(data.gateTagline.trim());
      } catch {
        /* soft */
      }
    })();
  }, [slug]);

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
          city: city.trim() || undefined,
          wouldAttend,
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
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-omniv-elevated">
            <span className="text-lg text-omniv-gold">✦</span>
          </div>
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
            Omniv · Fan list
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-omniv-text">
            Join {artistName === "…" ? "the list" : `${artistName}'s list`}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-omniv-text-secondary">
            {tagline}
          </p>
        </div>

        <div className="rounded-2xl border border-omniv-border bg-omniv-card p-5">
          {done ? (
            <div className="space-y-3 py-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-omniv-gold" />
              <p className="text-sm font-medium text-omniv-text">
                You're on the list
              </p>
              <p className="text-[13px] text-omniv-text-secondary">
                {reward ||
                  "Thanks — you'll hear about new music and events near you."}
              </p>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={(e) => void submit(e)}>
              <Input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
              />
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-omniv-text-muted" />
                <Input
                  placeholder="City (where you are)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-omniv-border bg-omniv-elevated/50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={wouldAttend}
                  onChange={(e) => setWouldAttend(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs leading-relaxed text-omniv-text-secondary">
                  I would come to a small show or listening session near me.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 px-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                  required
                />
                <span className="text-[11px] leading-relaxed text-omniv-text-muted">
                  I agree to get updates about music and events. Your city helps
                  show what's near you.
                </span>
              </label>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button
                type="submit"
                disabled={busy || !email.trim() || !consent}
                className="h-11 w-full rounded-xl font-semibold"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Join the list"
                )}
              </Button>
            </form>
          )}
        </div>
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
