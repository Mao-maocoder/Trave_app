import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// GET /api/users/search?q=keyword
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, username, avatar")
      .ilike("username", `%${q}%`)
      .neq("id", authUser.id)
      .limit(20);

    return NextResponse.json({ users: users || [] });
  } catch {
    return NextResponse.json({ error: "搜索失败" }, { status: 500 });
  }
}
