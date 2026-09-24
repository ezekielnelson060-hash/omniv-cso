import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContactForm } from "@/components/discovery/contact-form";
import { FollowButton } from "@/components/discovery/follow-button";
import { SaveButton } from "@/components/discovery/save-button";
import { PublicationCard } from "@/components/discovery/publication-card";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { getDiscoveryEntity, listLivePublications } from "@/lib/discovery/db";
import { publicationsByPublisher } from "@/lib/discovery/seed";
import {
  ENTITY_TYPES,
  INTENT_LABELS,
  entityPath,
  type Publication,
  type PublicationType,
} from "@/lib/discovery/types";

type Props = {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  const supabase = await tryClient();
  const e = await getDiscoveryEntity(supabase, type, slug);
  if (!e) return { title: "Not found" };
  return { title: e.name, description: e.tagline };
}

export default async function EntityPage({ params, searchParams }: Props) {
  const { type, slug } = await params;
  const { tab } = await searchParams;
  if (!(ENTITY_TYPES as readonly string[]).includes(type)) notFound();

  const supabase = await tryClient();
  const e = await getDiscoveryEntity(supabase, type, slug);
  if (!e) notFound();

  const seedPubs = publicationsByPublisher(e.id);
  const liveAll = await listLivePublications(supabase, 80);
  const livePubs = liveAll.filter(
    (p) =>
      p.publisherId === e.id ||
      p.publisherId === e.slug ||
      (p as Publication & { publisherName?: string }).publisherId === e.name
  );
  // Prefer live by publisher_name match when publisherId is uuid
  const byName = liveAll.filter(
    (p) =>
      (p as { publisherName?: string }).publisherName?.toLowerCase() ===
      e.name.toLowerCase()
  );
  const pubsMap = new Map<string, Publication>();
  for (const p of [...seedPubs, ...livePubs, ...byName]) {
    pubsMap.set(p.slug || p.id, p);
  }
  const pubs = Array.from(pubsMap.values()).sort(
    (a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "")
  );

  const activeTab = tab ?? "overview";

  const tabs: { id: string; label: string; types?: PublicationType[] }[] = [
    { id: "overview", label: "Overview" },
    { id: "posts", label: "Posts", types: ["article", "announcement"] },
    { id: "research", label: "Research", types: ["research", "file"] },
    { id: "products", label: "Products", types: ["product"] },
    { id: "media", label: "Media", types: ["music", "video"] },
    {
      id: "more",
      label: "More",
      types: ["opportunity", "event"],
    },
    { id: "about", label: "About" },
  ];

  const filtered =
    activeTab === "overview" || activeTab === "about"
      ? pubs
      : pubs.filter((p) =>
          tabs.find((t) => t.id === activeTab)?.types?.includes(p.type)
        );

  const initial = e.name.slice(0, 1).toUpperCase();
  const path = entityPath(e);

  const counts = {
    posts: pubs.filter((p) => p.type === "article" || p.type === "announcement")
      .length,
    products: pubs.filter((p) => p.type === "product").length,
    research: pubs.filter((p) => p.type === "research" || p.type === "file")
      .length,
    events: pubs.filter((p) => p.type === "event").length,
  };

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-omniv-gold/30 via-zinc-900 to-black sm:h-48">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,200,50,0.22),transparent_55%)]" />
          <Link
            href="/explore"
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            aria-label="Back"
          >
            ←
          </Link>
          <div className="absolute right-4 top-4 flex gap-1">
            <SaveButton type={e.type} slug={e.slug} name={e.name} variant="icon" />
            <Link
              href="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-zinc-300 backdrop-blur-sm"
              aria-label="Profile"
            >
              ·
            </Link>
          </div>
        </div>

        <main className="relative mx-auto max-w-lg px-4 pb-28 md:max-w-2xl md:px-6">
          <div className="-mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-omniv-gold to-amber-700 text-3xl font-semibold text-black ring-4 ring-[#050505]">
              {initial}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 sm:mb-1 sm:mt-0">
              <FollowButton type={e.type} slug={e.slug} name={e.name} id={e.id} />
              <a
                href="#contact"
                className="inline-flex h-10 items-center rounded-full bg-transparent px-5 text-[13px] font-medium text-white ring-1 ring-white/20"
              >
                Contact
              </a>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            {e.name}
          </h1>
          <p className="mt-1 text-[14px] text-zinc-400">{e.tagline}</p>
          {e.location && (
            <p className="mt-1.5 text-[13px] text-zinc-500">📍 {e.location}</p>
          )}

          {/* Stat row — mockup style */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {(
              [
                { n: counts.posts, label: "Posts" },
                { n: counts.products, label: "Products" },
                { n: counts.research, label: "Research" },
                { n: counts.events, label: "Events" },
              ] as const
            ).map((c) => (
              <div
                key={c.label}
                className="rounded-xl bg-white/[0.03] py-2.5 text-center ring-1 ring-white/[0.06]"
              >
                <p className="text-[16px] font-semibold text-white">{c.n}</p>
                <p className="text-[11px] text-zinc-500">{c.label}</p>
              </div>
            ))}
          </div>

          {e.intents.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {e.intents.map((i) => (
                <span
                  key={i.kind + (i.detail ?? "")}
                  className="rounded-full bg-omniv-gold/10 px-3 py-1 text-[12px] text-omniv-gold ring-1 ring-omniv-gold/30"
                >
                  {INTENT_LABELS[i.kind]}
                  {i.detail ? ` · ${i.detail}` : ""}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={t.id === "overview" ? path : `${path}?tab=${t.id}`}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  activeTab === t.id
                    ? "bg-omniv-gold text-black"
                    : "text-zinc-500 ring-1 ring-white/12 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {activeTab === "about" ? (
            <div className="mt-6 space-y-6">
              <p className="text-[15px] leading-relaxed text-zinc-300">{e.about}</p>
              {e.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {e.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/[0.04] px-3 py-1 text-[12px] text-zinc-500 ring-1 ring-white/[0.06]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {e.links?.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[14px] text-omniv-gold hover:underline"
                >
                  {l.label} →
                </a>
              ))}
              <div id="contact" className="pt-4">
                <ContactForm entityName={e.name} entityPath={path} />
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                {activeTab === "overview" ? "Latest" : tabs.find((t) => t.id === activeTab)?.label}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((p) => (
                  <PublicationCard key={p.id} pub={p} />
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="py-12 text-center text-[14px] text-zinc-500">
                  Nothing in this tab yet.
                </p>
              )}
              <div id="contact" className="pt-8">
                <ContactForm entityName={e.name} entityPath={path} />
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
