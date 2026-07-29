"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { platforms, scanMessages } from "@/data/mock";
import type { UserRole } from "@/types";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: "artist", label: "Artist", desc: "Solo career strategy" },
  { id: "manager", label: "Manager", desc: "Multi-artist CRM" },
  { id: "label", label: "Label", desc: "Roster & portfolio" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole | null>(null);
  const [selected, setSelected] = useState<string[]>(["spotify", "tiktok", "instagram"]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");

  async function finish() {
    setScanning(true);
    for (let i = 0; i < scanMessages.length; i++) {
      setMsg(scanMessages[i]!);
      setProgress(Math.round(((i + 1) / scanMessages.length) * 100));
      await new Promise((r) => setTimeout(r, 450));
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-omniv-gold">
            Step {Math.min(step + 1, 3)} of 3
          </p>
          <Progress value={((step + 1) / 3) * 100} className="mt-2" />
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Who are you?</h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              We tailor Command Center and permissions to your role.
            </p>
            <div className="mt-6 space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-all",
                    role === r.id
                      ? "border-omniv-gold/40 bg-omniv-gold/10"
                      : "border-omniv-border hover:border-omniv-border-subtle"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-omniv-text-muted">{r.desc}</p>
                  </div>
                  {role === r.id && <Check className="h-4 w-4 text-omniv-gold" />}
                </button>
              ))}
            </div>
            <Button
              className="mt-6 w-full gap-2"
              disabled={!role}
              onClick={() => setStep(1)}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Connect platforms</h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Select where you publish. You can refine later in Settings.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {platforms.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setSelected((s) =>
                        on ? s.filter((x) => x !== p.id) : [...s, p.id]
                      )
                    }
                    className={cn(
                      "rounded-[var(--radius)] border px-3 py-3 text-left text-sm transition-all",
                      on
                        ? "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold"
                        : "border-omniv-border text-omniv-text-secondary"
                    )}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {scanning ? "Building Artist Brain" : "Ready to scan"}
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {scanning
                ? msg
                : "We'll learn style, audience, and competitive set from your footprint."}
            </p>
            {scanning && (
              <div className="mt-6">
                <Progress value={progress} />
                <p className="mt-2 text-xs text-omniv-text-muted">{progress}%</p>
              </div>
            )}
            {!scanning && (
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={() => void finish()}>
                  Start scan <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
