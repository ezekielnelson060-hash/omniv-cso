import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NetworkHeader } from "@/components/discovery/network-header";
import { SiteFooter } from "@/components/site-footer";
import { SaveButton } from "@/components/discovery/save-button";
import { FollowButton } from "@/components/discovery/follow-button";
import { getEntityById, getPublication } from "@/lib/discovery/seed";
import {
  PUBLICATION_LABELS,
  entityPath,
} from "@/lib/discovery/types";

type Props = { params: Promise<{ slug: string }> };

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

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-10">
        <div className="flex items-center justify-between">
          <Link
            href="/explore"
            className="text-[12px] text-zinc-500 hover:text-omniv-gold"
          >
            ← Explore
          </Link>
          <SaveButton
            kind="publication"
            type={p.type}
            slug={p.slug}
            name={p.title}
            pubType={p.type}
            variant="icon"
          />
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {PUBLICATION_LABELS[p.type]}
          {p.meta ? ` · ${p.meta}` : ""}
          {p.location ? ` · ${p.location}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {p.title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-zinc-400">
          {p.summary}
        </p>

        {publisher && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <Link
              href={entityPath(publisher)}
              className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/20 text-sm font-semibold text-omniv-gold">
                {publisher.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-white">
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
        )}

        {p.body && (
          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
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
            className="mt-10 inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-medium text-black"
          >
            {p.cta.label}
          </a>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
