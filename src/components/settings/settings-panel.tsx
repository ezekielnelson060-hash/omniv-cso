"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { paymentProvider, plans } from "@/data/phase6";
import { usePlan } from "@/components/billing/plan-provider";
import { getProfile, upsertProfile } from "@/lib/db/profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { startFlutterwaveCheckout, type CheckoutPlan } from "@/lib/checkout";
import {
  addMember,
  loadTeam,
  removeMember,
  type TeamMember,
} from "@/lib/team-store";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SURFACE_HINTS = [
  {
    id: "spotify",
    label: "Spotify",
    placeholder: "https://open.spotify.com/artist/...",
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@...",
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/...",
  },
  {
    id: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@...",
  },
];

export function SettingsPanel() {
  const { plan, setPlan, can } = usePlan();
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
  const [notes, setNotes] = useState("");
  const [scanning, setScanning] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [oauthMsg, setOauthMsg] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [tmName, setTmName] = useState("");
  const [tmEmail, setTmEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const o = q.get("oauth");
    const b = q.get("billing");
    if (o === "spotify_ok") setOauthMsg("Spotify connected.");
    if (o === "youtube_ok") setOauthMsg("YouTube connected.");
    if (o && (o.includes("error") || o.includes("config"))) {
      setOauthMsg("OAuth failed — check client IDs in Vercel env.");
    }
    if (b === "success") {
      setStatus("Payment received — plan unlocks after confirmation.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      let n = "";
      let e = "";
      if (isSupabaseConfigured()) {
        const p = await getProfile();
        if (p) {
          n = p.full_name || "";
          e = p.email || "";
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
      }
      setName(n);
      setEmail(e);
      setTeam(loadTeam(e, n || "You"));
    })();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setStatus(null);
    const res = await upsertProfile({ full_name: name });
    setSaving(false);
    setStatus(res.ok ? "Profile saved" : res.error || "Save failed");
  }

  async function signOut() {
    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function runScan() {
    setScanning(true);
    setScanError(null);
    setBriefing(null);
    const list = Object.values(urls)
      .map((u) => u.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/scan/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: list,
          notes,
          artistName: name || undefined,
        }),
      });
      const data = (await res.json()) as {
        briefing?: string;
        error?: string;
      };
      if (!res.ok) setScanError(data.error || "Scan failed");
      else setBriefing(data.briefing || "No briefing returned");
    } catch {
      setScanError("Network error");
    } finally {
      setScanning(false);
    }
  }

  async function checkout(planId: CheckoutPlan) {
    setCheckoutBusy(planId);
    setCheckoutError(null);
    setPlan(planId);
    const res = await startFlutterwaveCheckout({
      plan: planId,
      email: email || undefined,
      name: name || undefined,
    });
    setCheckoutBusy(null);
    if (!res.ok) {
      setCheckoutError(res.error);
      return;
    }
    window.location.href = res.link;
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="text-sm font-medium">Profile</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input label="Email" type="email" value={email} readOnly />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => void saveProfile()} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => void signOut()}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
          {status && (
            <span className="text-xs text-omniv-text-muted">{status}</span>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Radar className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Surface scan</h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-omniv-text-secondary">
          Paste public profile URLs. Omniv returns an executive briefing on
          positioning, gaps, and next moves — grounded in your display name and
          Artist Brain.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SURFACE_HINTS.map((s) => (
            <Input
              key={s.id}
              label={s.label}
              placeholder={s.placeholder}
              value={urls[s.id] || ""}
              onChange={(e) =>
                setUrls((u) => ({ ...u, [s.id]: e.target.value }))
              }
            />
          ))}
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-sm font-medium text-omniv-text-secondary">
            Notes / bio / stats (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Paste bio, monthly listeners, or campaign context…"
            className="w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
          />
        </div>
        <div className="mt-3">
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
        </div>
        {scanError && (
          <p className="mt-3 text-xs text-omniv-danger">{scanError}</p>
        )}
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
          Deep metrics need platform apps. Spotify &amp; YouTube routes are ready
          when client IDs are in Vercel.
        </p>
        {oauthMsg && (
          <p className="mb-3 text-xs text-omniv-gold">{oauthMsg}</p>
        )}
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
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Billing</h3>
          <Badge variant="gold">{paymentProvider.name}</Badge>
        </div>
        <p className="mb-4 text-xs text-omniv-text-secondary">
          {paymentProvider.note}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {plans.map((p) => {
            const id = p.id as CheckoutPlan;
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-[var(--radius-lg)] border p-4 text-left",
                  p.highlighted || plan === p.id
                    ? "border-omniv-gold/40 bg-omniv-gold/10"
                    : "border-omniv-border"
                )}
              >
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="font-data text-lg font-semibold text-omniv-gold">
                  ${p.priceMonthly}
                  <span className="text-xs font-normal text-omniv-text-muted">
                    /mo
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-omniv-text-muted">{p.blurb}</p>
                <Button
                  size="sm"
                  className="mt-3 w-full gap-1"
                  disabled={checkoutBusy !== null}
                  onClick={() => void checkout(id)}
                >
                  {checkoutBusy === id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  {checkoutBusy === id ? "Redirecting…" : "Pay with Flutterwave"}
                </Button>
              </div>
            );
          })}
        </div>
        {checkoutError && (
          <p className="mt-3 text-xs text-omniv-danger">{checkoutError}</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Team</h3>
          {!can("team_seats") && (
            <Badge variant="outline">Pro+</Badge>
          )}
        </div>
        <ul className="space-y-2">
          {team.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-[var(--radius)] border border-omniv-border px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                {m.name}{" "}
                <span className="text-omniv-text-muted">· {m.email}</span>
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">{m.role}</Badge>
                {m.role !== "Owner" && can("team_seats") && (
                  <button
                    type="button"
                    className="text-[11px] text-omniv-danger"
                    onClick={() => setTeam(removeMember(team, m.id))}
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {can("team_seats") ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Input
              placeholder="Name"
              value={tmName}
              onChange={(e) => setTmName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={tmEmail}
              onChange={(e) => setTmEmail(e.target.value)}
            />
            <Button
              size="sm"
              className="gap-1"
              onClick={() => {
                if (!tmName.trim() || !tmEmail.trim()) return;
                setTeam(
                  addMember(team, {
                    name: tmName.trim(),
                    email: tmEmail.trim(),
                    role: "Manager",
                  })
                );
                setTmName("");
                setTmEmail("");
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add member
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-omniv-text-muted">
            Upgrade to Pro to invite managers and analysts.
          </p>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Notifications</h3>
        </div>
        <p className="text-xs text-omniv-text-secondary">
          Opportunity alerts, billing, and team invites are enabled by default.
        </p>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Key className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">API keys</h3>
        </div>
        <p className="mb-3 text-xs text-omniv-text-secondary">
          Available on Label plan. Keys are never shown in full after creation.
        </p>
        <Button variant="outline" size="sm" disabled={!can("api_keys")}>
          Generate key
        </Button>
      </Card>
    </div>
  );
}
