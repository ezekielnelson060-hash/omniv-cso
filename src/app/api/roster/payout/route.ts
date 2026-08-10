import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = (await req.json()) as {
      rosterArtistId?: string;
      country?: string;
      bankName?: string;
      bankCode?: string;
      accountName?: string;
      accountNumber?: string;
      notes?: string;
    };

    const id = body.rosterArtistId?.trim();
    if (!id) {
      return NextResponse.json(
        { error: "rosterArtistId required" },
        { status: 400 }
      );
    }

    const entry = {
      country: body.country || null,
      bankName: body.bankName || null,
      bankCode: body.bankCode || null,
      accountName: body.accountName || null,
      accountNumber: body.accountNumber || null,
      notes: body.notes || null,
      updatedAt: new Date().toISOString(),
    };

    const { data: prof } = await supabase
      .from("profiles")
      .select("roster_payout_map")
      .eq("id", user.id)
      .maybeSingle();

    const map =
      (prof?.roster_payout_map as Record<string, unknown> | null) || {};
    map[id] = entry;

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        roster_payout_map: map,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json({
        ok: true,
        mirrored: false,
        hint: error.message,
      });
    }

    return NextResponse.json({ ok: true, mirrored: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true, mirrored: false });
  }
}
