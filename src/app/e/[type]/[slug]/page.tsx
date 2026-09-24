import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NetworkHeader } from "@/components/discovery/network-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/discovery/contact-form";
import { FollowButton } from "@/components/discovery/follow-button";
import { SaveButton } from "@/components/discovery/save-button";
import { PublicationCard } from "@/components/discovery/publication-card";
import { getDiscoveryEntity } from "@/lib/discovery/db";
import { publicationsByPublisher } from "@/lib/discovery/seed";
import {
  ENTITY_LABELS,
  ENTITY_TYPES,
  INTENT_LABELS,
  entityPath,
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

  const pubs = publicationsByPublisher(e.id);
  const activeTab = tab ?? "latest";

  const tabs: { id: string; label: string; types?: PublicationType[] }[] = [
    { id: "latest", label: "Latest" },
    { id: "articles", label: "Articles", types: ["article"] },
    { id: "products", label: "Products", types: ["product"] },
    { id: "research", label: "Research", types: ["research", "file"] },
    { id: "media", label: "Media", types: ["music", "video"] },
    {
      id: "opportunities",
      label: "Opportunities",
      types: ["opportunity", "event", "announcement"],
    },
    { id: "about", label: "About" },
  ];

  const filtered =
    activeTab === "latest" || activeTab === "about"
      ? pubs
      : pubs.filter((p) =>
          tabs.find((t) => t.id === activeTab)?.types?.includes(p.type)
        );

  const initial = e.name.slice(0, 1).toUpperCase();
  const path = entityPath(e);

  const counts = {
    posts: pubs.length,
    products: pubs.filter((p) => p.type === "product").length,
    research: pubs.filter((p) => p.type === "research" || p.type === "file")
      .length,
    events: pubs.filter((p) => p.type === "event").length,
  };

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10">
        <Link
          href="/explore"
          className="text-[12px] text-zinc-500 hover:text-omniv-gold"
        >
          ← Explore
        </Link>

        <div className="mt-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-omniv-gold/50 to-zinc-800 text-3xl font-semibold text-white ring-2 ring-white/10 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-2xl">
            {initial}
          </div>
          <div className="mt-4 min-w-0 sm:ml-4 sm:mt-0">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {e.name}
            </h1>
            <p className="mt-1 text-[15px] text-zinc-400">{e.tagline}</p>
            {e.location && (
              <p className="mt-1.5 text-[13px] text-zinc-500">
                📍 {e.location}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <FollowButton type={e.type} slug={e.slug} name={e.name} id={e.id} />
          <a
            href="#contact"
            className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-[13px] font-medium text-white transition hover:border-white/35"
          >
            Contact
          </a>
          <SaveButton type={e.type} slug={e.slug} name={e.name} variant="icon" />
        </div>

        <div className="mt-8 flex justify-center gap-8 border-y border-white/10 py-4 sm:justify-start sm:gap-10">
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{counts.posts}</p>
            <p className="text-[11px] text-zinc-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{counts.products}</p>
            <p className="text-[11px] text-zinc-500">Products</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{counts.research}</p>
            <p className="text-[11px] text-zinc-500">Research</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{counts.events}</p>
            <p className="text-[11px] text-zinc-500">Events</p>
          </div>
        </div>

        {e.intents.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {e.intents.map((i) => (
              <span
                key={i.kind + (i.detail ?? "")}
                className="rounded-full border border-omniv-gold/35 bg-omniv-gold/10 px-3 py-1 text-[12px] text-omniv-gold"
              >
                {INTENT_LABELS[i.kind]}
                {i.detail ? ` · ${i.detail}` : ""}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`${path}?tab=${t.id}`}
              className={`shrink-0 border-b-2 px-3 py-2 text-[13px] transition ${
                activeTab === t.id
                  ? "border-omniv-gold text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {activeTab === "about" ? (
          <div className="mt-8 space-y-6">
            <p className="text-[15px] leading-relaxed text-zinc-300">{e.about}</p>
            {e.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {e.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-zinc-500"
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
            <div id="contact" className="border-t border-white/10 pt-8">
              <ContactForm entityName={e.name} entityPath={path} />
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {filtered.map((p) => (
              <PublicationCard key={p.id} pub={p} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-12 text-center text-[14px] text-zinc-500">
                No {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}{" "}
                yet.
              </p>
            )}
          </div>
        )}

        {activeTab !== "about" && (
          <div id="contact" className="mt-12 border-t border-white/10 pt-8">
            <ContactForm entityName={e.name} entityPath={path} />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
