"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    router.push("/onboarding");
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
            Build the career
            <br />
            strategy engine
            <br />
            around you.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-omniv-text-secondary">
            Artists, managers and labels — one OS that remembers everything and
            recommends the highest-impact next move.
          </p>
        </div>
        <p className="relative text-xs text-omniv-text-muted">
          Free to start. No credit card required.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-omniv-text-secondary">
            We&apos;ll guide you through a short onboarding after this.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input label="Full name" placeholder="Your name" required />
            <Input
              label="Email"
              type="email"
              placeholder="you@artist.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full gap-2" size="lg" loading={loading}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-omniv-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-omniv-black px-3 text-omniv-text-muted">
                or
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" size="lg" type="button">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-omniv-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-omniv-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
