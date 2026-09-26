"use client";

import { useRef, useState } from "react";

export function CoverUpload({
  label = "Change cover image",
  tall,
  video,
  value,
  onChange,
}: {
  label?: string;
  tall?: boolean;
  video?: boolean;
  value?: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/discovery/upload-cover", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.status === 401) {
        setErr("Sign in to upload covers");
        return;
      }
      if (!res.ok) {
        setErr(data.error || "Upload failed");
        return;
      }
      onChange(data.url);
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  const aspect = tall
    ? "aspect-square max-w-[140px]"
    : video
      ? "aspect-video"
      : "aspect-[3/1]";

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`relative w-full overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-950 text-left ${
          tall ? "rounded-2xl" : "rounded-none"
        } ${aspect}`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
            value ? "bg-black/45" : ""
          }`}
        >
          {video && !value && (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl text-white">
              ▶
            </span>
          )}
          {!video && !value && (
            <span className="text-2xl opacity-40">◻</span>
          )}
          <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] text-zinc-200">
            {busy ? "Uploading…" : label}
          </span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {err && (
        <p className="mt-1.5 px-4 text-[12px] text-rose-400">{err}</p>
      )}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-1.5 px-4 text-[12px] text-zinc-500 hover:text-zinc-300"
        >
          Remove
        </button>
      )}
    </div>
  );
}
