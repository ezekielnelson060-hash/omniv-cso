"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioPassport } from "@/lib/audio-passport";

type Props = {
  /** Object URL or data URL for the audio */
  url: string;
  name: string;
  passport?: AudioPassport | null;
  analyzing?: boolean;
  onRemove?: () => void;
  className?: string;
};

/**
 * Gold-on-black waveform player for Ziki attach strip.
 * Wavesurfer is loaded only on the client to avoid SSR issues.
 */
export function TrackWaveform({
  url,
  name,
  passport,
  analyzing,
  onRemove,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<{
    play: () => void;
    pause: () => void;
    destroy: () => void;
    on: (e: string, cb: () => void) => void;
    isPlaying: () => boolean;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el || !url) return;

    setReady(false);
    setError(false);
    setPlaying(false);

    (async () => {
      try {
        const WaveSurfer = (await import("wavesurfer.js")).default;
        if (cancelled || !containerRef.current) return;

        const ws = WaveSurfer.create({
          container: containerRef.current,
          url,
          height: 48,
          waveColor: "rgba(201, 169, 98, 0.35)",
          progressColor: "#C9A962",
          cursorColor: "#E8D5A3",
          cursorWidth: 1,
          barWidth: 2,
          barGap: 1,
          barRadius: 1,
          normalize: true,
          interact: true,
        });

        wsRef.current = ws as unknown as typeof wsRef.current;

        ws.on("ready", () => {
          if (!cancelled) setReady(true);
        });
        ws.on("play", () => {
          if (!cancelled) setPlaying(true);
        });
        ws.on("pause", () => {
          if (!cancelled) setPlaying(false);
        });
        ws.on("finish", () => {
          if (!cancelled) setPlaying(false);
        });
        ws.on("error", () => {
          if (!cancelled) setError(true);
        });
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
      try {
        wsRef.current?.destroy();
      } catch {
        /* noop */
      }
      wsRef.current = null;
    };
  }, [url]);

  function toggle() {
    const ws = wsRef.current;
    if (!ws) return;
    if (ws.isPlaying()) ws.pause();
    else ws.play();
  }

  const meta =
    analyzing
      ? "Analysing…"
      : passport?.bpm
        ? `${passport.bpm} BPM · ${passport.durationSec}s · ${passport.energy}`
        : passport
          ? `${passport.durationSec}s · ${passport.energy}`
          : name;

  return (
    <div
      className={cn(
        "rounded-xl border border-omniv-gold/25 bg-omniv-card/80 p-2.5",
        className
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready || error}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 text-omniv-gold transition hover:bg-omniv-gold/25 disabled:opacity-40"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-px" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-omniv-text">
            {name}
          </p>
          <p className="truncate text-[10px] text-omniv-text-muted">{meta}</p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-omniv-text-muted hover:text-omniv-gold"
            aria-label="Remove"
          >
            ×
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        className={cn(
          "w-full overflow-hidden rounded-lg bg-black/40",
          error && "flex h-12 items-center justify-center"
        )}
      >
        {error && (
          <span className="text-[10px] text-omniv-text-muted">
            Waveform unavailable — file still attached for Ziki
          </span>
        )}
      </div>
    </div>
  );
}
