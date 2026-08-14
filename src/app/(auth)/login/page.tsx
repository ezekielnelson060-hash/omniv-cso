"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const next = "/dashboard";
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

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

      // Check if MFA (AAL2) is required
      const { data: aal, error: aalErr } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (
        !aalErr &&
        aal &&
        aal.currentLevel === "aal1" &&
        aal.nextLevel === "aal2"
      ) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.find((f) => f.status === "verified");
        if (totp) {
          setFactorId(totp.id);
          setMfaRequired(true);
          setLoading(false);
          return;
        }
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || mfaCode.trim().length < 6) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setError(challenge.error.message);
        setLoading(false);
        return;
      }
      const verified = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: mfaCode.trim(),
      });
      if (verified.error) {
        setError(verified.error.message);
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
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
            Your next move
            <br />
            should not be a guess.
          </p>
          <p className="mt-2 max-w-sm text-[12px] leading-snug text-omniv-text-muted">
            Return to ranked priorities. Ziki already holds your context.
          </p>
        </div>
        <p className="relative text-[10px] text-omniv-text-muted">
          Private career intelligence for independent artists & labels
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <img src="/logo.svg" alt="Omniv" className="h-7 w-7 rounded-lg" />
            <span className="text-sm font-semibold">Omniv</span>
          </div>

          {!mfaRequired ? (
            <>
              <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
              <p className="mt-1 text-[11px] text-omniv-text-muted">
                No account?{" "}
                <Link href="/signup" className="text-omniv-gold hover:underline">
                  Create one
                </Link>
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-omniv-text-muted">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[10px] text-omniv-gold hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 h-10"
                  />
                </div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <Button
                  type="submit"
                  className="h-10 w-full gap-1.5"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-1 flex items-center gap-2">
                <Shield className="h-5 w-5 text-omniv-gold" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Two-factor code
                </h1>
              </div>
              <p className="mt-1 text-[11px] text-omniv-text-muted">
                Open your authenticator app and enter the 6-digit code for Omniv.
              </p>
              <form onSubmit={handleMfa} className="mt-5 space-y-3">
                <Input
                  label="Authentication code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) =>
                    setMfaCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="h-10 font-data tracking-widest"
                />
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <Button
                  type="submit"
                  className="h-10 w-full gap-1.5"
                  disabled={loading || mfaCode.length < 6}
                >
                  {loading ? "Verifying…" : "Verify & continue"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-[11px] text-omniv-text-muted hover:text-omniv-gold"
                  onClick={() => {
                    setMfaRequired(false);
                    setMfaCode("");
                    setFactorId(null);
                    setError(null);
                  }}
                >
                  Back to sign in
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
