import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata = {
  title: "Search Omniv",
  description: "Search Omniv publications, people, companies, projects, and ideas.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim();
  redirect(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
}
