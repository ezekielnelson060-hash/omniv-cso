import Link from "next/link";
import {
  PUBLICATION_LABELS,
  publicationPath,
  entityPath,
  type Publication,
} from "@/lib/discovery/types";
import { getEntityById } from "@/lib/discovery/seed";
import { coverFor } from "@/lib/discovery/seed-covers";
import { PublicationActions } from "@/components/discovery/publication-actions";
import {
  VerifiedBadge,
  isAlwaysVerified,
} from "@/components/discovery/verified-badge";
import { cleanPublisherMeta } from "@/lib/discovery/publisher-meta";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";

type PubWithCover = Publication & {
  coverUrl?: string;
  publisherName?: string;
};

const TONE: Record<string, string> = {
  article: "from-sky-900/90 via-slate-950 to-black",
  music: "from-fuchsia-900/80 via-purple-950 to-black",
  video: "from-rose-900/80 via-red-950 to-black",
  research: "from-emerald-900/70 via-teal-950 to-black",
  product: "from-amber-900/60 via-orange-950 to-black",
  event: "from-violet-900/70 via-indigo-950 to-black",
  announcement: "from-zinc-800/50 via-zinc-950 to-black",
  opportunity: "from-yellow-900/40 via-yellow-950 to-black",
  file: "from-cyan-900/60 via-slate-950 to-black",
};

function CoverBg({
  pub,
  className,
}: {
  pub: PubWithCover;
  className?: string;
}) {
  const cover = TONE[pub.type] ?? "from-zinc-800 to-black";
  if (pub.coverUrl) {
    return (
      <div
        className={className}
        style={{
          backgroundImage: `url(${pub.coverUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }
  return <div className={`${className} bg-gradient-to-br ${cover}`} />;
}

function TypeLabel({ type }: { type: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
      {PUBLICATION_LABELS[type as keyof typeof PUBLICATION_LABELS] ?? type}
    </span>
  );
}

function PublisherLine({
  name,
  publisher,
  meta,
  light,
}: {
  name?: string;
  publisher?: ReturnType<typeof getEntityById>;
  meta?: string;
  light?: boolean;
}) {
  if (!name) return null;
  const href =
    (publisher ? entityPath(publisher) : undefined) ||
    resolvePublisherPath({
      type: publisher?.type,
      slug: publisher?.slug,
      name,
    });
  const nameClass = light
    ? "font-semibold text-white/90"
    : "font-semibold text-white";
  const metaClass = light ? "text-white/50" : "text-zinc-500";
  const displayMeta = cleanPublisherMeta(name, meta);
  const showVerified = isAlwaysVerified({
    verified: publisher?.verified,
    slug: publisher?.slug,
    name,
  });

  // Name, tick, and meta as siblings — never nest truncate on a flex parent
  return (
    <div className="flex min-w-0 items-center gap-1 text-[12px]">
      {href ? (
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className={`min-w-0 max-w-[45%] truncate leading-none ${nameClass} hover:text-omniv-gold`}
        >
          {name}
        </Link>
      ) : (
        <span className={`min-w-0 max-w-[45%] truncate leading-none ${nameClass}`}>
          {name}
        </span>
      )}
      {showVerified ? (
        <VerifiedBadge
          name={name}
          verifyType={publisher?.type || "company"}
          className="inline-flex shrink-0"
          size={13}
        />
      ) : null}
      {displayMeta ? (
        <>
          <span className={`shrink-0 leading-none ${light ? "text-white/40" : "text-zinc-600"}`}>
            ·
          </span>
          <span className={`min-w-0 truncate leading-none ${metaClass}`}>
            {displayMeta}
          </span>
        </>
      ) : null}
    </div>
  );
}

export function FeedFeaturedCard({
  pub,
  showExplore,
}: {
  pub: PubWithCover;
  showExplore?: boolean;
}) {
  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);

  return (
    <article className="overflow-hidden rounded-2xl bg-[#0c0c0c]">
      <Link
        href={publicationPath(pub)}
        className="group block transition-opacity duration-200 hover:opacity-[0.97]"
      >
        <div className="relative aspect-[5/4] sm:aspect-[16/10]">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 backdrop-blur-sm">
            <TypeLabel type={pub.type} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight text-white">
              {pub.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/70">
              {pub.summary}
            </p>
            <div className="mt-2">
              <PublisherLine
                name={name}
                publisher={publisher}
                meta={pub.meta}
                light
              />
            </div>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-2 pt-1">
        <PublicationActions
          slug={pub.slug}
          type={pub.type}
          title={pub.title}
          publishedAt={pub.publishedAt}
          initialLikes={0}
          compact
        />
      </div>
      {showExplore && (
        <div className="border-t border-white/[0.05] px-4 py-2 text-right">
          <Link href="/explore" className="text-[12px] font-medium text-omniv-gold">
            Explore
          </Link>
        </div>
      )}
    </article>
  );
}

export function FeedCompactRow({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);

  return (
    <article className="rounded-2xl bg-[#0c0c0c]">
      <Link
        href={publicationPath(pub)}
        className="group flex items-center gap-3 px-1 py-1"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
        </div>
        <div className="min-w-0 flex-1 py-2 pr-2">
          <p className="truncate text-[14px] font-semibold text-white">
            {pub.title}
          </p>
          <div className="mt-1">
            <PublisherLine name={name} publisher={publisher} meta={pub.meta} />
          </div>
        </div>
      </Link>
    </article>
  );
}

export function FeedCard({ pub }: { pub: PubWithCover }) {
  const publisher = getEntityById(pub.publisherId);
  const name = publisher?.name || pub.publisherName;
  const resolvedCover = pub.coverUrl || coverFor(pub.slug);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] transition-colors duration-200 hover:bg-[#101010]">
      <Link href={publicationPath(pub)} className="group flex flex-1 flex-col">
        <div className="relative aspect-[16/10]">
          <CoverBg
            pub={{ ...pub, coverUrl: resolvedCover }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute left-3 top-3">
            <TypeLabel type={pub.type} />
          </span>
        </div>
        <div className="flex flex-1 flex-col px-4 pt-3.5">
          <p className="text-[16px] font-semibold leading-snug tracking-tight text-white group-hover:text-omniv-gold">
            {pub.title}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
            {pub.summary}
          </p>
          <div className="mt-auto pt-3">
            <PublisherLine name={name} publisher={publisher} meta={pub.meta} />
          </div>
        </div>
      </Link>
      <div className="px-3 pb-2">
        <PublicationActions
          slug={pub.slug}
          type={pub.type}
          title={pub.title}
          publishedAt={pub.publishedAt}
          initialLikes={0}
          compact
        />
      </div>
    </div>
  );
}
