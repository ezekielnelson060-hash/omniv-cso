import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog — Career moves for independent artists",
  description:
    "Guides on demand, cities, rooms, owned audiences, AI strategy, and money beyond streaming.",
  alternates: { canonical: "https://omniv.media/blog" },
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 py-12 text-omniv-text">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
        Omniv blog
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        Career moves for independents
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] text-omniv-text-secondary">
        Own the list. Open the room. Get paid. Practical playbooks on demand,
        cities, and the next move — not algorithm myths.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-omniv-border bg-omniv-card transition hover:border-omniv-gold/40"
          >
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt=""
                className="aspect-[16/10] w-full object-cover object-center transition group-hover:scale-[1.02]"
              />
            ) : (
              <div className="aspect-[16/10] w-full bg-omniv-elevated" />
            )}
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-[15px] font-semibold leading-snug tracking-tight text-omniv-text group-hover:text-omniv-gold">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-omniv-text-muted">
                {p.description}
              </p>
              <p className="mt-3 text-[11px] text-omniv-text-muted">{p.date}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-center text-[13px]">
        <Link
          href="/"
          className="text-omniv-gold underline-offset-2 hover:underline"
        >
          ← Back to Omniv
        </Link>
      </p>
    </main>
  );
}
