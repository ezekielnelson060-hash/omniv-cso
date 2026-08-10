"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Loader2 } from "lucide-react";

/** Public standalone tip link — /tip/[roster-slug] */
export default function TipPage() {
  const params = useParams();
  const search = useSearchParams();
  const slug = String(params.slug || "");
  const paid = search.get("paid") === "1";

  const [artist, setArtist] = useState<string>("Artist");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState(paid ? "Thank you — tip received." : null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(
          `/api/roster/public?slug=${encodeURIComponent(slug)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { stageName?: string };
          if (data.stageName) setArtist(data.stageName);
        }
      } catch {
        /* soft */
      }
    })();
  }, [slug]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/tips/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email: email.trim(),
          name: name.trim() || undefined,
          amountUsd: Number(amount),
        }),
      });
      const data = (await res.json()) as { link?: string; error?: string };
      if (!res.ok || !data.link) {
        setErr(data.error || "Checkout failed");
        return;
      }
      window.location.href = data.link;
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-omniv-black px-4 py-12 text-omniv-text">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-omniv-border bg-omniv-card p-6">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-omniv-gold" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              Tip jar
            </p>
            <h1 className="text-xl font-semibold tracking-tight">{artist}</h1>
          </div>
        </div>
        <p className="text-[13px] text-omniv-text-secondary">
          Support the music directly. No room required — share this link
          anywhere.
        </p>
        {msg && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300">
            {msg}
          </p>
        )}
        {!paid && (
          <form className="space-y-3" onSubmit={(e) => void pay(e)}>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            <Input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
            <div className="flex gap-2">
              {["3", "5", "10", "20"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`h-10 flex-1 rounded-xl border text-[13px] font-medium ${
                    amount === a
                      ? "border-omniv-gold bg-omniv-gold/15 text-omniv-gold"
                      : "border-omniv-border text-omniv-text-muted"
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11"
              placeholder="Custom amount (USD)"
            />
            {err && <p className="text-[12px] text-rose-400">{err}</p>}
            <Button
              type="submit"
              className="h-11 w-full gap-2 rounded-xl"
              disabled={busy}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Tip ${amount || "…"}
            </Button>
          </form>
        )}
        <p className="text-center text-[10px] text-omniv-text-muted">
          Powered by{" "}
          <Link href="/" className="text-omniv-gold hover:underline">
            Omniv
          </Link>
        </p>
      </div>
    </div>
  );
}
