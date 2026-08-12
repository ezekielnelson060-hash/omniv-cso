import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allSlugs, getPost } from "@/lib/blog/posts";
import { StructuredData } from "@/components/StructuredData";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://omniv.media/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://omniv.media/blog/${post.slug}`,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const pageUrl = `https://omniv.media/blog/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: `${post.date}T08:00:00+01:00`,
    dateModified: `${post.date}T08:00:00+01:00`,
    author: {
      "@type": "Organization",
      name: "Omniv",
      url: "https://omniv.media/",
    },
    publisher: {
      "@type": "Organization",
      name: "Omniv",
      logo: {
        "@type": "ImageObject",
        url: "https://omniv.media/logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://omniv.media/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://omniv.media/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-12 text-omniv-text">
      <StructuredData id={`article-${post.slug}`} data={articleLd} />
      <StructuredData id={`crumb-${post.slug}`} data={breadcrumbLd} />
      <Link
        href="/blog"
        className="text-[12px] text-omniv-gold underline-offset-2 hover:underline"
      >
        ← All posts
      </Link>
      <p className="mt-4 text-[11px] text-omniv-text-muted">{post.date}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{post.title}</h1>
      <p className="mt-3 text-[15px] text-omniv-text-secondary">{post.description}</p>
      <article className="mt-8 space-y-4 text-[15px] leading-relaxed text-omniv-text-secondary">
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </article>
      <div className="mt-10 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/10 p-4">
        <p className="text-[14px] font-medium text-omniv-text">
          Ready for a ranked next move?
        </p>
        <p className="mt-1 text-[13px] text-omniv-text-muted">
          Scan on Omniv — top city, catalogue gaps, and one clear action.
        </p>
        <Link
          href="/signup"
          className="mt-3 inline-flex rounded-xl bg-omniv-gold px-4 py-2 text-[13px] font-semibold text-omniv-black"
        >
          Start free scan
        </Link>
      </div>
    </main>
  );
}
