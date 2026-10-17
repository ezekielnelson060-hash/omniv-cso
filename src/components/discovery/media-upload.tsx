"use client";

import { useRef, useState } from "react";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

/** Prefer direct storage for large files (avoids Vercel body size limits). */
const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024; // 4MB
const MAX_DIRECT_BYTES = 200 * 1024 * 1024; // 200MB soft cap — raise bucket limit in Supabase if uploads fail

function isVideoFile(file: File) {
  const n = file.name.toLowerCase();
  return (
    file.type.startsWith("video/") ||
    n.endsWith(".mp4") ||
    n.endsWith(".webm") ||
    n.endsWith(".mov")
  );
}

function isAudioFile(file: File) {
  const n = file.name.toLowerCase();
  return (
    file.type.startsWith("audio/") ||
    n.endsWith(".mp3") ||
    n.endsWith(".wav") ||
    n.endsWith(".m4a") ||
    n.endsWith(".ogg") ||
    n.endsWith(".aac")
  );
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }
  return m + ":" + String(sec).padStart(2, "0");
}

/** Read duration from a local video/audio file before upload. */
function probeDuration(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const isVid = isVideoFile(file);
    const el = document.createElement(isVid ? "video" : "audio");
    el.preload = "metadata";
    const done = (label: string | null) => {
      URL.revokeObjectURL(url);
      resolve(label);
    };
    el.onloadedmetadata = () => {
      const d = el.duration;
      done(formatDuration(d) || null);
    };
    el.onerror = () => done(null);
    setTimeout(() => done(null), 8000);
    el.src = url;
  });
}

export function MediaUpload({
  label = "Upload audio or PDF",
  accept = "audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/ogg,application/pdf,.mp3,.wav,.m4a,.pdf",
  value,
  onChange,
  onDuration,
}: {
  label?: string;
  accept?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Called with mm:ss (or h:mm:ss) when duration can be read from the file. */
  onDuration?: (label: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function uploadDirect(file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new Error("Storage is not configured");
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Sign in to upload media");

    if (file.size > MAX_DIRECT_BYTES) {
      throw new Error(
        `Max ${Math.round(MAX_DIRECT_BYTES / (1024 * 1024))}MB. Compress the file or paste a YouTube / Vimeo link instead.`
      );
    }

    const name = file.name.toLowerCase();
    const ext = name.includes(".")
      ? name.split(".").pop()!.slice(0, 5)
      : file.type.startsWith("video/")
        ? "mp4"
        : file.type.includes("pdf")
          ? "pdf"
          : "bin";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const contentType = file.type || "application/octet-stream";

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Sign in to upload media");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const uploadUrl = `${url}/storage/v1/object/discovery-media/${path}`;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
      xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else {
          let msg = "Upload failed";
          try {
            const j = JSON.parse(xhr.responseText);
            msg = j.message || j.error || msg;
          } catch {
            /* ignore */
          }
          if (String(msg).toLowerCase().includes("bucket") || xhr.status === 404) {
            msg = "Run migration 034 (discovery-media bucket) in Supabase";
          }
          reject(new Error(msg));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });

    const {
      data: { publicUrl },
    } = supabase.storage.from("discovery-media").getPublicUrl(path);
    return publicUrl;
  }

  async function uploadViaApi(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/discovery/upload-media", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (res.status === 401) throw new Error("Sign in to upload media");
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr(null);
    setBusy(true);
    setProgress(0);
    setFileName(file.name);
    try {
      const useDirect =
        file.size >= DIRECT_UPLOAD_THRESHOLD ||
        isVideoFile(file) ||
        isAudioFile(file);
      const url = useDirect
        ? await uploadDirect(file)
        : await uploadViaApi(file);
      onChange(url);
      setProgress(100);
      if (onDuration && (isVideoFile(file) || isAudioFile(file))) {
        const dur = await probeDuration(file);
        if (dur) onDuration(dur);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
      setProgress(null);
    } finally {
      setBusy(false);
    }
  }

  const isPdf = value?.toLowerCase().includes(".pdf");
  const isVideo =
    value?.toLowerCase().includes(".mp4") ||
    value?.toLowerCase().includes(".webm") ||
    value?.toLowerCase().includes(".mov") ||
    accept.includes("video");

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative flex w-full flex-col items-center justify-center gap-2 rounded-2xl bg-white/[0.03] px-4 py-8 ring-1 ring-white/[0.08] transition hover:ring-white/15 disabled:opacity-70"
      >
        <span className="text-2xl opacity-50">
          {isPdf ? "📄" : isVideo ? "▶" : "♪"}
        </span>
        <span className="text-[13px] font-medium text-zinc-300">
          {busy
            ? progress != null
              ? `Uploading… ${progress}%`
              : "Uploading…"
            : value
              ? "Replace file"
              : label}
        </span>
        {busy && progress != null && (
          <div className="mt-1 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-omniv-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {(fileName || value) && !busy && (
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
            setProgress(null);
          }}
          className="mt-1.5 text-[12px] text-zinc-500 hover:text-zinc-300"
        >
          Remove file
        </button>
      )}
      {accept.includes("video") && (
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
          MP4 or WebM recommended (up to ~200MB direct upload). For longer films
          or 4K, paste a YouTube or Vimeo link below — no size limit on embeds.
        </p>
      )}
    </div>
  );
}
