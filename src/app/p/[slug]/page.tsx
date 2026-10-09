import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaveButton } from "@/components/discovery/save-button";
import { ShareButton } from "@/components/discovery/share-button";
import { PublicationPageActions } from "@/components/discovery/publication-page-actions";
import { PublicationBody } from "@/components/discovery/publication-body";
import { StickyArticleHeader } from "@/components/discovery/sticky-article-header";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { OmnivAvatar } from "@/components/discovery/omniv-avatar";
import {
  VerifiedBadge,
  isAlwaysVerified,
} from "@/components/discovery/verified-badge";
import { createClient } from "@/lib/supabase/server";
import {
  getDiscoveryEntity,
  getLivePublication,
  type LivePublication,
  type LiveEntity,
} from "@/lib/discovery/db";
import { getEntityById } from "@/lib/discovery/seed";
import {
  PUBLICATION_LABELS,
  publicationPath,
} from "@/lib/discovery/types";
import { coverFor } from "@/lib/discovery/seed-covers";
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
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function extractBodyText(p: LivePublication): string {
  try {
    if (p.body && typeof p.body === "string") return p.body;
    if (Array.isArray(p.content)) {
      const joined = p.content
        .map((b) => {
          if (!b || typeof b !== "object") return "";
          const t = (b as { text?: unknown }).text;
          return typeof t === "string" ? t : "";
        })
        .filter(Boolean)
        .join(" ");
      if (joined) return joined;
    }
  } catch {
    /* ignore */
  }
  return p.summary || "";
}

async function resolvePublisher(
  supabase: Awaited<ReturnType<typeof createClient>> | null,
  p: LivePublication
): Promise<LiveEntity | null> {
  try {
    if (p.publisherId) {
      const seed = getEntityById(p.publisherId);
      if (seed) return seed as LiveEntity;
    }
    const name = (p.publisherName || "").toLowerCase().trim();
    if (name.includes("omniv")) {
      const editorial = await getDiscoveryEntity(
        supabase,
        "company",
        "omniv-editorial"
      );
      if (editorial) return editorial;
      const omniv = await getDiscoveryEntity(supabase, "company", "omniv");
      if (omniv) return omniv;
    }
  } catch {
    /* ignore */
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
      /* */
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
    /* */
  }

  const p = await getLivePublication(supabase, slug);
  if (!p) notFound();

  const publisher = await resolvePublisher(supabase, p);
  const publisherName = publisher?.name || p.publisherName || "Publisher";
  const publisherHref =
    resolvePublisherPath({
      type: publisher?.type,
      slug: publisher?.slug,
      name: publisherName,
      publisherId: p.publisherId,
    }) || undefined;

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

  const path = publicationPath({ slug: p.slug, type: p.type });
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const bodyText = extractBodyText(p);
  const mins = readMinutes(bodyText);
  const hero = HERO[p.type] || "from-zinc-800 to-[#050505]";
  const coverUrl = p.coverUrl || coverFor(p.slug) || null;
  const typeLabel =
    PUBLICATION_LABELS[p.type as keyof typeof PUBLICATION_LABELS] ||
    p.type ||
    "Publication";

  let articleLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    url: `${origin}${path}`,
  };
  try {
    articleLd = publicationJsonLd(p, origin) as Record<string, unknown>;
  } catch {
    /* */
  }

  let publishedLabel = "";
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

  // Sanitize content for body renderer
  const safeContent = Array.isArray(p.content)
    ? p.content.filter((b) => b && typeof b === "object" && "type" in b)
    : undefined;

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <script
          type="application/ld+json"
          id={`publication-${p.slug}`}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleLd).replace(/</g, "\\u003c"),
          }}
        />
        <StickyArticleHeader title={p.title || "Article"} backHref="/home" />

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
              <ShareButton title={p.title} path={path} />
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
                    {showVerified ? (
                      <VerifiedBadge
                        name={publisherName}
                        verifyType={publisher?.type || "company"}
                        size={14}
                        className="relative top-px"
                      />
                    ) : null}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <OmnivAvatar
                      src={avatarSrc}
                      name={publisherName}
                      size={24}
                    />
                    <span className="leading-none">{publisherName}</span>
                    {showVerified ? (
                      <VerifiedBadge
                        name={publisherName}
                        verifyType="company"
                        size={14}
                        className="relative top-px"
                      />
                    ) : null}
                  </span>
                )}
                <span className="text-zinc-600">·</span>
                <span>{p.readingTime || mins} min read</span>
                {publishedLabel ? (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span>{publishedLabel}</span>
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
                />
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-2">
          <PublicationBody
            slug={p.slug}
            type={p.type || "article"}
            summary={p.summary}
            excerpt={p.excerpt}
            body={p.body}
            content={safeContent}
            whatThisMeans={p.whatThisMeans}
            questionNobodyAsks={p.questionNobodyAsks}
            sources={Array.isArray(p.sources) ? p.sources : undefined}
          />

          <div className="mt-10 flex flex-wrap gap-2">
            <SaveButton
              kind="publication"
              type={p.type || "article"}
              slug={p.slug}
              name={p.title}
              pubType={p.type || "article"}
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
