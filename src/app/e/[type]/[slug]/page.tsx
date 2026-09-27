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
import { entityMedia } from "@/lib/discovery/entity-media";

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
  const e = await getDiscoveryEntity(supabase, type, slug);
  if (!e) return { title: "Not found" };
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const url = `${origin}/e/${type}/${slug}`;
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
  const e = await getDiscoveryEntity(supabase, type, slug);
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
            <SaveButton
              type={e.type}
              slug={e.slug}
              name={e.name}
              variant="icon"
            />
            {isOwner && (
              <Link
                href={editPath}
                className="flex h-9 items-center rounded-full bg-black/55 px-3.5 text-[13px] font-semibold text-white"
              >
                Edit
              </Link>
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
            <div className="mb-1 flex flex-wrap justify-end gap-2">
              <FollowButton
                type={e.type}
                slug={e.slug}
                name={e.name}
                id={e.id}
              />
              <a
                href="#contact"
                className="inline-flex h-10 items-center rounded-full border border-white/20 bg-transparent px-5 text-[13px] font-semibold text-white transition hover:bg-white/[0.06]"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="mt-3">
            <h1 className="flex flex-wrap items-center gap-1.5 text-[24px] font-bold tracking-tight text-white">
              {e.name}
              {e.verified && (
                <VerifiedBadge
                  name={e.name}
                  verifiedAt={e.publishedAt}
                  verifyType={e.type}
                  href={`${path}/verified`}
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
                <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0 text-zinc-500" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
                {e.type}
              </span>
              {e.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0 text-zinc-500" fill="currentColor" aria-hidden>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {e.location}
                </span>
              ) : null}
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href.startsWith("http") ? l.href : `https://${l.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-omniv-gold hover:underline"
                >
                  <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0" fill="currentColor" aria-hidden>
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                  </svg>
                  {l.label && l.label !== "Website"
                    ? l.label
                    : hostLabel(l.href)}
                </a>
              ))}
              {e.publishedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0 text-zinc-500" fill="currentColor" aria-hidden>
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                  </svg>
                  Joined{" "}
                  {new Date(e.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px]">
            <FollowerCount type={e.type} slug={e.slug} />
            <Link href="/following" className="text-zinc-500 hover:text-zinc-300">
              <span className="font-semibold text-white">0</span> Following
            </Link>
            <span className="text-zinc-500">
              <span className="font-semibold text-white">{pubs.length}</span>{" "}
              Publications
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              {
                label: "Posts",
                n:
                  pubs.filter(
                    (x) => x.type === "article" || x.type === "announcement"
                  ).length || pubs.length,
              },
              {
                label: "Products",
                n: pubs.filter((x) => x.type === "product").length,
              },
              {
                label: "Research",
                n: pubs.filter(
                  (x) => x.type === "research" || x.type === "file"
                ).length,
              },
              {
                label: "Events",
                n: pubs.filter((x) => x.type === "event").length,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/[0.03] px-2 py-2.5 text-center ring-1 ring-white/[0.06]"
              >
                <p className="text-[16px] font-semibold tabular-nums text-white">
                  {s.n}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {(e.intents?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {e.intents?.map((i) => (
                <span
                  key={i.kind + (i.detail ?? "")}
                  className="rounded-full bg-omniv-gold/10 px-3 py-1 text-[12px] text-omniv-gold"
                >
                  {INTENT_LABELS[i.kind] || i.kind}
                  {i.detail ? ` · ${i.detail}` : ""}
                </span>
              ))}
            </div>
          )}

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
              {e.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {e.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/explore?q=${encodeURIComponent(t)}`}
                      className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-zinc-400 hover:text-white"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              )}
              {links.length > 0 && (
                <div className="space-y-2">
                  {links.map((l) => (
                    <a
                      key={l.href}
                      href={
                        l.href.startsWith("http") ? l.href : `https://${l.href}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[14px] text-omniv-gold hover:underline"
                    >
                      <span>↗</span>
                      {l.label || hostLabel(l.href)}
                    </a>
                  ))}
                </div>
              )}
              {!e.verified && isOwner && <GetVerifiedCard />}
              <div id="contact" className="pt-4">
                <ContactForm entityName={e.name} entityPath={path} />
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
                    <div className="rounded-2xl bg-white/[0.03] px-5 py-10 text-center ring-1 ring-white/[0.06]">
                      <p className="text-[15px] font-medium text-white">
                        No publications yet
                      </p>
                      <p className="mt-2 text-[13px] text-zinc-500">
                        {isOwner
                          ? "Publish the first piece from this identity."
                          : "Nothing published under this identity yet."}
                      </p>
                      {isOwner && (
                        <Link
                          href="/publish"
                          className="mt-5 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
                        >
                          Publish
                        </Link>
                      )}
                    </div>
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

              {!e.verified && isOwner && <GetVerifiedCard />}
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
