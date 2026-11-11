"use client";

import { useRef, useState } from "react";

const MAX_PHOTOS = 10;

export function GalleryUpload({
  value,
  onChange,
  label = "Add photos",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr(null);
    setBusy(true);
    const next = [...value];
    try {
      for (const file of Array.from(files)) {
        if (next.length >= MAX_PHOTOS) break;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/discovery/upload-cover", {
          method: "POST",
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setErr("Sign in to upload photos");
          break;
        }
        if (!res.ok || !data.url) {
          setErr(data.error || "Upload failed");
          continue;
        }
        next.push(String(data.url));
      }
      onChange(next.slice(0, MAX_PHOTOS));
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium text-zinc-400">
        Photos{" "}
        <span className="font-normal text-zinc-600">
          (up to {MAX_PHOTOS} — swipeable on the live page)
        </span>
      </p>

      {value.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="text-[10px] text-white/80"
                  aria-label="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-[10px] text-rose-300"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="text-[10px] text-white/80"
                  aria-label="Move right"
                >
                  →
                </button>
              </div>
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-omniv-gold px-1 text-[9px] font-bold text-black">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length < MAX_PHOTOS && (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-[13px] text-zinc-400 hover:border-omniv-gold/40 hover:text-zinc-200 disabled:opacity-60"
        >
          {busy ? "Uploading…" : label}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => void uploadFiles(e.target.files)}
      />
      {err && <p className="mt-1.5 text-[12px] text-rose-400">{err}</p>}
    </div>
  );
}
