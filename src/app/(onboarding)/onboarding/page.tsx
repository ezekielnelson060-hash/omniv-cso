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

const TOTAL_STEPS = 6;

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: "artist", label: "Artist", desc: "Find where your music has real demand" },
  { id: "manager", label: "Manager", desc: "Verify where each act has a market" },
  { id: "label", label: "Label", desc: "Check demand before you invest" },
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
  { id: "market", label: "Find my strongest market" },
  { id: "live", label: "Rooms & live demand" },
  { id: "audience", label: "Own the fan list" },
  { id: "release", label: "Release timing" },
  { id: "monetise", label: "Get paid from fans" },
  { id: "content", label: "Content that compounds" },
  { id: "playlist", label: "Playlists & editorial" },
  { id: "collab", label: "Collaborations" },
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

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [marketTest, setMarketTest] = useState(false);
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
    "market",
    "live",
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
  const [testCity, setTestCity] = useState("");

  useEffect(() => {
    const q = searchParams.get("path") === "verify";
    const s =
      typeof window !== "undefined" &&
      sessionStorage.getItem("omniv_path") === "verify";
    if (q || s) {
      setMarketTest(true);
      setRole("artist");
      setCareerStage("emerging");
      setInterests(["market", "live", "audience"]);
    }
  }, [searchParams]);

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
    const effectiveRole = role || "artist";
    const effectiveStage = careerStage || "emerging";
    setScanning(true);
    setError(null);
    for (let i = 0; i < scanMessages.length; i++) {
      setMsg(scanMessages[i]!);
      setProgress(Math.round(((i + 1) / scanMessages.length) * 100));
      await new Promise((r) => setTimeout(r, marketTest ? 180 : 320));
    }
    if (isSupabaseConfigured()) {
      setMsg(
        marketTest
          ? "Preparing your demand page…"
          : "Locking demand profile · preparing your market scan…"
      );
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
      if (marketTest && testCity.trim()) {
        goals.unshift(`Test demand in ${testCity.trim()}`);
      }

      const res = await completeOnboarding({
        fullName: fullName || "Artist",
        role: effectiveRole,
        platforms: selected,
        social_links,
        genre: genreList.length ? genreList : ["TBD"],
        musicStyle:
          musicStyle.trim() ||
          "To be refined as catalogue and content signals land.",
        brandVoice:
          brandVoice.trim() || "Authentic, intentional, growth-focused.",
        careerStage: effectiveStage,
        goals:
          goals.length > 0
            ? goals
            : ["Find strongest market city", "Test a paid room"],
        bigDream: goalText.trim() || goals[0] || undefined,
        interests: interests.length ? interests : ["market", "live", "audience"],
      });
      if (!res.ok) {
        setError(res.error || "Could not save profile");
        setScanning(false);
        return;
      }
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("omniv_path");
    }
    router.push(marketTest ? "/crm?welcome=verify" : "/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-omniv-gold">
            {marketTest
              ? `Market test · step ${Math.min(step + 1, 2)} of 2`
              : `Step ${Math.min(step + 1, TOTAL_STEPS)} of ${TOTAL_STEPS}`}
          </p>
          <Progress
            value={
              marketTest
                ? ((step + 1) / 2) * 100
                : ((step + 1) / TOTAL_STEPS) * 100
            }
            className="mt-2"
          />
        </div>

        {marketTest && step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Start your market test
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Two quick steps. Then you get a demand page to share — email, city,
              would-attend — so the market can answer.
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

        {marketTest && step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {scanning ? "Setting up your demand page…" : "Ready to verify"}
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {scanning
                ? msg
                : "We'll create your profile and open CRM so you can share your Fan Gate link with your audience."}
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

        {!marketTest && step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Who are you?</h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Omniv verifies where demand is real — for your career or your roster.
              Start with who you are.
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

        {!marketTest && step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your sound & stage</h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Genre and career stage help Omniv read your signals in the right lane.
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
                placeholder="Describe your sound…"
                className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
              />
            </div>
            <div className="mt-3">
              <Input
                label="Brand voice (optional)"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="e.g. Intimate, bold…"
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
                  !careerStage || (genres.length === 0 && !customGenre.trim())
                }
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!marketTest && step === 2 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              What are you trying to prove?
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              One clear outcome — a city, a room, a list, a payday.
            </p>
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-omniv-text-secondary">
                Goal
              </label>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                rows={4}
                placeholder="Prove Accra will fill a 40-person room"
                className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
              />
            </div>
            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
              What should Omniv prioritise?
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

        {!marketTest && step === 3 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Where do the signals live?
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              Pick platforms you actually use.
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

        {!marketTest && step === 4 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Links for the demand scan
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">Optional but powerful.</p>
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

        {!marketTest && step === 5 && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {scanning ? "Verifying your market signals" : "Run your demand scan"}
            </h1>
            <p className="mt-1 text-sm text-omniv-text-secondary">
              {scanning
                ? msg
                : "We'll map where demand looks strongest and what to test first."}
            </p>
            {!scanning && (
              <ul className="mt-4 space-y-1.5 text-xs text-omniv-text-muted">
                <li>· Name: {fullName}</li>
                <li>· Genre: {[...genres, customGenre].filter(Boolean).join(", ")}</li>
                <li>· Level: {careerStage}</li>
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
                <Button variant="outline" className="flex-1" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={() => void finish()}>
                  Verify my market <ArrowRight className="h-4 w-4" />
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
