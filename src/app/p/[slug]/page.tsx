import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getLivePublication } from "@/lib/discovery/db";
import { PUBLICATION_LABELS, publicationPath } from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";
import { publicationMetadata } from "@/lib/discovery/seo";

type Props = { params: Promise<{ slug: string }> };

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
    if (!p) return { title: "Not found" };
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
  const typeLabel =
    PUBLICATION_LABELS[p.type as keyof typeof PUBLICATION_LABELS] ||
    p.type ||
    "Publication";
  const coverUrl = p.coverUrl || coverFor(p.slug) || null;
  const publisherName = p.publisherName || "Publisher";

  // Render body as plain paragraphs from body or summary only (no content JSON)
  const bodyText =
    (typeof p.body === "string" && p.body) ||
    (typeof p.summary === "string" && p.summary) ||
    "";
  const paragraphs = bodyText
    .split(/\n\n+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/95 backdrop-blur">
          <div className="mx-auto flex h-12 max-w-2xl items-center gap-3 px-4">
            <Link
              href="/home"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              ←
            </Link>
            <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white">
              {p.title}
            </p>
          </div>
        </header>

        {coverUrl ? (
          <div
            className="h-48 w-full bg-cover bg-center sm:h-64"
            style={{ backgroundImage: `url(${coverUrl})` }}
          />
        ) : null}

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {typeLabel}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-white sm:text-[36px]">
            {p.title}
          </h1>
          <p className="mt-3 text-[14px] text-zinc-400">
            {publisherName}
            {p.publishedAt ? ` · ${String(p.publishedAt).slice(0, 10)}` : ""}
          </p>

          {p.excerpt || p.subtitle ? (
            <p className="mt-6 text-[18px] leading-relaxed text-zinc-200">
              {p.excerpt || p.subtitle}
            </p>
          ) : null}

          <div className="mt-8 space-y-5">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-[17px] leading-[1.8] text-zinc-300"
                >
                  {para}
                </p>
              ))
            ) : (
              <p className="text-[15px] text-zinc-500">
                Full article content is loading from the network. If this stays
                empty, the piece may only have a summary in the database.
              </p>
            )}
          </div>

          <div className="mt-12 flex gap-3">
            <Link
              href="/home"
              className="inline-flex h-11 items-center rounded-full bg-white/[0.08] px-5 text-[14px] font-medium text-white"
            >
              Back to Home
            </Link>
            <Link
              href={path}
              className="inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
            >
              Refresh
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
