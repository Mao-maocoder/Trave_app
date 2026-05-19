import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// PUT /api/user/profile — update username
export async function PUT(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { username } = await req.json();

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
    }
    if (username.trim().length > 20) {
      return NextResponse.json({ error: "昵称不能超过20个字符" }, { status: 400 });
    }

    const trimmed = username.trim();

    // Check uniqueness
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", trimmed)
      .neq("id", authUser.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "该昵称已被使用" }, { status: 409 });
    }

    await supabaseAdmin.from("users").update({ username: trimmed }).eq("id", authUser.id);
    await supabaseAdmin.from("photos").update({ username: trimmed }).eq("user_id", authUser.id);
    await supabaseAdmin.from("comments").update({ username: trimmed }).eq("user_id", authUser.id);
    await supabaseAdmin.from("posts").update({ username: trimmed }).eq("user_id", authUser.id);
    await supabaseAdmin.from("post_comments").update({ username: trimmed }).eq("user_id", authUser.id);

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, username, email, role, avatar")
      .eq("id", authUser.id)
      .single();

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
