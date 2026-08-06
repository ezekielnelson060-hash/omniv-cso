"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { platforms, scanMessages } from "@/data/mock";
import { completeOnboarding } from "@/lib/db/profile";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { CareerStage, UserRole } from "@/types";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: "artist", label: "Artist", desc: "Your career. One ranked move at a time" },
  { id: "manager", label: "Manager", desc: "Roster clarity for developing acts" },
  { id: "label", label: "Label", desc: "Attention allocation across the roster" },
];

const STAGES: { id: CareerStage; label: string; desc: string }[] = [
  { id: "emerging", label: "Emerging", desc: "Building catalogue & first fans" },
  { id: "developing", label: "Developing", desc: "Consistent releases, growing base" },
  { id: "breakthrough", label: "Breakthrough", desc: "Breakout moment / scaling" },
  { id: "established", label: "Established", desc: "Known act, systemising growth" },
  { id: "legacy", label: "Legacy", desc: "Catalogue + long-term brand" },
];

const GENRE_OPTIONS = [
  "Afrobeats",
  "Amapiano",
  "Hip-Hop",
  "R&B",
  "Alt-R&B",
  "Pop",
  "Gospel",
  "Highlife",
  "Electronic",
  "Rock",
  "Jazz",
  "Country",
  "Latin",
  "Other",
];

