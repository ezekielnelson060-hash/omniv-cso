import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDiscoveryEntity } from "@/lib/discovery/db";
import { entityPath } from "@/lib/discovery/types";
import { VerifiedBadge } from "@/components/discovery/verified-badge";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

type Props = { params: Promise<{ type: string; slug: string }> };

export default async function VerifiedPublicPage({ params }: Props) {
  const { type, slug } = await params;
  let supabase = null;
  try {
    supabase = await createClient();
  } catch {
    /* optional */
  }
  const e = await getDiscoveryEntity(supabase, type, slug);
  if (!e) notFound();

  let log: {
    verified_at?: string;
    verify_type?: string;
    verified_fields?: string[];
    last_reviewed_at?: string;
  } | null = null;

  if (supabase && e.verified) {
    try {
      const { data } = await supabase
        .from("discovery_verification_log")
        .select("verified_at, verify_type, verified_fields, last_reviewed_at")
        .eq("entity_type", type)
        .eq("entity_slug", slug)
        .order("verified_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      log = data;
    } catch {
      /* table may not exist */
    }
  }

  const path = entityPath(e);
  const verifiedAt = log?.verified_at || e.publishedAt;
  const fields = log?.verified_fields || [
    "Organization identity",
    "Authorized representative",
    "Official contact",
  ];

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="border-b border-white/[0.05] px-4 py-3">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <Link href={path} className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Verification</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-semibold text-white">{e.name}</h2>
            {e.verified && (
              <VerifiedBadge name={e.name} verifiedAt={verifiedAt} />
            )}
          </div>

          {e.verified ? (
            <>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">
                Verified by Omniv
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">
                Omniv has verified the identity of this {e.type} and confirmed
                that this account is associated with it. Verification establishes
                authenticity — not endorsement.
              </p>

              <div className="mt-8 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                  Verified information
                </p>
                <ul className="mt-3 space-y-2">
                  {fields.map((f) => (
                    <li key={f} className="flex gap-2 text-[14px] text-zinc-300">
                      <span className="text-omniv-gold">✓</span>
                      {f.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
                {verifiedAt && (
                  <p className="mt-4 text-[12px] text-zinc-600">
                    Verified{" "}
                    {new Date(verifiedAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]">
              <p className="text-[15px] font-medium text-white">Not verified</p>
              <p className="mt-2 text-[13px] text-zinc-500">
                This identity has not completed Omniv verification.
              </p>
              <Link
                href="/verify"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
              >
                Apply for verification
              </Link>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
