import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Partners",
  description: "Organizations and tools partnering with the Omniv discovery network.",
  alternates: { canonical: "https://omniv.media/partners" },
};

const PARTNERS = [
  {
    name: "RealMuZick",
    tagline: "Creator tools & promotion resources",
    blurb:
      "Practical tools for people who publish and promote work — contact lists, release utilities, and studio helpers.",
    href: "https://learn-with-real-muzick.vercel.app/?ref=omniv",
    cta: "Visit RealMuZick",
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Omniv"
              width={28}
              height={28}
              className="rounded-md"
              priority
            />
            <span className="text-[15px] font-semibold tracking-tight">Omniv</span>
          </Link>
          <Link href="/explore" className="text-[13px] text-omniv-gold hover:underline">
            Explore
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
          Partners
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Partners on the network
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-400">
          Omniv is a discovery network. These are organizations we list while we
          actively partner — not endorsements of every product they sell.
        </p>

        <ul className="mt-10 space-y-4">
          {PARTNERS.map((p) => (
            <li
              key={p.name}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-[17px] font-semibold text-white">{p.name}</p>
              <p className="mt-1 text-[13px] text-omniv-gold">{p.tagline}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">{p.blurb}</p>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black transition hover:bg-omniv-gold/90"
              >
                {p.cta} →
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-[13px] text-zinc-500">
          Want to partner?{" "}
          <Link href="/contact" className="text-zinc-300 hover:text-white">
            Contact us
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
