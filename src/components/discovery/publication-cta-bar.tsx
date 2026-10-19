"use client";

import { useEffect, useState } from "react";
import { isSaved, toggleSave } from "@/lib/discovery/local-graph";
import { isFollowing, toggleFollow } from "@/lib/discovery/local-graph";
import { recordSignal } from "@/lib/discovery/signals";
import { TrackedDownload } from "@/components/discovery/tracked-download";

function typeNoun(type: string): string {
  const t = (type || "article").toLowerCase();
  if (t === "music") return "music";
  if (t === "video") return "video";
  if (t === "file" || t === "research") return "file";
  if (t === "product") return "product";
  if (t === "event") return "event";
  if (t === "opportunity") return "opportunity";
  return "article";
}

function canDownload(type: string, mediaUrl?: string | null): boolean {
  if (!mediaUrl) return false;
  const t = (type || "").toLowerCase();
  return (
    t === "music" ||
    t === "video" ||
    t === "file" ||
    t === "research" ||
    t === "product" ||
    /\.(mp3|wav|m4a|aac|ogg|mp4|webm|mov|pdf|doc|docx|zip)(\?|$)/i.test(mediaUrl)
  );
}

function downloadLabel(type: string, mediaUrl?: string | null): string {
  const u = (mediaUrl || "").toLowerCase();
  if (u.includes(".pdf") || type === "file" || type === "research") return "Download PDF";
  if (type === "music" || /\.(mp3|wav|m4a|aac|ogg)/.test(u)) return "Download audio";
  if (type === "video" || /\.(mp4|webm|mov)/.test(u)) return "Download video";
  return "Download";
}

export function PublicationBottomActions({
  publicationType,
  publicationSlug,
  publicationTitle,
  mediaUrl,
  publisherName,
  publisherType,
  publisherSlug,
  publisherId,
  showFollow,
}: {
  publicationType: string;
  publicationSlug: string;
  publicationTitle: string;
  mediaUrl?: string | null;
  publisherName: string;
  publisherType: string;
  publisherSlug: string;
  publisherId?: string;
  showFollow: boolean;
}) {
  const noun = typeNoun(publicationType);
  const showDl = canDownload(publicationType, mediaUrl);

  return (
    <div className="mt-8 space-y-3">
      <p className="text-center text-[12px] text-zinc-500">
        Keep this {noun} or follow the publisher
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <LabeledSave
          type={publicationType}
          slug={publicationSlug}
          name={publicationTitle}
          noun={noun}
        />
        {showFollow ? (
          <LabeledFollow
            type={publisherType}
            slug={publisherSlug}
            name={publisherName}
            id={publisherId}
          />
        ) : null}
      </div>
      {showDl && mediaUrl ? (
        <div className="flex justify-center pt-1">
          <TrackedDownload
            href={mediaUrl}
            publicationSlug={publicationSlug}
            publicationType={publicationType}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-[13px] font-semibold text-white ring-1 ring-white/12 transition hover:bg-white/[0.1]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {downloadLabel(publicationType, mediaUrl)}
          </TrackedDownload>
        </div>
      ) : null}
    </div>
  );
}

function LabeledSave({
  type,
  slug,
  name,
  noun,
}: {
  type: string;
  slug: string;
  name: string;
  noun: string;
}) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/save");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.saves)) {
          setSaved(
            data.saves.some(
              (x: { kind: string; type: string; slug: string }) =>
                x.kind === "publication" && x.type === type && x.slug === slug
            )
          );
        } else {
          setSaved(isSaved("publication", type, slug));
        }
      } catch {
        if (!cancelled) setSaved(isSaved("publication", type, slug));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    const item = {
      kind: "publication" as const,
      type,
      slug,
      name,
      pubType: type,
    };
    try {
      const res = await fetch("/api/discovery/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.status === 401) {
        const next = toggleSave(item);
        setSaved(next);
        if (next) recordSignal("save", [type]);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setSaved(Boolean(data.saved));
        if (data.saved !== isSaved("publication", type, slug)) toggleSave(item);
        if (data.saved) recordSignal("save", [type]);
      } else {
        setSaved(toggleSave(item));
      }
    } catch {
      setSaved(toggleSave(item));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready || busy}
      className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-semibold transition ${
        saved
          ? "bg-omniv-gold/15 text-omniv-gold ring-1 ring-omniv-gold/30"
          : "bg-white/[0.08] text-white ring-1 ring-white/12 hover:bg-white/[0.12]"
      }`}
    >
      {saved ? `Saved this ${noun}` : `Save this ${noun}`}
    </button>
  );
}

function LabeledFollow({
  type,
  slug,
  name,
  id,
}: {
  type: string;
  slug: string;
  name: string;
  id?: string;
}) {
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/follow");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.follows)) {
          setFollowing(
            data.follows.some(
              (x: { type: string; slug: string }) =>
                x.type === type && x.slug === slug
            )
          );
        } else {
          setFollowing(isFollowing(type, slug));
        }
      } catch {
        if (!cancelled) setFollowing(isFollowing(type, slug));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/discovery/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug, name, id }),
      });
      if (res.status === 401) {
        const next = toggleFollow({ type, slug, name, id });
        setFollowing(next);
        if (next) recordSignal("follow", [type, name]);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setFollowing(Boolean(data.following));
        if (data.following !== isFollowing(type, slug)) {
          toggleFollow({ type, slug, name, id });
        }
        if (data.following) recordSignal("follow", [type, name]);
      } else {
        setFollowing(toggleFollow({ type, slug, name, id }));
      }
    } catch {
      setFollowing(toggleFollow({ type, slug, name, id }));
    } finally {
      setBusy(false);
    }
  }

  const short = name.length > 18 ? `${name.slice(0, 16)}…` : name;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready || busy}
      className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-semibold transition ${
        following
          ? "bg-transparent text-white ring-1 ring-white/20"
          : "bg-omniv-gold text-black hover:bg-omniv-gold/90"
      }`}
    >
      {following ? `Following ${short}` : `Follow ${short}`}
    </button>
  );
}
