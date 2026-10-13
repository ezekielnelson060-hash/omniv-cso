import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLivePublication } from "@/lib/discovery/db";
import { publicationMetadata } from "@/lib/discovery/seo";

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
  let supabase = null;
  try {
    supabase = await createClient();
  } catch {
    supabase = null;
  }
  const p = await getLivePublication(supabase, slug);
  if (!p) notFound();
  return (
    <div className="min-h-dvh bg-[#050505] p-8 text-zinc-100">
      <h1 className="text-2xl font-semibold">{p.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Publication page is being restored. Production remains on the last good deploy.
      </p>
    </div>
  );
}
