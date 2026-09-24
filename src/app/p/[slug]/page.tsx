import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaveButton } from "@/components/discovery/save-button";
import { FollowButton } from "@/components/discovery/follow-button";
import { BottomNav } from "@/components/discovery/bottom-nav";
import {
  getEntityById,
  getPublication,
  publicationsByPublisher,
} from "@/lib/discovery/seed";
import {
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
} from "@/lib/discovery/types";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPublication(slug);
  if (!p) return { title: "Not found" };
  return { title: p.title, description: p.summary };
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const p = getPublication(slug);
  if (!p) notFound();
  const publisher = getEntityById(p.publisherId);
  const related = publisher
    ? publicationsByPublisher(publisher.id)
        .filter((x) => x.id !== p.id)
        .slice(0, 3)
    : [];
  const hero = HERO[p.type] ?? "from-zinc-800 to-[#050505]";

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      {/* Immersive header */}
      <div className={`relative bg-gradient-to-b ${hero} pb-8 pt-4`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-between">
            <Link
              href="/explore"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
              aria-label="Back"
            >
              ←
            </Link>
            <div className="flex items-center gap-1">
              <SaveButton
                kind="publication"
                type={p.type}
                slug={p.slug}
                name={p.title}
                pubType={p.type}
                variant="icon"
              />
            </div>
          </div>

          <span className="mt-8 inline-block rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/15">
            {PUBLICATION_LABELS[p.type]}
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
            {p.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-zinc-300">
            {publisher && (
              <Link
                href={entityPath(publisher)}
                className="flex items-center gap-1.5 font-medium hover:text-white"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-omniv-gold/30 text-[10px] font-bold text-omniv-gold">
                  {publisher.name.charAt(0)}
                </span>
                {publisher.name}
              </Link>
            )}
            {p.meta && (
              <>
                <span className="text-zinc-600">·</span>
                <span>{p.meta}</span>
              </>
            )}
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
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
        <p className="text-[16px] leading-relaxed text-zinc-400">{p.summary}</p>

        {p.body && (
          <div className="mt-8 space-y-4 border-t border-white/10 pt-8">
            {p.body.split("\n\n").map((para, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-zinc-300">
                {para}
              </p>
            ))}
          </div>
        )}

        {p.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <Link
                key={t}
                href={`/explore?q=${encodeURIComponent(t)}`}
                className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-zinc-500 hover:text-zinc-300"
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {p.cta && (
          <a
            href={p.cta.href}
            className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-medium text-black"
          >
            {p.cta.label}
          </a>
        )}

        {publisher && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Publisher
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Link
                href={entityPath(publisher)}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold/20 text-base font-semibold text-omniv-gold">
                  {publisher.name.slice(0, 1)}
                </div>
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

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
              More from {publisher?.name}
            </h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={publicationPath(r)}
                    className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-3 transition hover:border-white/25"
                  >
                    <div className="min-w-0">
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
              ))}
            </ul>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
