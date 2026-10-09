import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaveButton } from "@/components/discovery/save-button";
import { ShareButton } from "@/components/discovery/share-button";
import { PublicationPageActions } from "@/components/discovery/publication-page-actions";
import { FollowButton } from "@/components/discovery/follow-button";
import { StructuredData } from "@/components/StructuredData";
import { KeepExploring } from "@/components/discovery/keep-exploring";
import { PublicationMedia } from "@/components/discovery/publication-media";
import { PublicationBody } from "@/components/discovery/publication-body";
import { StickyArticleHeader } from "@/components/discovery/sticky-article-header";
import { PublisherPublicationMenu } from "@/components/discovery/publisher-publication-menu";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { OmnivAvatar } from "@/components/discovery/omniv-avatar";
import {
  VerifiedBadge,
  isAlwaysVerified,
} from "@/components/discovery/verified-badge";
import { createClient } from "@/lib/supabase/server";
import {
  listDiscoveryEntities,
  getDiscoveryEntity,
  getLivePublication,
  listLivePublications,
  type LivePublication,
  type LiveEntity,
} from "@/lib/discovery/db";
import {
  getEntityById,
  publicationsByPublisher,
} from "@/lib/discovery/seed";
import {
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
} from "@/lib/discovery/types";
import {
  getEntityReferences,
  getRelatedEntities,
  recommendPublications,
} from "@/lib/discovery/graph";
import { coverFor, ctaFor } from "@/lib/discovery/seed-covers";
import {
  publicationMetadata,
  publicationJsonLd,
} from "@/lib/discovery/seo";
import { resolveEntityAvatar } from "@/lib/discovery/resolve-avatar";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";

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
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function extractBodyText(p: LivePublication): string {
  if (p.body && typeof p.body === "string") return p.body;
  if (Array.isArray(p.content)) {
    try {
      const joined = p.content
        .map((b) => {
          if (!b || typeof b !== "object") return "";
          if ("text" in b && typeof (b as { text?: unknown }).text === "string") {
            return (b as { text: string }).text;
          }
          return "";
        })
        .filter(Boolean)
        .join(" ");
      if (joined) return joined;
    } catch {
      /* ignore */
    }
  }
  return p.summary || "";
}

