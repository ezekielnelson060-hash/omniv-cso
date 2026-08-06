"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const next = "/dashboard";
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        router.push(next);
        return;
      }
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden border-r border-omniv-border bg-omniv-elevated p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-omniv-gold/8 blur-[80px]" />
        </div>
        <div className="relative flex items-center gap-2.5">
          <img src="/logo.svg" alt="Omniv" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-semibold">Omniv</span>
        </div>
        <div className="relative">
          <p className="text-2xl font-semibold leading-snug tracking-tight text-omniv-text">
            Your next move
            <br />
            should not be a guess.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-omniv-text-secondary">
            Return to ranked priorities. Ziki already holds your context.
          </p>
        </div>
        <p className="relative text-xs text-omniv-text-muted">
          Private career intelligence for independent operators.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 lg:hidden">
            <div className="mb-6 flex items-center gap-2">
              <img src="/logo.svg" alt="Omniv" className="h-8 w-8 rounded-lg" />
              <span className="font-semibold">Omniv</span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Return to the system</h1>
          <p className="mt-1.5 text-sm text-omniv-text-secondary">
            Continue where intelligence left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@artist.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="rounded-[var(--radius)] border border-omniv-danger/30 bg-omniv-danger/10 px-3 py-2 text-xs text-omniv-danger">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <Link
                href="/forgot-password"
                className="text-omniv-text-muted hover:text-omniv-gold"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-omniv-text-secondary">
            New to Omniv?{" "}
            <Link href="/signup" className="text-omniv-gold hover:underline">
              Get access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
