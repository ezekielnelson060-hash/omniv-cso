"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { CoverUpload } from "@/components/discovery/cover-upload";
import { PublishAsPicker } from "@/components/discovery/publish-as-picker";
import { TagChips } from "@/components/discovery/tag-chips";
import { MediaUpload } from "@/components/discovery/media-upload";
import { BodyEditor } from "@/components/discovery/body-editor";
import { PublishTypeBoot } from "@/components/discovery/publish-type-boot";
import {
  PUBLICATION_LABELS,
  type PublicationType,
} from "@/lib/discovery/types";

const DRAFT_KEY = "omniv-create-draft";

const GROUPS: { label: string; types: PublicationType[] }[] = [
  { label: "Content", types: ["article", "music", "video", "research"] },
  { label: "Things", types: ["product", "event", "file", "image"] },
  { label: "Signals", types: ["announcement", "opportunity"] },
];

const TYPE_ICONS: Record<PublicationType, string> = {
  article: "📄",
  music: "♪",
  video: "▶",
  research: "▣",
  product: "◇",
  event: "📅",
  opportunity: "◎",
  announcement: "📣",
  file: "📁",
  image: "▧",
};

const TYPE_INDEX: Record<PublicationType, number> = {
  article: 1,
  music: 2,
  video: 3,
  research: 4,
  product: 5,
  event: 6,
  announcement: 7,
  opportunity: 8,
  file: 9,
  image: 10,
};

const TYPE_HEADLINES: Partial<Record<PublicationType, { title: string; sub: string }>> = {
  article: { title: "Write an article", sub: "Long-form thinking worth discovering." },
  music: { title: "Publish a release", sub: "Song as a discovery gateway — not just a stream link." },
  video: { title: "Publish a video", sub: "Context, chapters, and related world around the watch." },
  research: { title: "Share research", sub: "Reports and findings the network can build on." },
  product: { title: "List a product", sub: "Something people can discover and reach out about." },
  event: { title: "Publish an event", sub: "Shows, launches, and gatherings with a place on the map." },
  opportunity: { title: "Post an opportunity", sub: "Roles, partnerships, and open calls." },
  announcement: { title: "Make an announcement", sub: "News that should travel with your identity." },
  file: { title: "Share a file", sub: "Documents and assets people can find and save." },
  image: { title: "Publish imagery", sub: "Visual work as a first-class publication." },
};

const inputCls =
  "mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40";
const labelCls = "text-[12px] font-medium text-zinc-400";

