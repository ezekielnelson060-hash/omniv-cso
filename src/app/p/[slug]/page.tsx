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
import { createClient } from "@/lib/supabase/server";
import {
  listDiscoveryEntities,
  getDiscoveryEntity,
  getLivePublication,
  listLivePublications,
  type LivePublication,
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let supabase = null;
  try {
    supabase = await createClient();
  } catch {
    /* seed fallback */
  }
  const p = await getLivePublication(supabase, slug);
  if (!p) return { title: "Not found", robots: { index: false, follow: false } };
  return publicationMetadata(p);
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
  const currentUser = supabase ? (await supabase.auth.getUser()).data.user : null;
  const canManage = Boolean(currentUser && p.ownerId === currentUser.id);

  const publisher =
    getEntityById(p.publisherId) ||
    (p.publisherName === "Omniv Editorial"
      ? await getDiscoveryEntity(supabase, "company", "omniv-editorial")
      : null);
  const publisherName = p.publisherName || publisher?.name || "Publisher";
  const fromPublisher = publisher
    ? publicationsByPublisher(publisher.id).filter((x) => x.id !== p.id)
    : [];

  const [liveEntities, livePublications] = await Promise.all([
    listDiscoveryEntities(supabase),
    listLivePublications(supabase, 120),
  ]);
  const graph = {
    entities: publisher
      ? [...liveEntities.filter((e) => e.id !== publisher.id), publisher]
      : liveEntities,
    publications: livePublications,
  };
  const connectedEntities = getEntityReferences(p, graph.entities);
  const relatedEntities = publisher
    ? getRelatedEntities(publisher, graph)
    : [];
  const recommended = recommendPublications(p, graph)
    .map((item) => item.publication)
    .slice(0, 6);
  const relatedPubs = [
    ...fromPublisher.slice(0, 4),
    ...recommended.filter((r) => !fromPublisher.some((f) => f.id === r.id)),
  ].slice(0, 6);

  const path = publicationPath(p);
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const bodyText =
    p.body ||
    (p.content || [])
      .map((b) => ("text" in b ? b.text : ""))
      .filter(Boolean)
      .join(" ") ||
    p.summary ||
    "";
  const mins = readMinutes(bodyText);
  const hero = HERO[p.type] ?? "from-zinc-800 to-[#050505]";
  const mediaUrl = p.mediaUrl;
  const coverUrl = p.coverUrl || coverFor(p.slug);
  const resolvedCta = ctaFor(p.slug) || p.cta;

  const articleLd = publicationJsonLd(p, origin);

  const isPdf = mediaUrl?.toLowerCase().includes(".pdf");
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
  const isAudio =
    mediaUrl &&
    !isPdf &&
    !isEmbed &&
    (p.type === "music" ||
      /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(mediaUrl));
  const isDirectVideo =
    mediaUrl &&
    !isPdf &&
    !isEmbed &&
    !isAudio &&
    (p.type === "video" || /\.(mp4|webm)(\?|$)/i.test(mediaUrl));

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
                {PUBLICATION_LABELS[p.type]}
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
                {publisher ? (
                  <Link
                    href={entityPath(publisher)}
                    className="flex items-center gap-1.5 font-medium hover:text-white"
                  >
                    <OmnivAvatar
                      src={publisher.avatarUrl || publisher.imageUrl}
                      name={publisher.name}
                      size={24}
                    />
                    {publisher.name}
                  </Link>
                ) : (
                  <span className="font-medium">{publisherName}</span>
                )}
                <span className="text-zinc-600">·</span>
                <span>{p.readingTime || mins} min read</span>
                {p.publishedAt && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span>
                      {new Date(p.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
                  publisherName={p.publisherName}
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

          {publisher && (
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
                    src={publisher.avatarUrl || publisher.imageUrl}
                    name={publisher.name}
                    size={48}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-white">
                      {publisher.name}
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
                    <li key={r.id}>
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
                            {PUBLICATION_LABELS[r.type]}
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
