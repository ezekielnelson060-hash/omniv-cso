"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createCatalogueRelease,
  deleteCatalogueRelease,
  listCatalogueReleases,
  syncLocalCatalogueToCloud,
} from "@/lib/catalogue/db";
import type { CatalogueRelease, ReleaseStatus, ReleaseType } from "@/types";
import { Plus, Trash2, Loader2 } from "lucide-react";

export function CataloguePanel() {
  const [rows, setRows] = useState<CatalogueRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReleaseType>("single");
  const [status, setStatus] = useState<ReleaseStatus>("draft");
  const [spotify, setSpotify] = useState("");
  const [genre, setGenre] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const list = await listCatalogueReleases();
    setRows(list);
  }

  useEffect(() => {
    (async () => {
      await syncLocalCatalogueToCloud();
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await createCatalogueRelease({
        title,
        releaseType: type,
        status,
        spotifyUrl: spotify || undefined,
        primaryGenre: genre || undefined,
      });
      setTitle("");
      setSpotify("");
      setGenre("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
          Core
        </p>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          Catalogue
        </h1>
        <p className="mt-0.5 max-w-xl text-[11px] text-omniv-text-muted">
          Releases you own. Ziki and audits reference this list.
        </p>
      </div>

      <Card className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          Add release
        </p>
        <form onSubmit={onAdd} className="mt-2 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 sm:col-span-2"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReleaseType)}
            className="h-8 rounded-lg border border-omniv-border bg-omniv-card px-2 text-xs"
          >
            <option value="single">Single</option>
            <option value="ep">EP</option>
            <option value="album">Album</option>
            <option value="mixtape">Mixtape</option>
            <option value="live">Live</option>
            <option value="other">Other</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReleaseStatus)}
            className="h-8 rounded-lg border border-omniv-border bg-omniv-card px-2 text-xs"
          >
            <option value="idea">Idea</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="released">Released</option>
            <option value="archived">Archived</option>
          </select>
          <Input
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="h-8"
          />
          <Input
            placeholder="Spotify URL"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            className="h-8"
          />
          <Button
            type="submit"
            disabled={busy}
            size="sm"
            className="h-8 gap-1 sm:col-span-2 sm:w-auto"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add
          </Button>
        </form>
      </Card>

      <div className="overflow-hidden rounded-lg border border-omniv-border">
        {loading && (
          <p className="flex items-center gap-2 px-2.5 py-4 text-xs text-omniv-text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
          </p>
        )}
        {!loading && rows.length === 0 && (
          <p className="px-2.5 py-4 text-xs text-omniv-text-muted">
            Empty. Add the next release before you spend the window.
          </p>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-2 border-b border-omniv-border px-2.5 py-2 last:border-0 hover:bg-omniv-hover/40"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-[13px] font-medium">{r.title}</p>
                <Badge variant="outline" className="text-[9px]">
                  {r.releaseType}
                </Badge>
                <Badge variant="gold" className="text-[9px]">
                  {r.status}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-[10px] text-omniv-text-muted">
                {[r.primaryGenre, r.spotifyUrl].filter(Boolean).join(" · ") ||
                  "No links"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove"
              className="text-omniv-text-muted hover:text-rose-400"
              onClick={async () => {
                await deleteCatalogueRelease(r.id);
                await refresh();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