type Draft = {
  pubType: PublicationType;
  title: string;
  summary: string;
  subtitle: string;
  body: string;
  publisherName: string;
  tags: string;
  meta: string;
  ctaHref: string;
  genre: string;
  releaseDate: string;
  priceMode: "paid" | "contact";
  category: string;
  relatedEntities: string;
  seoTitle: string;
  seoDescription: string;
  eventDate: string;
  eventTime: string;
  location: string;
  oppType: string;
  deadline: string;
  requirements: string;
  coverUrl: string | null;
  mediaUrl: string | null;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "form" | "preview" | "done">("pick");
  const [pubType, setPubType] = useState<PublicationType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [publisherId, setPublisherId] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [meta, setMeta] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [priceMode, setPriceMode] = useState<"paid" | "contact">("contact");
  const [category, setCategory] = useState("");
  const [relatedEntities, setRelatedEntities] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [oppType, setOppType] = useState("Funding");
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedPath, setPublishedPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [savedAgo, setSavedAgo] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Draft;
      if (!d?.pubType) return;
      setPubType(d.pubType);
      setTitle(d.title || "");
      setSummary(d.summary || "");
      setSubtitle(d.subtitle || "");
      setBody(d.body || "");
      setPublisherName(d.publisherName || "");
      setTags(d.tags || "");
      setMeta(d.meta || "");
      setCtaHref(d.ctaHref || "");
      setGenre(d.genre || "");
      setReleaseDate(d.releaseDate || "");
      setPriceMode(d.priceMode || "contact");
      setCategory(d.category || "");
      setRelatedEntities(d.relatedEntities || "");
      setSeoTitle(d.seoTitle || "");
      setSeoDescription(d.seoDescription || "");
      setEventDate(d.eventDate || "");
      setEventTime(d.eventTime || "");
      setLocation(d.location || "");
      setOppType(d.oppType || "Funding");
      setDeadline(d.deadline || "");
      setRequirements(d.requirements || "");
      setCoverUrl(d.coverUrl);
      setMediaUrl(d.mediaUrl ?? null);
      setStep("form");
      setDraftRestored(true);
      setSavedAgo("Draft restored");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!pubType || step === "pick" || step === "done") return;
    const t = setTimeout(() => {
      const d: Draft = {
        pubType,
        title,
        summary,
        subtitle,
        body,
        publisherName,
        tags,
        meta,
        ctaHref,
        genre,
        releaseDate,
        priceMode,
        category,
        relatedEntities,
        seoTitle,
        seoDescription,
        eventDate,
        eventTime,
        location,
        oppType,
        deadline,
        requirements,
        coverUrl,
        mediaUrl,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        setSavedAgo("Saved");
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [
    pubType,
    step,
    title,
    summary,
    subtitle,
    body,
    publisherName,
    tags,
    meta,
    ctaHref,
    genre,
    releaseDate,
    priceMode,
    category,
    relatedEntities,
    seoTitle,
    seoDescription,
    eventDate,
    eventTime,
    location,
    oppType,
    deadline,
    requirements,
    coverUrl,
    mediaUrl,
  ]);

  function pickType(t: PublicationType) {
    setPubType(t);
    setStep("form");
  }

  function buildPayload() {
    const tagList = tags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const base: Record<string, unknown> = {
      type: pubType,
      title: title.trim(),
      summary: summary.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      body: body.trim() || undefined,
      publisherName: publisherName.trim() || undefined,
      publisherId: publisherId || undefined,
      tags: tagList,
      coverUrl: coverUrl || undefined,
      mediaUrl: mediaUrl || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      status: "published",
    };
    if (pubType === "music") {
      base.genre = genre.trim() || undefined;
      base.releaseDate = releaseDate || undefined;
      base.meta = meta.trim() || undefined;
    } else if (pubType === "product") {
      base.priceMode = priceMode;
      base.category = category.trim() || undefined;
    } else if (pubType === "event") {
      base.eventDate = eventDate || undefined;
      base.eventTime = eventTime || undefined;
      base.location = location.trim() || undefined;
    } else if (pubType === "opportunity") {
      base.oppType = oppType;
      base.deadline = deadline || undefined;
      base.requirements = requirements.trim() || undefined;
    }
    if (ctaHref.trim()) base.ctaHref = ctaHref.trim();
    if (relatedEntities.trim()) {
      base.relatedEntities = relatedEntities
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }
    return base;
  }

  async function onPublish() {
    if (!pubType) return;
    if (!title.trim()) {
      setError("Title required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Publish failed");
        setLoading(false);
        return;
      }
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setPublishedPath(data.path || `/p/${data.slug || ""}`);
      setStep("done");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    const url = `https://omniv.media${publishedPath}`;
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const typeHead = pubType ? TYPE_HEADLINES[pubType] : null;
  const formTitle =
    typeHead?.title ||
    (pubType ? `Create ${PUBLICATION_LABELS[pubType]}` : "Create");

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <PublishTypeBoot
        onType={(typ) => {
          setPubType(typ);
          setStep("form");
        }}
      />
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {(step === "form" || step === "preview") && (
              <button
                type="button"
                onClick={() => setStep(step === "preview" ? "form" : "pick")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white"
                aria-label="Back"
              >
                ←
              </button>
            )}
            <span className="text-[16px] font-semibold text-white">
              {step === "done"
                ? "Published"
                : step === "preview"
                  ? "Preview"
                  : step === "pick"
                    ? "Create"
                    : formTitle}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {step === "form" && pubType && (
              <span className="text-[12px] text-zinc-600">
                {TYPE_INDEX[pubType]}/9
              </span>
            )}
            {step !== "done" && (
              <Link href="/home" className="text-[13px] text-zinc-500 hover:text-white">
                Cancel
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-5">
        {step === "pick" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              What do you want to publish?
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Choose a format. You can shape the details after.
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
                      onClick={() => pickType(t)}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-3.5 text-left ring-1 ring-white/[0.06] transition hover:bg-white/[0.07] active:scale-[0.98]"
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                (pubType === "article" || pubType === "announcement") &&
                !body.trim()
              ) {
                setError("Body required");
                return;
              }
              setError(null);
              setStep("preview");
            }}
            className="space-y-5"
          >
            {typeHead && (
              <div className="rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.08]">
                <p className="text-[15px] font-semibold text-white">
                  {typeHead.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-zinc-500">
                  {typeHead.sub}
                </p>
              </div>
            )}
            {draftRestored && (
              <p className="rounded-xl bg-omniv-gold/10 px-3 py-2 text-[12px] text-omniv-gold">
                Draft restored from last session
              </p>
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

            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
                placeholder="Name this publication"
                required
              />
            </Field>

            <Field label="Summary">
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={inputCls}
                placeholder="One line that makes people stop"
              />
            </Field>

            {(pubType === "article" ||
              pubType === "research" ||
              pubType === "announcement") && (
              <div>
                <p className={labelCls}>Body</p>
                <div className="mt-1.5">
                  <BodyEditor
                    value={body}
                    onChange={setBody}
                    placeholder="Start writing your publication…"
                    rows={14}
                  />
                </div>
              </div>
            )}

            {pubType === "music" && (
              <>
                <Field label="Genre">
                  <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls} placeholder="e.g. Alternative R&B" />
                </Field>
                <Field label="Release date">
                  <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className={inputCls} />
                </Field>
                <div>
                  <p className={labelCls}>About this release</p>
                  <div className="mt-1.5">
                    <BodyEditor value={body} onChange={setBody} placeholder="Story behind the music…" rows={10} />
                  </div>
                </div>
                <Field label="Stream / media link">
                  <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className={inputCls} placeholder="https://…" />
                </Field>
              </>
            )}

            {pubType === "video" && (
              <>
                <div>
                  <p className={labelCls}>Description</p>
                  <div className="mt-1.5">
                    <BodyEditor value={body} onChange={setBody} placeholder="What this video is about…" rows={10} />
                  </div>
                </div>
                <Field label="Watch URL">
                  <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className={inputCls} placeholder="https://…" />
                </Field>
              </>
            )}

            {pubType === "product" && (
              <>
                <Field label="Category">
                  <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
                </Field>
                <div>
                  <p className={labelCls}>Pricing</p>
                  <div className="mt-1.5 flex gap-2">
                    {(["paid", "contact"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPriceMode(m)}
                        className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium capitalize ${
                          priceMode === m
                            ? "bg-omniv-gold/15 text-omniv-gold ring-1 ring-omniv-gold/40"
                            : "text-zinc-400 ring-1 ring-white/10"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {pubType === "event" && (
              <>
                <Field label="Date">
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Time">
                  <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={inputCls} placeholder="7:00 PM" />
                </Field>
                <Field label="Location">
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
                </Field>
              </>
            )}

            {pubType === "opportunity" && (
              <>
                <Field label="Type">
                  <input value={oppType} onChange={(e) => setOppType(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Deadline">
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Requirements">
                  <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08]" rows={3} />
                </Field>
              </>
            )}

            <div>
              <p className={labelCls}>Cover</p>
              <div className="mt-1.5">
                <CoverUpload value={coverUrl} onChange={setCoverUrl} />
              </div>
            </div>

            <div>
              <p className={labelCls}>Media</p>
              <div className="mt-1.5">
                <MediaUpload value={mediaUrl} onChange={setMediaUrl} />
              </div>
            </div>

            <div>
              <p className={labelCls}>Tags</p>
              <div className="mt-1.5">
                <TagChips value={tags} onChange={setTags} />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-[13px] text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black"
              >
                Preview
              </button>
            </div>
            {savedAgo && (
              <p className="text-center text-[11px] text-zinc-600">{savedAgo}</p>
            )}
          </form>
        )}

        {step === "preview" && pubType && (
          <div className="space-y-5">
            {coverUrl && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                <Image src={coverUrl} alt="" fill className="object-cover" unoptimized />
              </div>
            )}
            <p className="text-[12px] uppercase tracking-wide text-zinc-500">
              {PUBLICATION_LABELS[pubType]}
            </p>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {summary && <p className="text-[15px] text-zinc-400">{summary}</p>}
            {body && (
              <div
                className="omniv-doc-editor prose prose-invert max-w-none text-[15px] leading-relaxed text-zinc-300"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-white/[0.06] text-[14px] font-medium text-white ring-1 ring-white/10"
              >
                Back to edit
              </button>
              <button
                type="button"
                disabled={loading || !title.trim()}
                onClick={() => void onPublish()}
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-50"
              >
                {loading ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center pt-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-omniv-gold/20 text-2xl text-omniv-gold">
              ✓
            </div>
            <h2 className="mt-6 text-xl font-semibold text-white">Published to Omniv</h2>
            <p className="mt-3 max-w-sm text-[16px] leading-snug text-zinc-300">{title}</p>
            <p className="mt-2 text-[13px] text-zinc-500">{publisherName}</p>
            <div className="mt-8 w-full max-w-sm rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-600">
                Public URL
              </p>
              <p className="mt-1 truncate text-[13px] text-zinc-300">
                omniv.media{publishedPath}
              </p>
              <button
                type="button"
                onClick={copyUrl}
                className="mt-3 w-full rounded-full bg-white/10 py-2.5 text-[13px] font-medium text-white"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
            <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
              <Link
                href={publishedPath || "/explore"}
                className="flex h-12 items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black"
              >
                View publication
              </Link>
              <button
                type="button"
                onClick={() => {
                  setStep("pick");
                  setPubType(null);
                  setTitle("");
                }}
                className="flex h-12 items-center justify-center rounded-full bg-white/[0.06] text-[15px] font-medium text-white ring-1 ring-white/10"
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
