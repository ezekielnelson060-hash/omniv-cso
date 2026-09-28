"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { CoverUpload } from "@/components/discovery/cover-upload";
import { PublishAsPicker } from "@/components/discovery/publish-as-picker";
import { MediaUpload } from "@/components/discovery/media-upload";
import { ScheduleField } from "@/components/discovery/schedule-field";
import { BodyEditor } from "@/components/discovery/body-editor";
import {
  GROUPS,
  TYPE_ICONS,
  TYPE_HEADLINES,
  inputCls,
  labelCls,
  PUBLICATION_LABELS,
} from "@/components/discovery/publish-constants";
import type { PublicationType } from "@/lib/discovery/types";

export default function PublishPage() {
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
  const [pubType, setPubType] = useState<PublicationType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [publisherId, setPublisherId] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedPath, setPublishedPath] = useState("");

  async function onPublish() {
    if (!pubType || !title.trim()) {
      setError("Title required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: pubType,
          title: title.trim(),
          summary: summary.trim() || title.trim(),
          body: body.trim() || undefined,
          publisherName: publisherName.trim() || undefined,
          publisherId: publisherId || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          coverUrl: coverUrl || undefined,
          mediaUrl: mediaUrl || undefined,
          status: isPrivate ? "draft" : scheduledAt ? "scheduled" : "published",
          visibility: isPrivate ? "private" : "public",
          scheduledAt: scheduledAt || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Publish failed");
        setLoading(false);
        return;
      }
      setPublishedPath(data.path || `/p/${data.slug || ""}`);
      setStep("done");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const head = pubType ? TYPE_HEADLINES[pubType] : null;

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <span className="text-[16px] font-semibold text-white">
            {step === "done"
              ? isPrivate
                ? "Saved private"
                : scheduledAt
                  ? "Scheduled"
                  : "Published"
              : step === "pick"
                ? "Create"
                : head?.title || "Publish"}
          </span>
          <Link href="/home" className="text-[13px] text-zinc-500 hover:text-white">
            Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-5">
        {step === "pick" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              What do you want to publish?
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Choose a format. You can schedule on the next step.
            </p>
            {GROUPS.map((g) => (
              <div key={g.label} className="mt-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                  {g.label}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {g.types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setPubType(t);
                        setStep("form");
                      }}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-3.5 text-left ring-1 ring-white/[0.06] transition hover:bg-white/[0.07]"
                    >
                      <span className="text-lg">{TYPE_ICONS[t]}</span>
                      <span className="text-[14px] font-medium text-white">
                        {PUBLICATION_LABELS[t]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {step === "form" && pubType && (
          <div className="space-y-5">
            {head && (
              <div className="rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.08]">
                <p className="text-[15px] font-semibold text-white">{head.title}</p>
                <p className="mt-1 text-[13px] text-zinc-500">{head.sub}</p>
              </div>
            )}

            <div>
              <p className={labelCls}>Publishing as</p>
              <div className="mt-1.5">
                <PublishAsPicker
                  value={publisherName}
                  onChange={setPublisherName}
                  onEntityId={setPublisherId}
                />
              </div>
            </div>

            <label className="block">
              <span className={labelCls}>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
                placeholder="Name this publication"
              />
            </label>

            <label className="block">
              <span className={labelCls}>Summary</span>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={inputCls}
                placeholder="One line that makes people stop"
              />
            </label>

            <ScheduleField
              value={scheduledAt}
              onChange={setScheduledAt}
              labelClassName={labelCls}
              inputClassName={inputCls}
            />

            <label className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06]">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent accent-omniv-gold"
              />
              <span className="text-[13px] text-zinc-300">
                Private (Business) — only you can see this
              </span>
            </label>

            <div>
              <p className={labelCls}>Body</p>
              <div className="mt-1.5">
                <BodyEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Write the story, notes, or description…"
                  rows={10}
                />
              </div>
            </div>

            <div>
              <p className={labelCls}>Cover</p>
              <div className="mt-1.5">
                <CoverUpload value={coverUrl} onChange={setCoverUrl} />
              </div>
            </div>

            <div>
              <p className={labelCls}>Media (audio / video / file)</p>
              <div className="mt-1.5">
                <MediaUpload value={mediaUrl} onChange={setMediaUrl} />
              </div>
            </div>

            <label className="block">
              <span className={labelCls}>Tags (comma-separated)</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputCls}
                placeholder="music, lagos, independent"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={() => void onPublish()}
              className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-60"
            >
              {loading
                ? "Publishing…"
                : isPrivate
                  ? "Save private"
                  : scheduledAt
                    ? "Schedule"
                    : "Publish"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="rounded-2xl bg-white/[0.03] p-6 text-center ring-1 ring-white/[0.08]">
            <p className="text-[18px] font-semibold text-white">
              {isPrivate
                ? "Saved as private"
                : scheduledAt
                  ? "Scheduled"
                  : "Live on Omniv"}
            </p>
            <p className="mt-2 text-[13px] text-zinc-500">
              {isPrivate
                ? "Only you can see this publication."
                : scheduledAt
                  ? `Goes live ${new Date(scheduledAt).toLocaleString()}`
                  : "Your publication is discoverable."}
            </p>
            <p className="mt-3 font-mono text-[12px] text-omniv-gold">
              omniv.media{publishedPath}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={publishedPath || "/home"}
                className="flex h-11 items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => {
                  setStep("pick");
                  setPubType(null);
                  setTitle("");
                  setSummary("");
                  setBody("");
                  setScheduledAt("");
                  setIsPrivate(false);
                  setPublishedPath("");
                }}
                className="flex h-11 items-center justify-center rounded-full bg-white/10 text-[14px] font-medium text-white"
              >
                Publish another
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
