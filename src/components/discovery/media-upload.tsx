"use client";

import { useRef, useState } from "react";

export function MediaUpload({
  label = "Upload audio or PDF",
  accept = "audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/ogg,application/pdf,.mp3,.wav,.m4a,.pdf",
  value,
  onChange,
}: {
  label?: string;
  accept?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr(null);
    setBusy(true);
    setFileName(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/discovery/upload-media", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.status === 401) {
        setErr("Sign in to upload media");
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

  const isPdf = value?.toLowerCase().includes(".pdf");

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative flex w-full flex-col items-center justify-center gap-2 rounded-2xl bg-white/[0.03] px-4 py-8 ring-1 ring-white/[0.08] transition hover:ring-white/15"
      >
        <span className="text-2xl opacity-50">{isPdf ? "📄" : "♪"}</span>
        <span className="text-[13px] font-medium text-zinc-300">
          {busy ? "Uploading…" : value ? "Replace file" : label}
        </span>
        {(fileName || value) && (
          <span className="max-w-full truncate text-[11px] text-zinc-500">
            {fileName || value?.split("/").pop()}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {err && <p className="mt-1.5 text-[12px] text-rose-400">{err}</p>}
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setFileName(null);
          }}
          className="mt-1.5 text-[12px] text-zinc-500 hover:text-zinc-300"
        >
          Remove file
        </button>
      )}
    </div>
  );
}
