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
  | { type: "callout"; title?: string; text: string };

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
      if (text.startsWith("## ")) return { type: "heading", text: text.slice(3), level: 2 } as const;
      if (text.startsWith("### ")) return { type: "heading", text: text.slice(4), level: 3 } as const;
      if (text.startsWith("> ")) return { type: "quote", text: text.slice(2) } as const;
      return { type: "paragraph", text } as const;
    });
}

export function ArticleContent({
  content,
  body,
}: {
  content?: ArticleContentBlock[] | null;
  body?: string;
}) {
  const blocks = content?.length ? content : fallbackBlocks(body);
  return (
    <div className="space-y-7">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <p key={index} className="text-[17px] leading-[1.85] text-zinc-300">{block.text}</p>;
          case "heading":
            return block.level === 3 ? (
              <h3 key={index} className="pt-5 text-[20px] font-semibold tracking-tight text-white">{block.text}</h3>
            ) : (
              <h2 key={index} className="pt-7 text-[26px] font-semibold tracking-tight text-white">{block.text}</h2>
            );
          case "subheading":
            return <p key={index} className="pt-2 text-[18px] font-medium leading-relaxed text-zinc-200">{block.text}</p>;
          case "image":
            return (
              <figure key={index} className="my-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.alt || ""} loading="lazy" className="w-full rounded-2xl object-cover ring-1 ring-white/[0.08]" />
                {block.caption && <figcaption className="mt-2 text-center text-[12px] leading-relaxed text-zinc-500">{block.caption}</figcaption>}
              </figure>
            );
          case "caption":
            return <p key={index} className="-mt-4 text-center text-[12px] italic text-zinc-500">{block.text}</p>;
          case "quote":
            return (
              <blockquote key={index} className="my-10 border-l-2 border-omniv-gold px-5 py-2 text-[25px] font-semibold leading-tight tracking-tight text-white sm:text-[30px]">
                “{block.text}”
                {block.attribution && <cite className="mt-3 block text-[12px] font-normal not-italic uppercase tracking-[0.14em] text-omniv-gold">{block.attribution}</cite>}
              </blockquote>
            );
          case "divider":
            return <hr key={index} className="my-10 border-white/10" />;
          case "entity-reference":
            return <Link key={index} href={`/e/${block.entityType || "company"}/${block.slug}`} className="font-medium text-zinc-100 underline decoration-omniv-gold/60 underline-offset-4 hover:text-omniv-gold">{block.label}</Link>;
          case "publication-reference":
            return <Link key={index} href={`/p/${block.slug}`} className="font-medium text-zinc-100 underline decoration-omniv-gold/60 underline-offset-4 hover:text-omniv-gold">{block.label}</Link>;
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return <List key={index} className={`${block.ordered ? "list-decimal" : "list-disc"} space-y-2 pl-6 text-[17px] leading-relaxed text-zinc-300`}>{block.items.map((item) => <li key={item}>{item}</li>)}</List>;
          }
          case "callout":
            return <aside key={index} className="rounded-2xl border border-omniv-gold/30 bg-omniv-gold/[0.07] p-5 text-zinc-200">{block.title && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">{block.title}</p>}<p className="mt-2 text-[16px] leading-relaxed">{block.text}</p></aside>;
        }
      })}
    </div>
  );
}

export function ArticleSources({ sources }: { sources?: ArticleSource[] | null }) {
  if (!sources?.length) return null;
  return (
    <section className="mt-14 border-t border-white/10 pt-7">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Sources</h2>
      <ul className="mt-4 space-y-3">
        {sources.map((source) => (
          <li key={`${source.url}-${source.title}`}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-4 text-[13px] text-zinc-300 hover:text-white">
              <span><span className="font-medium text-white group-hover:text-omniv-gold">{source.title}</span><span className="ml-2 text-zinc-500">{source.name}{source.date ? ` · ${source.date}` : ""}</span></span>
              <span className="shrink-0 text-zinc-600">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
