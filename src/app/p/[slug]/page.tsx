import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getLivePublication } from "@/lib/discovery/db";
import {
  PUBLICATION_LABELS,
  publicationPath,
} from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";
import { publicationMetadata } from "@/lib/discovery/seo";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";
import { isAlwaysVerified } from "@/components/discovery/verified-badge";

type Props = { params: Promise<{ slug: string }> };

const HERO: Record<string, string> = {
  article: "from-sky-800 via-slate-900 to-[#050505]",
  music: "from-fuchsia-800 via-purple-950 to-[#050505]",
  video: "from-rose-800 via-red-950 to-[#050505]",
  research: "from-emerald-800 via-teal-950 to-[#050505]",
  product: "from-amber-700 via-orange-950 to-[#050505]",
  event: "from-violet-800 via-indigo-950 to-[#050505]",
  announcement: "from-zinc-700 via-zinc-900 to-[#050505]",
  opportunity: "from-yellow-700 via-yellow-950 to-[#050505]",
  file: "from-cyan-800 via-slate-900 to-[#050505]",
};

function readMinutes(text: string) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function paragraphsFrom(body?: string, summary?: string, excerpt?: string) {
  const source =
    (typeof body === "string" && body.trim()) ||
    (typeof summary === "string" && summary.trim()) ||
    "";
  if (!source) return [] as string[];
  return source
    .split(/\n\n+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    let supabase = null;
    try {
      supabase = await createClient();
    } catch {
      /* */
    }
    const p = await getLivePublication(supabase, slug);
    if (!p)
      return { title: "Not found", robots: { index: false, follow: false } };
    return publicationMetadata(p);
  } catch {
    return { title: "Omniv" };
  }
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;

  let supabase = null;
  try {
    supabase = await createClient();
  } catch {
    /* */
  }

  const p = await getLivePublication(supabase, slug);
  if (!p) notFound();

  const path = publicationPath({ slug: p.slug, type: p.type });
  const publisherName = p.publisherName || "Publisher";
  const publisherHref = resolvePublisherPath({
    name: publisherName,
    publisherId: p.publisherId,
  });
  const showVerified = isAlwaysVerified({ name: publisherName });
  const typeLabel =
    PUBLICATION_LABELS[p.type as keyof typeof PUBLICATION_LABELS] ||
    p.type ||
    "Publication";
  const coverUrl = p.coverUrl || coverFor(p.slug) || null;
  const hero = HERO[p.type] || "from-zinc-800 to-[#050505]";
  const bodyText =
    (typeof p.body === "string" && p.body) || p.summary || "";
  const mins = p.readingTime || readMinutes(bodyText);

  let publishedLabel = "";
  if (p.publishedAt) {
    try {
      publishedLabel = new Date(p.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      publishedLabel = String(p.publishedAt).slice(0, 10);
    }
  }

  // Build body blocks from content JSON or plain body — never throw
  const blocks: { type: string; text: string }[] = [];
  try {
    if (Array.isArray(p.content) && p.content.length) {
      for (const b of p.content) {
        if (!b || typeof b !== "object") continue;
        const type = String((b as { type?: unknown }).type || "paragraph");
        const text = (b as { text?: unknown }).text;
        if (type === "divider") {
          blocks.push({ type: "divider", text: "" });
          continue;
        }
        if (typeof text === "string" && text.trim()) {
          blocks.push({ type, text });
        }
      }
    }
  } catch {
    /* ignore */
  }
  if (!blocks.length) {
    for (const para of paragraphsFrom(p.body, p.summary)) {
      if (para.startsWith("## "))
        blocks.push({ type: "heading", text: para.slice(3) });
      else if (para.startsWith("> "))
        blocks.push({ type: "quote", text: para.slice(2) });
      else blocks.push({ type: "paragraph", text: para });
    }
  }

  // Don't repeat excerpt if it's the same as the first body block
  const lead = p.excerpt || "";
  const leadNorm = lead.replace(/\s+/g, " ").trim().slice(0, 100);
  const firstNorm =
    blocks[0]?.text?.replace(/\s+/g, " ").trim().slice(0, 100) || "";
  const showLead = Boolean(lead) && leadNorm !== firstNorm;

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        {/* Sticky top bar */}
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/92 backdrop-blur-xl">
          <div className="mx-auto flex h-12 max-w-2xl items-center gap-3 px-4">
            <Link
              href="/home"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Back"
            >
              ←
            </Link>
            <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white">
              {p.title}
            </p>
          </div>
        </header>

        {/* Hero */}
        <div
          className={`relative min-h-[240px] bg-gradient-to-b ${hero} sm:min-h-[320px]`}
          style={
            coverUrl
              ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.55) 45%, #050505 100%), url(${coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }
              : undefined
          }
        >
          <div className="relative mx-auto flex min-h-[240px] max-w-2xl flex-col justify-end px-4 pb-8 pt-12 sm:min-h-[320px]">
            <span className="inline-flex w-fit items-center rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
              {typeLabel}
            </span>
            <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[40px]">
              {p.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-zinc-300">
              {publisherHref ? (
                <Link
                  href={publisherHref}
                  className="inline-flex items-center gap-1 font-medium hover:text-white"
                >
                  <span>{publisherName}</span>
                  {showVerified ? (
                    <span
                      className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-omniv-gold text-[9px] font-bold text-black"
                      title="Verified"
                    >
                      ✓
                    </span>
                  ) : null}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium">
                  <span>{publisherName}</span>
                  {showVerified ? (
                    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-omniv-gold text-[9px] font-bold text-black">
                      ✓
                    </span>
                  ) : null}
                </span>
              )}
              <span className="text-zinc-600">·</span>
              <span>{mins} min read</span>
              {publishedLabel ? (
                <>
                  <span className="text-zinc-600">·</span>
                  <span>{publishedLabel}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
          {showLead ? (
            <p className="text-[19px] font-medium leading-[1.75] text-zinc-200">
              {lead}
            </p>
          ) : null}

          {blocks.length > 0 ? (
            <div className={`space-y-7 ${showLead ? "mt-8" : ""}`}>
              {blocks.map((block, i) => {
                if (block.type === "divider") {
                  return (
                    <hr key={i} className="border-0 border-t border-white/10" />
                  );
                }
                if (
                  block.type === "heading" ||
                  block.type === "subheading"
                ) {
                  return (
                    <h2
                      key={i}
                      className="text-[22px] font-semibold leading-snug text-white"
                    >
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={i}
                      className="border-l-2 border-omniv-gold/60 pl-4 text-[17px] italic leading-relaxed text-zinc-300"
                    >
                      {block.text}
                    </blockquote>
                  );
                }
                return (
                  <p
                    key={i}
                    className="text-[17px] leading-[1.85] text-zinc-300"
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-[15px] text-zinc-500">
              No article body is stored for this publication yet.
            </p>
          )}

          {p.whatThisMeans ? (
            <section className="mt-16 border-t border-white/10 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
                What this means
              </p>
              <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">
                {p.whatThisMeans}
              </p>
            </section>
          ) : null}

          {p.questionNobodyAsks ? (
            <section className="mt-8 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/[0.06] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
                The question nobody asks
              </p>
              <p className="mt-3 text-[20px] font-medium leading-snug text-white">
                {p.questionNobodyAsks}
              </p>
            </section>
          ) : null}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/home"
              className="inline-flex h-11 items-center rounded-full bg-white/[0.08] px-5 text-[14px] font-medium text-white"
            >
              Back to Home
            </Link>
            <Link
              href="/publish"
              className="inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
            >
              Publish on Omniv
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
