import { redirect } from "next/navigation";

/** Legacy tip URL — retired with Fan Gate. */
export default async function LegacyTipPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  redirect("/home");
}
