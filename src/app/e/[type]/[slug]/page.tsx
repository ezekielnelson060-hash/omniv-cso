import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NetworkHeader } from "@/components/discovery/network-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/discovery/contact-form";
import { SaveButton } from "@/components/discovery/save-button";
import { getDiscoveryEntity } from "@/lib/discovery/db";
import {
  ENTITY_LABELS,
  ENTITY_TYPES,
  INTENT_LABELS,
  entityPath,
  type EntityType,
} from "@/lib/discovery/types";

type Props = { params: Promise<{ type: string; slug: string }> };

async function tryClient() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  const supabase = await tryClient();
  const e = await getDiscoveryEntity(supabase, type, slug);
  if (!e) return { title: "Not found" };
  return {
    title: e.name,
    description: e.tagline,
  };
}

export default async function EntityPage({ params }: Props) {
  const { type, slug } = await params;
  if (!ENTITY_TYPES.includes(type as EntityType)) notFound();

  const supabase = await tryClient();
  const e = await getDiscoveryEntity(supabase, type, slug);
  if (!e) notFound();

  const initial = e.name.slice(0, 1).toUpperCase();
  const path = entityPath(e);

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

        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-omniv-gold/40 to-zinc-800 text-2xl font-semibold text-white ring-1 ring-white/10">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {ENTITY_LABELS[e.type]}
              {e.location ? ` · ${e.location}` : ""}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {e.name}
            </h1>
            <p className="mt-2 text-[16px] text-zinc-400">{e.tagline}</p>
          </div>
        </div>

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

        <div className="mt-8 flex flex-wrap gap-3">
          <SaveButton type={e.type} slug={e.slug} name={e.name} />
          <Link
            href="/publish"
            className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[13px] text-zinc-300"
          >
            Publish yours
          </Link>
        </div>

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

        <div className="mt-12 border-t border-white/10 pt-8">
          <ContactForm entityName={e.name} entityPath={path} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
