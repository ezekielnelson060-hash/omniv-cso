"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { CoverUpload } from "@/components/discovery/cover-upload";
import {
  PUBLICATION_LABELS,
  PUBLICATION_TYPES,
  type PublicationType,
} from "@/lib/discovery/types";

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
  "mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[14px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/40";
const labelCls = "text-[12px] font-medium text-zinc-400";
const areaCls =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/40";

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "form">("pick");
  const [pubType, setPubType] = useState<PublicationType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [tags, setTags] = useState("");
  const [meta, setMeta] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
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
  const [fileType, setFileType] = useState("Documentation");
  const [visibility, setVisibility] = useState("Public");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftMsg, setDraftMsg] = useState(false);

  function pickType(t: PublicationType) {
    setPubType(t);
    setStep("form");
    setError(null);
    setTitle("");
    setSummary("");
    setBody("");
    setPublisherName("");
    setTags("");
    setMeta("");
    setCtaLabel("");
    setCtaHref("");
    setGenre("");
    setReleaseDate("");
    setCategory("");
    setEventDate("");
    setEventTime("");
    setLocation("");
    setOppType("Funding");
    setDeadline("");
    setRequirements("");
    setFileType("Documentation");
    setVisibility("Public");
    setCoverUrl(null);
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
    } else if (pubType === "file") {
      if (fileType) parts.push(fileType);
      if (visibility) parts.push(visibility);
    } else if (pubType === "research" && category) {
      parts.push(category);
    } else if (meta) {
      parts.push(meta);
    }
    return parts.filter(Boolean).join(" · ") || meta;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            (ctaHref ? `\n\nCTA: ${ctaLabel || "Link"} — ${ctaHref}` : ""),
          publisherName: publisherName || "Publisher",
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
      router.push(data.path || "/explore");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function saveDraft() {
    setDraftMsg(true);
    setTimeout(() => setDraftMsg(false), 2000);
  }

  const formTitle = pubType
    ? `Create ${PUBLICATION_LABELS[pubType]}`
    : "Create";

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
          <div className="flex items-center gap-2">
            {step === "form" ? (
              <button
                type="button"
                onClick={() => setStep("pick")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white"
                aria-label="Back"
              >
                ←
              </button>
            ) : (
              <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md" />
            )}
            <span className="text-[15px] font-semibold text-white">
              {step === "pick" ? "Create" : formTitle}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {step === "form" && pubType && (
              <span className="text-[12px] text-zinc-600">{TYPE_INDEX[pubType]}/9</span>
            )}
            <Link href="/home" className="text-[13px] text-zinc-500 hover:text-white">
              Cancel
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-5 md:max-w-2xl">
        {step === "pick" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create</h1>
            <p className="mt-1 text-[14px] text-zinc-500">Share your work with the world.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {PUBLICATION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => pickType(t)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-5 transition hover:border-omniv-gold/40 hover:bg-omniv-gold/5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-xl text-zinc-300">
                    {TYPE_ICONS[t]}
                  </span>
                  <span className="text-[12px] font-medium text-zinc-300">{PUBLICATION_LABELS[t]}</span>
                </button>
              ))}
            </div>
            <p className="mt-10 text-center text-[13px] text-zinc-600">
              Already published?{" "}
              <Link href="/explore" className="text-omniv-gold hover:underline">
                Explore the network
              </Link>
            </p>
          </>
        )}

        {step === "form" && pubType && (
          <form onSubmit={onSubmit} className="space-y-5">
            {pubType === "article" && (
              <>
                <Field label="Article title *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Why African language AI is becoming an infrastructure problem" className={inputCls} />
                </Field>
                <CoverUpload label="Change cover image" value={coverUrl} onChange={setCoverUrl} />
                <Field label="Article body *">
                  <Toolbar />
                  <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Write your article…" className={areaCls} />
                </Field>
                <TagsField value={tags} onChange={setTags} />
                <Field label="Publisher">
                  <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Your name or brand" className={inputCls} />
                </Field>
              </>
            )}

            {pubType === "music" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <CoverUpload label="Change cover" tall value={coverUrl} onChange={setCoverUrl} />
                  <UploadZone icon="♪" title="Upload audio" hint="MP3, WAV, FLAC · Max 100MB" />
                </div>
                <Field label="Track title *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Better Days" className={inputCls} />
                </Field>
                <Field label="Artist / Publisher *">
                  <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Artist name" className={inputCls} />
                </Field>
                <Field label="Genre">
                  <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Afrobeats" className={inputCls} />
                </Field>
                <Field label="Description">
                  <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="About this track…" className={areaCls} />
                </Field>
                <Field label="Release date">
                  <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className={inputCls} />
                </Field>
                <TagsField value={tags} onChange={setTags} />
              </>
            )}

            {pubType === "video" && (
              <>
                <CoverUpload label="Change thumbnail" video value={coverUrl} onChange={setCoverUrl} />
                <Field label="Video title *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" className={inputCls} />
                </Field>
                <Field label="Description *">
                  <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Description…" className={areaCls} />
                </Field>
                <Field label="Publisher">
                  <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Studio or name" className={inputCls} />
                </Field>
                <TagsField value={tags} onChange={setTags} />
              </>
            )}

            {pubType === "research" && (
              <>
                <UploadZone icon="PDF" title="Upload report" hint="PDF · DOCX · Max 50MB" compact />
                <Field label="Title *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Research title" className={inputCls} />
                </Field>
                <Field label="Abstract / Summary *">
                  <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="Abstract…" className={areaCls} />
                </Field>
                <Field label="Authors / Publisher *">
                  <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Authors" className={inputCls} />
                </Field>
                <Field label="Category">
                  <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="AI & Research" className={inputCls} />
                </Field>
                <TagsField value={tags} onChange={setTags} />
              </>
            )}

            {pubType === "product" && (
              <>
                <CoverUpload label="Change image" value={coverUrl} onChange={setCoverUrl} />
                <Field label="Product name *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product name" className={inputCls} />
                </Field>
                <Field label="Short description *">
                  <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="What it does…" className={areaCls} />
                </Field>
                <div>
                  <p className={labelCls}>Price</p>
                  <div className="mt-1.5 flex gap-2">
                    <button type="button" onClick={() => setPriceMode("paid")} className={`h-10 flex-1 rounded-xl border text-[13px] font-medium ${priceMode === "paid" ? "border-omniv-gold bg-omniv-gold/15 text-omniv-gold" : "border-white/10 text-zinc-400"}`}>Paid</button>
                    <button type="button" onClick={() => setPriceMode("contact")} className={`h-10 flex-1 rounded-xl border text-[13px] font-medium ${priceMode === "contact" ? "border-omniv-gold bg-omniv-gold/15 text-omniv-gold" : "border-white/10 text-zinc-400"}`}>Contact</button>
                  </div>
                </div>
                <Field label="Website / CTA">
                  <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="https://…" className={inputCls} />
                </Field>
                <Field label="Category">
                  <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Developer Tools" className={inputCls} />
                </Field>
                <Field label="Publisher *">
                  <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Company" className={inputCls} />
                </Field>
              </>
            )}

            {pubType === "event" && (
              <>
                <CoverUpload label="Change image" value={coverUrl} onChange={setCoverUrl} />
                <Field label="Event name *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event name" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date *">
                    <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Time">
                    <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="9:00 AM – 6:00 PM" className={inputCls} />
                  </Field>
                </div>
                <Field label="Location *">
                  <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, venue" className={inputCls} />
                </Field>
                <Field label="Description *">
                  <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="About the event…" className={areaCls} />
                </Field>
                <Field label="Ticket / Registration link">
                  <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="https://…" className={inputCls} />
                </Field>
                <Field label="Organizer *">
                  <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Organizer" className={inputCls} />
                </Field>
              </>
            )}

            {pubType === "announcement" && (
              <>
                <CoverUpload label="Change image" value={coverUrl} onChange={setCoverUrl} />
                <Field label="Title *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" className={inputCls} />
                </Field>
                <Field label="Content *">
                  <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Announcement body…" className={areaCls} />
                </Field>
                <Field label="Publisher *">
                  <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Publisher" className={inputCls} />
                </Field>
                <Field label="Optional CTA">
                  <div className="mt-1.5 flex gap-2">
                    <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="CTA label" className={`${inputCls} mt-0 flex-1`} />
                    <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="https://…" className={`${inputCls} mt-0 flex-1`} />
                  </div>
                </Field>
              </>
            )}

            {pubType === "opportunity" && (
              <>
                <CoverUpload label="Change image" value={coverUrl} onChange={setCoverUrl} />
                <Field label="Title *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Opportunity title" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type">
                    <select value={oppType} onChange={(e) => setOppType(e.target.value)} className={inputCls}>
                      <option value="Funding">Funding</option>
                      <option value="Hiring">Hiring</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Open call">Open call</option>
                    </select>
                  </Field>
                  <Field label="Organization *">
                    <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Organization" className={inputCls} />
                  </Field>
                </div>
                <Field label="Description *">
                  <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Details…" className={areaCls} />
                </Field>
                <Field label="Deadline">
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Requirements">
                  <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={2} placeholder="Requirements…" className={areaCls} />
                </Field>
              </>
            )}

            {pubType === "file" && (
              <>
                <UploadZone icon="↑" title="Drop file here or tap to upload" hint="PDF, DOCX, XLSX, ZIP (Max 100MB)" />
                <Field label="File name *">
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="File name" className={inputCls} />
                </Field>
                <Field label="Description">
                  <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Description…" className={areaCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="File type">
                    <select value={fileType} onChange={(e) => setFileType(e.target.value)} className={inputCls}>
                      <option>Documentation</option>
                      <option>Report</option>
                      <option>Dataset</option>
                      <option>Template</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Publisher *">
                    <input required value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="Publisher" className={inputCls} />
                  </Field>
                </div>
                <TagsField value={tags} onChange={setTags} />
                <Field label="Visibility">
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className={inputCls}>
                    <option>Public</option>
                    <option>Unlisted</option>
                  </select>
                </Field>
              </>
            )}

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-300">{error}</p>
            )}

            <div className="fixed inset-x-0 bottom-14 z-40 border-t border-white/5 bg-[#050505]/95 px-4 py-3 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
              <div className="mx-auto flex max-w-lg items-center gap-3 md:max-w-none">
                <button type="button" onClick={saveDraft} className="text-[12px] text-zinc-500 hover:text-zinc-300">
                  {draftMsg ? "Draft saved" : "Saved as draft"}
                </button>
                <button type="submit" disabled={loading} className="ml-auto h-11 min-w-[120px] rounded-full bg-omniv-gold px-8 text-[14px] font-semibold text-black shadow-lg shadow-omniv-gold/15 disabled:opacity-60">
                  {loading ? "Publishing…" : "Publish"}
                </button>
              </div>
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
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function TagsField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Tags">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="AI, Africa, Technology" className={inputCls} />
      <p className="mt-1 text-[11px] text-zinc-600">Comma-separated</p>
    </Field>
  );
}

function UploadZone({
  icon,
  title,
  hint,
  compact,
}: {
  icon: string;
  title: string;
  hint: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-center ${
        compact ? "px-4 py-4" : "px-4 py-8"
      }`}
    >
      <span className="text-2xl text-zinc-500">{icon}</span>
      <p className="mt-2 text-[13px] font-medium text-zinc-300">{title}</p>
      <p className="mt-1 text-[11px] text-zinc-600">{hint}</p>
    </div>
  );
}

function Toolbar() {
  return (
    <div className="mt-1.5 flex gap-1 rounded-t-xl border border-b-0 border-white/10 bg-white/[0.03] px-2 py-1.5 text-[12px] text-zinc-500">
      {"B I U · ≡ ☰ 🔗".split(" ").map((t) => (
        <span key={t} className="px-1.5">{t}</span>
      ))}
    </div>
  );
}
