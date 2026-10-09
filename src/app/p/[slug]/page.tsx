import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaveButton } from "@/components/discovery/save-button";
import { ShareButton } from "@/components/discovery/share-button";
import { PublicationPageActions } from "@/components/discovery/publication-page-actions";
import { FollowButton } from "@/components/discovery/follow-button";
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
  getDiscoveryEntity,
  getLivePublication,
  type LivePublication,
  type LiveEntity,
} from "@/lib/discovery/db";
import { getEntityById } from "@/lib/discovery/seed";
import {
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
} from "@/lib/discovery/types";
import { coverFor, ctaFor } from "@/lib/discovery/seed-covers";
import { publicationMetadata } from "@/lib/discovery/seo";
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

function BodyBlocks({
  body,
  content,
  summary,
  excerpt,
  whatThisMeans,
  questionNobodyAsks,
}: {
  body?: string;
  content?: unknown;
  summary?: string;
  excerpt?: string;
  whatThisMeans?: string;
  questionNobodyAsks?: string;
}) {
  const displayBody = typeof body === "string" && body ? body : "";
  const blocks: { type: string; text: string; level?: number }[] = [];

  try {
    if (Array.isArray(content) && content.length) {
      for (const b of content) {
        if (!b || typeof b !== "object") continue;
        const type = String((b as { type?: unknown }).type || "");
        const text = (b as { text?: unknown }).text;
        if (type === "divider") {
          blocks.push({ type: "divider", text: "" });
          continue;
        }
        if (typeof text === "string" && text.trim()) {
          blocks.push({
            type: type || "paragraph",
            text,
            level: Number((b as { level?: unknown }).level) || undefined,
          });
        }
      }
    }
  } catch {
    /* ignore */
  }

  if (!blocks.length && displayBody) {
    for (const para of displayBody.split(/\n\n+/)) {
      const t = para.trim();
      if (!t) continue;
      if (t.startsWith("## "))
        blocks.push({ type: "heading", text: t.slice(3), level: 2 });
      else if (t.startsWith("### "))
        blocks.push({ type: "heading", text: t.slice(4), level: 3 });
      else if (t.startsWith("> "))
        blocks.push({ type: "quote", text: t.slice(2) });
      else blocks.push({ type: "paragraph", text: t });
    }
  }

  // Avoid duplicating the same text as lead + first paragraph
  const lead = excerpt || summary || "";
  const leadNorm = lead.replace(/\s+/g, " ").trim().slice(0, 120);
  const firstBlockNorm =
    blocks[0]?.text?.replace(/\s+/g, " ").trim().slice(0, 120) || "";
  const showLead = Boolean(lead) && leadNorm !== firstBlockNorm;

  return (
    <>
      {showLead ? (
        <p className="text-[19px] font-medium leading-[1.75] text-zinc-200">
          {lead}
        </p>
      ) : null}

      {blocks.length > 0 ? (
        <div className={`space-y-7 ${showLead ? "mt-8" : ""}`}>
          {blocks.map((block, index) => {
            if (block.type === "divider") {
              return (
                <hr
                  key={index}
                  className="border-0 border-t border-white/10"
                />
              );
            }
            if (block.type === "heading" || block.type === "subheading") {
              const Tag = block.level === 3 ? "h3" : "h2";
              return (
                <Tag
                  key={index}
                  className="text-[22px] font-semibold leading-snug text-white"
                >
                  {block.text}
                </Tag>
              );
            }
            if (block.type === "quote") {
              return (
                <blockquote
                  key={index}
                  className="border-l-2 border-omniv-gold/60 pl-4 text-[17px] italic leading-relaxed text-zinc-300"
                >
                  {block.text}
                </blockquote>
              );
            }
            return (
              <p
                key={index}
                className="text-[17px] leading-[1.85] text-zinc-300"
              >
                {block.text}
              </p>
            );
          })}
        </div>
      ) : null}

      {whatThisMeans ? (
        <section className="mt-16 border-t border-white/10 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            What this means
          </p>
          <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">
            {whatThisMeans}
          </p>
        </section>
      ) : null}

      {questionNobodyAsks ? (
        <section className="mt-8 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/[0.06] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            The question nobody asks
          </p>
          <p className="mt-3 text-[20px] font-medium leading-snug text-white">
            {questionNobodyAsks}
          </p>
        </section>
      ) : null}
    </>
  );
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

  let currentUser = null;
  try {
    if (supabase) currentUser = (await supabase.auth.getUser()).data.user;
  } catch {
    /* guest */
  }
  const canManage = Boolean(currentUser && p.ownerId === currentUser.id);

  const publisher = await resolvePublisher(supabase, p);
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

  const path = publicationPath({ slug: p.slug, type: p.type });
  const bodyText =
    (typeof p.body === "string" && p.body) || p.summary || "";
  const mins = readMinutes(bodyText);
  const hero = HERO[p.type] || "from-zinc-800 to-[#050505]";
  const coverUrl = p.coverUrl || coverFor(p.slug) || null;
  let resolvedCta: { label: string; href: string } | null = null;
  try {
    resolvedCta = ctaFor(p.slug) || p.cta || null;
  } catch {
    resolvedCta = p.cta || null;
  }
  const typeLabel =
    PUBLICATION_LABELS[p.type as keyof typeof PUBLICATION_LABELS] ||
    p.type ||
    "Publication";

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
                {canManage ? (
                  <PublisherPublicationMenu
                    id={p.id}
                    slug={p.slug}
                    title={p.title}
                    visibility={p.visibility}
                    status={p.status}
                  />
                ) : null}
              </div>
            </div>

            <div className="mt-auto">
              <span className="inline-flex items-center rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                {typeLabel}
              </span>
              <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[40px]">
                {p.title}
              </h1>
              {p.subtitle ? (
                <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-zinc-200 sm:text-[17px]">
                  {p.subtitle}
                </p>
              ) : null}

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

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
          <BodyBlocks
            body={p.body}
            content={p.content}
            summary={p.summary}
            excerpt={p.excerpt}
            whatThisMeans={p.whatThisMeans}
            questionNobodyAsks={p.questionNobodyAsks}
          />

          {resolvedCta ? (
            <a
              href={resolvedCta.href}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black transition hover:bg-omniv-gold/90"
            >
              {resolvedCta.label}
            </a>
          ) : null}

          {publisher && publisher.type && publisher.slug ? (
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
                      }) ? (
                        <VerifiedBadge
                          name={publisher.name}
                          verifyType={publisher.type}
                          size={14}
                          className="relative top-px shrink-0"
                        />
                      ) : null}
                    </p>
                    {publisher.tagline ? (
                      <p className="truncate text-[12px] text-zinc-500">
                        {publisher.tagline}
                      </p>
                    ) : null}
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
          ) : null}

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