async function resolvePublisher(
  supabase: Awaited<ReturnType<typeof createClient>> | null,
  p: LivePublication,
  liveEntities: LiveEntity[]
): Promise<LiveEntity | null> {
  try {
    const seed = getEntityById(p.publisherId);
    if (seed) return seed as LiveEntity;

    if (p.publisherId) {
      const byId = liveEntities.find((e) => e.id === p.publisherId);
      if (byId) return byId;
    }

    const name = (p.publisherName || "").toLowerCase().trim();
    if (
      name === "omniv editorial" ||
      name === "omniv" ||
      name === "omniv media" ||
      name.startsWith("omniv")
    ) {
      const editorial = await getDiscoveryEntity(
        supabase,
        "company",
        "omniv-editorial"
      );
      if (editorial) return editorial;
      const omniv = await getDiscoveryEntity(supabase, "company", "omniv");
      if (omniv) return omniv;
    }

    if (p.publisherName) {
      const byName = liveEntities.find(
        (e) =>
          (e.name || "").toLowerCase() === (p.publisherName || "").toLowerCase()
      );
      if (byName) return byName;
    }
  } catch {
    /* never fail the page for publisher resolution */
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    let supabase = null;
    try {
      supabase = await createClient();
    } catch {
      /* seed fallback */
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
    /* no env */
  }

  const p = (await getLivePublication(supabase, slug)) as LivePublication | null;
  if (!p) notFound();

  let currentUser = null;
  try {
    if (supabase) {
      currentUser = (await supabase.auth.getUser()).data.user;
    }
  } catch {
    /* guest */
  }
  const canManage = Boolean(currentUser && p.ownerId === currentUser.id);

  let liveEntities: LiveEntity[] = [];
  let livePublications: LivePublication[] = [];
  try {
    const [ents, pubs] = await Promise.all([
      listDiscoveryEntities(supabase),
      listLivePublications(supabase, 60),
    ]);
    liveEntities = (ents || []) as LiveEntity[];
    livePublications = (pubs || []) as LivePublication[];
  } catch {
    liveEntities = [];
    livePublications = [];
  }

  const publisher = await resolvePublisher(supabase, p, liveEntities);
  const publisherName = publisher?.name || p.publisherName || "Publisher";
  const publisherHref =
    (publisher && publisher.type && publisher.slug
      ? entityPath(publisher)
      : undefined) ||
    resolvePublisherPath({
      type: publisher?.type,
      slug: publisher?.slug,
      name: publisherName,
      publisherId: p.publisherId,
    });
  const showVerified = isAlwaysVerified({
    verified: publisher?.verified,
    slug: publisher?.slug,
    name: publisherName,
  });
  const avatarSrc = resolveEntityAvatar({
    avatarUrl: publisher?.avatarUrl,
    slug: publisher?.slug,
    name: publisherName,
  });

  let connectedEntities: LiveEntity[] = [];
  let relatedEntities: LiveEntity[] = [];
  let relatedPubs: LivePublication[] = [];
  let recommended: LivePublication[] = [];
  try {
    const fromPublisher = publisher
      ? publicationsByPublisher(publisher.id).filter((x) => x.id !== p.id)
      : [];
    const graph = {
      entities: publisher
        ? [...liveEntities.filter((e) => e.id !== publisher.id), publisher]
        : liveEntities,
      publications: livePublications,
    };
    connectedEntities = getEntityReferences(p, graph.entities) as LiveEntity[];
    relatedEntities = publisher
      ? (getRelatedEntities(publisher, graph) as LiveEntity[])
      : [];
    recommended = recommendPublications(p, graph)
      .map((item) => item.publication as LivePublication)
      .slice(0, 6);
    relatedPubs = [
      ...fromPublisher.slice(0, 4),
      ...recommended.filter((r) => !fromPublisher.some((f) => f.id === r.id)),
    ].slice(0, 6) as LivePublication[];
  } catch {
    connectedEntities = [];
    relatedEntities = [];
    relatedPubs = [];
    recommended = [];
  }

  const path = publicationPath(p);
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const bodyText = extractBodyText(p);
  const mins = readMinutes(bodyText);
  const hero = HERO[p.type] ?? "from-zinc-800 to-[#050505]";
  const mediaUrl = p.mediaUrl;
  const coverUrl = p.coverUrl || coverFor(p.slug);
  const resolvedCta = ctaFor(p.slug) || p.cta;

  let articleLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    url: `${origin}${path}`,
  };
  try {
    articleLd = publicationJsonLd(p, origin) as Record<string, unknown>;
  } catch {
    /* minimal ld */
  }

  const isPdf = Boolean(mediaUrl?.toLowerCase().includes(".pdf"));
  const ytMatch = mediaUrl?.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/i
  );
  const vimeoMatch = mediaUrl?.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  const isEmbed = Boolean(ytMatch || vimeoMatch);
  const embedSrc = ytMatch
    ? `https://www.youtube.com/embed/${ytMatch[1]}`
    : vimeoMatch
      ? `https://player.vimeo.com/video/${vimeoMatch[1]}`
      : null;
  const isAudio = Boolean(
    mediaUrl &&
      !isPdf &&
      !isEmbed &&
      (p.type === "music" ||
        /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(mediaUrl))
  );
  const isDirectVideo = Boolean(
    mediaUrl &&
      !isPdf &&
      !isEmbed &&
      !isAudio &&
      (p.type === "video" || /\.(mp4|webm)(\?|$)/i.test(mediaUrl))
  );

  const typeLabel = PUBLICATION_LABELS[p.type as keyof typeof PUBLICATION_LABELS] || p.type || "Publication";

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <StructuredData id={`publication-${p.slug}`} data={articleLd} />
        <StickyArticleHeader title={p.title} backHref="/home" />

        <div
          className={`relative min-h-[280px] bg-gradient-to-b ${hero} sm:min-h-[360px]`}
          style={
            coverUrl
              ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.5) 40%, #050505 100%), url(${coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }
              : undefined
          }
        >
          <div className="relative mx-auto flex min-h-[280px] max-w-2xl flex-col px-4 pb-10 pt-3 sm:min-h-[360px]">
            <div className="flex items-center justify-between">
              <Link
                href="/home"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
                aria-label="Back"
              >
                ←
              </Link>
              <div className="flex items-center gap-1">
                <ShareButton title={p.title} path={path} />
                {canManage && (
                  <PublisherPublicationMenu
                    id={p.id}
                    slug={p.slug}
                    title={p.title}
                    visibility={p.visibility}
                    status={p.status}
                  />
                )}
              </div>
            </div>

            <div className="mt-auto">
              <span className="inline-flex items-center rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                {typeLabel}
              </span>
              <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[40px]">
                {p.title}
              </h1>
              {(p.subtitle || p.excerpt) && (
                <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-zinc-200 sm:text-[17px]">
                  {p.subtitle || p.excerpt}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-zinc-300">
                {publisherHref ? (
                  <Link
                    href={publisherHref}
                    className="inline-flex items-center gap-1.5 font-medium hover:text-white"
                  >
                    <OmnivAvatar
                      src={avatarSrc}
                      name={publisherName}
                      size={24}
                    />
                    <span className="leading-none">{publisherName}</span>
                    {showVerified && (
                      <VerifiedBadge
                        name={publisherName}
                        verifyType={publisher?.type || "company"}
                        size={14}
                        className="relative top-px"
                      />
                    )}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <OmnivAvatar
                      src={avatarSrc}
                      name={publisherName}
                      size={24}
                    />
                    <span className="leading-none">{publisherName}</span>
                    {showVerified && (
                      <VerifiedBadge
                        name={publisherName}
                        verifyType={publisher?.type || "company"}
                        size={14}
                        className="relative top-px"
                      />
                    )}
                  </span>
                )}
                <span className="text-zinc-600">·</span>
                <span>{p.readingTime || mins} min read</span>
                {p.publishedAt && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span>
                      {(() => {
                        try {
                          return new Date(p.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          );
                        } catch {
                          return p.publishedAt;
                        }
                      })()}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-4 -mx-1 rounded-xl bg-black/25 px-1 py-0.5 backdrop-blur-sm">
                <PublicationPageActions
                  id={p.id}
                  slug={p.slug}
                  type={p.type}
                  title={p.title}
                  path={path}
                  publishedAt={p.publishedAt}
                  heat={p.heat}
                  tags={p.tags || []}
                  category={p.category}
                  publisherId={p.publisherId}
                  publisherName={publisherName}
                  visibility={p.visibility}
                  status={p.status}
                />
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-2">
          <PublicationMedia
            p={p}
            publisher={publisher}
            publisherName={publisherName}
            path={path}
            coverUrl={coverUrl}
            mediaUrl={mediaUrl}
            isAudio={!!isAudio}
            isDirectVideo={!!isDirectVideo}
            isEmbed={!!isEmbed}
            embedSrc={embedSrc}
          />

          {isPdf && mediaUrl && (
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-8 flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-4"
            >
              <span className="text-2xl">📄</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-white">Open document</p>
                <p className="truncate text-[12px] text-zinc-500">PDF</p>
              </div>
              <span className="text-omniv-gold">↓</span>
            </a>
          )}

          <PublicationBody
            slug={p.slug}
            type={p.type}
            summary={p.summary}
            excerpt={p.excerpt}
            body={p.body}
            content={p.content}
            whatThisMeans={p.whatThisMeans}
            questionNobodyAsks={p.questionNobodyAsks}
            sources={p.sources}
          />

          {resolvedCta && (
            <a
              href={resolvedCta.href}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black transition hover:bg-omniv-gold/90"
            >
              {resolvedCta.label}
            </a>
          )}

          <KeepExploring
            currentPublication={p}
            entities={[...connectedEntities, ...relatedEntities]}
            publications={recommended}
            tags={p.tags}
            title="You might want to explore next"
          />

          {publisher && publisher.type && publisher.slug && (
            <div className="mt-12 rounded-2xl bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Publisher
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={entityPath(publisher)}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <OmnivAvatar
                    src={resolveEntityAvatar({
                      avatarUrl: publisher.avatarUrl,
                      slug: publisher.slug,
                      name: publisher.name,
                    })}
                    name={publisher.name}
                    size={48}
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[15px] font-medium text-white">
                      <span className="truncate">{publisher.name}</span>
                      {isAlwaysVerified({
                        verified: publisher.verified,
                        slug: publisher.slug,
                        name: publisher.name,
                      }) && (
                        <VerifiedBadge
                          name={publisher.name}
                          verifyType={publisher.type}
                          size={14}
                          className="relative top-px shrink-0"
                        />
                      )}
                    </p>
                    <p className="truncate text-[12px] text-zinc-500">
                      {publisher.tagline}
                    </p>
                  </div>
                </Link>
                <FollowButton
                  type={publisher.type}
                  slug={publisher.slug}
                  name={publisher.name}
                  id={publisher.id}
                />
              </div>
            </div>
          )}

          {relatedPubs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Keep reading
              </h2>
              <ul className="mt-4 space-y-2">
                {relatedPubs.map((r) => {
                  const thumb = r.coverUrl || coverFor(r.slug);
                  return (
                    <li key={r.id || r.slug}>
                      <Link
                        href={publicationPath(r)}
                        className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-2.5 py-2.5 transition hover:bg-white/[0.06]"
                      >
                        <div
                          className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]"
                          style={
                            thumb
                              ? {
                                  backgroundImage: `url(${thumb})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-white">
                            {r.title}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {PUBLICATION_LABELS[
                              r.type as keyof typeof PUBLICATION_LABELS
                            ] || r.type}
                            {r.meta ? ` · ${r.meta}` : ""}
                          </p>
                        </div>
                        <span className="text-zinc-600">›</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="mt-10 flex flex-wrap gap-2">
            <SaveButton
              kind="publication"
              type={p.type}
              slug={p.slug}
              name={p.title}
              pubType={p.type}
            />
          </div>

          <div className="mt-14 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-center">
            <p className="text-[17px] font-semibold text-white">
              Publish what is worth discovering.
            </p>
            <Link
              href="/publish"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
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
