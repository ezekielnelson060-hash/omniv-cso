"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Trash2,
  Loader2,
  Upload,
  Music2,
  Megaphone,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  idea: "bg-white/5 text-omniv-text-muted",
  draft: "bg-amber-500/15 text-amber-400",
  scheduled: "bg-sky-500/15 text-sky-400",
  released: "bg-emerald-500/15 text-emerald-400",
  archived: "bg-white/5 text-omniv-text-muted",
  processing: "bg-violet-500/15 text-violet-300",
};

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
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<"all" | "releases" | "audio">("all");

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
      const hasSpotify = Boolean((spotify || "").trim());
      await createCatalogueRelease({
        title,
        releaseType: type,
        status,
        spotifyUrl: spotify || undefined,
        primaryGenre: genre || undefined,
      });
      try {
        const { track } = await import("@/lib/analytics");
        track("catalogue_release_add", {
          release_type: type,
          status,
          has_spotify: hasSpotify,
        });
      } catch {
        /* soft */
      }
      if (hasSpotify) {
        try {
          void fetch("/api/platform-metrics/refresh", { method: "POST" });
        } catch {
          /* soft */
        }
      }
      setTitle("");
      setSpotify("");
      setGenre("");
      setShowAdd(false);
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
      const t =
        file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "Untitled";
      await addCatalogueTrack({
        title: t,
        durationSec: analysis?.durationSec ?? null,
        analysis,
        notes: "Uploaded from Catalogue",
      });
      try {
        const { track } = await import("@/lib/analytics");
        track("catalogue_upload", {
          has_passport: Boolean(passport),
          bpm: passport?.bpm ?? null,
          energy: passport?.energy ?? null,
        });
      } catch {
        /* soft */
      }
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

  const showReleases = tab === "all" || tab === "releases";
  const showAudio = tab === "all" || tab === "audio";

  return (
    <div className="space-y-4">
      <div className="relative -mx-3 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/15 via-omniv-gold/8 to-transparent" />
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative px-3 pb-4 pt-1 sm:px-4 md:px-5 md:pt-4">
          <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
            Music
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            My Music
          </h1>
          <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
            Releases and analysed audio that feed Ziki, Moves, and DSP refresh —
            not a dead file dump.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-omniv-gold/40 bg-omniv-gold/10 px-4 text-[12px] font-medium text-omniv-gold transition hover:bg-omniv-gold/20">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Analysing…" : "Upload song"}
              <input
                type="file"
                className="hidden"
                accept="audio/*,.mp3,.wav,.m4a,.flac,.aac,.ogg"
                disabled={uploading}
                onChange={(e) => void onAudio(e)}
              />
            </label>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-1.5 rounded-xl px-4"
              onClick={() => setShowAdd((v) => !v)}
            >
              <Plus className="h-4 w-4" />
              Add release
            </Button>
          </div>
          {uploadMsg && (
            <p className="mt-2 text-[11px] text-omniv-text-muted">{uploadMsg}</p>
          )}
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={onAdd}
          className="grid gap-2 rounded-2xl border border-omniv-border bg-omniv-card p-4 sm:grid-cols-2"
        >
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 sm:col-span-2"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReleaseType)}
            className="h-10 rounded-xl border border-omniv-border bg-omniv-elevated px-3 text-sm"
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
            className="h-10 rounded-xl border border-omniv-border bg-omniv-elevated px-3 text-sm"
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
            className="h-10"
          />
          <Input
            placeholder="Spotify URL"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            className="h-10"
          />
          <div className="flex gap-2 sm:col-span-2">
            <Button
              type="submit"
              disabled={busy}
              className="h-10 flex-1 gap-1 rounded-xl sm:flex-none"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Save release
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="flex gap-1.5">
        {(
          [
            ["all", `All (${rows.length + tracks.length})`],
            ["releases", `Releases (${rows.length})`],
            ["audio", `Audio (${tracks.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
              tab === id
                ? "border-omniv-gold/50 bg-omniv-gold/15 text-omniv-gold"
                : "border-omniv-border text-omniv-text-muted hover:text-omniv-text"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="flex items-center gap-2 py-8 text-xs text-omniv-text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" /> Loading…
        </p>
      )}

      {!loading && showReleases && (
        <div className="space-y-2.5">
          {rows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-omniv-border px-4 py-8 text-center text-[12px] text-omniv-text-muted">
              No releases yet. Add the next one before you spend the window.
            </p>
          )}
          {rows.map((r) => (
            <div
              key={r.id}
              className="overflow-hidden rounded-2xl border border-omniv-border bg-omniv-card transition hover:border-omniv-gold/20"
            >
              <div className="flex gap-3 p-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-omniv-gold/20 to-omniv-gold/5">
                  <Music2 className="h-6 w-6 text-omniv-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-semibold tracking-tight">
                      {r.title}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        STATUS_TONE[r.status] || STATUS_TONE.draft
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-omniv-text-muted">
                    {[r.releaseType, r.primaryGenre]
                      .filter(Boolean)
                      .join(" · ") || "Release"}
                    {r.spotifyUrl ? " · DSP linked" : ""}
                  </p>
                </div>
              </div>
              <div className="flex border-t border-omniv-border">
                <Link
                  href="/opportunities"
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium text-omniv-text-secondary transition hover:bg-white/[0.03] hover:text-omniv-gold"
                >
                  <Megaphone className="h-3.5 w-3.5" />
                  Promote
                </Link>
                <div className="w-px bg-omniv-border" />
                <Link
                  href={r.spotifyUrl ? "/settings" : "/release-simulator"}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium text-omniv-text-secondary transition hover:bg-white/[0.03] hover:text-omniv-gold"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Manage
                </Link>
                <div className="w-px bg-omniv-border" />
                <button
                  type="button"
                  aria-label="Remove"
                  className="flex items-center justify-center px-3.5 text-omniv-text-muted transition hover:bg-rose-500/10 hover:text-rose-400"
                  onClick={async () => {
                    await deleteCatalogueRelease(r.id);
                    await refresh();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && showAudio && tracks.length > 0 && (
        <div className="space-y-2.5">
          {tab === "all" && rows.length > 0 && (
            <p className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-text-muted">
              Analysed audio
            </p>
          )}
          {tracks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-omniv-border bg-omniv-card p-3.5 transition hover:border-omniv-gold/20"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/10">
                <Music2 className="h-5 w-5 text-omniv-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{t.title}</p>
                <p className="mt-0.5 text-[11px] text-omniv-text-muted">
                  {[
                    t.analysis?.bpm ? `~${t.analysis.bpm} BPM` : null,
                    t.analysis?.energy,
                    t.durationSec ? `${Math.round(t.durationSec)}s` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Passport pending"}
                </p>
              </div>
              <Link
                href="/ziki"
                className="flex h-9 items-center gap-1 rounded-xl border border-omniv-border px-3 text-[11px] font-medium text-omniv-text-secondary hover:border-omniv-gold/30 hover:text-omniv-gold"
              >
                Ziki
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {!loading && showAudio && tracks.length === 0 && tab === "audio" && (
        <p className="rounded-2xl border border-dashed border-omniv-border px-4 py-8 text-center text-[12px] text-omniv-text-muted">
          No analysed audio yet. Upload a song to build a passport.
        </p>
      )}
    </div>
  );
}
