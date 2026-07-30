"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { platforms, scanMessages } from "@/data/mock";
import { completeOnboarding } from "@/lib/db/profile";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: "artist", label: "Artist", desc: "Solo career strategy" },
  { id: "manager", label: "Manager", desc: "Multi-artist CRM" },
  { id: "label", label: "Label", desc: "Roster & portfolio" },
];

const URL_HINTS: Record<string, string> = {
  spotify: "https://open.spotify.com/artist/…",
  youtube: "https://youtube.com/@…",
  instagram: "https://instagram.com/…",
  tiktok: "https://tiktok.com/@…",
  apple: "https://music.apple.com/…",
  x: "https://x.com/…",
  facebook: "https://facebook.com/…",
  soundcloud: "https://soundcloud.com/…",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [selected, setSelected] = useState<string[]>([
    "spotify",
    "tiktok",
    "instagram",
  ]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    if (!role) return;
    setScanning(true);
    setError(null);
    for (let i = 0; i < scanMessages.length; i++) {
      setMsg(scanMessages[i]!);
      setProgress(Math.round(((i + 1) / scanMessages.length) * 100));
      await new Promise((r) => setTimeout(r, 350));
    }
    if (isSupabaseConfigured()) {
      setMsg("Saving profile + social links…");
      const social_links: Record<string, string> = {};
      for (const id of selected) {
        const u = (links[id] || "").trim();
        if (u) social_links[id] = u;
      }
      const res = await completeOnboarding({
        fullName: fullName || "Artist",
        role,
        platforms: selected,
        social_links,
      });
      if (!res.ok) {
        setError(res.error || "Could not save profile");
        setScanning(false);
        return;
      }
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-omniv-gold">
            Step {Math.min(step + 1, 4)} of 4
          </p>
          <Progress value={((step + 1) / 4) * 100} className="mt-2" />
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Who are you?</h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              We tailor Command Center and permissions to your role.
            </p>
            <div className="mt-6 space-y-3">
              <Input
                label="Display / stage name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ziki Worldwide"
              />
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
              disabled={!role || !fullName.trim()}
              onClick={() => setStep(1)}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Which platforms?
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Select every surface you publish on. Next step saves profile URLs.
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
              <Button
                className="flex-1 gap-2"
                disabled={selected.length === 0}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Save profile links
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Paste public URLs. Omniv re-scans these on a weekly schedule so
              Ziki stays current without re-entering data.
            </p>
            <div className="mt-6 space-y-3">
              {selected.map((id) => {
                const label =
                  platforms.find((p) => p.id === id)?.name || id;
                return (
                  <Input
                    key={id}
                    label={label}
                    placeholder={URL_HINTS[id] || "https://…"}
                    value={links[id] || ""}
                    onChange={(e) =>
                      setLinks((prev) => ({ ...prev, [id]: e.target.value }))
                    }
                  />
                );
              })}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {scanning ? "Building Artist Brain" : "Ready to activate"}
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {scanning
                ? msg
                : "We save your name, role, platforms, and links — then seed Command Center."}
            </p>
            {error && (
              <p className="mt-3 rounded-[var(--radius)] border border-omniv-danger/30 bg-omniv-danger/10 px-3 py-2 text-xs text-omniv-danger">
                {error}
              </p>
            )}
            {scanning && (
              <div className="mt-6">
                <Progress value={progress} />
                <p className="mt-2 text-xs text-omniv-text-muted">{progress}%</p>
              </div>
            )}
            {!scanning && (
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={() => void finish()}>
                  Activate <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
