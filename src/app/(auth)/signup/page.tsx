"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        router.push("/onboarding");
        return;
      }
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/onboarding`
              : undefined,
        },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setInfo("Check your email to confirm your account, then sign in.");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Get access failed");
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-omniv-gold/15">
            <span className="text-base font-bold text-omniv-gold">O</span>
          </div>
          <span className="text-lg font-semibold">Omniv</span>
        </div>
        <div className="relative">
          <p className="text-2xl font-semibold leading-snug tracking-tight">
            Private intelligence for
            <br />
            independent careers.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-omniv-text-secondary">
            Claim your seat. Onboarding seals Artist Brain in minutes.
          </p>
        </div>
        <p className="relative text-xs text-omniv-text-muted">
          Artists · Managers · Labels
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <h1 className="text-2xl font-semibold tracking-tight">Create access</h1>
          <p className="mt-1.5 text-sm text-omniv-text-secondary">
            Start with email. Platforms connect in onboarding.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {error && (
              <p className="rounded-[var(--radius)] border border-omniv-danger/30 bg-omniv-danger/10 px-3 py-2 text-xs text-omniv-danger">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-[var(--radius)] border border-omniv-gold/30 bg-omniv-gold/10 px-3 py-2 text-xs text-omniv-gold">
                {info}
              </p>
            )}
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "Creating…" : "Create access"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-omniv-text-secondary">
            Already inside?{" "}
            <Link href="/login" className="text-omniv-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
