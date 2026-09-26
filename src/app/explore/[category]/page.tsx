import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicationCard } from "@/components/discovery/publication-card";
import { StructuredData } from "@/components/StructuredData";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { listLivePublications } from "@/lib/discovery/db";
import { getDiscoveryCategory, DISCOVERY_CATEGORIES } from "@/lib/discovery/seo";
import { publicationPath } from "@/lib/discovery/types";

type Props = { params: Promise<{ category: string }> };

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return DISCOVERY_CATEGORIES.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const item = getDiscoveryCategory(category);
  if (!item) return { title: "Category not found" };
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media").replace(/\/$/, "");
  const url = `${origin}/explore/${item.slug}`;
  return {
    title: `${item.label} — Explore | Omniv`,
    description: item.description,
    alternates: { canonical: url },
    openGraph: { title: `${item.label} — Explore | Omniv`, description: item.description, url, type: "website" },
    twitter: { card: "summary", title: `${item.label} — Explore | Omniv`, description: item.description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const item = getDiscoveryCategory(category);
  if (!item) notFound();
  const publications = (await listLivePublications(await tryClient(), 200)).filter(
    (publication) => publication.category?.toLowerCase() === item.slug
  );
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media").replace(/\/$/, "");
  const url = `${origin}/explore/${item.slug}`;
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${item.label} — Explore | Omniv`,
    description: item.description,
    url,
    isPartOf: { "@type": "WebSite", name: "Omniv", url: origin },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: publications.length,
      itemListElement: publications.map((publication, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${origin}${publicationPath(publication)}`,
        name: publication.title,
      })),
    },
  };

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <StructuredData id={`category-${item.slug}`} data={collectionLd} />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-16 md:px-6">
          <Link href="/explore" className="text-[12px] text-zinc-600 hover:text-omniv-gold">← Explore all</Link>
          <header className="mt-8 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-omniv-gold">Omniv category</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">{item.label}</h1>
            <p className="mt-5 text-[16px] leading-relaxed text-zinc-400">{item.description}</p>
          </header>
          <section className="mt-12" aria-labelledby="category-publications">
            <div className="flex items-center justify-between gap-4">
              <h2 id="category-publications" className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Publications in {item.label}</h2>
              <span className="text-[12px] text-zinc-700">{publications.length} published</span>
            </div>
            {publications.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {publications.map((publication) => <PublicationCard key={publication.id} pub={publication} />)}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl bg-white/[0.03] p-6 text-[14px] text-zinc-500 ring-1 ring-white/[0.07]">There are no published pieces in this category yet. Explore the wider network for the next thread.</p>
            )}
          </section>
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
