"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Ticket } from "lucide-react";

type Gathering = {
  id: string;
  title: string;
  city: string | null;
  capacity: number | null;
  ticket_price_cents: number | null;
  status: string;
  venue: string | null;
};

function Inner() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id || "");
  const paid = search.get("paid") === "1";

  const [g, setG] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tip, setTip] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(
    paid ? "Payment received. You are on the list." : null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/gatherings/${id}`);
        if (res.ok) {
          const data = (await res.json()) as { gathering: Gathering };
          setG(data.gathering);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/gatherings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatheringId: id,
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        free?: boolean;
        link?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not complete");
        return;
      }
      if (data.link) {
        window.location.href = data.link;
        return;
      }
      setMsg(data.message || "You are on the list");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function sendTip() {
    if (!email.trim() || !tip || Number(tip) <= 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/gatherings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatheringId: id,
          email: email.trim(),
          name: name.trim() || undefined,
          tipUsd: Number(tip),
        }),
      });
      const data = (await res.json()) as { link?: string; error?: string };
      if (!res.ok || !data.link) {
        setError(data.error || "Tip failed");
        return;
      }
      window.location.href = data.link;
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-omniv-black text-sm text-omniv-text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-omniv-gold" />
        Loading room…
      </div>
    );
  }

  if (!g) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-omniv-black px-5 text-center">
        <p className="text-sm text-omniv-text-secondary">Room not found.</p>
        <Link href="/">
          <Button size="sm" variant="outline">
            Omniv home
          </Button>
        </Link>
      </div>
    );
  }

  const price = ((g.ticket_price_cents || 0) / 100).toFixed(2);
  const isFree = Number(g.ticket_price_cents || 0) <= 0;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-omniv-black px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%)]" />
      <div className="relative z-10 w-full max-w-md">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
          Omniv · Gathering
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight">
          {g.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-omniv-text-secondary">
          {g.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {g.city}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Ticket className="h-3.5 w-3.5" />
            {isFree ? "Free entry" : `$${price}`}
          </span>
          {g.capacity ? <span>Cap {g.capacity}</span> : null}
        </div>

        <form
          onSubmit={submit}
          className="mt-8 space-y-3 rounded-2xl border border-omniv-border bg-omniv-card p-5"
        >
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl"
          />
          <Input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          {msg && <p className="text-xs text-omniv-gold">{msg}</p>}
          <Button
            type="submit"
            disabled={busy || !email.trim() || g.status !== "open"}
            className="h-11 w-full rounded-xl font-semibold"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFree ? (
              "RSVP free"
            ) : (
              `Pay $${price} · reserve seat`
            )}
          </Button>
        </form>

        <div className="mt-4 rounded-2xl border border-omniv-border bg-omniv-card/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Tip jar
          </p>
          <p className="mt-1 text-xs text-omniv-text-muted">
            Support the room even if entry is free. Enter email above first.
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              type="number"
              min={1}
              step="1"
              placeholder="Amount USD"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="h-10 rounded-xl"
            />
            <Button
              type="button"
              variant="outline"
              disabled={busy || !email.trim() || !tip || Number(tip) <= 0}
              className="h-10 shrink-0"
              onClick={() => void sendTip()}
            >
              Tip
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t border-omniv-border pt-4 text-[11px] leading-relaxed text-omniv-text-muted">
          <p>
            Powered by Omniv. Paid seats and tips confirm via Flutterwave.
          </p>
          <p>
            <span className="font-medium text-omniv-text-secondary">Refunds:</span>{" "}
            Contact the host within 24 hours of payment if the room is cancelled
            or you cannot attend. Approved refunds are processed within 5–7
            business days to the original payment method.
          </p>
          <p>
            <span className="font-medium text-omniv-text-secondary">Support:</span>{" "}
            <a
              href="mailto:support@omniv.media?subject=Room%20support"
              className="text-omniv-gold underline"
            >
              support@omniv.media
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GatheringPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-omniv-black text-sm text-omniv-text-muted">
          Loading…
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
