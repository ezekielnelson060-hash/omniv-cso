import { redirect } from "next/navigation";

/**
 * Legacy Fan Gate (/f/[slug]) — retired.
 * Discovery network uses /e/[type]/[slug] and /p/[slug].
 * No more fan_gate_view events from this route.
 */
export default async function LegacyFanGatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  redirect("/home");
}
