import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog — Career moves for independent artists",
  description:
    "Guides on monetization, fan mapping, sync licensing, owned audiences, and ticketed listening parties.",
  alternates: { canonical: "https://omniv.media/blog" },
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-12 text-omniv-text">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
        Omniv blog
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Career moves for independents
      </h1>
      <p className="mt-2 text-[14px] text-omniv-text-secondary">
        Practical playbooks — rooms, lists, sync, and money — not algorithm
        myths.
      </p>
      <ul className="mt-10 space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="block rounded-2xl border border-omniv-border bg-omniv-card p-4 transition hover:border-omniv-gold/40"
            >
              <p className="text-[11px] text-omniv-text-muted">{p.date}</p>
              <h2 className="mt-1 text-[16px] font-semibold tracking-tight">
                {p.title}
              </h2>
              <p className="mt-1 text-[13px] text-omniv-text-muted">
                {p.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center text-[13px]">
        <Link href="/" className="text-omniv-gold underline-offset-2 hover:underline">
          ← Back to Omniv
        </Link>
      </p>
    </main>
  );
}
