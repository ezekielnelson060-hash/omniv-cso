import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — independent artist growth & money",
  description:
    "Practical guides for independent artists: owned fans, city demand, ticketed rooms, sync, and cash paths beyond streaming.",
  alternates: { canonical: "https://omniv.media/blog" },
  openGraph: {
    title: "Omniv Blog",
    description:
      "How independents build demand maps, open rooms, and get paid without waiting on the algorithm.",
    url: "https://omniv.media/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
