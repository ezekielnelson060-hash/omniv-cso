"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { CoverUpload } from "@/components/discovery/cover-upload";
import {
  PUBLICATION_LABELS,
  type PublicationType,
} from "@/lib/discovery/types";

const GROUPS: {
  label: string;
  types: PublicationType[];
}[] = [
  {
    label: "Content",
    types: ["article", "music", "video", "research"],
  },
  {
    label: "Things",
    types: ["product", "event", "file"],
  },
  {
    label: "Signals",
    types: ["announcement", "opportunity"],
  },
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

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
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
  const [publishedPath, setPublishedPath] = useState("");
  const [copied, setCopied] = useState(false);

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
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md"
              />
            )}
            <span className="text-[15px] font-semibold text-white">
              {step === "done" ? "Published" : step === "pick" ? "Create" : formTitle}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {step === "form" && pubType && (
              <span className="text-[12px] text-zinc-600">
                {TYPE_INDEX[pubType]}/9
              </span>
            )}
            {step !== "done" && (
              <Link
                href="/home"
                className="text-[13px] text-zinc-500 hover:text-white"
              >
                Cancel
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-5 md:max-w-2xl">
        {step === "pick" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Create
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Share your work with the world.
            </p>

            {GROUPS.map((g) => (
              <div key={g.label} className="mt-8">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  {g.label}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {g.types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => pickType(t)}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-white/[0.03] px-2 py-5 ring-1 ring-white/[0.08] transition hover:bg-omniv-gold/5 hover:ring-omniv-gold/35"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-xl text-zinc-300">
                        {TYPE_ICONS[t]}
                      </span>
                      <span className="text-[12px] font-medium text-zinc-300">
                        {PUBLICATION_LABELS[t]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <p className="mt-10 text-center text-[13px] text-zinc-600">
              Already published?{" "}
              <Link href="/explore" className="text-omniv-gold hover:underline">
                Explore the network
              </Link>
            </p>
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center pt-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-omniv-gold/20 text-2xl text-omniv-gold">
              ✓
            </div>
            <h2 className="mt-6 text-xl font-semibold text-white">
              Published to Omniv
            </h2>
            <p className="mt-3 max-w-sm text-[16px] leading-snug text-zinc-300">
              {title}
            </p>
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

        {step === "form" && pubType && (
          <form onSubmit={onSubmit} className="space-y-5">
            <CoverUpload
              label="Cover image"
              value={coverUrl}
              onChange={setCoverUrl}
            />

            <Field label="Title *">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className={inputCls}
              />
            </Field>

            {(pubType === "article" || pubType === "announcement") && (
              <Field label="Body *">
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder="Write…"
                  className={areaCls}
                />
              </Field>
            )}

            {pubType !== "article" && pubType !== "announcement" && (
              <Field label="Description *">
                <textarea
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  placeholder="Summary…"
                  className={areaCls}
                />
              </Field>
            )}

            {pubType === "music" && (
              <>
                <Field label="Genre">
                  <input
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Afrobeats"
                    className={inputCls}
                  />
                </Field>
                <Field label="Release date">
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </>
            )}

            {pubType === "product" && (
              <div>
                <p className={labelCls}>Price</p>
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceMode("paid")}
                    className={`h-10 flex-1 rounded-xl text-[13px] font-medium ring-1 ${
                      priceMode === "paid"
                        ? "bg-omniv-gold/15 text-omniv-gold ring-omniv-gold/40"
                        : "text-zinc-400 ring-white/10"
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceMode("contact")}
                    className={`h-10 flex-1 rounded-xl text-[13px] font-medium ring-1 ${
                      priceMode === "contact"
                        ? "bg-omniv-gold/15 text-omniv-gold ring-omniv-gold/40"
                        : "text-zinc-400 ring-white/10"
                    }`}
                  >
                    Contact
                  </button>
                </div>
              </div>
            )}

            {pubType === "event" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date *">
                    <input
                      required
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Time">
                    <input
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="9:00 AM"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Location *">
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, venue"
                    className={inputCls}
                  />
                </Field>
              </>
            )}

            {pubType === "opportunity" && (
              <>
                <Field label="Type">
                  <select
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Funding">Funding</option>
                    <option value="Job">Job</option>
                    <option value="Grant">Grant</option>
                    <option value="Collaboration">Collaboration</option>
                  </select>
                </Field>
                <Field label="Deadline">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Requirements">
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={3}
                    className={areaCls}
                  />
                </Field>
              </>
            )}

            {(pubType === "product" ||
              pubType === "event" ||
              pubType === "announcement") && (
              <Field label="Link / CTA">
                <input
                  value={ctaHref}
                  onChange={(e) => setCtaHref(e.target.value)}
                  placeholder="https://…"
                  className={inputCls}
                />
              </Field>
            )}

            <Field label="Publishing as *">
              <input
                required
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                placeholder="Your name, brand, or company"
                className={inputCls}
              />
              <p className="mt-1.5 text-[12px] text-zinc-600">
                This publication will appear on this profile.
              </p>
            </Field>

            <Field label="Tags">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Africa, Language"
                className={inputCls}
              />
            </Field>

            {error && (
              <p className="text-[13px] text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Publishing…" : "Publish"}
            </button>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

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
