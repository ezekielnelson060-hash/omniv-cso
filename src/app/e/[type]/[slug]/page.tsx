import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContactForm } from "@/components/discovery/contact-form";
import { StructuredData } from "@/components/StructuredData";
import { KeepExploring } from "@/components/discovery/keep-exploring";
import { EntityActionBar } from "@/components/discovery/entity-action-bar";
import { SaveButton } from "@/components/discovery/save-button";
import { EntityStatsRow } from "@/components/discovery/entity-stats-row";
import { PublicationCard } from "@/components/discovery/publication-card";
import {
  VerifiedBadge,
  GetVerifiedCard,
} from "@/components/discovery/verified-badge";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  getDiscoveryEntity,
  getEntityBySlugOrName,
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
import { entityMedia } from "@/lib/discovery/entity-media";
import { EntityViewTracker } from "@/components/discovery/entity-view-tracker";

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

function hostLabel(href: string) {
  try {
    return new URL(href.startsWith("http") ? href : `https://${href}`).hostname.replace(
      /^www\./,
      ""
    );
  } catch {
    return href;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  const supabase = await tryClient();
  const e =
    (await getEntityBySlugOrName(supabase, type, slug)) ||
    (await getDiscoveryEntity(supabase, type, slug));
  if (!e) return { title: "Not found" };
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const url = `${origin}/e/${e.type}/${e.slug}`;
  const image =
    (e as { avatarUrl?: string | null }).avatarUrl ||
    `${origin}/opengraph-image`;
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
    },
    twitter: {
      card: "summary_large_image",
      title: e.name,
      description: e.tagline,
      images: [image],
    },
  };
}

