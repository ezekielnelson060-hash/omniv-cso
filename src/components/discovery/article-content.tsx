import Link from "next/link";

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "subheading"; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "caption"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "divider" }
  | { type: "entity-reference"; slug: string; label: string; entityType?: string }
  | { type: "publication-reference"; slug: string; label: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; title?: string; text: string }
  | { type: string; [key: string]: unknown };

export type ArticleSource = {
  name: string;
  title: string;
  date?: string;
  url: string;
};

function fallbackBlocks(body?: string): ArticleContentBlock[] {
  if (!body) return [];
  return body
    .split(/\n\n+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => {
      if (text.startsWith("## "))
        return { type: "heading", text: text.slice(3), level: 2 } as const;
      if (text.startsWith("### "))
        return { type: "heading", text: text.slice(4), level: 3 } as const;
      if (text.startsWith("> "))
        return { type: "quote", text: text.slice(2) } as const;
      return { type: "paragraph", text } as const;
    });
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

export function ArticleContent({
  content,
  body,
}: {
  content?: ArticleContentBlock[] | null;
  body?: string;
}) {
  const raw = Array.isArray(content) && content.length ? content : fallbackBlocks(body);
  // Drop null/invalid entries from live JSON
  const blocks = raw.filter(
    (b): b is ArticleContentBlock => Boolean(b) && typeof b === "object" && typeof (b as { type?: unknown }).type === "string"
  );

  if (!blocks.length) return null;

  return (
    <div className="space-y-7">
      {blocks.map((block, index) => {
        try {
          switch (block.type) {
            case "paragraph":
              return (
                <p key={index} className="text-[17px] leading-[1.85] text-zinc-300">
                  {asText((block as { text?: unknown }).text)}
                </p>
              );
            case "heading": {
              const text = asText((block as { text?: unknown }).text);
              const level = (block as { level?: number }).level;
              return level === 3 ? (
                <h3
                  key={index}
                  className="pt-5 text-[20px] font-semibold tracking-tight text-white"
                >
                  {text}
                </h3>
              ) : (
                <h2
                  key={index}
                  className="pt-7 text-[26px] font-semibold tracking-tight text-white"
                >
                  {text}
                </h2>
              );
            }
            case "subheading":
              return (
                <p
                  key={index}
                  className="pt-2 text-[18px] font-medium leading-relaxed text-zinc-200"
                >
                  {asText((block as { text?: unknown }).text)}
                </p>
              );
            case "image": {
              const src = asText((block as { src?: unknown }).src);
              if (!src) return null;
              const alt = asText((block as { alt?: unknown }).alt);
              const caption = asText((block as { caption?: unknown }).caption);
              return (
                <figure key={index} className="my-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="w-full rounded-2xl object-cover"
                  />
                  {caption ? (
                    <figcaption className="mt-2 text-center text-[13px] text-zinc-500">
                      {caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            }
            case "caption":
              return (
                <p key={index} className="text-center text-[13px] text-zinc-500">
                  {asText((block as { text?: unknown }).text)}
                </p>
              );
            case "quote":
              return (
                <blockquote
                  key={index}
                  className="border-l-2 border-omniv-gold/50 pl-5 text-[19px] font-medium leading-relaxed text-white"
                >
                  “{asText((block as { text?: unknown }).text)}”
                  {(block as { attribution?: unknown }).attribution ? (
                    <cite className="mt-3 block text-[12px] font-normal not-italic uppercase tracking-[0.14em] text-omniv-gold">
                      {asText((block as { attribution?: unknown }).attribution)}
                    </cite>
                  ) : null}
                </blockquote>
              );
            case "divider":
              return <hr key={index} className="my-10 border-white/10" />;
            case "entity-reference": {
              const slug = asText((block as { slug?: unknown }).slug);
              const label = asText((block as { label?: unknown }).label) || slug;
              const entityType =
                asText((block as { entityType?: unknown }).entityType) ||
                "company";
              if (!slug) return null;
              return (
                <Link
                  key={index}
                  href={`/e/${entityType}/${slug}`}
                  className="font-medium text-zinc-100 underline decoration-omniv-gold/60 underline-offset-4 hover:text-omniv-gold"
                >
                  {label}
                </Link>
              );
            }
            case "publication-reference": {
              const slug = asText((block as { slug?: unknown }).slug);
              const label = asText((block as { label?: unknown }).label) || slug;
              if (!slug) return null;
              return (
                <Link
                  key={index}
                  href={`/p/${slug}`}
                  className="font-medium text-zinc-100 underline decoration-omniv-gold/60 underline-offset-4 hover:text-omniv-gold"
                >
                  {label}
                </Link>
              );
            }
            case "list": {
              const items = Array.isArray((block as { items?: unknown }).items)
                ? ((block as { items: unknown[] }).items
                    .map((item) => asText(item))
                    .filter(Boolean) as string[])
                : [];
              if (!items.length) return null;
              const ordered = Boolean((block as { ordered?: boolean }).ordered);
              const List = ordered ? "ol" : "ul";
              return (
                <List
                  key={index}
                  className={`${
                    ordered ? "list-decimal" : "list-disc"
                  } space-y-2 pl-6 text-[17px] leading-relaxed text-zinc-300`}
                >
                  {items.map((item, i) => (
                    <li key={`${i}-${item.slice(0, 24)}`}>{item}</li>
                  ))}
                </List>
              );
            }
            case "callout":
              return (
                <aside
                  key={index}
                  className="rounded-2xl border border-omniv-gold/30 bg-omniv-gold/[0.07] p-5 text-zinc-200"
                >
                  {(block as { title?: unknown }).title ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
                      {asText((block as { title?: unknown }).title)}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[16px] leading-relaxed">
                    {asText((block as { text?: unknown }).text)}
                  </p>
                </aside>
              );
            default:
              // Unknown block type from live JSON — render text if present
              if (typeof (block as { text?: unknown }).text === "string") {
                return (
                  <p
                    key={index}
                    className="text-[17px] leading-[1.85] text-zinc-300"
                  >
                    {asText((block as { text?: unknown }).text)}
                  </p>
                );
              }
              return null;
          }
        } catch {
          return null;
        }
      })}
    </div>
  );
}

export function ArticleSources({
  sources,
}: {
  sources?: ArticleSource[] | null;
}) {
  if (!sources?.length) return null;
  return (
    <section className="mt-14 border-t border-white/10 pt-7">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Sources
      </h2>
      <ul className="mt-4 space-y-3">
        {sources.map((source, i) => (
          <li key={`${source.url || i}-${source.title || i}`}>
            <a
              href={source.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 text-[13px] text-zinc-300 hover:text-white"
            >
              <span>
                <span className="font-medium text-white group-hover:text-omniv-gold">
                  {source.title}
                </span>
                <span className="ml-2 text-zinc-500">
                  {source.name}
                  {source.date ? ` · ${source.date}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-zinc-600">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
