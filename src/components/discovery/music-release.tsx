"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SaveButton } from "@/components/discovery/save-button";
import { ShareButton } from "@/components/discovery/share-button";

type ExploreLink = {
  label: string;
  href: string;
  kind?: string;
};

type Props = {
  title: string;
  artist: string;
  artistHref?: string;
  coverUrl?: string | null;
  mediaUrl?: string | null;
  genre?: string | null;
  releaseDate?: string | null;
  slug: string;
  path: string;
  about?: string | null;
  explore?: ExploreLink[];
};

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicRelease({
  title,
  artist,
  artistHref,
  coverUrl,
  mediaUrl,
  genre,
  releaseDate,
  slug,
  path,
  about,
  explore = [],
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [mediaUrl]);

  function toggle() {
    const el = audioRef.current;
    if (!el || !mediaUrl) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = audioRef.current;
    if (!el) return;
    const v = Number(e.target.value);
    el.currentTime = v;
    setProgress(v);
  }

  return (
    <div className="mb-10 space-y-6">
      <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08]">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="relative mx-auto h-44 w-44 shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:mx-0">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-700 to-purple-950 text-4xl text-white/80">
                ♪
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
              Release
            </p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-white sm:text-[26px]">
              {title}
            </h2>
            <p className="mt-1 text-[14px] text-zinc-400">
              {artistHref ? (
                <Link href={artistHref} className="hover:text-omniv-gold">
                  {artist}
                </Link>
              ) : (
                artist
              )}
              {genre ? ` · ${genre}` : ""}
              {releaseDate
                ? ` · ${new Date(releaseDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}`
                : ""}
            </p>

            {mediaUrl && (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio ref={audioRef} src={mediaUrl} preload="metadata" />
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggle}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold text-black transition hover:brightness-110"
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 1}
                      step={0.1}
                      value={progress}
                      onChange={seek}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-omniv-gold"
                    />
                    <div className="mt-1 flex justify-between text-[11px] tabular-nums text-zinc-500">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!mediaUrl && (
              <p className="mt-4 text-[13px] text-zinc-500">
                Audio not attached yet — the release still works as a discovery
                page.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <SaveButton
                kind="publication"
                slug={slug}
                type="music"
                name={title}
                pubType="music"
              />
              <ShareButton title={title} path={path} />
            </div>
          </div>
        </div>
      </div>

      {about && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            About this release
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{about}</p>
        </div>
      )}

      {explore.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Explore this release
          </p>
          <ul className="mt-3 space-y-2">
            {explore.map((item) => (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06] transition hover:ring-white/15"
                >
                  <span className="text-[14px] text-white">{item.label}</span>
                  <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                    {item.kind || "Open"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
