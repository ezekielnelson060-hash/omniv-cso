import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NetworkHeader } from "@/components/discovery/network-header";
import { SiteFooter } from "@/components/site-footer";
import { getEntity } from "@/lib/discovery/seed";
import {
  ENTITY_LABELS,
  ENTITY_TYPES,
  INTENT_LABELS,
  type EntityType,
} from "@/lib/discovery/types";

type Props = { params: Promise<{ type: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  const e = getEntity(type, slug);
  if (!e) return { title: "Not found" };
  return {
    title: e.name,
    description: e.tagline,
  };
}

export default async function EntityPage({ params }: Props) {
  const { type, slug } = await params;
  if (!ENTITY_TYPES.includes(type as EntityType)) notFound();
  const e = getEntity(type, slug);
  if (!e) notFound();

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-10">
        <Link
          href="/explore"
          className="text-[12px] text-zinc-500 transition hover:text-omniv-gold"
        >
          ← Explore
        </Link>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {ENTITY_LABELS[e.type]}
          {e.location ? ` · ${e.location}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {e.name}
        </h1>
        <p className="mt-2 text-[16px] text-zinc-400">{e.tagline}</p>

        {e.intents.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {e.intents.map((i) => (
              <Link
                key={i.kind + (i.detail ?? "")}
                href={`/explore?intent=${i.kind}`}
                className="rounded-full border border-omniv-gold/35 bg-omniv-gold/10 px-3 py-1 text-[12px] text-omniv-gold"
              >
                {INTENT_LABELS[i.kind]}
                {i.detail ? ` · ${i.detail}` : ""}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 space-y-3 border-t border-white/10 pt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            About
          </h2>
          <p className="text-[15px] leading-relaxed text-zinc-300">{e.about}</p>
        </div>

        {e.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {e.tags.map((t) => (
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

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={`mailto:hello@omniv.media?subject=${encodeURIComponent(`Omniv: ${e.name}`)}`}
            className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-medium text-black"
          >
            Contact
          </a>
          <Link
            href="/signup?from=publish"
            className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[13px] text-zinc-300"
          >
            Publish yours
          </Link>
        </div>

        {e.links && e.links.length > 0 && (
          <ul className="mt-8 space-y-2 border-t border-white/10 pt-6">
            {e.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-omniv-gold hover:underline"
                >
                  {l.label} →
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
