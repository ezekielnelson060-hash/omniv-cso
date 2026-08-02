"use client";

import { useEffect, useState, Suspense } from "react";
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
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

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

function TikTokOAuthStatus() {
  const params = useSearchParams();
  const status = params.get("tiktok");
  const name = params.get("name");
  if (!status) return null;
  if (status === "connected") {
    return (
      <p className="mb-3 text-xs text-emerald-400">
        TikTok connected{name ? `: ${name}` : ""}
      </p>
    );
  }
  return (
    <p className="mb-3 text-xs text-omniv-danger">
      TikTok connect: {status}
      {params.get("reason") ? ` — ${params.get("reason")}` : ""}
    </p>
  );
}

export function SettingsPanel() {
  const { plan, setPlan, can } = usePlan();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("artist");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({
    spotify: "",
    youtube: "",
    instagram: "",
    tiktok: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState("");
  const [brain, setBrain] = useState<ArtistBrain | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [oauthMsg, setOauthMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [p, b] = await Promise.all([getProfile(), getArtistBrain()]);
      if (p) {
        setName(p.name || "");
        setEmail(p.email || "");
        setRole(p.role || "artist");
        if (p.social_links && typeof p.social_links === "object") {
          const s = p.social_links as Record<string, string>;
          setLinks((prev) => ({ ...prev, ...s }));
        }
      }
      if (b) {
        setBrain(b);
        setInterests(b.interests || []);
        setGoals(b.goals || "");
      }
      setTeam(loadTeam());
    })();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setMsg(null);
    try {
      await upsertProfile({
        name,
        email,
        role,
        social_links: links,
      } as Parameters<typeof upsertProfile>[0]);
      if (brain) {
        await saveArtistBrain({
          ...brain,
          interests,
          goals,
        });
      }
      setMsg("Saved");
    } catch {
      setMsg("Could not save");
    }
    setSaving(false);
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
          notes: `Links: ${JSON.stringify(links)} Goals: ${goals} Interests: ${interests.join(", ")}`,
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

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium">Profile</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void saveProfile()} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => void logout()} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </Button>
        </div>
        {msg && <p className="mt-2 text-xs text-omniv-gold">{msg}</p>}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Goals & interests</h3>
        </div>
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={3}
          placeholder="What you want to achieve this quarter…"
          className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {INTEREST_SUGGESTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleInterest(i)}
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
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium">Platform links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {SURFACE_HINTS.map((s) => (
            <Input
              key={s.id}
              label={s.label}
              placeholder={s.placeholder}
              value={links[s.id] || ""}
              onChange={(e) => setLinks({ ...links, [s.id]: e.target.value })}
            />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Radar className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Intelligence scan</h3>
        </div>
        <Button size="sm" className="gap-1.5" disabled={scanning} onClick={() => void runScan()}>
          {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Radar className="h-3.5 w-3.5" />}
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
          Deep metrics need platform apps. Review pages:{" "}
          <a href="/privacy" className="text-omniv-gold hover:underline">Privacy</a>,{" "}
          <a href="/terms" className="text-omniv-gold hover:underline">Terms</a>.
        </p>
        <Suspense fallback={null}>
          <TikTokOAuthStatus />
        </Suspense>
        {oauthMsg && <p className="mb-3 text-xs text-omniv-gold">{oauthMsg}</p>}
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
          Current plan: <span className="text-omniv-gold">{plan}</span> · {paymentProvider}
        </p>
        <div className="flex flex-wrap gap-2">
          {plans.filter((p) => p.id !== "free").map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={plan === p.id ? "default" : "outline"}
              onClick={() => void startFlutterwaveCheckout(p.id as CheckoutPlan)}
            >
              {p.name}
            </Button>
          ))}
        </div>
      </Card>

      {can("team") && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-omniv-gold" />
            <h3 className="text-sm font-medium">Team</h3>
          </div>
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
                setTeam(addMember(memberEmail.trim()));
                setMemberEmail("");
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ul className="space-y-1">
            {team.map((m) => (
              <li key={m.id} className="flex justify-between text-xs text-omniv-text-secondary">
                <span>{m.email}</span>
                <button type="button" onClick={() => setTeam(removeMember(m.id))}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

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
        <p className="text-xs text-omniv-text-muted">Public API keys for partners — roadmap.</p>
      </Card>
    </div>
  );
}
