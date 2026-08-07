"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  addRelease,
  loadReleases,
  removeRelease,
} from "@/lib/catalogue/store";
import type { CatalogueRelease, ReleaseStatus, ReleaseType } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export function CataloguePanel() {
  const [rows, setRows] = useState<CatalogueRelease[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReleaseType>("single");
  const [status, setStatus] = useState<ReleaseStatus>("draft");
  const [spotify, setSpotify] = useState("");
  const [genre, setGenre] = useState("");

  useEffect(() => {
    setRows(loadReleases());
  }, []);

  function refresh() {
    setRows(loadReleases());
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addRelease({
      title,
      releaseType: type,
      status,
      spotifyUrl: spotify || undefined,
      primaryGenre: genre || undefined,
    });
    setTitle("");
    setSpotify("");
    setGenre("");
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Catalogue</h1>
        <p className="mt-1 max-w-xl text-sm text-omniv-text-secondary">
          Your releases live here. Ziki, audits, and reports should reference
          this list — not a chat memory of what you might have dropped.
        </p>
      </div>

      <Card className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          Add release
        </p>
        <form onSubmit={onAdd} className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="sm:col-span-2"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReleaseType)}
            className="h-10 rounded-xl border border-omniv-border bg-omniv-card px-3 text-sm"
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
            className="h-10 rounded-xl border border-omniv-border bg-omniv-card px-3 text-sm"
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
          />
          <Input
            placeholder="Spotify URL"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
          />
          <Button type="submit" className="gap-1.5 sm:col-span-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Add to catalogue
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-omniv-text-muted">
            Empty catalogue. Add the next release before you spend the window.
          </p>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-omniv-border bg-omniv-card p-4"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{r.title}</p>
                <Badge variant="outline">{r.releaseType}</Badge>
                <Badge variant="gold">{r.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-omniv-text-muted">
                {[r.primaryGenre, r.spotifyUrl].filter(Boolean).join(" · ") ||
                  "No links yet"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove"
              className="text-omniv-text-muted hover:text-rose-400"
              onClick={() => {
                removeRelease(r.id);
                refresh();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
