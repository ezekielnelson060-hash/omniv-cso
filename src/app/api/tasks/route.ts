import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ tasks: [] });

    const { data, error } = await supabase
      .from("execution_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error(error);
      return NextResponse.json({ tasks: [], error: error.message });
    }
    return NextResponse.json({ tasks: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ tasks: [] });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      title?: string;
      source?: string;
      due_date?: string;
      artist_id?: string;
      items?: string[];
    };

    // Bulk checklist
    if (body.items?.length) {
      const rows = body.items.slice(0, 30).map((title) => ({
        user_id: user.id,
        title: title.slice(0, 200),
        source: body.source || "release",
        done: false,
        artist_id: body.artist_id || null,
      }));
      const { data, error } = await supabase
        .from("execution_tasks")
        .insert(rows)
        .select();
      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ tasks: data });
    }

    if (!body.title?.trim())
      return NextResponse.json({ error: "title required" }, { status: 400 });

    const { data, error } = await supabase
      .from("execution_tasks")
      .insert({
        user_id: user.id,
        title: body.title.trim().slice(0, 200),
        source: body.source || "manual",
        due_date: body.due_date || null,
        artist_id: body.artist_id || null,
      })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      id?: string;
      done?: boolean;
      title?: string;
    };
    if (!body.id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.done === "boolean") patch.done = body.done;
    if (body.title) patch.title = body.title.slice(0, 200);

    const { data, error } = await supabase
      .from("execution_tasks")
      .update(patch)
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabase
      .from("execution_tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
