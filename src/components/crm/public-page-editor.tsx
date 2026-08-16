"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  mergePublicPage,
  type ArtistPublicPage,
  type ArtistPageLink,
} from "@/lib/artist-public-page";
import { Loader2, Plus, Trash2 } from "lucide-react";

/**
 * Full artist/release page editor — song, Substack-style messages,
 * capture copy, Linktree links, tip toggle.
 */
export function PublicPageEditor({
  slug,
  onSaved,
}: {
  slug?: string | null;
  onSaved?: () => void;
}) {
  const [artistId, setArtistId] = useState<string | null>(null);
  const [stageName, setStageName] = useState("");
  const [page, setPage] = useState<ArtistPublicPage>(mergePublicPage({}));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const resolveArtist = useCallback(async () => {
    if (!slug || !isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("roster_artists")
      .select("id, stage_name")
      .eq("slug", slug)
      .maybeSingle();
    if (data) {
      setArtistId(data.id);
      setStageName(String(data.stage_name || ""));
    }
  }, [slug]);

  const loadPage = useCallback(async (id: string) => {
    const res = await fetch(
      `/api/roster/public-page?artistId=${encodeURIComponent(id)}`
    );
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not load page");
      return;
    }
    setPage(mergePublicPage(data.page));
    if (data.stageName) setStageName(data.stageName);
  }, []);

  useEffect(() => {
    void resolveArtist();
  }, [resolveArtist]);

  useEffect(() => {
    if (artistId) void loadPage(artistId);
  }, [artistId, loadPage]);

  if (!slug) return null;

  async function save() {
    if (!artistId) {
      setErr("Artist not found for this slug");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      // Save stage name + legacy taglines for compatibility
      await fetch("/api/roster", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stageName: stageName.trim() || undefined,
          gateTagline: page.messageTop?.trim() || null,
          tipTagline: page.messageBottom?.trim() || null,
        }),
      });

      const res = await fetch("/api/roster/public-page", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId, page }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Could not save page");
        return;
      }
      setPage(mergePublicPage(data.page));
      setMsg("Saved — live on your bio link (/f/…).");
      onSaved?.();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  function setLink(i: number, patch: Partial<ArtistPageLink>) {
    const links = [...(page.links || [])];
    links[i] = { ...links[i], ...patch };
    setPage({ ...page, links });
  }

  return (
    <Card className="border-omniv-border p-4">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <p className="text-[13px] font-semibold">Artist page (bio link)</p>
        <p className="mt-0.5 text-[12px] text-omniv-text-secondary">
          Song, story, list, links, tips — one page. {open ? "Hide" : "Edit"}
        </p>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-[11px] text-omniv-text-muted">
              Display name
            </label>
            <Input
              className="mt-1 h-10"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] text-omniv-text-muted">
              Message top
            </label>
            <textarea
              className="mt-1 min-h-[64px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
              value={page.messageTop || ""}
              onChange={(e) => setPage({ ...page, messageTop: e.target.value })}
              placeholder="Why this drop…"
            />
          </div>

          <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            Release / song
          </p>
          <Input
            label="Track title"
            value={page.track?.title || ""}
            onChange={(e) =>
              setPage({
                ...page,
                track: { ...page.track, title: e.target.value },
              })
            }
          />
          <Input
            label="Spotify URL"
            placeholder="https://open.spotify.com/track/…"
            value={page.track?.spotifyUrl || ""}
            onChange={(e) =>
              setPage({
                ...page,
                track: { ...page.track, spotifyUrl: e.target.value },
              })
            }
          />
          <Input
            label="Apple Music URL"
            value={page.track?.appleUrl || ""}
            onChange={(e) =>
              setPage({
                ...page,
                track: { ...page.track, appleUrl: e.target.value },
              })
            }
          />
          <Input
            label="Download URL"
            value={page.track?.downloadUrl || ""}
            onChange={(e) =>
              setPage({
                ...page,
                track: { ...page.track, downloadUrl: e.target.value },
              })
            }
          />

          <div>
            <label className="text-[11px] text-omniv-text-muted">
              Message middle
            </label>
            <textarea
              className="mt-1 min-h-[56px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
              value={page.messageMiddle || ""}
              onChange={(e) =>
                setPage({ ...page, messageMiddle: e.target.value })
              }
            />
          </div>

          <Input
            label="List headline"
            value={page.captureHeadline || ""}
            onChange={(e) =>
              setPage({ ...page, captureHeadline: e.target.value })
            }
          />
          <Input
            label="After join message"
            value={page.captureReward || ""}
            onChange={(e) =>
              setPage({ ...page, captureReward: e.target.value })
            }
          />

          <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            Links
          </p>
          {(page.links || []).map((l, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Label"
                value={l.label}
                onChange={(e) => setLink(i, { label: e.target.value })}
                className="w-28"
              />
              <Input
                placeholder="https://"
                value={l.url}
                onChange={(e) => setLink(i, { url: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setPage({
                    ...page,
                    links: (page.links || []).filter((_, idx) => idx !== i),
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() =>
              setPage({
                ...page,
                links: [
                  ...(page.links || []),
                  { label: "Link", url: "https://" },
                ],
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add link
          </Button>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={page.tipEnabled !== false}
              onChange={(e) =>
                setPage({ ...page, tipEnabled: e.target.checked })
              }
            />
            Show tip module
          </label>

          <div>
            <label className="text-[11px] text-omniv-text-muted">
              Message bottom
            </label>
            <textarea
              className="mt-1 min-h-[56px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
              value={page.messageBottom || ""}
              onChange={(e) =>
                setPage({ ...page, messageBottom: e.target.value })
              }
            />
          </div>

          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save artist page
          </Button>
          {msg && <p className="text-[12px] text-emerald-400">{msg}</p>}
          {err && <p className="text-[12px] text-omniv-danger">{err}</p>}
        </div>
      )}
    </Card>
  );
}
