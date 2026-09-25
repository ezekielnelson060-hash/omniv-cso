"use client";

import { useRef, useState } from "react";

/** Compact camera control for cover or avatar (X-style) */
export function PhotoPicker({
  kind,
  value,
  onChange,
  className = "",
}: {
  kind: "cover" | "avatar";
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
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
        setErr("Sign in to upload");
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

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`flex items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm ring-1 ring-white/20 transition hover:bg-black/70 disabled:opacity-50 ${
          kind === "cover" ? "h-10 w-10" : "h-9 w-9"
        } ${className}`}
        aria-label={kind === "cover" ? "Change cover" : "Change photo"}
        title={busy ? "Uploading…" : kind === "cover" ? "Change cover" : "Change photo"}
      >
        {busy ? (
          <span className="text-[11px]">…</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 8h3l2-2h6l2 2h3v11H4V8z" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {err && (
        <p className="absolute left-0 right-0 top-full mt-1 text-center text-[11px] text-rose-400">
          {err}
        </p>
      )}
    </>
  );
}
