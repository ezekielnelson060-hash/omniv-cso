import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareButton } from "@/components/discovery/share-button";
import { PublicationPageActions } from "@/components/discovery/publication-page-actions";
import { StickyArticleHeader } from "@/components/discovery/sticky-article-header";
import { KeepExploring } from "@/components/discovery/keep-exploring";
import { ViewTracker } from "@/components/discovery/view-tracker";
import { publicationJsonLd } from "@/lib/discovery/seo";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { OmnivAvatar } from "@/components/discovery/omniv-avatar";
import { VerifiedBadge } from "@/components/discovery/verified-badge";
import { PublicationMedia } from "@/components/discovery/publication-media";
import { isAlwaysVerified } from "@/lib/discovery/verified";
import { createClient } from "@/lib/supabase/server";
import {
  getLivePublication,
  listDiscoveryEntities,
  listLivePublications,
} from "@/lib/discovery/db";
import {
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
} from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";
import { publicationMetadata } from "@/lib/discovery/seo";
import { resolveEntityAvatar } from "@/lib/discovery/resolve-avatar";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";
import { BodyBlocks } from "@/components/discovery/publication-body-blocks";
import { PublicationPageFooter } from "@/components/discovery/publication-page-footer";
import {
  HERO,
  readMinutes,
  parseMeta,
  isAudioUrl,
  isVideoUrl,
  youtubeEmbed,
  resolvePublisher,
} from "@/lib/discovery/publication-page-helpers";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const p = await getLivePublication(supabase, slug);
    if (!p) return { title: "Publication" };
    return publicationMetadata(p);
  } catch {
    return { title: "Publication" };
  }
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  try {
    supabase = await createClient();
  } catch {
    supabase = null;
  }

  const p = await getLivePublication(supabase, slug);
  if (!p) notFound();

  let currentUser: { id: string } | null = null;
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) currentUser = { id: user.id };
    } catch {
      /* guest */
    }
  }

  const canManage = Boolean(currentUser && p.ownerId === currentUser.id);

  const publisher = await resolvePublisher(supabase, p);
  const publisherName = publisher?.name || p.publisherName || "Publisher";
  const publisherHref =
    (publisher ? entityPath(publisher) : null) ||
    resolvePublisherPath({
      name: p.publisherName,
      publisherId: p.publisherId,
      type: publisher?.type || (p.type === "music" ? "artist" : "person"),
      slug: publisher?.slug,
    }) ||
    null;

  const path = publicationPath({
    slug: p.slug,
    type: p.type,
    publisherName,
    publisherSlug: publisher?.slug,
  });
  const typeLabel =
    PUBLICATION_LABELS[(p.type as keyof typeof PUBLICATION_LABELS) || "article"] ||
    "Article";
  const coverUrl =
    (p as { coverUrl?: string | null }).coverUrl || coverFor(p.slug) || null;
  const mediaUrl = (p as { mediaUrl?: string | null }).mediaUrl || null;
  const metaFields = parseMeta(p.meta);
  const genre =
    p.category ||
    metaFields.genre ||
    (Array.isArray(p.tags) && p.tags[0]) ||
    null;

  const isMusic = p.type === "music";
  const isVideo = p.type === "video";
  const isAudio = isMusic || isAudioUrl(mediaUrl);
  const isDirectVideo = isVideo || isVideoUrl(mediaUrl);
  const embedSrc =
    mediaUrl && (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be"))
      ? youtubeEmbed(mediaUrl)
      : null;
  const isEmbed = Boolean(embedSrc);

  const followType = publisher?.type || (isMusic ? "artist" : "person");
  const followSlug =
    publisher?.slug ||
    publisherName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);

  const avatarSrc = publisher
    ? resolveEntityAvatar({
        avatarUrl: publisher.avatarUrl,
        slug: publisher.slug,
        name: publisher.name,
      })
    : null;
  const verified = isAlwaysVerified({
    verified: publisher?.verified,
    slug: publisher?.slug,
    name: publisherName,
  });

  let bodyText = "";
  try {
    if (typeof p.body === "string") bodyText = p.body;
    else if (Array.isArray(p.content)) {
      bodyText = (p.content as unknown[])
        .map((b) => {
          if (b && typeof b === "object" && "text" in b) {
            const t = (b as { text?: unknown }).text;
            return typeof t === "string" ? t : "";
          }
          return "";
        })
        .join(" ");
    }
  } catch {
    bodyText = "";
  }
  const mins = readMinutes(bodyText);

  let publishedLabel: string | null = null;
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

  const [liveAll, entities] = await Promise.all([
    listLivePublications(supabase, 80),
    listDiscoveryEntities(supabase),
  ]);
  const explorePublications = liveAll.filter((x) => x.slug !== p.slug);
  const exploreEntities = entities;

  const relatedFromPublisher = liveAll.filter((x) => {
    if (x.slug === p.slug) return false;
    if (p.publisherId && x.publisherId && x.publisherId === p.publisherId)
      return true;
    if (
      publisherName &&
      x.publisherName &&
      x.publisherName.toLowerCase() === publisherName.toLowerCase()
    )
      return true;
    return false;
  });

  const hero = HERO[p.type || "article"] || HERO.article;
  const showMediaPlayer = isMusic || isVideo || isAudio || isDirectVideo || isEmbed;
  const showArticleBody =
    !isMusic &&
    !isVideo &&
    (Boolean(p.body) ||
      Boolean(p.content?.length) ||
      Boolean(p.summary) ||
      Boolean(p.excerpt));
  const showMusicLyrics =
    isMusic && (Boolean(p.body) || Boolean(p.content?.length));

  const jsonLd = publicationJsonLd(p);
  const showFollow = Boolean(
    !canManage && publisherName && publisherName !== "Publisher"
  );

  const moreItems = relatedFromPublisher.slice(0, 3).map((x) => ({
    slug: x.slug,
    type: x.type as string,
    title: x.title,
    summary: x.summary,
    publisherName: x.publisherName || publisherName,
    publisherSlug: x.publisherSlug || publisher?.slug,
    coverUrl: (x as { coverUrl?: string | null }).coverUrl,
    mediaUrl: (x as { mediaUrl?: string | null }).mediaUrl,
    publishedAt: x.publishedAt,
  }));

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ViewTracker
          publicationSlug={p.slug}
          tags={p.tags || []}
          category={p.category}
        />
        <StickyArticleHeader title={p.title} backHref="/home" />

        <div
          className={`relative bg-gradient-to-b ${hero} ${isMusic ? "min-h-[180px] sm:min-h-[220px]" : "min-h-[280px] sm:min-h-[360px]"}`}
          style={
            coverUrl && !isMusic
              ? {
                  backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.5) 40%, #050505 100%), url(${coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }
              : undefined
          }
        >
          <div className="relative mx-auto flex min-h-[180px] max-w-2xl flex-col px-4 pb-10 pt-3 sm:min-h-[220px]">
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
              </div>
            </div>

            <div className="mt-auto">
              <span className="inline-flex items-center rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                {typeLabel}
              </span>
              {!isMusic && (
                <>
                  <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[40px]">
                    {p.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-zinc-300">
                    {publisherHref ? (
                      <Link
                        href={publisherHref}
                        className="inline-flex items-center gap-1.5 font-medium leading-none hover:text-white"
                      >
                        <OmnivAvatar src={avatarSrc} name={publisherName} size={22} />
                        <span className="leading-none">{publisherName}</span>
                        {verified ? (
                          <VerifiedBadge
                            name={publisherName}
                            verifyType={publisher?.type || "company"}
                            size={16}
                          />
                        ) : null}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-medium leading-none">
                        <OmnivAvatar src={avatarSrc} name={publisherName} size={22} />
                        <span className="leading-none">{publisherName}</span>
                      </span>
                    )}
                    {!isVideo && (
                      <>
                        <span className="leading-none text-zinc-600">·</span>
                        <span className="leading-none">{mins} min read</span>
                      </>
                    )}
                    {publishedLabel ? (
                      <>
                        <span className="leading-none text-zinc-600">·</span>
                        <span className="leading-none">{publishedLabel}</span>
                      </>
                    ) : null}
                  </div>
                </>
              )}

              {isMusic && (
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-zinc-300">
                  {publisherHref ? (
                    <Link
                      href={publisherHref}
                      className="inline-flex items-center gap-1.5 font-medium leading-none hover:text-white"
                    >
                      <OmnivAvatar src={avatarSrc} name={publisherName} size={22} />
                      <span className="leading-none">{publisherName}</span>
                      {verified ? (
                        <VerifiedBadge
                          name={publisherName}
                          verifyType={publisher?.type || "artist"}
                          size={16}
                        />
                      ) : null}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-medium leading-none">
                      <OmnivAvatar src={avatarSrc} name={publisherName} size={22} />
                      <span className="leading-none">{publisherName}</span>
                    </span>
                  )}
                  {genre ? (
                    <>
                      <span className="leading-none text-zinc-600">·</span>
                      <span className="leading-none">{genre}</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
          {isMusic ? (
            <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[36px]">
              {p.title}
            </h1>
          ) : null}

          <div className="mt-4">
            <PublicationPageActions
              id={p.id}
              slug={p.slug}
              type={p.type || "article"}
              title={p.title}
              path={path}
              publishedAt={p.publishedAt}
              heat={p.heat}
              tags={p.tags || []}
              category={p.category}
              publisherId={p.publisherId}
              publisherName={publisherName}
              isOwner={canManage}
            />
          </div>

          {showMediaPlayer ? (
            <div className="mt-6">
              <PublicationMedia
                p={p}
                publisher={publisher}
                publisherName={publisherName}
                path={path}
                coverUrl={coverUrl}
                mediaUrl={mediaUrl}
                isAudio={isAudio}
                isDirectVideo={isDirectVideo && !isEmbed}
                isEmbed={isEmbed}
                embedSrc={embedSrc}
                isOwner={canManage}
                relatedFromPublisher={relatedFromPublisher}
              />
            </div>
          ) : null}

          {showArticleBody ? (
            <div className="mt-8">
              <BodyBlocks
                body={p.body}
                content={p.content}
                summary={p.summary}
                excerpt={p.excerpt}
                whatThisMeans={(p as { whatThisMeans?: string }).whatThisMeans}
                questionNobodyAsks={
                  (p as { questionNobodyAsks?: string }).questionNobodyAsks
                }
              />
            </div>
          ) : null}

          {showMusicLyrics ? (
            <div className="mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Lyrics
              </p>
              <div className="mt-3">
                <BodyBlocks body={p.body} content={p.content} />
              </div>
            </div>
          ) : null}

          {showFollow || publisher ? (
            <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-start gap-3">
                <Link href={publisherHref || `#`} className="shrink-0">
                  <OmnivAvatar src={avatarSrc} name={publisherName} size={48} />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {publisherHref ? (
                      <Link
                        href={publisherHref}
                        className="font-semibold text-white hover:underline"
                      >
                        {publisherName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-white">{publisherName}</span>
                    )}
                    {verified && publisher ? (
                      <VerifiedBadge
                        name={publisherName}
                        verifyType={publisher.type}
                        size={16}
                      />
                    ) : null}
                  </div>
                  {publisher?.tagline ? (
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-zinc-500">
                      {publisher.tagline}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            <KeepExploring
              currentPublication={p}
              entities={exploreEntities}
              publications={explorePublications}
            />
          </div>

          <PublicationPageFooter
            title={p.title}
            type={p.type || "article"}
            slug={p.slug}
            coverUrl={coverUrl}
            mediaUrl={mediaUrl}
            path={path}
            publisherName={publisherName}
            publisherType={followType}
            publisherSlug={followSlug}
            publisherId={publisher?.id}
            publisherHref={publisherHref}
            showFollow={showFollow}
            moreItems={moreItems}
          />
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