const INTEREST_OPTIONS = [
  { id: "content", label: "Content & short-form" },
  { id: "release", label: "Releases & singles" },
  { id: "playlist", label: "Playlists & editorial" },
  { id: "live", label: "Live / tours / festivals" },
  { id: "collab", label: "Collaborations" },
  { id: "brand", label: "Brand & positioning" },
  { id: "audience", label: "Audience growth" },
  { id: "monetise", label: "Monetisation" },
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
  const [genres, setGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState("");
  const [musicStyle, setMusicStyle] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [careerStage, setCareerStage] = useState<CareerStage | null>(null);
  const [goalText, setGoalText] = useState("");
  const [interests, setInterests] = useState<string[]>([
    "content",
    "release",
    "audience",
  ]);
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

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].slice(0, 4)
    );
  }

  function toggleInterest(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function finish() {
    if (!role || !careerStage) return;
    setScanning(true);
    setError(null);
    for (let i = 0; i < scanMessages.length; i++) {
      setMsg(scanMessages[i]!);
      setProgress(Math.round(((i + 1) / scanMessages.length) * 100));
      await new Promise((r) => setTimeout(r, 320));
    }
    if (isSupabaseConfigured()) {
      setMsg("Sealing Artist Brain · activating Command Center…");
      const social_links: Record<string, string> = {};
      for (const id of selected) {
        const u = (links[id] || "").trim();
        if (u) social_links[id] = u;
      }
      const genreList = [
        ...genres.filter((g) => g !== "Other"),
        ...(customGenre.trim() ? [customGenre.trim()] : []),
      ];
      const goals = goalText
        .split(/\n|;|\./)
        .map((g) => g.trim())
        .filter(Boolean)
        .slice(0, 5);

      const res = await completeOnboarding({
        fullName: fullName || "Artist",
        role,
        platforms: selected,
        social_links,
        genre: genreList.length ? genreList : ["TBD"],
        musicStyle:
          musicStyle.trim() ||
          "To be refined as catalogue and content signals land.",
        brandVoice:
          brandVoice.trim() || "Authentic, intentional, growth-focused.",
        careerStage,
        goals:
          goals.length > 0
            ? goals
            : ["Clarify next release window", "Grow engaged audience"],
        bigDream: goalText.trim() || goals[0] || undefined,
        interests,
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
            Step {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}
          </p>
          <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="mt-2" />
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Claim your seat</h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              This is not a generic account. Role and name lock how Omniv ranks
              priorities for the rest of the system.
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
                      : "border-omniv-border"
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
            <h1 className="text-2xl font-semibold tracking-tight">Lock your sound</h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Genre, style, and stage become private context, the advantage most artists never lock in.
            </p>
            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
              Genre (up to 4)
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {GENRE_OPTIONS.map((g) => {
                const on = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-all",
                      on
                        ? "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold"
                        : "border-omniv-border text-omniv-text-secondary"
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            {genres.includes("Other") && (
              <div className="mt-3">
                <Input
                  label="Custom genre"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="e.g. Afro-fusion"
                />
              </div>
            )}
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-omniv-text-secondary">
                Sound / style
              </label>
              <textarea
                value={musicStyle}
                onChange={(e) => setMusicStyle(e.target.value)}
                rows={3}
                placeholder="Describe your sound: tempo, mood, production, influences…"
                className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
              />
            </div>
            <div className="mt-3">
              <Input
                label="Brand voice (optional)"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="e.g. Intimate, bold, spiritual, playful…"
              />
            </div>
            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
              Career level
            </p>
            <div className="mt-2 space-y-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCareerStage(s.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius)] border px-3 py-2.5 text-left text-sm",
                    careerStage === s.id
                      ? "border-omniv-gold/40 bg-omniv-gold/10"
                      : "border-omniv-border"
                  )}
                >
                  <span>
                    <span className="font-medium">{s.label}</span>
                    <span className="text-omniv-text-muted"> · {s.desc}</span>
                  </span>
                  {careerStage === s.id && (
                    <Check className="h-4 w-4 text-omniv-gold" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={
                  !careerStage ||
                  (genres.length === 0 && !customGenre.trim())
                }
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
              What is the Big Dream?
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Managers hold one career image and refuse weekly noise that does
              not serve it. Write that picture. Omniv ranks every move against it.
            </p>
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-omniv-text-secondary">
                Big Dream (first line is the north star; more lines = near-term goals)
              </label>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                rows={4}
                placeholder={
                  "Headlining 2k rooms in 24 months while owning my masters\n50k direct fans on my list\nConsistent weekly content system"
                }
                className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
              />
            </div>
            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
              Focus areas for opportunities
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((opt) => {
                const on = interests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-all",
                      on
                        ? "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold"
                        : "border-omniv-border text-omniv-text-secondary"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={interests.length === 0}
                onClick={() => setStep(3)}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Where the career actually lives
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Platforms bias scores and opportunities. Only select what you will
              actually run. Noise dilutes intelligence.
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
                      "rounded-[var(--radius)] border px-3 py-3 text-left text-sm",
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
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={selected.length === 0}
                onClick={() => setStep(4)}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Profile links
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Saved for weekly scans and Ziki context. Skip any you don't have.
            </p>
            <div className="mt-6 space-y-3">
              {selected.map((id) => (
                <Input
                  key={id}
                  label={platforms.find((p) => p.id === id)?.name || id}
                  placeholder={URL_HINTS[id] || "https://…"}
                  value={links[id] || ""}
                  onChange={(e) =>
                    setLinks((prev) => ({ ...prev, [id]: e.target.value }))
                  }
                />
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(5)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {scanning ? "Building your OS" : "Activate Omniv"}
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {scanning
                ? msg
                : "Command Center, Artist Brain, Ziki, and Opportunity Feed activate on this profile only."}
            </p>
            {!scanning && (
              <ul className="mt-4 space-y-1.5 text-xs text-omniv-text-muted">
                <li>· Name: {fullName}</li>
                <li>· Genre: {[...genres, customGenre].filter(Boolean).join(", ")}</li>
                <li>· Level: {careerStage}</li>
                <li>· Focus: {interests.join(", ")}</li>
              </ul>
            )}
            {error && (
              <p className="mt-3 text-xs text-omniv-danger">{error}</p>
            )}
            {scanning && (
              <div className="mt-6">
                <Progress value={progress} />
                <p className="mt-2 text-xs text-omniv-text-muted">{progress}%</p>
              </div>
            )}
            {!scanning && (
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={() => void finish()}>
                  Enter Command Center <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
