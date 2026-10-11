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
import { isAlwaysVerified } from "@/lib/discovery/verified";
import { createClient } from "@/lib/supabase/server";
import {
  getDiscoveryEntity,
  getEntityByIdLive,
  getLivePublication,
  listDiscoveryEntities,
  listLivePublications,
  type LivePublication,
  type LiveEntity,
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

function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function resolvePublisher(
  supabase: Awaited<ReturnType<typeof createClient>> | null,
  p: LivePublication
): Promise<LiveEntity | null> {
  try {
    if (p.publisherId) {
      const byId = await getEntityByIdLive(supabase, p.publisherId);
      if (byId) return byId;
    }
    const name = (p.publisherName || "").toLowerCase().trim();
    if (name.includes("omniv") || !p.publisherId) {
      for (const slug of ["omniv-editorial", "omniv", "omniv-media"]) {
        const e = await getDiscoveryEntity(supabase, "company", slug);
        if (e) return e;
      }
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
  if (!blocks.length && typeof body === "string" && body) {
    for (const para of body.split(/\n\n+/)) {
      const t = para.trim();
      if (!t) continue;
      if (t.startsWith("## ")) blocks.push({ type: "heading", text: t.slice(3), level: 2 });
      else if (t.startsWith("> ")) blocks.push({ type: "quote", text: t.slice(2) });
      else blocks.push({ type: "paragraph", text: t });
    }
  }
  const lead = excerpt || summary || "";
  const leadNorm = lead.replace(/\s+/g, " ").trim().slice(0, 120);
  const firstNorm = blocks[0]?.text?.replace(/\s+/g, " ").trim().slice(0, 120) || "";
  const showLead = Boolean(lead) && leadNorm !== firstNorm;

  return (
    <>
      {showLead ? (
        <p className="text-[19px] font-medium leading-[1.75] text-zinc-200">{lead}</p>
      ) : null}
      {blocks.map((b, i) => {
        if (b.type === "divider") {
          return <hr key={i} className="my-8 border-white/[0.08]" />;
        }
        if (b.type === "heading") {
          return (
            <h2 key={i} className="mt-10 text-[22px] font-semibold tracking-tight text-white">
              {b.text}
            </h2>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-6 border-l-2 border-omniv-gold/50 pl-4 text-[17px] italic leading-relaxed text-zinc-300"
            >
              {b.text}
            </blockquote>
          );
        }
        return (
          <p key={i} className="mt-5 text-[17px] leading-[1.8] text-zinc-200">
            {b.text}
          </p>
        );
      })}
      {whatThisMeans ? (
        <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
            What this means
          </p>
          <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">{whatThisMeans}</p>
        </div>
      ) : null}
      {questionNobodyAsks ? (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            The question nobody asks
          </p>
          <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">
            {questionNobodyAsks}
          </p>
        </div>
      ) : null}
    </>
  );
}

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
    resolvePublisherPath({
      publisherId: p.publisherId,
      publisherName: p.publisherName,
      entity: publisher,
    }) || (publisher ? entityPath(publisher) : null);

  const path = publicationPath(p);
  const typeLabel =
    PUBLICATION_LABELS[(p.type as keyof typeof PUBLICATION_LABELS) || "article"] ||
    "Article";
  const coverUrl =
    (p as { coverUrl?: string | null }).coverUrl || coverFor(p.slug) || null;
  const avatarSrc = publisher
    ? resolveEntityAvatar(publisher)
    : null;
  const verified =
    Boolean(publisher?.verified) ||
    isAlwaysVerified(publisherName) ||
    isAlwaysVerified(publisher?.slug || "");

  let bodyText = "";
  try {
    if (typeof p.body === "string") bodyText = p.body;
    else if (Array.isArray(p.content)) {
      bodyText = p.content
        .map((b: { text?: string }) => (typeof b?.text === "string" ? b.text : ""))
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
    listLivePublications(supabase, 40),
    listDiscoveryEntities(supabase, 24),
  ]);
  const explorePublications = seededShuffle(
    liveAll.filter((x) => x.slug !== p.slug),
    slug
  ).slice(0, 8);
  const exploreEntities = seededShuffle(entities, slug + "-e").slice(0, 8);

  const hero = HERO[p.type || "article"] || HERO.article;

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
                      <VerifiedBadge name={publisherName} verifyType="company" size={16} />
                    ) : null}
                  </span>
                )}
                <span className="leading-none text-zinc-600">·</span>
                <span className="leading-none">{mins} min read</span>
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
            body={typeof p.body === "string" ? p.body : undefined}
            content={p.content}
            summary={p.summary}
            excerpt={p.excerpt}
            whatThisMeans={p.whatThisMeans}
            questionNobodyAsks={p.questionNobodyAsks}
          />

          {publisher ? (
            <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <OmnivAvatar src={avatarSrc} name={publisherName} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {publisherHref ? (
                      <Link
                        href={publisherHref}
                        className="truncate text-[15px] font-semibold text-white hover:underline"
                      >
                        {publisherName}
                      </Link>
                    ) : (
                      <span className="truncate text-[15px] font-semibold text-white">
                        {publisherName}
                      </span>
                    )}
                    {verified ? (
                      <VerifiedBadge
                        name={publisherName}
                        verifyType={publisher.type}
                        size={16}
                      />
                    ) : null}
                  </div>
                  {publisher.tagline ? (
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-zinc-500">
                      {publisher.tagline}
                    </p>
                  ) : null}
                </div>
                {publisherHref && !canManage ? (
                  <FollowButton type={publisher.type} slug={publisher.slug} />
                ) : null}
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

          <div className="mt-8 flex justify-center">
            <SaveButton
              type="publication"
              slug={p.slug}
              name={p.title}
              variant="button"
            />
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