export default async function EntityPage({ params, searchParams }: Props) {
  const { type, slug } = await params;
  const { tab } = await searchParams;
  if (!(ENTITY_TYPES as readonly string[]).includes(type)) notFound();

  const supabase = await tryClient();
  // Only real identity pages — never invent a profile for a name that only
  // appears on publications. Users create their own page.
  const e =
    (await getEntityBySlugOrName(supabase, type, slug)) ||
    (await getDiscoveryEntity(supabase, type, slug));
  if (!e) notFound();

  let isOwner = false;
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && (e as { ownerId?: string }).ownerId === user.id) {
        isOwner = true;
      }
    } catch {
      /* guest */
    }
  }

  const seedPubs = publicationsByPublisher(e.id);
  const liveAll = await listLivePublications(supabase, 80);
  const liveForEntity = liveAll.filter((p: LivePublication) => {
    if (p.publisherId === e.id) return true;
    if (p.publisherName?.toLowerCase() === e.name.toLowerCase()) return true;
    const refs = p.entityRefs || [];
    if (refs.some((r) => r.slug === e.slug || r.id === e.id)) return true;
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
  const { coverUrl, avatarUrl } = entityMedia({
    slug: e.slug,
    coverUrl: (e as { coverUrl?: string | null }).coverUrl,
    avatarUrl: (e as { avatarUrl?: string | null }).avatarUrl,
  });
  const links = e.links || [];

  const graphPublications = Array.from(
    new Map(
      [...SEED_PUBLICATIONS, ...liveAll].map((publication) => [
        publication.id,
        publication,
      ])
    ).values()
  );
  const graph = {
    entities: [e, ...SEED_ENTITIES.filter((entity) => entity.id !== e.id)],
    publications: graphPublications,
  };
  const relatedEntities = getRelatedEntities(e, graph, 8);
  const networkPubs = recommendForEntity(e, graph, {}, 6).map(
    (item) => item.publication
  );

  const origin = (
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
  ).replace(/\/$/, "");
  const pageUrl = `${origin}${path}`;
  const entityLd = {
    "@context": "https://schema.org",
    "@type":
      e.type === "person" || e.type === "artist" ? "Person" : "Organization",
    name: e.name,
    description: e.about || e.tagline,
    url: pageUrl,
    image: avatarUrl || `${origin}/opengraph-image`,
    additionalType: e.type,
    address: e.location
      ? { "@type": "PostalAddress", addressLocality: e.location }
      : undefined,
    sameAs: links.map((l) => l.href).filter((h) => h.startsWith("http")),
    knowsAbout: e.tags,
  };

  return (
    <DiscoveryShell>
      <EntityViewTracker type={e.type} slug={e.slug} tags={e.tags || []} />
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <StructuredData id={`entity-${e.type}-${e.slug}`} data={entityLd} />

        <div className="relative aspect-[3/1] max-h-56 w-full overflow-hidden bg-zinc-900 sm:max-h-72">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-omniv-gold/20 via-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050505]" />

          <Link
            href="/explore"
            className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white"
            aria-label="Back"
          >
            ←
          </Link>
          <div className="absolute right-4 top-4 z-10 flex gap-1">
            {!isOwner && (
              <SaveButton
                type={e.type}
                slug={e.slug}
                name={e.name}
                variant="icon"
              />
            )}
          </div>
        </div>

        <main className="relative mx-auto max-w-lg px-4 pb-28 md:max-w-2xl md:px-6">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-omniv-gold to-amber-700 text-3xl font-semibold text-black ring-4 ring-[#050505]">
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
            <EntityActionBar
              type={e.type}
              slug={e.slug}
              name={e.name}
              id={e.id}
              editPath={editPath}
              serverIsOwner={isOwner}
            />
          </div>

          <div className="mt-3">
            <h1 className="flex flex-wrap items-center gap-1.5 text-[24px] font-bold tracking-tight text-white">
              {e.name}
              {(e.verified ||
                ["omniv", "omniv-editorial", "omniv-media"].includes(
                  e.slug.toLowerCase()
                )) && (
                <VerifiedBadge
                  name={e.name}
                  verifiedAt={e.publishedAt}
                  verifyType={e.type}
                  href={`${path}/verified`}
                  size={20}
                />
              )}
            </h1>

            {e.tagline ? (
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-200">
                {e.tagline}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-zinc-500">
              <span className="inline-flex items-center gap-1.5 capitalize">
                {e.type}
              </span>
              {e.location ? (
                <span className="inline-flex items-center gap-1.5">
                  {e.location}
                </span>
              ) : null}
              {e.publishedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  Joined{" "}
                  {new Date(e.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              ) : null}
            </div>
          </div>

          <EntityStatsRow type={e.type} slug={e.slug} publicationsCount={pubs.length} />

          <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto border-b border-white/[0.06] px-4 pb-0 scrollbar-none">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={t.id === "overview" ? path : `${path}?tab=${t.id}`}
                className={`shrink-0 border-b-2 px-3 pb-3 text-[14px] font-medium transition ${
                  activeTab === t.id
                    ? "border-omniv-gold text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {activeTab === "about" && (
            <div className="mt-6 space-y-6">
              <p className="text-[15px] leading-relaxed text-zinc-300">
                {e.about || e.tagline || "No about text yet."}
              </p>
              {!e.verified && isOwner && <GetVerifiedCard />}
              <div id="contact" className="pt-4">
                {!isOwner && (
                  <ContactForm
                    entityName={e.name}
                    entityPath={path}
                    entityId={e.id}
                    ownerId={(e as { ownerId?: string }).ownerId}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="mt-6 space-y-2.5">
              {pubs.length === 0 ? (
                <p className="py-10 text-center text-[14px] text-zinc-500">
                  No activity yet for this identity.
                </p>
              ) : (
                pubs.slice(0, 20).map((p) => (
                  <Link
                    key={p.id}
                    href={publicationPath(p)}
                    className="block rounded-xl bg-white/[0.03] px-3.5 py-3"
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
                {activeTab === "overview" ? "Latest" : "Publications"}
              </p>
              {(activeTab === "overview" ? pubs.slice(0, 6) : filtered).length ===
              0 ? (
                <p className="py-10 text-center text-[14px] text-zinc-500">
                  No publications yet.
                </p>
              ) : (
                (activeTab === "overview" ? pubs.slice(0, 6) : filtered).map(
                  (p) => (
                    <PublicationCard
                      key={p.id}
                      pub={p}
                      showManage={isOwner}
                    />
                  )
                )
              )}
            </div>
          )}

          {activeTab === "overview" && relatedEntities.length > 0 && (
            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                Related
              </p>
              <div className="mt-3 space-y-2">
                {relatedEntities.map((rel) => (
                  <Link
                    key={rel.id}
                    href={entityPath(rel)}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-omniv-gold/15 text-sm font-semibold text-omniv-gold">
                      {rel.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-white">
                        {rel.name}
                      </p>
                      <p className="truncate text-[12px] capitalize text-zinc-500">
                        {rel.type}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <KeepExploring publications={networkPubs} tags={e.tags || []} />
          </div>

          <div id="contact" className="mt-10">
            {!isOwner && (
              <ContactForm
                entityName={e.name}
                entityPath={path}
                entityId={e.id}
                ownerId={(e as { ownerId?: string }).ownerId}
              />
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
