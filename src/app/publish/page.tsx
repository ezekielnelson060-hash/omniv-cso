"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { PublishAsPicker } from "@/components/discovery/publish-as-picker";
import { ScheduleField } from "@/components/discovery/schedule-field";
import {
  GROUPS,
  TYPE_ICONS,
  TYPE_HEADLINES,
  inputCls,
  labelCls,
  PUBLICATION_LABELS,
} from "@/components/discovery/publish-constants";
import type { PublicationType } from "@/lib/discovery/types";
import { TypeSpecificFields } from "@/components/discovery/type-specific-fields";

function PublishInner() {
  const search = useSearchParams();
  const router = useRouter();
  const typeParam = search.get("type");
  const editParam = search.get("edit") || search.get("draft");
  const [step, setStep] = useState<"pick" | "form" | "done">(() =>
    editParam ? "form" : "pick"
  );
  const [pubType, setPubType] = useState<PublicationType | null>(null);
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [streamLinks, setStreamLinks] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [chapters, setChapters] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [doi, setDoi] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [buyLink, setBuyLink] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketLink, setTicketLink] = useState("");
  const [capacity, setCapacity] = useState("");
  const [oppType, setOppType] = useState("role");
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    const valid = [
      "article",
      "music",
      "video",
      "research",
      "product",
      "event",
      "opportunity",
      "announcement",
      "file",
      "image",
    ];
    if (typeParam && valid.includes(typeParam)) {
      setPubType(typeParam as PublicationType);
      setStep("form");
    }
  }, [typeParam]);

  useEffect(() => {
    const id = editParam;
    if (!id) return;
    setEditId(id);
    setStep("form");
    void (async () => {
      try {
        const res = await fetch(`/api/discovery/publications?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        const p = data.publications?.[0];
        if (!res.ok || !p) {
          setError(data.error || "Could not load this publication");
          return;
        }
        setPubType(p.type);
        setTitle(p.title || "");
        setSummary(p.summary || "");
        setBody(p.body || "");
        setPublisherName(p.publisherName || "");
        setPublisherId(p.publisherId || null);
        setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
        setCoverUrl(p.coverUrl || null);
        setMediaUrl(p.mediaUrl || null);
        setIsPrivate(p.visibility === "private");
      } catch {
        setError("Could not load this publication");
      }
    })();
  }, [editParam]);

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
  const [editId, setEditId] = useState<string | null>(null);

  async function onPublish() {
    if (!pubType || !title.trim()) {
      setError("Title required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editId ? { id: editId } : { type: pubType }),
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
          mediaUrl: mediaUrl || videoUrl || undefined,
          meta: JSON.stringify({
            genre,
            releaseDate,
            streamLinks,
            duration,
            videoUrl,
            chapters,
            authors,
            year,
            doi,
            price,
            currency,
            buyLink,
            eventDate,
            eventTime,
            venue,
            ticketLink,
            capacity,
            opportunityType: oppType,
            deadline,
            requirements,
            applyLink,
            location,
            caption,
            altText,
            subtitle,
          }),
          opportunityType: pubType === "opportunity" ? oppType : undefined,
          subtitle: subtitle || undefined,
          status: editId ? (scheduledAt ? "scheduled" : "published") : isPrivate ? "draft" : scheduledAt ? "scheduled" : "published",
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
        {editParam && !pubType && !error && (
          <div className="rounded-2xl bg-white/[0.04] px-4 py-5 text-[14px] text-zinc-400 ring-1 ring-white/[0.06]">
            Loading your publication editor…
          </div>
        )}
        {step === "pick" && !editParam && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              What do you want to publish?
            </h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Choose a format — each has its own editor.
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
                        router.replace(`/publish?type=${encodeURIComponent(t)}`);
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
              <div className="rounded-2xl bg-gradient-to-br from-omniv-gold/10 to-transparent px-4 py-3.5 ring-1 ring-omniv-gold/20">
                <p className="text-[15px] font-semibold text-white">{head.title}</p>
                <p className="mt-1 text-[13px] text-zinc-400">{head.sub}</p>
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
              <span className={labelCls}>
                {pubType === "music"
                  ? "Track title"
                  : pubType === "product"
                    ? "Product name"
                    : pubType === "event"
                      ? "Event name"
                      : "Title"}
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
                placeholder="Name this publication"
              />
            </label>

            <TypeSpecificFields
              pubType={pubType}
              summary={summary}
              setSummary={setSummary}
              body={body}
              setBody={setBody}
              coverUrl={coverUrl}
              setCoverUrl={setCoverUrl}
              mediaUrl={mediaUrl}
              setMediaUrl={setMediaUrl}
              subtitle={subtitle}
              setSubtitle={setSubtitle}
              genre={genre}
              setGenre={setGenre}
              releaseDate={releaseDate}
              setReleaseDate={setReleaseDate}
              streamLinks={streamLinks}
              setStreamLinks={setStreamLinks}
              duration={duration}
              setDuration={setDuration}
              videoUrl={videoUrl}
              setVideoUrl={setVideoUrl}
              chapters={chapters}
              setChapters={setChapters}
              authors={authors}
              setAuthors={setAuthors}
              year={year}
              setYear={setYear}
              doi={doi}
              setDoi={setDoi}
              price={price}
              setPrice={setPrice}
              currency={currency}
              setCurrency={setCurrency}
              buyLink={buyLink}
              setBuyLink={setBuyLink}
              eventDate={eventDate}
              setEventDate={setEventDate}
              eventTime={eventTime}
              setEventTime={setEventTime}
              venue={venue}
              setVenue={setVenue}
              ticketLink={ticketLink}
              setTicketLink={setTicketLink}
              capacity={capacity}
              setCapacity={setCapacity}
              oppType={oppType}
              setOppType={setOppType}
              deadline={deadline}
              setDeadline={setDeadline}
              requirements={requirements}
              setRequirements={setRequirements}
              applyLink={applyLink}
              setApplyLink={setApplyLink}
              location={location}
              setLocation={setLocation}
              caption={caption}
              setCaption={setCaption}
              altText={altText}
              setAltText={setAltText}
            />

            <label className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06]">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent accent-omniv-gold"
              />
              <span className="text-[13px] text-zinc-300">
                Private — only you can see this
              </span>
            </label>

            <label className="block">
              <span className={labelCls}>Tags (comma-separated)</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputCls}
                placeholder="music, lagos, independent"
              />
            </label>

            <ScheduleField
              value={scheduledAt}
              onChange={setScheduledAt}
              labelClassName={labelCls}
              inputClassName={inputCls}
            />

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
                    : `Publish ${PUBLICATION_LABELS[pubType]}`}
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
                  router.replace("/publish");
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

export default function PublishPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <PublishInner />
    </Suspense>
  );
}
