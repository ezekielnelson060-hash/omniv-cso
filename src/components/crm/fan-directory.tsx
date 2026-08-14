"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { zikiHref, zikiPrompts } from "@/lib/ziki-prompts";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  RefreshCw,
  Link2,
  Download,
  MessageSquare,
  Pencil,
  Tag,
  CheckSquare,
  Square,
  X,
} from "lucide-react";

type RosterArtist = {
  id: string;
  stage_name: string;
  slug: string;
  genre: string | null;
};

type Fan = {
  id: string;
  email: string;
  first_name: string | null;
  last_name?: string | null;
  city: string | null;
  country_code: string | null;
  acquisition_source: string | null;
  fan_tier: string | null;
  engagement_score: number | null;
  created_at: string;
  last_active_at: string | null;
  notes?: string | null;
  tags?: string[] | null;
  would_attend?: boolean | null;
  is_email_subscribed?: boolean | null;
};

type Interaction = {
  id: string;
  action_type: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

const TIERS = ["Superfan", "Core Fan", "Casual", "Cold", "Unsubscribed"] as const;

export function FanDirectory() {
  const [artists, setArtists] = useState<RosterArtist[]>([]);
  const [artistId, setArtistId] = useState<string>("");
  const [fans, setFans] = useState<Fan[]>([]);
  const [selected, setSelected] = useState<Fan | null>(null);
  const [timeline, setTimeline] = useState<Interaction[]>([]);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [segment, setSegment] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    city: "",
    notes: "",
    tags: "",
    fan_tier: "Casual",
    would_attend: false,
  });
  const [saveBusy, setSaveBusy] = useState(false);

  const loadArtists = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setMsg("Connect Supabase to load roster fans.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug, genre")
      .order("stage_name");
    if (error) {
      setMsg(
        error.message.includes("relation")
          ? "Run migration 005_multi_tenant_fans.sql in Supabase first."
          : error.message
      );
      setLoading(false);
      return;
    }
    const list = (data || []) as RosterArtist[];
    setArtists(list);
    if (list[0] && !artistId) setArtistId(list[0].id);
    setLoading(false);
  }, [artistId]);

  const loadFans = useCallback(async (aid: string) => {
    if (!aid || !isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fans")
      .select(
        "id, email, first_name, last_name, city, country_code, acquisition_source, fan_tier, engagement_score, created_at, last_active_at, notes, tags, would_attend, is_email_subscribed"
      )
      .eq("artist_id", aid)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      setMsg(
        error.message.includes("notes") || error.message.includes("tags")
          ? "Run migration 023_fan_tags_notes.sql in Supabase for tags/notes."
          : error.message
      );
      // fallback without new columns
      const fallback = await supabase
        .from("fans")
        .select(
          "id, email, first_name, city, country_code, acquisition_source, fan_tier, engagement_score, created_at, last_active_at"
        )
        .eq("artist_id", aid)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!fallback.error) setFans((fallback.data || []) as Fan[]);
      return;
    }
    setFans((data || []) as Fan[]);
    setSelected(null);
    setTimeline([]);
    setChecked(new Set());
    setEditing(false);
  }, []);

  useEffect(() => {
    void loadArtists();
  }, [loadArtists]);

  useEffect(() => {
    if (artistId) void loadFans(artistId);
  }, [artistId, loadFans]);

  async function openFan(f: Fan) {
    setSelected(f);
    setEditing(false);
    setEditForm({
      first_name: f.first_name || "",
      city: f.city || "",
      notes: f.notes || "",
      tags: (f.tags || []).join(", "),
      fan_tier: f.fan_tier || "Casual",
      would_attend: Boolean(f.would_attend),
    });
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("fan_interactions")
      .select("id, action_type, created_at, metadata")
      .eq("fan_id", f.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setTimeline((data || []) as Interaction[]);
  }

  async function saveFan() {
    if (!selected) return;
    setSaveBusy(true);
    const tags = editForm.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const res = await fetch(`/api/fans/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: editForm.first_name || null,
        city: editForm.city || null,
        notes: editForm.notes,
        tags,
        fan_tier: editForm.fan_tier,
        would_attend: editForm.would_attend,
      }),
    });
    const data = await res.json();
    setSaveBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Save failed");
      return;
    }
    const updated = data.fan as Fan;
    setFans((prev) => prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)));
    setSelected({ ...selected, ...updated });
    setEditing(false);
    setMsg("Fan updated");
  }

  async function runBulk(
    action:
      | "add_tag"
      | "remove_tag"
      | "set_tier"
      | "mark_release"
      | "clear_release"
      | "set_would_attend",
    extra?: { tag?: string; tier?: string; wouldAttend?: boolean }
  ) {
    if (!artistId || checked.size === 0) return;
    setBulkBusy(true);
    const res = await fetch("/api/fans/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artistId,
        fanIds: Array.from(checked),
        action,
        ...extra,
      }),
    });
    const data = await res.json();
    setBulkBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Bulk action failed");
      return;
    }
    setMsg(`Updated ${data.updated} fans`);
    void loadFans(artistId);
  }

  const filtered = useMemo(() => {
    return fans.filter((f) => {
      if (tier !== "all" && f.fan_tier !== tier) return false;
      if (segment === "release") {
        const tags = f.tags || [];
        if (!tags.includes("release")) return false;
      } else if (segment === "would_attend") {
        if (!f.would_attend) return false;
      } else if (segment === "super_release") {
        const tags = f.tags || [];
        if (f.fan_tier !== "Superfan" && !tags.includes("release")) return false;
      }
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      const tagStr = (f.tags || []).join(" ");
      return (
        f.email.toLowerCase().includes(s) ||
        (f.city || "").toLowerCase().includes(s) ||
        (f.first_name || "").toLowerCase().includes(s) ||
        tagStr.includes(s)
      );
    });
  }, [fans, q, tier, segment]);

  const allFilteredChecked =
    filtered.length > 0 && filtered.every((f) => checked.has(f.id));

  function toggleAllFiltered() {
    if (allFilteredChecked) {
      setChecked(new Set());
    } else {
      setChecked(new Set(filtered.map((f) => f.id)));
    }
  }

  function toggleOne(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const active = artists.find((a) => a.id === artistId);
  const gateUrl =
    typeof window !== "undefined" && active
      ? `${window.location.origin}/f/${active.slug}`
      : active
        ? `/f/${active.slug}`
        : "";

  const exportHref = artistId
    ? `/api/fans/export?artistId=${artistId}${tier !== "all" ? `&tier=${encodeURIComponent(tier)}` : ""}`
    : null;

  const emailZiki = zikiHref(
    zikiPrompts.segmentTiers({
      artistName: active?.stage_name || "this artist",
      fanCount: fans.length,
      superfanPct: fans.length
        ? Math.round(
            (fans.filter((f) => f.fan_tier === "Superfan").length / fans.length) *
              100
          )
        : 0,
      coldPct: fans.length
        ? Math.round(
            (fans.filter((f) => f.fan_tier === "Cold").length / fans.length) * 100
          )
        : 0,
      gateSlug: active?.slug,
    })
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-omniv-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Fan directory</h3>
          <Badge variant="outline">{fans.length} owned</Badge>
          {checked.size > 0 && (
            <Badge variant="gold">{checked.size} selected</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="h-9 rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-xs"
          >
            {artists.length === 0 && (
              <option value="">No roster artists yet</option>
            )}
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.stage_name}
              </option>
            ))}
          </select>
          {exportHref && (
            <a href={exportHref}>
              <Button size="sm" variant="outline" className="gap-1">
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
            </a>
          )}
          <Link href={emailZiki}>
            <Button size="sm" variant="outline" className="gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Email copy
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => {
              void loadArtists();
              if (artistId) void loadFans(artistId);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {msg && (
        <p className="border-b border-omniv-border px-4 py-2 text-xs text-omniv-text-muted">
          {msg}{" "}
          <button
            type="button"
            className="ml-2 text-omniv-gold underline"
            onClick={() => setMsg(null)}
          >
            dismiss
          </button>
        </p>
      )}

      {active && (
        <div className="flex flex-wrap items-center gap-2 border-b border-omniv-border bg-omniv-elevated/40 px-4 py-2 text-xs text-omniv-text-secondary">
          <Link2 className="h-3.5 w-3.5 text-omniv-gold" />
          Gate link:{" "}
          <a
            href={gateUrl}
            target="_blank"
            rel="noreferrer"
            className="font-data text-omniv-gold hover:underline"
          >
            /f/{active.slug}
          </a>
          <span className="text-omniv-text-muted">
            · Pre-release: select fans → tag Release → export or invite
          </span>
        </div>
      )}

      {/* Bulk action bar */}
      {checked.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-omniv-gold/30 bg-omniv-gold/10 px-4 py-2">
          <Tag className="h-3.5 w-3.5 text-omniv-gold" />
          <span className="text-xs font-medium text-omniv-text">
            {checked.size} selected
          </span>
          <Button
            size="sm"
            className="h-8"
            disabled={bulkBusy}
            onClick={() => void runBulk("mark_release")}
          >
            Tag as Release list
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={bulkBusy}
            onClick={() => void runBulk("clear_release")}
          >
            Clear Release tag
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={bulkBusy}
            onClick={() => void runBulk("set_would_attend", { wouldAttend: true })}
          >
            Mark would attend
          </Button>
          <select
            className="h-8 rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-xs"
            defaultValue=""
            disabled={bulkBusy}
            onChange={(e) => {
              const v = e.target.value;
              if (v) void runBulk("set_tier", { tier: v });
              e.target.value = "";
            }}
          >
            <option value="">Set tier…</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => setChecked(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      <div className="grid min-h-[320px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="border-b border-omniv-border lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap gap-2 border-b border-omniv-border p-3">
            <div className="relative min-w-[140px] flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-omniv-text-muted" />
              <Input
                className="pl-8"
                placeholder="Search email, city, tag…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="h-10 rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-xs"
            >
              <option value="all">All tiers</option>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="h-10 rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-xs"
            >
              <option value="all">All segments</option>
              <option value="release">Release list</option>
              <option value="would_attend">Would attend</option>
              <option value="super_release">Superfan or Release</option>
            </select>
            <button
              type="button"
              onClick={toggleAllFiltered}
              className="flex h-10 items-center gap-1 rounded-[var(--radius)] border border-omniv-border px-2 text-xs text-omniv-text-secondary hover:bg-white/[0.03]"
              title="Select all filtered"
            >
              {allFilteredChecked ? (
                <CheckSquare className="h-3.5 w-3.5 text-omniv-gold" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              All
            </button>
          </div>
          <ul className="max-h-[420px] overflow-y-auto">
            {loading && (
              <li className="px-4 py-8 text-center text-xs text-omniv-text-muted">
                Loading…
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-omniv-text-muted">
                No fans match. Share the gate or clear filters.
              </li>
            )}
            {filtered.map((f) => (
              <li key={f.id}>
                <div
                  className={cn(
                    "flex w-full items-center gap-2 border-b border-omniv-border/60 px-3 py-2.5 transition-colors",
                    selected?.id === f.id
                      ? "bg-omniv-gold/10"
                      : "hover:bg-white/[0.03]"
                  )}
                >
                  <button
                    type="button"
                    className="shrink-0 p-0.5"
                    onClick={() => toggleOne(f.id)}
                    aria-label="Select fan"
                  >
                    {checked.has(f.id) ? (
                      <CheckSquare className="h-4 w-4 text-omniv-gold" />
                    ) : (
                      <Square className="h-4 w-4 text-omniv-text-muted" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void openFan(f)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {f.first_name || f.email}
                        </p>
                        <p className="truncate text-[11px] text-omniv-text-muted">
                          {f.city || "—"}
                          {f.country_code ? `, ${f.country_code}` : ""}
                          {(f.tags || []).length > 0 && (
                            <span className="text-omniv-gold">
                              {" "}
                              · {(f.tags || []).slice(0, 3).join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <Badge
                          variant={
                            f.fan_tier === "Superfan"
                              ? "gold"
                              : f.fan_tier === "Core Fan"
                                ? "success"
                                : "outline"
                          }
                        >
                          {f.fan_tier || "Casual"}
                        </Badge>
                        {f.would_attend && (
                          <span className="text-[10px] text-omniv-gold">would attend</span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4">
          {!selected ? (
            <p className="py-16 text-center text-xs text-omniv-text-muted">
              Select a fan to edit profile, tags, and notes.
              <br />
              Use checkboxes + bulk bar for release lists.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold">
                    {selected.first_name || selected.email}
                  </h4>
                  <p className="text-sm text-omniv-text-secondary">
                    {selected.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setEditing((e) => !e)}
                >
                  {editing ? (
                    <>
                      <X className="h-3.5 w-3.5" /> Cancel
                    </>
                  ) : (
                    <>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </>
                  )}
                </Button>
              </div>

              {editing ? (
                <div className="space-y-3 rounded-lg border border-omniv-border bg-omniv-elevated/40 p-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                      First name
                    </label>
                    <Input
                      value={editForm.first_name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, first_name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                      City
                    </label>
                    <Input
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, city: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                      Tier
                    </label>
                    <select
                      value={editForm.fan_tier}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, fan_tier: e.target.value }))
                      }
                      className="mt-1 h-10 w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-sm"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                      Tags (comma-separated)
                    </label>
                    <Input
                      placeholder="release, vip, lagos"
                      value={editForm.tags}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, tags: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
                      Notes
                    </label>
                    <textarea
                      className="mt-1 min-h-[72px] w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, notes: e.target.value }))
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={editForm.would_attend}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          would_attend: e.target.checked,
                        }))
                      }
                    />
                    Would attend
                  </label>
                  <Button
                    className="w-full"
                    disabled={saveBusy}
                    onClick={() => void saveFan()}
                  >
                    {saveBusy ? "Saving…" : "Save fan"}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-omniv-text-muted">
                    {selected.city || "Location unknown"}
                    {selected.country_code ? ` · ${selected.country_code}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="gold">{selected.fan_tier}</Badge>
                    <Badge variant="outline">
                      Score {selected.engagement_score ?? 0}
                    </Badge>
                    {selected.would_attend && (
                      <Badge variant="success">Would attend</Badge>
                    )}
                    {(selected.tags || []).map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  {selected.notes && (
                    <p className="rounded-lg border border-omniv-border/60 bg-omniv-elevated/40 px-3 py-2 text-xs text-omniv-text-secondary">
                      {selected.notes}
                    </p>
                  )}
                </>
              )}

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                  Activity timeline
                </p>
                <ul className="mt-2 space-y-2">
                  {timeline.length === 0 && (
                    <li className="text-xs text-omniv-text-muted">
                      No interactions logged yet.
                    </li>
                  )}
                  {timeline.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-lg border border-omniv-border/60 bg-omniv-elevated/40 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-omniv-text">
                        {t.action_type}
                      </span>
                      <span className="ml-2 text-omniv-text-muted">
                        {new Date(t.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
