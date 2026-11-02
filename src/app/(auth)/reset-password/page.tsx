"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    // Recovery links land with a session (or hash tokens handled by client)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setReady(true); // still show form; updateUser will fail clearly
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError("Auth is not configured");
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push("/explore");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-omniv-text-secondary hover:text-omniv-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        {done ? (
          <div className="animate-fade-in-up text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-omniv-success/10">
              <CheckCircle2 className="h-6 w-6 text-omniv-success" />
            </div>
            <h1 className="text-2xl font-semibold">Password updated</h1>
            <p className="mt-2 text-sm text-omniv-text-secondary">
              Redirecting you in…
            </p>
          </div>
        ) : (
          <>
            <div className="mb-1 flex items-center gap-2">
              <Lock className="h-5 w-5 text-omniv-gold" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Set new password
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-omniv-text-secondary">
              Choose a strong password for your Omniv account.
            </p>
            {!ready && (
              <p className="mt-4 text-xs text-omniv-text-muted">
                Checking recovery session…
              </p>
            )}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                disabled={!ready}
              >
                Update password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
