"use client";

import { useEffect, useState, type ChangeEvent } from "react";
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
import {
  addCatalogueTrack,
  listCatalogueTracks,
  passportToAnalysis,
} from "@/lib/catalogue/tracks";
import { analyzeAudioFile } from "@/lib/audio-passport";
import type {
  CatalogueRelease,
  CatalogueTrack,
  ReleaseStatus,
  ReleaseType,
} from "@/types";
import { Plus, Trash2, Loader2, Upload, Music2 } from "lucide-react";

export function CataloguePanel() {
  const [rows, setRows] = useState<CatalogueRelease[]>([]);
  const [tracks, setTracks] = useState<CatalogueTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReleaseType>("single");
  const [status, setStatus] = useState<ReleaseStatus>("draft");
  const [spotify, setSpotify] = useState("");
  const [genre, setGenre] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  async function refresh() {
    const [list, tr] = await Promise.all([
      listCatalogueReleases(),
      listCatalogueTracks(),
    ]);
    setRows(list);
    setTracks(tr);
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

  async function onAudio(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 40 * 1024 * 1024) {
      setUploadMsg("Max 40MB per file");
      return;
    }
    setUploading(true);
    setUploadMsg("Analysing audio…");
    try {
      const passport = await analyzeAudioFile(file);
      const analysis = passport ? passportToAnalysis(passport) : null;
      await addCatalogueTrack({
        title: file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "Untitled",
        durationSec: analysis?.durationSec ?? null,
        analysis,
        notes: "Uploaded from Catalogue",
      });
      setUploadMsg(
        passport
          ? `Saved · ${passport.bpm ? `~${passport.bpm} BPM` : "BPM n/a"} · ${passport.energy}`
          : "Saved (analysis soft)"
      );
      await refresh();
    } catch {
      setUploadMsg("Could not analyse — try mp3/wav under 40MB");
    } finally {
      setUploading(false);
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
          Releases + audio. Uploads feed Ziki, Opportunities, and release
          decisions — not a dead file dump.
        </p>
      </div>

      <Card className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
          Upload song for AI
        </p>
        <p className="mt-1 text-[11px] text-omniv-text-muted">
          Omniv analyses BPM, energy, duration on-device, stores the passport,
          and ranks moves off it. Attach the same file in Ziki for a full listen.
        </p>
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-omniv-gold/40 bg-omniv-gold/5 px-3 py-4 text-xs text-omniv-gold hover:bg-omniv-gold/10">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Analysing…" : "Choose mp3 / wav / m4a"}
          <input
            type="file"
            className="hidden"
            accept="audio/*,.mp3,.wav,.m4a,.flac,.aac,.ogg"
            disabled={uploading}
            onChange={(e) => void onAudio(e)}
          />
        </label>
        {uploadMsg && (
          <p className="mt-1.5 text-[10px] text-omniv-text-muted">{uploadMsg}</p>
        )}
      </Card>

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

      {tracks.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-omniv-border">
          <p className="border-b border-omniv-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-omniv-text-muted">
            Audio in brain ({tracks.length})
          </p>
          {tracks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 border-b border-omniv-border px-2.5 py-2 last:border-0"
            >
              <Music2 className="h-3.5 w-3.5 shrink-0 text-omniv-gold" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{t.title}</p>
                <p className="text-[10px] text-omniv-text-muted">
                  {[
                    t.analysis?.bpm ? `~${t.analysis.bpm} BPM` : null,
                    t.analysis?.energy,
                    t.durationSec ? `${Math.round(t.durationSec)}s` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Passport pending"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
