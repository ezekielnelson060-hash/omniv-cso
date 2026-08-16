"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  mergePublicPage,
  type ArtistPublicPage,
  type ArtistPageLink,
} from "@/lib/artist-public-page";
import { LayoutTemplate, Loader2, Plus, Trash2 } from "lucide-react";

export function ArtistPageEditor() {
  const [artists, setArtists] = useState<{ id: string; stage_name: string; slug: string }[]>([]);
  const [artistId, setArtistId] = useState("");
  const [page, setPage] = useState<ArtistPublicPage>(mergePublicPage({}));
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadArtists = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug")
      .order("stage_name");
    const list = data || [];
    setArtists(list);
    if (list[0] && !artistId) setArtistId(list[0].id);
    setLoading(false);
  }, [artistId]);

  const loadPage = useCallback(async (id: string) => {
    if (!id) return;
    setErr(null);
    const res = await fetch(`/api/roster/public-page?artistId=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Could not load page");
      return;
    }
    setPage(mergePublicPage(data.page));
    setSlug(data.slug || "");
  }, []);

  useEffect(() => {
    void loadArtists();
  }, [loadArtists]);

  useEffect(() => {
    if (artistId) void loadPage(artistId);
  }, [artistId, loadPage]);

  async function save() {
    if (!artistId) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/roster/public-page", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistId, page }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setErr(data.error || "Save failed");
      return;
    }
    setMsg("Artist page saved — live on your Fan Gate link");
    setPage(mergePublicPage(data.page));
  }

  function setLink(i: number, patch: Partial<ArtistPageLink>) {
    const links = [...(page.links || [])];
    links[i] = { ...links[i], ...patch };
    setPage({ ...page, links });
  }

  function addLink() {
    setPage({
      ...page,
      links: [...(page.links || []), { label: "Link", url: "https://" }],
    });
  }

  function removeLink(i: number) {
    setPage({
      ...page,
      links: (page.links || []).filter((_, idx) => idx !== i),
    });
  }

  if (loading) {
    return (
      <Card className="p-4">
        <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
      </Card>
    );
  }

  if (artists.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-xs text-omniv-text-muted">
          Add a roster artist first to edit the public page.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Artist page (bio link)</h3>
        </div>
        <select
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
          className="h-9 rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-2 text-xs"
        >
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.stage_name}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-4 text-[12px] text-omniv-text-secondary">
        One link for song, story, list, links, and tips — replaces Linktree.{" "}
        {slug && (
          <a
            href={`/f/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-omniv-gold hover:underline"
          >
            Preview /f/{slug}
          </a>
        )}
      </p>

      <div className="space-y-3">
        <Field label="Message top">
          <textarea
            className="min-h-[64px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
            value={page.messageTop || ""}
            onChange={(e) => setPage({ ...page, messageTop: e.target.value })}
            placeholder="Why this drop / what you're building…"
          />
        </Field>

        <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
          Release / song
        </p>
        <Input
          label="Track title"
          value={page.track?.title || ""}
          onChange={(e) =>
            setPage({ ...page, track: { ...page.track, title: e.target.value } })
          }
        />
        <Input
          label="Subtitle"
          value={page.track?.subtitle || ""}
          onChange={(e) =>
            setPage({
              ...page,
              track: { ...page.track, subtitle: e.target.value },
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
          label="Download URL (file or Dropbox)"
          value={page.track?.downloadUrl || ""}
          onChange={(e) =>
            setPage({
              ...page,
              track: { ...page.track, downloadUrl: e.target.value },
            })
          }
        />

        <Field label="Message middle">
          <textarea
            className="min-h-[56px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
            value={page.messageMiddle || ""}
            onChange={(e) => setPage({ ...page, messageMiddle: e.target.value })}
            placeholder="Story, credits, thank you…"
          />
        </Field>

        <Input
          label="List headline"
          value={page.captureHeadline || ""}
          onChange={(e) => setPage({ ...page, captureHeadline: e.target.value })}
        />
        <Input
          label="After join message"
          value={page.captureReward || ""}
          onChange={(e) => setPage({ ...page, captureReward: e.target.value })}
        />

        <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
          Links (Linktree layer)
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
              onClick={() => removeLink(i)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addLink}>
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

        <Field label="Message bottom">
          <textarea
            className="min-h-[56px] w-full rounded-xl border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm"
            value={page.messageBottom || ""}
            onChange={(e) => setPage({ ...page, messageBottom: e.target.value })}
            placeholder="Closing line / tip nudge…"
          />
        </Field>

        <Button disabled={saving} onClick={() => void save()} className="w-full sm:w-auto">
          {saving ? "Saving…" : "Save artist page"}
        </Button>
        {msg && <p className="text-xs text-omniv-gold">{msg}</p>}
        {err && <p className="text-xs text-omniv-danger">{err}</p>}
      </div>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
