"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { CoverUpload } from "@/components/discovery/cover-upload";
import { PublishAsPicker } from "@/components/discovery/publish-as-picker";
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
  body: string;
  publisherName: string;
  tags: string;
  meta: string;
  ctaHref: string;
  genre: string;
  releaseDate: string;
  priceMode: "paid" | "contact";
  category: string;
  eventDate: string;
  eventTime: string;
  location: string;
  oppType: string;
  deadline: string;
  requirements: string;
  coverUrl: string | null;
  savedAt: number;
};

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "form" | "preview" | "done">("pick");
  const [pubType, setPubType] = useState<PublicationType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
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
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [oppType, setOppType] = useState("Funding");
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
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
      setBody(d.body || "");
      setPublisherName(d.publisherName || "");
      setTags(d.tags || "");
      setMeta(d.meta || "");
      setCtaHref(d.ctaHref || "");
      setGenre(d.genre || "");
      setReleaseDate(d.releaseDate || "");
      setPriceMode(d.priceMode || "contact");
      setCategory(d.category || "");
      setEventDate(d.eventDate || "");
      setEventTime(d.eventTime || "");
      setLocation(d.location || "");
      setOppType(d.oppType || "Funding");
      setDeadline(d.deadline || "");
      setRequirements(d.requirements || "");
      setCoverUrl(d.coverUrl);
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
        body,
        publisherName,
        tags,
        meta,
        ctaHref,
        genre,
        releaseDate,
        priceMode,
        category,
        eventDate,
        eventTime,
        location,
        oppType,
        deadline,
        requirements,
        coverUrl,
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        setSavedAgo("Saved just now");
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [
    pubType, step, title, summary, body, publisherName, tags, meta, ctaHref,
    genre, releaseDate, priceMode, category, eventDate, eventTime, location,
    oppType, deadline, requirements, coverUrl,
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
    setBody("");
    setTags("");
    setMeta("");
    setCoverUrl(null);
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

  async function onPublish() {
    if (!pubType) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: pubType,
          title,
          summary: summary || body.slice(0, 160) || title,
          body:
            body +
            (requirements ? `\n\nRequirements:\n${requirements}` : "") +
            (ctaHref ? `\n\nCTA: ${ctaHref}` : ""),
          publisherName: publisherName || "Publisher",
          publisherId,
          tags,
          meta: buildMeta(),
          coverUrl,
        }),
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
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create</h1>
            <p className="mt-1 text-[14px] text-zinc-500">Share your work with the world.</p>
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
            <p className="mt-10 text-center text-[13px] text-zinc-600">
              Already published?{" "}
              <Link href="/explore" className="text-omniv-gold hover:underline">Explore the network</Link>
            </p>
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
              <button type="button" onClick={() => { setStep("pick"); setPubType(null); setTitle(""); }} className="flex h-12 items-center justify-center rounded-full bg-white/[0.06] text-[15px] font-medium text-white ring-1 ring-white/10">Publish another</button>
            </div>
          </div>
        )}

        {step === "form" && pubType && (
          <form onSubmit={(e) => { e.preventDefault(); setStep("preview"); }} className="space-y-5">
            {draftRestored && (
              <p className="rounded-xl bg-omniv-gold/10 px-3 py-2 text-[12px] text-omniv-gold">Draft restored from last session</p>
            )}

            {/* Account switch — mockup style */}
            <div>
              <p className={labelCls}>Publishing as</p>
              <div className="mt-1.5">
                <PublishAsPicker value={publisherName} onChange={setPublisherName} onEntityId={setPublisherId} />
              </div>
            </div>

            <CoverUpload label="Cover image" value={coverUrl} onChange={setCoverUrl} />
            <Field label="Title *">
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputCls} />
            </Field>
            {(pubType === "article" || pubType === "announcement") && (
              <Field label="Body *">
                <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Write…" className={areaCls} />
              </Field>
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
            {pubType === "product" && (
              <div>
                <p className={labelCls}>Price</p>
                <div className="mt-1.5 flex gap-2">
                  {(["paid", "contact"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setPriceMode(m)} className={`h-10 flex-1 rounded-xl text-[13px] font-medium capitalize ring-1 ${priceMode === m ? "bg-omniv-gold/15 text-omniv-gold ring-omniv-gold/40" : "text-zinc-400 ring-white/10"}`}>{m}</button>
                  ))}
                </div>
              </div>
            )}
            {pubType === "event" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date *"><input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} /></Field>
                  <Field label="Time"><input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="9:00 AM" className={inputCls} /></Field>
                </div>
                <Field label="Location *"><input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, venue" className={inputCls} /></Field>
              </>
            )}
            {pubType === "opportunity" && (
              <>
                <Field label="Type">
                  <select value={oppType} onChange={(e) => setOppType(e.target.value)} className={inputCls}>
                    <option value="Funding">Funding</option>
                    <option value="Job">Job</option>
                    <option value="Grant">Grant</option>
                    <option value="Collaboration">Collaboration</option>
                  </select>
                </Field>
                <Field label="Deadline"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} /></Field>
                <Field label="Requirements"><textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} className={areaCls} /></Field>
              </>
            )}
            {(pubType === "product" || pubType === "event" || pubType === "announcement") && (
              <Field label="Link / CTA"><input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="https://…" className={inputCls} /></Field>
            )}
            <Field label="Tags"><input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI, Africa, Language" className={inputCls} /></Field>
            {savedAgo && <p className="text-center text-[11px] text-zinc-600">{savedAgo}</p>}
            <button type="submit" className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black">Preview</button>
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
