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

function looksLikeHtml(s?: string): boolean {
  if (!s) return false;
  return /<(p|div|h[1-4]|blockquote|ul|ol|li|br|strong|em|b|i|span|a)\b/i.test(s);
}

export function ArticleContent({
  content,
  body,
}: {
  content?: ArticleContentBlock[] | null;
  body?: string;
}) {
  if ((!content || !content.length) && looksLikeHtml(body)) {
    return (
      <>
        <div
          className="omniv-article-html text-[17px] leading-[1.85] text-zinc-300"
          dangerouslySetInnerHTML={{ __html: body as string }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .omniv-article-html h1{font-size:1.5rem;font-weight:700;margin:1.25rem 0 .5rem;color:#fff}
            .omniv-article-html h2{font-size:1.25rem;font-weight:600;margin:1.1rem 0 .4rem;color:#fff}
            .omniv-article-html h3{font-size:1.05rem;font-weight:600;margin:.9rem 0 .35rem;color:#f4f4f5}
            .omniv-article-html p{margin:.55rem 0}
            .omniv-article-html ul{list-style:disc;padding-left:1.25rem;margin:.5rem 0}
            .omniv-article-html ol{list-style:decimal;padding-left:1.25rem;margin:.5rem 0}
            .omniv-article-html blockquote{
              margin:1rem 0;padding:.4rem 0 .4rem 1rem;
              border-left:3px solid rgba(201,162,39,.7);
              color:#d4d4d8;font-style:italic;
            }
            .omniv-article-html a{color:#c9a227;text-decoration:underline}
            .omniv-article-html img{max-width:100%;border-radius:.75rem;margin:.75rem 0}
            .omniv-article-html b,.omniv-article-html strong{font-weight:700;color:#fff}
            .omniv-article-html pre{display:block;padding:.75rem 1rem;overflow-x:auto;margin:.6rem 0;
              background:rgba(255,255,255,.06);border-radius:.5rem;font-family:ui-monospace,monospace;font-size:.9em}
          `,
          }}
        />
      </>
    );
  }

  const raw = Array.isArray(content) && content.length ? content : fallbackBlocks(body);
  const blocks = raw.filter(
    (b): b is ArticleContentBlock =>
      Boolean(b) &&
      typeof b === "object" &&
      typeof (b as { type?: unknown }).type === "string"
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
            case "quote":
              return (
                <blockquote
                  key={index}
                  className="border-l-2 border-omniv-gold/50 pl-4 text-[17px] italic leading-relaxed text-zinc-300"
                >
                  {asText((block as { text?: unknown }).text)}
                  {(block as { attribution?: string }).attribution ? (
                    <footer className="mt-2 text-[13px] not-italic text-zinc-500">
                      — {asText((block as { attribution?: unknown }).attribution)}
                    </footer>
                  ) : null}
                </blockquote>
              );
            case "list": {
              const items = Array.isArray((block as { items?: unknown }).items)
                ? ((block as { items: unknown[] }).items as unknown[])
                : [];
              const ordered = Boolean((block as { ordered?: boolean }).ordered);
              const ListTag = ordered ? "ol" : "ul";
              return (
                <ListTag
                  key={index}
                  className={`space-y-2 pl-5 text-[17px] leading-[1.85] text-zinc-300 ${
                    ordered ? "list-decimal" : "list-disc"
                  }`}
                >
                  {items.map((item, i) => (
                    <li key={i}>{asText(item)}</li>
                  ))}
                </ListTag>
              );
            }
            case "image":
              return (
                <figure key={index} className="my-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asText((block as { src?: unknown }).src)}
                    alt={asText((block as { alt?: unknown }).alt)}
                    className="w-full rounded-2xl"
                  />
                  {(block as { caption?: string }).caption ? (
                    <figcaption className="mt-2 text-center text-[13px] text-zinc-500">
                      {asText((block as { caption?: unknown }).caption)}
                    </figcaption>
                  ) : null}
                </figure>
              );
            case "divider":
              return <hr key={index} className="my-8 border-white/10" />;
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
              if (typeof (block as { text?: unknown }).text === "string") {
                return (
                  <p key={index} className="text-[17px] leading-[1.85] text-zinc-300">
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
