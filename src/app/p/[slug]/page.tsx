import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaveButton } from "@/components/discovery/save-button";
import { ShareButton } from "@/components/discovery/share-button";
import { PublicationPageActions } from "@/components/discovery/publication-page-actions";
import { FollowButton } from "@/components/discovery/follow-button";
import { StickyArticleHeader } from "@/components/discovery/sticky-article-header";
import { KeepExploring } from "@/components/discovery/keep-exploring";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { OmnivAvatar } from "@/components/discovery/omniv-avatar";
import { VerifiedBadge } from "@/components/discovery/verified-badge";
import { StructuredData } from "@/components/StructuredData";
import {
  getDiscoveryPublication,
  listLivePublications,
  listDiscoveryEntities,
} from "@/lib/discovery/db";
import { BodyBlocks } from "@/components/discovery/body-blocks";
import {
  PUBLICATION_LABELS,
  publicationPath,
  entityPath,
} from "@/lib/discovery/types";
import { isAlwaysVerified } from "@/lib/discovery/verified";

type Props = {
  params: Promise<{ slug: string }>;
};

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

async function resolvePublisher(
  supabase: Awaited<ReturnType<typeof tryClient>>,
  p: {
    publisherId?: string | null;
    publisherName?: string | null;
    ownerId?: string | null;
  }
) {
  if (!supabase) return null;
  try {
    if (p.publisherId) {
      const { data } = await supabase
        .from("discovery_entities")
        .select("id, type, slug, name, avatar_url, verified")
        .eq("id", p.publisherId)
        .maybeSingle();
      if (data) return data;
    }
    if (p.publisherName) {
      const { data } = await supabase
        .from("discovery_entities")
        .select("id, type, slug, name, avatar_url, verified")
        .ilike("name", p.publisherName)
        .limit(1)
        .maybeSingle();
      if (data) return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await tryClient();
  const p = await getDiscoveryPublication(supabase, slug);
  if (!p) return { title: "Not found" };
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const url = `${origin}/p/${slug}`;
  const image =
    (p as { coverUrl?: string | null }).coverUrl ||
    `${origin}/opengraph-image`;
  return {
    title: p.title,
    description: p.summary || p.excerpt || undefined,
    metadataBase: new URL(origin),
    alternates: { canonical: url },
    openGraph: {
      title: p.title,
      description: p.summary || p.excerpt || undefined,
      url,
      type: "article",
      siteName: "Omniv",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.summary || p.excerpt || undefined,
      images: [image],
    },
  };
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await tryClient();
  const p = await getDiscoveryPublication(supabase, slug);
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
    publisher && publisher.type && publisher.slug
      ? entityPath({
          type: publisher.type,
          slug: publisher.slug,
        } as { type: string; slug: string })
      : null;

  const path = publicationPath(p);
  const typeLabel =
    PUBLICATION_LABELS[(p.type as keyof typeof PUBLICATION_LABELS) || "article"] ||
    "Article";
  const coverUrl = (p as { coverUrl?: string | null }).coverUrl || null;
  const avatarSrc =
    (publisher as { avatar_url?: string | null } | null)?.avatar_url || null;
  const verified =
    Boolean((publisher as { verified?: boolean } | null)?.verified) ||
    isAlwaysVerified(publisherName) ||
    isAlwaysVerified(publisher?.slug || "");

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

  const liveAll = await listLivePublications(supabase, 40);
  const entities = await listDiscoveryEntities(supabase, 24);
  const explorePublications = liveAll.filter((x) => x.slug !== p.slug).slice(0, 8);
  const exploreEntities = entities.slice(0, 8);

  const hero = coverUrl
    ? ""
    : "from-zinc-800 via-zinc-900 to-[#050505]";

  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media").replace(
    /\/$/,
    ""
  );
  const pageUrl = `${origin}${path}`;

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
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
              </div>
            </div>

            <div className="mt-auto">
              <span className="inline-flex items-center rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                {typeLabel}
              </span>
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
                    {verified ? (
                      <VerifiedBadge
                        name={publisherName}
                        verifyType="company"
                        size={16}
                      />
                    ) : null}
                  </span>
                )}
                {p.readMinutes ? (
                  <>
                    <span className="leading-none text-zinc-600">·</span>
                    <span className="leading-none">{p.readMinutes} min read</span>
                  </>
                ) : null}
                {publishedLabel ? (
                  <>
                    <span className="leading-none text-zinc-600">·</span>
                    <span className="leading-none">{publishedLabel}</span>
                  </>
                ) : null}
              </div>

              <div className="mt-4 -mx-1 rounded-xl bg-black/25 px-1 py-0.5 backdrop-blur-sm">
                <PublicationPageActions
                  id={p.id}
                  slug={p.slug}
                  type={p.type || "article"}
                  title={p.title}
                  path={path}
                  publishedAt={p.publishedAt}
                  heat={p.heat}
                  tags={Array.isArray(p.tags) ? p.tags : []}
                  category={p.category}
                  publisherId={p.publisherId}
                  publisherName={publisherName}
                  visibility={p.visibility || "public"}
                  status={p.status || "published"}
                  isOwner={canManage}
                />
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
          <BodyBlocks
            body={p.body}
            content={p.content}
            summary={p.summary}
            excerpt={p.excerpt}
            whatThisMeans={p.whatThisMeans}
            questionNobodyAsks={p.questionNobodyAsks}
          />

          <KeepExploring
            currentPublication={p}
            entities={exploreEntities}
            publications={explorePublications}
          />
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
