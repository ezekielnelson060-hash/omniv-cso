"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
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

        {sent ? (
          <div className="animate-fade-in-up text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-omniv-success/10">
              <CheckCircle2 className="h-6 w-6 text-omniv-success" />
            </div>
            <h1 className="text-2xl font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-omniv-text-secondary">
              If an account exists for that address, we sent a reset link.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset password
            </h1>
            <p className="mt-1.5 text-sm text-omniv-text-secondary">
              Enter your email and we&apos;ll send a secure link.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@artist.com"
                required
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send reset link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
