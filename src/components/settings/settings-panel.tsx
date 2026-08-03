"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { paymentProvider, plans } from "@/data/phase6";
import { usePlan } from "@/components/billing/plan-provider";
import {
  getArtistBrain,
  getProfile,
  saveArtistBrain,
  upsertProfile,
} from "@/lib/db/profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { startFlutterwaveCheckout, type CheckoutPlan } from "@/lib/checkout";
import {
  addMember,
  loadTeam,
  removeMember,
  type TeamMember,
} from "@/lib/team-store";
import type { ArtistBrain } from "@/types";
import {
  CreditCard,
  Users,
  Key,
  Bell,
  Plug,
  LogOut,
  Radar,
  Loader2,
  ExternalLink,
  Plus,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SURFACE_HINTS = [
  { id: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { id: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
];

const INTEREST_SUGGESTIONS = [
  "Content systems",
  "Playlist pitching",
  "Tour routing",
  "Brand deals",
  "Release strategy",
  "Fan growth",
  "Sync / licensing",
  "Community",
];

export function SettingsPanel() {
  const { plan, can } = usePlan();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({
    spotify: "",
    youtube: "",
    instagram: "",
    tiktok: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState("");
  const [brain, setBrain] = useState<ArtistBrain | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [strategySaving, setStrategySaving] = useState(false);
  const [strategyStatus, setStrategyStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      let n = "";
      let e = "";
      if (isSupabaseConfigured()) {
        const p = await getProfile();
        if (p) {
          n = p.full_name || "";
          e = p.email || "";
          setInterests(p.interests || []);
          if (p.social_links) {
            setUrls((u) => ({ ...u, ...p.social_links }));
          }
        } else {
          try {
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              e = user.email || "";
              n = (user.user_metadata?.full_name as string) || "";
            }
          } catch {
            /* ignore */
          }
        }
        const b = await getArtistBrain();
        if (b) {
          setBrain(b);
          setGoals(b.goals || []);
        }
      }
      setName(n);
      setEmail(e);
      setTeam(loadTeam(e, n || "You"));
    })();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setStatus(null);
    const res = await upsertProfile({
      full_name: name,
      social_links: urls,
    });
    setSaving(false);
    setStatus(res.ok ? "Profile saved" : res.error || "Save failed");
  }

  async function saveStrategy() {
    setStrategySaving(true);
    setStrategyStatus(null);
    const cleanedGoals = goals.map((g) => g.trim()).filter(Boolean);
    const cleanedInterests = interests.map((i) => i.trim()).filter(Boolean);

    const profileRes = await upsertProfile({
      interests: cleanedInterests,
      social_links: urls,
    });
    if (!profileRes.ok) {
      setStrategySaving(false);
      setStrategyStatus(profileRes.error || "Could not save interests");
      return;
    }

    if (brain) {
      const next: ArtistBrain = {
        ...brain,
        goals: cleanedGoals,
        lastUpdated: new Date().toISOString().slice(0, 10),
      };
      const brainRes = await saveArtistBrain(next);
      setBrain(next);
      setStrategySaving(false);
      setStrategyStatus(
        brainRes.ok ? "Goals & interests saved" : brainRes.error || "Save failed"
      );
    } else {
      setStrategySaving(false);
      setStrategyStatus("Interests saved");
    }
  }

  async function logout() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function runScan() {
    setScanning(true);
    setScanError(null);
    setBriefing(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "profile_scan",
          notes: `Links: ${JSON.stringify(urls)} Goals: ${goals.join(", ")} Interests: ${interests.join(", ")}`,
          artistName: name || brain?.stageName || "Artist",
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) setScanError(data.error || "Scan failed");
      else setBriefing(data.text || null);
    } catch {
      setScanError("Network error");
    }
    setScanning(false);
  }

  async function checkout(planId: CheckoutPlan) {
    const res = await startFlutterwaveCheckout({
      plan: planId,
      email: email || undefined,
      name: name || undefined,
    });
    if (res.ok) window.location.href = res.link;
    else setStatus(res.error || "Checkout failed");
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium">Profile</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void saveProfile()} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void logout()}
            className="gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </Button>
        </div>
        {status && <p className="mt-2 text-xs text-omniv-gold">{status}</p>}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Goals & interests</h3>
        </div>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Add a goal"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const g = goalInput.trim();
                if (g && !goals.includes(g)) setGoals([...goals, g]);
                setGoalInput("");
              }
            }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const g = goalInput.trim();
              if (g && !goals.includes(g)) setGoals([...goals, g]);
              setGoalInput("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {goals.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1 rounded-full border border-omniv-gold/30 bg-omniv-gold/10 px-2.5 py-1 text-xs text-omniv-gold"
            >
              {g}
              <button type="button" onClick={() => setGoals(goals.filter((x) => x !== g))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {goals.length === 0 && (
            <span className="text-xs text-omniv-text-muted">No goals yet</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {INTEREST_SUGGESTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                setInterests((prev) =>
                  prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                )
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                interests.includes(i)
                  ? "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold"
                  : "border-omniv-border text-omniv-text-secondary"
              )}
            >
              {i}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="mt-4"
          disabled={strategySaving}
          onClick={() => void saveStrategy()}
        >
          {strategySaving ? "Saving…" : "Save goals & interests"}
        </Button>
        {strategyStatus && (
          <p className="mt-2 text-xs text-omniv-gold">{strategyStatus}</p>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium">Platform links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {SURFACE_HINTS.map((s) => (
            <Input
              key={s.id}
              label={s.label}
              placeholder={s.placeholder}
              value={urls[s.id] || ""}
              onChange={(e) => setUrls({ ...urls, [s.id]: e.target.value })}
            />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Radar className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Intelligence scan</h3>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          disabled={scanning}
          onClick={() => void runScan()}
        >
          {scanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Radar className="h-3.5 w-3.5" />
          )}
          {scanning ? "Scanning…" : "Run intelligence scan"}
        </Button>
        {scanError && <p className="mt-3 text-xs text-omniv-danger">{scanError}</p>}
        {briefing && (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-omniv-gold/25 bg-omniv-gold/5 p-4">
            <p className="mb-2 font-data text-[10px] uppercase tracking-wider text-omniv-gold">
              Executive briefing
            </p>
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-omniv-text-secondary">
              {briefing}
            </pre>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Plug className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Live OAuth</h3>
        </div>
        <p className="mb-3 text-xs text-omniv-text-secondary">
          Connect platforms for richer context.{" "}
          <a href="/privacy" className="text-omniv-gold hover:underline">
            Privacy
          </a>
          ,{" "}
          <a href="/terms" className="text-omniv-gold hover:underline">
            Terms
          </a>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="/api/oauth/spotify">
            <Button size="sm" variant="outline" className="gap-1.5">
              Connect Spotify
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
          <a href="/api/oauth/youtube">
            <Button size="sm" variant="outline" className="gap-1.5">
              Connect YouTube
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
          <a href="/api/auth/tiktok">
            <Button size="sm" variant="outline" className="gap-1.5">
              Connect TikTok
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Billing</h3>
        </div>
        <p className="mb-3 text-xs text-omniv-text-secondary">
          Current plan: <span className="text-omniv-gold">{plan}</span> ·{" "}
          {paymentProvider.name}
        </p>
        <div className="flex flex-wrap gap-2">
          {plans.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={plan === p.id ? "primary" : "outline"}
              onClick={() => void checkout(p.id as CheckoutPlan)}
            >
              {p.name}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Team</h3>
          {!can("team_seats") && <Badge variant="outline">Pro+</Badge>}
        </div>
        {can("team_seats") ? (
          <>
            <div className="mb-3 flex gap-2">
              <Input
                placeholder="member@email.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!memberEmail.trim()) return;
                  setTeam(
                    addMember(team, {
                      email: memberEmail.trim(),
                      name: memberEmail.trim().split("@")[0] || "Member",
                      role: "Manager",
                    })
                  );
                  setMemberEmail("");
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ul className="space-y-1">
              {team.map((m) => (
                <li
                  key={m.id}
                  className="flex justify-between text-xs text-omniv-text-secondary"
                >
                  <span>
                    {m.email} · {m.role}
                  </span>
                  {m.role !== "Owner" && (
                    <button type="button" onClick={() => setTeam(removeMember(team, m.id))}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-xs text-omniv-text-muted">Upgrade to Pro for team seats.</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Bell className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Notifications</h3>
        </div>
        <p className="text-xs text-omniv-text-muted">Email digests coming soon.</p>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <Key className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">API keys</h3>
        </div>
        <Button variant="outline" size="sm" disabled={!can("api_keys")}>
          Generate key
        </Button>
      </Card>
    </div>
  );
}
