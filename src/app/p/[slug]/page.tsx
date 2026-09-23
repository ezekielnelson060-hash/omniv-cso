import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NetworkHeader } from "@/components/discovery/network-header";
import { SiteFooter } from "@/components/site-footer";
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
        <Link
          href="/explore"
          className="text-[12px] text-zinc-500 hover:text-omniv-gold"
        >
          ← Explore
        </Link>

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
          <Link
            href={entityPath(publisher)}
            className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/25"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omniv-gold/20 text-sm font-semibold text-omniv-gold">
              {publisher.name.slice(0, 1)}
            </div>
            <div>
              <p className="text-[14px] font-medium text-white">{publisher.name}</p>
              <p className="text-[12px] text-zinc-500">{publisher.tagline}</p>
            </div>
          </Link>
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
