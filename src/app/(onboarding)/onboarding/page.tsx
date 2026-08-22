"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { platforms, scanMessages } from "@/data/mock";
import { completeOnboarding } from "@/lib/db/profile";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { CareerStage, UserRole } from "@/types";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole | null>("artist");
  const [fullName, setFullName] = useState("");
  const [careerStage, setCareerStage] = useState<CareerStage | null>("emerging");
  const [interests, setInterests] = useState<string[]>(["market", "live", "audience"]);
  const [selected] = useState<string[]>(["spotify", "tiktok", "instagram"]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [testCity, setTestCity] = useState("");

  useEffect(() => {
    setRole("artist");
    setCareerStage("emerging");
    setInterests(["market", "live", "audience"]);
  }, [searchParams]);

  async function finish() {
    const effectiveRole = role || "artist";
    const effectiveStage = careerStage || "emerging";
    setScanning(true);
    setError(null);
    for (let i = 0; i < scanMessages.length; i++) {
      setMsg(scanMessages[i]!);
      setProgress(Math.round(((i + 1) / scanMessages.length) * 100));
      await new Promise((r) => setTimeout(r, 180));
    }
    if (isSupabaseConfigured()) {
      setMsg("Preparing your demand page…");
      const goals: string[] = ["Find strongest market city", "Test a paid room"];
      if (testCity.trim()) {
        goals.unshift(`Test demand in ${testCity.trim()}`);
      }
      const res = await completeOnboarding({
        fullName: fullName || "Artist",
        role: effectiveRole,
        platforms: selected,
        social_links: {},
        genre: ["TBD"],
        musicStyle: "To be refined as signals land.",
        brandVoice: "Authentic, intentional, growth-focused.",
        careerStage: effectiveStage,
        goals,
        bigDream: goals[0],
        interests,
      });
      if (!res.ok) {
        setError(res.error || "Could not save profile");
        setScanning(false);
        return;
      }
      try {
        await fetch("/api/roster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stageName: fullName || "Artist" }),
        });
      } catch {
        /* CRM can create later */
      }
    }
    if (typeof window !== "undefined") sessionStorage.removeItem("omniv_path");
    router.push("/crm?welcome=verify");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-omniv-gold">
            Market test · step {Math.min(step + 1, 2)} of 2
          </p>
          <Progress value={((step + 1) / 2) * 100} className="mt-2" />
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Start your market test
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Two quick steps. Then you get a demand page to share — email, city,
              would-attend.
            </p>
            <div className="mt-6 space-y-3">
              <Input
                label="Stage name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. the name fans know"
              />
              <Input
                label="City you thought was your market (optional)"
                value={testCity}
                onChange={(e) => setTestCity(e.target.value)}
                placeholder="e.g. Lagos"
              />
            </div>
            <Button
              className="mt-6 w-full gap-2"
              disabled={!fullName.trim()}
              onClick={() => setStep(1)}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {scanning ? "Setting up your demand page…" : "Ready to verify"}
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {scanning
                ? msg
                : "We create your artist page and open CRM so you can share your Fan Gate."}
            </p>
            {!scanning && (
              <ul className="mt-4 space-y-1.5 text-xs text-omniv-text-muted">
                <li>· Artist: {fullName}</li>
                {testCity.trim() && <li>· Testing against: {testCity}</li>}
                <li>· Next: share Fan Gate → collect city + intent</li>
              </ul>
            )}
            {error && <p className="mt-3 text-xs text-omniv-danger">{error}</p>}
            {scanning && (
              <div className="mt-6">
                <Progress value={progress} />
                <p className="mt-2 text-xs text-omniv-text-muted">{progress}%</p>
              </div>
            )}
            {!scanning && (
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={() => void finish()}>
                  Open my demand tools <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-omniv-text-muted">
          Loading…
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
