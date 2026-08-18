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
  const ogImages = post.image
    ? [{ url: `https://omniv.media${post.image}` }]
    : undefined;
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
      images: ogImages,
    },
  };
}

function Block({ text }: { text: string }) {
  if (text.startsWith("IMG:")) {
    const src = text.slice(4).trim();
    return (
      <div className="my-8 overflow-hidden rounded-2xl border border-omniv-border bg-omniv-elevated">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="aspect-[16/9] w-full object-cover object-center"
        />
      </div>
    );
  }
  if (text.startsWith("### ")) {
    return (
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-omniv-text">
        {text.slice(4)}
      </h3>
    );
  }
  if (text.startsWith("## ")) {
    return (
      <h2 className="mt-10 text-2xl font-semibold tracking-tight text-omniv-text">
        {text.slice(3)}
      </h2>
    );
  }
  const thick =
    text.length < 90 &&
    (text.includes("?") ||
      text === "It usually isn't." ||
      text === "That's useful." ||
      text === "start asking:" ||
      text === "who would show up?" ||
      text.startsWith("How many") ||
      text.startsWith("Which ") ||
      text.startsWith("Where ") ||
      text.startsWith("What ") ||
      text.startsWith("Find the") ||
      text.startsWith("Open the") ||
      text.startsWith("Own the") ||
      text.startsWith("Get paid") ||
      text.startsWith("Then do"));
  if (thick) {
    return (
      <p className="text-[17px] font-medium leading-snug text-omniv-text">
        {text}
      </p>
    );
  }
  return (
    <p className="text-[15px] leading-relaxed text-omniv-text-secondary">
      {text}
    </p>
  );
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
    image: post.image ? `https://omniv.media${post.image}` : undefined,
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
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-[15px] text-omniv-text-secondary">{post.description}</p>
      {post.image && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-omniv-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt=""
            className="aspect-[16/9] w-full object-cover object-center"
          />
        </div>
      )}
      <article className="mt-8 space-y-4">
        {post.body.map((para, i) => (
          <Block key={i} text={para} />
        ))}
      </article>
      <div className="mt-10 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/10 p-4">
        <p className="text-[14px] font-medium text-omniv-text">
          You already have fans. Find out who would show up.
        </p>
        <p className="mt-1 text-[13px] text-omniv-text-muted">
          Free Artist Scan — city, intent, and one ranked move.
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
