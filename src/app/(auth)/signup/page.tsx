"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("omniv_path", "verify");
    }
  }, []);

  function goOnboarding() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("omniv_path", "verify");
    }
    router.push("/onboarding");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        goOnboarding();
        return;
      }
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
            signup_source: "verify",
          },
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
        goOnboarding();
        return;
      }
      setInfo("Check your email to confirm, then sign in.");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden border-r border-omniv-border bg-omniv-elevated p-8 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-omniv-gold/8 blur-[80px]" />
        </div>
        <div className="relative flex items-center gap-2.5">
          <img src="/logo.svg" alt="Omniv" className="h-8 w-8 rounded-lg" />
          <span className="text-base font-semibold">Omniv</span>
        </div>
        <div className="relative">
          <p className="text-xl font-semibold leading-snug tracking-tight text-omniv-text">
            Let's find your market.
          </p>
          <p className="mt-2 max-w-sm text-[12px] leading-snug text-omniv-text-muted">
            Create your free account and build your demand page.
          </p>
        </div>
        <p className="relative text-[10px] text-omniv-text-muted">
          Free to start. No credit card required · omniv.media
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <img src="/logo.svg" alt="Omniv" className="h-7 w-7 rounded-lg" />
            <span className="text-sm font-semibold">Omniv</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Let's find your market
          </h1>
          <p className="mt-1 text-[11px] text-omniv-text-muted">
            Create your free account and start your market test.{" "}
            Already on Omniv?{" "}
            <Link href="/login" className="text-omniv-gold hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label className="text-[10px] font-medium text-omniv-text-muted">
                Name / stage name
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10"
                placeholder="Stage or full name"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-omniv-text-muted">
                Email
              </label>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-omniv-text-muted">
                Password
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            {info && <p className="text-xs text-omniv-gold">{info}</p>}
            <Button type="submit" className="h-10 w-full gap-1.5" disabled={loading}>
              {loading ? "Creating…" : "Start My Market Test"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
          <p className="mt-3 text-[10px] text-omniv-text-muted">
            Free to start. No credit card required. By continuing you agree to
            our{" "}
            <Link href="/terms" className="text-omniv-gold hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-omniv-gold hover:underline">
              Privacy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
