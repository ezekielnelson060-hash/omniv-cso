import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContactForm } from "@/components/discovery/contact-form";
import { StructuredData } from "@/components/StructuredData";
import { KeepExploring } from "@/components/discovery/keep-exploring";
import { FollowButton } from "@/components/discovery/follow-button";
import { SaveButton } from "@/components/discovery/save-button";
import { FollowerCount } from "@/components/discovery/follower-count";
import { PublicationCard } from "@/components/discovery/publication-card";
import { EntityLatestRow } from "@/components/discovery/entity-latest-row";
import {
  VerifiedBadge,
  GetVerifiedCard,
} from "@/components/discovery/verified-badge";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  getDiscoveryEntity,
  listLivePublications,
  type LivePublication,
} from "@/lib/discovery/db";
import {
  publicationsByPublisher,
  SEED_PUBLICATIONS,
  SEED_ENTITIES,
} from "@/lib/discovery/seed";
import {
  ENTITY_TYPES,
  INTENT_LABELS,
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
  type Publication,
  type PublicationType,
} from "@/lib/discovery/types";
import { getRelatedEntities, recommendForEntity } from "@/lib/discovery/graph";

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
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const url = `${origin}/e/${type}/${slug}`;
  const image = (e as { avatarUrl?: string | null }).avatarUrl || `${origin}/opengraph-image`;
  return {
    title: e.name,
    description: e.tagline || e.about?.slice(0, 160),
    metadataBase: new URL(origin),
    alternates: { canonical: url },
    openGraph: {
      title: e.name,
      description: e.tagline,
      url,
      type: "profile",
      siteName: "Omniv",
      images: [{ url: image }],
      firstName: e.type === "person" ? e.name.split(" ")[0] : undefined,
    },
    twitter: { card: "summary_large_image", title: e.name, description: e.tagline, images: [image] },
  };
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
  const liveForEntity = liveAll.filter((p: LivePublication) => {
    if (p.publisherId === e.id) return true;
    if (p.publisherName?.toLowerCase() === e.name.toLowerCase()) return true;
    return false;
  });
  const pubsMap = new Map<string, Publication>();
  for (const p of [...seedPubs, ...liveForEntity]) {
    pubsMap.set(p.slug || p.id, p);
  }
  const pubs = Array.from(pubsMap.values()).sort((a, b) =>
    (b.publishedAt || "").localeCompare(a.publishedAt || "")
  );

  const activeTab = tab ?? "overview";

  const tabs: { id: string; label: string; types?: PublicationType[] }[] = [
    { id: "overview", label: "Overview" },
    { id: "publications", label: "Publications" },
    { id: "about", label: "About" },
    { id: "activity", label: "Activity" },
    { id: "posts", label: "Articles", types: ["article", "announcement"] },
    { id: "media", label: "Media", types: ["music", "video"] },
    {
      id: "more",
      label: "More",
      types: ["opportunity", "event", "product", "research", "file"],
    },
  ];

  let filtered = pubs;
  if (activeTab === "posts" || activeTab === "media" || activeTab === "more") {
    filtered = pubs.filter((p) =>
      tabs.find((t) => t.id === activeTab)?.types?.includes(p.type)
    );
  }

  const initial = e.name.slice(0, 1).toUpperCase();
  const path = entityPath(e);
  const editPath = `${path}/edit`;
  const coverUrl = (e as { coverUrl?: string | null }).coverUrl;
  const avatarUrl = (e as { avatarUrl?: string | null }).avatarUrl;

  const graphPublications = Array.from(
    new Map([...SEED_PUBLICATIONS, ...liveAll].map((publication) => [publication.id, publication])).values()
  );
  const graph = { entities: [e, ...SEED_ENTITIES.filter((entity) => entity.id !== e.id)], publications: graphPublications };
  const relatedEntities = getRelatedEntities(e, graph, 8);
  const networkPubs = recommendForEntity(e, graph, {}, 6).map((item) => item.publication);

  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media").replace(/\/$/, "");
  const pageUrl = `${origin}${path}`;
  const entityLd = {
    "@context": "https://schema.org",
    "@type": e.type === "person" || e.type === "artist" ? "Person" : "Organization",
    name: e.name,
    description: e.about || e.tagline,
    url: pageUrl,
    image: avatarUrl || `${origin}/opengraph-image`,
    logo: avatarUrl || undefined,
    additionalType: e.type,
    address: e.location ? { "@type": "PostalAddress", addressLocality: e.location } : undefined,
    sameAs: e.links?.map((link) => link.href).filter((href) => href.startsWith("http")),
    knowsAbout: e.tags,
    publisher: { "@type": "Organization", name: "Omniv", url: origin },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <StructuredData id={`entity-${e.type}-${e.slug}`} data={entityLd} />
        <div
          className="relative h-40 overflow-hidden bg-gradient-to-br from-omniv-gold/30 via-zinc-900 to-black sm:h-48"
          style={
            coverUrl
              ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.15), #050505), url(${coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!coverUrl && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,200,50,0.22),transparent_55%)]" />
          )}
          <Link
            href="/explore"
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            aria-label="Back"
          >
            ←
          </Link>
          <div className="absolute right-4 top-4 flex gap-1">
            <SaveButton
              type={e.type}
              slug={e.slug}
              name={e.name}
              variant="icon"
            />
            <Link
              href={editPath}
              className="flex h-9 items-center rounded-full bg-black/40 px-3 text-[12px] font-medium text-white backdrop-blur-sm"
            >
              Edit
            </Link>
          </div>
        </div>

        <main className="relative mx-auto max-w-lg px-4 pb-28 md:max-w-2xl md:px-6">
          <div className="-mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-omniv-gold to-amber-700 text-3xl font-semibold text-black ring-4 ring-[#050505]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 sm:mb-1 sm:mt-0">
              <FollowButton
                type={e.type}
                slug={e.slug}
                name={e.name}
                id={e.id}
              />
              <a
                href="#contact"
                className="inline-flex h-10 items-center rounded-full bg-transparent px-5 text-[13px] font-medium text-white ring-1 ring-white/20"
              >
                Contact
              </a>
            </div>
          </div>

          <h1 className="mt-4 flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
            {e.name}
            {e.verified && <VerifiedBadge />}
          </h1>
          <p className="mt-0.5 text-[13px] capitalize text-zinc-500">
            {e.type}
            {e.verified ? " · Verified" : ""}
            {e.location ? ` · ${e.location}` : ""}
          </p>
          <p className="mt-1 text-[14px] text-zinc-400">{e.tagline}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
            <FollowerCount type={e.type} slug={e.slug} />
            <span className="text-zinc-500">
              <span className="font-semibold text-white">{pubs.length}</span>{" "}
              Publications
            </span>
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

          {activeTab === "about" && (
            <div className="mt-6 space-y-6">
              <p className="text-[15px] leading-relaxed text-zinc-300">
                {e.about || e.tagline}
              </p>
              {e.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {e.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/explore?q=${encodeURIComponent(t)}`}
                      className="rounded-full bg-white/[0.04] px-3 py-1 text-[12px] text-zinc-400 ring-1 ring-white/[0.06] hover:text-white"
                    >
                      {t}
                    </Link>
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
              {!e.verified && <GetVerifiedCard />}
              <div id="contact" className="pt-4">
                <ContactForm entityName={e.name} entityPath={path} />
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="mt-6 space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                Activity
              </p>
              {pubs.length === 0 ? (
                <p className="py-10 text-center text-[14px] text-zinc-500">
                  No activity yet for this identity.
                </p>
              ) : (
                pubs.slice(0, 20).map((p) => (
                  <Link
                    key={p.id}
                    href={publicationPath(p)}
                    className="block rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06]"
                  >
                    <p className="text-[12px] text-zinc-500">
                      Published a{" "}
                      {PUBLICATION_LABELS[p.type]?.toLowerCase() ?? p.type}
                      {p.publishedAt ? ` · ${p.publishedAt}` : ""}
                    </p>
                    <p className="mt-0.5 text-[14px] font-medium text-white">
                      {p.title}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}

          {(activeTab === "overview" ||
            activeTab === "publications" ||
            activeTab === "posts" ||
            activeTab === "media" ||
            activeTab === "more") && (
            <div className="mt-6 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                {activeTab === "overview"
                  ? "Latest"
                  : tabs.find((t) => t.id === activeTab)?.label}
              </p>

              {activeTab === "overview" ? (
                <div className="space-y-2.5">
                  {pubs.slice(0, 8).map((p) => (
                    <EntityLatestRow key={p.id} pub={p} />
                  ))}
                  {pubs.length === 0 && (
                    <p className="py-10 text-center text-[14px] text-zinc-500">
                      No publications yet.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(activeTab === "publications" ? pubs : filtered).map(
                    (p) => (
                      <PublicationCard key={p.id} pub={p} />
                    )
                  )}
                </div>
              )}

              {activeTab === "overview" && (
                <KeepExploring
                  currentEntity={e}
                  entities={relatedEntities}
                  publications={networkPubs}
                  tags={e.tags}
                />
              )}

              {!e.verified && <GetVerifiedCard />}
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
