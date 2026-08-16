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

export function PublicPageEditor({
  slug,
  onSaved,
}: {
  slug?: string | null;
  onSaved?: () => void;
}) {
  const [stageName, setStageName] = useState("");
  const [page, setPage] = useState<ArtistPublicPage>(mergePublicPage({}));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [resolvedSlug, setResolvedSlug] = useState(slug || "");

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    // Prefer API so we always see what the server has
    try {
      const res = await fetch("/api/roster");
      if (res.ok) {
        const data = (await res.json()) as {
          artists?: {
            slug?: string;
            stage_name?: string;
            public_page?: unknown;
          }[];
        };
        const list = data.artists || [];
        const match =
          list.find((a) => a.slug === slug) || list[0];
        if (match) {
          setStageName(String(match.stage_name || ""));
          setResolvedSlug(String(match.slug || slug || ""));
          setPage(mergePublicPage(match.public_page));
          return;
        }
      }
    } catch {
      /* fall through */
    }

    if (!slug) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug, public_page")
      .eq("slug", slug)
      .maybeSingle();
    if (data) {
      setStageName(String(data.stage_name || ""));
      setResolvedSlug(String(data.slug || slug));
      setPage(mergePublicPage(data.public_page));
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!slug && !resolvedSlug) return null;

  async function save() {
    const s = resolvedSlug || slug;
    if (!s) {
      setErr("No artist slug");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/roster", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: s,
          stageName: stageName.trim() || undefined,
          gateTagline: page.messageTop?.trim() || null,
          tipTagline: page.messageBottom?.trim() || null,
          publicPage: page,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Could not save");
        return;
      }
      if (data.page) setPage(mergePublicPage(data.page));

      const top = data.savedMessageTop || "";
      const track = data.savedTrackTitle || "";
      const spotify = data.savedSpotify || "";

      if (!top && !track && !spotify && !page.messageTop && !page.track?.title) {
        setMsg(
          `Saved shell. Add a message top or Spotify URL, then save again. Preview: /f/${s}`
        );
      } else {
        setMsg(
          `Saved to DB. Top: "${top || "(empty)"}" · Track: "${track || "(empty)"}". Open /f/${s} now.`
        );
      }
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

  const previewSlug = resolvedSlug || slug;

  return (
    <Card className="border-omniv-gold/30 bg-omniv-gold/5 p-4">
      <p className="text-[13px] font-semibold text-omniv-gold">
        Artist page editor
      </p>
      <p className="mt-0.5 text-[12px] text-omniv-text-secondary">
        Controls{" "}
        <a
          href={`/f/${previewSlug}`}
          target="_blank"
          rel="noreferrer"
          className="font-data text-omniv-gold underline"
        >
          /f/{previewSlug}
        </a>
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-[11px] text-omniv-text-muted">Display name</label>
          <Input
            className="mt-1 h-10"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[11px] text-omniv-text-muted">Message top</label>
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
          <label className="text-[11px] text-omniv-text-muted">Message middle</label>
          <textarea
            className="mt-1 min-h-[56px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
            value={page.messageMiddle || ""}
            onChange={(e) => setPage({ ...page, messageMiddle: e.target.value })}
          />
        </div>

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
              links: [...(page.links || []), { label: "Link", url: "https://" }],
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
            onChange={(e) => setPage({ ...page, tipEnabled: e.target.checked })}
          />
          Show tip module
        </label>

        <div>
          <label className="text-[11px] text-omniv-text-muted">Message bottom</label>
          <textarea
            className="mt-1 min-h-[56px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
            value={page.messageBottom || ""}
            onChange={(e) => setPage({ ...page, messageBottom: e.target.value })}
          />
        </div>

        <Button
          type="button"
          className="h-10 w-full gap-1.5"
          disabled={busy}
          onClick={() => void save()}
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save artist page
        </Button>
        {msg && <p className="text-[12px] text-emerald-600 whitespace-pre-wrap">{msg}</p>}
        {err && <p className="text-[12px] text-omniv-danger">{err}</p>}
      </div>
    </Card>
  );
}
