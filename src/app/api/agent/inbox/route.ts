import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ pending: 0, proposals: [] });
    }
    const { data } = await supabase
      .from("profiles")
      .select("agent_inbox, agent_scanned_at")
      .eq("id", user.id)
      .maybeSingle();

    const inbox = data?.agent_inbox as
      | {
          proposals?: { id: string; status?: string; createdAt?: number }[];
          narrative?: string;
          scannedAt?: number;
        }
      | null;

    const proposals = inbox?.proposals || [];
    const pending = proposals.filter(
      (p) => !p.status || p.status === "pending"
    ).length;

    return NextResponse.json({
      pending,
      proposals,
      narrative: inbox?.narrative || "",
      scannedAt: data?.agent_scanned_at || inbox?.scannedAt || null,
    });
  } catch {
    return NextResponse.json({ pending: 0, proposals: [] });
  }
}
