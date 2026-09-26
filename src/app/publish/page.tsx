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
import {
  PUBLICATION_LABELS,
  type PublicationType,
} from "@/lib/discovery/types";

const DRAFT_KEY = "omniv-create-draft";

const GROUPS: { label: string; types: PublicationType[] }[] = [
  { label: "Content", types: ["article", "music", "video", "research"] },
  { label: "Things", types: ["product", "event", "file"] },
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
};

const inputCls =
  "mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40";
const labelCls = "text-[12px] font-medium text-zinc-400";
const areaCls =
  "mt-1.5 w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40";

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
  savedAt: number;
};

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishedPath, setPublishedPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedAgo, setSavedAgo] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

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
    const draftId = new URLSearchParams(window.location.search).get("draft");
    if (!draftId) return;
    void (async () => {
      try {
        const res = await fetch(`/api/discovery/publications?id=${encodeURIComponent(draftId)}`);
        const data = await res.json();
        const draft = data.publications?.[0];
        if (!res.ok || !draft) return;
        setPubType(draft.type);
        setTitle(draft.title || "");
        setSummary(draft.summary || "");
        setSubtitle(draft.subtitle || "");
        setBody(draft.body || "");
        setTags((draft.tags || []).join(", "));
        setCoverUrl(draft.coverUrl || null);
        setMediaUrl(draft.mediaUrl || null);
        setSeoTitle(draft.seoTitle || "");
        setSeoDescription(draft.seoDescription || "");
        setStep("form");
        setDraftRestored(true);
        setSavedAgo("Draft loaded");
      } catch {
        setError("Could not load draft");
      }
    })();
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
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        setSavedAgo("Saved as draft");
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [
    pubType, step, title, summary, subtitle, body, publisherName, tags, meta, ctaHref,
    genre, releaseDate, priceMode, category, eventDate, eventTime, location,
    relatedEntities, seoTitle, seoDescription, oppType, deadline, requirements, coverUrl, mediaUrl,
  ]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }

  function pickType(t: PublicationType) {
    setPubType(t);
    setStep("form");
    setError(null);
    setTitle("");
    setSummary("");
    setSubtitle("");
    setBody("");
    setTags("");
    setMeta("");
    setCoverUrl(null);
    setMediaUrl(null);
    setRelatedEntities("");
    setSeoTitle("");
    setSeoDescription("");
    setDraftRestored(false);
    clearDraft();
  }

  function buildMeta(): string {
    const parts: string[] = [];
    if (pubType === "music") {
      if (genre) parts.push(genre);
      if (releaseDate) parts.push(releaseDate);
      else if (meta) parts.push(meta);
    } else if (pubType === "product") {
      parts.push(priceMode === "paid" ? "Paid" : "Contact");
      if (category) parts.push(category);
    } else if (pubType === "event") {
      if (eventDate) parts.push(eventDate);
      if (eventTime) parts.push(eventTime);
      if (location) parts.push(location);
    } else if (pubType === "opportunity") {
      if (oppType) parts.push(oppType);
      if (deadline) parts.push(`Due ${deadline}`);
    } else if (meta) {
      parts.push(meta);
    }
    return parts.filter(Boolean).join(" · ") || meta;
  }

  function buildPayload(status: "draft" | "published") {
    const refs = relatedEntities
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((label) => ({
        type: "company",
        slug: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        label,
      }));
    return {
      type: pubType,
      title: title || "Untitled draft",
      summary: summary || body.slice(0, 160) || "Draft publication",
      subtitle,
      body:
        body +
        (requirements ? `\n\nRequirements:\n${requirements}` : "") +
        (ctaHref ? `\n\nCTA: ${ctaHref}` : ""),
      publisherName,
      publisherId,
      tags,
      meta: buildMeta(),
      coverUrl,
      mediaUrl,
      categoryId: category,
      entityRefs: refs,
      seoTitle,
      seoDescription,
      status,
    };
  }

  async function saveDraft() {
    if (!pubType) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload("draft")),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/signup?from=publish&next=/publish");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not save draft");
        return;
      }
      setSavedAgo("Draft saved to your publications");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function onPublish() {
    if (!pubType) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload("published")),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/signup?from=publish&next=/publish");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not publish");
        return;
      }
      clearDraft();
      setPublishedPath(data.path || `/p/${data.slug || ""}`);
      setStep("done");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${publishedPath}`
        : publishedPath;
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const formTitle = pubType
    ? `Create ${PUBLICATION_LABELS[pubType]}`
    : "Create";

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
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
            {step === "pick" && (
              <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md" />
            )}
            <span className="text-[15px] font-semibold text-white">
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
              <span className="text-[12px] text-zinc-600">{TYPE_INDEX[pubType]}/9</span>
            )}
            {step !== "done" && (
              <Link href="/home" className="text-[13px] text-zinc-500 hover:text-white">
                Cancel
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-5 md:max-w-2xl">
        {step === "pick" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-white">What do you want to publish?</h1>
            <p className="mt-1 text-[14px] text-zinc-500">Choose a format. You can shape the details after.</p>
            {GROUPS.map((g) => (
              <div key={g.label} className="mt-8">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{g.label}</p>
                <div className="grid grid-cols-3 gap-3">
                  {g.types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => pickType(t)}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.03] px-2 py-5 ring-1 ring-white/[0.08] transition hover:bg-omniv-gold/5 hover:ring-omniv-gold/35"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-xl text-zinc-300">{TYPE_ICONS[t]}</span>
                      <span className="text-[12px] font-medium text-zinc-300">{PUBLICATION_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {step === "preview" && pubType && (
          <div className="space-y-6">
            <p className="text-center text-[12px] font-medium uppercase tracking-wide text-zinc-600">Public view</p>
            <div className="overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.08]">
              <div
                className="relative aspect-[16/10] bg-gradient-to-br from-omniv-gold/30 via-zinc-900 to-black"
                style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase text-white/90">{PUBLICATION_LABELS[pubType]}</span>
                  <h2 className="mt-2 text-xl font-semibold text-white">{title || "Untitled"}</h2>
                  <p className="mt-1 text-[13px] text-zinc-400">{publisherName || "Publisher"}{buildMeta() ? ` · ${buildMeta()}` : ""}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[14px] leading-relaxed text-zinc-400">{summary || body.slice(0, 200) || "No description yet."}</p>
                {mediaUrl && <p className="mt-2 text-[12px] text-omniv-gold">Media attached</p>}
              </div>
            </div>
            {error && <p className="text-[13px] text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("form")} className="flex h-12 flex-1 items-center justify-center rounded-full bg-white/[0.06] text-[14px] font-medium text-white ring-1 ring-white/10">Back to edit</button>
              <button type="button" disabled={loading || !title.trim()} onClick={() => void onPublish()} className="flex h-12 flex-1 items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-50">{loading ? "Publishing…" : "Publish"}</button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center pt-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-omniv-gold/20 text-2xl text-omniv-gold">✓</div>
            <h2 className="mt-6 text-xl font-semibold text-white">Published to Omniv</h2>
            <p className="mt-3 max-w-sm text-[16px] leading-snug text-zinc-300">{title}</p>
            <p className="mt-2 text-[13px] text-zinc-500">{publisherName}</p>
            <div className="mt-8 w-full max-w-sm rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-600">Public URL</p>
              <p className="mt-1 truncate text-[13px] text-zinc-300">omniv.media{publishedPath}</p>
              <button type="button" onClick={copyUrl} className="mt-3 w-full rounded-full bg-white/10 py-2.5 text-[13px] font-medium text-white">{copied ? "Copied" : "Copy link"}</button>
            </div>
            <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
              <Link href={publishedPath || "/explore"} className="flex h-12 items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black">View publication</Link>
              <Link href={publishedPath ? `/promote?slug=${publishedPath.replace("/p/","")}` : "/promote"} className="flex h-12 items-center justify-center rounded-full bg-white/[0.06] text-[15px] font-medium text-white ring-1 ring-white/10">Promote this</Link>
              <button type="button" onClick={() => { setStep("pick"); setPubType(null); setTitle(""); }} className="flex h-12 items-center justify-center rounded-full bg-white/[0.06] text-[15px] font-medium text-white ring-1 ring-white/10">Publish another</button>
            </div>
          </div>
        )}

        {step === "form" && pubType && (
          <form onSubmit={(e) => { e.preventDefault(); if ((pubType === "article" || pubType === "announcement") && !body.trim()) { setError("Body required"); return; } setError(null); setStep("preview"); }} className="space-y-5">
            {draftRestored && (
              <p className="rounded-xl bg-omniv-gold/10 px-3 py-2 text-[12px] text-omniv-gold">Draft restored from last session</p>
            )}

            <div>
              <p className={labelCls}>Publishing as</p>
              <div className="mt-1.5">
                <PublishAsPicker value={publisherName} onChange={setPublisherName} onEntityId={setPublisherId} />
              </div>
            </div>

            <CoverUpload label="Cover image" value={coverUrl} onChange={setCoverUrl} />

            {(pubType === "music" || pubType === "file") && (
              <div>
                <p className={labelCls}>{pubType === "music" ? "Audio file" : "Document"}</p>
                <div className="mt-1.5">
                  <MediaUpload
                    label={pubType === "music" ? "Upload track (MP3 / WAV)" : "Upload PDF"}
                    accept={
                      pubType === "music"
                        ? "audio/mpeg,audio/mp3,audio/wav,audio/m4a,.mp3,.wav,.m4a"
                        : "application/pdf,.pdf"
                    }
                    value={mediaUrl}
                    onChange={setMediaUrl}
                  />
                </div>
              </div>
            )}

            <Field label="Title *">
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputCls} />
            </Field>
            {pubType === "article" && (
              <Field label="Subtitle">
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="The sentence that earns the next paragraph" className={inputCls} />
              </Field>
            )}
            {(pubType === "article" || pubType === "announcement") && (
              <div>
                <p className={labelCls}>Body *</p>
                <div className="mt-1.5">
                  <BodyEditor value={body} onChange={setBody} placeholder="Write…" rows={8} />
                </div>
              </div>
            )}
            {pubType !== "article" && pubType !== "announcement" && (
              <Field label="Description *">
                <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="Summary…" className={areaCls} />
              </Field>
            )}
            {pubType === "music" && (
              <>
                <Field label="Genre"><input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Afrobeats" className={inputCls} /></Field>
                <Field label="Release date"><input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className={inputCls} /></Field>
              </>
            )}
            {pubType === "video" && (
              <Field label="Video URL (YouTube / Vimeo / MP4)">
                <input value={mediaUrl || ""} onChange={(e) => setMediaUrl(e.target.value || null)} placeholder="https://…" className={inputCls} />
              </Field>
            )}
            {pubType === "product" && (
              <div>
                <p className={labelCls}>Price</p>
                <div className="mt-1.5 flex gap-2">
                  {(["paid", "contact"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setPriceMode(m)} className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium capitalize ${priceMode === m ? "bg-omniv-gold/15 text-omniv-gold ring-1 ring-omniv-gold/40" : "text-zinc-400 ring-1 ring-white/10"}`}>{m}</button>
                  ))}
                </div>
                <Field label="Category"><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Developer Tools" className={inputCls} /></Field>
                <Field label="Website / CTA"><input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="https://…" className={inputCls} /></Field>
              </div>
            )}
            {pubType === "event" && (
              <>
                <Field label="Date"><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} /></Field>
                <Field label="Time"><input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="9:00 AM – 6:00 PM" className={inputCls} /></Field>
                <Field label="Location"><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className={inputCls} /></Field>
                <Field label="Ticket / Registration"><input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="https://…" className={inputCls} /></Field>
              </>
            )}
            {pubType === "opportunity" && (
              <>
                <Field label="Type"><input value={oppType} onChange={(e) => setOppType(e.target.value)} placeholder="Funding" className={inputCls} /></Field>
                <Field label="Deadline"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} /></Field>
                <Field label="Requirements"><textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} placeholder="Who should apply…" className={areaCls} /></Field>
              </>
            )}
            {pubType === "research" && (
              <Field label="Authors / Publisher"><input value={publisherName} onChange={(e) => setPublisherName(e.target.value)} className={inputCls} /></Field>
            )}

            <div>
              <p className={labelCls}>Tags</p>
              <div className="mt-1.5">
                <TagChips value={tags} onChange={setTags} />
              </div>
            </div>

            {pubType === "article" && (
              <div className="space-y-4 rounded-2xl bg-white/[0.025] p-4 ring-1 ring-white/[0.07]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Publication settings</p>
                <Field label="Related entities"><input value={relatedEntities} onChange={(e) => setRelatedEntities(e.target.value)} placeholder="Nokanda AI, Lagos, Africa" className={inputCls} /></Field>
                <Field label="SEO title"><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Optional search title" className={inputCls} /></Field>
                <Field label="SEO description"><textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder="Optional search description" className={areaCls} /></Field>
              </div>
            )}

            {error && <p className="text-[13px] text-red-400">{error}</p>}
            {savedAgo && <p className="text-[12px] text-zinc-600">{savedAgo}</p>}

            <div className="flex gap-3">
              <button type="button" disabled={loading} onClick={() => void saveDraft()} className="flex h-12 flex-1 items-center justify-center rounded-full bg-white/[0.06] text-[14px] font-medium text-white ring-1 ring-white/10 disabled:opacity-50">{loading ? "Saving…" : "Save draft"}</button>
              <button type="submit" className="flex h-12 flex-1 items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black">Preview</button>
            </div>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}
