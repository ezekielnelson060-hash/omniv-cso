"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { recordSignal } from "@/lib/discovery/signals";

type Chapter = { time: string; label: string };

type Props = {
  title: string;
  publisher: string;
  publisherHref?: string;
  mediaUrl?: string | null;
  coverUrl?: string | null;
  durationLabel?: string | null;
  about?: string | null;
  chapters?: Chapter[];
  tags?: string[];
  /** For analytics — publication slug when available */
  publicationSlug?: string;
};

export function VideoWatch({
  title,
  publisher,
  publisherHref,
  mediaUrl,
  coverUrl,
  durationLabel,
  about,
  chapters = [],
  tags = [],
  publicationSlug,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const playedOnce = useRef(false);
  const progressMarks = useRef<Set<number>>(new Set());

  const isYoutube =
    mediaUrl &&
    (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be"));
  const isVimeo = mediaUrl && mediaUrl.includes("vimeo.com");
  const isEmbed = Boolean(isYoutube || isVimeo);
  const hasFile = Boolean(mediaUrl && !isEmbed);

  const firePlay = useCallback(() => {
    if (playedOnce.current) return;
    playedOnce.current = true;
    const path =
      typeof window !== "undefined" ? window.location.pathname : undefined;
    track(
      "video_play",
      {
        publication_slug: publicationSlug || null,
        title: title.slice(0, 80),
        source: isEmbed ? (isYoutube ? "youtube" : "vimeo") : "file",
      },
      path
    );
    if (publicationSlug) {
      recordSignal("open", tags, undefined, { publicationSlug });
    }
  }, [publicationSlug, title, isEmbed, isYoutube, tags]);

  const onTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration || !Number.isFinite(el.duration)) return;
    const pct = Math.floor((el.currentTime / el.duration) * 100);
    for (const mark of [25, 50, 75, 90]) {
      if (pct >= mark && !progressMarks.current.has(mark)) {
        progressMarks.current.add(mark);
        track(
          "video_progress",
          {
            publication_slug: publicationSlug || null,
            percent: mark,
          },
          typeof window !== "undefined" ? window.location.pathname : undefined
        );
        if (mark >= 90 && publicationSlug) {
          recordSignal("complete", tags, undefined, { publicationSlug });
          track(
            "video_complete",
            { publication_slug: publicationSlug },
            typeof window !== "undefined" ? window.location.pathname : undefined
          );
        }
      }
    }
  }, [publicationSlug, tags]);

  return (
    <div className="mb-10 space-y-6">
      <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/[0.08]">
        {hasFile ? (
          <div className="relative">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              controls
              playsInline
              poster={coverUrl || undefined}
              className="aspect-video w-full bg-black"
              src={mediaUrl!}
              preload="metadata"
              crossOrigin="anonymous"
              onPlay={firePlay}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={() => {
                setReady(true);
                setError(null);
              }}
              onCanPlay={() => setReady(true)}
              onError={() => {
                setReady(false);
                setError(
                  "Could not load this video. The file may be missing, private, or in an unsupported format (use MP4/H.264 or WebM)."
                );
                track(
                  "video_error",
                  {
                    publication_slug: publicationSlug || null,
                    media: (mediaUrl || "").slice(0, 120),
                  },
                  typeof window !== "undefined"
                    ? window.location.pathname
                    : undefined
                );
              }}
            />
            {error && (
              <div className="absolute inset-x-0 bottom-0 bg-black/80 px-4 py-3">
                <p className="text-[12px] text-rose-300">{error}</p>
                {mediaUrl && (
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[12px] font-medium text-omniv-gold hover:underline"
                  >
                    Open file in new tab
                  </a>
                )}
              </div>
            )}
            {!ready && !error && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-omniv-gold" />
              </div>
            )}
          </div>
        ) : isYoutube && mediaUrl ? (
          <div className="aspect-video w-full" onClick={firePlay}>
            <iframe
              title={title}
              src={youtubeEmbed(mediaUrl)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={firePlay}
            />
          </div>
        ) : isVimeo && mediaUrl ? (
          <div className="aspect-video w-full" onClick={firePlay}>
            <iframe
              title={title}
              src={vimeoEmbed(mediaUrl)}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={firePlay}
            />
          </div>
        ) : (
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-rose-900 to-black">
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
            )}
            <p className="relative px-6 text-center text-[14px] text-zinc-300">
              No playable video attached yet. Edit this publication to upload an
              MP4/WebM file or add a YouTube link.
            </p>
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
          Video
        </p>
        <h2 className="mt-1 text-[22px] font-semibold text-white sm:text-[26px]">
          {title}
        </h2>
        <p className="mt-1 text-[14px] text-zinc-400">
          {publisherHref ? (
            <Link href={publisherHref} className="hover:text-omniv-gold">
              {publisher}
            </Link>
          ) : (
            publisher
          )}
          {durationLabel ? ` · ${durationLabel}` : ""}
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {about && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            About
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{about}</p>
        </div>
      )}

      {chapters.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Chapters
          </p>
          <ul className="mt-3 space-y-1.5">
            {chapters.map((c) => (
              <li key={c.time + c.label}>
                <button
                  type="button"
                  className="flex w-full gap-3 rounded-lg px-2 py-1.5 text-left text-[13px] text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                  onClick={() => {
                    const el = videoRef.current;
                    if (!el || !hasFile) return;
                    const secs = parseChapterTime(c.time);
                    if (secs != null) {
                      el.currentTime = secs;
                      void el.play();
                    }
                  }}
                >
                  <span className="w-12 shrink-0 tabular-nums text-omniv-gold">
                    {c.time}
                  </span>
                  <span>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function parseChapterTime(t: string): number | null {
  const parts = t.trim().split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

function youtubeEmbed(url: string): string {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    const u = new URL(url);
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

function vimeoEmbed(url: string): string {
  try {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : url;
  } catch {
    return url;
  }
}
